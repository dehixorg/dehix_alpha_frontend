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
  onSuccess?: (newExperiences: Experience[]) => void;
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
  const [isAdding, setIsAdding] = useState(false);

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
      console.error('Error fetching profile experiences:', error);
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
      // Fetch current profile experiences
      const profileRes = await axiosInstance.get(
        `/freelancer/profile/${currentProfileId}`,
      );
      const currentExperiences = profileRes.data?.data?.experiences || [];

      // Combine current + new selected experiences without duplicates
      const updatedExperiences = [
        ...currentExperiences,
        ...experiencesToAdd.filter(
          (exp) => !currentExperiences.some((ce: any) => ce._id === exp._id),
        ),
      ];

      // PUT combined array to backend
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

      // ✅ Only one toast for success
      notifySuccess(
        `${experiencesToAdd.length} experience(s) added to profile.`,
        'Success',
      );

      // Call onSuccess callback with added experiences
      onSuccess?.(experiencesToAdd);

      // Clear selection and close dialog
      setSelectedExperiences([]);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error adding experiences:', error);
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
            <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-2">
              {experiences.map((exp) => {
                const isSelected = selectedExperiences.includes(exp._id);
                return (
                  <Card
                    key={exp._id}
                    onClick={() => handleToggle(exp._id)}
                    className={`cursor-pointer p-3 border rounded-lg shadow-md transition-all
          ${
            isSelected
              ? 'border-primary bg-primary/10 dark:bg-primary/20'
              : 'border-gray-300 bg-white dark:bg-black dark:border-gray-700'
          }`}
                  >
                    <CardHeader className="pb-1">
                      <CardTitle className="text-md flex items-center gap-2 text-gray-900 dark:text-white">
                        <Briefcase className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        {exp.jobTitle}
                        {isSelected && (
                          <CheckCircle className="text-primary h-4 w-4" />
                        )}
                      </CardTitle>
                      <p className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                        {exp.company}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {exp.workDescription}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                        {formatDate(exp.workFrom)} - {formatDate(exp.workTo)}
                      </div>
                      {exp.referencePersonName && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Reference: {exp.referencePersonName}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
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
