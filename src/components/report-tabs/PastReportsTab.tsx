'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';

import { toast } from '@/components/ui/use-toast';
import { apiHelperService } from '@/services/report';
import { MessagesTab } from '@/components/report-tabs/Messagestab';
import { RootState } from '@/lib/store';

// NOTE: It's good practice to import and use shadcn/ui components
// like Button, Table, Select etc. directly for better consistency and accessibility.
// For this example, we'll stick to updating class names.

interface PastReport {
  id: string;
  subject: string;
  status: 'OPEN' | 'CLOSED' | 'IN_PROGRESS';
  date: string;
}

export default function PastReportsTab() {
  const [pastReports, setPastReports] = useState<PastReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingReport, setViewingReport] = useState<null | PastReport>(null);
  const [, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const user = useSelector((state: RootState) => state.user);

  const fetchReports = async () => {
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
        status: r.status || 'OPEN',
        date: r.createdAt,
      }));

      setPastReports(transformed);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch past reports.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!viewingReport && user?.uid) {
      fetchReports();
    }
  });

  const handleViewMessages = async (report: PastReport) => {
    setMessagesLoading(true);
    try {
      const res = await apiHelperService.getSingleReport(report.id);
      setMessages(res.data?.data?.messages || []);
      setViewingReport(report);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch messages.',
        variant: 'destructive',
      });
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleBack = () => {
    setViewingReport(null);
    setMessages([]);
  };

  const hasNextPage = pastReports.length === limit;

  return (
    // The parent already correctly uses bg-background and text-foreground. Good!
    <main className="min-h-screen bg-background text-foreground px-4">
      <div className="w-full">
        {/* CHANGE 1: Swapped `bg-white` for `bg-card` and added `text-card-foreground` for card-specific text. */}
        <div className="w-full flex flex-col rounded-md p-6 bg-card text-card-foreground shadow-sm">
          <AnimatePresence mode="wait">
            {viewingReport ? (
              <motion.div
                key="messages"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                <div className="relative mb-6">
                  {/* CHANGE 2: Replaced hardcoded blue button with primary theme colors. */}
                  <button
                    onClick={handleBack}
                    className="absolute left-0 px-4 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold shadow"
                    aria-label="Back to reports"
                  >
                    ← Back
                  </button>

                  {/* CHANGE 3: Replaced `text-gray-800` and `text-blue-600` with theme-aware colors. */}
                  <h2 className="text-center text-lg sm:text-2xl font-bold text-foreground">
                    <span className="text-primary">
                      {viewingReport.subject}
                    </span>
                  </h2>
                </div>

                {messagesLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading messages...
                  </p>
                ) : (
                  <div className="h-[59vh] flex flex-col">
                    <MessagesTab
                      id={viewingReport.id}
                      reportStatus={viewingReport.status}
                    />
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="reports"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                <h2 className="text-xl font-semibold mb-4">Past Reports</h2>

                <div className="flex-1 overflow-x-auto">
                  {loading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : pastReports.length > 0 ? (
                    <>
                      <table className="w-full text-sm">
                        {/* CHANGE 4: Themed table header. */}
                        <thead className="text-left text-muted-foreground">
                          <tr>
                            <th className="py-3 px-4 font-medium">Subject</th>
                            <th className="py-3 px-4 font-medium">Status</th>
                            <th className="py-3 px-4 font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pastReports.map((report) => (
                            // CHANGE 5: Replaced striped background with a simple bottom border.
                            // This is a common, clean pattern that works perfectly in both themes.
                            <tr
                              key={report.id}
                              className="border-b border-border"
                            >
                              <td className="py-3 px-4">{report.subject}</td>

                              <td className="py-3 px-4">
                                {report.status === 'IN_PROGRESS' ? (
                                  // CHANGE 6: Used `text-primary` for the clickable link.
                                  <button
                                    onClick={() => handleViewMessages(report)}
                                    className="text-primary underline-offset-4 hover:underline font-medium"
                                  >
                                    OPEN
                                  </button>
                                ) : (
                                  <span
                                    className={`font-medium ${
                                      report.status === 'OPEN'
                                        ? 'text-yellow-500' // These specific colors can be kept for status indicators
                                        : 'text-green-600' // but ensure they have enough contrast in dark mode.
                                    }`}
                                  >
                                    {report.status}
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-4 text-muted-foreground">
                                {new Date(report.date).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="flex items-center justify-between mt-4 text-sm">
                        <span className="text-muted-foreground">
                          Page {page}
                        </span>
                        <div className="flex items-center space-x-2">
                          {/* CHANGE 7: Themed pagination buttons. */}
                          <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 text-sm rounded-md disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground"
                          >
                            Prev
                          </button>
                          <button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!hasNextPage}
                            className="px-3 py-1.5 text-sm rounded-md disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground"
                          >
                            Next
                          </button>
                          {/* CHANGE 8: Themed select input. */}
                          <select
                            value={limit}
                            onChange={(e) => {
                              setLimit(parseInt(e.target.value));
                              setPage(1);
                            }}
                            className="border border-input bg-background rounded-md px-2 py-1 text-sm"
                          >
                            {[5, 10, 20, 50].map((size) => (
                              <option key={size} value={size}>
                                {size} / page
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No past reports available.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
