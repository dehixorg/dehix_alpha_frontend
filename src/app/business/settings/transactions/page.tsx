'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import {
  Receipt,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Download,
} from 'lucide-react';
import { format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import BusinessSettingsLayout from '@/components/layout/BusinessSettingsLayout';
import { RootState } from '@/lib/store';
import { fetchTransactions, TransactionFilters } from '@/services/apiService';
import { Transaction } from '@/types/transaction';
import { TransactionFiltersComponent } from '@/components/transactions/TransactionFilters';
import { TransactionSummaryComponent } from '@/components/transactions/TransactionSummary';
import { exportTransactionsToCSV } from '@/utils/exportTransactions';

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
    queryKey: ['transactions', 'business', user.uid, page, appliedFilters],
    queryFn: async () => {
      const response = await fetchTransactions(
        user.uid,
        'business',
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

  const handleExportCSV = () => {
    const transactions = data?.data?.data?.transactions || [];
    if (transactions.length > 0) {
      const filename = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      exportTransactionsToCSV(transactions, filename);
    }
  };

  const getTransactionType = (transaction: Transaction): 'credit' | 'debit' => {
    return transaction.amount >= 0 ? 'credit' : 'debit';
  };

  const getTransactionDescription = (transaction: Transaction): string => {
    const ref = transaction.reference?.toLowerCase() || '';

    if (transaction.type === 'payment') {
      if (ref.includes('project')) return 'Project Creation';
      if (ref.includes('hire')) return 'Talent Hiring';
      if (ref.includes('bid')) return 'Bid Placement';
      return 'Payment';
    }

    if (transaction.type === 'referral') {
      return transaction.reference || 'Referral Bonus';
    }

    if (transaction.type === 'rewards') {
      return transaction.reference || 'Reward';
    }

    if (transaction.type === 'streak_reward') {
      return 'Streak Reward';
    }

    if (transaction.type === 'leaderboard_reward') {
      return 'Leaderboard Reward';
    }

    if (transaction.type === 'badge_reward') {
      return 'Badge Reward';
    }

    if (transaction.type === 'system_generated') {
      return transaction.reference || 'System Credit';
    }

    return transaction.reference || 'Transaction';
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const breadcrumbItems = [
    { label: 'Settings', link: '#' },
    { label: 'Transactions', link: '#' },
  ];

  // Loading State
  if (isLoading) {
    return (
      <BusinessSettingsLayout
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

          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-muted animate-pulse rounded"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </BusinessSettingsLayout>
    );
  }

  // Error State
  if (isError) {
    return (
      <BusinessSettingsLayout
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

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Receipt className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-semibold text-lg">
                    Failed to load transactions
                  </p>
                  <p className="text-muted-foreground">
                    {(error as Error)?.message || 'An error occurred'}
                  </p>
                </div>
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </BusinessSettingsLayout>
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
      <BusinessSettingsLayout
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

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Receipt className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-semibold text-lg">No transactions yet</p>
                  <p className="text-muted-foreground">
                    Your connect transactions will appear here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </BusinessSettingsLayout>
    );
  }

  // Success State with Data
  return (
    <BusinessSettingsLayout
      active="Transactions"
      activeMenu="Transactions"
      breadcrumbItems={breadcrumbItems}
      isKycCheck={true}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transaction History</h1>
            <p className="text-muted-foreground mt-2">
              View all your connect transactions and balance changes
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <TransactionFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />
        )}

        {/* Summary Cards */}
        <TransactionSummaryComponent summary={summary} isLoading={isLoading} />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Transactions</CardTitle>
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
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction: Transaction) => {
                    const transactionType = getTransactionType(transaction);
                    const isCredit = transactionType === 'credit';

                    return (
                      <TableRow
                        key={transaction._id}
                        className="hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {getTransactionDescription(transaction)}
                            </p>
                            {transaction.reference_id && (
                              <p className="text-xs text-muted-foreground">
                                Ref: {transaction.reference_id.slice(0, 8)}...
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {isCredit ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <ArrowUpCircle className="h-3 w-3 mr-1" />
                              Credit
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <ArrowDownCircle className="h-3 w-3 mr-1" />
                              Debit
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          <span
                            className={
                              isCredit ? 'text-green-600' : 'text-red-600'
                            }
                          >
                            {isCredit ? '+' : ''}
                            {transaction.amount}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {transaction.balance !== undefined
                            ? transaction.balance
                            : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

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
    </BusinessSettingsLayout>
  );
}
