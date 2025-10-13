'use client';

import { useCallback, useEffect, useState } from 'react';
import * as React from 'react';
import { Wallet } from 'lucide-react';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { axiosInstance } from '@/lib/axiosinstance';
import { statusOutlineClasses } from '@/utils/common/getBadgeStatus';
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
  }, [open, fetchConnectsRequest]);

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
      <PopoverContent className="p-0 overflow-hidden rounded-xl shadow-lg w-[min(92vw,420px)]">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-3 border-b border-border bg-gradient-to-br from-background/70 to-muted/40">
            <h2 className="text-sm sm:text-base font-semibold">Connects</h2>
            <Badge className="rounded-md uppercase text-[9px] sm:text-[10px] font-normal dark:bg-muted bg-muted-foreground/30 dark:hover:bg-muted/20 hover:bg-muted-foreground/20 flex items-center px-2 py-0.5 text-black dark:text-white">
              {filteredData.length} total
            </Badge>
          </div>

          {/* Tabs Controls */}
          <div className="p-2">
            <Tabs
              value={filter}
              onValueChange={(v) => setFilter(v)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 bg-transparent h-10 p-0">
                <TabsTrigger
                  value="ALL"
                  className="relative h-10 px-3 rounded-none text-xs flex items-center gap-1.5 text-muted-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="APPROVED"
                  className="relative h-10 px-3 rounded-none text-xs flex items-center gap-1.5 text-green-600 dark:text-green-500 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-500 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:bg-transparent"
                >
                  Approved
                </TabsTrigger>
                <TabsTrigger
                  value="PENDING"
                  className="relative h-10 px-3 rounded-none text-xs flex items-center gap-1.5 text-amber-600 dark:text-amber-400 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:bg-transparent"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  value="REJECTED"
                  className="relative h-10 px-3 rounded-none text-xs flex items-center gap-1.5 text-red-600 dark:text-red-500 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-500 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-500 data-[state=active]:bg-transparent"
                >
                  Rejected
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Table */}
          <div className="relative overflow-hidden">
            <Table className="min-w-full border-t">
              <TableHeader className="sticky top-0 z-10 bg-muted/40">
                <TableRow className="text-center">
                  <TableHead className="text-center w-1/3 h-10 text-xs">
                    Connects
                  </TableHead>
                  <TableHead className="text-center w-1/3 h-10 text-xs">
                    Status
                  </TableHead>
                  <TableHead className="text-center w-1/3 h-10 text-xs">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
            </Table>
            <ScrollArea className="max-h-[240px] no-scrollbar pb-1 overflow-y-auto">
              <Table className="min-w-full">
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, idx) => (
                      <TableRow
                        key={idx}
                        className="text-center hover:bg-muted/40"
                      >
                        <TableCell className="font-medium text-center w-1/3 text-xs">
                          {item.amount}
                        </TableCell>
                        <TableCell className="text-center w-1/3">
                          <Badge
                            className={`${statusOutlineClasses(item.status)}`}
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center w-1/3 text-[11px]">
                          {formatDate(item.dateTime)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="p-5">
                        <div className="text-center space-y-2">
                          <div className="mx-auto w-16 h-16">
                            <svg
                              viewBox="0 0 200 200"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-full h-full"
                              aria-hidden="true"
                            >
                              <defs>
                                <linearGradient
                                  id="grad2"
                                  x1="0"
                                  y1="0"
                                  x2="1"
                                  y2="1"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor="hsl(var(--primary))"
                                    stopOpacity="0.25"
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor="hsl(var(--primary))"
                                    stopOpacity="0.05"
                                  />
                                </linearGradient>
                              </defs>
                              <circle
                                cx="100"
                                cy="100"
                                r="80"
                                fill="url(#grad2)"
                              />
                              <g fill="hsl(var(--primary))" opacity="0.25">
                                <rect
                                  x="70"
                                  y="70"
                                  width="60"
                                  height="40"
                                  rx="8"
                                />
                                <circle cx="140" cy="70" r="6" />
                                <circle cx="60" cy="110" r="4" />
                              </g>
                            </svg>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            No transactions found
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

DisplayConnectsDialog.displayName = 'DisplayConnectsDialog';
