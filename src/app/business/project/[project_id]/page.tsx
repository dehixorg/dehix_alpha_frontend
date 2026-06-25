'use client';

import { CalendarX2, Users2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import ProjectDetailCard from '@/components/freelancer/project/projectDetailCard';
import { axiosInstance } from '@/lib/axiosinstance';
import ProjectSkillCard from '@/components/business/projectSkillCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BidsDetails from '@/components/freelancer/project/bidsDetail';
import { StatusEnum } from '@/utils/freelancer/enum';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import AddProfileDialog from '@/components/dialogs/addProfileDialog';
import type { Milestone } from '@/utils/types/Milestone';
import BusinessDashboardLayout from '@/components/layout/BusinessDashboardLayout';

interface ProjectProfile {
  _id?: string;
  selectedFreelancer?: string[];
  totalBid?: number[];
  domain?: string;
  profileType?: string;
  freelancersRequired?: string;
  skills?: string[];
  experience?: number;
  minConnect?: number;
  rate?: number;
  description?: string;
  domain_id: string;
  freelancers?: {
    freelancerId: string;
    bidId: string;
  };
  team: string[];
}

interface Consultant {
  _id: string;
  name: string;
  domain: string;
  email: string;
  startDate?: Date;
  endDate?: Date;
  status: string;
}

interface Project {
  _id: string;
  projectName: string;
  projectDomain: string;
  description: string;
  companyId: string;
  email: string;
  url?: { value: string }[];
  verified?: any;
  isVerified?: string;
  companyName: string;
  start?: Date;
  end?: Date | null;
  skillsRequired: string[];
  experience?: string;
  role?: string;
  projectType?: string;
  profiles?: ProjectProfile[];
  milestones?: Milestone[];
  status?: StatusEnum; // enum
  team?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  consultants?: Consultant[];
}

export default function Dashboard() {
  const { project_id } = useParams<{ project_id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isAddProfileDialogOpen, setIsAddProfileDialogOpen] = useState(false);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(true);

  const fetchInterviews = async () => {
    if (!project_id) return;
    try {
      setLoadingInterviews(true);
      const response = await axiosInstance.get('/interview/business', {
        params: { interviewStatus: 'current' },
      });
      const data = response?.data?.data || {};
      const allInterviews = [
        ...(data.PROJECT || []),
        ...(data.TALENT || []),
        ...(data.HIRE || []),
        ...(data.GROWTH || []),
        ...(data.PEERTOPEER || []),
        ...(data.INTERVIEWER || []),
      ];
      const projectInterviews = allInterviews.filter((it: any) => {
        const pId =
          typeof it.projectId === 'object' && it.projectId !== null
            ? it.projectId._id
            : it.projectId;
        return String(pId || '') === String(project_id || '');
      });
      setInterviews(projectInterviews);
    } catch (error) {
      console.error('Error fetching project interviews:', error);
    } finally {
      setLoadingInterviews(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [project_id]);

  useEffect(() => {
    const handleInterviewCreated = () => {
      fetchInterviews();
    };
    window.addEventListener('interview-created', handleInterviewCreated);
    return () => {
      window.removeEventListener('interview-created', handleInterviewCreated);
    };
  }, [project_id]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Your existing project data fetching code
        const response = await axiosInstance.get(`/project/${project_id}`);
        const projectData = response?.data?.data?.data || response?.data?.data;
        if (projectData) {
          setProject(projectData);
        }
      } catch (error) {
        notifyError('Something went wrong. Please try again.', 'Error');
        console.error('API Error:', error);
      }
    };
    fetchData();
  }, [project_id]);

  const handleCompleteProject = (): void => {
    if (!project_id) {
      notifyError('Project ID is missing.', 'Error');
      return;
    }

    axiosInstance
      .put(`/project/${project_id}`, { status: StatusEnum.COMPLETED })
      .then((response) => {
        if (response.status === 200) {
          setProject((prev) =>
            prev ? { ...prev, status: StatusEnum.COMPLETED } : prev,
          );
          notifySuccess('Project marked as completed!', 'Success');
        } else {
          console.error('Unexpected response:', response);
          notifyError('Failed to mark project as completed.', 'Failed');
        }
      })
      .catch((error) => {
        console.error('Error updating project status:', error);
        notifyError(
          'An error occurred while updating the project status.',
          'Error',
        );
      });
  };

  // Handle project start
  const handleStartProject = (): void => {
    if (!project_id) {
      notifyError('Project ID is missing.', 'Error');
      return;
    }

    axiosInstance
      .put(`/project/${project_id}`, { status: StatusEnum.ACTIVE })
      .then((response) => {
        if (response.status === 200) {
          setProject((prev) =>
            prev ? { ...prev, status: StatusEnum.ACTIVE } : prev,
          );
          notifySuccess('Project started successfully!', 'Success');
        } else {
          console.error('Unexpected response:', response);
          notifyError('Failed to start the project.', 'Failed');
        }
      })
      .catch((error) => {
        console.error('Error updating project status:', error);
        notifyError('An error occurred while starting the project.', 'Error');
      });
  };
  // Handle project mark as incomplete
  const handleIncompleteProject = (): void => {
    if (!project_id) {
      notifyError('Project ID is missing.', 'Error');
      return;
    }

    axiosInstance
      .put(`/project/${project_id}`, { status: StatusEnum.ACTIVE })
      .then((response) => {
        if (response.status === 200) {
          setProject((prev) =>
            prev ? { ...prev, status: StatusEnum.ACTIVE } : prev,
          );
          notifySuccess('Project marked as incomplete!', 'Success');
        } else {
          console.error('Unexpected response:', response);
          notifyError('Failed to mark project as incomplete.', 'Failed');
        }
      })
      .catch((error) => {
        console.error('Error updating project status:', error);
        notifyError(
          'An error occurred while updating the project status.',
          'Error',
        );
      });
  };

  // Handle profile addition
  const handleAddProfile = () => {
    setIsAddProfileDialogOpen(true);
  };

  // Handle profile added successfully
  const handleProfileAdded = async () => {
    // Refetch project data to update the profiles list
    try {
      const response = await axiosInstance.get(`/project/${project_id}`);
      const projectData = response?.data?.data?.data || response?.data?.data;

      if (projectData) {
        setProject(projectData);
      }
    } catch (error) {
      console.error('Error refetching project:', error);
      notifyError('Failed to refresh project data.', 'Error');
    }
  };

  if (!project) {
    return (
      <BusinessDashboardLayout
        active="Projects"
        activeMenu="Projects"
        breadcrumbItems={[{ label: 'Project', link: '/business/projects' }]}
        contentClassName="flex flex-col sm:gap-4 sm:py-4 md:py-0 sm:pl-14 mb-8"
        mainClassName="flex flex-col lg:grid lg:grid-cols-4 xl:grid-cols-4 flex-1 items-start gap-4 p-4 sm:px-6 sm:py-3 md:gap-8"
      >
        <div className="w-full lg:col-span-3 space-y-4 md:space-y-8">
          {/* Project Info Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex flex-wrap gap-2 pt-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-20 rounded-full" />
              ))}
            </div>
          </div>

          {/* Profiles Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex flex-wrap gap-1 pt-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full lg:col-span-1 lg:w-auto mt-8 lg:mt-0 space-y-6 min-w-0">
          <Skeleton className="h-8 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </BusinessDashboardLayout>
    );
  }

  return (
    <BusinessDashboardLayout
      active="Projects"
      activeMenu="Projects"
      breadcrumbItems={[
        { label: 'Project', link: '/business/projects' },
        { label: project.projectName, link: '#' },
      ]}
      contentClassName="flex flex-col sm:gap-4 sm:py-4 md:py-0 sm:pl-14 mb-8"
      mainClassName="flex flex-col lg:grid lg:grid-cols-4 xl:grid-cols-4 flex-1 items-start gap-4 p-4 sm:px-6 sm:py-3 md:gap-8"
    >
      <div className="w-full lg:col-span-3 space-y-4 md:space-y-8">
        <Card className="overflow-hidden rounded-xl border shadow-sm">
          <Tabs defaultValue="Project-Info" className="w-full">
            <div className="border-b px-4 sm:px-6">
              <div className="-mx-1 max-w-full overflow-x-auto no-scrollbar px-1">
                <TabsList className="bg-transparent h-12 w-max min-w-full md:w-auto p-0 flex-nowrap">
                  <TabsTrigger
                    value="Project-Info"
                    className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Project Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="Profiles"
                    className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Profile Bids
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="Project-Info" className="m-0">
              <CardContent className="p-4 sm:p-6 space-y-6">
                <ProjectDetailCard
                  projectName={project.projectName}
                  description={project.description}
                  email={project.email}
                  status={project.status}
                  startDate={project.createdAt}
                  endDate={project.end}
                  projectDomain={project.projectDomain}
                  skills={project.skillsRequired}
                  projectId={project._id}
                  handleCompleteProject={handleCompleteProject}
                  handleStartProject={handleStartProject}
                  handleIncompleteProject={handleIncompleteProject}
                  userRole="Business"
                  milestones={project.milestones}
                />

                <div className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">Profiles</CardTitle>
                      <CardDescription>
                        Define requirements and manage team allocation
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div>
                  {!project.profiles || project.profiles.length === 0 ? (
                    <div className="rounded-xl border bg-muted/20 p-8 sm:p-10 text-center">
                      <div className="mx-auto mb-5 h-14 w-14 rounded-2xl border bg-background flex items-center justify-center">
                        <Users2 className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <div className="text-sm font-semibold">
                        No profiles yet
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Add a profile to start receiving bids for specific
                        roles.
                      </p>
                      {project.status !== StatusEnum.COMPLETED &&
                        project.status !== StatusEnum.REJECTED && (
                          <div className="mt-5 flex justify-center">
                            <ProjectSkillCard
                              isLastCard={true}
                              onAddProfile={handleAddProfile}
                            />
                          </div>
                        )}
                    </div>
                  ) : (
                    <Carousel className="w-full relative pt-2">
                      <CarouselContent className="flex mt-3 -ml-2">
                        {project.profiles?.map((profile, index) => (
                          <CarouselItem
                            key={index}
                            className="basis-full md:basis-1/2 lg:basis-1/2 xl:basis-1/3"
                          >
                            <ProjectSkillCard
                              domainName={profile.domain}
                              description={profile.description}
                              email={project.email}
                              profileType={profile.profileType}
                              startDate={project.createdAt}
                              endDate={project.end}
                              domains={[]}
                              skills={profile.skills}
                              team={profile.team || []}
                            />
                          </CarouselItem>
                        ))}
                        {project.status !== StatusEnum.COMPLETED &&
                          project.status !== StatusEnum.REJECTED && (
                            <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/2 xl:basis-1/3 pl-2">
                              <ProjectSkillCard
                                isLastCard={true}
                                onAddProfile={handleAddProfile}
                              />
                            </CarouselItem>
                          )}
                      </CarouselContent>
                      <div className="flex mb-2">
                        <CarouselPrevious className="absolute left-0 top-0 transform -translate-y-1/2 shadow-md transition-colors bg-muted-foreground/20 dark:bg-muted/20" />
                        <CarouselNext className="absolute right-0 top-0 transform -translate-y-1/2 shadow-md transition-colors bg-muted-foreground/20 dark:bg-muted/20" />
                      </div>
                    </Carousel>
                  )}
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="Profiles" className="m-0">
              <CardContent className="p-0">
                <BidsDetails id={project_id || ''} />
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <div className="w-full lg:col-span-1 lg:w-auto mt-8 lg:mt-0 space-y-6 min-w-0">
        <div className="flex items-center justify-between">
          <CardTitle className="group flex items-center gap-2 text-xl">
            Interviews
          </CardTitle>
          {interviews.length > 0 && (
            <Badge
              variant="outline"
              className="text-xs bg-primary/5 text-primary border-primary/20"
            >
              {interviews.length}{' '}
              {interviews.length === 1 ? 'Interview' : 'Interviews'}
            </Badge>
          )}
        </div>

        {loadingInterviews ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-10 border rounded-xl bg-muted/10">
            <CalendarX2
              className="mx-auto mb-3 text-muted-foreground/60"
              size="64"
            />
            <p className="text-muted-foreground text-sm font-medium">
              No active interviews
            </p>
            <p className="text-xs text-muted-foreground/80 mt-1">
              Interviews scheduled for this project will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
            {interviews.map((interview) => {
              const date = interview.interviewDate
                ? new Date(interview.interviewDate)
                : null;
              const type = String(interview.interviewType || '').toUpperCase();
              const status = String(
                interview.interviewStatus || '',
              ).toUpperCase();

              // Get status pill class
              let statusColor =
                'bg-amber-500/10 text-amber-500 border-amber-500/20';
              if (status === 'SCHEDULED' || status === 'APPROVED') {
                statusColor = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
              } else if (status === 'ONGOING') {
                statusColor =
                  'bg-green-500/10 text-green-500 border-green-500/20';
              } else if (status === 'COMPLETED') {
                statusColor =
                  'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
              } else if (status === 'REJECTED' || status === 'CANCELLED') {
                statusColor = 'bg-red-500/10 text-red-500 border-red-500/20';
              }

              return (
                <Card
                  key={interview._id}
                  className="overflow-hidden transition-all duration-200 hover:shadow-md border-muted/60 bg-card/50 backdrop-blur-sm"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="secondary"
                        className="font-semibold text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-md"
                      >
                        {type}
                      </Badge>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusColor}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-semibold truncate">
                        {interview.talentName ||
                          interview.name ||
                          'Freelancer Interview'}
                      </p>
                      {interview.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {interview.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-1 flex flex-col gap-1.5 text-xs text-muted-foreground border-t border-dashed mt-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground/80">
                          Candidate:
                        </span>
                        <span className="truncate">
                          {interview.interviewee?.firstName
                            ? `${interview.interviewee.firstName} ${interview.interviewee.lastName || ''}`
                            : interview.interviewee?.userName || 'Pending...'}
                        </span>
                      </div>

                      {interview.interviewer && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground/80">
                            Interviewer:
                          </span>
                          <span className="truncate">
                            {interview.interviewer?.firstName
                              ? `${interview.interviewer.firstName} ${interview.interviewer.lastName || ''}`
                              : interview.interviewer?.userName || '-'}
                          </span>
                        </div>
                      )}

                      {date && (
                        <div className="flex items-center gap-2 mt-1 text-[11px] bg-muted/40 p-1.5 rounded-lg">
                          <span className="font-medium">Date:</span>
                          <span>
                            {date.toLocaleDateString()}{' '}
                            {date.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    {status === 'ONGOING' && interview.meetingLink && (
                      <Button
                        size="sm"
                        className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium shadow-sm transition-all duration-200"
                        onClick={() =>
                          window.open(
                            interview.meetingLink,
                            '_blank',
                            'noopener,noreferrer',
                          )
                        }
                      >
                        Join Meeting
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Profile Dialog */}
      <AddProfileDialog
        projectId={project_id || ''}
        onProfileAdded={handleProfileAdded}
        open={isAddProfileDialogOpen}
        onOpenChange={setIsAddProfileDialogOpen}
      />
    </BusinessDashboardLayout>
  );
}
