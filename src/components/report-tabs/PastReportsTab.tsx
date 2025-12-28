'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
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
  Image as ImageIconLucide,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

import { notifyError } from '@/utils/toastMessage';
import { apiHelperService } from '@/services/report';
import { RootState } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import EmptyState from '@/components/shared/EmptyState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PastReport {
  id: string;
  subject: string;
  type: string;
  status: 'OPEN' | 'CLOSED' | 'IN_PROGRESS' | 'RESOLVED';
  date: string;
}

interface ReportDetails {
  description: string;
  screenshots: string[];
}

// Messages Section Component (embedded in same file)
const MessagesSection = ({
  id,
  reportStatus,
}: {
  id: string;
  reportStatus: string;
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const isDisabled =
    reportStatus === 'CLOSED' || reportStatus === 'RESOLVED' || sending;

  const fetchMessages = async () => {
    try {
      const res = await apiHelperService.getSingleReport(id);
      setMessages(res.data?.data?.messages || []);
    } catch {
      notifyError('Failed to fetch messages.', 'Error');
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await apiHelperService.sendMessageToReport(id, { sender: 'user', text });
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text, createdAt: new Date().toISOString() },
      ]);
      setText('');
      setTimeout(() => inputRef.current?.focus(), 0);
    } catch {
      notifyError('Failed to send message.', 'Error');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 bg-[hsl(var(--background))]">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No messages yet
              </p>
            )}

            {messages.map((m, i) => {
              const isMe = m.sender === 'user';
              return (
                <div
                  key={i}
                  className={isMe ? 'flex w-full justify-end' : 'flex w-full justify-start'}
                >
                  <div
                    className={
                      isMe
                        ? 'max-w-[85%] rounded-2xl rounded-tr-md bg-primary px-4 py-2 text-sm text-primary-foreground shadow-sm'
                        : 'max-w-[85%] rounded-2xl rounded-tl-md border bg-muted px-4 py-2 text-sm text-foreground shadow-sm'
                    }
                  >
                    <div className="text-[11px] font-medium opacity-80 mb-1">
                      {isMe ? 'you' : 'admin'}
                    </div>
                    <div className="whitespace-pre-wrap break-words">{m.text}</div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
        <div className="flex items-center gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isDisabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isDisabled) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="flex-1 rounded-full disabled:opacity-60"
            placeholder={isDisabled ? 'Messaging disabled' : 'Type a message...'}
            ref={inputRef}
          />
          <Button
            onClick={sendMessage}
            disabled={isDisabled || text.trim().length === 0}
            className="rounded-full disabled:opacity-50"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function PastReportsTab() {
  const [pastReports, setPastReports] = useState<PastReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingReport, setViewingReport] = useState<PastReport | null>(null);
  const [reportDetails, setReportDetails] = useState<ReportDetails | null>(
    null,
  );
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    setDetailsLoading(true);
    try {
      const res = await apiHelperService.getSingleReport(report.id);
      const data = res.data?.data;
      // Map imageMeta array to screenshots array by extracting Location URLs
      const screenshots = (data?.imageMeta || []).map(
        (img: any) => img.Location,
      );
      setReportDetails({
        description: data?.description || '',
        screenshots: screenshots,
      });
    } catch {
      notifyError('Failed to fetch report details.', 'Error');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setViewingReport(null);
    setReportDetails(null);
    setSelectedImage(null);
  };

  const hasNextPage = pastReports.length === limit;

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
    <div className="w-full">
      <AnimatePresence mode="wait">
        {/* Split Dialog */}
        {viewingReport && (
          <Dialog
            open={!!viewingReport}
            onOpenChange={(open) => !open && handleCloseDialog()}
          >
            <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col gap-0">
              {/* Header */}
              <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                      <span className="line-clamp-1">
                        {viewingReport.subject}
                      </span>
                    </DialogTitle>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(viewingReport.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <StatusBadge status={viewingReport.status} />
                    </div>
                  </div>
                </div>
              </DialogHeader>

              {/* Split Content Area */}
              <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Left Side: Report Details (1/3) */}
                <div className="w-1/3 border-r overflow-y-auto bg-muted/30 dark:bg-muted/20">
                  <ScrollArea className="h-full">
                    <div className="p-6 space-y-6">
                      {detailsLoading ? (
                        <div className="flex items-center justify-center h-64">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : (
                        <>
                          {/* Description */}
                          <div>
                            <h3 className="text-sm font-semibold text-foreground mb-2">
                              Description
                            </h3>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {reportDetails?.description ||
                                'No description provided'}
                            </p>
                          </div>

                          {/* Screenshots */}
                          {reportDetails?.screenshots &&
                            reportDetails.screenshots.length > 0 && (
                              <div>
                                <h3 className="text-sm font-semibold text-foreground mb-3">
                                  Screenshots (
                                  {reportDetails.screenshots.length})
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                  {reportDetails.screenshots.map(
                                    (screenshot, idx) => (
                                      <div
                                        key={idx}
                                        className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition group border"
                                        onClick={() =>
                                          setSelectedImage(screenshot)
                                        }
                                      >
                                        <Image
                                          src={screenshot}
                                          alt={`Screenshot ${idx + 1}`}
                                          width={100}
                                          height={100}
                                          className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                                          <ImageIconLucide className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition" />
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Type */}
                          <div>
                            <h3 className="text-sm font-semibold text-foreground mb-2">
                              Type
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {viewingReport.type.replace(/_/g, ' ')}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Right Side: Chat (2/3) */}
                <div className="w-2/3 flex flex-col bg-background">
                  <div className="px-6 py-3 bg-muted/20 border-b flex-shrink-0">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <MessageSquareText className="h-5 w-5" />
                      Conversation
                    </h3>
                  </div>
                  <div className="flex-1 min-h-0">
                    <MessagesSection
                      id={viewingReport.id}
                      reportStatus={viewingReport.status}
                    />
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Image Full Screen Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-8"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-8 w-8" />
            </button>
            <Image
              src={selectedImage}
              alt="Full size"
              width={100}
              height={100}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}

        {/* Reports List */}
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
                <p className="text-muted-foreground">Loading reports...</p>
              </div>
            ) : pastReports.length > 0 ? (
              <>
                {/* Desktop / Tablet: table view */}
                <div className="hidden sm:block overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead>Subject</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right w-32">
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pastReports.map((report) => (
                        <TableRow
                          key={report.id}
                          className="hover:bg-muted/10 transition-colors"
                        >
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                              <div className="text-sm font-medium text-foreground line-clamp-1">
                                {report.subject}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm text-muted-foreground">
                              {report.type.replace(/_/g, ' ')}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <StatusBadge status={report.status} />
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {new Date(report.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right">
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile: stacked list view */}
                <div className="sm:hidden space-y-3 p-4">
                  {pastReports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition"
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
                          <StatusBadge status={report.status} />
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
                  ))}
                </div>

                {/* Pagination */}
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
              <div className="p-6">
                <EmptyState
                  title="No reports found"
                  description="You haven't created any reports yet. When you submit one, it will appear here with its status and conversation."
                  icon={<FileX className="h-12 w-12 text-muted-foreground" />}
                  className="border-0 bg-transparent py-10"
                />
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
