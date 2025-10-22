'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  FileX,
  Loader2,
  MessageSquareText,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

import { notifyError } from '@/utils/toastMessage';
import { apiHelperService } from '@/services/report';
import { MessagesTab } from '@/components/report-tabs/Messagestab';
import { RootState } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface PastReport {
  id: string;
  subject: string;
  type: string;
  status: 'OPEN' | 'CLOSED' | 'IN_PROGRESS' | 'RESOLVED';
  date: string;
}

export default function PastReportsTab() {
  const [pastReports, setPastReports] = useState<PastReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingReport, setViewingReport] = useState<PastReport | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const user = useSelector((state: RootState) => state.user);

  const fetchReports = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const res = await apiHelperService.getReportsByUser(user.uid, {
        page: String(page),
        limit: String(limit),
      });

      const transformed = (res.data?.data || []).map((r: any) => ({
        id: r._id,
        subject: r.subject,
        type: r.report_type || 'GENERAL',
        status: r.status || 'OPEN',
        date: r.createdAt,
      }));

      setPastReports(transformed);
      setTotalCount(res.data?.total || transformed.length);
    } catch (error) {
      notifyError('Failed to fetch past reports.', 'Error');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, page, limit]);

  useEffect(() => {
    if (!viewingReport && user?.uid) {
      fetchReports();
    }
  }, [fetchReports, viewingReport, user?.uid]);

  const handleViewMessages = async (report: PastReport) => {
    setViewingReport(report);
    setMessagesLoading(true);
    try {
      const res = await apiHelperService.getSingleReport(report.id);
      setMessages(res.data?.data?.messages || []);
    } catch {
      notifyError('Failed to fetch messages.', 'Error');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setViewingReport(null);
    setMessages([]);
  };

  const [totalCount, setTotalCount] = useState(0);
  const hasNextPage = pastReports.length === limit;

  // Status badge component
  const StatusBadge = ({
    status,
  }: {
    status: 'OPEN' | 'CLOSED' | 'IN_PROGRESS' | 'RESOLVED' | string;
  }) => {
    const statusMap: Record<
      string,
      {
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        label: string;
      }
    > = {
      OPEN: { variant: 'default', label: 'Open' },
      IN_PROGRESS: { variant: 'secondary', label: 'In Progress' },
      RESOLVED: { variant: 'outline', label: 'Resolved' },
      CLOSED: { variant: 'outline', label: 'Closed' },
    };

    const statusInfo = statusMap[status] || {
      variant: 'outline' as const,
      label: status,
    };

    return (
      <Badge variant={statusInfo.variant} className="text-xs">
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="bg-transparent text-foreground px-4">
      <div className="w-full">
        <Card className="w-full">
          <CardContent className="p-0">
            <AnimatePresence mode="wait">
              <Dialog
                open={!!viewingReport}
                onOpenChange={(open) => !open && handleCloseDialog()}
              >
                <DialogContent className="w-full max-w-lg sm:max-w-3xl md:max-w-5xl sm:w-[90vw] p-0 overflow-hidden">
                  <DialogHeader className="px-6 pt-6 pb-2 border-b">
                    <div className="flex justify-between items-center">
                      <DialogTitle className="text-2xl font-bold">
                        {viewingReport?.subject}
                      </DialogTitle>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <MessageSquareText className="h-4 w-4" />
                        <span>{messages.length} messages</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {viewingReport &&
                            format(new Date(viewingReport.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <StatusBadge status={viewingReport?.status || 'OPEN'} />
                    </div>
                  </DialogHeader>

                  <ScrollArea className="flex-1 p-6">
                    {messagesLoading ? (
                      <div className="flex flex-col items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">
                          Loading conversation...
                        </p>
                      </div>
                    ) : messages.length > 0 ? (
                      <MessagesTab
                        id={viewingReport?.id || ''}
                        reportStatus={viewingReport?.status || 'OPEN'}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                        <AlertCircle className="h-12 w-12 text-muted-foreground/40" />
                        <div>
                          <h3 className="text-lg font-medium">
                            No messages yet
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Start the conversation by sending a message
                          </p>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              <motion.div
                key="reports"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center p-12 space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground">
                        Loading reports...
                      </p>
                    </div>
                  ) : pastReports.length > 0 ? (
                    <>
                      {/* Desktop / Tablet: table view */}
                      <div className="hidden sm:block overflow-hidden border-none rounded-lg">
                        <table className="min-w-full divide-y divide-border">
                          <thead className="bg-muted/30">
                            <tr>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                              >
                                Subject
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                              >
                                Type
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                              >
                                Status
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                              >
                                Date
                              </th>
                              <th
                                scope="col"
                                className="relative px-4 py-3 w-32"
                              >
                                <span className="sr-only">Actions</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-card divide-y divide-border">
                            {pastReports.map((report) => (
                              <tr
                                key={report.id}
                                className="hover:bg-muted/10 transition-colors cursor-pointer"
                                onClick={() => handleViewMessages(report)}
                              >
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center space-x-3">
                                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <div className="text-sm font-medium text-foreground line-clamp-1">
                                      {report.subject}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm text-muted-foreground">
                                    {report.type.replace(/_/g, ' ')}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <StatusBadge status={report.status} />
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                                  {new Date(report.date).toLocaleDateString(
                                    'en-US',
                                    {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    },
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewMessages(report);
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile: stacked list view */}
                      <div className="sm:hidden space-y-3">
                        {pastReports.map((report) => (
                          <div
                            key={report.id}
                            className="bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition cursor-pointer"
                            onClick={() => handleViewMessages(report)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-foreground line-clamp-2">
                                    {report.subject}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {report.type.replace(/_/g, ' ')} •{' '}
                                    <span className="align-middle">
                                      {new Date(report.date).toLocaleDateString(
                                        'en-US',
                                        {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                        },
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                <div>
                                  <StatusBadge status={report.status} />
                                </div>
                                <div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewMessages(report);
                                    }}
                                  >
                                    View
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-muted/10 border-t">
                        <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
                          Showing {pastReports.length} of {totalCount} reports
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPage((p) => Math.max(1, p - 1))}
                              disabled={page === 1}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center justify-center w-8 h-8 text-sm font-medium">
                              {page}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPage((p) => p + 1)}
                              disabled={!hasNextPage}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                          <Select
                            value={limit.toString()}
                            onValueChange={(value) => {
                              setLimit(parseInt(value));
                              setPage(1);
                            }}
                          >
                            <SelectTrigger className="h-8 w-[100px]">
                              <SelectValue placeholder="Rows" />
                            </SelectTrigger>
                            <SelectContent>
                              {[5, 10, 20, 50].map((size) => (
                                <SelectItem key={size} value={size.toString()}>
                                  {size} / page
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center">
                      <FileX className="h-12 w-12 text-muted-foreground/40" />
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium">
                          No reports found
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          You haven&lsquo;t created any reports yet.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
