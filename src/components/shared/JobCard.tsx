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
import { getReportTypeFromPath } from '@/utils/getReporttypeFromPath';
import { Project } from '@/app/freelancer/market/page';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
import {
  addDraftedProject,
  removeDraftedProject,
} from '@/lib/projectDraftSlice';

// Simple loader/spinner component (you can replace with your own)
const Loader = () => (
  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
);

interface JobCardProps {
  job: Project;
  onApply: () => void;
  onNotInterested: () => void;
  bidExist: boolean;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onApply,
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
  const [menuOpen, setMenuOpen] = useState(false);
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
    <Card className="w-[97%]">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{job.projectName} </CardTitle>
            <CardDescription className="mt-1">
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
                className={`w-5 h-5 cursor-pointer ${isDrafted ? 'fill-red-600 text-red-600' : 'hover:fill-red-700 hover:text-red-700'}`}
                onClick={
                  loading ? undefined : isDrafted ? handleUnlike : handleLike
                }
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-500 hover:text-gray-800 p-0 h-6 w-6"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>

            {menuOpen && (
              <div className="absolute right-0 top-6 w-32 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
                <button
                  onClick={() => {
                    setOpenReport(true);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Report
                </button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className={`text-sm text-gray-500 ${!expanded && 'line-clamp-3'}`}>
          {job.description}
        </p>
        {job.description && job.description.length > 150 && (
          <button
            onClick={toggleExpand}
            className="text-primary text-sm mt-1 hover:underline"
          >
            {expanded ? 'less' : 'more'}
          </button>
        )}

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Skills required</h4>
          <div className="flex flex-wrap gap-2">
            {job.skillsRequired &&
              job.skillsRequired.map((skill, index) => (
                <Badge key={index} variant="secondary" className="rounded-md">
                  {skill}
                </Badge>
              ))}
          </div>
        </div>

        {profile && (
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {profile.positions && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                  {profile.positions} Positions
                </span>
              )}
              {profile.years && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                  {profile.years} Years
                </span>
              )}
            </div>
            {profile.connectsRequired && (
              <div className="mt-2 text-sm">
                Connects required:{' '}
                <span className="font-medium">{profile.connectsRequired}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
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
        <Link href={`/freelancer/market/project/${job._id}/apply`}>
          <Button type="submit" className="" size="sm" disabled={bidExist}>
            {bidExist ? 'Applied' : 'Bid'}
          </Button>
        </Link>
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
