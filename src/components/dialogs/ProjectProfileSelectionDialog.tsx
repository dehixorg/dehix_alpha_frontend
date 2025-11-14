'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import ConnectsDialog from './ConnectsDialog';

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
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  freelancerId?: string;
  freelancer_professional_profile_id?: string;
  onSuccess?: () => void;
}

const ProjectProfileSelectionDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  freelancerId,
  freelancer_professional_profile_id,
  onSuccess,
}) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );
  const hireCost = parseInt(
    process.env.NEXT_PUBLIC__APP_HIRE_TALENT_COST || '0',
  );
  const [isConnectsDialogOpen, setIsConnectsDialogOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/project/business');
        const data = res?.data?.data || [];
        setProjects(
          (data || []).filter(
            (p: any) => p.status === 'ACTIVE' || p.status === 'PENDING',
          ),
        );
      } catch (err) {
        console.error('Failed to load projects', err);
        notifyError('Failed to load projects', 'Error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setSelectedProjectId(null);
      setSelectedProfileId(null);
    }
  }, [open]);

  const profilesForSelectedProject = () => {
    const p = projects.find((x) => x._id === selectedProjectId);
    if (!p) return [];
    return (p.profiles || []).filter(
      (pr: any) => pr.profileType === 'FREELANCER',
    );
  };

  const handleConfirm = async () => {
    if (!selectedProjectId || !selectedProfileId) return;
    if (!freelancerId || !freelancer_professional_profile_id) {
      notifyError(
        'Freelancer has no professional profile to invite',
        'Validation',
      );
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

      await axiosInstance.post('/business/hire/project-hire', payload);

      window.dispatchEvent(new Event('refreshWallet'));
      window.dispatchEvent(new Event('connectsUpdated'));

      notifySuccess('Freelancer invited successfully', 'Invite Sent');
      onSuccess?.();
      onOpenChange(false);
      setIsConnectsDialogOpen(false);
    } catch (err: any) {
      console.error('Invite failed', err);
      notifyError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to invite freelancer',
        'Error',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select Project & Profile</DialogTitle>
            <DialogDescription>
              Invite this freelancer to one of your project profiles. This
              process will create a hire entity and send an invite.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {loading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <div>
                {step === 1 && (
                  <div className="grid gap-3">
                    {projects.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No active or pending projects found.
                      </p>
                    ) : (
                      projects.map((project) => (
                        <Card
                          key={project._id}
                          className={`p-3 cursor-pointer border ${selectedProjectId === project._id ? 'border-primary' : ''}`}
                          onClick={() => setSelectedProjectId(project._id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">
                                {project.projectName}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {project.companyName}
                              </p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {project.status}
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="grid gap-3">
                    {profilesForSelectedProject().length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No freelancer profiles available in this project.
                      </p>
                    ) : (
                      profilesForSelectedProject().map((pr: any) => (
                        <Card
                          key={pr._id}
                          className={`p-3 cursor-pointer border ${selectedProfileId === pr._id ? 'border-primary' : ''}`}
                          onClick={() => setSelectedProfileId(pr._id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{pr.domain}</h4>
                              <p className="text-sm text-muted-foreground">
                                {pr.description}
                              </p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Need: {pr.freelancersRequired || pr.required || 1}
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-3">
                    <p className="text-sm">
                      Project:{' '}
                      <strong>
                        {
                          projects.find((p) => p._id === selectedProjectId)
                            ?.projectName
                        }
                      </strong>
                    </p>
                    <p className="text-sm">
                      Profile:{' '}
                      <strong>
                        {
                          profilesForSelectedProject().find(
                            (p: any) => p._id === selectedProfileId,
                          )?.domain
                        }
                      </strong>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Inviting this freelancer will deduct{' '}
                      {hireCost !== null
                        ? hireCost
                        : process.env.NEXT_PUBLIC__APP_HIRE_TALENT_COST ||
                          '0'}{' '}
                      connects from your wallet (server-configured value shown
                      when available).
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="w-full flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    onOpenChange(false);
                    setStep(1);
                    setSelectedProjectId(null);
                    setSelectedProfileId(null);
                  }}
                >
                  Cancel
                </Button>
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep((s) => Math.max(1, s - 1))}
                  >
                    Back
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {step < 3 && (
                  <Button
                    onClick={() => {
                      if (step === 1 && !selectedProjectId)
                        return notifyError(
                          'Please select a project',
                          'Validation',
                        );
                      if (step === 2 && !selectedProfileId)
                        return notifyError(
                          'Please select a profile',
                          'Validation',
                        );
                      if (
                        step === 2 &&
                        (!freelancerId || !freelancer_professional_profile_id)
                      )
                        return notifyError(
                          'This freelancer has no active professional profile available for invitation.',
                          'Validation',
                        );
                      setStep((s) => Math.min(3, s + 1));
                    }}
                  >
                    Next
                  </Button>
                )}

                {step === 3 && (
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      {(!freelancerId ||
                        !freelancer_professional_profile_id) && (
                        <p className="text-sm text-orange-500">
                          This freelancer does not have an active professional
                          profile and cannot be invited.
                        </p>
                      )}
                      <Button
                        onClick={() => setIsConnectsDialogOpen(true)}
                        disabled={
                          submitting ||
                          !freelancerId ||
                          !freelancer_professional_profile_id
                        }
                      >
                        {submitting ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          'Confirm & Invite'
                        )}
                      </Button>
                    </div>
                  </div>
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
};

export default ProjectProfileSelectionDialog;
