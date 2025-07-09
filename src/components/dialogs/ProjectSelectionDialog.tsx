'use client';
import { useState, useEffect } from 'react';
import { Github, Calendar, CheckCircle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';

interface Project {
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
          projectType: project.projectType,
          verified: project.verified || false,
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
                    <Card
                      key={project._id}
                      className={`transition-all duration-200 ${
                        isAlreadyInProfile
                          ? 'bg-green-50 border-green-200 opacity-60 dark:bg-green-900/30 dark:border-green-600'
                          : isSelected
                            ? 'bg-primary/10 border-primary cursor-pointer'
                            : 'hover:bg-accent cursor-pointer'
                      }`}
                      onClick={() =>
                        !isAlreadyInProfile && handleProjectToggle(project._id)
                      }
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {project.projectName}
                            {isAlreadyInProfile ? (
                              <Badge className="bg-green-600 hover:bg-green-600 text-xs">
                                Already Added
                              </Badge>
                            ) : isSelected ? (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            ) : null}
                          </CardTitle>
                          {project.githubLink && (
                            <a
                              href={project.githubLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Github className="h-5 w-5" />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${
                              project.verified
                                ? 'bg-green-600 hover:bg-green-600'
                                : 'bg-yellow-600 hover:bg-yellow-600'
                            }`}
                          >
                            {project.verified ? 'VERIFIED' : 'PENDING'}
                          </Badge>
                          {project.projectType && (
                            <Badge variant="outline">
                              {project.projectType}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-muted-foreground text-sm line-clamp-3">
                          {project.description}
                        </p>

                        {project.role && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Role:</span>{' '}
                            {project.role}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(project.start)} -{' '}
                            {formatDate(project.end)}
                          </span>
                        </div>

                        {project.techUsed && project.techUsed.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {project.techUsed.slice(0, 3).map((tech, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tech}
                              </Badge>
                            ))}
                            {project.techUsed.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{project.techUsed.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
