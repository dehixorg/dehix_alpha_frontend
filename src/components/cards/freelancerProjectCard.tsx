import React from 'react';
import { Github, MessageSquareIcon } from 'lucide-react';
import DateRange from './dateRange';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';

interface ProjectProps {
  _id: string;
  projectName: string;
  description: string;
  verified: boolean;
  githubLink: string;
  start: string;
  end: string;
  refer: string;
  techUsed: string[];
  role: string;
  projectType: string;
  oracleAssigned: string | null;
  verificationUpdateTime: string;
  comments: string;
}

const ProjectCard: React.FC<ProjectProps> = ({
  projectName,
  description,
  verified,
  githubLink,
  start,
  end,
  refer,
  techUsed,
  role,
  projectType,
  comments,
}) => {
  // Extract thumbnail URL from comments
  const thumbnailUrl = comments?.match(/THUMBNAIL:(.+?)(\s|\|)/)?.[1] || 
                      comments?.match(/THUMBNAIL:(.+)/)?.[1];

  // Get clean comments (without thumbnail URL)
  const cleanComments = thumbnailUrl 
    ? comments.replace(`THUMBNAIL:${thumbnailUrl}`, '').replace(/^\s*\|\s*/, '')
    : comments;

  return (
    <Card className="w-full h-full mx-auto md:max-w-2xl relative group overflow-hidden">
      {/* Background image with overlay */}
      {thumbnailUrl && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-300 group-hover:scale-105"
            style={{ 
              backgroundImage: `url(${thumbnailUrl})`,
              filter: 'blur(0px)'
            }}
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        </>
      )}

      {/* Card content */}
      <div className="relative z-10 h-full flex flex-col">
        <CardHeader className="flex-grow-0">
          <CardTitle className="flex text-white drop-shadow-md">
            {projectName}
            {githubLink && (
              <div className="ml-auto">
                <a
                  href={githubLink}
                  className="text-white hover:text-gray-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github />
                </a>
              </div>
            )}
          </CardTitle>
          <CardDescription className="text-gray-200 mt-1 uppercase tracking-wide leading-tight font-medium">
            {projectType}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow">
          {verified ? (
            <Badge className="bg-green-600 hover:bg-green-700 text-white">VERIFIED</Badge>
          ) : (
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">PENDING</Badge>
          )}
          <p className="text-gray-100 pt-4 drop-shadow-md">{description}</p>

          {cleanComments?.trim() && (
            <p className="mt-2 flex items-start text-gray-200 bg-black/20 p-3 rounded-lg backdrop-blur-sm">
              <MessageSquareIcon className="flex-shrink-0 mt-1 mr-2" />
              {cleanComments}
            </p>
          )}
          
          <div className="mt-4">
            <p className="text-sm text-gray-200">Reference: {refer}</p>
          </div>
          <div className="my-4">
            <p className="text-sm text-gray-200">Role: {role}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {techUsed.map((tech: string, index: number) => (
              <Badge
                className="uppercase text-xs font-medium bg-white/90 hover:bg-white text-gray-800"
                key={index}
              >
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="flex-shrink-0">
          <DateRange startDate={start} endDate={end} />
        </CardFooter>
      </div>
    </Card>
  );
};

export default ProjectCard;