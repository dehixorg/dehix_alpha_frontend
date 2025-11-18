'use client';

import React, { useState, useEffect } from 'react';
import {
  Loader2,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Briefcase,
  User,
  Zap,
  ArrowLeft,
} from 'lucide-react';

import { ProjectTypeDialog } from './ProjectTypeDialog';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
interface Profile {
  _id: string;
  title?: string;
  isDefault?: boolean;
  domain?: string;
  description?: string;
}

interface ProjectWithProfiles {
  _id: string;
  title: string;
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED';
  profiles: Profile[];
  name?: string; // For backward compatibility
  profileType?: string;
  freelancersRequired?: number;
  required?: number;
  projectName?: string; // For backward compatibility
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
  const [projects, setProjects] = useState<ProjectWithProfiles[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [isConnectsDialogOpen, setIsConnectsDialogOpen] = useState(false);
  const [, setModalOpen] = useState(false);

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
      const filteredProjects = response.data.data
        .filter(
          (project: ProjectWithProfiles) =>
            project.status === 'ACTIVE' || project.status === 'PENDING',
        )
        .map((project: ProjectWithProfiles) => ({
          ...project,
          title: project.title || project.name || 'Untitled Project',
          profiles: project.profiles || [],
        }));
      setProjects(filteredProjects);
    } catch (error) {
      notifyError('Failed to fetch projects');
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
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
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleConfirm = async () => {
    if (!selectedProjectId || !selectedProfileId) {
      notifyError('Please select a project and profile');
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

  const getSelectedProject = (): ProjectWithProfiles | undefined => {
    return projects.find((p) => p._id === selectedProjectId);
  };

  const getSelectedProfile = (): Profile | undefined => {
    const project = getSelectedProject();
    if (!project || !project.profiles) return undefined;
    return project.profiles.find((p) => p._id === selectedProfileId);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              {step > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setStep(step - 1)}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {step === 1 ? 'Select Project' : 'Review Invitation'}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">
                    {step === 1
                      ? 'Choose a project to invite this freelancer to'
                      : step === 2
                        ? 'Review details before sending invitation'
                        : 'Confirm invitation details'}
                  </span>
                </DialogDescription>
              </div>
            </div>

            <div className="pt-2">
              <nav aria-label="Invite steps">
                <ol className="flex items-center w-full flex-wrap gap-2 px-1">
                  <li
                    className={cn(
                      'min-w-0 flex items-center gap-2 sm:gap-3',
                      step >= 1 ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => step > 1 && setStep(1)}
                      className="group flex items-center gap-2 sm:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background rounded-md"
                      aria-current={step === 1 ? 'step' : undefined}
                    >
                      <div
                        className={cn(
                          'h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center border',
                          step >= 1
                            ? 'bg-primary/10 border-primary'
                            : 'border-border',
                        )}
                      >
                        <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium truncate">
                        Project
                      </span>
                    </button>
                  </li>

                  <li
                    aria-hidden
                    className="flex-1 min-w-[48px] sm:min-w-[72px]"
                  >
                    <div
                      className={cn(
                        'h-px w-full',
                        step >= 2 ? 'bg-primary/40' : 'bg-border',
                      )}
                    />
                  </li>

                  <li
                    className={cn(
                      'min-w-0 flex items-center gap-2 sm:gap-3',
                      step >= 2 ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => step > 2 && setStep(2)}
                      className="group flex items-center gap-2 sm:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background rounded-md"
                      aria-current={step === 2 ? 'step' : undefined}
                    >
                      <div
                        className={cn(
                          'h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center border',
                          step >= 2
                            ? 'bg-primary/10 border-primary'
                            : 'border-border',
                        )}
                      >
                        <User className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium truncate">
                        Review
                      </span>
                    </button>
                  </li>

                  <li
                    aria-hidden
                    className="flex-1 min-w-[48px] sm:min-w-[72px]"
                  >
                    <div
                      className={cn(
                        'h-px w-full',
                        step >= 3 ? 'bg-primary/40' : 'bg-border',
                      )}
                    />
                  </li>

                  <li
                    className={cn(
                      'min-w-0 flex items-center gap-2 sm:gap-3',
                      step === 3 ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    <button
                      type="button"
                      disabled={step < 3}
                      className="group flex items-center gap-2 sm:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background rounded-md disabled:opacity-60"
                      aria-current={step === 3 ? 'step' : undefined}
                    >
                      <div
                        className={cn(
                          'h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center border',
                          step === 3
                            ? 'bg-primary/10 border-primary'
                            : 'border-border',
                        )}
                      >
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium truncate">
                        Confirm
                      </span>
                    </button>
                  </li>
                </ol>
              </nav>
            </div>
          </DialogHeader>

          <div className="py-2">
            {/* Step 1: Project Selection */}
            {step === 1 && (
              <div className="space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">
                      Loading your projects...
                    </p>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                    <Briefcase className="h-12 w-12 text-muted-foreground/40" />
                    <div className="space-y-1">
                      <h4 className="text-lg font-medium">No projects found</h4>
                      <p className="text-sm text-muted-foreground">
                        You don&apos;t have any active or pending projects to
                        invite freelancers to.
                      </p>
                    </div>
                    <ProjectTypeDialog
                      onOpenChange={setModalOpen}
                      trigger={<Button size="sm">Create New Project</Button>}
                    />
                  </div>
                ) : (
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="all">All Projects</TabsTrigger>
                      <TabsTrigger value="active">Active</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="space-y-3">
                      {projects.map((project) => (
                        <Card
                          key={project._id}
                          className={cn(
                            'p-4 cursor-pointer transition-all border-2 overflow-hidden group',
                            selectedProjectId === project._id
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/10'
                              : 'border-muted hover:border-primary/50 hover:bg-muted/50',
                          )}
                          onClick={() => {
                            setSelectedProjectId(project._id);
                            setSelectedProfileId('');
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1.5">
                              <h3 className="font-medium flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                {project.projectName}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    project.status === 'ACTIVE'
                                      ? 'default'
                                      : 'outline'
                                  }
                                  className={cn(
                                    'text-xs h-5 px-1.5',
                                    project.status === 'ACTIVE'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
                                      : '',
                                  )}
                                >
                                  {project.status === 'ACTIVE' ? (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  ) : (
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                  )}
                                  {project.status.charAt(0) +
                                    project.status.slice(1).toLowerCase()}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {project.profiles?.length || 0}{' '}
                                  {project.profiles?.length === 1
                                    ? 'role'
                                    : 'roles'}
                                </span>
                                {selectedProjectId === project._id &&
                                  project.profiles?.[0]?.title && (
                                    <span className="text-xs text-primary ml-2">
                                      {project.profiles[0].title}
                                    </span>
                                  )}
                              </div>
                            </div>
                            <ChevronRight
                              className={cn(
                                'h-5 w-5 text-muted-foreground transition-transform flex-shrink-0',
                                selectedProjectId === project._id
                                  ? 'text-primary rotate-90'
                                  : 'group-hover:translate-x-0.5',
                              )}
                            />
                          </div>

                          {selectedProjectId === project._id &&
                            project.profiles &&
                            project.profiles.length > 0 && (
                              <div className="mt-3 pt-3 border-t">
                                <h4 className="text-xs font-medium mb-2 text-muted-foreground">
                                  Select a profile to continue
                                </h4>
                                <div className="space-y-2">
                                  {project.profiles.map((profile) => (
                                    <div
                                      key={profile._id}
                                      className={cn(
                                        'flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors',
                                        selectedProfileId === profile._id
                                          ? 'bg-primary/10 text-primary'
                                          : 'hover:bg-muted/50',
                                      )}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedProfileId(profile._id);
                                      }}
                                    >
                                      <div
                                        className={cn(
                                          'h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0',
                                          selectedProfileId === profile._id
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-muted-foreground/30',
                                        )}
                                      >
                                        {selectedProfileId === profile._id && (
                                          <div className="h-2 w-2 rounded-full bg-current" />
                                        )}
                                      </div>
                                      <span className="text-sm truncate">
                                        {profile.title ||
                                          profile.domain ||
                                          'Untitled Profile'}
                                      </span>
                                      {profile.isDefault && (
                                        <Badge
                                          variant="secondary"
                                          className="ml-auto text-xs"
                                        >
                                          Default
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </Card>
                      ))}
                    </TabsContent>
                    <TabsContent value="active" className="space-y-3">
                      {projects
                        .filter((project) => project.status === 'ACTIVE')
                        .map((project) => (
                          <Card
                            key={project._id}
                            className={cn(
                              'p-4 cursor-pointer transition-all border-2 overflow-hidden group',
                              selectedProjectId === project._id
                                ? 'border-primary bg-primary/5 ring-2 ring-primary/10'
                                : 'border-muted hover:border-primary/50 hover:bg-muted/50',
                            )}
                            onClick={() => {
                              setSelectedProjectId(project._id);
                              setSelectedProfileId('');
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-1.5">
                                <h3 className="font-medium flex items-center gap-2">
                                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                                  {project.projectName}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="default"
                                    className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800 text-xs h-5 px-1.5"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    {project.status.charAt(0) +
                                      project.status.slice(1).toLowerCase()}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {project.profiles?.length || 0}{' '}
                                    {project.profiles?.length === 1
                                      ? 'profile'
                                      : 'profiles'}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight
                                className={cn(
                                  'h-5 w-5 text-muted-foreground transition-transform flex-shrink-0',
                                  selectedProjectId === project._id
                                    ? 'text-primary'
                                    : 'group-hover:translate-x-0.5',
                                )}
                              />
                            </div>

                            {selectedProjectId === project._id &&
                              project.profiles &&
                              project.profiles.length > 0 && (
                                <div className="mt-3 pt-3 border-t">
                                  <h4 className="text-xs font-medium mb-2 text-muted-foreground">
                                    Select a profile to continue
                                  </h4>
                                  <div className="space-y-2">
                                    {project.profiles.map((profile) => (
                                      <div
                                        key={profile._id}
                                        className={cn(
                                          'flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors',
                                          selectedProfileId === profile._id
                                            ? 'bg-primary/10 text-primary'
                                            : 'hover:bg-muted/50',
                                        )}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedProfileId(profile._id);
                                        }}
                                      >
                                        <div
                                          className={cn(
                                            'h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0',
                                            selectedProfileId === profile._id
                                              ? 'border-primary bg-primary text-primary-foreground'
                                              : 'border-muted-foreground/30',
                                          )}
                                        >
                                          {selectedProfileId ===
                                            profile._id && (
                                            <div className="h-2 w-2 rounded-full bg-current" />
                                          )}
                                        </div>
                                        <span className="text-sm truncate">
                                          {profile.title ||
                                            profile.domain ||
                                            'Untitled Profile'}
                                        </span>
                                        {profile.isDefault && (
                                          <Badge
                                            variant="secondary"
                                            className="ml-auto text-xs"
                                          >
                                            Default
                                          </Badge>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </Card>
                        ))}
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            )}

            {/* Step 2: Review and Send */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Review Invitation</h3>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Project Details
                    </h4>
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {getSelectedProject()?.projectName}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {getSelectedProject()?.status.charAt(0) +
                              (getSelectedProject()
                                ?.status.slice(1)
                                .toLowerCase() || '')}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Profile Details
                    </h4>
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary text-secondary-foreground">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">
                            {getSelectedProfile()?.title ||
                              getSelectedProfile()?.domain ||
                              'Untitled Profile'}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {getSelectedProfile()?.description ||
                              'No description available'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
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

          <DialogFooter className="sm:justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Cost: {hireCost} Connects</span>
            </div>
            <div className="flex gap-2">
              {step === 2 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={submitting}
                >
                  Back
                </Button>
              )}
              {step === 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!selectedProjectId || !selectedProfileId}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleConfirm} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Invitation'
                  )}
                </Button>
              )}
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
