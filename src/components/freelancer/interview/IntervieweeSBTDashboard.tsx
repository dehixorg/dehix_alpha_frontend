'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAccount, usePublicClient } from 'wagmi';
import { parseAbiItem } from 'viem';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Filter,
  RefreshCcw,
  Star,
  Wallet,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { axiosInstance } from '@/lib/axiosinstance';
import type { RootState } from '@/lib/store';
import {
  INTERVIEW_SBT_ABI,
  INTERVIEW_SBT_POLYGON_AMOY,
} from '@/config/contracts/abis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

type InterviewHistoryItem = {
  _id: string;
  interviewerId?: string;
  intervieweeId?: string;
  talentType?: string;
  talentId?: string;
  name?: string;
  talentName?: string;
  interviewDate?: string;
  interviewStatus?: string;
};

type InterviewSbtToken = {
  tokenId: string;
  decision: number;
  rating: number;
  interviewerId: string;
  talentType: string;
  talentName: string;
  interviewDate?: string;
  transactionHash?: string;
  ordinal: number;
};

const SBT_MINTED_EVENT = parseAbiItem(
  'event SBTMinted(uint256 indexed tokenId, address indexed participant, uint256 interviewerId, uint8 decision, uint8 rating)',
);

const getRatingStars = (rating: number) => rating / 2;

const getStarFillPercentage = (starIndex: number, ratingInStars: number) => {
  const diff = ratingInStars - (starIndex - 1);
  if (diff <= 0) return 0;
  if (diff >= 1) return 100;
  return Math.round(diff * 100);
};

const getReviewLabel = (decision: number) => {
  const labels = [
    'Lack fundamental knowledge',
    'Struggles with core concepts',
    'Can be considered for junior role',
    'Suitable for hiring with small improvements',
    'Ready for immediate hiring',
  ];

  return labels[decision] || `Unknown (${decision})`;
};

const getTypeLabel = (talentType: string) => {
  const normalized = talentType.toUpperCase();
  if (normalized === 'SKILL') return 'Skill';
  if (normalized === 'DOMAIN') return 'Domain';
  return normalized || 'Unknown';
};

const getDomainKey = (
  item: Pick<InterviewHistoryItem, 'talentType' | 'talentName'>,
) => {
  const type =
    String(item.talentType || '')
      .toUpperCase()
      .trim() || 'UNKNOWN';
  const name = String(item.talentName || '').trim() || 'Unknown';
  return `${type}::${name}`;
};

const getDomainLabel = (
  item: Pick<InterviewHistoryItem, 'talentType' | 'talentName'>,
) => {
  const name = String(item.talentName || '').trim();
  const typeLabel = getTypeLabel(String(item.talentType || ''));
  return name ? `${typeLabel}: ${name}` : typeLabel;
};

const formatInterviewDate = (value?: string) => {
  if (!value) return 'Unknown';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString();
};

export default function IntervieweeSBTDashboard() {
  const user = useSelector((state: RootState) => state.user);
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const [tokens, setTokens] = useState<InterviewSbtToken[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<InterviewSbtToken[]>([]);
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInterviewHistory = useCallback(async () => {
    if (!user?.uid || !address || !publicClient) {
      setTokens([]);
      setFilteredTokens([]);
      setError(
        address ? 'Connect wallet and retry.' : 'Connect wallet to view SBTs.',
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sbtContractAddress = INTERVIEW_SBT_POLYGON_AMOY as `0x${string}`;

      const [balanceResult, historyResponse] = await Promise.all([
        publicClient.readContract({
          address: sbtContractAddress,
          abi: INTERVIEW_SBT_ABI,
          functionName: 'balanceOf',
          args: [address],
        }),
        axiosInstance.get('/interview/interviewee', {
          params: { interviewStatus: 'history' },
        }),
      ]);

      const balance = Number(balanceResult);
      const tokenIds = await Promise.all(
        Array.from({ length: balance }, async (_, index) => {
          const tokenId = await publicClient.readContract({
            address: sbtContractAddress,
            abi: INTERVIEW_SBT_ABI,
            functionName: 'tokenOfOwnerByIndex',
            args: [address, BigInt(index)],
          });

          return String(tokenId);
        }),
      );

      const logs = await publicClient.getLogs({
        address: sbtContractAddress,
        event: SBT_MINTED_EVENT,
        args: { participant: address },
        fromBlock: 0n,
      });

      const eventByTokenId = new Map<
        string,
        {
          interviewerId?: string;
          decision?: number;
          rating?: number;
          transactionHash?: string;
        }
      >();

      logs.forEach((log) => {
        const tokenId = log.args?.tokenId?.toString();
        if (!tokenId) return;

        eventByTokenId.set(tokenId, {
          interviewerId:
            log.args?.interviewerId !== undefined
              ? String(log.args.interviewerId)
              : undefined,
          decision:
            log.args?.decision !== undefined
              ? Number(log.args.decision)
              : undefined,
          rating:
            log.args?.rating !== undefined
              ? Number(log.args.rating)
              : undefined,
          transactionHash: log.transactionHash,
        });
      });

      const grouped = (historyResponse as any)?.data?.data || {};
      const historyItems = Object.values(grouped)
        .flat()
        .filter(Boolean) as InterviewHistoryItem[];

      const latestByInterviewer = new Map<
        string,
        {
          domainKey: string;
          domainLabel: string;
          interviewDate?: string;
        }
      >();

      historyItems.forEach((item) => {
        const interviewerKey = String(item.interviewerId || '').trim();
        if (!interviewerKey) return;

        const nextEntry = {
          domainKey: getDomainKey(item),
          domainLabel: getDomainLabel(item),
          interviewDate: item.interviewDate,
        };

        const currentEntry = latestByInterviewer.get(interviewerKey);
        const currentTime = currentEntry?.interviewDate
          ? new Date(currentEntry.interviewDate).getTime()
          : Number.NEGATIVE_INFINITY;
        const nextTime = nextEntry.interviewDate
          ? new Date(nextEntry.interviewDate).getTime()
          : Number.NEGATIVE_INFINITY;

        if (!currentEntry || nextTime >= currentTime) {
          latestByInterviewer.set(interviewerKey, nextEntry);
        }
      });

      const assembledTokens = await Promise.all(
        tokenIds.map(async (tokenId, ordinal) => {
          const [decisionRaw, ratingRaw] = (await publicClient.readContract({
            address: sbtContractAddress,
            abi: INTERVIEW_SBT_ABI,
            functionName: 'getTokenDetails',
            args: [BigInt(tokenId)],
          })) as [bigint | number, bigint | number];

          const eventData = eventByTokenId.get(tokenId);
          const historyData = eventData?.interviewerId
            ? latestByInterviewer.get(eventData.interviewerId)
            : undefined;

          return {
            tokenId,
            decision: Number(decisionRaw),
            rating: Number(ratingRaw),
            interviewerId: eventData?.interviewerId || 'Unknown',
            talentType: historyData?.domainLabel || 'Unknown',
            talentName: historyData?.domainLabel || 'Unknown',
            interviewDate: historyData?.interviewDate,
            transactionHash: eventData?.transactionHash,
            ordinal: ordinal + 1,
          } satisfies InterviewSbtToken;
        }),
      );

      assembledTokens.sort((a, b) => a.ordinal - b.ordinal);
      setTokens(assembledTokens);
    } catch (fetchError) {
      console.error('Failed to load interviewee SBT dashboard:', fetchError);
      setTokens([]);
      setError('Unable to load interview SBTs right now.');
    } finally {
      setIsLoading(false);
    }
  }, [address, publicClient, user?.uid]);

  useEffect(() => {
    void fetchInterviewHistory();
  }, [fetchInterviewHistory]);

  const domainOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All SBTs' },
      ...Array.from(
        new Set(
          tokens.map((token) => {
            const key = getDomainKey({
              talentType: token.talentType,
              talentName: token.talentName,
            });
            const label = getDomainLabel({
              talentType: token.talentType,
              talentName: token.talentName,
            });
            return JSON.stringify({ key, label });
          }),
        ),
      ).map((entry) => {
        const parsed = JSON.parse(entry) as { key: string; label: string };
        return { value: parsed.key, label: parsed.label };
      }),
    ];
  }, [tokens]);

  useEffect(() => {
    if (selectedDomain === 'all') {
      setFilteredTokens(tokens);
      return;
    }

    setFilteredTokens(
      tokens.filter((token) => {
        const key = getDomainKey({
          talentType: token.talentType,
          talentName: token.talentName,
        });
        return key === selectedDomain;
      }),
    );
  }, [selectedDomain, tokens]);

  const chartData = useMemo(() => {
    return filteredTokens.map((token) => ({
      interview: token.interviewDate
        ? new Date(token.interviewDate).toLocaleDateString()
        : `#${token.ordinal}`,
      rating: token.rating,
    }));
  }, [filteredTokens]);

  const averageRating = useMemo(() => {
    if (filteredTokens.length === 0) return 0;
    return (
      filteredTokens.reduce(
        (sum, token) => sum + Number(token.rating || 0),
        0,
      ) / filteredTokens.length
    );
  }, [filteredTokens]);

  const trend = useMemo(() => {
    if (filteredTokens.length < 2) return 0;
    return (
      filteredTokens[filteredTokens.length - 1].rating -
      filteredTokens[0].rating
    );
  }, [filteredTokens]);

  const bestRating = useMemo(() => {
    if (filteredTokens.length === 0) return 0;
    return Math.max(
      ...filteredTokens.map((token) => Number(token.rating || 0)),
    );
  }, [filteredTokens]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Card className="border-muted/50 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                <BarChart3 className="h-5 w-5 text-violet-600" />
                Interviewee Dashboard
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                View all minted SBTs, ratings, interviewer IDs, and performance
                trend.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void fetchInterviewHistory()}
            >
              <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="border border-muted/40 bg-gradient-to-br from-blue-50/70 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total SBTs
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {tokens.length}
              </CardContent>
            </Card>
            <Card className="border border-muted/40 bg-gradient-to-br from-amber-50/70 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Rating
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {averageRating
                  ? `${(averageRating / 2).toFixed(1)} / 5`
                  : '0 / 5'}
              </CardContent>
            </Card>
            <Card className="border border-muted/40 bg-gradient-to-br from-emerald-50/70 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Best Rating
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {bestRating ? `${(bestRating / 2).toFixed(1)} / 5` : '0 / 5'}
              </CardContent>
            </Card>
            <Card className="border border-muted/40 bg-gradient-to-br from-violet-50/70 to-violet-100/50 dark:from-violet-950/20 dark:to-violet-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2 text-2xl font-bold">
                {trend > 0 ? (
                  <>
                    <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                    Up
                  </>
                ) : trend < 0 ? (
                  <>
                    <ArrowDownRight className="h-5 w-5 text-red-600" />
                    Down
                  </>
                ) : (
                  'Flat'
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Filter className="h-4 w-4" />
                Filter by skill/domain
              </div>
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger>
                  <SelectValue placeholder="All SBTs" />
                </SelectTrigger>
                <SelectContent>
                  {domainOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card className="border border-muted/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Rating Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[320px]">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Skeleton className="h-[260px] w-full rounded-xl" />
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed text-muted-foreground">
                    No rating data available.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                      <XAxis dataKey="interview" tickMargin={8} />
                      <YAxis domain={[0, 10]} tickMargin={8} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="rating"
                        stroke="#7c3aed"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="border border-muted/40">
              <CardHeader>
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))
        ) : filteredTokens.length === 0 ? (
          <Card className="border border-dashed border-muted/60">
            <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
              <Wallet className="h-5 w-5" />
              <div>No minted SBTs found for this wallet.</div>
            </CardContent>
          </Card>
        ) : (
          filteredTokens.map((token) => (
            <Card
              key={token.tokenId}
              className="border border-muted/40 bg-gradient-to-br from-background to-muted/20 shadow-sm"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      Token #{token.tokenId}
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Interview #{token.ordinal}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {formatInterviewDate(token.interviewDate)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1 text-sm">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Review
                  </div>
                  <div className="font-medium">
                    {getReviewLabel(token.decision)}
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Rating
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((starIndex) => {
                        const fillPercentage = getStarFillPercentage(
                          starIndex,
                          getRatingStars(token.rating),
                        );

                        return (
                          <div key={starIndex} className="relative h-6 w-6">
                            <Star className="h-6 w-6 fill-muted text-muted-foreground/40" />
                            <div
                              className="pointer-events-none absolute inset-0 overflow-hidden"
                              style={{ width: `${fillPercentage}%` }}
                            >
                              <Star className="h-6 w-6 fill-amber-400 text-amber-500" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {(token.rating / 2).toFixed(1)} / 5
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Interviewer ID
                  </div>
                  <div className="font-medium">{token.interviewerId}</div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Skill / Domain
                  </div>
                  <div className="font-medium">{token.talentType}</div>
                  <div className="text-xs text-muted-foreground">
                    {token.talentName}
                  </div>
                </div>

                {token.transactionHash ? (
                  <div className="break-all text-xs text-muted-foreground">
                    Tx: {token.transactionHash}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {error ? (
        <Card className="border border-red-200 bg-red-50/60 dark:border-red-900/50 dark:bg-red-950/20">
          <CardContent className="py-4 text-sm text-red-700 dark:text-red-300">
            {error}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
