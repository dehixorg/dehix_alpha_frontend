'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  Building2,
  Target,
  Bookmark,
  DollarSign,
  Users,
  Clock,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProfileRequirements } from '@/components/shared/ProfileRequirements';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectApplicationForm from '@/components/shared/ProjectApplicationPage';
import { axiosInstance } from '@/lib/axiosinstance';
import { profileTypeOutlineClasses } from '@/utils/common/getBadgeStatus';
import { AppDispatch, RootState } from '@/lib/store';
import {
  addDraftedProject,
  removeDraftedProject,
} from '@/lib/projectDraftSlice';
import FreelancerAppLayout from '@/components/layout/FreelancerAppLayout';

interface Bid {
  _id: string;
  userName: string;
  current_price: number;
  bid_status: string;
  description: string;
}

interface Profile {
  _id: string;
  domain: string;
  freelancersRequired: number;
  skills: string[];
  experience: number;
  minConnect?: number;
  rate?: number;
  description?: string;
  totalBid?: string[];
  profileType: 'FREELANCER' | 'CONSULTANT';
  budget?: {
    type: string;
    fixedAmount?: number;
    hourlyRate?: number;
    hourly?: {
      minRate?: number;
      maxRate?: number;
      estimatedHours?: number;
    };
    min?: number;
    max?: number;
  };
}

interface Budget {
  type: 'fixed' | 'hourly';
  hourly?: {
    minRate?: number;
    maxRate?: number;
    estimatedHours?: number;
  };
  fixedAmount?: number;
}

interface ProjectData {
  _id: string;
  projectName: string;
  projectDomain: string[];
  description: string;
  companyName: string;
  skillsRequired?: string[];
  status: string;
  projectType: string;
  profiles?: Profile[];
  bids?: Bid[];
  budget: Budget;
  createdAt: string;
  updatedAt?: string;
}

// ProjectType has been consolidated into ProjectData

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [isLoading, setIsLoading] = useState(false);
  const [project, setProject] = useState<ProjectData | null>(null);

  // Helper function to format budget display
  const formatBudgetDisplay = (project: ProjectData) => {
    // Check if budget is in profiles (new structure)
    if (project.profiles && project.profiles.length > 0) {
      const profile = project.profiles[0];
      if (profile.budget?.type === 'FIXED' && profile.budget.fixedAmount) {
        return `$${profile.budget.fixedAmount.toLocaleString()} (Fixed)`;
      } else if (profile.budget?.type === 'HOURLY') {
        if (profile.budget.hourlyRate) {
          return `$${profile.budget.hourlyRate}/hr`;
        } else if (
          profile.budget.hourly?.minRate &&
          profile.budget.hourly?.maxRate
        ) {
          return `$${profile.budget.hourly.minRate} - $${profile.budget.hourly.maxRate}/hr`;
        } else if (profile.budget.hourly?.minRate) {
          return `$${profile.budget.hourly.minRate}/hr`;
        }
      } else if (profile.budget?.min && profile.budget?.max) {
        return `$${profile.budget.min} - $${profile.budget.max}`;
      }
    }

    // Check if budget is at project level (old structure)
    if (project.budget?.type === 'fixed' && project.budget.fixedAmount) {
      return `$${project.budget.fixedAmount.toLocaleString()} (Fixed)`;
    } else if (project.budget?.type === 'hourly') {
      if (project.budget.hourly?.minRate && project.budget.hourly?.maxRate) {
        return `$${project.budget.hourly.minRate} - $${project.budget.hourly.maxRate}/hr`;
      } else if (project.budget.hourly?.minRate) {
        return `$${project.budget.hourly.minRate}/hr`;
      }
    }

    return 'Negotiable';
  };
  const [saving, setSaving] = useState(false);
  const draftedProjects = useSelector(
    (state: RootState) => state.projectDraft.draftedProjects,
  );
  const isDrafted = project?._id
    ? draftedProjects?.includes(project._id)
    : false;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(
          `/project/${params.project_id}`,
        );
        setProject(response.data.data);
      } catch (error) {
        console.error('Error fetching project:', error);
        notifyError(
          'Failed to load project details. Please try again later.',
          'Error',
        );
        router.push('/freelancer/market');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [params.project_id, router]);

  const handleCancel = (): void => {
    router.back();
  };

  const handleSave = async () => {
    if (!project?._id || saving) return;
    setSaving(true);
    try {
      const response = await axiosInstance.put(`/freelancer/draft`, {
        project_id: project._id,
      });
      if (response.status === 200) {
        dispatch(addDraftedProject(project._id));
        notifySuccess(
          'You can find this project in your saved items.',
          'Added to saved projects',
        );
      }
    } catch (error: any) {
      console.error('Failed to add project to draft:', error);
      notifyError(
        error?.response?.data?.message || 'Failed to save project',
        'Error',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUnsave = async () => {
    if (!project?._id || saving) return;
    setSaving(true);
    try {
      const response = await axiosInstance.delete('/freelancer/draft', {
        data: { project_id: project._id },
      });
      if (response.status === 200) {
        dispatch(removeDraftedProject(project._id));
        notifySuccess(
          'This project has been removed from your saved items.',
          'Removed from saved projects',
        );
      }
    } catch (error: any) {
      console.error('Failed to remove project from draft:', error);
      notifyError(
        error?.response?.data?.message || 'Failed to remove project',
        'Error',
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && !project) {
    return (
      <FreelancerAppLayout
        active="Market"
        activeMenu="Market"
        breadcrumbItems={[
          { label: 'Freelancer', link: '/dashboard/freelancer' },
          { label: 'Marketplace', link: '/freelancer/market' },
          { label: 'Loading...', link: '#' },
        ]}
        containerClassName="flex min-h-screen w-full bg-background"
        mainClassName="p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto"
      >
        {/* Header Skeleton */}
        <div className="space-y-8">
          <div className="bg-gradient p-6 rounded-lg border">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <Skeleton className="h-9 w-32" />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Overview Skeleton */}
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                  <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </CardContent>
              </Card>

              {/* Requirements & Skills Skeleton */}
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <Skeleton className="h-5 w-32 mb-3" />
                    <div className="flex flex-wrap gap-2">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-6 w-20" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Skeleton className="h-5 w-32 mb-3" />
                    <div className="flex items-center gap-2">
                      <div className="w-full max-w-[200px]">
                        <Skeleton className="h-2 w-full" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column Skeleton */}
            <div className="space-y-6">
              {/* Project Summary Skeleton */}
              <Card className="sticky top-6">
                <CardHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-6 w-36" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Application Form Skeleton */}
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                  <Skeleton className="h-4 w-56 mt-1" />
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                  <Skeleton className="h-10 w-full mt-4" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </FreelancerAppLayout>
    );
  }

  return (
    <FreelancerAppLayout
      active="Market"
      activeMenu="Market"
      breadcrumbItems={[
        { label: 'Dashboard', link: '/dashboard/freelancer' },
        { label: 'Marketplace', link: '/freelancer/market' },
        { label: project?.projectName || 'Project', link: '#' },
      ]}
      mainClassName="p-4 sm:px-8"
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Header Section */}
          <div className="bg-gradient p-6 rounded-lg border">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                      {project?.projectName || 'Project Details'}
                    </h1>
                    {project?.status && (
                      <Badge
                        variant={
                          project.status === 'open' ? 'default' : 'destructive'
                        }
                        className="px-3 py-1 text-xs"
                      >
                        {project.status.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  {project && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 mr-1" />
                        {project.companyName}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="flex items-center gap-1">
                        Posted{' '}
                        {format(new Date(project.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={saving || !project}
                  onClick={() => (isDrafted ? handleUnsave() : handleSave())}
                >
                  <Bookmark
                    className={`h-4 w-4 mr-2 ${isDrafted ? 'fill-current text-amber-500' : ''}`}
                  />
                  {isDrafted
                    ? saving
                      ? 'Removing...'
                      : 'Saved'
                    : saving
                      ? 'Saving...'
                      : 'Save for Later'}
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-10">
            {/* Left Column - Project Details */}
            <div className="lg:col-span-6 space-y-6">
              {/* Project Overview Card */}
              <Card>
                <CardHeader className="bg-gradient p-6 rounded-t-lg border">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">Project Overview</CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Badge
                      className={profileTypeOutlineClasses(
                        project?.projectType || '',
                      )}
                      variant="outline"
                    >
                      {project?.projectType}
                    </Badge>{' '}
                    • {project?.projectDomain}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Project Summary Section */}
                  <div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <DollarSign className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Budget
                            </p>
                            <p className="font-medium">
                              {project
                                ? formatBudgetDisplay(project)
                                : 'Negotiable'}
                            </p>
                            {project &&
                              project.profiles &&
                              project.profiles.length > 0 &&
                              project.profiles[0].budget?.type === 'HOURLY' &&
                              project.profiles[0].budget.hourly
                                ?.estimatedHours && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  ~
                                  {
                                    project.profiles[0].budget.hourly
                                      .estimatedHours
                                  }{' '}
                                  hours estimated
                                </p>
                              )}
                            {project?.budget?.type === 'hourly' &&
                              project.budget.hourly?.estimatedHours && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  ~{project.budget.hourly.estimatedHours} hours
                                  estimated
                                </p>
                              )}
                          </div>
                        </div>

                        {project?.createdAt && (
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Posted
                              </p>
                              <p className="font-medium">
                                {format(
                                  new Date(project.createdAt),
                                  'MMM d, yyyy',
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {Math.ceil(
                                  (new Date().getTime() -
                                    new Date(project.createdAt).getTime()) /
                                    (1000 * 60 * 60 * 24),
                                )}{' '}
                                days ago
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Proposals
                            </p>
                            <p className="font-medium">
                              {project?.profiles?.reduce(
                                (total, profile) =>
                                  total + (profile.totalBid?.length || 0),
                                0,
                              ) || 0}{' '}
                              {project?.profiles?.reduce(
                                (total, profile) =>
                                  total + (profile.totalBid?.length || 0),
                                0,
                              ) === 1
                                ? 'proposal'
                                : 'proposals'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Project Type
                            </p>
                            <p className="font-medium">
                              {project?.projectType || 'Not specified'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {project?.description || 'No description provided.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Application Form */}
              {project && (
                <ProjectApplicationForm
                  project={project}
                  isLoading={isLoading}
                  onCancel={handleCancel}
                />
              )}
            </div>

            {/* Right Column - Application & Details */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-lg">Requirements & Skills</CardTitle>
              </div>
              {/* Requirements & Skills Card */}

              <div className="space-y-4">
                {project?.profiles && project.profiles.length > 0 ? (
                  project.profiles.map((profile, index) => (
                    <ProfileRequirements key={index} profile={profile} />
                  ))
                ) : (
                  <div className="text-center py-2 text-muted-foreground text-sm">
                    No specific requirements provided.
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </FreelancerAppLayout>
  );
};

export default Page;
