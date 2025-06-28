"use client";

import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { apiHelperService } from "@/services/report";
import { MessagesTab } from "@/components/report-tabs/Messagestab";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
interface PastReport {
  id: string;
  subject: string;
  status: "OPEN" | "CLOSED" | "IN_PROGRESS";
  date: string;
}

export default function PastReportsTab() {
  const [pastReports, setPastReports] = useState<PastReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingReport, setViewingReport] = useState<null | PastReport>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const user = useSelector((state: RootState) => state.user);

  const fetchReports = async () => {
        if (!user?.uid) return; // ⛔️ Prevent API call if user is not ready

    setLoading(true);
    try {
       const res = await apiHelperService.getReportsByUser(user.uid, {
      page: String(page),
      limit: String(limit),
    });


      const transformed = (res.data?.data || []).map((r: any) => ({
        id: r._id,
        subject: r.subject,
        status: r.status || "OPEN",
        date: r.createdAt,
      }));

      setPastReports(transformed);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch past reports.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (!viewingReport && user?.uid) {
    fetchReports();
  }
}, [page, limit, viewingReport, user?.uid]);


  const handleViewMessages = async (report: PastReport) => {
    setMessagesLoading(true);
    try {
      const res = await apiHelperService.getSingleReport(report.id);
      setMessages(res.data?.data?.messages || []);
      setViewingReport(report);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch messages.",
        variant: "destructive",
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
   <main className="min-h-screen bg-background text-foreground px-4">
  <div className="w-full">
    <div className="w-full flex flex-col  rounded-md p-6 bg-white shadow-sm">
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
  <button
    onClick={handleBack}
    className="absolute left-0 px-4 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold shadow"
    aria-label="Back to reports"
  >
    ← Back
  </button>

  <h2 className="text-center text-lg sm:text-2xl font-bold text-gray-800">
    <span className="text-blue-600">{viewingReport.subject}</span>
  </h2>
</div>


            {messagesLoading ? (
              <p className="text-sm text-muted-foreground">Loading messages...</p>
            ) : (
              <div className="h-[59vh] flex flex-col">
                <MessagesTab id={viewingReport.id} reportStatus={viewingReport.status} />
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
                    <thead className="bg-gray-50 text-left text-gray-600">
                      <tr>
                        <th className="py-2 px-4">Subject</th>
                        <th className="py-2 px-4">Status</th>
                        <th className="py-2 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastReports.map((report, i) => (
                        <tr key={report.id} className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                          <td className="py-2 px-4">{report.subject}</td>
                          
<td className="py-2 px-4">
  {report.status === "IN_PROGRESS" ? (
    <button
      onClick={() => handleViewMessages(report)}
      className="text-blue-600 underline hover:text-blue-700 font-medium"
    >
      OPEN
    </button>
  ) : (
    <span
      className={`font-medium ${
        report.status === "OPEN"
          ? "text-yellow-500"
          : "text-green-600"
      }`}
    >
      {report.status}
    </span>
  )}
</td>


                          <td className="py-2 px-4">
                            {new Date(report.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex items-center justify-between mt-4 text-sm">
                    <span className="text-muted-foreground">Page {page}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 text-sm rounded-md disabled:opacity-50 hover:bg-gray-100"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!hasNextPage}
                        className="px-3 py-1.5 text-sm rounded-md disabled:opacity-50 hover:bg-gray-100"
                      >
                        Next
                      </button>
                      <select
                        value={limit}
                        onChange={(e) => {
                          setLimit(parseInt(e.target.value));
                          setPage(1);
                        }}
                        className="border rounded-md px-2 py-1 text-sm"
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
                <p className="text-sm text-muted-foreground">No past reports available.</p>
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
