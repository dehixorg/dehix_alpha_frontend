'use client';

import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWriteContract,
} from 'wagmi';
import { useSelector } from 'react-redux';
import { keccak256, toBytes, type TransactionReceipt } from 'viem';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { axiosInstance } from '@/lib/axiosinstance';
import { auth } from '@/config/firebaseConfig';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { NDA_SBT_ABI, NDA_SBT_POLYGON_AMOY } from '@/config/contracts/abis';
import { RootState } from '@/lib/store';
import { useAuth } from '@/app/AuthContext';

interface NDADialogProps {
  projectId: string;
  projectName: string;
}

interface NDARecord {
  ndaId: string;
  ipfsHash?: string;
  content: string;
  businessOwnerId: string;
  businessOwnerAddress: string;
  freelancerId: string;
  freelancerAddress: string;
  businessSignature: string;
  freelancerSignature: string;
  durationDays: number;
  expirationDate: string;
  status: string;
  sbtTokenId: string | null;
  sbtTransactionHash: string | null;
  sbtContractAddress: string | null;
}

type Step = 'form' | 'signing' | 'done';

const POLYGON_AMOY_CHAIN_ID = 80002;
const GAS_BUFFER_BPS = 12000n;
const NDA_MAX_GAS = 1_200_000n;
const POLYGON_AMOY_MIN_PRIORITY = 25_000_000_000n;
const POLYGON_AMOY_MAX_FEE_PER_GAS = 150_000_000_000n;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const TRANSFER_EVENT_TOPIC = keccak256(toBytes('Transfer(address,address,uint256)'));
const NDA_CREATED_EVENT_TOPIC = keccak256(
  toBytes('NDACreated(uint256,address,bytes32,string)'),
);

const withGasBuffer = (estimatedGas: bigint) => {
  const bufferedGas = (estimatedGas * GAS_BUFFER_BPS) / 10000n;
  return bufferedGas > NDA_MAX_GAS ? NDA_MAX_GAS : bufferedGas;
};

const getSafeGasPriceParams = async (
  publicClient: NonNullable<ReturnType<typeof usePublicClient>>,
) => {
  try {
    const feeData = await publicClient.estimateFeesPerGas();
    const priority = feeData.maxPriorityFeePerGas || POLYGON_AMOY_MIN_PRIORITY;
    const safePriority =
      priority < POLYGON_AMOY_MIN_PRIORITY
        ? POLYGON_AMOY_MIN_PRIORITY
        : priority;
    const boundedPriority =
      safePriority > POLYGON_AMOY_MAX_FEE_PER_GAS
        ? POLYGON_AMOY_MAX_FEE_PER_GAS
        : safePriority;
    const baseFee =
      feeData.maxFeePerGas ||
      (feeData.gasPrice ? feeData.gasPrice * 2n : boundedPriority * 2n);
    const minMaxFee = boundedPriority * 2n;
    const safeMaxFee = baseFee > minMaxFee ? baseFee : minMaxFee;
    const boundedMaxFee =
      safeMaxFee > POLYGON_AMOY_MAX_FEE_PER_GAS
        ? POLYGON_AMOY_MAX_FEE_PER_GAS
        : safeMaxFee;

    return {
      maxFeePerGas: boundedMaxFee,
      maxPriorityFeePerGas: boundedPriority,
    };
  } catch (error) {
    console.warn(
      'Could not estimate NDA gas price, using fallback values:',
      error,
    );

    return {
      maxFeePerGas: 100_000_000_000n,
      maxPriorityFeePerGas: POLYGON_AMOY_MIN_PRIORITY,
    };
  }
};

export default function NDADialog({ projectId, projectName }: NDADialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);

  // Form state (business creates)
  const [durationDays, setDurationDays] = useState(30);
  const [content, setContent] = useState(
    `NON-DISCLOSURE AGREEMENT\n\nThis Non-Disclosure Agreement ("Agreement") is entered into for the project "${projectName}".\n\nBoth parties agree to keep all project-related information, including but not limited to technical details, business strategies, client data, and proprietary methods, strictly confidential.\n\nNeither party shall disclose, share, or use any confidential information for purposes outside the scope of this project without prior written consent from the other party.\n\nViolation of this agreement may result in penalties as defined by the platform's terms of service.`,
  );
  const [freelancerWalletAddress, setFreelancerWalletAddress] = useState("");

  // Freelancer: existing NDAs to sign
  const [pendingNDAs, setPendingNDAs] = useState<NDARecord[]>([]);
  const [selectedNDA, setSelectedNDA] = useState<NDARecord | null>(null);
  const [loadingNDAs, setLoadingNDAs] = useState(false);

  // Blockchain result
  const [sbtTokenId, setSbtTokenId] = useState<string>('');
  const [sbtTxHash, setSbtTxHash] = useState<string>('');
  const [backendNdaId, setBackendNdaId] = useState<string>('');

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const user = useSelector((state: RootState) => state.user);
  const { user: authUser } = useAuth();
  const isBusiness = user?.type === 'business';
  const hasWalletConnection = Boolean(address || isConnected);
  const isWalletAuthenticated = Boolean(authUser);
  const isOnPolygonAmoy = chainId === POLYGON_AMOY_CHAIN_ID;
  const businessActionBlockedReason = !hasWalletConnection
    ? 'Connect MetaMask first.'
    : !isWalletAuthenticated
      ? 'Authenticate with Wallet first.'
      : !isOnPolygonAmoy
        ? 'Switch MetaMask to Polygon Amoy.'
        : null;
  const freelancerActionBlockedReason = !hasWalletConnection
    ? 'Connect MetaMask first.'
    : !isWalletAuthenticated
      ? 'Authenticate with Wallet first.'
      : !isOnPolygonAmoy
        ? 'Switch MetaMask to Polygon Amoy.'
        : !selectedNDA
          ? 'Select an NDA to sign.'
          : null;

  const ensureWalletReady = () => {
    if (!publicClient) {
      throw new Error('Wallet RPC is not ready. Please reconnect your wallet.');
    }

    if (chainId !== POLYGON_AMOY_CHAIN_ID) {
      throw new Error('Please switch your wallet network to Polygon Amoy.');
    }
  };

  const extractMintedTokenIdFromReceipt = (
    receipt: TransactionReceipt,
    expectedRecipient?: `0x${string}`,
  ) => {
    const contractLogs = receipt.logs.filter(
      (log) =>
        log.address.toLowerCase() === NDA_SBT_POLYGON_AMOY.toLowerCase(),
    );

    const ndaCreatedLog = contractLogs.find(
      (log) => log.topics[0]?.toLowerCase() === NDA_CREATED_EVENT_TOPIC.toLowerCase(),
    );
    if (ndaCreatedLog?.topics[1]) {
      return BigInt(ndaCreatedLog.topics[1]).toString();
    }

    const matchedTransfer = contractLogs.find((log) => {
      if (log.topics[0]?.toLowerCase() !== TRANSFER_EVENT_TOPIC.toLowerCase()) {
        return false;
      }

      const from = log.topics[1]
        ? `0x${log.topics[1].slice(-40)}`.toLowerCase()
        : '';
      const to = log.topics[2]
        ? `0x${log.topics[2].slice(-40)}`.toLowerCase()
        : '';

      if (from !== ZERO_ADDRESS.toLowerCase()) {
        return false;
      }

      if (!expectedRecipient) {
        return true;
      }

      return to === expectedRecipient.toLowerCase();
    });

    return matchedTransfer?.topics[3]
      ? BigInt(matchedTransfer.topics[3]).toString()
      : '';
  };

  const validateExistingTokenId = async (tokenId: string) => {
    if (!tokenId) {
      return '';
    }

    try {
      await publicClient!.readContract({
        address: NDA_SBT_POLYGON_AMOY as `0x${string}`,
        abi: NDA_SBT_ABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      });

      return tokenId;
    } catch (error) {
      console.warn('Recovered NDA token ID is not active on-chain:', {
        tokenId,
        error,
      });
      return '';
    }
  };

  const resolveExistingTokenId = async (nda: NDARecord) => {
    const candidate = nda.sbtTokenId?.trim();

    if (candidate) {
      const validCandidate = await validateExistingTokenId(candidate);
      if (validCandidate) {
        return validCandidate;
      } else {
        console.warn('Stored NDA token ID is invalid, attempting recovery:', {
          ndaId: nda.ndaId,
          candidate,
        });
      }
    }

    if (!nda.sbtTransactionHash) {
      return '';
    }

    try {
      const receipt = await publicClient!.getTransactionReceipt({
        hash: nda.sbtTransactionHash as `0x${string}`,
      });

      const recoveredTokenId = extractMintedTokenIdFromReceipt(
        receipt,
        nda.freelancerAddress as `0x${string}`,
      );
      return validateExistingTokenId(recoveredTokenId);
    } catch (error) {
      console.warn('Could not recover NDA token ID from transaction hash:', {
        ndaId: nda.ndaId,
        txHash: nda.sbtTransactionHash,
        error,
      });
      return '';
    }
  };

  const buildNdaIpfsHash = async (contentHash: `0x${string}`) => {
    const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT?.trim();
    const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY?.trim();
    const pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET?.trim();

    if (!pinataJwt && (!pinataApiKey || !pinataApiSecret)) {
      // Keep on-chain write unblocked even when Pinata is not configured.
      return `ipfs://nda-${contentHash.slice(2)}`;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (pinataJwt) {
        headers.Authorization = `Bearer ${pinataJwt}`;
      } else {
        headers.pinata_api_key = pinataApiKey!;
        headers.pinata_secret_api_key = pinataApiSecret!;
      }

      const response = await fetch(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            pinataMetadata: {
              name: `nda-${projectId}-${Date.now()}`,
            },
            pinataContent: {
              projectId,
              projectName,
              content,
              contentHash,
              createdAt: new Date().toISOString(),
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Pinata upload failed with status ${response.status}`);
      }

      const payload = await response.json();
      const ipfsCid = payload?.IpfsHash;

      if (!ipfsCid || typeof ipfsCid !== 'string') {
        throw new Error('Pinata upload response did not include IpfsHash');
      }

      return `ipfs://${ipfsCid}`;
    } catch (error) {
      console.warn('Pinata upload failed for NDA content, using fallback hash:', error);
      return `ipfs://nda-${contentHash.slice(2)}`;
    }
  };

const buildNdaWriteConfig = async (
  functionName: 'createNDA' | 'signNDAByBusiness' | 'signNDAByFreelancer',
  args: readonly unknown[],
) => {
  ensureWalletReady();

  const baseRequest = {
    account: address,
    address: NDA_SBT_POLYGON_AMOY as `0x${string}`,
    abi: NDA_SBT_ABI,
    functionName,
    args,
  } as const;

  await publicClient!.simulateContract(baseRequest);

  const estimatedGas = await publicClient!.estimateContractGas(baseRequest);
  const gasPrices = await getSafeGasPriceParams(publicClient!);

  return {
    address: NDA_SBT_POLYGON_AMOY as `0x${string}`,
    abi: NDA_SBT_ABI,
    functionName,
    args,
    gas: withGasBuffer(estimatedGas),
    maxFeePerGas: gasPrices.maxFeePerGas,
    maxPriorityFeePerGas: gasPrices.maxPriorityFeePerGas,
  };
};

const resetForm = () => {
  setStep('form');
  setDurationDays(30);
  setSbtTokenId('');
  setSbtTxHash('');
  setBackendNdaId('');
  setSelectedNDA(null);
};

const handleClose = () => {
  setOpen(false);
  resetForm();
};

// Fetch pending NDAs for freelancer when dialog opens
useEffect(() => {
  if (!open || isBusiness || !address) return;

  const fetchPendingNDAs = async () => {
    setLoadingNDAs(true);
    try {
      const response = await axiosInstance.get('/nda/my-ndas', {
        params: { walletAddress: address },
      });
      const allNdas: NDARecord[] = response?.data?.data || [];
      const pending = await Promise.all(
        allNdas
          .filter((nda) => nda.status === 'signed_by_business')
          .map(async (nda) => {
            const resolvedTokenId = await resolveExistingTokenId(nda);
            return resolvedTokenId
              ? { ...nda, sbtTokenId: resolvedTokenId }
              : null;
          }),
      );

      // Only show NDAs that are truly signable on-chain.
      const validPending = pending.filter(
        (
          nda,
        ): nda is NDARecord & {
          sbtTokenId: string;
        } => nda !== null,
      );
      setPendingNDAs(validPending);
    } catch (error) {
      console.error('Error fetching NDAs:', error);
    } finally {
      setLoadingNDAs(false);
    }
  };

  fetchPendingNDAs();
}, [open, isBusiness, address, publicClient]);

// ── Business: Create + Sign NDA ──
const handleBusinessCreateAndSign = async () => {
  if (!address) {
    notifyError('Please connect your wallet first.', 'Wallet Required');
    return;
  }
  if (!content.trim()) {
    notifyError('NDA content cannot be empty.', 'Missing Content');
    return;
  }
  if (durationDays < 1) {
    notifyError('Duration must be at least 1 day.', 'Invalid Duration');
    return;
  }

  setLoading(true);
  setStep('signing');

  // Get Firebase token for authentication
  let token = '';
  try {
    token = (await auth.currentUser?.getIdToken()) ?? '';
  } catch (err) {
    notifyError('Authentication error: Unable to get user token.', 'Auth Error');
    setStep('form');
    setLoading(false);
    return;
  }
  if (!token) {
    notifyError('You must be logged in to create the NDA.', 'Auth Error');
    setStep('form');
    setLoading(false);
    return;
  }

  try {
    ensureWalletReady();

    // Use a placeholder freelancer address — the actual freelancer will be assigned when they sign
    if (!freelancerWalletAddress || !/^0x[a-fA-F0-9]{40}$/.test(freelancerWalletAddress)) {
      notifyError('Please enter a valid freelancer wallet address.', 'Invalid Wallet Address');
      return;
    }

    // Hash the content for on-chain storage (full text stored in backend)
    const contentHash = keccak256(toBytes(content));

    const ipfsHash = await buildNdaIpfsHash(contentHash as `0x${string}`);

    // Step 1: Create NDA on-chain (store contentHash + ipfsHash)
    const createConfig = await buildNdaWriteConfig('createNDA', [
      contentHash,
      ipfsHash,
      freelancerWalletAddress as `0x${string}`,
      BigInt(durationDays),
    ]);
    const createHash = await writeContractAsync(createConfig);

    const createReceipt = await publicClient!.waitForTransactionReceipt({
      hash: createHash,
    });

    const tokenId = extractMintedTokenIdFromReceipt(
      createReceipt,
      freelancerWalletAddress as `0x${string}`,
    );

    if (!tokenId) {
      notifyError('Could not extract token ID from transaction.', 'Error');
      setStep('form');
      setLoading(false);
      return;
    }

    // Step 2: Sign NDA on-chain as business owner
    const signature = `business_signed_${address}_${Date.now()}`;
    const signatureHash = keccak256(toBytes(signature));
    const signConfig = await buildNdaWriteConfig('signNDAByBusiness', [
      BigInt(tokenId),
      signatureHash,
    ]);
    const signHash = await writeContractAsync(signConfig);

    await publicClient!.waitForTransactionReceipt({ hash: signHash });

    // Step 3: Save to backend (with auth)
    const createResponse = await axiosInstance.post(
      '/nda/create',
      {
        content,
        freelancerAddress: freelancerWalletAddress,
        durationDays,
        businessOwnerAddress: address,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const ndaId = createResponse?.data?.data?.ndaId;
    if (ndaId) {
      setBackendNdaId(ndaId);
      await axiosInstance.post(
        '/nda/sign-business',
        {
          ndaId,
          signature,
          sbtTokenId: tokenId,
          sbtTransactionHash: createHash,
          sbtContractAddress: NDA_SBT_POLYGON_AMOY,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    setSbtTokenId(tokenId);
    setSbtTxHash(createHash);
    setStep('done');
    notifySuccess('NDA created and signed on-chain!', 'NDA Created');
    window.dispatchEvent(new Event('ndaDataUpdated'));
  } catch (error: any) {
    console.error('NDA creation error:', error);
    const msg =
      error?.shortMessage || error?.message || 'Failed to create NDA';
    notifyError(msg, 'Transaction Failed');
    setStep('form');
  } finally {
    setLoading(false);
  }
};

// ── Freelancer: Sign existing NDA ──
const handleFreelancerSign = async () => {
  if (!address) {
    notifyError('Please connect your wallet first.', 'Wallet Required');
    return;
  }
  if (!selectedNDA) {
    notifyError('Please select an NDA to sign.', 'No NDA Selected');
    return;
  }
  // Log NDA for debugging
  console.log('Selected NDA:', selectedNDA);
  if (!selectedNDA.sbtTokenId || !selectedNDA.ndaId) {
    notifyError('NDA is missing required blockchain data. Please ask the business to sign the NDA on-chain first.', 'NDA Data Error');
    return;
  }
  if (!selectedNDA.content) {
    notifyError('NDA content is missing. Cannot sign.', 'NDA Data Error');
    return;
  }

  setLoading(true);
  setStep('signing');

  try {
    ensureWalletReady();
    const currentTokenId = await resolveExistingTokenId(selectedNDA);

    if (!currentTokenId) {
      notifyError(
        'This NDA does not have a valid on-chain token yet. Please ask the business to recreate/sign it again.',
        'NDA Data Error',
      );
      setStep('form');
      return;
    }

    let token = '';
    try {
      token = (await auth.currentUser?.getIdToken()) ?? '';
    } catch (err) {
      notifyError('Authentication error: Unable to get user token.', 'Auth Error');
      setStep('form');
      return;
    }
    if (!token) {
      notifyError('You must be logged in to sign the NDA.', 'Auth Error');
      setStep('form');
      return;
    }

    const contentHash = keccak256(toBytes(selectedNDA.content));
    const ipfsHash = await buildNdaIpfsHash(contentHash as `0x${string}`);

    const signature = `freelancer_signed_${address}_${Date.now()}`;
    const signatureHash = keccak256(toBytes(signature));
    const signConfig = await buildNdaWriteConfig('signNDAByFreelancer', [
      BigInt(currentTokenId),
      signatureHash,
    ]);
    const signHash = await writeContractAsync(signConfig);

    const receipt = await publicClient!.waitForTransactionReceipt({
      hash: signHash,
    });

    // Extract new token ID after burn+remint
    const newTokenId =
      extractMintedTokenIdFromReceipt(receipt, address as `0x${string}`) ||
      currentTokenId;

    // Save to backend
    await axiosInstance.post(
      '/nda/sign-freelancer',
      {
        ndaId: selectedNDA.ndaId,
        signature,
        sbtTokenId: newTokenId,
        sbtTransactionHash: signHash,
        ipfsHash,
        sbtContractAddress: NDA_SBT_POLYGON_AMOY,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    setSbtTokenId(newTokenId);
    setSbtTxHash(signHash);
    setBackendNdaId(selectedNDA.ndaId);
    setStep('done');
    notifySuccess(
      'NDA signed successfully! SBT re-minted to your wallet.',
      'NDA Signed',
    );
    window.dispatchEvent(new Event('ndaDataUpdated'));
  } catch (error: any) {
    console.error('NDA signing error:', error, selectedNDA);
    const msg = error?.shortMessage || error?.message || 'Failed to sign NDA';
    notifyError(msg, 'Transaction Failed');
    setStep('form');
  } finally {
    setLoading(false);
  }
};

return (
  <>
    <Button
      size="sm"
      variant="outline"
      className="gap-2"
      onClick={() => setOpen(true)}
    >
      <FileText className="w-4 h-4" />
      NDA Agreement
    </Button>

    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {step === 'done'
              ? isBusiness
                ? 'NDA Created Successfully'
                : 'NDA Signed Successfully'
              : isBusiness
                ? 'Create NDA Agreement'
                : 'Sign NDA Agreement'}
          </DialogTitle>
          <DialogDescription>
            {step === 'form' &&
              (isBusiness
                ? 'Create a Non-Disclosure Agreement and mint an SBT token on-chain.'
                : 'Review and sign a pending NDA from the business owner.')}
            {step === 'signing' &&
              (isBusiness
                ? 'Creating and signing NDA on blockchain...'
                : 'Signing NDA on blockchain...')}
            {step === 'done' &&
              (isBusiness
                ? 'NDA has been minted as Soulbound Token. Freelancer can now sign it.'
                : 'NDA signed. SBT has been re-minted to your wallet.')}
          </DialogDescription>
        </DialogHeader>

        {/* FORM STEP — Business */}
        {step === 'form' && isBusiness && (
          <div className="space-y-4 py-2">
            {businessActionBlockedReason && (
              <p className="text-sm text-amber-500">
                {businessActionBlockedReason}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={durationDays}
                onChange={(e) =>
                  setDurationDays(parseInt(e.target.value) || 30)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="freelancerWalletAddress">Freelancer Wallet Address</Label>
              <Input
                id="freelancerWalletAddress"
                type="text"
                placeholder="0x..."
                value={freelancerWalletAddress}
                onChange={(e) => setFreelancerWalletAddress(e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">NDA Content</Label>
              <Textarea
                id="content"
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        )}

        {/* FORM STEP — Freelancer */}
        {step === 'form' && !isBusiness && (
          <div className="space-y-4 py-2">
            {freelancerActionBlockedReason && (
              <p className="text-sm text-amber-500">
                {freelancerActionBlockedReason}
              </p>
            )}
            {loadingNDAs ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading pending NDAs...
              </p>
            ) : pendingNDAs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No pending NDAs to sign.
              </p>
            ) : (
              <div className="space-y-3">
                <Label>Select an NDA to sign</Label>
                {pendingNDAs.map((nda) => (
                  <div
                    key={nda.ndaId}
                    onClick={() => setSelectedNDA(nda)}
                    className={`cursor-pointer rounded-lg border p-3 text-sm transition-colors ${selectedNDA?.ndaId === nda.ndaId
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs">
                        {nda.ndaId.slice(0, 16)}...
                      </span>
                      <Badge variant="outline">{nda.durationDays} days</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {nda.content.slice(0, 120)}...
                    </p>
                  </div>
                ))}

                {/* Show selected NDA full content */}
                {selectedNDA && (
                  <div className="space-y-2 mt-2">
                    <Label>NDA Content</Label>
                    <div className="bg-muted/30 border rounded-lg p-3 text-sm max-h-40 overflow-y-auto whitespace-pre-wrap">
                      {selectedNDA.content}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SIGNING STEP */}
        {step === 'signing' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground text-center">
              Please confirm the transaction in your wallet.
              <br />
              {isBusiness
                ? 'This creates the NDA and signs it on-chain.'
                : 'This signs the NDA and re-mints the SBT to your wallet.'}
            </p>
          </div>
        )}

        {/* DONE STEP */}
        {step === 'done' && (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              <span className="text-muted-foreground">NDA Content</span>
              <div className="mt-2 whitespace-pre-wrap">
                {isBusiness
                  ? content
                  : (selectedNDA?.ipfsHash ? (
                    <a href={`https://ipfs.io/ipfs/${selectedNDA.ipfsHash.replace('ipfs://', '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {selectedNDA.ipfsHash}
                    </a>
                  ) : '')}
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">SBT Token ID</span>
                <span className="font-mono font-semibold">#{sbtTokenId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction</span>
                <a
                  href={`https://amoy.polygonscan.com/tx/${sbtTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline font-mono text-xs"
                >
                  {sbtTxHash.slice(0, 10)}...{sbtTxHash.slice(-8)}
                </a>
              </div>
              {backendNdaId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NDA ID</span>
                  <span className="font-mono text-xs">
                    {backendNdaId.slice(0, 16)}...
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={`font-medium ${isBusiness ? 'text-yellow-500' : 'text-green-500'}`}
                >
                  {isBusiness
                    ? 'Awaiting Freelancer Signature'
                    : 'Signed by Both Parties'}
                </span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'form' && isBusiness && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleBusinessCreateAndSign}
                disabled={loading || Boolean(businessActionBlockedReason)}
              >
                {businessActionBlockedReason || 'Create & Sign NDA'}
              </Button>
            </>
          )}
          {step === 'form' && !isBusiness && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleFreelancerSign}
                disabled={loading || Boolean(freelancerActionBlockedReason)}
              >
                {freelancerActionBlockedReason || 'Sign NDA'}
              </Button>
            </>
          )}
          {step === 'done' && <Button onClick={handleClose}>Close</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
);
}
