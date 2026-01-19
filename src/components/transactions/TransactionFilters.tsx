'use client';

import React from 'react';
import { Calendar, Search, Filter, X } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  transactionType?: 'credit' | 'debit' | 'all';
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onApply: () => void;
  onReset: () => void;
}

export const TransactionFiltersComponent: React.FC<TransactionFiltersProps> = ({
  filters,
  onFiltersChange,
  onApply,
  onReset,
}) => {
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined,
  );

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Label>Start Date</Label>
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
                onSelect={(date) =>
                  onFiltersChange({ ...filters, startDate: date })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
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
                onSelect={(date) =>
                  onFiltersChange({ ...filters, endDate: date })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Transaction Type */}
        <div className="space-y-2">
          <Label>Transaction Type</Label>
          <Select
            value={filters.transactionType || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                transactionType: value as 'credit' | 'debit' | 'all',
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="credit">Credits Only</SelectItem>
              <SelectItem value="debit">Debits Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Amount Range */}
        <div className="space-y-2">
          <Label>Min Amount</Label>
          <Input
            type="number"
            placeholder="0"
            value={filters.minAmount || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                minAmount: e.target.value
                  ? parseFloat(e.target.value)
                  : undefined,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Max Amount</Label>
          <Input
            type="number"
            placeholder="No limit"
            value={filters.maxAmount || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                maxAmount: e.target.value
                  ? parseFloat(e.target.value)
                  : undefined,
              })
            }
          />
        </div>

        {/* Search Query */}
        <div className="space-y-2">
          <Label>Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Reference or ID..."
              value={filters.searchQuery || ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, searchQuery: e.target.value })
              }
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button onClick={onApply} className="w-full md:w-auto">
          Apply Filters
        </Button>
      </div>
    </div>
  );
};
