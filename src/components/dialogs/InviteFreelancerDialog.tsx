'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ConnectsDialog from '@/components/dialogs/ConnectsDialog';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifySuccess, notifyError } from '@/utils/toastMessage';

interface Project {
  _id: string;
  projectName: string;
  companyName: string;
  status: string;
  profiles?: Profile[];
}

interface Profile {
  _id: string;
  domain: string;
  description: string;
  profileType: string;
  freelancersRequired?: number;
  required?: number;
}

interface InviteFreelancerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  freelancerId: string;
  freelancer_professional_profile_id: string;
  onSuccess?: () => void;
}

export default function InviteFreelancerDialog({
  open,
  onOpenChange,
  freelancerId,
  freelancer_professional_profile_id,
  onSuccess,
}: InviteFreelancerDialogProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [isConnectsDialogOpen, setIsConnectsDialogOpen] = useState(false);

  const hireCost = parseInt(
    process.env.NEXT_PUBLIC__APP_HIRE_TALENT_COST || '10',
  );

  // Fetch projects when dialog opens
  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStep(1);
      setSelectedProjectId('');
      setSelectedProfileId('');
      setProjects([]);
    }
  }, [open]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/project/business');
      const filteredProjects = response.data.data.filter(
        (project: Project) =>
          project.status === 'ACTIVE' || project.status === 'PENDING',
      );
      setProjects(filteredProjects);
    } catch (error) {
      notifyError('Failed to fetch projects');
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const profilesForSelectedProject = (): Profile[] => {
    const selectedProject = projects.find((p) => p._id === selectedProjectId);
    if (!selectedProject || !selectedProject.profiles) return [];

    return selectedProject.profiles.filter(
      (profile) => profile.profileType === 'FREELANCER',
    );
  };

  const handleNext = () => {
    if (step === 1 && !selectedProjectId) {
      notifyError('Please select a project');
      return;
    }
    if (step === 2 && !selectedProfileId) {
      notifyError('Please select a profile');
      return;
    }
    if (step === 2 && (!freelancerId || !freelancer_professional_profile_id)) {
      notifyError('Invalid freelancer information');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleConfirmClick = () => {
    setIsConnectsDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (
      !selectedProjectId ||
      !selectedProfileId ||
      !freelancerId ||
      !freelancer_professional_profile_id
    ) {
      notifyError('Missing required information');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        freelancerId: freelancerId,
        freelancer_professional_profile_id: freelancer_professional_profile_id,
        projectId: selectedProjectId,
        profileId: selectedProfileId,
      };

      await axiosInstance.post('/business/hire-dehixtalent/hire-now', payload);

      // Dispatch wallet update events
      window.dispatchEvent(new Event('refreshWallet'));
      window.dispatchEvent(new Event('connectsUpdated'));

      notifySuccess('Freelancer invited successfully!');

      // Close dialogs
      setIsConnectsDialogOpen(false);
      onOpenChange(false);

      // Call success callback
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to invite freelancer';
      notifyError(errorMessage);
      console.error('Error inviting freelancer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedProject = () => {
    return projects.find((p) => p._id === selectedProjectId);
  };

  const getSelectedProfile = () => {
    const profiles = profilesForSelectedProject();
    return profiles.find((p) => p._id === selectedProfileId);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {step === 1 && 'Select Project'}
              {step === 2 && 'Select Profile'}
              {step === 3 && 'Confirm Invitation'}
            </DialogTitle>
            <DialogDescription>
              {step === 1 &&
                'Choose the project you want to invite this freelancer to'}
              {step === 2 && 'Select the profile role for this freelancer'}
              {step === 3 && 'Review and confirm the invitation details'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Step 1: Project Selection */}
            {step === 1 && (
              <div>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active or pending projects found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((project) => (
                      <Card
                        key={project._id}
                        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedProjectId === project._id
                            ? 'border-2 border-primary'
                            : 'border'
                        }`}
                        onClick={() => setSelectedProjectId(project._id)}
                      >
                        <h3 className="font-semibold text-lg mb-2">
                          {project.projectName}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-1">
                          Company: {project.companyName}
                        </p>
                        <p className="text-sm">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs ${
                              project.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {project.status}
                          </span>
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Profile Selection */}
            {step === 2 && (
              <div>
                {profilesForSelectedProject().length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No freelancer profiles found for this project
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profilesForSelectedProject().map((profile) => (
                      <Card
                        key={profile._id}
                        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedProfileId === profile._id
                            ? 'border-2 border-primary'
                            : 'border'
                        }`}
                        onClick={() => setSelectedProfileId(profile._id)}
                      >
                        <h3 className="font-semibold text-lg mb-2">
                          {profile.domain}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {profile.description}
                        </p>
                        <p className="text-sm">
                          Freelancers Required:{' '}
                          {profile.freelancersRequired ||
                            profile.required ||
                            'N/A'}
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4">
                    Invitation Summary
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Project</p>
                      <p className="font-medium">
                        {getSelectedProject()?.projectName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Profile Role
                      </p>
                      <p className="font-medium">
                        {getSelectedProfile()?.domain}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Connects Cost
                      </p>
                      <p className="font-medium text-lg">{hireCost} Connects</p>
                    </div>
                  </div>
                </Card>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> {hireCost} connects will be deducted
                    from your account when you confirm this invitation.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <div className="flex gap-2">
                {step > 1 && (
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    onClick={handleNext}
                    disabled={
                      (step === 1 && !selectedProjectId) ||
                      (step === 2 && !selectedProfileId) ||
                      loading
                    }
                  >
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleConfirmClick} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Confirm & Invite'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConnectsDialog
        open={isConnectsDialogOpen}
        onOpenChange={setIsConnectsDialogOpen}
        onConfirm={handleConfirm}
        loading={submitting}
        cost={hireCost}
      />
    </>
  );
}
