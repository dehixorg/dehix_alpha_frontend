import * as React from 'react';
import { MapPin } from 'lucide-react';

import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProjectProps {
  projectName: string;
  description: string;
  companyName: string;
  email: string;
  start: string;
  end: string;
  skillsRequired: string[];
  experience: string;
  role: string;
  projectType: string;
  totalNeedOfFreelancer: {
    category: string;
    needOfFreelancer: number;
    appliedCandidates: string[];
    rejected: string[];
    accepted: string[];
    status: string;
  }[];
  status: string;
  team: string[];
}

const JobCard: React.FC<Partial<ProjectProps>> = ({
  projectName,
  description,
  companyName,
  email,
  skillsRequired,
  status,
  team,
}) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto p-4 mb-5">
      <CardContent>
        <div className="space-y-4">
          <div className="text-lg font-medium">{projectName}</div>
          <CardDescription>
            <p className="text-gray-600">{description}</p>
          </CardDescription>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4" />
            <p className="ml-2">{companyName}</p>
          </div>
          <div className="flex items-center text-gray-600">
            <p className="font-medium">Contact: </p>
            <p className="ml-2">{email}</p>
          </div>
          <div className="mt-4">
            <p className="font-medium">Skills Required:</p>
            <div className="mt-2">
              {skillsRequired?.map((skill, index) => (
                <Badge variant="outline" key={index} className="mr-2 mb-2">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="font-medium">Status: {status}</p>
          </div>

          <div className="mt-4">
            <p className="font-medium">Team:</p>
            <div className="mt-2">
              {team?.map((member, index) => (
                <Badge variant="outline" key={index} className="mr-2 mb-2">
                  {member}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex mt-4 space-x-4">
            <Button>View</Button>
            <Button className="cursor-pointer text-white bg-muted hover:bg-muted">
              Not interested
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
