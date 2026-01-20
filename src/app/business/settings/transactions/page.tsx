'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { Receipt, RefreshCw, Calendar, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import BusinessSettingsLayout from '@/components/layout/BusinessSettingsLayout';
import { RootState } from '@/lib/store';
import { fetchTransactions, TransactionFilters } from '@/services/apiService';
import { TransactionSummaryComponent } from '@/components/transactions/TransactionSummary';
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
            {/* Filters */}
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {Object.keys(appliedFilters).length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      {Object.keys(appliedFilters).length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filter Transactions</SheetTitle>
                  <SheetDescription>
                    Apply filters to narrow down your transaction history
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Search</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Reference or ID..."
                          value={filters.searchQuery || ''}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              searchQuery: e.target.value,
                            }))
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Transaction Type
                      </Label>
                      <Select
                        value={filters.transactionType || 'all'}
                        onValueChange={(value) =>
                          setFilters((prev) => ({
                            ...prev,
                            transactionType: value as
                              | 'credit'
                              | 'debit'
                              | 'all',
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="credit">Credits</SelectItem>
                          <SelectItem value="debit">Debits</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Min Amount</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={filters.minAmount || ''}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            minAmount: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Max Amount</Label>
                      <Input
                        type="number"
                        placeholder="No limit"
                        value={filters.maxAmount || ''}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            maxAmount: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !filters.startDate && 'text-muted-foreground',
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {filters.startDate ? (
                              format(filters.startDate, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={filters.startDate}
                            onSelect={(date: Date | undefined) =>
                              setFilters((prev) => ({
                                ...prev,
                                startDate: date,
                              }))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !filters.endDate && 'text-muted-foreground',
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {filters.endDate ? (
                              format(filters.endDate, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={filters.endDate}
                            onSelect={(date: Date | undefined) =>
                              setFilters((prev) => ({ ...prev, endDate: date }))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleApplyFilters} className="flex-1">
                        Apply Filters
                      </Button>
                      <Button
                        onClick={handleResetFilters}
                        variant="outline"
                        className="flex-1"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <TransactionExportDropdown transactions={transactions} />
          </div>
        </div>

        {/* Summary Cards */}
        <TransactionSummaryComponent summary={summary} isLoading={isLoading} />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Transactions</CardTitle>
            <div className="flex gap-2">
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
            <TransactionTable transactions={transactions} />

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
