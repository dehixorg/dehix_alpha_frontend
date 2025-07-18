import React, { useState } from 'react';
import { Github, MessageSquareIcon, Edit } from 'lucide-react';
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
import { Button } from '../ui/button';
import { ProjectForm } from '../educational-form/project-form';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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
  thumbnail?: string; // Add thumbnail to props
  onProjectUpdated: () => void;
}

const ProjectCard: React.FC<ProjectProps> = ({
  _id,
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
  thumbnail, // Destructure thumbnail from props
  onProjectUpdated,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Prepare project data for the form
  const projectData = {
    _id,
    projectName,
    description,
    githubLink,
    start: start ? new Date(start).toISOString().split('T')[0] : '',
    end: end ? new Date(end).toISOString().split('T')[0] : '',
    refer,
    techUsed,
    role,
    projectType,
    comments,
    thumbnail, // Include thumbnail in form data
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFormOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFormOpen(true);
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    onProjectUpdated();
  };

  return (
    <>
      <Card 
        className="w-full h-full mx-auto md:max-w-2xl relative group overflow-hidden cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Background image container */}
        {thumbnail && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div 
              className="w-full h-full bg-cover bg-center transition-all duration-300 group-hover:opacity-20"
              style={{ 
                backgroundImage: `url(${thumbnail})`,
                borderRadius: 'calc(var(--radius) - 4px)'
              }}
            />
          </div>
        )}

        {/* Overlay that darkens on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />

        {/* Card content */}
        <div className="relative z-10 h-full flex flex-col">
          <CardHeader className="flex-grow-0">
            <div className="flex items-center">
              <CardTitle className="text-white drop-shadow-md">
                {projectName}
              </CardTitle>
              {githubLink && (
                <a
                  href={githubLink}
                  className="ml-auto text-white hover:text-gray-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
            </div>
          </CardHeader>
          
          {/* Hidden content that appears on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-grow">
            <CardContent>
              {verified ? (
                <Badge className="bg-green-600 hover:bg-green-700 text-white">VERIFIED</Badge>
              ) : (
                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">PENDING</Badge>
              )}
              <p className="text-gray-100 pt-4 drop-shadow-md">{description}</p>

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
        </div>

        {/* Edit button - now part of the card */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleEditClick}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </Card>

      {/* Dialog for the project form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <ProjectForm
            mode="edit"
            projectData={projectData}
            onFormSubmit={handleFormSubmit}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectCard;