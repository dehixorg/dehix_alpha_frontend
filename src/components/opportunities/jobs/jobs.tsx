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

interface Profile {
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
  team: string[] | undefined;
  profiles: Profile[];
}

const getStatusBadge = (status: string | undefined) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return { text: 'ACTIVE', className: 'bg-blue-500 hover:bg-blue-600' };
    case 'pending':
      return { text: 'PENDING', className: 'bg-warning hover:bg-warning' };
    case 'completed':
      return { text: 'COMPLETED', className: 'bg-success hover:bg-success' };
    case 'rejected':
      return { text: 'REJECTED', className: 'bg-red-500 hover:bg-red-600' };
    default:
      return { text: 'UNKNOWN', className: 'bg-gray-500 hover:bg-gray-600' };
  }
};

const JobCard: React.FC<JobCardProps> = ({
  id,
  projectName,
  description,
  companyName,
  email,
  skillsRequired,
  status,
  team,
  profiles,
}) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }
  const { text, className } = getStatusBadge(status);

  return (
    <Card className="w-full max-w-4xl hover:border-gray-600 hover:shadow-lg transition-shadow border border-gray-300 rounded-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold text-gray-300">
          {projectName}
        </CardTitle>

        {/* <div className=" h-[1px] bg-gray-300 mt-4 mb-4" /> */}
      </CardHeader>

      <CardContent className="ml-4 space-y-4">
        <div className="flex justify-between">
          {/* Left section */}
          <div className="flex flex-col">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4" />
              <p className="ml-2 mr-2">{companyName}</p>
              <Badge className={className}>{text}</Badge>
            </div>

            <div className="flex items-center text-gray-600">
              <Mail className="h-4 w-4" />
              <p className="ml-2 text-sm">{email}</p>
            </div>

            <CardDescription>
              <p className="text-gray-600 mt-3 text-justify">{description}</p>
            </CardDescription>
          </div>

          {/* Right section */}
          <div className="flex flex-col items-end space-y-4">
            <div>
              <p className="font-medium text-gray-700">Skills Required:</p>
              <div className="mt-2 flex flex-wrap">
                {skillsRequired?.map((skill: any, index: number) => (
                  <Badge
                    key={index}
                    className="mr-2 mb-2 uppercase bg-gray-100 text-gray-700 px-3 py-1 rounded"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {team && team.length > 0 && (
              <div>
                <p className="font-medium text-gray-700">Team Members:</p>
                <div className="mt-2 flex flex-wrap">
                  {team.map((member: any, index: number) => (
                    <Badge
                      key={index}
                      className="mr-2 mb-2 uppercase bg-gray-100 text-gray-700 px-3 py-1 rounded"
                    >
                      {member}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                <Link href={`/freelancer/project/${id}`}>View</Link>
              </Button>
              <Button className="bg-gray-500 text-white hover:bg-gray-600">
                Not Interested
              </Button>
            </div>
          </div>
        </div>

        {/* New Profile Section */}
        <div className="mt-10 hover:bg-muted hover:bg-opacity-10">
          <hr className="w-full flex justify-end my-4 border border-muted border-opacity-10" />
          {profiles && profiles.length > 0 && (
            <div className="space-y-4">
              {profiles.map((profile: any, index: number) => (
                <ProfileCard key={index} profile={profile} projectId={id} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
