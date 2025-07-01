import * as React from 'react';
import {
  Mail,
  Building2,
  Eye,
  XCircle,
  ChevronDown,
  ChevronUp,
  MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProfileCard from '@/components/opportunities/jobs/profileCard';
import { getStatusBadge } from '@/utils/statusBadge';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
import { toast } from '@/components/ui/use-toast';
import { useState } from 'react';
import { NewReportTab } from '@/components/report-tabs/NewReportTabs';
import { getReportTypeFromPath } from '@/utils/getReporttypeFromPath';
import { usePathname } from 'next/navigation';
interface Profile {
  _id?: string;
  domain?: string;
  freelancersRequired?: string;
  skills?: string[];
  experience?: number;
  minConnect?: number;
  rate?: number;
}

interface JobCardProps {
  id: string;
  companyId: string;
  projectName: string;
  description: string;
  companyName: string;
  email: string;
  skillsRequired: string[];
  status: string | undefined;
  profiles: Profile[];
  onRemove: (id: string) => void;
  onInvite?: (id: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({
  id,
  companyId,
  projectName,
  description,
  companyName,
  email,
  skillsRequired,
  status,
  profiles,
  onRemove,
  onInvite,
}) => {
  const user = useSelector((state: RootState) => state.user);
  const [isClient, setIsClient] = React.useState(false);
  const [showAllSkills, setShowAllSkills] = React.useState(false);
  const [showFullDescription, setShowFullDescription] = React.useState(false); // State for description
  const [bidProfiles, setBidProfiles] = React.useState<string[]>([]); // Store profile IDs from API
  const [openReport, setOpenReport] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

const pathname=usePathname()
  
  const reportType = getReportTypeFromPath(pathname);
  const reportData = {
    subject: "",
    description: "",
    report_role: user?.type || "STUDENT",
    report_type: reportType,
    status: "OPEN",
    reportedbyId: user?.uid || "user123",
    reportedId:user?.uid || "user123", // or whoever is being reported
  };
  // Fetch bid data from the API
  const fetchBidData = React.useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/bid/${user.uid}/bid`);
      const profileIds = response.data.data.map((bid: any) => bid.profile_id); // Extract profile_ids
      setBidProfiles(profileIds);
    } catch (error) {
      console.error('API Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      }); // Error toast
    }
  }, [user.uid]);

  React.useEffect(() => {
    setIsClient(true);
    fetchBidData(); // Fetch data on mount
  }, [fetchBidData]);

  if (!isClient) {
    return null;
  }

  const { text, className } = getStatusBadge(status);

  const remainingSkillsCount = skillsRequired.length - 2;
  const charLimit = 60;
  const isDescriptionLong = description.length > charLimit;

  const notInterestedProject = async (_id: string) => {
    await axiosInstance.put(`/freelancer/${_id}/not_interested_project`);
    onRemove(_id);
  };

  // Safely handle invite
  const handleInviteClick = () => {
    if (onInvite) {
      onInvite(id);
    } else {
      toast({
        title: 'Invitation sent',
        description: 'Your invitation has been sent successfully',
      });
    }
  };

  return (
    <Card className="sm:mx-10 max-w-3xl mb-8 hover:border-gray-600 hover:shadow-lg transition-shadow rounded-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg sm:text-2xl font-bold text-foreground">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-600 gap-2">
            <div className="flex items-center flex-wrap dark:text-white">
              <Link href={`/freelancer/market/${companyId}`} passHref>
                <span className="mr-2">{projectName}</span>
              </Link>
              <Badge className={className}>{text}</Badge>
            </div>

            {/* Action Buttons - Responsive Layout */}
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:space-x-2">
              {/* View Button */}
              <Link
                href={`/freelancer/project/${id}`}
                passHref
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  className="w-full sm:w-auto dark:text-white"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  <span>View</span>
                </Button>
              </Link>

              {/* Invite Button */}
              <Button
                onClick={handleInviteClick}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                size="sm"
              >
                <span>Invite</span>
              </Button>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="text-gray-500 hover:text-gray-800"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-32 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
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
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="gap-6">
          {/* Left section */}
          <div className="space-y-4">
            <div className="flex items-center text-gray-500">
              <Building2 className="w-4 h-4 flex-shrink-0" />
              <p className="ml-2 mr-2 truncate">{companyName}</p>
            </div>
            <div className="flex items-center text-gray-500">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <p className="ml-2 truncate">{email}</p>
            </div>

            {/* Description - Improved Spacing */}
            <div className="flex flex-col">
              <p className="text-gray-400 break-words mt-2">
                {showFullDescription
                  ? description
                  : description.slice(0, charLimit) +
                    (isDescriptionLong ? '...' : '')}
              </p>
              {isDescriptionLong && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex items-center text-sm cursor-pointer self-end px-2"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? 'Less' : 'More'}
                  {showFullDescription ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            {/* Skills Section */}
            <div className="mt-4 flex flex-wrap">
              {skillsRequired
                .slice(0, 2)
                .map((skill: string, index: number) => (
                  <Badge
                    key={index}
                    className="mr-2 mb-2 uppercase bg-foreground text-background px-2 py-1 text-xs rounded-full"
                  >
                    {skill}
                  </Badge>
                ))}

              {remainingSkillsCount > 0 && !showAllSkills && (
                <span
                  onClick={() => setShowAllSkills(true)}
                  className="ml-2 text-gray-200 cursor-pointer text-sm"
                >
                  +{remainingSkillsCount} more
                </span>
              )}

              {showAllSkills &&
                skillsRequired.slice(2).map((skill: string, index: number) => (
                  <Badge
                    key={index + 2}
                    className="mr-2 mb-2 uppercase bg-foreground text-background px-2 py-1 text-xs rounded-full"
                  >
                    {skill}
                  </Badge>
                ))}
            </div>
          </div>
        </div>

        {/* Profiles Section */}
        <div className="mt-4 hover:bg-opacity-10">
          <hr className="w-full flex justify-end my-4 border border-muted border-opacity-10" />
          {profiles && profiles.length > 0 && (
            <div className="space-y-4">
              {profiles.map((profile: Profile, index: number) => (
                <ProfileCard
                  key={index}
                  profile={profile}
                  projectId={id}
                  bidExist={bidProfiles.includes(profile._id || '')} // Pass status based on match
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
