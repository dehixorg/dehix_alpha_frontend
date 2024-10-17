import * as React from 'react';
import { Mail, MapPin } from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProfileCard from '@/components/opportunities/jobs/profileCard';
import { getStatusBadge } from '@/utils/statusBadge';
import { axiosInstance } from '@/lib/axiosinstance';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

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
  projectName: string;
  description: string;
  companyName: string;
  email: string;
  skillsRequired: string[];
  status: string | undefined;
  profiles: Profile[];
  onRemove: (id: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({
  id,
  projectName,
  description,
  companyName,
  email,
  skillsRequired,
  status,
  profiles,
  onRemove,
}) => {
  const user = useSelector((state: RootState) => state.user);
  const [isClient, setIsClient] = React.useState(false);
  const [showAllSkills, setShowAllSkills] = React.useState(false);
  const [showFullDescription, setShowFullDescription] = React.useState(false); // State for description
  const [bidProfiles, setBidProfiles] = React.useState<string[]>([]); // Store profile IDs from API

  React.useEffect(() => {
    setIsClient(true);
    fetchBidData(); // Fetch data on mount
  }, []);

  // Fetch bid data from the API
  const fetchBidData = React.useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/bid/${user.uid}/bid`);
      const profileIds = response.data.data.map((bid: any) => bid.profile_id); // Extract profile_ids
      setBidProfiles(profileIds);
    } catch (error) {
      console.error('API Error:', error);
    }
  }, [user.uid]);

  if (!isClient) {
    return null;
  }

  const { text, className } = getStatusBadge(status);

  const remainingSkillsCount = skillsRequired.length - 2;
  const charLimit = 150;
  const isDescriptionLong = description.length > charLimit;

  const notIntrestedProject = async (_id: string) => {
    await axiosInstance.put(`/freelancer/${user.uid}/${_id}/not_interested_project`);
    onRemove(_id);
  };

  return (
    <Card className="sm:mx-10 max-w-3xl hover:border-gray-600 hover:shadow-lg transition-shadow rounded-lg">
      <CardHeader className="pb-3">
        <CardTitle className=" text-2xl font-bold text-foreground">
          <div className="flex items-center text-gray-600 gap-2">
            {projectName}
            <Badge className={className}> {text} </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="ml-4 space-y-4">
        <div className="flex flex-col lg:flex-row justify-between">
          {/* Left section */}
          <div className="flex flex-col items-start lg:items-start">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4" />
              <p className="ml-2 mr-2"> {companyName} </p>
            </div>
            <div className="flex items-center text-gray-600">
              <Mail className="h-4 w-4" />
              <p className="ml-2 text-sm"> {email} </p>
            </div>
            {/* Description */}
            <div className="mt-5 flex flex-wrap">
              <CardDescription>
                <span className="text-gray-400 text-justify">
                  {showFullDescription
                    ? description
                    : description.slice(0, charLimit) +
                      (isDescriptionLong ? '...' : '')}

                  {isDescriptionLong && (
                    <button
                      onClick={() =>
                        setShowFullDescription(!showFullDescription)
                      }
                      className="text-gray-400 ml-1 cursor-pointer"
                    >
                      {showFullDescription ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </span>
              </CardDescription>
            </div>
            {/* Skills Section */}
            <div className="mt-4 flex flex-wrap lg:justify-start">
              {skillsRequired
                .slice(0, 2)
                .map((skill: string, index: number) => (
                  <Badge
                    key={index}
                    className="mr-2 mb-2 uppercase bg-foreground text-background px-3 py-1 rounded-full"
                  >
                    {skill}
                  </Badge>
                ))}

              {remainingSkillsCount > 0 && !showAllSkills && (
                <span
                  onClick={() => setShowAllSkills(true)}
                  className="ml-2 text-gray-200 cursor-pointer"
                >
                  +{remainingSkillsCount} more
                </span>
              )}

              {showAllSkills &&
                skillsRequired.slice(2).map((skill: string, index: number) => (
                  <Badge
                    key={index + 2}
                    className="mr-2 mb-2 uppercase bg-foreground text-background px-3 py-1 rounded-full"
                  >
                    {skill}
                  </Badge>
                ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-4 lg:mt-0">
            <Link href={`/freelancer/project/${id}`} passHref>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                View
              </Button>
            </Link>
            <Button className="bg-gray-500 text-white hover:bg-gray-600" onClick={() => notIntrestedProject(id)}>
              Not Interested
            </Button>
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
