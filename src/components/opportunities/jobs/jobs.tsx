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
import { getStatusBadge } from '@/utils/statusBadge';
interface JobCardProps {
  id: string;
  projectName: string;
  description: string;
  companyName: string;
  email: string;
  skillsRequired: string[];
  status: string | undefined;
  team: string[] | undefined;
}



const JobCard: React.FC<JobCardProps> = ({
  id,
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
  const { text, className } = getStatusBadge(status);

  return (
    <Card className="w-full max-w-4xl hover:border-gray-600 hover:border hover:shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold">{projectName}</CardTitle>
        <div className="h-[1px] bg-gray-600 mt-2 mb-4" />
      </CardHeader>
      <CardContent className="space-y-4 ml-4">
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4" />
          <p className="ml-2">{companyName}</p>
        </div>
        <Badge className={className}>{text}</Badge>
        <CardDescription>
          <p className="text-gray-600">{description}</p>
        </CardDescription>
        <div className="flex items-center text-gray-600">
          <Mail className="h-4 w-4 text-gray-600" />
          <p className="ml-2 text-sm">{email}</p>
        </div>
        <div className="mt-4">
          <p className="font-medium">Skills Required:</p>
          <div className="mt-4">
            {skillsRequired?.map((skill, index) => (
              <Badge key={index} className="mr-2 mb-2 uppercase">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {team && team?.length > 0 && (
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
        )}

        <div className="flex mt-4 space-x-4">
          <Button>
            <Link href={`/freelancer/project/${id}`}>View</Link>
          </Button>
          <Button className="cursor-pointer text-white bg-muted hover:bg-muted">
            Not interested
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
