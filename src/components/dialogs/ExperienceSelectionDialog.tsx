'use client';
import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Briefcase } from 'lucide-react';

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

interface Experience {
  _id: string;
  company: string;
  jobTitle: string;
  workDescription: string;
  workFrom: Date | string;
  workTo: Date | string;
  referencePersonName?: string;
  referencePersonContact?: string;
  githubRepoLink?: string;
}

interface ExperienceSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  freelancerId: string;
  currentProfileId: string;
  onSuccess?: () => void;
}

export default function ExperienceSelectionDialog({
  open,
  onOpenChange,
  freelancerId,
  currentProfileId,
  onSuccess,
}: ExperienceSelectionDialogProps) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [existingExperienceIds, setExistingExperienceIds] = useState<string[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingExperiences, setIsAddingExperiences] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && freelancerId && currentProfileId) {
      fetchExperiences();
      fetchCurrentProfileExperiences();
    }
  }, [open, freelancerId, currentProfileId]);

  const fetchExperiences = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/freelancer/${freelancerId}`);
      const freelancerData = response.data?.data;
      const professionalInfo = freelancerData?.professionalInfo;

      if (professionalInfo && typeof professionalInfo === 'object') {
        // Check if it's already an array (from backend conversion)
        const experiencesArray = Array.isArray(professionalInfo)
          ? (professionalInfo as Experience[])
          : (Object.values(professionalInfo) as Experience[]);

        setExperiences(experiencesArray);
      } else {
        setExperiences([]);
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load experiences',
        variant: 'destructive',
      });
      setExperiences([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentProfileExperiences = async () => {
    try {
      const response = await axiosInstance.get(
        `/freelancer/profile/${currentProfileId}`,
      );
      const currentProfile = response.data.data;
      // Extract experience IDs from the profile
      const experienceIds = (currentProfile.experiences || []).map(
        (exp: any) => exp._id,
      );
      setExistingExperienceIds(experienceIds);
    } catch (error) {
      console.error('Error fetching current profile experiences:', error);
      setExistingExperienceIds([]);
    }
  };

  const handleExperienceToggle = (experienceId: string) => {
    setSelectedExperiences((prev) =>
      prev.includes(experienceId)
        ? prev.filter((id) => id !== experienceId)
        : [...prev, experienceId],
    );
  };

  const handleAddExperiences = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (selectedExperiences.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select at least one experience to add',
        variant: 'destructive',
      });
      return;
    }

    setIsAddingExperiences(true);
    try {
      // Get current profile to see existing experiences
      const profileResponse = await axiosInstance.get(
        `/freelancer/profile/${currentProfileId}`,
      );
      const currentProfile = profileResponse.data.data;

      // Get existing experiences (now they are full objects)
      const existingExperiences = currentProfile.experiences || [];
      const existingExperienceIds = existingExperiences.map(
        (exp: any) => exp._id,
      );

      // Get the full experience objects for the selected experiences
      const selectedExperienceObjects = experiences
        .filter(
          (experience) =>
            selectedExperiences.includes(experience._id) &&
            !existingExperienceIds.includes(experience._id),
        )
        .map((experience) => {
          // Ensure all required fields are present and not empty
          const experienceObj = {
            _id: experience._id || '',
            company: experience.company || '',
            jobTitle: experience.jobTitle || '',
            workDescription: experience.workDescription || '',
            workFrom:
              experience.workFrom instanceof Date
                ? experience.workFrom.toISOString()
                : experience.workFrom || '',
            workTo:
              experience.workTo instanceof Date
                ? experience.workTo.toISOString()
                : experience.workTo || '',
            referencePersonName: experience.referencePersonName || undefined,
            referencePersonContact:
              experience.referencePersonContact || undefined,
            githubRepoLink: experience.githubRepoLink || undefined,
          };

          return experienceObj;
        });

      // Combine existing experiences with newly selected ones
      const allExperiences = [
        ...existingExperiences,
        ...selectedExperienceObjects,
      ];

      // Update the profile with the combined experiences array
      try {
        const updateResponse = await axiosInstance.put(
          `/freelancer/profile/${currentProfileId}`,
          {
            experiences: allExperiences,
          },
        );
      } catch (updateError: any) {
        console.error('Profile update failed:', updateError);
        throw updateError;
      }

      toast({
        title: 'Success',
        description: `${selectedExperiences.length} experience(s) added to profile successfully!`,
      });

      setSelectedExperiences([]);
      onOpenChange(false);

      // Call onSuccess to refresh the parent component
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error adding experiences:', error);
      toast({
        title: 'Error',
        description:
          error.response?.data?.message ||
          'Failed to add experiences to profile',
        variant: 'destructive',
      });
    } finally {
      setIsAddingExperiences(false);
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Experiences for Profile</DialogTitle>
          <DialogDescription>
            Choose from your existing professional experiences to add to this
            profile. You can select multiple experiences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading experiences...</p>
            </div>
          ) : experiences.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No experiences found.
              </p>
              <p className="text-sm text-muted-foreground">
                Add professional experiences from the Professional Info page
                first to select them for your profile.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {experiences.map((experience) => {
                  const isAlreadyInProfile = existingExperienceIds.includes(
                    experience._id,
                  );
                  const isSelected = selectedExperiences.includes(
                    experience._id,
                  );

                  return (
                    <Card
                      key={experience._id}
                      className={`transition-all duration-200 ${
                        isAlreadyInProfile
                          ? 'bg-green-50 border-green-200 opacity-60 dark:bg-green-900/30 dark:border-green-600'
                          : isSelected
                            ? 'bg-primary/10 border-primary cursor-pointer'
                            : 'hover:bg-accent cursor-pointer'
                      }`}
                      onClick={() =>
                        !isAlreadyInProfile &&
                        handleExperienceToggle(experience._id)
                      }
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            {experience.jobTitle}
                            {isAlreadyInProfile ? (
                              <Badge className="bg-green-600 hover:bg-green-600 text-xs">
                                Already Added
                              </Badge>
                            ) : isSelected ? (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            ) : null}
                          </CardTitle>
                        </div>
                        <p className="text-muted-foreground font-medium">
                          {experience.company}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-muted-foreground text-sm line-clamp-3">
                          {experience.workDescription}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(experience.workFrom)} -{' '}
                            {formatDate(experience.workTo)}
                          </span>
                        </div>

                        {experience.referencePersonName && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Reference:</span>{' '}
                            {experience.referencePersonName}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  <p>{selectedExperiences.length} experience(s) selected</p>
                  {existingExperienceIds.length > 0 && (
                    <p className="text-xs text-green-600">
                      {existingExperienceIds.length} experience(s) already in
                      profile
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={(e) => handleAddExperiences(e)}
                    disabled={
                      selectedExperiences.length === 0 || isAddingExperiences
                    }
                    className="flex items-center gap-2"
                  >
                    {isAddingExperiences
                      ? 'Adding...'
                      : `Add ${selectedExperiences.length} Experience(s)`}
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
