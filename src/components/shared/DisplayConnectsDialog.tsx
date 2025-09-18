'use client';

import { useCallback, useEffect, useState } from 'react';
import { Wallet, ListFilter } from 'lucide-react';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ScrollArea } from '../ui/scroll-area';

import { axiosInstance } from '@/lib/axiosinstance';
import { getBadgeColor } from '@/utils/common/getBadgeStatus';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const DisplayConnectsDialog = ({ connects, userId }: any) => {
  const [filter, setFilter] = useState('ALL');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchConnectsRequest = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/token-request/user/${userId}`,
        {
          params: { latestConnects: true },
        },
      );
      setData(response.data.data);
      setFilteredData(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, loading]);

  const handleNewConnectRequest = (event: Event) => {
    const newConnect = (event as CustomEvent).detail;
    setData((prevData) => {
      const updatedData = [newConnect, ...prevData.slice(0, 2)];
      setFilteredData(updatedData);
      return updatedData;
    });
  };

  useEffect(() => {
    window.addEventListener('newConnectRequest', handleNewConnectRequest);
    return () => {
      window.removeEventListener('newConnectRequest', handleNewConnectRequest);
    };
  }, []);

  useEffect(() => {
    if (open) fetchConnectsRequest();
  }, [open, fetchConnectsRequest]);

  useEffect(() => {
    setFilteredData(() =>
      filter === 'ALL'
        ? data ?? []
        : (data ?? []).filter((item: any) => item.status === filter),
    );
  }, [data, filter]);

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

  const filterOptions = [
    { key: 'ALL', label: 'All' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'REJECTED', label: 'Rejected' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full hover:scale-105 transition-transform"
        >
          <Wallet strokeWidth={1.1} className="w-5 h-5" />
          {connects >= 0 && (
            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[9px] font-bold rounded-full px-2 shadow-md">
              {connects}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Connects Request History</h2>
        <div className="flex items-center gap-4 mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 w-auto text-sm"
              >
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-40">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filterOptions.map(({ key, label }) => (
                <DropdownMenuCheckboxItem
                  className="py-1"
                  key={key}
                  checked={filter === key}
                  onSelect={() => handleFilterChange(key)}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="relative overflow-hidden">
          <Table className="min-w-full border rounded-lg shadow-lg">
            <TableHeader className="sticky top-0 z-10 bg-muted/40">
              <TableRow className="text-center">
                <TableHead className="text-center w-1/3">Connects</TableHead>
                <TableHead className="text-center w-1/3">Status</TableHead>
                <TableHead className="text-center w-1/3">Date</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
          <ScrollArea className="max-h-[300px] no-scrollbar pb-10 overflow-y-auto">
            <Table className="min-w-full">
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, idx) => (
                    <TableRow key={idx} className="text-center">
                      <TableCell className="font-semibold text-center w-1/3">
                        {item.amount}
                      </TableCell>
                      <TableCell className="text-center w-1/3">
                        <Badge className={getBadgeColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center w-1/3">
                        {formatDate(item.dateTime)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center font-semibold text-gray-500"
                    >
                      No Transactions Found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisplayConnectsDialog;
