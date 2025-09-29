'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';
import ProjectCard from '@/components/cards/freelancerProjectCard';

interface Project {
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
}

interface ProjectSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  freelancerId: string;
  currentProfileId: string;
  onSuccess?: (selectedProjects: Project[]) => void;
}

export default function ProjectSelectionDialog({
  open,
  onOpenChange,
  freelancerId,
  currentProfileId,
  onSuccess,
}: ProjectSelectionDialogProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [existingProjectIds, setExistingProjectIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingProjects, setIsAddingProjects] = useState(false);

  useEffect(() => {
    if (open && freelancerId && currentProfileId) {
      fetchProjects();
      fetchCurrentProfileProjects();
    }
  }, [open, freelancerId, currentProfileId]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/freelancer/${freelancerId}`);
      const projectsData = response.data?.data?.projects;

      if (Array.isArray(projectsData)) {
        setProjects(projectsData as Project[]);
      } else if (projectsData && typeof projectsData === 'object') {
        // Convert projects object (id -> project) to array
        const projectsArray = Object.values(projectsData) as Project[];
        setProjects(projectsArray);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      notifyError('Failed to load projects', 'Error');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentProfileProjects = async () => {
    try {
      const response = await axiosInstance.get(
        `/freelancer/profile/${currentProfileId}`,
      );
      const currentProfile = response.data.data;
      // Now projects are full objects, so we extract the _id from each project
      const projectIds = (currentProfile.projects || []).map((p: any) => p._id);
      setExistingProjectIds(projectIds);
    } catch (error) {
      console.error('Error fetching current profile projects:', error);
      setExistingProjectIds([]);
    }
  };

  const handleProjectToggle = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId],
    );
  };

  const handleAddProjects = async (e?: React.MouseEvent) => {
    // Prevent any default behavior that might cause page refresh
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (selectedProjects.length === 0) {
      notifyError('Please select at least one project to add', 'No Selection');
      return;
    }

    setIsAddingProjects(true);
    try {
      // Build full project objects for the newly selected ones
      const selectedObjects = projects.filter((p) =>
        selectedProjects.includes(p._id),
      );

      notifySuccess(
        `${selectedObjects.length} project(s) selected. Save the profile to persist changes.`,
        'Selected',
      );

      // Return selection to parent; parent will merge and persist on save
      onSuccess?.(selectedObjects);

      setSelectedProjects([]);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error preparing selected projects:', error);
      notifyError('Could not process selected projects', 'Error');
    } finally {
      setIsAddingProjects(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Projects for Profile</DialogTitle>
          <DialogDescription>
            Choose from your existing projects to add to this profile. You can
            select multiple projects.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">No projects found.</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create projects from your Projects page to add them to this
                profile.
              </p>
              <Button asChild>
                <Link
                  href="/freelancer/settings/projects"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Go to Projects
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => {
                  const isAlreadyInProfile = existingProjectIds.includes(
                    project._id,
                  );
                  const isSelected = selectedProjects.includes(project._id);

                  return (
                    <div
                      key={project._id}
                      className={`relative transition-all duration-200 ${
                        isAlreadyInProfile
                          ? 'opacity-60 pointer-events-none'
                          : isSelected
                            ? 'ring-2 ring-green-500 ring-offset-2'
                            : 'cursor-pointer'
                      }`}
                      onClick={() =>
                        !isAlreadyInProfile && handleProjectToggle(project._id)
                      }
                    >
                      <ProjectCard
                        {...project}
                        onClick={() => {}} // Prevent default click since we handle it on the wrapper
                      />

                      {/* Selection indicators */}
                      <div className="absolute top-2 right-2 z-10">
                        {isAlreadyInProfile ? (
                          <Badge className="bg-green-600 hover:bg-green-600 text-xs">
                            Already Added
                          </Badge>
                        ) : isSelected ? (
                          <div className="bg-green-500 rounded-full p-1">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  <p>{selectedProjects.length} project(s) selected</p>
                  {existingProjectIds.length > 0 && (
                    <p className="text-xs text-green-600">
                      {existingProjectIds.length} project(s) already in profile
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={(e) => handleAddProjects(e)}
                    disabled={selectedProjects.length === 0 || isAddingProjects}
                    className="flex items-center gap-2"
                  >
                    {isAddingProjects
                      ? 'Adding...'
                      : `Add ${selectedProjects.length} Project(s)`}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
