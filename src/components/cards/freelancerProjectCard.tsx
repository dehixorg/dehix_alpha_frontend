import React, { useState } from 'react';
import { Github, ExternalLink, MessageSquare } from 'lucide-react';
import Image from 'next/image';

import DateRange from './dateRange';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

interface ProjectProps {
  _id: string;
  projectName: string;
  description: string;
  verified: boolean;
  githubLink: string;
  liveDemoLink?: string;
  thumbnail?: string;
  start: string;
  end: string;
  refer: string;
  techUsed: string[];
  role: string;
  projectType: string;
  oracleAssigned: string | null;
  verificationUpdateTime: string;
  comments: string;
  isViewOnly?: boolean;
  onClick?: () => void;
}

const ProjectCard: React.FC<ProjectProps> = ({
  projectName,
  description,
  githubLink,
  liveDemoLink,
  thumbnail,
  start,
  end,
  techUsed,
  comments,
  isViewOnly = false,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleMissingFieldClick = (e: React.MouseEvent, fieldName: string) => {
    e.stopPropagation();
    toast({
      title: `Add ${fieldName}`,
      description: `Click on the project card to edit and add a ${fieldName.toLowerCase()}.`,
      duration: 3000,
    });
  };

  return (
    <Card className="w-full h-full mx-auto cursor-pointer hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-0">
        {/* Project Thumbnail */}
        <div className="relative">
          {thumbnail && thumbnail.trim() && !imageError ? (
            <div className="relative w-full h-56">
              <Image
                src={thumbnail}
                alt={`${projectName} thumbnail`}
                fill
                className="object-cover rounded-t-lg"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-t-lg flex flex-col items-center justify-center relative group">
              <div className="w-12 h-12 bg-blue-100 dark:bg-gray-600 rounded-full flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6 text-blue-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Add Project Image
              </span>
              {!isViewOnly && (
                <div
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg flex items-center justify-center cursor-pointer"
                  onClick={(e) =>
                    handleMissingFieldClick(e, 'Project Thumbnail')
                  }
                >
                  <span className="text-white text-xs font-medium px-2 py-1 bg-blue-600 rounded">
                    Click to Add Image
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4" onClick={onClick}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <CardTitle className="font-semibold text-lg truncate flex-1">
            {projectName}
          </CardTitle>
          <div className="flex items-center gap-2 flex-shrink-0">
            {githubLink && githubLink.trim() && (
              <button
                onClick={(e) => handleLinkClick(e, githubLink)}
                className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="View GitHub Repository"
              >
                <Github className="h-4 w-4" />
              </button>
            )}
            {liveDemoLink && liveDemoLink.trim() ? (
              <button
                onClick={(e) => handleLinkClick(e, liveDemoLink)}
                className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="View Live Demo"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            ) : (
              !isViewOnly && (
                <button
                  onClick={(e) => handleMissingFieldClick(e, 'Live Demo Link')}
                  className="p-1.5 bg-gray-100/50 dark:bg-gray-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full transition-colors border border-dashed border-gray-300 dark:border-gray-600"
                  title="Add Live Demo Link"
                >
                  <ExternalLink className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </button>
              )
            )}
          </div>
        </div>

        {/* Tech Stack Badges */}
        {techUsed && techUsed.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {techUsed.map((tech, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        )}

        {/* Project Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
          {description || (
            <span className="text-gray-400 italic">
              No description provided. Click to add one.
            </span>
          )}
        </p>

        {/* Comments */}
        {comments && (
          <p className="mt-2 flex items-start text-gray-500 border p-3 rounded text-sm">
            <MessageSquare className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            {comments}
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <DateRange startDate={start} endDate={end} />
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
