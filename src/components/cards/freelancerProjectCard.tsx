import React from 'react';
import { Github, ExternalLink } from 'lucide-react';
import Image from 'next/image';

import { Card, CardContent } from '@/components/ui/card';

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
  onClick?: () => void;
}

const ProjectCard: React.FC<ProjectProps> = ({
  projectName,
  githubLink,
  liveDemoLink,
  thumbnail,
  onClick,
}) => {
  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      className="w-full h-full mx-auto md:max-w-2xl cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Project Thumbnail */}
        <div className="relative">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={`${projectName} thumbnail`}
              width={400}
              height={200}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400">No Image</span>
            </div>
          )}
        </div>

        {/* Project Name and Links */}
        <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-lg truncate flex-1">
              {projectName}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {githubLink && (
                <button
                  onClick={(e) => handleLinkClick(e, githubLink)}
                  className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                  title="View GitHub Repository"
                >
                  <Github className="h-4 w-4" />
                </button>
              )}
              {liveDemoLink && (
                <button
                  onClick={(e) => handleLinkClick(e, liveDemoLink)}
                  className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                  title="View Live Demo"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default ProjectCard;
