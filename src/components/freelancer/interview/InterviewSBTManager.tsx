'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWriteContract,
} from 'wagmi';
import {
  BadgeCheck,
  Info,
  ShieldCheck,
  Zap,
  Award,
  CheckCircle2,
} from 'lucide-react';
import Image from 'next/image';

import {
  INTERVIEW_SBT_ABI,
  INTERVIEW_SBT_POLYGON_AMOY,
} from '@/config/contracts/abis';
import { useToast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';
import type { RootState } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SubmitResultDialog from '@/components/freelancer/interview/SubmitResultDialog';

type TokenDetails = {
  tokenId: string;
  decision: number;
  decisionLabel: string;
  rating: number;
};

type MintEventRecord = {
  participant: string;
  tokenId: string;
  interviewerId: string;
  decision?: number;
  rating?: number;
  txHash?: string;
  receivedAt: string;
};

type InterviewSessionIdentity = {
  interviewerId?: string;
  intervieweeId?: string;
  participantId?: string | number;
  participantWallet?: string;
  walletAddress?: string;
  userWallet?: string;
  creatorId?: string;
  interviewee?: {
    _id?: string;
    walletAddress?: string;
    participantId?: string | number;
  };
};

type SubmitResultCard = {
  id: number;
  hiringDecision: string;
  rating: number;
  minting: boolean;
  minted: boolean;
};

const POLYGON_AMOY_CHAIN_ID = 80002;

const HIRING_DECISION_OPTIONS = [
  { value: '0', label: 'Lack fundamental knowledge' },
  { value: '1', label: 'Struggles with core concepts' },
  { value: '2', label: 'Can be considered for junior role' },
  { value: '3', label: 'Suitable for hiring with small improvements' },
  { value: '4', label: 'Ready for immediate hiring' },
] as const;

const getHiringDecisionLabel = (decision: number) =>
  HIRING_DECISION_OPTIONS.find((item) => Number(item.value) === decision)
    ?.label || `Unknown (${decision})`;

const isValidAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value);

const extractErrorMessage = (error: unknown) => {
  const fallback = 'Transaction failed. Please try again.';
  if (!error || typeof error !== 'object') return fallback;

  const raw = error as {
    shortMessage?: string;
    message?: string;
    details?: string;
    cause?: unknown;
  };

  const chain = [
    raw.shortMessage,
    raw.message,
    raw.details,
    typeof raw.cause === 'object' && raw.cause
      ? (raw.cause as { message?: string }).message
      : undefined,
  ]
    .filter(Boolean)
    .join(' | ')
    .toLowerCase();

  if (
    chain.includes('user rejected') ||
    chain.includes('rejected the request')
  ) {
    return 'Transaction rejected in MetaMask.';
  }

  if (chain.includes('not an authorized interviewer')) {
    return 'Wallet is not authorized interviewer for this contract.';
  }

  if (chain.includes('skills/skillids length mismatch')) {
    return 'Skills and Skill IDs count must match.';
  }

  if (chain.includes('participant zero address')) {
    return 'Participant wallet address cannot be zero.';
  }

  if (chain.includes('token does not exist')) {
    return 'Token does not exist on chain.';
  }

  return raw.shortMessage || raw.message || fallback;
};

export default function InterviewSBTManager() {
  const { address, isConnected } = useAccount();
  const user = useSelector((state: RootState) => state.user);
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  const [participantAddress, setParticipantAddress] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [interviewerId, setInterviewerId] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitCards, setSubmitCards] = useState<SubmitResultCard[]>([
    { id: 1, hiringDecision: '', rating: 0, minting: false, minted: false },
  ]);

  const [tokenIdInput, setTokenIdInput] = useState('');
  const [_tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);

  const [_fetchingDetails, setFetchingDetails] = useState(false);
  const [_recentMints, setRecentMints] = useState<MintEventRecord[]>([]);

  const extractNumericId = (...values: Array<string | number | undefined>) => {
    for (const value of values) {
      if (value === undefined || value === null) continue;
      const normalized = String(value).trim();
      if (!normalized) continue;
      if (/^\d+$/.test(normalized)) return normalized;
    }
    return '';
  };

  const extractWalletAddress = (...values: Array<string | undefined>) => {
    for (const value of values) {
      const normalized = String(value || '').trim();
      if (isValidAddress(normalized)) return normalized;
    }
    return '';
  };

  useEffect(() => {
    if (address) {
      setParticipantAddress((current) => current || address);
    }
  }, [address]);

  useEffect(() => {
    const loadHiddenMintIdentity = async () => {
      if (!user?.uid) return;

      try {
        const currentRes = await axiosInstance.get('/interview/interviewer', {
          params: { interviewStatus: 'current' },
        });

        const grouped = (currentRes as any)?.data?.data || {};
        const allInterviews = Object.values(grouped)
          .flat()
          .filter(Boolean) as InterviewSessionIdentity[];

        const selected = allInterviews[0];
        if (!selected) return;

        const interviewerIdFromSession = extractNumericId(
          selected.interviewerId,
          selected.creatorId,
          user.uid,
        );
        const participantIdFromSession = extractNumericId(
          selected.participantId,
          selected.intervieweeId,
          selected.interviewee?._id,
        );

        let participantWalletFromSession = extractWalletAddress(
          selected.participantWallet,
          selected.walletAddress,
          selected.userWallet,
          selected.interviewee?.walletAddress,
        );

        if (!participantWalletFromSession && selected.intervieweeId) {
          const intervieweeRes = await axiosInstance.get(
            `/freelancer/${selected.intervieweeId}`,
          );
          const intervieweeData = (intervieweeRes as any)?.data?.data || {};
          participantWalletFromSession = extractWalletAddress(
            intervieweeData.walletAddress,
            intervieweeData.userWallet,
            intervieweeData.publicAddress,
            intervieweeData.address,
          );
        }

        setInterviewerId((current) => current || interviewerIdFromSession);
        setParticipantId((current) => current || participantIdFromSession);
        if (participantWalletFromSession) {
          setParticipantAddress(
            (current) => current || participantWalletFromSession,
          );
        }
      } catch (error) {
        console.warn(
          'Could not auto-load interview identity for minting',
          error,
        );
      }
    };

    void loadHiddenMintIdentity();
  }, [user?.uid]);

  const canUseChain = chainId === POLYGON_AMOY_CHAIN_ID;

  const baseMintInput = useMemo(() => {
    const participantIdNum = Number(participantId);
    const interviewerIdNum = Number(interviewerId);

    const validationError = !isConnected
      ? 'Connect wallet first.'
      : !canUseChain
        ? 'Switch to Polygon Amoy.'
        : !isValidAddress(participantAddress)
          ? 'Enter a valid participant wallet address.'
          : !Number.isInteger(participantIdNum) || participantIdNum < 0
            ? 'Participant ID must be a valid number.'
            : !Number.isInteger(interviewerIdNum) || interviewerIdNum < 0
              ? 'Interviewer ID must be a valid number.'
              : null;

    return {
      validationError,
      args: {
        to: participantAddress as `0x${string}`,
        participantId: BigInt(participantIdNum || 0),
        interviewerId: BigInt(interviewerIdNum || 0),
      },
    };
  }, [
    isConnected,
    canUseChain,
    participantAddress,
    participantId,
    interviewerId,
  ]);

  const getParsedMintInput = useCallback(
    (card: SubmitResultCard) => {
      const decisionNum = Number(card.hiringDecision);
      const isDecisionValid =
        Number.isInteger(decisionNum) && decisionNum >= 0 && decisionNum <= 4;
      const ratingValue = Math.round(card.rating * 2);
      const isRatingValid =
        Number.isInteger(ratingValue) && ratingValue >= 1 && ratingValue <= 10;

      const validationError =
        baseMintInput.validationError ||
        (!isDecisionValid
          ? 'Select a review.'
          : !isRatingValid
            ? 'Select a rating.'
            : null);

      return {
        validationError,
        args: {
          ...baseMintInput.args,
          decision: decisionNum,
          rating: ratingValue,
        },
      };
    },
    [baseMintInput],
  );

  const updateCard = useCallback(
    (id: number, patch: Partial<SubmitResultCard>) => {
      setSubmitCards((prev) =>
        prev.map((card) => (card.id === id ? { ...card, ...patch } : card)),
      );
    },
    [],
  );

  const canAddNewCard = submitCards.every((card) => card.minted);

  const addNewCard = useCallback(() => {
    setSubmitCards((prev) => [
      ...prev,
      {
        id: Date.now(),
        hiringDecision: '',
        rating: 0,
        minting: false,
        minted: false,
      },
    ]);
  }, []);

  const fetchTokenDetails = useCallback(
    async (tokenIdToRead?: string) => {
      const tokenIdValue = (tokenIdToRead ?? tokenIdInput).trim();
      const parsed = Number(tokenIdValue);

      if (!Number.isInteger(parsed) || parsed < 1) {
        toast({
          variant: 'destructive',
          title: 'Invalid Token ID',
          description: 'Token ID must be a positive number.',
        });
        return;
      }

      if (!publicClient) {
        toast({
          variant: 'destructive',
          title: 'Wallet Not Ready',
          description: 'Public client unavailable. Reconnect wallet and retry.',
        });
        return;
      }

      try {
        setFetchingDetails(true);
        const data = (await publicClient.readContract({
          address: INTERVIEW_SBT_POLYGON_AMOY as `0x${string}`,
          abi: INTERVIEW_SBT_ABI,
          functionName: 'getTokenDetails',
          args: [BigInt(parsed)],
        })) as [bigint | number, bigint | number];

        const decision = Number(data[0]);
        const normalizedRating = Number(data[1]) / 2;

        setTokenDetails({
          tokenId: String(parsed),
          decision,
          decisionLabel: getHiringDecisionLabel(decision),
          rating: normalizedRating,
        });
      } catch (error) {
        const cleanMessage = extractErrorMessage(error);
        setTokenDetails(null);
        toast({
          variant: 'destructive',
          title: 'Failed To Fetch Token Details',
          description: cleanMessage,
        });
      } finally {
        setFetchingDetails(false);
      }
    },
    [publicClient, tokenIdInput, toast],
  );

  useEffect(() => {
    if (!publicClient) return;

    const unwatch = publicClient.watchContractEvent({
      address: INTERVIEW_SBT_POLYGON_AMOY as `0x${string}`,
      abi: INTERVIEW_SBT_ABI,
      eventName: 'SBTMinted',
      onLogs: (logs) => {
        logs.forEach((log) => {
          const event = log as {
            args?: {
              tokenId?: bigint;
              participant?: string;
              interviewerId?: bigint | number;
              decision?: bigint | number;
              rating?: bigint | number;
            };
            transactionHash?: string;
          };

          const participant = event.args?.participant || 'Unknown';
          const tokenId = event.args?.tokenId?.toString() || '';
          const mintedInterviewerId =
            event.args?.interviewerId !== undefined
              ? String(event.args.interviewerId)
              : 'Unknown';
          const mintedDecision =
            event.args?.decision !== undefined
              ? Number(event.args.decision)
              : undefined;
          const mintedRating =
            event.args?.rating !== undefined
              ? Number(event.args.rating) / 2
              : undefined;

          if (!tokenId) return;

          toast({
            title: 'SBT Minted Successfully',
            description: `Token #${tokenId} | Interviewer ID ${mintedInterviewerId}`,
          });

          setRecentMints((prev) => {
            const next: MintEventRecord = {
              participant,
              tokenId,
              interviewerId: mintedInterviewerId,
              decision: mintedDecision,
              rating: mintedRating,
              txHash: event.transactionHash,
              receivedAt: new Date().toLocaleString(),
            };
            return [next, ...prev].slice(0, 10);
          });

          setTokenIdInput(tokenId);
          void fetchTokenDetails(tokenId);
        });
      },
      onError: (error) => {
        console.error('SBT event listener error:', error);
      },
    });

    return () => {
      unwatch();
    };
  }, [publicClient, fetchTokenDetails, toast]);

  const submitMint = async (event: React.FormEvent, cardId: number) => {
    event.preventDefault();

    const card = submitCards.find((item) => item.id === cardId);
    if (!card) return;

    const parsedMintInput = getParsedMintInput(card);

    if (parsedMintInput.validationError) {
      toast({
        variant: 'destructive',
        title: 'Invalid Form',
        description: parsedMintInput.validationError,
      });
      return;
    }

    if (!publicClient) {
      toast({
        variant: 'destructive',
        title: 'Wallet Not Ready',
        description: 'Public client unavailable. Reconnect wallet and retry.',
      });
      return;
    }

    try {
      updateCard(cardId, { minting: true });

      const hash = await writeContractAsync({
        address: INTERVIEW_SBT_POLYGON_AMOY as `0x${string}`,
        abi: INTERVIEW_SBT_ABI,
        functionName: 'mintSBT',
        args: [
          parsedMintInput.args.to,
          parsedMintInput.args.participantId,
          parsedMintInput.args.interviewerId,
          parsedMintInput.args.decision,
          parsedMintInput.args.rating,
        ],
      });

      await publicClient.waitForTransactionReceipt({ hash });

      toast({
        title: 'Mint Transaction Confirmed',
        description: `Transaction: ${hash}`,
      });

      updateCard(cardId, { minting: false, minted: true });
    } catch (error) {
      const cleanMessage = extractErrorMessage(error);
      toast({
        variant: 'destructive',
        title: 'Mint Failed',
        description: cleanMessage,
      });
      updateCard(cardId, { minting: false });
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 py-8 sm:p-6 lg:p-8">
      {/* Hero Section */}
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Zap className="h-4 w-4" />
            <span>On-Chain Verification</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Mint Interview{' '}
              <span className="text-primary">Soulbound Tokens</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Verify and certify candidate performance with immutable
              credentials. Submitting a result mints a non-transferable SBT that
              serves as permanent proof of skills and interview outcome.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Secure & Immutable
                </h3>
                <p className="text-sm text-muted-foreground">
                  Certified results are stored forever on the Polygon network.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Professional Authority
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your evaluation directly contributes to the candidate&apos;s
                  professional reputation.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row pt-4">
            <Button
              size="lg"
              onClick={() => setDialogOpen(true)}
              className="group h-12 gap-2 px-8 text-base shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              <BadgeCheck className="h-5 w-5 transition-transform group-hover:scale-110" />
              Submit Result & Mint SBT
            </Button>
            <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Polygon Amoy Network</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-center">
          <div className="relative flex h-[350px] w-[350px] items-center justify-center rounded-3xl border border-dashed border-primary/20 bg-primary/5">
            <div className="text-center space-y-2">
              <Award className="mx-auto h-12 w-12 text-primary/40" />
              <p className="text-sm font-medium text-muted-foreground">
                Evaluation Certification System
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid gap-6 border-t border-border pt-12 sm:grid-cols-3">
        <Card className="bg-secondary/30 border-none shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Transparent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Complete transparency in the hiring process for both parties.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/30 border-none shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Non-Transferable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Records are tied specifically to the individual&apos;s wallet address.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/30 border-none shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Global Standards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Follows ERC-5192 standards for Soulbound Tokens.
            </p>
          </CardContent>
        </Card>
      </div>

      <SubmitResultDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        submitCards={submitCards}
        canAddNewCard={canAddNewCard}
        addNewCard={addNewCard}
        updateCard={updateCard}
        submitMint={submitMint}
        getParsedMintInput={getParsedMintInput}
        hiringDecisionOptions={HIRING_DECISION_OPTIONS}
      />
    </div>
  );
}
