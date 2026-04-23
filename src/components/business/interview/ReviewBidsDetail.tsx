'use client';
import React, { useEffect, useState, useRef } from 'react';
import {
  ChevronLeft,
  Calendar,
  Clock,
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { axiosInstance } from '@/lib/axiosinstance';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Bid {
  _id: string;
  interviewerId: string;
  fee: string;
  status: string;
  description?: string;
  interviewer?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    userName?: string;
    profilePic?: string;
    skills?: string[];
    workExperience?: any[];
    rating?: number;
    expertise?: string;
  };
}

interface InterviewDetail {
  _id: string;
  talentName?: string;
  description?: string;
  interviewDate?: string;
  interviewStatus?: string;
  interviewType?: string;
  interviewBids?: Bid[];
}

interface ReviewBidsDetailProps {
  interviewId: string;
  onBack: () => void;
}

export default function ReviewBidsDetail({
  interviewId,
  onBack,
}: ReviewBidsDetailProps) {
  const router = useRouter();
  const [interview, setInterview] = useState<InterviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const currentToken = useRef<string>(interviewId);

  const fetchInterview = async () => {
    const fetchId = interviewId;
    currentToken.current = fetchId;
    setInterview(null);
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/interview/${fetchId}`);
      if (currentToken.current !== fetchId) return;
      setInterview(response.data?.data || response.data || null);
    } catch (error: any) {
      if (currentToken.current !== fetchId) return;
      console.error('Error fetching interview:', error);
      notifyError('Failed to load candidate details', 'Error');
    } finally {
      if (currentToken.current === fetchId) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (interviewId) {
      fetchInterview();
    }
    return () => {
      currentToken.current = '';
    };
  }, [interviewId]);

  const handleAcceptBid = async (bidId: string) => {
    try {
      setProcessingId(bidId);
      await axiosInstance.post(
        `/interview/${interviewId}/interview-bids/${bidId}`,
      );
      notifySuccess('Candidate hired successfully!', 'Success');
      // Redirect back to current interviews as it's now scheduled
      router.push('/business/interviews/current');
    } catch (error: any) {
      notifyError(
        error.response?.data?.message || 'Failed to hire candidate',
        'Error',
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectBid = async (bidId: string) => {
    try {
      setProcessingId(bidId);
      await axiosInstance.put(
        `/interview/${interviewId}/interview-bids/${bidId}`,
        {
          status: 'REJECTED',
        },
      );
      notifySuccess('Bid rejected', 'Status Updated');
      fetchInterview(); // Refresh the list
    } catch (error: any) {
      notifyError(
        error.response?.data?.message || 'Failed to reject bid',
        'Error',
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card
              key={i}
              className="border-muted/40 bg-card/40 backdrop-blur-sm"
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="p-4 rounded-full bg-muted/20 mb-4 text-muted-foreground">
          <Briefcase className="h-12 w-12" />
        </div>
        <h3 className="text-xl font-bold">Interview Not Found</h3>
        <p className="text-muted-foreground mt-2">
          The requested interview details could not be found.
        </p>
        <Button variant="outline" className="mt-6 font-bold" onClick={onBack}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const bids = Array.isArray(interview.interviewBids)
    ? interview.interviewBids
    : [];

  const pendingBids = bids.filter((b) => b.status === 'PENDING');
  const otherBids = bids.filter((b) => b.status !== 'PENDING');

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="group px-0 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-semibold"
          >
            <ChevronLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to All Bids
          </Button>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
                {interview.talentName || 'Interview Opportunity'}
              </h1>
              <Badge
                variant="outline"
                className="bg-primary/5 text-primary border-primary/20 h-6 px-3 font-bold uppercase tracking-widest text-[9px]"
              >
                {interview.interviewType}
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
              {interview.description ||
                'Review candidates and select the best expert for your interview needs.'}
            </p>
          </div>
        </div>

        <Card className="border-muted/40 bg-card/30 backdrop-blur-md shadow-lg rounded-2xl lg:w-80">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3 text-sm font-medium">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <Calendar className="h-4 w-4" />
              </div>
              <span className="text-muted-foreground">Requested:</span>
              <span className="font-bold">
                {interview.interviewDate
                  ? new Date(interview.interviewDate).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Clock className="h-4 w-4" />
              </div>
              <span className="text-muted-foreground">Preferred Time:</span>
              <span className="font-bold">
                {interview.interviewDate
                  ? new Date(interview.interviewDate).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'N/A'}
              </span>
            </div>
            <Separator className="bg-muted/40" />
            <div className="flex items-center gap-3 text-sm font-medium">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </div>
              {interview.interviewStatus?.toUpperCase() === 'SCHEDULED' &&
              bids.length === 0 ? (
                <>
                  <span className="text-muted-foreground">Interview Type:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    Direct
                  </span>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground">
                    Total Candidates:
                  </span>
                  <span className="font-bold">{bids.length}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-1 lg:h-1.5 w-12 bg-primary rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          <h2 className="text-2xl font-bold tracking-tight">
            Active Candidates
          </h2>
        </div>

        {pendingBids.length === 0 ? (
          <div className="py-12 border-2 border-dashed border-muted/50 rounded-3xl bg-muted/5 flex flex-col items-center justify-center text-center px-6">
            <p className="text-lg font-medium text-muted-foreground">
              No pending candidates to review.
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              New bids will appear here as soon as interviewers respond.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {pendingBids.map((bid) => (
              <CandidateCard
                key={bid._id}
                bid={bid}
                isProcessing={processingId === bid._id}
                onAccept={() => handleAcceptBid(bid._id)}
                onReject={() => handleRejectBid(bid._id)}
              />
            ))}
          </div>
        )}

        {otherBids.length > 0 && (
          <div className="space-y-6 pt-10">
            <div className="flex items-center gap-4 opacity-70">
              <div className="h-1 lg:h-1.5 w-12 bg-muted-foreground rounded-full" />
              <h2 className="text-xl font-bold tracking-tight text-muted-foreground">
                Processed
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 opacity-60 grayscale-[0.5] hover:grayscale-0 transition-all duration-500">
              {otherBids.map((bid) => (
                <CandidateCard
                  key={bid._id}
                  bid={bid}
                  isProcessing={false}
                  disabled
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CandidateCard({
  bid,
  onAccept,
  onReject,
  isProcessing,
  disabled = false,
}: {
  bid: Bid;
  onAccept?: () => void;
  onReject?: () => void;
  isProcessing: boolean;
  disabled?: boolean;
}) {
  const interviewer = bid.interviewer;
  const fullName =
    `${interviewer?.firstName || ''} ${interviewer?.lastName || ''}`.trim() ||
    interviewer?.userName ||
    'Anonymous Expert';

  return (
    <Card
      className={cn(
        'overflow-hidden border-muted/40 bg-card/60 backdrop-blur-sm group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 rounded-3xl',
        isProcessing && 'opacity-70 pointer-events-none',
      )}
    >
      <CardHeader className="pb-4 relative">
        <div className="flex items-start gap-4">
          <div className="relative group/avatar">
            <Avatar className="h-16 w-16 border-2 border-primary/20 ring-4 ring-primary/5 transition-transform group-hover/avatar:scale-110 duration-500">
              <AvatarImage src={interviewer?.profilePic} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                {fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-green-500 h-5 w-5 rounded-full border-2 border-background flex items-center justify-center shadow-sm">
              <ShieldCheck className="h-3 w-3 text-white" />
            </div>
          </div>

          <div className="flex-1 space-y-1 min-w-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold leading-tight truncate group-hover:text-primary transition-colors">
                {fullName}
              </CardTitle>
              {bid.status !== 'PENDING' && (
                <Badge
                  variant={bid.status === 'ACCEPTED' ? 'secondary' : 'outline'}
                  className={cn(
                    'text-[10px] h-5 px-2 rounded-full font-bold uppercase tracking-wider',
                    bid.status === 'ACCEPTED' &&
                      'bg-emerald-500/10 text-emerald-500',
                    bid.status === 'REJECTED' && 'bg-red-500/10 text-red-500',
                  )}
                >
                  {bid.status}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {(interviewer?.skills || []).slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-bold text-muted-foreground/70 bg-muted/40 px-2 py-0.5 rounded-md"
                >
                  {skill}
                </span>
              ))}
              {(interviewer?.skills || []).length > 3 && (
                <span className="text-[10px] font-bold text-muted-foreground/40 bg-muted/20 px-2 py-0.5 rounded-md">
                  +{(interviewer?.skills || []).length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
              <MessageSquare className="h-3 w-3" /> Bid Description
            </h4>
            <div className="text-lg font-black text-foreground">
              ${bid.fee}
              <span className="text-xs font-bold text-muted-foreground/60 ml-1">
                Total Fee
              </span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-muted/20 border border-muted/40 text-sm leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors italic">
            &quot;
            {bid.description ||
              'No specific description provided for this bid.'}
            &quot;
          </div>
        </div>

        {(bid.interviewer?.expertise || bid.interviewer?.rating) && (
          <div className="grid grid-cols-2 gap-4">
            {bid.interviewer?.expertise && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/50">
                  Experience
                </p>
                <div className="flex items-center gap-1 text-sm font-bold">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span>{bid.interviewer.expertise}</span>
                </div>
              </div>
            )}

            {bid.interviewer?.rating && (
              <div
                className={cn(
                  'space-y-1',
                  !bid.interviewer.expertise && 'col-span-2 text-left',
                  bid.interviewer.expertise && 'text-right',
                )}
              >
                <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/50">
                  Rating
                </p>
                <div
                  className={cn(
                    'flex items-center gap-1 text-sm font-bold',
                    bid.interviewer.expertise && 'justify-end',
                  )}
                >
                  <span>{bid.interviewer.rating}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-2 w-2',
                          i <= Math.round(bid.interviewer!.rating!)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-muted-foreground fill-muted-foreground opacity-50',
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <Separator className="bg-muted/40" />

      {!disabled && (
        <CardFooter className="p-4 grid grid-cols-2 gap-4 bg-muted/10">
          <Button
            className="rounded-xl h-11 font-bold border-none bg-muted/60 hover:bg-red-500/10 hover:text-red-500 transition-all"
            variant="outline"
            onClick={onReject}
            disabled={isProcessing}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button
            className="rounded-xl h-11 font-bold shadow-sm shadow-primary/20 hover:shadow-lg transition-all"
            onClick={onAccept}
            disabled={isProcessing}
          >
            {isProcessing ? (
              'Processing...'
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Hire Candidate
              </span>
            )}
          </Button>
        </CardFooter>
      )}

      {disabled && bid.status === 'PENDING' && (
        <CardFooter className="p-4 bg-muted/10">
          <Button variant="ghost" className="w-full text-xs font-bold" disabled>
            Awaiting Response
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
