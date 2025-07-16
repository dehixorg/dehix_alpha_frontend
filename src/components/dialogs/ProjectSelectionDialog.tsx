'use client';
import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
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
  onSuccess?: () => void;
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
  const { toast } = useToast();

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

      if (projectsData && typeof projectsData === 'object') {
        // Convert projects object to array
        const projectsArray = Object.values(projectsData) as Project[];
        setProjects(projectsArray);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
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
      toast({
        title: 'No Selection',
        description: 'Please select at least one project to add',
        variant: 'destructive',
      });
      return;
    }

    setIsAddingProjects(true);
    try {
      // First, get the current profile to see existing projects
      const profileResponse = await axiosInstance.get(
        `/freelancer/profile/${currentProfileId}`,
      );
      const currentProfile = profileResponse.data.data;

      // Get existing projects (now they are full objects)
      const existingProjects = currentProfile.projects || [];
      const existingProjectIds = existingProjects.map((p: any) => p._id);

      // Get the full project objects for the selected projects
      const selectedProjectObjects = projects
        .filter(
          (project) =>
            selectedProjects.includes(project._id) &&
            !existingProjectIds.includes(project._id),
        )
        .map((project) => ({
          _id: project._id,
          projectName: project.projectName,
          description: project.description,
          role: project.role,
          start: project.start,
          end: project.end,
          techUsed: project.techUsed || [],
          githubLink: project.githubLink,
          liveDemoLink: project.liveDemoLink || '', // Provide fallback for undefined
          thumbnail: project.thumbnail || '', // Provide fallback for undefined
          projectType: project.projectType,
          verified: project.verified || false,
          oracleAssigned: project.oracleAssigned || null,
          verificationUpdateTime: project.verificationUpdateTime,
          comments: project.comments || '',
          refer: project.refer,
        }));

      // Combine existing projects with newly selected ones
      const allProjects = [...existingProjects, ...selectedProjectObjects];

      // Update the profile with the combined projects array
      const updateResponse = await axiosInstance.put(
        `/freelancer/profile/${currentProfileId}`,
        {
          projects: allProjects,
        },
      );

      toast({
        title: 'Success',
        description: `${selectedProjects.length} project(s) added to profile successfully!`,
      });

      setSelectedProjects([]);
      onOpenChange(false);

      // Call onSuccess to refresh the parent component
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error adding projects:', error);
      console.error('Error response:', error.response?.data);
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to add projects to profile',
        variant: 'destructive',
      });
    } finally {
      setIsAddingProjects(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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
              <p className="text-muted-foreground mb-4">No projects found.</p>
              <p className="text-sm text-muted-foreground">
                Add projects from the Projects page first to select them for
                your profile.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Debug: Freelancer ID: {freelancerId}, Profile ID:{' '}
                {currentProfileId}
              </p>
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
