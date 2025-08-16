import React, { useState } from 'react';
import { Heart, Eye, EyeOff, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { usePathname } from 'next/navigation';

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

import ProjectDrawer from './ProjectDrawer';

import { NewReportTab } from '@/components/report-tabs/NewReportTabs';
import { getReportTypeFromPath } from '@/utils/getReportTypeFromPath';
import { Project } from '@/app/freelancer/market/page';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
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

// Simple loader/spinner component (you can replace with your own)
const Loader = () => (
  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
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
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const draftedProjects = useSelector(
    (state: RootState) => state.projectDraft.draftedProjects,
  );

  const isDrafted = draftedProjects?.includes(job._id);
  const user = useSelector((state: RootState) => state.user);

  const toggleExpand = () => setExpanded(!expanded);
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
    setLoading(true); // start loading
    try {
      const response = await axiosInstance.put(`/freelancer/draft`, {
        project_id: job._id,
      });

      if (response.status === 200) {
        dispatch(addDraftedProject(job._id));
      }
    } catch (error) {
      console.error('Failed to add project to draft:', error);
    } finally {
      setLoading(false); // stop loading
    }
  };

  const handleUnlike = async () => {
    setLoading(true); // start loading
    try {
      const response = await axiosInstance.delete('/freelancer/draft', {
        data: { project_id: job._id },
      });

      if (response.status === 200) {
        dispatch(removeDraftedProject(job._id));
      }
    } catch (error) {
      console.error('Failed to remove project from draft:', error);
    } finally {
      setLoading(false); // stop loading
    }
  };

  const profile =
    job.profiles && job.profiles.length > 0 ? job.profiles[0] : null;

  return (
    <Card className="w-[100%] max-w-3xl lg:max-w-4xl mx-auto shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-4">
            <CardTitle className="text-xl lg:text-2xl font-semibold">
              {job.projectName}{' '}
            </CardTitle>
            <CardDescription className="mt-2 text-sm lg:text-base">
              Position: {job.position || 'Web developer'} · Exp:{' '}
              {profile?.years || '2'} yrs
            </CardDescription>
          </div>
          <div className="flex justify-between items-center gap-3">
            {job.status && (
              <Badge
                variant="outline"
                className={
                  job.status.toLowerCase() === 'pending'
                    ? 'bg-amber-300/10 text-amber-500 border-amber-500/20'
                    : 'bg-green-500/10 text-green-500 border-green-500/20'
                }
              >
                {job.status}
              </Badge>
            )}

            {loading ? (
              <Loader />
            ) : (
              <Heart
                className={`w-5 h-5 cursor-pointer ${isDrafted ? 'fill-red-600 text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={
                  loading ? undefined : isDrafted ? handleUnlike : handleLike
                }
              />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-gray-100 p-0 h-6 w-6 focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-32 z-50"
                sideOffset={4}
              >
                <DropdownMenuItem
                  onClick={() => setOpenReport(true)}
                  className="text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Description Section */}
          <div className="lg:col-span-3">
            <p
              className={`text-sm lg:text-base text-gray-500 leading-relaxed ${!expanded && 'line-clamp-3'}`}
            >
              {job.description}
            </p>
            {job.description && job.description.length > 150 && (
              <button
                onClick={toggleExpand}
                className="text-primary text-sm mt-2 hover:underline font-medium"
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}

            <div className="mt-6">
              <h4 className="text-sm lg:text-base font-semibold mb-3">
                Skills required
              </h4>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired &&
                  job.skillsRequired.map((skill, index) => (
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
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-6">
        <div className="flex flex-wrap gap-2 text-xs lg:text-sm text-muted-foreground">
          <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNotInterested}
            className="text-gray-500"
          >
            <EyeOff className="h-4 w-4 mr-1" />
            Not Interested
          </Button>
          <ProjectDrawer
            icon={<Eye className="h-4 w-4 mr-1" />}
            project={job}
            text="View"
            isSizeSmall={true}
          />
          <Link
            href={`/freelancer/market/project/${job._id}/apply`}
            className="flex-1 w-flex-none"
          >
            <Button
              type="submit"
              className="w-full"
              size="sm"
              disabled={bidExist}
            >
              {bidExist ? 'Applied' : 'Bid'}
            </Button>
          </Link>
        </div>
      </CardFooter>
      {openReport && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-md w-full max-w-lg relative shadow-lg">
            <button
              onClick={() => setOpenReport(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
            >
              ✕
            </button>
            <NewReportTab reportData={reportData} />
          </div>
        </div>
      )}
    </Card>
  );
};

export default JobCard;
