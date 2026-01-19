'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionSummary } from '@/types/transaction';

interface TransactionSummaryProps {
  summary: TransactionSummary;
  isLoading?: boolean;
}

export const TransactionSummaryComponent: React.FC<TransactionSummaryProps> = ({
  summary,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-8 w-8 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-24 mb-2"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total Credits */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Credits
          </CardTitle>
          <TrendingUp className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            +{summary.totalCredits.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Incoming transactions
          </p>
        </CardContent>
      </Card>

      {/* Total Debits */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Debits
          </CardTitle>
          <TrendingDown className="h-5 w-5 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            -{summary.totalDebits.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Outgoing transactions
          </p>
        </CardContent>
      </Card>

      {/* Net Change */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Net Change
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              summary.netChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {summary.netChange >= 0 ? '+' : ''}
            {summary.netChange.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.netChange >= 0 ? 'Positive balance' : 'Negative balance'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
