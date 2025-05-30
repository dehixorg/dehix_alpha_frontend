import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CustomIcon from '@/components/SVGIcon';
interface ProjectCardProps {
  title: string;
  content: string;
  buttonText: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  content,
  buttonText,
}) => {
  return (
    <div className="flex justify-center p-4 rounded-md">
      <Card className="w-full md:max-w-lg rounded-lg shadow-md bg-white">
        <CardHeader className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2 p=10 m-10">
            <CardTitle className="text-lg font-medium text-gray-900 flex-grow">
              {title}
            </CardTitle>
            <div className="pl-5">
              <CustomIcon
                width={24}
                height={24}
                viewBox="0 0 24 24"
                className="w-6 h-6 text-gray-500"
                path="
                M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2
                M12 11h4
                M12 16h4
                M8 11h.01
                M8 16h.01
              "
              />
            </div>
          </div>
          <div className="m-6 p-6">
            <Button variant="outline" className="text-sm">
              {buttonText}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 py-3">
          <p className="text-black">{content}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectCard;
