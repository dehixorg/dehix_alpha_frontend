'use client';

import { useCallback, useEffect, useState } from 'react';
import * as React from 'react';
import {
  Wallet,
  Zap,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

import RequestConnectsDialog from './RequestConnectsDialog';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
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

interface DisplayConnectsDialogProps {
  connects: number;
  userId: string;
}

export const DisplayConnectsDialog = React.forwardRef<
  HTMLButtonElement,
  DisplayConnectsDialogProps
>(({ connects, userId }, ref) => {
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
  }, [open]);

  useEffect(() => {
    setFilteredData(() =>
      filter === 'ALL'
        ? (data ?? [])
        : (data ?? []).filter((item: any) => item.status === filter),
    );
  }, [data, filter]);

  // tabs will set filter via onValueChange

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const statusMap = {
      APPROVED: {
        text: 'Approved',
        icon: <CheckCircle className="h-3.5 w-3.5 mr-1.5" />,
        className:
          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      },
      PENDING: {
        text: 'Pending',
        icon: <Clock className="h-3.5 w-3.5 mr-1.5" />,
        className:
          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      },
      REJECTED: {
        text: 'Rejected',
        icon: <XCircle className="h-3.5 w-3.5 mr-1.5" />,
        className:
          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      text: status,
      className: '',
    };

    return (
      <Badge
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}
      >
        {statusInfo.icon}
        {statusInfo.text}
      </Badge>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          size="sm"
          className="relative h-9 rounded-full pl-3 pr-2 gap-1.5 border-amber-200/50 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/30 dark:hover:text-amber-200"
          aria-label={`Connects${connects ? `, ${connects}` : ''}`}
        >
          <Zap className="h-3.5 w-3.5" strokeWidth={2.2} />
          <span className="font-medium">{connects}</span>
          <span className="h-5 w-5 flex items-center justify-center text-[10px] font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
            {filteredData.length}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[min(92vw,420px)] rounded-xl shadow-xl border border-border/50 overflow-hidden"
        align="end"
        sideOffset={8}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 pb-2 border-b bg-gradient">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Connects</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your connect requests
                </p>
              </div>
              <div className="flex items-center gap-2">
                <RequestConnectsDialog userId={userId} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 pt-2">
            <Tabs value={filter} onValueChange={setFilter} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-muted/30 h-9">
                <TabsTrigger value="ALL" className="text-xs py-1">
                  All
                </TabsTrigger>
                <TabsTrigger value="APPROVED" className="text-xs py-1">
                  Approved
                </TabsTrigger>
                <TabsTrigger value="PENDING" className="text-xs py-1">
                  Pending
                </TabsTrigger>
                <TabsTrigger value="REJECTED" className="text-xs py-1">
                  Rejected
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Table */}
          <div className="relative">
            <ScrollArea className="h-[280px] w-full">
              <Table className="min-w-full">
                <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <TableRow className="h-9">
                    <TableHead className="w-[120px] text-xs font-medium text-muted-foreground">
                      Connects
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-right text-xs font-medium text-muted-foreground">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-10 mx-auto" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20 mx-auto" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredData.length > 0 ? (
                    filteredData.map((item, idx) => (
                      <TableRow
                        key={idx}
                        className="group h-11 hover:bg-muted/40"
                      >
                        <TableCell className="font-medium text-sm text-center">
                          <span className="inline-flex items-center justify-center h-6 px-2.5 rounded-full bg-primary/10 text-primary font-semibold">
                            {item.amount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <StatusBadge status={item.status} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-40 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                          <Wallet className="h-8 w-8 opacity-40" />
                          <p className="text-sm font-medium">
                            No connect requests found
                          </p>
                          <p className="text-xs">
                            {filter === 'ALL'
                              ? 'You have no connect requests yet.'
                              : `No ${filter.toLowerCase()} connect requests.`}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {/* Footer */}
          <div className="p-3 border-t bg-muted/20 flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              Showing {filteredData.length} of {data.length} requests
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={fetchConnectsRequest}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Refreshing...
                </>
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

DisplayConnectsDialog.displayName = 'DisplayConnectsDialog';

export default DisplayConnectsDialog;
