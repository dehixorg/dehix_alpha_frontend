import React, { useState } from 'react';
import { Github, ExternalLink } from 'lucide-react';
import Image from 'next/image';

import { Card, CardContent } from '@/components/ui/card';
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
  isViewOnly?: boolean; // New prop to disable edit functionality
  onClick?: () => void;
}

const ProjectCard: React.FC<ProjectProps> = ({
  projectName,
  githubLink,
  liveDemoLink,
  thumbnail,
  isViewOnly = false,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);

  // Debug what ProjectCard is receiving
  console.log('🔍 ProjectCard received props:', {
    projectName,
    liveDemoLink,
    githubLink,
    hasLiveDemoLink: !!liveDemoLink,
    liveDemoLinkType: typeof liveDemoLink,
    liveDemoLinkTrimmed: liveDemoLink?.trim(),
    liveDemoLinkLength: liveDemoLink?.length,
  });

  // Debug logging for thumbnails
  if (!thumbnail || !thumbnail.trim()) {
    console.log('⚠️ Missing thumbnail for project:', projectName);
  } else {
    console.log('✅ Project has thumbnail:', projectName);
    console.log('🔗 Thumbnail URL:', thumbnail);
    console.log('🔍 URL type:', typeof thumbnail, 'Length:', thumbnail.length);
  }

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
    <Card
      className="w-full h-full cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Project Thumbnail */}
        <div className="relative">
          {thumbnail && thumbnail.trim() && !imageError ? (
            <div className="relative w-full h-32 sm:h-40 md:h-48">
              <Image
                src={thumbnail}
                alt={`${projectName} thumbnail`}
                fill
                className="object-cover rounded-t-lg"
                onError={() => {
                  console.error('❌ Image failed to load:', thumbnail);
                  setImageError(true);
                }}
                onLoad={() => {
                  console.log('✅ Image loaded successfully:', thumbnail);
                }}
              />
            </div>
          ) : (
            <div className="w-full h-32 sm:h-40 md:h-48 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-t-lg flex flex-col items-center justify-center relative group">
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

        {/* Project Name and Links */}
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg truncate flex-1">
              {projectName}
            </h3>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {githubLink && githubLink.trim() && (
                <button
                  onClick={(e) => handleLinkClick(e, githubLink)}
                  className="p-1 sm:p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                  title="View GitHub Repository"
                >
                  <Github className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              )}
              {liveDemoLink && liveDemoLink.trim() ? (
                <button
                  onClick={(e) => handleLinkClick(e, liveDemoLink)}
                  className="p-1 sm:p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                  title="View Live Demo"
                >
                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              ) : (
                !isViewOnly && (
                  <button
                    onClick={(e) =>
                      handleMissingFieldClick(e, 'Live Demo Link')
                    }
                    className="p-1 sm:p-1.5 bg-gray-100/50 dark:bg-gray-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full transition-colors border border-dashed border-gray-300 dark:border-gray-600"
                    title="Add Live Demo Link"
                  >
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 dark:text-gray-500" />
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default ProjectCard;
