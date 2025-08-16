import React, { useState } from 'react';
import {
  Github,
  ExternalLink,
  Edit,
  Trash2,
  Calendar,
  User,
  MessageSquare,
  Tag,
} from 'lucide-react';
import Image from 'next/image';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';
import { Separator } from '@/components/ui/separator';

interface ProjectDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  project: {
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
    comments: string;
  };
}

const ProjectDetailsDialog: React.FC<ProjectDetailsDialogProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  project,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/freelancer/project/${project._id}`);
      toast({
        title: 'Project Deleted',
        description: 'The project has been successfully deleted.',
      });
      onDelete();
      onClose();
    } catch (error) {
      console.error('Delete Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete project. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pr-12">
          <DialogTitle className="text-2xl font-bold flex-1 min-w-0 pr-4">
            {project.projectName}
          </DialogTitle>
          <div className="flex items-center gap-2 flex-shrink-0">
            {project.verified ? (
              <Badge className="bg-green-500 hover:bg-green-600">
                VERIFIED
              </Badge>
            ) : (
              <Badge className="bg-yellow-500 hover:bg-yellow-600">
                PENDING
              </Badge>
            )}
            <Button onClick={onEdit} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              size="sm"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Project Image */}
          {project.thumbnail && (
            <div className="w-full">
              <Image
                src={project.thumbnail}
                alt={`${project.projectName} thumbnail`}
                width={800}
                height={400}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Links Section */}
          <div className="flex gap-4">
            {project.githubLink && (
              <Button
                onClick={() => handleLinkClick(project.githubLink!)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Github className="h-4 w-4" />
                View Repository
              </Button>
            )}
            {project.liveDemoLink && (
              <Button
                onClick={() => handleLinkClick(project.liveDemoLink!)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Live Demo
              </Button>
            )}
          </div>

          <Separator />

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {project.description}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Role
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {project.role}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Project Type</h3>
                <Badge variant="secondary">{project.projectType}</Badge>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Duration
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {formatDate(project.start)} - {formatDate(project.end)}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Reference</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {project.refer}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Technologies Used
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.techUsed.map((tech: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          {project.comments && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comments
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-300">
                    {project.comments}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailsDialog;
