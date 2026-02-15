'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Award,
  Briefcase,
  GraduationCap,
  FolderKanban,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

import SettingsAppLayout from '@/components/layout/SettingsAppLayout';
import { RootState } from '@/lib/store';
import SBTHexagon from '@/components/icons/SBTHexagon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/shared/EmptyState';
import { useSBTData } from '@/hooks/useSBTData';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FREELANCER_SBT_SEPOLIA } from '@/config/contracts/abis';

export default function SBTTransactionsPage() {
  const user = useSelector((state: RootState) => state.user);
  const userType = user.type === 'business' ? 'business' : 'freelancer';
  const { sbtItems, isLoading, error, totalCount, refetch } = useSBTData();
  const txExplorerBase = 'https://sepolia.etherscan.io/tx/';
  const tokenExplorerBase = `https://sepolia.etherscan.io/token/${process.env.NEXT_PUBLIC_SBT_CONTRACT_SEPOLIA || FREELANCER_SBT_SEPOLIA}`;
  const isValidTxHash = (hash?: string) =>
    Boolean(hash && /^0x[a-fA-F0-9]{64}$/.test(hash));

  // Listen for SBT data updates from minting dialogs
  useEffect(() => {
    const handleSBTUpdate = () => {
      console.log('SBT data updated, refetching...');
      refetch();
    };

    window.addEventListener('sbtDataUpdated', handleSBTUpdate);

    return () => {
      window.removeEventListener('sbtDataUpdated', handleSBTUpdate);
    };
  }, [refetch]);

  return (
    <SettingsAppLayout
      active="SBT"
      activeMenu="SBT"
      userType={userType}
      isKycCheck={true}
      breadcrumbItems={[
        { label: 'Settings', link: '#' },
        { label: 'SBT Tokens', link: '#' },
      ]}
      mainClassName="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0"
    >
      <div className="w-full mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SBTHexagon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <h1 className="text-2xl font-bold tracking-tight">
                Soulbound Tokens (SBT)
              </h1>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
          <p className="text-muted-foreground">
            View and manage your verified credentials and achievements stored on
            the blockchain
          </p>
        </div>

        {/* SBT Overview Card */}
        <Card className="mb-6 overflow-hidden border border-border shadow-md">
          <CardHeader className="bg-purple-500/5 dark:bg-purple-500/10 border-b border-border py-4">
            <CardTitle className="text-lg font-semibold text-purple-600 dark:text-purple-400">
              Your SBT Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-12 w-12 rounded" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* SBT Status */}
                <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-purple-500/5 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-800">
                  <SBTHexagon className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Status
                  </h3>
                  <p className="text-lg font-semibold text-foreground">
                    {user?.verified ? 'Verified' : 'Pending'}
                  </p>
                </div>

                {/* Transactions Count */}
                <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-blue-500/5 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-800">
                  <Award className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-3" />
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Minted SBTs
                  </h3>
                  <p className="text-lg font-semibold text-foreground">
                    {totalCount}
                  </p>
                </div>

                {/* Last Activity */}
                <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-green-500/5 dark:bg-green-500/10 border border-green-200 dark:border-green-800">
                  <div className="h-3 w-3 rounded-full bg-green-500 mb-3"></div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Activity
                  </h3>
                  <p className="text-lg font-semibold text-foreground">
                    Active
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* SBT Transactions List */}
        <Card className="overflow-hidden border border-border shadow-md">
          <CardHeader className="bg-purple-500/5 dark:bg-purple-500/10 border-b border-border py-4">
            <CardTitle className="text-lg font-semibold text-purple-600 dark:text-purple-400">
              Minted SBTs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-lg border"
                  >
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : sbtItems.length > 0 ? (
              <div className="space-y-4">
                {sbtItems.map((transaction, index) => {
                  const getIcon = () => {
                    switch (transaction.type) {
                      case 'experience':
                        return (
                          <Briefcase className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        );
                      case 'education':
                        return (
                          <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        );
                      case 'project':
                        return (
                          <FolderKanban className="h-5 w-5 text-green-600 dark:text-green-400" />
                        );
                      default:
                        return (
                          <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        );
                    }
                  };

                  const getIconBgColor = () => {
                    switch (transaction.type) {
                      case 'experience':
                        return 'bg-orange-500/10 dark:bg-orange-500/20';
                      case 'education':
                        return 'bg-blue-500/10 dark:bg-blue-500/20';
                      case 'project':
                        return 'bg-green-500/10 dark:bg-green-500/20';
                      default:
                        return 'bg-purple-500/10 dark:bg-purple-500/20';
                    }
                  };

                  const getTypeLabel = () => {
                    switch (transaction.type) {
                      case 'experience':
                        return 'Experience';
                      case 'education':
                        return 'Education';
                      case 'project':
                        return 'Project';
                      default:
                        return 'SBT';
                    }
                  };

                  return (
                    <div
                      key={index}
                      className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      {/* Top row with icon and title */}
                      <div className="flex items-start gap-4">
                        <div
                          className={`h-10 w-10 rounded-lg ${getIconBgColor()} flex items-center justify-center flex-shrink-0`}
                        >
                          {getIcon()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 justify-between flex-wrap">
                            <h3 className="font-medium text-foreground">
                              {transaction.title}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {getTypeLabel()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {transaction.description}
                          </p>
                        </div>
                      </div>

                      {/* Middle row with date and status */}
                      <div className="flex items-center gap-2 pl-14">
                        <p className="text-xs text-muted-foreground">
                          {transaction.date ||
                            (transaction.createdAt
                              ? new Date(
                                  transaction.createdAt,
                                ).toLocaleDateString()
                              : 'Recently added')}
                        </p>
                        <Badge
                          variant="outline"
                          className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </div>

                      {/* Transaction details */}
                      <div className="pl-14 space-y-2 border-t border-border pt-3">
                        {transaction._id && (
                          <div className="flex flex-col sm:flex-row gap-2 items-start">
                            <span className="text-xs font-medium text-muted-foreground min-w-fit">
                              SBT ID:
                            </span>
                            <code
                              className="text-xs bg-muted px-2 py-1 rounded font-mono break-all text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                              title="Click to copy"
                              onClick={() => {
                                navigator.clipboard.writeText(transaction._id);
                              }}
                            >
                              {transaction._id}
                            </code>
                          </div>
                        )}
                        {transaction.tokenId && (
                          <div className="flex flex-col sm:flex-row gap-2 items-start">
                            <span className="text-xs font-medium text-muted-foreground min-w-fit">
                              Token ID:
                            </span>
                            <code
                              className="text-xs bg-muted px-2 py-1 rounded font-mono break-all text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                              title="Click to copy"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  transaction.tokenId?.toString() || '',
                                );
                              }}
                            >
                              {transaction.tokenId.toString()}
                            </code>
                          </div>
                        )}
                        {isValidTxHash(transaction.transactionHash) ? (
                          <div className="flex flex-col sm:flex-row gap-2 items-start">
                            <span className="text-xs font-medium text-muted-foreground min-w-fit">
                              Tx Hash:
                            </span>
                            <a
                              href={`${txExplorerBase}${transaction.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-blue-100 dark:bg-blue-950/40 px-2 py-1 rounded font-mono break-all text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors cursor-pointer inline-flex items-center gap-1.5 group font-semibold border border-blue-300 dark:border-blue-700"
                              title={`View on Sepolia Etherscan: ${transaction.transactionHash}`}
                            >
                              {transaction.transactionHash!.slice(0, 10)}...
                              {transaction.transactionHash!.slice(-10)}
                              <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </div>
                        ) : transaction.tokenId ? (
                          <div className="flex flex-col sm:flex-row gap-2 items-start">
                            <span className="text-xs font-medium text-muted-foreground min-w-fit">
                              Tx Hash:
                            </span>
                            <a
                              href={`${tokenExplorerBase}?a=${encodeURIComponent(transaction.tokenId.toString())}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-blue-100 dark:bg-blue-950/40 px-2 py-1 rounded text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors cursor-pointer inline-flex items-center gap-1.5 group font-semibold border border-blue-300 dark:border-blue-700"
                              title={`View token ${transaction.tokenId} on Sepolia Etherscan`}
                            >
                              Open token on explorer
                              <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-2 items-start">
                            <span className="text-xs font-medium text-muted-foreground min-w-fit">
                              Tx Hash:
                            </span>
                            <span className="text-xs text-muted-foreground italic">
                              Pending minting...
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No SBT transactions yet"
                description="Your verified credentials and achievements will appear here as Soulbound Tokens on the blockchain. Add experience, education, or projects to mint your first SBT."
                icon={<SBTHexagon className="h-16 w-16 text-purple-500" />}
                className="py-10 border-0 bg-transparent"
              />
            )}
          </CardContent>
        </Card>

        {/* Information Section */}
        <Card className="mt-6 overflow-hidden border border-border shadow-md bg-purple-500/5 dark:bg-purple-500/10">
          <CardContent className="p-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">
                What is a Soulbound Token (SBT)?
              </h3>
              <p className="text-sm text-muted-foreground">
                Soulbound Tokens are non-transferable digital credentials that
                represent your verified achievements, skills, and
                accomplishments. They are stored on the blockchain and cannot be
                bought, sold, or transferred, making them a true representation
                of your verified identity and capabilities.
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Permanently linked to your wallet address</li>
                <li>Verified by the Dehix platform</li>
                <li>Non-transferable and tamper-proof</li>
                <li>Builds trust with potential clients and employers</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsAppLayout>
  );
}
