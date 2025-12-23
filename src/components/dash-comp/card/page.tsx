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
    <div className="flex justify-center py-2">
    <Card className="w-full max-w-md rounded-lg shadow-md bg-white">
      <CardHeader className="px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-base sm:text-lg font-medium text-gray-900">
            {title}
          </CardTitle>
  
          <CustomIcon
            width={20}
            height={20}
            viewBox="0 0 24 24"
            className="w-5 h-5 text-gray-500"
            path="..."
          />
        </div>
  
        <Button variant="outline" className="text-xs sm:text-sm">
          {buttonText}
        </Button>
      </CardHeader>
  
      <CardContent className="px-4 py-3">
        <p className="text-sm text-black">{content}</p>
      </CardContent>
    </Card>
  </div>
  
  );
};

export default ProjectCard;
