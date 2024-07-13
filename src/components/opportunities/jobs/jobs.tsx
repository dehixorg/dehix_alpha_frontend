import * as React from 'react';
import { MapPin, UsersRound } from 'lucide-react';

import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface JobsProps {
  heading: string;
  content?: string;
  skills: string[];
  location: string;
  founded: string;
  employees: string;
}

const Jobs: React.FC<JobsProps> = ({
  heading,
  content,
  skills,
  location,
  founded,
  employees,
}) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <Card className="w-auto">
      <CardContent>
        <div>
          <div className="flex-1">
            <div className="text-white text-lg font-medium items-center mt-4">
              {heading}
            </div>
            <CardDescription>
              <div className="flex">
                <MapPin className="w-4 h-4" />
                <p className="ml-2">{location}</p>
              </div>
              <div className="flex">
                <UsersRound className="w-4 h-4" />
                <p className="ml-2">
                  {founded} . {employees}
                </p>
              </div>
            </CardDescription>

            <CardDescription className="text-white text-l font-medium items-center">
              <p>{content}</p>
            </CardDescription>

            <CardDescription className="text-white text-lg font-medium items-center">
              <div>
                <p>
                  {skills.map((skill, index) => (
                    <Badge variant="outline" key={index} className="mr-2 mb-2">
                      {skill}
                    </Badge>
                  ))}
                </p>
              </div>
            </CardDescription>
          </div>
          <div className="flex">
            <div className="ml-5 mt-2">
              <Button className="w-23 h-7 rounded-full text-sm font-bold bg-green-500 hover:bg-green-600">
                View
              </Button>
            </div>
            <div className="ml-5 mt-3">
              <p className="cursor-pointer text-gray-500 hover:underline">
                Not interested
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Jobs;
