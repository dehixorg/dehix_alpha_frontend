'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    RefreshCw,
    ExternalLink,
    FileCheck2,
    FilePen,
    FileX2,
} from 'lucide-react';

import SettingsAppLayout from '@/components/layout/SettingsAppLayout';
import { RootState } from '@/lib/store';
import NDAFileIcon from '@/components/icons/NDAFileIcon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/shared/EmptyState';
import { useNDAData, NDAItem } from '@/hooks/useNDAData';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { NDA_SBT_POLYGON_AMOY } from '@/config/contracts/abis';

const txExplorerBase = 'https://amoy.polygonscan.com/tx/';
const tokenExplorerBase = `https://amoy.polygonscan.com/token/${NDA_SBT_POLYGON_AMOY}`;

const isValidTxHash = (hash?: string | null) =>
    Boolean(hash && /^0x[a-fA-F0-9]{64}$/.test(hash));

function getStatusBadge(status: string) {
    const map: Record<string, { label: string; className: string }> = {
        draft: {
            label: 'Draft',
            className:
                'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/20 text-gray-600 dark:text-gray-400',
        },
        signed_by_business: {
            label: 'Business Signed',
            className:
                'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-300',
        },
        signed_by_both: {
            label: 'Both Signed',
            className:
                'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300',
        },
        active: {
            label: 'Active',
            className:
                'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300',
        },
        completed: {
            label: 'Completed',
            className:
                'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300',
        },
        violated: {
            label: 'Violated',
            className:
                'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300',
        },
        expired: {
            label: 'Expired',
            className:
                'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300',
        },
        burned: {
            label: 'Burned',
            className:
                'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300',
        },
    };
    const badge = map[status] || {
        label: status,
        className: 'border-gray-200 dark:border-gray-700',
    };
    return badge;
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'signed_by_both':
        case 'active':
        case 'completed':
            return (
                <FileCheck2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            );
        case 'signed_by_business':
        case 'draft':
            return (
                <FilePen className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            );
        case 'violated':
        case 'expired':
        case 'burned':
            return <FileX2 className="h-5 w-5 text-red-600 dark:text-red-400" />;
        default:
            return (
                <NDAFileIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            );
    }
}

function getIconBgColor(status: string) {
    switch (status) {
        case 'signed_by_both':
        case 'active':
        case 'completed':
            return 'bg-green-500/10 dark:bg-green-500/20';
        case 'signed_by_business':
        case 'draft':
            return 'bg-yellow-500/10 dark:bg-yellow-500/20';
        case 'violated':
        case 'expired':
        case 'burned':
            return 'bg-red-500/10 dark:bg-red-500/20';
        default:
            return 'bg-purple-500/10 dark:bg-purple-500/20';
    }
}

export default function NDATransactionsPage() {
    const user = useSelector((state: RootState) => state.user);
    const userType = user.type === 'business' ? 'business' : 'freelancer';
    const { ndaItems, isLoading, error, totalCount, refetch } = useNDAData();

    useEffect(() => {
        const handleNDAUpdate = () => {
            refetch();
        };
        window.addEventListener('ndaDataUpdated', handleNDAUpdate);
        return () => {
            window.removeEventListener('ndaDataUpdated', handleNDAUpdate);
        };
    }, [refetch]);

    const activeCount = ndaItems.filter(
        (n) =>
            n.status === 'active' ||
            n.status === 'signed_by_both' ||
            n.status === 'completed',
    ).length;

    const pendingCount = ndaItems.filter(
        (n) => n.status === 'draft' || n.status === 'signed_by_business',
    ).length;

    return (
        <SettingsAppLayout
            active="NDA"
            activeMenu="NDA"
            userType={userType}
            isKycCheck={true}
            breadcrumbItems={[
                { label: 'Settings', link: '#' },
                { label: 'NDA Agreements', link: '#' },
            ]}
            mainClassName="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0"
        >
            <div className="w-full mx-auto max-w-6xl">
                {/* Header Section */}
                <div className="flex flex-col gap-2 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <NDAFileIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            <h1 className="text-2xl font-bold tracking-tight">
                                NDA Agreements
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
                        View your Non-Disclosure Agreements secured as Soulbound Tokens on
                        the blockchain
                    </p>
                </div>

                {/* NDA Overview Card */}
                <Card className="mb-6 overflow-hidden border border-border shadow-md">
                    <CardHeader className="bg-purple-500/5 dark:bg-purple-500/10 border-b border-border py-4">
                        <CardTitle className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                            Your NDA Overview
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
                                {/* Total NDAs */}
                                <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-purple-500/5 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-800">
                                    <NDAFileIcon className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-3" />
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Total NDAs
                                    </h3>
                                    <p className="text-lg font-semibold text-foreground">
                                        {totalCount}
                                    </p>
                                </div>

                                {/* Active / Signed */}
                                <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-green-500/5 dark:bg-green-500/10 border border-green-200 dark:border-green-800">
                                    <FileCheck2 className="h-12 w-12 text-green-600 dark:text-green-400 mb-3" />
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Active / Signed
                                    </h3>
                                    <p className="text-lg font-semibold text-foreground">
                                        {activeCount}
                                    </p>
                                </div>

                                {/* Pending Signature */}
                                <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-yellow-500/5 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-800">
                                    <FilePen className="h-12 w-12 text-yellow-600 dark:text-yellow-400 mb-3" />
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Pending Signature
                                    </h3>
                                    <p className="text-lg font-semibold text-foreground">
                                        {pendingCount}
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

                {/* NDA List */}
                <Card className="overflow-hidden border border-border shadow-md">
                    <CardHeader className="bg-purple-500/5 dark:bg-purple-500/10 border-b border-border py-4">
                        <CardTitle className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                            NDA Agreements
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
                        ) : ndaItems.length > 0 ? (
                            <div className="space-y-4">
                                {ndaItems.map((nda: NDAItem) => {
                                    const badge = getStatusBadge(nda.status);

                                    return (
                                        <div
                                            key={nda._id}
                                            className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                                        >
                                            {/* Top row */}
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className={`h-10 w-10 rounded-lg ${getIconBgColor(nda.status)} flex items-center justify-center flex-shrink-0`}
                                                >
                                                    {getStatusIcon(nda.status)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 justify-between flex-wrap">
                                                        <h3 className="font-medium text-foreground">
                                                            NDA Agreement
                                                        </h3>
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs ${badge.className}`}
                                                        >
                                                            {badge.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                        {nda.content.slice(0, 120)}
                                                        {nda.content.length > 120 ? '...' : ''}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Date and duration */}
                                            <div className="flex items-center gap-3 pl-14 flex-wrap">
                                                <p className="text-xs text-muted-foreground">
                                                    Created:{' '}
                                                    {new Date(nda.createdAt).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Duration: {nda.durationDays} days
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Expires:{' '}
                                                    {new Date(nda.expirationDate).toLocaleDateString()}
                                                </p>
                                            </div>

                                            {/* Transaction details */}
                                            <div className="pl-14 space-y-2 border-t border-border pt-3">
                                                {/* NDA ID */}
                                                <div className="flex flex-col sm:flex-row gap-2 items-start">
                                                    <span className="text-xs font-medium text-muted-foreground min-w-fit">
                                                        NDA ID:
                                                    </span>
                                                    <code
                                                        className="text-xs bg-muted px-2 py-1 rounded font-mono break-all text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                                                        title="Click to copy"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(nda.ndaId);
                                                        }}
                                                    >
                                                        {nda.ndaId}
                                                    </code>
                                                </div>

                                                {/* Token ID */}
                                                {nda.sbtTokenId && (
                                                    <div className="flex flex-col sm:flex-row gap-2 items-start">
                                                        <span className="text-xs font-medium text-muted-foreground min-w-fit">
                                                            Token ID:
                                                        </span>
                                                        <code
                                                            className="text-xs bg-muted px-2 py-1 rounded font-mono break-all text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                                                            title="Click to copy"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(
                                                                    nda.sbtTokenId || '',
                                                                );
                                                            }}
                                                        >
                                                            {nda.sbtTokenId}
                                                        </code>
                                                    </div>
                                                )}

                                                {/* SBT Transaction Hash — clickable Polygonscan link */}
                                                {isValidTxHash(nda.sbtTransactionHash) ? (
                                                    <div className="flex flex-col sm:flex-row gap-2 items-start">
                                                        <span className="text-xs font-medium text-muted-foreground min-w-fit">
                                                            Tx Hash:
                                                        </span>
                                                        <a
                                                            href={`${txExplorerBase}${nda.sbtTransactionHash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs bg-blue-100 dark:bg-blue-950/40 px-2 py-1 rounded font-mono break-all text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors cursor-pointer inline-flex items-center gap-1.5 group font-semibold border border-blue-300 dark:border-blue-700"
                                                            title={`View on Polygon Amoy: ${nda.sbtTransactionHash}`}
                                                        >
                                                            {nda.sbtTransactionHash!.slice(0, 10)}...
                                                            {nda.sbtTransactionHash!.slice(-10)}
                                                            <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                                                        </a>
                                                    </div>
                                                ) : nda.sbtTokenId ? (
                                                    <div className="flex flex-col sm:flex-row gap-2 items-start">
                                                        <span className="text-xs font-medium text-muted-foreground min-w-fit">
                                                            Tx Hash:
                                                        </span>
                                                        <a
                                                            href={`${tokenExplorerBase}?a=${encodeURIComponent(nda.sbtTokenId)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs bg-blue-100 dark:bg-blue-950/40 px-2 py-1 rounded text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors cursor-pointer inline-flex items-center gap-1.5 group font-semibold border border-blue-300 dark:border-blue-700"
                                                            title={`View token ${nda.sbtTokenId} on Polygon Amoy`}
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
                                                            Pending — awaiting both signatures...
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Burn Transaction Hash (if re-minted) */}
                                                {isValidTxHash(nda.burnTransactionHash) && (
                                                    <div className="flex flex-col sm:flex-row gap-2 items-start">
                                                        <span className="text-xs font-medium text-muted-foreground min-w-fit">
                                                            Burn Tx:
                                                        </span>
                                                        <a
                                                            href={`${txExplorerBase}${nda.burnTransactionHash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs bg-red-100 dark:bg-red-950/40 px-2 py-1 rounded font-mono break-all text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors cursor-pointer inline-flex items-center gap-1.5 group font-semibold border border-red-300 dark:border-red-700"
                                                            title={`View burn tx on Polygon Amoy: ${nda.burnTransactionHash}`}
                                                        >
                                                            {nda.burnTransactionHash!.slice(0, 10)}...
                                                            {nda.burnTransactionHash!.slice(-10)}
                                                            <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                                                        </a>
                                                    </div>
                                                )}

                                                {/* Signature indicators */}
                                                <div className="flex items-center gap-3 flex-wrap pt-1">
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        Business:{' '}
                                                        {nda.businessSignature ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[10px] px-1.5 py-0 border-green-300 dark:border-green-700 text-green-600 dark:text-green-400"
                                                            >
                                                                Signed
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[10px] px-1.5 py-0 border-gray-300 dark:border-gray-700 text-gray-500"
                                                            >
                                                                Pending
                                                            </Badge>
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        Freelancer:{' '}
                                                        {nda.freelancerSignature ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[10px] px-1.5 py-0 border-green-300 dark:border-green-700 text-green-600 dark:text-green-400"
                                                            >
                                                                Signed
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[10px] px-1.5 py-0 border-gray-300 dark:border-gray-700 text-gray-500"
                                                            >
                                                                Pending
                                                            </Badge>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState
                                title="No NDA agreements yet"
                                description="Your Non-Disclosure Agreements will appear here once created. Start an NDA from a project page to secure confidential information on-chain."
                                icon={
                                    <NDAFileIcon className="h-16 w-16 text-purple-500" />
                                }
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
                                What is an NDA Soulbound Token?
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                NDA Soulbound Tokens are non-transferable on-chain agreements
                                that prove both parties signed a Non-Disclosure Agreement. When
                                both the business owner and freelancer sign, the NDA is minted
                                as an SBT on the Polygon blockchain — creating a tamper-proof,
                                verifiable record of the agreement.
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li>
                                    Business creates and signs the NDA, then freelancer
                                    counter-signs
                                </li>
                                <li>
                                    Freelancer signing triggers burn-and-remint for updated SBT
                                </li>
                                <li>Non-transferable and permanently linked to both wallets</li>
                                <li>
                                    Transaction hashes are verifiable on Polygon Amoy explorer
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </SettingsAppLayout>
    );
}
