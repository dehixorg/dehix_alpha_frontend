/* eslint-disable prettier/prettier */
'use client';
import React, { useEffect, useState } from 'react';
import { Briefcase } from 'lucide-react';

import { axiosInstance } from '@/lib/axiosinstance';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
// No dropdown menu needed since we only keep a single action
// Removed accordion usage as we now use a table layout
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import EmptyState from '@/components/shared/EmptyState';

type InterviewBid = {
  _id?: string;
  interviewerId?: string;
  fee?: string;
  status?: string;
  description?: string;
};

type Interview = {
  _id?: string;
  interviewDate?: string;
  description?: string;
  interviewStatus?: string;
  interviewBids?: InterviewBid[];
  createdAt?: string;
  updatedAt?: string;
};

const formatDate = (iso?: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString();
};

const formatBidsCount = (bids?: InterviewBid[]) => {
  const list = Array.isArray(bids) ? bids : [];
  const meaningful = list.filter((b) => b && (b._id || b.fee || b.status));
  return meaningful.length;
};

const normalizeBids = (bids?: InterviewBid[]) => {
  const list = Array.isArray(bids) ? bids : [];
  return list.filter((b) => b && (b._id || b.fee || b.status || b.description));
};
const BidsPage = ({ userId }: { userId?: string }) => {
  const [bidsData, setBidsData] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null,
  );
  const [selectingBidId, setSelectingBidId] = useState<string | null>(null);

  const handleSelectBid = async (bid: InterviewBid) => {
    if (!selectedInterview?._id || !bid?._id) return;

    try {
      setSelectingBidId(String(bid._id));

      await axiosInstance.post(
        `/interview/${selectedInterview._id}/interview-bids/${bid._id}`,
        {},
      );

      notifySuccess('Bid selected successfully.', 'Success');

      // Refresh the list to reflect the change (e.g., interview may move to scheduled)
      const fetchBids = async () => {
        try {
          setLoading(true);
          setErrorMessage(null);

          const res = await axiosInstance.get('/interview/creator/open', {
            params: { page: 1, limit: 20 },
          });

          const list: Interview[] = Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res?.data)
              ? res.data
              : [];

          const sorted = [...list].sort((a, b) => {
            const at = a?.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const bt = b?.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return bt - at;
          });

          setBidsData(sorted);
        } catch (e: any) {
          const msg =
            e?.response?.data?.message ||
            'Failed to refresh interviews after selection.';
          setErrorMessage(String(msg));
          notifyError(String(msg), 'Error');
        } finally {
          setLoading(false);
        }
      };

      await fetchBids();

      // Close the dialog after successful selection
      setSelectedInterview(null);
    } finally {
      setSelectingBidId(null);
    }
  };

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const res = await axiosInstance.get('/interview/creator/open', {
          params: {
            page: 1,
            limit: 20,
          },
        });

        const list: Interview[] = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
            ? res.data
            : [];

        const sorted = [...list].sort((a, b) => {
          const at = a?.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const bt = b?.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return bt - at;
        });

        setBidsData(sorted);
      } catch (error: any) {
        console.error('Error fetching interview bids', error);
        const msg =
          error?.response?.data?.message ||
          'Something went wrong. Please try again.';
        setErrorMessage(String(msg));
        notifyError(String(msg), 'Error');
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [userId]);

  return (
    <div className="w-full">
      {loading ? (
        // Table skeleton
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bids</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(4)].map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div className="h-4 w-40 bg-muted rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-24 bg-muted rounded-full" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 bg-muted rounded" />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="h-8 w-8 bg-muted rounded-md inline-block" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : errorMessage ? (
        <EmptyState
          className="my-2"
          title="Unable to load bids"
          description={errorMessage}
          icon={<Briefcase className="h-12 w-12 text-muted-foreground" />}
          actions={
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setLoading(true);
                setErrorMessage(null);
                axiosInstance
                  .get('/interview/creator/open', {
                    params: { page: 1, limit: 20 },
                  })
                  .then((res) => {
                    const list: Interview[] = Array.isArray(res?.data?.data)
                      ? res.data.data
                      : Array.isArray(res?.data)
                        ? res.data
                        : [];
                    setBidsData(list);
                  })
                  .catch((err) => {
                    const msg =
                      err?.response?.data?.message ||
                      'Something went wrong. Please try again.';
                    setErrorMessage(String(msg));
                  })
                  .finally(() => setLoading(false));
              }}
            >
              Retry
            </Button>
          }
        />
      ) : bidsData?.length > 0 ? (
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bids</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bidsData.map((interview) => (
                <TableRow key={interview?._id}>
                  <TableCell>
                    {formatDate(interview?.interviewDate)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {interview?.interviewStatus || 'BIDDING'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatBidsCount(interview?.interviewBids)}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedInterview(interview)}
                    >
                      View bids
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          className="my-2"
          title="No open interviews"
          description="When you create interviews open for bidding, they will show up here."
          icon={<Briefcase className="h-12 w-12 text-muted-foreground" />}
        />
      )}

      {selectedInterview ? (
        <Dialog
          open={!!selectedInterview}
          onOpenChange={() => setSelectedInterview(null)}
        >
          <DialogContent className="m-2 w-[90vw] md:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Interview bids</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {selectedInterview?.description ? (
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium">Interview description</div>
                  <div className="mt-1 text-sm text-muted-foreground whitespace-pre-line">
                    {selectedInterview.description}
                  </div>
                </div>
              ) : null}

              <div className="text-sm text-muted-foreground">
                Date: {formatDate(selectedInterview?.interviewDate)}
              </div>

              {normalizeBids(selectedInterview?.interviewBids).length ? (
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Interviewer</TableHead>
                        <TableHead>Fee</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {normalizeBids(selectedInterview?.interviewBids).map((bid) => (
                        <TableRow key={bid._id || `${bid.interviewerId}-${bid.fee}`}>
                          <TableCell className="font-medium">
                            {bid.interviewerId || '-'}
                          </TableCell>
                          <TableCell>{bid.fee || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {bid.status || 'PENDING'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[420px]">
                            <div className="text-sm text-muted-foreground whitespace-pre-line">
                              {bid.description || '-'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleSelectBid(bid)}
                              disabled={!bid._id || selectingBidId === String(bid._id)}
                            >
                              {selectingBidId === String(bid._id)
                                ? 'Selecting...'
                                : 'Select'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <EmptyState
                  className="my-2"
                  title="No bids yet"
                  description="No one has placed a bid on this interview yet."
                  icon={<Briefcase className="h-12 w-12 text-muted-foreground" />}
                />
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSelectedInterview(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
};

export default BidsPage;
