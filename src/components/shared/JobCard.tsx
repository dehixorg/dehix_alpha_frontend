import React, { useState } from 'react';
import {
  EyeOff,
  MoreVertical,
  Clock,
  MapPin,
  DollarSign,
  Calendar,
  Briefcase,
  Bookmark,
  Share2,
  X,
  CircleAlert,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';

import { toast } from '../ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { NewReportTab } from '../report-tabs/NewReportTabs';
import { getReportTypeFromPath } from '../../utils/getReporttypeFromPath';

import StatItem from './StatItem';

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
  description?: string;
  status?: string;
  position?: string;
  skillsRequired?: string[];
  profiles?: Array<{
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
}

// Simple loader/spinner component
const Loader = () => (
  <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
);

interface JobCardProps {
  job: Project;
  onNotInterested: () => void;
  bidExist: boolean;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onNotInterested,
  bidExist,
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

  const handleLike = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await axiosInstance.put(`/freelancer/draft`, {
        project_id: job._id,
      });

      if (response.status === 200) {
        dispatch(addDraftedProject(job._id));
        toast({
          title: 'Added to saved projects',
          description: 'You can find this project in your saved items.',
          variant: 'default',
        });
      }
    } catch (error: any) {
      console.error('Failed to add project to draft:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save project',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await axiosInstance.delete('/freelancer/draft', {
        data: { project_id: job._id },
      });

      if (response.status === 200) {
        dispatch(removeDraftedProject(job._id));
        toast({
          title: 'Removed from saved projects',
          description: 'This project has been removed from your saved items.',
          variant: 'default',
        });
      }
    } catch (error: any) {
      console.error('Failed to remove project from draft:', error);
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to remove project',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
    <>
      <div className="w-full max-w-4xl mx-auto">
        <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
          <CardHeader className="pb-3 px-6 pt-6">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <div className="bg-primary/10 p-2 rounded-lg w-full h-full flex items-center justify-center">
                      <Briefcase className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        {job.projectName || 'Untitled Project'}
                      </CardTitle>
                      {job.status && (
                        <Badge
                          variant="outline"
                          className={
                            job.status.toLowerCase() === 'pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800'
                          }
                        >
                          {job.status}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">
                        {job.position || 'Web Developer'}
                      </span>{' '}
                      • {profile?.years || '2'}+ years experience
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 ${isDrafted ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    onClick={
                      loading
                        ? undefined
                        : isDrafted
                          ? handleUnlike
                          : handleLike
                    }
                  >
                    {loading ? (
                      <Loader />
                    ) : (
                      <Bookmark
                        className={`h-4 w-4 ${isDrafted ? 'fill-current' : ''}`}
                      />
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-gray-500"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48" align="end">
                      <DropdownMenuItem
                        onClick={() => setOpenReport(true)}
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                      >
                        <CircleAlert className="mr-2 h-4 w-4" />
                        <span>Report</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Share2 className="mr-2 h-4 w-4" />
                        <span>Share</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={onNotInterested}
                        className="text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer"
                      >
                        <EyeOff className="mr-2 h-4 w-4" />
                        <span>Not Interested</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <StatItem
                  icon={<Clock className="h-4 w-4" />}
                  label="Posted"
                  value={job.createdAt ? formatDate(job.createdAt) : 'N/A'}
                  color="blue"
                  variant="card"
                  text_class="text-sm"
                />
                <StatItem
                  icon={<MapPin className="h-4 w-4" />}
                  label="Location"
                  value={job.location || 'Remote'}
                  color="green"
                  variant="card"
                  text_class="text-sm"
                />
                <StatItem
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Budget"
                  value={
                    job.budget
                      ? typeof job.budget === 'number'
                        ? `$${job.budget}`
                        : job.budget
                      : 'Negotiable'
                  }
                  color="amber"
                  variant="card"
                  text_class="text-sm"
                />
                <StatItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Duration"
                  value={job.duration || 'Flexible'}
                  variant="card"
                  text_class="text-sm"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-4">
            <div className="space-y-6">
              {/* Skills */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Skills Required
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(job.skillsRequired || []).map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="rounded-md text-xs lg:text-sm px-3 py-1"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Details Section */}
            <div className="lg:col-span-1 flex flex-col justify-between">
              {profile && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {profile.positions && (
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs lg:text-sm font-medium">
                        {profile.positions} Positions
                      </span>
                    )}
                    {profile.years && (
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs lg:text-sm font-medium">
                        {profile.years} Years
                      </span>
                    )}
                  </div>
                  {profile.connectsRequired && (
                    <div className="text-sm lg:text-base">
                      <span className="text-muted-foreground">
                        Connects required:
                      </span>{' '}
                      <span className="font-semibold text-foreground">
                        {profile.connectsRequired}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <FileText className="h-4 w-4 flex-shrink-0" />
                <span>{job.proposals || 0} proposals</span>
                {job.deadline && (
                  <span className="hidden sm:inline">
                    • Apply before {formatDate(job.deadline)}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Link
                  href={`/freelancer/market/project/${job._id}/apply`}
                  passHref
                >
                  <Button
                    variant="outline"
                    className="w-full"
                    size="sm"
                    disabled={bidExist}
                  >
                    {bidExist ? 'Applied' : 'Apply Now'}
                  </Button>
                </Link>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
      {openReport && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-md w-full max-w-lg relative shadow-lg">
            <button
              onClick={() => setOpenReport(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-medium mb-4">Report Project</h3>
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
    </>
  );
};

export default JobCard;
