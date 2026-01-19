'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import {
  Receipt,
  RefreshCw,
  TrendingUp,
  Wallet,
  ArrowUpDown,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import FreelancerSettingsLayout from '@/components/layout/FreelancerSettingsLayout';
import { RootState } from '@/lib/store';
import { fetchTransactions, TransactionFilters } from '@/services/apiService';
import { TransactionSummaryComponent } from '@/components/transactions/TransactionSummary';
import { TransactionFiltersSheet } from '@/components/transactions/TransactionFiltersSheet';
import { TransactionExportDropdown } from '@/components/transactions/TransactionExportDropdown';
import { TransactionTable } from '@/components/transactions/TransactionTable';

export default function TransactionsPage() {
  const user = useSelector((state: RootState) => state.user);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [filters, setFilters] = useState<{
    startDate?: Date;
    endDate?: Date;
    transactionType?: 'credit' | 'debit' | 'all';
    minAmount?: number;
    maxAmount?: number;
    searchQuery?: string;
  }>({});
  const [appliedFilters, setAppliedFilters] = useState<TransactionFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['transactions', 'freelancer', user.uid, page, appliedFilters],
    queryFn: async () => {
      const response = await fetchTransactions(
        user.uid,
        'freelancer',
        page,
        limit,
        Object.keys(appliedFilters).length > 0 ? appliedFilters : undefined,
      );
      if (!response.success) {
        throw new Error(
          response.data?.message || 'Failed to fetch transactions',
        );
      }
      return response;
    },
    enabled: !!user.uid,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const handleConnectsUpdate = () => {
      refetch();
    };

    window.addEventListener('connectsUpdated', handleConnectsUpdate);

    return () => {
      window.removeEventListener('connectsUpdated', handleConnectsUpdate);
    };
  }, [refetch]);

  const handleApplyFilters = () => {
    // Convert Date to string for API
    const apiFilters: TransactionFilters = {};
    if (filters.startDate) {
      apiFilters.startDate = filters.startDate.toISOString();
    }
    if (filters.endDate) {
      apiFilters.endDate = filters.endDate.toISOString();
    }
    if (filters.transactionType) {
      apiFilters.transactionType = filters.transactionType;
    }
    if (filters.minAmount !== undefined) {
      apiFilters.minAmount = filters.minAmount;
    }
    if (filters.maxAmount !== undefined) {
      apiFilters.maxAmount = filters.maxAmount;
    }
    if (filters.searchQuery) {
      apiFilters.searchQuery = filters.searchQuery;
    }
    setAppliedFilters(apiFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    setFilters({});
    setAppliedFilters({});
    setPage(1);
  };

  const breadcrumbItems = [
    { label: 'Settings', link: '#' },
    { label: 'Transactions', link: '#' },
  ];

  // Loading State
  if (isLoading) {
    return (
      <FreelancerSettingsLayout
        active="Transactions"
        activeMenu="Transactions"
        breadcrumbItems={breadcrumbItems}
        isKycCheck={true}
      >
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Summary Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Transactions Table Skeleton */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Table Header */}
                <div className="grid grid-cols-5 gap-4 pb-3 border-b">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16 justify-self-end" />
                  <Skeleton className="h-4 w-16 justify-self-end" />
                </div>
                {/* Table Rows */}
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-5 gap-4 py-3 border-b last:border-b-0"
                  >
                    <Skeleton className="h-4 w-24" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-4 w-16 justify-self-end" />
                    <Skeleton className="h-4 w-16 justify-self-end" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </FreelancerSettingsLayout>
    );
  }

  // Error State
  if (isError) {
    return (
      <FreelancerSettingsLayout
        active="Transactions"
        activeMenu="Transactions"
        breadcrumbItems={breadcrumbItems}
        isKycCheck={true}
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Transaction History</h1>
            <p className="text-muted-foreground mt-2">
              View all your connect transactions and balance changes
            </p>
          </div>

          <Card className="border-destructive/20">
            <CardContent className="pt-12 pb-12">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-destructive/10 rounded-full blur-3xl scale-150"></div>
                  <div className="relative p-6 bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-full border border-destructive/20">
                    <Receipt className="h-16 w-16 text-destructive" />
                  </div>
                </div>
                <div className="text-center space-y-3 max-w-md">
                  <h3 className="text-2xl font-semibold tracking-tight">
                    Unable to load transactions
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {(error as Error)?.message ||
                      'Something went wrong while fetching your transaction data. Please try again.'}
                  </p>
                  <Alert className="border-border bg-muted/50">
                    <AlertDescription className="text-sm">
                      This could be due to a network issue or temporary server
                      problem. Your data is safe.
                    </AlertDescription>
                  </Alert>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Button onClick={() => refetch()} className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Try Again
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => window.location.reload()}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                      Refresh Page
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </FreelancerSettingsLayout>
    );
  }

  // Destructure response data correctly
  const transactions = data?.data?.data?.transactions || [];
  const summary = data?.data?.data?.summary || {
    totalCredits: 0,
    totalDebits: 0,
    netChange: 0,
  };
  // If we have a full page of results, there might be more pages
  const hasMorePages = transactions.length === limit;
  const totalPages = hasMorePages ? page + 1 : page;

  // Empty State
  if (transactions.length === 0) {
    return (
      <FreelancerSettingsLayout
        active="Transactions"
        activeMenu="Transactions"
        breadcrumbItems={breadcrumbItems}
        isKycCheck={true}
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Transaction History</h1>
            <p className="text-muted-foreground mt-2">
              View all your connect transactions and balance changes
            </p>
          </div>

          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-150"></div>
                  <div className="relative p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full border border-primary/20">
                    <Wallet className="h-16 w-16 text-primary" />
                  </div>
                </div>
                <div className="text-center space-y-3 max-w-md">
                  <h3 className="text-2xl font-semibold tracking-tight">
                    No transactions yet
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Your transaction history will appear here once you start
                    earning and spending connects. Connects are used for project
                    bids, hiring talent, and other platform activities.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Button variant="outline" className="gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      Learn about Connects
                    </Button>
                    <Button className="gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Start Earning
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </FreelancerSettingsLayout>
    );
  }

  // Success State with Data
  return (
    <FreelancerSettingsLayout
      active="Transactions"
      activeMenu="Transactions"
      breadcrumbItems={breadcrumbItems}
      isKycCheck={true}
    >
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Transaction History
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track your connect transactions and balance changes
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <TransactionFiltersSheet
              isOpen={showFilters}
              onOpenChange={setShowFilters}
              filters={filters}
              onFiltersChange={setFilters}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
              appliedFiltersCount={Object.keys(appliedFilters).length}
            />
            <TransactionExportDropdown transactions={transactions} />
          </div>
        </div>

        {/* Summary Cards */}
        <TransactionSummaryComponent summary={summary} isLoading={isLoading} />

        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-lg">All Transactions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {transactions.length} transaction
                  {transactions.length !== 1 ? 's' : ''}
                  {Object.keys(appliedFilters).length > 0 && ' (filtered)'}
                </p>
              </div>
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                disabled={isFetching}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <TransactionTable transactions={transactions} />
            </ScrollArea>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className={
                          page === 1
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>

                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= page - 1 && pageNum <= page + 1)
                      ) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setPage(pageNum)}
                              isActive={page === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (pageNum === page - 2 || pageNum === page + 2) {
                        return (
                          <PaginationItem key={pageNum}>
                            <span className="px-4">...</span>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        className={
                          page >= totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>

                <p className="text-center text-sm text-muted-foreground mt-2">
                  Showing page {page} of {totalPages}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </FreelancerSettingsLayout>
  );
}
