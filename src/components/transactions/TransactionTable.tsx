'use client';

import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

import {
  getTransactionType,
  getTransactionDescription,
  formatDate,
  formatTransactionDate,
} from './TransactionUtils';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Transaction } from '@/types/transaction';

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/30 sticky top-0 z-10">
          <TableRow>
            <TableHead className="w-[180px]">Date & Time</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[120px]">Type</TableHead>
            <TableHead className="w-[120px] text-right">Amount</TableHead>
            <TableHead className="w-[120px] text-right">Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction: Transaction) => {
            const transactionType = getTransactionType(transaction);
            const isCredit = transactionType === 'credit';

            return (
              <TableRow
                key={transaction._id}
                className="hover:bg-muted/50 transition-colors duration-150 border-b border-border/50"
              >
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <p className="text-sm">
                      {formatDate(transaction.createdAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTransactionDate(transaction.createdAt)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-sm">
                      {getTransactionDescription(transaction)}
                    </p>
                    {transaction.reference_id && (
                      <p className="text-xs text-muted-foreground font-mono">
                        Ref: {transaction.reference_id.slice(0, 8)}...
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {isCredit ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 gap-1">
                      <ArrowUpCircle className="h-3 w-3" />
                      Credit
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <ArrowDownCircle className="h-3 w-3" />
                      Debit
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div
                    className={`font-semibold text-sm ${
                      isCredit ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {isCredit ? '+' : ''}
                    {transaction.amount}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-mono text-sm">
                    {transaction.balance !== undefined
                      ? transaction.balance
                      : '-'}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
