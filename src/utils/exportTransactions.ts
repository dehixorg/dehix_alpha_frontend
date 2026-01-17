import { Transaction } from '@/types/transaction';
import { format } from 'date-fns';

export const exportTransactionsToCSV = (
  transactions: Transaction[],
  filename: string = 'transactions.csv',
) => {
  if (transactions.length === 0) {
    alert('No transactions to export');
    return;
  }

  // Define CSV headers
  const headers = [
    'Date',
    'Type',
    'Amount',
    'Balance',
    'From',
    'To',
    'Reference',
    'Description',
    'Reference ID',
    'Status',
  ];

  // Convert transactions to CSV rows
  const rows = transactions.map((transaction) => {
    return [
      format(new Date(transaction.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      transaction.type,
      transaction.amount.toString(),
      transaction.balance?.toString() || '',
      transaction.from || '',
      transaction.to || '',
      transaction.reference || '',
      transaction.description || '',
      transaction.reference_id || '',
      transaction.status || '',
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Escape commas and quotes in cell content
          const escaped = cell.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(','),
    ),
  ].join('\n');

  // Create a blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
