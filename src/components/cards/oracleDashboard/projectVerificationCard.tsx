'use client';
import React, { useEffect, useState } from 'react';
import {
  MessageSquareIcon,
  Github,
  Mail,
  MoreVertical,
  CircleAlert,
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { NewReportTab } from '@/components/report-tabs/NewReportTabs';
import { RootState } from '@/lib/store';
import { getReportTypeFromPath } from '@/utils/getReporttypeFromPath';
interface ProjectProps {
  _id: string;
  projectName: string;
  description: string;
  githubLink: string;
  startFrom: string;
  endTo: string | 'current';
  reference: string;
  techUsed: string[];
  comments: string;
  role: string;
  projectType: string;
  status: string | 'Pending';
  onStatusUpdate: (newStatus: string) => void;
  onCommentUpdate: (newComment: string) => void;
}

const FormSchema = z.object({
  type: z.enum(['Approved', 'Denied'], {
    required_error: 'You need to select a type.',
  }),
  comment: z.string().optional(),
});

const ProjectVerificationCard: React.FC<ProjectProps> = ({
  _id,
  projectName,
  githubLink,
  startFrom,
  endTo,
  reference,
  techUsed,
  comments,
  status,
  role,
  projectType,
  onStatusUpdate,
  onCommentUpdate,
}) => {
  const [verificationStatus, setVerificationStatus] = useState(status);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const selectedType = form.watch('type');
  const [openReport, setOpenReport] = useState(false);

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
    reportedId: user?.uid, // project ID
  };
  useEffect(() => {
    setVerificationStatus(status);
  }, [status]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await axiosInstance.put(`/verification/${_id}/oracle?doc_type=project`, {
        comments: data.comment,
        verification_status: data.type,
      });

      // Success message based on the action
      const statusMessage =
        data.type === 'Approved'
          ? 'Project verification approved successfully'
          : 'Project verification denied successfully';
      notifySuccess(statusMessage);

      setVerificationStatus(data.type);
      onStatusUpdate(data.type);
      onCommentUpdate(data.comment || '');
    } catch (error) {
      notifyError('Something went wrong. Please try again.', 'Error');
    }
  }

  return (
    <TooltipProvider>
      <Card className="group relative overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 bg-muted-foreground/20 dark:bg-muted/20">
        <CardHeader className="pb-3 px-6 pt-6 relative">
          <div className="absolute top-4 right-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-44" align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setOpenReport(true);
                    notifySuccess('Report dialog opened');
                  }}
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                >
                  <CircleAlert className="mr-2 h-4 w-4" />
                  <span>Report</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 rounded-xl border border-gray-200 dark:border-gray-700">
              <AvatarImage
                src="/placeholder-avatar.svg"
                alt={projectName || 'Project'}
              />
              <AvatarFallback className="bg-primary/10 text-primary rounded-xl text-xl font-bold">
                {projectName?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center w-full gap-2">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors max-w-[calc(100%-80px)]">
                  {projectName}
                </CardTitle>
              </div>

              <div className="mt-1 flex items-center gap-2 flex-wrap">
                {verificationStatus === 'Pending' ||
                verificationStatus === 'added' ||
                verificationStatus === 'reapplied' ? (
                  <Badge className="bg-warning-foreground text-white">
                    {verificationStatus}
                  </Badge>
                ) : verificationStatus === 'Approved' ||
                  verificationStatus === 'Verified' ||
                  verificationStatus === 'verified' ? (
                  <Badge className="bg-success text-white">
                    {verificationStatus}
                  </Badge>
                ) : (
                  <Badge className="bg-red-500 text-white">Denied</Badge>
                )}
              </div>

              <CardDescription className="mt-2 text-gray-700 dark:text-gray-300 line-clamp-2">
                {githubLink && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                        aria-label="Open GitHub repo"
                      >
                        <a href={githubLink} target="_blank" rel="noreferrer">
                          <Github className="h-4 w-4" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">View GitHub</TooltipContent>
                  </Tooltip>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {role}
              </p>
            </div>
            <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Project Type
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {projectType}
              </p>
            </div>
            <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">Start</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(startFrom).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">End</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {endTo !== 'current'
                  ? new Date(endTo).toLocaleDateString()
                  : 'Current'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 mt-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Tech Used
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {(techUsed || []).map((tech, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="rounded-full text-xs font-medium px-3 py-1 bg-primary/5 hover:bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/10 dark:border-primary/30 transition-all duration-200"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{reference}</span>
                </p>
              </TooltipTrigger>
              <TooltipContent side="bottom">{reference}</TooltipContent>
            </Tooltip>
          </div>

          {comments && (
            <div className="mt-4 flex items-start text-gray-600 dark:text-gray-300 bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 p-3 rounded-lg">
              <MessageSquareIcon className="mr-2 h-4 w-4 mt-0.5" />
              <p className="text-sm">{comments}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-6 py-5 bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex-col items-stretch gap-4">
          {(verificationStatus === 'Pending' ||
            verificationStatus === 'added' ||
            verificationStatus === 'reapplied') && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6"
              >
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Choose Verification Status</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col sm:flex-row gap-4"
                        >
                          <FormItem className="flex items-center space-x-3">
                            <FormControl>
                              <RadioGroupItem value="Approved" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Approved
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3">
                            <FormControl>
                              <RadioGroupItem value="Denied" />
                            </FormControl>
                            <FormLabel className="font-normal">
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
                      <FormLabel>Comments</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter comments" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                  disabled={!selectedType || form.formState.isSubmitting}
                >
                  Submit
                </Button>
              </form>
            </Form>
          )}
        </CardFooter>

        {/* Hover effect border */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 dark:group-hover:border-primary/30 rounded-xl pointer-events-none transition-all duration-300"></div>

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
    </TooltipProvider>
  );
};

export default ProjectVerificationCard;
