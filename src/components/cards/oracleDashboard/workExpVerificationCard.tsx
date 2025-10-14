'use client';
import React, { useEffect, useState } from 'react';
import {
  MessageSquareIcon,
  Github,
  User2Icon,
  Phone,
  Building,
  MoreVertical,
  Flag,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';

import { axiosInstance } from '@/lib/axiosinstance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { cn } from '@/lib/utils';
import { RootState } from '@/lib/store';
import { getReportTypeFromPath } from '@/utils/getReporttypeFromPath';
import { NewReportTab } from '@/components/report-tabs/NewReportTabs';

interface WorkExpProps {
  _id: string;
  jobTitle: string;
  workDescription: string;
  startFrom: string;
  endTo: string | 'current';
  company: string;
  referencePersonName: string;
  referencePersonContact: string;
  githubRepoLink: string;
  comments: string;
  status: string | 'Pending'; // Add initial status prop
  onStatusUpdate: (newStatus: string) => void;
  onCommentUpdate: (newComment: string) => void;
}

const FormSchema = z.object({
  type: z.enum(['Approved', 'Denied'], {
    required_error: 'You need to select a type.',
  }),
  comment: z.string().optional(),
});

const WorkExpVerificationCard: React.FC<WorkExpProps> = ({
  _id,
  jobTitle,
  workDescription,
  startFrom,
  company,
  endTo,
  referencePersonName,
  referencePersonContact,
  githubRepoLink,
  comments,
  status, // Get initial status from props
  onStatusUpdate,
  onCommentUpdate,
}) => {
  const [verificationStatus, setVerificationStatus] = useState(status);
  const [openReport, setOpenReport] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const selectedType = form.watch('type');

  useEffect(() => {
    setVerificationStatus(status);
  }, [status]);

  const user = useSelector((state: RootState) => state.user);
  const pathname = usePathname();
  const reportType = getReportTypeFromPath(pathname);

  const reportData = {
    subject: '',
    description: '',
    report_role: user?.type || 'STUDENT',
    report_type: reportType,
    status: 'OPEN',
    reportedbyId: user?.uid || 'user123',
    reportedId: user?.uid || 'user123',
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await axiosInstance.put(
        `/verification/${_id}/oracle?doc_type=experience`,
        {
          comments: data.comment,
          verification_status: data.type,
        },
      );

      // Success message based on the action
      const statusMessage =
        data.type === 'Approved'
          ? 'Experience verification approved successfully'
          : 'Experience verification denied successfully';
      notifySuccess(statusMessage);

      setVerificationStatus(data.type);
      onStatusUpdate(data.type);
      onCommentUpdate(data.comment || '');
    } catch (error) {
      notifyError('Something went wrong. Please try again.', 'Error');
    }
  }

  // Status configuration matching business cards
  const statusConfig: Record<
    string,
    {
      color: string;
      icon: React.ComponentType<{ className?: string }>;
      text: string;
    }
  > = {
    pending: {
      color: 'bg-amber-500',
      icon: Clock,
      text: 'Pending',
    },
    verified: {
      color: 'bg-green-500',
      icon: CheckCircle2,
      text: 'Verified',
    },
    Approved: {
      color: 'bg-green-500',
      icon: CheckCircle2,
      text: 'Approved',
    },
    rejected: {
      color: 'bg-red-500',
      icon: XCircle,
      text: 'Rejected',
    },
    Denied: {
      color: 'bg-red-500',
      icon: XCircle,
      text: 'Denied',
    },
    default: {
      color: 'bg-gray-400',
      icon: Clock,
      text: 'Unknown',
    },
  };

  return (
    <Card
      className={cn(
        'flex flex-col h-auto relative group overflow-hidden transition-all hover:shadow-lg',
      )}
    >
      {/* Status indicator */}
      <div
        className={cn('absolute top-0 left-0 w-full h-1', currentStatus.color)}
      />

      {/* 3-dot menu */}
      <div className="absolute top-4 right-4 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setOpenReport(true);
              }}
              className="text-red-600 focus:text-red-600 focus:bg-destructive/50 cursor-pointer"
            >
              <Flag className="mr-2 h-4 w-4" />
              <span>Report</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold mt-3 line-clamp-1 flex items-center">
          {jobTitle}
          {verificationStatus === 'Approved' && (
            <ShieldCheck className="h-5 w-5 ml-1.5 text-green-500" />
          )}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building className="h-3.5 w-3.5" />
          <span className="line-clamp-1">{company}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge
            variant="secondary"
            className={cn(
              'text-white',
              verificationStatus === 'Pending' && 'bg-amber-500',
              verificationStatus === 'Approved' && 'bg-green-500',
              verificationStatus === 'verified' && 'bg-green-500',
              verificationStatus === 'Denied' && 'bg-red-500',
              verificationStatus === 'rejected' && 'bg-red-500',
            )}
          >
            {currentStatus.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="bg-muted/30 dark:bg-muted/10 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {workDescription || 'No description available for this experience.'}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User2Icon className="h-4 w-4" />
            <span>Reference: {referencePersonName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{referencePersonContact}</span>
          </div>
          {githubRepoLink && (
            <div className="flex items-center gap-2 text-sm">
              <Github className="h-4 w-4" />
              <a
                href={githubRepoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View Repository
              </a>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            {new Date(startFrom).toLocaleDateString()} -{' '}
            {endTo !== 'current'
              ? new Date(endTo).toLocaleDateString()
              : 'Current'}
          </span>
        </div>

        {comments && (
          <div className="bg-muted/30 dark:bg-muted/10 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <MessageSquareIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{comments}</p>
            </div>
          </div>
        )}

        {verificationStatus === 'Pending' && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/20">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium">
                        Choose Verification Status:
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <FormItem className="flex items-center space-x-3">
                            <FormControl>
                              <RadioGroupItem value="Approved" />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">
                              Approved
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3">
                            <FormControl>
                              <RadioGroupItem value="Denied" />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">
                              Denied
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Comments:
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter comments..."
                          className="min-h-[60px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!selectedType || form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </CardContent>

      {/* Report Dialog */}
      <Dialog open={openReport} onOpenChange={setOpenReport}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Report</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <NewReportTab
              reportData={reportData}
              onSubmitted={() => {
                setOpenReport(false);
                notifySuccess('Report submitted successfully');
                return true;
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WorkExpVerificationCard;
