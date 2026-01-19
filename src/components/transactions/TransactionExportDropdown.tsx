'use client';

import { Calendar, Download } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Transaction } from '@/types/transaction';
import { exportTransactionsToCSV } from '@/utils/exportTransactions';

interface TransactionExportDropdownProps {
  transactions: Transaction[];
}

export function TransactionExportDropdown({
  transactions,
}: TransactionExportDropdownProps) {
  const handleExportCSV = () => {
    if (transactions.length > 0) {
      const filename = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      exportTransactionsToCSV(transactions, filename);
    }
  };

  const handleExportCurrentMonth = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthTransactions = transactions.filter(
      (transaction: Transaction) => {
        const transactionDate = new Date(transaction.createdAt);
        return (
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      },
    );

    if (currentMonthTransactions.length > 0) {
      const filename = `transactions_${format(now, 'yyyy-MM')}.csv`;
      exportTransactionsToCSV(currentMonthTransactions, filename);
    } else {
      alert('No transactions found for current month');
    }
  };

  const handleExportCurrentYear = () => {
    const currentYear = new Date().getFullYear();

    const currentYearTransactions = transactions.filter(
      (transaction: Transaction) => {
        const transactionDate = new Date(transaction.createdAt);
        return transactionDate.getFullYear() === currentYear;
      },
    );

    if (currentYearTransactions.length > 0) {
      const filename = `transactions_${currentYear}.csv`;
      exportTransactionsToCSV(currentYearTransactions, filename);
    } else {
      alert('No transactions found for current year');
    }
  };

  const handleExportToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTransactions = transactions.filter(
      (transaction: Transaction) => {
        const transactionDate = new Date(transaction.createdAt);
        return transactionDate >= today && transactionDate < tomorrow;
      },
    );

    if (todayTransactions.length > 0) {
      const filename = `transactions_${format(today, 'yyyy-MM-dd')}.csv`;
      exportTransactionsToCSV(todayTransactions, filename);
    } else {
      alert('No transactions found for today');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export All Transactions
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportToday}>
          <Calendar className="h-4 w-4 mr-2" />
          Export Today&apos;s Transactions
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCurrentMonth}>
          <Calendar className="h-4 w-4 mr-2" />
          Export Current Month
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCurrentYear}>
          <Calendar className="h-4 w-4 mr-2" />
          Export Current Year
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
