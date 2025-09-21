import React, { useState, useEffect } from 'react';
import { ListFilter, Activity } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  status: 'PENDING' | 'REJECTED' | 'ACCEPTED' | 'COMPLETED';
  dateTime: string;
  type: 'SEND' | 'RECEIVE' | 'SWAP' | 'STAKE';
  hash?: string;
}

interface DisplayConnectsDialogProps {
  userId: string;
  connects: number;
  className?: string;
}

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: 50.50,
    status: 'COMPLETED',
    dateTime: '2024-03-15T10:30:00Z',
    type: 'RECEIVE',
    hash: '0x1234...abcd'
  },
  {
    id: '2',
    amount: 10.00,
    status: 'PENDING',
    dateTime: '2024-03-14T14:20:00Z',
    type: 'SEND',
    hash: '0x5678...efgh'
  },
  {
    id: '3',
    amount: 75.25,
    status: 'COMPLETED',
    dateTime: '2024-03-13T09:15:00Z',
    type: 'SWAP',
    hash: '0x9abc...ijkl'
  },
  {
    id: '4',
    amount: 20.00,
    status: 'ACCEPTED',
    dateTime: '2024-03-12T16:45:00Z',
    type: 'STAKE',
    hash: '0xdef0...mnop'
  },
  {
    id: '5',
    amount: 25.75,
    status: 'REJECTED',
    dateTime: '2024-03-11T11:30:00Z',
    type: 'SEND',
    hash: '0x1357...qrst'
  },
  {
    id: '6',
    amount: 15.00,
    status: 'COMPLETED',
    dateTime: '2024-03-10T13:20:00Z',
    type: 'RECEIVE',
    hash: '0x2468...uvwx'
  }
];

const DisplayConnectsDialog: React.FC<DisplayConnectsDialogProps> = ({ userId, connects, className = '' }) => {
  const [filter, setFilter] = useState('ALL');
  const [filteredData, setFilteredData] = useState<Transaction[]>(mockTransactions);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setFilteredData(() =>
      filter === 'ALL'
        ? mockTransactions
        : mockTransactions.filter((item) => item.status === filter)
    );
  }, [filter]);

  const handleFilterChange = (value: string) => {
    setFilter(value);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-900 text-green-300 border-green-700';
      case 'PENDING':
        return 'bg-yellow-900 text-yellow-300 border-yellow-700';
      case 'REJECTED':
        return 'bg-red-900 text-red-300 border-red-700';
      case 'ACCEPTED':
        return 'bg-blue-900 text-blue-300 border-blue-700';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-600';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'RECEIVE':
        return 'text-green-400';
      case 'SEND':
        return 'text-red-400';
      case 'SWAP':
        return 'text-blue-400';
      case 'STAKE':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  const filterOptions = [
    { key: 'ALL', label: 'All' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'REJECTED', label: 'Rejected' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`relative flex items-center justify-center cursor-pointer hover:scale-105 transition-transform p-2 rounded-lg hover:bg-gray-800 ${className}`}
      >
        <Activity size={20} className="text-gray-300" />
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
          {connects}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-4xl max-h-[80vh] w-full mx-4 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Transaction History</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800"
            >
              ×
            </button>
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="appearance-none bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {filterOptions.map(({ key, label }) => (
                  <option key={key} value={key} className="bg-gray-800">
                    {label}
                  </option>
                ))}
              </select>
              <ListFilter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="overflow-auto max-h-[500px]">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-300">Type</th>
                  <th className="text-center py-3 px-6 font-medium text-gray-300">Amount</th>
                  <th className="text-center py-3 px-6 font-medium text-gray-300">Status</th>
                  <th className="text-center py-3 px-6 font-medium text-gray-300">Date</th>
                  <th className="text-center py-3 px-6 font-medium text-gray-300">Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredData.length > 0 ? (
                  filteredData.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-800">
                      <td className="py-4 px-6">
                        <span className={`font-medium ${getTypeColor(transaction.type)}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-semibold text-white">
                        {transaction.amount.toFixed(2)} DXUT
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-gray-400">
                        {formatDate(transaction.dateTime)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-mono text-sm text-gray-400">
                          {transaction.hash}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center font-semibold text-gray-400">
                      No Transactions Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayConnectsDialog;