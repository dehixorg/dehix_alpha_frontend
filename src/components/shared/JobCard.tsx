import React, { useState } from 'react';
import {
  EyeOff,
  MoreVertical,
  Clock,
  DollarSign,
  Calendar,
  Briefcase,
  Bookmark,
  Share2,
  CircleAlert,
  Users,
  Zap,
  X,
  ChevronRight,
  Dot,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { NewReportTab } from '../report-tabs/NewReportTabs';
import { getReportTypeFromPath } from '../../utils/getReporttypeFromPath';

import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { AppDispatch, RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import {
  addDraftedProject,
  removeDraftedProject,
} from '@/lib/projectDraftSlice';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface Project {
  _id: string;
  projectName: string;
  projectDomain?: string[];
  description?: string;
  status?: string;
  position?: string;
  skillsRequired?: string[];
  companyName?: string;
  email?: string;
  url?: string[];
  profiles?: Array<{
    domain?: string;
    domain_id?: string;
    profileType?: string;
    freelancersRequired?: string;
    skills?: string[];
    experience?: number;
    minConnect?: number;
    rate?: number;
    selectedFreelancer?: any[];
    budget?: {
      type: string;
      fixedAmount?: number;
      hourlyRate?: number;
      min?: number;
      max?: number;
    };
    totalBid?: any[];
    freelancers?: any[];
    team?: any[];
    positions?: number;
    years?: number | string;
    connectsRequired?: number;
  }>;
  createdAt?: string | Date;
  location?: string;
  budget?: number | string;
  duration?: string;
  progress?: number;
  deadline?: string;
  proposals?: number;
  updatedAt?: string | Date;
}

// Simple loader/spinner component
const Loader = () => (
  <motion.div
    className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full"
    animate={{ rotate: 360 }}
    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
  />
);

interface JobCardProps {
  job: Project;
  onNotInterested: () => void;
  bidCount: number;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onNotInterested,
  bidCount,
}) => {
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const { draftedProjects } = useSelector(
    (state: RootState) => state.projectDraft,
  );

  const isDrafted = draftedProjects?.includes(job._id);
  const user = useSelector((state: RootState) => state.user);

  const [openReport, setOpenReport] = useState(false);
  const pathname = usePathname();
  const reportType = getReportTypeFromPath(pathname);
  const reportData = {
    subject: '',
    description: '',
    report_role: user?.type || 'STUDENT',
    report_type: reportType,
    status: 'OPEN',
    reportedbyId: user?.uid || 'user123',
    reportedId: job._id,
  };
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up to the card
    if (loading) return;

    setLoading(true);
    try {
      const response = await axiosInstance.put(`/freelancer/draft`, {
        project_id: job._id,
      });

      if (response.status === 200) {
        dispatch(addDraftedProject(job._id));
        notifySuccess(
          'You can find this project in your saved items.',
          'Added to saved projects',
        );
      }
    } catch (error: any) {
      console.error('Failed to add project to draft:', error);
      notifyError(
        error.response?.data?.message || 'Failed to save project',
        'Error',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up to the card
    if (loading) return;

    setLoading(true);
    try {
      const response = await axiosInstance.delete('/freelancer/draft', {
        data: { project_id: job._id },
      });

      if (response.status === 200) {
        dispatch(removeDraftedProject(job._id));
        notifySuccess(
          'This project has been removed from your saved items.',
          'Removed from saved projects',
        );
      }
    } catch (error: any) {
      console.error('Failed to remove project from draft:', error);
      notifyError(
        error.response?.data?.message || 'Failed to remove project',
        'Error',
      );
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();

  const profile =
    job.profiles && job.profiles.length > 0 ? job.profiles[0] : null;

  // Format date with type safety
  const formatDate = (dateString?: string | Date): string => {
    if (!dateString) return 'N/A';
    try {
      const date =
        dateString instanceof Date ? dateString : new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  return (
    <TooltipProvider>
      <motion.div
        className="w-full max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="group relative overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 bg-muted-foreground/20 dark:bg-muted/20">
          <CardHeader className="pb-2 px-6 pt-6">
            <div className="flex flex-col space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-start space-x-4 w-full">
                  <Avatar className="h-14 w-14 rounded-xl border border-gray-200 dark:border-gray-700">
                    <AvatarImage
                      src="/placeholder-avatar.svg"
                      alt={job.companyName || 'Company'}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary rounded-xl text-xl font-bold">
                      {job.projectName?.charAt(0) || 'P'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start w-full gap-2">
                      <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors max-w-[calc(100%-80px)]">
                        {job.projectName || 'Untitled Project'}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-9 w-9 rounded-full ${
                                isDrafted
                                  ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!loading) {
                                  isDrafted ? handleUnlike(e) : handleLike(e);
                                }
                              }}
                            >
                              {loading ? (
                                <Loader />
                              ) : (
                                <Bookmark
                                  className={`h-4 w-4 ${isDrafted ? 'fill-current' : ''}`}
                                />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {isDrafted ? 'Remove from saved' : 'Save project'}
                          </TooltipContent>
                        </Tooltip>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="w-48"
                            align="end"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenReport(true);
                              }}
                              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                            >
                              <CircleAlert className="mr-2 h-4 w-4" />
                              <span>Report</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Share2 className="mr-2 h-4 w-4" />
                              <span>Share</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onNotInterested();
                              }}
                              className="text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer"
                            >
                              <EyeOff className="mr-2 h-4 w-4" />
                              <span>Not Interested</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center">
                      {job.companyName && job.companyName !== 'null' && (
                        <span className="text-xs font-medium text-primary dark:text-primary-300 flex items-center">
                          <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                          {job.companyName}
                        </span>
                      )}

                      {job.projectDomain && job.projectDomain.length > 0 && (
                        <span className="text-xs font-medium text-primary dark:text-primary-300 flex items-center">
                          {job.companyName && job.companyName !== 'null' && (
                            <Dot className="text-muted-foreground" />
                          )}
                          {job.projectDomain[0]}
                        </span>
                      )}

                      {profile?.experience && (
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Dot />
                          {profile.experience}+ years experience
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Description */}
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mt-2">
                {job.description || 'No description provided for this project.'}
              </p>
            </div>
          </CardHeader>

          <CardContent className="px-6 py-3">
            {/* Skills & Requirements */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center">
                <Zap className="h-4 w-4 mr-2 text-amber-500" />
                Skills Required
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {(job.skillsRequired || []).map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="rounded-full text-xs font-medium px-3 py-1 bg-primary/5 hover:bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/10 dark:border-primary/30 transition-all duration-200 hover:border-primary/20 hover:shadow-sm"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Project Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                    <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Budget
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {profile?.budget?.type === 'FIXED'
                        ? `$${profile.budget.fixedAmount}`
                        : profile?.budget?.type === 'HOURLY'
                          ? `$${profile.budget.hourlyRate}/hr`
                          : profile?.budget?.min && profile?.budget?.max
                            ? `$${profile.budget.min} - $${profile.budget.max}`
                            : 'Negotiable'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/30">
                    <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Positions
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {profile?.freelancersRequired || '1'}{' '}
                      {profile?.freelancersRequired === '1'
                        ? 'Position'
                        : 'Positions'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/30">
                    <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Posted
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {job.createdAt
                        ? formatDistanceToNow(new Date(job.createdAt), {
                            addSuffix: true,
                          })
                        : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/30">
                    <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {job.deadline ? 'Apply before' : 'Duration'}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {job.deadline
                        ? formatDate(job.deadline)
                        : job.duration || 'Flexible'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Progress */}
            {job.progress !== undefined && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Project Progress
                  </span>
                  <span className="text-xs font-medium text-primary dark:text-primary-400">
                    {job.progress}%
                  </span>
                </div>
                <Progress value={job.progress} className="h-2" />
              </div>
            )}
          </CardContent>

          <CardFooter className="px-6 py-4 bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <span>
                    {bidCount > 0
                      ? `${bidCount} ${bidCount === 1 ? 'proposal' : 'proposals'}`
                      : 'No proposals yet'}
                  </span>
                </div>
                {job.updatedAt && (
                  <div className="hidden sm:flex items-center">
                    <Dot />
                    <span>
                      Updated{' '}
                      {formatDistanceToNow(new Date(job.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-md hover:shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/freelancer/market/project/${job._id}/apply`);
                  }}
                >
                  <span>Apply Now</span>
                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardFooter>

          {/* Hover effect border */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 dark:group-hover:border-primary/30 rounded-xl pointer-events-none transition-all duration-300"></div>
        </Card>

        {/* Report Dialog */}
        {openReport && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg p-6 w-full max-w-md relative">
              <button
                onClick={() => setOpenReport(false)}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
              <NewReportTab
                reportData={{
                  ...reportData,
                  report_role: 'freelancer',
                  report_type: 'project',
                  reportedId: job._id,
                }}
                onSubmitted={() => {
                  setOpenReport(false);
                  return true;
                }}
              />
            </div>
          </div>
        )}
      </motion.div>
    </TooltipProvider>
  );
};

export default JobCard;
