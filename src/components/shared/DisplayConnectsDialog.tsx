'use client';

import { useCallback, useEffect, useState } from 'react';
import * as React from 'react';
import { Wallet } from 'lucide-react';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

import RequestConnectsDialog from './RequestConnectsDialog';

import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { axiosInstance } from '@/lib/axiosinstance';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TokenRequest {
  _id: string;
  amount: number | string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  [key: string]: any;
}

interface DisplayConnectsDialogProps {
  connects: number;
  userId: string;
}

export const DisplayConnectsDialog = React.forwardRef<
  HTMLButtonElement,
  DisplayConnectsDialogProps
>(({ connects, userId }, ref) => {
  const [filter, setFilter] = useState('ALL');
  const [filteredData, setFilteredData] = useState<TokenRequest[]>([]);
  const [data, setData] = useState<TokenRequest[]>([]);
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

      const newData = response.data.data;
      const currentConnects = parseInt(
        localStorage.getItem('DHX_CONNECTS') || '0',
        10,
      );

      // Get the set of processed request IDs from localStorage
      const processedRequests = new Set(
        JSON.parse(localStorage.getItem('PROCESSED_REQUESTS') || '[]'),
      );

      const newApprovedRequests: TokenRequest[] = [];
      const updatedProcessedRequests = new Set(processedRequests);
      let hasUpdates = false;

      // Process new data
      newData.forEach((newItem: TokenRequest) => {
        // Only process approved requests that haven't been processed yet
        if (
          newItem.status === 'APPROVED' &&
          !processedRequests.has(newItem._id)
        ) {
          newApprovedRequests.push(newItem);
          updatedProcessedRequests.add(newItem._id);
          hasUpdates = true;
        }
      });

      // Update processed requests in localStorage if there are new ones
      if (hasUpdates) {
        localStorage.setItem(
          'PROCESSED_REQUESTS',
          JSON.stringify(Array.from(updatedProcessedRequests)),
        );
      }

      setData(newData);
      setFilteredData(newData);

      if (newApprovedRequests.length === 0) {
        setLoading(false);
        return;
      }

      const totalNewConnects = newApprovedRequests.reduce(
        (sum: number, req: TokenRequest) => sum + Number(req.amount),
        0,
      );

      await Promise.all(
        newApprovedRequests.map(async (request) => {
          try {
            await axiosInstance.put(`/token-request/${request._id}/status`, {
              status: 'APPROVED',
              totalConnects: currentConnects,
            });
          } catch (error) {
            console.error('Error updating token request status:', error);
          }
        }),
      );

      const newTotal = currentConnects + totalNewConnects;
      localStorage.setItem('DHX_CONNECTS', newTotal.toString());

      window.dispatchEvent(
        new CustomEvent('connectsUpdated', { detail: { newTotal } }),
      );
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, data, loading]);

  const handleNewConnectRequest = useCallback((event: Event) => {
    const newConnect = (event as CustomEvent).detail;
    setData((prevData) => {
      const updatedData = [newConnect, ...prevData.slice(0, 2)];
      setFilteredData(updatedData);
      return updatedData;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('newConnectRequest', handleNewConnectRequest);
    return () => {
      window.removeEventListener('newConnectRequest', handleNewConnectRequest);
    };
  }, [handleNewConnectRequest]);

  useEffect(() => {
    if (open) fetchConnectsRequest();
  }, [open, fetchConnectsRequest]);

  useEffect(() => {
    setFilteredData(
      filter === 'ALL' ? data : data.filter((item) => item.status === filter),
    );
  }, [data, filter]);

  const formatDate = (dateString: string) => {
    try {
      // Handle different date string formats
      let date: Date;

      // If it's already a valid date string that can be parsed by Date
      if (dateString) {
        // Try parsing as ISO string first
        date = new Date(dateString);

        // If invalid, try parsing as timestamp
        if (isNaN(date.getTime())) {
          const timestamp = Date.parse(dateString);
          if (!isNaN(timestamp)) {
            date = new Date(timestamp);
          } else {
            // Try parsing as a custom format if needed
            // Example for 'YYYY-MM-DDTHH:mm:ss.SSSZ' format
            const parts = dateString.split(/[-T:.]/);
            if (parts.length >= 6) {
              date = new Date(
                parseInt(parts[0]),
                parseInt(parts[1]) - 1, // months are 0-indexed
                parseInt(parts[2]),
                parts[3] ? parseInt(parts[3]) : 0,
                parts[4] ? parseInt(parts[4]) : 0,
                parts[5] ? parseInt(parts[5]) : 0,
              );
            }
          }
        }
      } else {
        // If no date string is provided, use current date
        date = new Date();
      }

      // If we still don't have a valid date, return a placeholder
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Invalid date';
      }

      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      };

      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          size="icon"
          className="relative rounded-full hover:scale-105 transition-transform ml-auto"
          aria-label={`Connects${connects ? `, ${connects}` : ''}`}
        >
          <Wallet strokeWidth={1.1} className="w-5 h-5" />
          {connects > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[9px] font-bold rounded-full px-2 shadow-md">
              {connects}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[500px] p-0 overflow-hidden rounded-xl shadow-lg"
        align="end"
      >
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center p-3 border-b border-border bg-gradient-to-br from-background/70 to-muted/40">
            <h2 className="text-sm sm:text-base font-semibold">
              Your Connects
            </h2>
            <div className="flex items-center gap-2">
              <Badge className="rounded-md uppercase text-[9px] sm:text-[10px] font-normal dark:bg-muted bg-muted-foreground/30 dark:hover:bg-muted/20 hover:bg-muted-foreground/20 flex items-center gap-1 px-2 py-0.5 text-black dark:text-white">
                {connects} connects
              </Badge>
              <RequestConnectsDialog userId={userId} />
            </div>
          </div>
          <div className="p-4">
            <Tabs value={filter} onValueChange={setFilter} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="ALL">All</TabsTrigger>
                <TabsTrigger value="PENDING">Pending</TabsTrigger>
                <TabsTrigger value="APPROVED">Approved</TabsTrigger>
                <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
              </TabsList>

              <div className="relative overflow-hidden">
                <Table className="min-w-full border-t">
                  <TableHeader className="sticky top-0 z-10 bg-muted/40">
                    <TableRow>
                      <TableHead className="text-center w-1/3 h-10 text-xs">
                        Status
                      </TableHead>
                      <TableHead className="text-center w-1/3 h-10 text-xs">
                        Amount
                      </TableHead>
                      <TableHead className="text-center w-1/3 h-10 text-xs">
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length > 0 ? (
                      filteredData.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs',
                                item.status === 'APPROVED' &&
                                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                                item.status === 'PENDING' &&
                                  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
                                item.status === 'REJECTED' &&
                                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                              )}
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-xs font-medium">
                            {item.amount}
                          </TableCell>
                          <TableCell className="text-center text-xs">
                            {formatDate(item.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-4 text-sm text-muted-foreground"
                        >
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Tabs>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

DisplayConnectsDialog.displayName = 'DisplayConnectsDialog';
