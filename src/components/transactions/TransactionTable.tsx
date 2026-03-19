'use client';

import { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Copy, Check } from 'lucide-react';

import {
  getTransactionType,
  getTransactionDescription,
  formatDate,
  formatTransactionDate,
} from './TransactionUtils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Transaction } from '@/types/transaction';
import { notifyError, notifySuccess } from '@/utils/toastMessage';

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const [copiedRefId, setCopiedRefId] = useState<string | null>(null);

  const handleCopyRefId = async (
    referenceId: string,
    transactionId: string,
  ) => {
    try {
      await navigator.clipboard.writeText(referenceId);
      setCopiedRefId(transactionId);
      notifySuccess('Reference ID copied to clipboard.', 'Copied');
      setTimeout(() => setCopiedRefId(null), 1500);
    } catch (error) {
      notifyError('Failed to copy reference ID. Please try again.');
    }
  };

  return (
    <TooltipProvider>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30 sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-[180px]">Date & Time</TableHead>
              <TableHead className="w-[220px]">Description</TableHead>
              <TableHead className="w-[320px]">Ref ID</TableHead>
              <TableHead className="w-[120px]">Type</TableHead>
              <TableHead className="w-[120px] text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction: Transaction) => {
              const transactionType = getTransactionType(transaction);
              const isCredit = transactionType === 'credit';
              const description = getTransactionDescription(transaction);
              const referenceId = transaction.reference_id;

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
                  <TableCell className="w-[220px]">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="font-medium text-sm truncate max-w-[220px] cursor-help">
                          {description}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs break-words">
                        {description}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="w-[320px]">
                    {referenceId ? (
                      <div className="flex items-start gap-2">
                        <p className="text-xs text-muted-foreground font-mono break-all">
                          {referenceId}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() =>
                            handleCopyRefId(referenceId, transaction._id)
                          }
                          aria-label="Copy reference ID"
                        >
                          {copiedRefId === transaction._id ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">-</p>
                    )}
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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
