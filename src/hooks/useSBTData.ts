'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useAccount, usePublicClient } from 'wagmi';
import { parseAbiItem } from 'viem';

import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
import { CONTRACT_ADDRESSES } from '@/config/contracts/contractConfig';
import { FREELANCER_SBT_ABI } from '@/config/contracts/abis';

export interface SBTItem {
  _id: string;
  tokenId?: string;
  type: 'experience' | 'education' | 'project';
  title: string;
  description?: string;
  date?: string;
  company?: string;
  jobTitle?: string;
  school?: string;
  degree?: string;
  projectName?: string;
  transactionHash?: string;
  blockNumber?: number;
  status: 'Minted' | 'Pending';
  createdAt?: string;
}

interface UseSBTDataReturn {
  sbtItems: SBTItem[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => Promise<void>;
}

export const useSBTData = (): UseSBTDataReturn => {
  const user = useSelector((state: RootState) => state.user);
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [sbtItems, setSBTItems] = useState<SBTItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractTransactionHash = (record: any): string | undefined => {
    const possibleHash =
      record?.transactionHash ||
      record?.txHash ||
      record?.mintTxHash ||
      record?.hash ||
      record?.receipt?.transactionHash;

    return typeof possibleHash === 'string' && possibleHash.trim()
      ? possibleHash.trim()
      : undefined;
  };

  const extractTokenId = (record: any): string | undefined => {
    const possibleTokenId = record?.tokenId ?? record?.sbtTokenId;

    if (typeof possibleTokenId === 'bigint') return possibleTokenId.toString();
    if (typeof possibleTokenId === 'number') return possibleTokenId.toString();
    if (typeof possibleTokenId === 'string' && possibleTokenId.trim()) {
      return possibleTokenId.trim();
    }
    return undefined;
  };

  const hydrateMissingHashesFromChain = useCallback(
    async (
      items: SBTItem[],
      sbtContractAddress: `0x${string}`,
    ): Promise<SBTItem[]> => {
      if (!address || !publicClient || items.length === 0) return items;

      const hasMissingHashes = items.some((item) => !item.transactionHash);
      if (!hasMissingHashes) return items;

      try {
        const transferEvent = parseAbiItem(
          'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
        );

        // Get current block number and query only recent blocks (last 5000 blocks)
        // This avoids "eth_getLogs limited to 10,000 range" RPC error
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock - 5000n > 0n ? currentBlock - 5000n : 0n;

        console.log(
          'Fetching logs from block',
          fromBlock.toString(),
          'to',
          currentBlock.toString(),
        );

        const mintLogs = await publicClient.getLogs({
          address: sbtContractAddress,
          event: transferEvent,
          args: {
            from: '0x0000000000000000000000000000000000000000',
            to: address,
          },
          fromBlock: fromBlock,
          toBlock: currentBlock,
        });

        console.log('Found', mintLogs.length, 'Transfer events');

        const mintEvents = mintLogs
          .map((log) => ({
            txHash: log.transactionHash,
            tokenId:
              typeof log.args?.tokenId === 'bigint'
                ? log.args.tokenId.toString()
                : undefined,
            blockNumber:
              typeof log.blockNumber === 'bigint'
                ? Number(log.blockNumber)
                : undefined,
          }))
          .filter((event) => event.txHash);

        if (!mintEvents.length) {
          console.warn('No mint events found for user');
          return items;
        }

        const usedTx = new Set(
          items
            .map((item) => item.transactionHash)
            .filter((hash): hash is string => Boolean(hash)),
        );
        const usedTokenIds = new Set(
          items
            .map((item) => item.tokenId)
            .filter((tokenId): tokenId is string => Boolean(tokenId)),
        );

        const hydratedItems = items.map((item) => {
          if (item.transactionHash) return item;

          let matchedEvent = item.tokenId
            ? mintEvents.find(
                (event) =>
                  event.tokenId === item.tokenId && !usedTx.has(event.txHash),
              )
            : undefined;

          if (!matchedEvent) {
            matchedEvent = mintEvents.find(
              (event) =>
                !usedTx.has(event.txHash) &&
                (!event.tokenId || !usedTokenIds.has(event.tokenId)),
            );
          }

          if (!matchedEvent) {
            console.warn('Could not find matching event for item', item._id);
            return item;
          }

          console.log(
            'Matched event for item',
            item._id,
            ':',
            matchedEvent.txHash,
          );

          usedTx.add(matchedEvent.txHash);
          if (matchedEvent.tokenId) usedTokenIds.add(matchedEvent.tokenId);

          return {
            ...item,
            tokenId: item.tokenId || matchedEvent.tokenId,
            transactionHash: matchedEvent.txHash,
            blockNumber: item.blockNumber ?? matchedEvent.blockNumber,
            status: 'Minted' as const,
          } as SBTItem;
        });

        return hydratedItems;
      } catch (err) {
        console.warn(
          'Could not hydrate transaction hashes from chain logs:',
          err,
        );
        // Fallback: try to get transaction hash from backend
        console.warn(
          'Falling back to check localStorage for transaction hashes',
        );
        return items;
      }
    },
    [address, publicClient],
  );

  const fetchSBTData = useCallback(async () => {
    if (!user?.uid) {
      setError('User not found');
      return;
    }

    if (!address || !publicClient) {
      setError('Wallet not connected. Please connect your wallet.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get backend data first
      const response = await axiosInstance.get(`/freelancer/${user.uid}`);
      const data = response.data?.data || {};

      const items: SBTItem[] = [];
      const sbtContractAddress =
        CONTRACT_ADDRESSES.SBT_CONTRACT as `0x${string}`;

      // Get token balance to check if user has SBTs
      try {
        const balanceOf = await publicClient.readContract({
          address: sbtContractAddress,
          abi: FREELANCER_SBT_ABI,
          functionName: 'balanceOf',
          args: [address],
        });

        const balance = Number(balanceOf);
        console.log('User SBT balance:', balance);

        // If user has SBTs, fetch transaction details from blockchain
        if (balance > 0) {
          // Try to get transaction receipt for minting
          try {
            // Get the freelancer's token IDs
            const tokenIds = (await publicClient.readContract({
              address: sbtContractAddress,
              abi: FREELANCER_SBT_ABI,
              functionName: 'getTokenIdsByFreelancer',
              args: [address],
            })) as bigint[];

            if (tokenIds && tokenIds.length > 0) {
              console.log(
                'Fetched tokenIds:',
                tokenIds.map((id) => id.toString()),
              );
            }
          } catch (err) {
            console.warn('Could not fetch token ID from contract:', err);
          }
        }
      } catch (err) {
        console.warn('Could not check balance:', err);
      }

      // Process experiences with blockchain data
      if (data.professionalInfo && typeof data.professionalInfo === 'object') {
        const experienceArray = Array.isArray(data.professionalInfo)
          ? data.professionalInfo
          : Object.values(data.professionalInfo);

        experienceArray.forEach((exp: any) => {
          const transactionHash = extractTransactionHash(exp);
          const tokenId = extractTokenId(exp);
          const isMinted = Boolean(
            transactionHash || tokenId || exp.blockNumber,
          );
          items.push({
            _id: exp._id || `exp_${Date.now()}_${Math.random()}`,
            tokenId,
            type: 'experience',
            title: exp.jobTitle || 'Experience',
            description: exp.workDescription || `${exp.company || 'Company'}`,
            company: exp.company,
            jobTitle: exp.jobTitle,
            date: exp.workFrom
              ? new Date(exp.workFrom).toLocaleDateString()
              : '',
            transactionHash,
            blockNumber: exp.blockNumber,
            status: isMinted ? 'Minted' : 'Pending',
            createdAt: exp.createdAt,
          });
        });
      }

      // Process education with blockchain data
      if (data.education && typeof data.education === 'object') {
        const educationArray = Array.isArray(data.education)
          ? data.education
          : Object.values(data.education);

        educationArray.forEach((edu: any) => {
          const transactionHash = extractTransactionHash(edu);
          const tokenId = extractTokenId(edu);
          const isMinted = Boolean(
            transactionHash || tokenId || edu.blockNumber,
          );
          items.push({
            _id: edu._id || `edu_${Date.now()}_${Math.random()}`,
            tokenId,
            type: 'education',
            title: edu.degree || 'Education',
            description: edu.universityName || `${edu.fieldOfStudy || 'Field'}`,
            school: edu.universityName,
            degree: edu.degree,
            date: edu.startDate
              ? new Date(edu.startDate).toLocaleDateString()
              : '',
            transactionHash,
            blockNumber: edu.blockNumber,
            status: isMinted ? 'Minted' : 'Pending',
            createdAt: edu.createdAt,
          });
        });
      }

      // Process projects with blockchain data
      if (data.projects && typeof data.projects === 'object') {
        const projectsArray = Array.isArray(data.projects)
          ? data.projects
          : Object.values(data.projects);

        projectsArray.forEach((proj: any) => {
          const transactionHash = extractTransactionHash(proj);
          const tokenId = extractTokenId(proj);
          const isMinted = Boolean(
            transactionHash || tokenId || proj.blockNumber,
          );
          items.push({
            _id: proj._id || `proj_${Date.now()}_${Math.random()}`,
            tokenId,
            type: 'project',
            title: proj.projectName || 'Project',
            description:
              proj.projectDescription || proj.projectName || 'Project',
            projectName: proj.projectName,
            date: proj.startDate
              ? new Date(proj.startDate).toLocaleDateString()
              : '',
            transactionHash,
            blockNumber: proj.blockNumber,
            status: isMinted ? 'Minted' : 'Pending',
            createdAt: proj.createdAt,
          });
        });
      }

      const hydratedItems = await hydrateMissingHashesFromChain(
        items,
        sbtContractAddress,
      );

      console.log(
        'Backend items _ids:',
        items.map((i) => ({ _id: i._id, type: i.type })),
      );

      // Merge with localStorage cache for transaction hashes
      let sbtCache: Record<string, any> = {};
      try {
        const cached = localStorage.getItem('sbtTransactionHashes');
        sbtCache = cached ? JSON.parse(cached) : {};
        console.log('Loaded from localStorage:', sbtCache);
        console.log('localStorage keys:', Object.keys(sbtCache));
      } catch (e) {
        console.warn(
          'Could not read sbtTransactionHashes from localStorage:',
          e,
        );
      }

      const finalItems = hydratedItems.map((item) => {
        // First try exact match
        let cached = sbtCache[item._id];

        // If no exact match and item doesn't have transactionHash, try to find any matching entry
        // This handles cases where the ID format might be different
        if (!cached && !item.transactionHash) {
          const cacheKeys = Object.keys(sbtCache);
          console.log(
            `No exact match for item ${item._id}. Searching in ${cacheKeys.length} cache entries`,
          );

          // Try fuzzy matching - look for entries that might match this item
          for (const cacheKey of cacheKeys) {
            const cacheEntry = sbtCache[cacheKey];
            // If we have pending items with the same type, try to match them
            if (
              item.status === 'Pending' &&
              cacheEntry.transactionHash &&
              !sbtCache._matched?.[cacheKey]
            ) {
              console.log(
                `Fuzzy match attempt: ${item._id} with cache key ${cacheKey}`,
              );
              cached = cacheEntry;
              sbtCache._matched = sbtCache._matched || {};
              sbtCache._matched[cacheKey] = item._id;
              break;
            }
          }
        }

        if (cached && cached.transactionHash && !item.transactionHash) {
          console.log(
            `Merging localStorage data for item ${item._id}:`,
            cached.transactionHash,
          );
          return {
            ...item,
            transactionHash: cached.transactionHash,
            tokenId: item.tokenId || cached.tokenId,
            status: 'Minted' as const,
          };
        }
        return item;
      });

      console.log('Final items to display:', finalItems);
      setSBTItems(finalItems);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch SBT data';
      console.error('Error fetching SBT data:', err);

      // Try to at least load from localStorage even if backend call fails
      try {
        let sbtCache: Record<string, any> = {};
        const cached = localStorage.getItem('sbtTransactionHashes');
        sbtCache = cached ? JSON.parse(cached) : {};

        if (Object.keys(sbtCache).length > 0) {
          console.log('Showing data from localStorage fallback:', sbtCache);
          const fallbackItems: SBTItem[] = Object.entries(sbtCache).map(
            ([id, cached]: [string, any]) => ({
              _id: id,
              tokenId: cached.tokenId,
              type: 'project' as const,
              title: 'Minted SBT',
              description: 'Soulbound Token',
              transactionHash: cached.transactionHash,
              status: 'Minted' as const,
              createdAt: cached.timestamp,
            }),
          );
          setSBTItems(fallbackItems);
          setError(null);
          return;
        }
      } catch (fallbackErr) {
        console.error('Fallback to localStorage also failed:', fallbackErr);
      }

      setError(errorMessage);
      setSBTItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, address, publicClient, hydrateMissingHashesFromChain]);

  useEffect(() => {
    fetchSBTData();
  }, [fetchSBTData]);

  return {
    sbtItems,
    isLoading,
    error,
    totalCount: sbtItems.length,
    refetch: fetchSBTData,
  };
};
