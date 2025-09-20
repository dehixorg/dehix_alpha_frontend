import React, { useState } from 'react';
import {
  Github,
  ExternalLink,
  Edit,
  Trash2,
  User,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import Image from 'next/image';

import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-2xl font-bold">
              {project.projectName}
            </DialogTitle>
            {project.verified && <ShieldCheck className="text-green-600" />}
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Image */}
              {project.thumbnail && (
                <div className="w-full overflow-hidden rounded-xl border border-border/40 shadow-sm">
                  <Image
                    src={project.thumbnail}
                    alt={`${project.projectName} thumbnail`}
                    width={800}
                    height={400}
                    className="w-full h-64 object-cover transition-transform duration-300 hover:scale-[1.01]"
                  />
                </div>
              )}

              {/* Project Overview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">
                    Project Overview
                  </h2>
                  <div className="flex gap-2">
                    {project.githubLink && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleLinkClick(project.githubLink!)}
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                          >
                            <Github className="h-4 w-4" />
                            <span className="sr-only">GitHub Repository</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View on GitHub</TooltipContent>
                      </Tooltip>
                    )}
                    {project.liveDemoLink && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() =>
                              handleLinkClick(project.liveDemoLink!)
                            }
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">Live Demo</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View Live Demo</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>

                <div className="prose prose-sm prose-slate dark:prose-invert max-w-none bg-muted/20 rounded-lg p-4 border border-border/20">
                  <p className="text-foreground/90 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Technologies Used */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
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

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-muted/20 rounded-xl border border-border/20 p-5 space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                  Project Details
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Role</p>
                      <p className="text-sm font-medium">{project.role}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-amber-500/5 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-amber-500"
                      >
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                        <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                        <path d="M8 13h.01"></path>
                        <path d="M16 13h.01"></path>
                        <path d="M10 16a3.5 3.5 0 1 0 4 0"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="text-sm font-medium">
                        {project.projectType}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {project.refer && (
                <div className="bg-muted/20 rounded-xl border border-border/20 p-5 space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                    Reference
                  </h3>
                  <div className="text-sm text-foreground/90 overflow-hidden">
                    {project.refer}
                  </div>
                </div>
              )}
              <div className="relative bg-muted/20 rounded-lg p-4 border border-border/20 overflow-hidden">
                <div className="absolute -right-2 -top-2 opacity-5">
                  <MessageSquare className="h-12 w-12 text-foreground m-3" />
                </div>
                <div className="relative z-10">
                  <p className="text-foreground/90 leading-relaxed p-1">
                    {project.comments}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer with action buttons */}
        <DialogFooter className="sm:justify-between gap-2 pt-4 mt-6">
          <div className="text-xs text-muted-foreground mt-auto">
            Last updated: {new Date().toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onEdit} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Project
            </Button>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                if (
                  confirm(
                    'Are you sure you want to delete this project? This action cannot be undone.',
                  )
                ) {
                  handleDelete();
                }
              }}
              disabled={isDeleting}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailsDialog;
