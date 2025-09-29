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
import { notifyError, notifySuccess } from '@/utils/toastMessage';
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
<<<<<<< HEAD
  onSuccess?: (newExperiences: Experience[]) => void;
=======
  onSuccess?: (selectedExperiences: Experience[]) => void;
>>>>>>> 8a4f8a99cbb02698af729f516a31b0fb504dc7ac
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
<<<<<<< HEAD
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
=======
  const [isAddingExperiences, setIsAddingExperiences] = useState(false);
>>>>>>> 8a4f8a99cbb02698af729f516a31b0fb504dc7ac

  useEffect(() => {
    if (open && freelancerId && currentProfileId) {
      fetchExperiences();
      fetchCurrentProfileExperiences();
    }
  }, [open, freelancerId, currentProfileId]);

  // Fetch all freelancer experiences
  const fetchExperiences = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/freelancer/${freelancerId}`);
      const professionalInfo = response.data?.data?.professionalInfo;
      const expArray = Array.isArray(professionalInfo)
        ? professionalInfo
        : Object.values(professionalInfo || {});
      setExperiences(expArray);
    } catch (error) {

      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to load experiences',
        variant: 'destructive',
      });

      console.error('Error fetching experiences:', error);
      notifyError('Failed to load experiences', 'Error');
      setExperiences([]);

    } finally {
      setIsLoading(false);
    }
  };

  // Fetch experiences already in current profile
  const fetchCurrentProfileExperiences = async () => {
    try {
      const response = await axiosInstance.get(
        `/freelancer/profile/${currentProfileId}`,
      );
      const profileExps = response.data?.data?.experiences || [];
      setExistingExperienceIds(profileExps.map((e: any) => e._id));
    } catch (error) {
      console.error(error);
      setExistingExperienceIds([]);
    }
  };

  // Toggle selection
  const handleToggle = (id: string) => {
    setSelectedExperiences((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };
  const handleAddExperiences = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (selectedExperiences.length === 0) {
      notifyError(
        'Please select at least one experience to add',
        'No Selection',
      );
      return;
    }

    const experiencesToAdd = experiences.filter((exp) =>
      selectedExperiences.includes(exp._id),
    );

    setIsAdding(true);
    try {

      // ✅ Fetch current profile experiences first
      const profileRes = await axiosInstance.get(
        `/freelancer/profile/${currentProfileId}`,
      );
      const currentExperiences = profileRes.data?.data?.experiences || [];

      // ✅ Combine current + new selected experiences
      const updatedExperiences = [
        ...currentExperiences,
        ...experiencesToAdd.filter(
          (exp) => !currentExperiences.some((ce: any) => ce._id === exp._id),
        ),
      ];

      // ✅ Send combined array to backend
      await axiosInstance.put(`/freelancer/profile/${currentProfileId}`, {
        experiences: updatedExperiences.map((e) => ({
          _id: e._id,
          jobTitle: e.jobTitle,
          company: e.company,
          workDescription: e.workDescription,
          workFrom: e.workFrom,
          workTo: e.workTo,
          referencePersonName: e.referencePersonName,
        })),
      });

      toast({
        title: 'Success',
        description: `${experiencesToAdd.length} experience(s) added to profile successfully!`,
      });

      const selectedObjects = experiences.filter((exp) =>
        selectedExperiences.includes(exp._id),
      );

      notifySuccess(
        `${selectedObjects.length} experience(s) selected. Save the profile to persist changes.`,
        'Selected',
      );

      onSuccess?.(selectedObjects);


      // ✅ Update parent UI
      if (onSuccess) {
        onSuccess(experiencesToAdd);
      }

      setSelectedExperiences([]);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error preparing selected experiences:', error);
      notifyError('Could not process selected experiences', 'Error');
    } finally {
      setIsAdding(false);
    }
  };

  const formatDate = (date: string | Date) => {
    if (!date) return 'Present';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Experiences for Profile</DialogTitle>
          <DialogDescription>
            Choose from your existing experiences to add. You can select
            multiple.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-center py-8 text-muted-foreground">
            Loading experiences...
          </p>
        ) : experiences.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No experiences found. Add professional experiences from your profile
            first.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {experiences.map((exp) => {
                const isAdded = existingExperienceIds.includes(exp._id);
                const isSelected = selectedExperiences.includes(exp._id);
                return (
                  <Card
                    key={exp._id}
                    onClick={() => !isAdded && handleToggle(exp._id)}
                    className={`cursor-pointer transition-all p-4 ${
                      isAdded
                        ? 'bg-green-50 border-green-200 opacity-60'
                        : isSelected
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-accent'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        {exp.jobTitle}
                        {isAdded && (
                          <Badge className="bg-green-600 text-xs">
                            Already Added
                          </Badge>
                        )}
                        {isSelected && !isAdded && (
                          <CheckCircle className="text-primary h-5 w-5" />
                        )}
                      </CardTitle>
                      <p className="text-muted-foreground font-medium">
                        {exp.company}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {exp.workDescription}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(exp.workFrom)} - {formatDate(exp.workTo)}
                      </div>
                      {exp.referencePersonName && (
                        <p className="text-sm text-muted-foreground">
                          Reference: {exp.referencePersonName}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {selectedExperiences.length} selected,{' '}
                {existingExperienceIds.length} already in profile
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddExperiences}
                  disabled={selectedExperiences.length === 0 || isAdding}
                  className="flex items-center gap-2"
                >
                  {isAdding
                    ? 'Adding...'
                    : `Add ${selectedExperiences.length} Experience(s)`}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
