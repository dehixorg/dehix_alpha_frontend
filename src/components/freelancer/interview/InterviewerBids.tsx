/* eslint-disable prettier/prettier */
'use client';
import React, { useEffect, useState } from 'react';
import { Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { axiosInstance } from '@/lib/axiosinstance';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/shared/EmptyState';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type BiddableInterview = {
  _id: string;
  talentId?: string;
  talentName?: string;
  description?: string;
  interviewDate?: string;
};

type MyBid = {
  fee?: string;
  suggestedDateTime?: string;
  status?: string;
  description?: string;
};

type BiddedInterview = {
  _id: string;
  talentId?: string;
  talentName?: string;
  talentType?: string;
  interviewStatus?: string;
  interviewDate?: string;
  description?: string;
  myBid?: MyBid;
  interviewBids?: MyBid[];
  createdAt?: string;
  updatedAt?: string;
};

type VerifiedAttribute = {
  _id: string;
  type?: string;
  type_id: string;
  name: string;
  interviewerStatus?: string;
  interviewerActiveStatus?: string;
};

const formatDateTime = (iso?: string) => {
  if (!iso) return { date: '-', time: '-' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '-', time: '-' };
  return {
    date: d.toLocaleDateString(),
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
};

const hasMeaningfulBid = (bid?: MyBid) => {
  if (!bid) return false;
  return Boolean(
    (bid.fee && String(bid.fee).trim()) ||
      (bid.status && String(bid.status).trim()) ||
      (bid.description && String(bid.description).trim()) ||
      (bid.suggestedDateTime && String(bid.suggestedDateTime).trim()),
  );
};

export default function InterviewerBids({
  userId,
}: {
  userId?: string;
}) {
  const router = useRouter();
  const [attributes, setAttributes] = useState<VerifiedAttribute[]>([]);
  const [attributesLoading, setAttributesLoading] = useState(false);
  const [attributesError, setAttributesError] = useState<string | null>(null);
  const [selectedTalentId, setSelectedTalentId] = useState<string>('ALL');

  const [biddableItems, setBiddableItems] = useState<BiddableInterview[]>([]);
  const [biddableLoading, setBiddableLoading] = useState(false);
  const [biddableError, setBiddableError] = useState<string | null>(null);

  const [biddedItems, setBiddedItems] = useState<BiddedInterview[]>([]);
  const [biddedLoading, setBiddedLoading] = useState(false);
  const [biddedError, setBiddedError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<BiddableInterview | null>(null);
  const [fee, setFee] = useState('');
  const [bidDescription, setBidDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAttributes = async () => {
    try {
      setAttributesLoading(true);
      setAttributesError(null);

      const res = await axiosInstance.get(
        '/freelancer/dehix-talent/attributes/verified',
      );

      const list: VerifiedAttribute[] = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : [];

      setAttributes(list);
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        'Failed to load profiles filter. Showing all interviews.';
      setAttributesError(message);
    } finally {
      setAttributesLoading(false);
    }
  };

  const fetchBidded = async () => {
    try {
      setBiddedLoading(true);
      setBiddedError(null);

      const res = await axiosInstance.get('/interview/bidded', {
        params: {
          page: 1,
          limit: 20,
        },
      });

      const list: BiddedInterview[] = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : [];

      const sorted = [...list].sort((a, b) => {
        const at = a?.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bt = b?.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return bt - at;
      });

      setBiddedItems(sorted);
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        'Failed to load bidded interviews. Please try again.';
      setBiddedError(message);
    } finally {
      setBiddedLoading(false);
    }
  };

  const fetchBiddable = async () => {
    try {
      setBiddableLoading(true);
      setBiddableError(null);

      const res = await axiosInstance.get('/interview/biddable', {
        params: {
          page: 1,
          limit: 20,
        },
      });

      const list: BiddableInterview[] = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : [];

      const sorted = [...list].sort((a, b) => {
        const at = a?.interviewDate ? new Date(a.interviewDate).getTime() : 0;
        const bt = b?.interviewDate ? new Date(b.interviewDate).getTime() : 0;
        return at - bt;
      });

      setBiddableItems(sorted);
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        'Failed to load biddable interviews. Please try again.';
      setBiddableError(message);
    } finally {
      setBiddableLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
    fetchBidded();
    fetchBiddable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredBiddedItems =
    selectedTalentId === 'ALL'
      ? biddedItems
      : biddedItems.filter((iv) => String(iv.talentId || '') === selectedTalentId);

  const filteredBiddableItems =
    selectedTalentId === 'ALL'
      ? biddableItems
      : biddableItems.filter(
          (iv) => String(iv.talentId || '') === selectedTalentId,
        );

  const approvedAttributes = attributes.filter((a) =>
    String(a.interviewerStatus || '').toUpperCase().includes('APPROVED'),
  );

  const handleOpenBid = (iv: BiddableInterview) => {
    setSelected(iv);
    setFee('');
    setBidDescription('');
    setConfirmOpen(true);
  };

  const handleSubmitBid = async () => {
    if (!selected?._id) return;

    if (!fee || Number.isNaN(Number(fee)) || Number(fee) <= 0) {
      notifyError('Please enter a valid fee amount.', 'Error');
      return;
    }

    if (!bidDescription.trim()) {
      notifyError('Please add a description for your bid.', 'Error');
      return;
    }

    try {
      setSubmitting(true);

      await axiosInstance.post(`/interview/interview-bids/${selected._id}`, {
        fee: String(fee),
        description: bidDescription.trim(),
      });

      notifySuccess('Bid placed successfully.', 'Success');
      setBiddableItems((prev) => prev.filter((x) => x._id !== selected._id));
      fetchBidded();
      setConfirmOpen(false);
      setSelected(null);
    } catch (e: any) {
      const status = e?.response?.status;
      const message = e?.response?.data?.message || 'Failed to place bid.';

      if (
        status === 400 &&
        String(message).toLowerCase().includes('availability')
      ) {
        notifyError(message, 'Error');
        router.push('/freelancer/interviewer/profile');
        setConfirmOpen(false);
        return;
      }

      notifyError(message, 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold">Interview bids</div>
          <div className="text-sm text-muted-foreground">
            Filter interviews by your approved interviewer profiles.
          </div>
        </div>

        <div className="w-full sm:w-80">
          <Label>Profile</Label>
          <Select value={selectedTalentId} onValueChange={setSelectedTalentId}>
            <SelectTrigger disabled={attributesLoading}>
              <SelectValue placeholder="Select profile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All profiles</SelectItem>
              {approvedAttributes.map((a) => (
                <SelectItem key={a._id} value={String(a.type_id)}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {attributesError ? (
            <div className="mt-1 text-xs text-muted-foreground">
              {attributesError}
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-10">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Already bidded</div>
              <div className="text-sm text-muted-foreground">
                Interviews where you already placed a bid.
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={fetchBidded}
              disabled={biddedLoading}
            >
              Refresh
            </Button>
          </div>

          {biddedLoading ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(3)].map((_, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <CardHeader className="gap-2">
                    <div className="h-4 w-40 bg-muted rounded" />
                    <div className="h-3 w-56 bg-muted rounded" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="h-4 w-72 bg-muted rounded" />
                    <div className="h-4 w-44 bg-muted rounded" />
                    <div className="h-4 w-52 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : biddedError ? (
            <EmptyState
              className="my-2"
              title="Unable to load bidded interviews"
              description={String(biddedError)}
              icon={<Briefcase className="h-12 w-12 text-muted-foreground" />}
              actions={
                <Button type="button" variant="outline" onClick={fetchBidded}>
                  Retry
                </Button>
              }
            />
          ) : filteredBiddedItems.length ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBiddedItems.map((iv) => {
                const { date, time } = formatDateTime(iv.interviewDate);
                const myBid = hasMeaningfulBid(iv.myBid)
                  ? iv.myBid
                  : (iv.interviewBids || []).find((b) => hasMeaningfulBid(b));

                const bidFee = myBid?.fee;
                const bidStatus = myBid?.status;
                const bidDescription = (myBid?.description || '').trim();
                const descriptionToShow = bidDescription || iv.description || '-';

                return (
                  <Card key={iv._id} className="overflow-hidden">
                    <CardHeader className="gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">
                          {iv.talentName || 'Interview'}
                        </CardTitle>
                        {bidStatus ? (
                          <Badge variant="secondary">{bidStatus}</Badge>
                        ) : null}
                      </div>
                      <CardDescription>
                        {date} • {time}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {iv.description ? (
                        <div className="text-sm text-muted-foreground line-clamp-3">
                          {iv.description}
                        </div>
                      ) : null}

                      <div className="rounded-lg border p-3 space-y-2">
                        <div className="text-sm font-medium">My bid</div>
                        <div className="text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium text-foreground">
                              Fee:
                            </span>{' '}
                            {bidFee || '-'}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">
                              Description:
                            </span>{' '}
                            {descriptionToShow}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              You haven’t placed any bids yet.
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Available to bid</div>
              <div className="text-sm text-muted-foreground">
                Interviews you can bid on right now.
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={fetchBiddable}
              disabled={biddableLoading}
            >
              Refresh
            </Button>
          </div>

          {biddableLoading ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(3)].map((_, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <CardHeader className="gap-2">
                    <div className="h-4 w-40 bg-muted rounded" />
                    <div className="h-3 w-56 bg-muted rounded" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="h-4 w-72 bg-muted rounded" />
                    <div className="h-9 w-24 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : biddableError ? (
            (() => {
              const message = String(biddableError);
              const showAvailabilityCta = message
                .toLowerCase()
                .includes('availability');

              return (
                <EmptyState
                  className="my-2"
                  title="Unable to load available interviews"
                  description={message}
                  icon={<Briefcase className="h-12 w-12 text-muted-foreground" />}
                  actions={
                    showAvailabilityCta ? (
                      <Button
                        type="button"
                        onClick={() => router.push('/freelancer/interviewer/profile')}
                      >
                        Set your availability
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={fetchBiddable}
                      >
                        Retry
                      </Button>
                    )
                  }
                />
              );
            })()
          ) : filteredBiddableItems.length ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBiddableItems.map((iv) => {
                const { date, time } = formatDateTime(iv.interviewDate);

                return (
                  <Card key={iv._id} className="overflow-hidden">
                    <CardHeader className="gap-1">
                      <CardTitle className="text-base">
                        {iv.talentName || 'Interview'}
                      </CardTitle>
                      <CardDescription>
                        {date} • {time}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {iv.description ? (
                        <div className="text-sm text-muted-foreground line-clamp-3">
                          {iv.description}
                        </div>
                      ) : null}

                      <div>
                        <Button type="button" onClick={() => handleOpenBid(iv)}>
                          Bid
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No interviews available for bidding right now.
            </div>
          )}
        </section>
      </div>

      <Dialog open={confirmOpen} onOpenChange={(open) => setConfirmOpen(open)}>
        <DialogContent className="m-2 w-[80vw] md:max-w-lg ">
          <DialogHeader>
            <DialogTitle>Place bid</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Date & Time</Label>
              <Input
                value={
                  selected?.interviewDate
                    ? new Date(selected.interviewDate).toLocaleString()
                    : '-'
                }
                disabled
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fee">Bid fee</Label>
              <Input
                id="fee"
                placeholder="Enter fee"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                type="number"
                min={0}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bidDescription">Description</Label>
              <Textarea
                id="bidDescription"
                placeholder="Write a short note about why you are a good fit for this interview"
                value={bidDescription}
                onChange={(e) => setBidDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmitBid} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit bid'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
