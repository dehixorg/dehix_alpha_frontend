'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Briefcase, GraduationCap, FolderKanban } from 'lucide-react';

import { RootState } from '@/lib/store';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ExperienceCard from '@/components/cards/experienceCard';
import { AddExperience } from '@/components/dialogs/addExperiences';
import EducationInfoCard from '@/components/cards/educationInfoCard';
import { AddEducation } from '@/components/dialogs/addEducation';
import ProjectCard from '@/components/cards/freelancerProjectCard';
import { AddProject } from '@/components/dialogs/addProject';
import ProjectDetailsDialog from '@/components/dialogs/projectDetailsDialog';
import EditProjectDialog from '@/components/dialogs/editProjectDialog';
import {
  menuItemsBottom as freelancerMenuItemsBottom,
  menuItemsTop as freelancerMenuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';

export default function FreelancerProfileSettings() {
  const user = useSelector((state: RootState) => state.user);
  const [activeTab, setActiveTab] = useState('experience');

  // Professional
  const [expLoading, setExpLoading] = useState(false);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [expRefreshKey, setExpRefreshKey] = useState(0);

  // Education
  const [eduLoading, setEduLoading] = useState(false);
  const [educationInfo, setEducationInfo] = useState<any[]>([]);
  const [eduRefreshKey, setEduRefreshKey] = useState(0);

  // Projects
  const [projLoading, setProjLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [projRefreshKey, setProjRefreshKey] = useState(0);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const handleEducationDelete = async (educationId?: string): Promise<void> => {
    if (!educationId) return;
    try {
      await axiosInstance.delete(`/freelancer/education/${educationId}`);
      notifySuccess('Education record deleted successfully!');
      setEduRefreshKey((prev) => prev + 1);
    } catch (error) {
      notifyError('Failed to delete education. Please try again.', 'Error');
    }
  };
  // Fetch all slices in one request
  const refreshPulse = expRefreshKey + eduRefreshKey + projRefreshKey;
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!user?.uid) return;
      try {
        setExpLoading(true);
        setEduLoading(true);
        setProjLoading(true);
        const res = await axiosInstance.get(`/freelancer/${user.uid}`);
        const data = res.data?.data || {};
        const professionalInfo = data?.professionalInfo;
        const educationData = data?.education;
        const projectsData = data?.projects;

        if (mounted)
          setExperiences(
            professionalInfo && typeof professionalInfo === 'object'
              ? Object.values(professionalInfo)
              : [],
          );
        if (mounted)
          setEducationInfo(
            educationData && typeof educationData === 'object'
              ? Object.values(educationData)
              : [],
          );
        if (mounted)
          setProjects(
            projectsData && typeof projectsData === 'object'
              ? Object.values(projectsData)
              : [],
          );
      } catch (e) {
        notifyError('Failed to load profile data.', 'Error');
        if (mounted) {
          setExperiences([]);
          setEducationInfo([]);
          setProjects([]);
        }
      } finally {
        if (mounted) {
          setExpLoading(false);
          setEduLoading(false);
          setProjLoading(false);
        }
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [user?.uid, refreshPulse]);

  // Handlers: Projects
  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setIsDetailsDialogOpen(true);
  };
  const handleEditProject = () => {
    setIsDetailsDialogOpen(false);
    setIsEditDialogOpen(true);
  };
  const handleEditSuccess = () => {
    setProjRefreshKey((v) => v + 1);
    setIsEditDialogOpen(false);
    setSelectedProject(null);
    notifySuccess('Project updated.');
  };
  const handleDeleteSuccess = () => {
    setProjRefreshKey((v) => v + 1);
    setIsDetailsDialogOpen(false);
    setSelectedProject(null);
    notifySuccess('Project deleted.');
  };
  const handleCloseDialogs = () => {
    setIsDetailsDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedProject(null);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={freelancerMenuItemsTop}
        menuItemsBottom={freelancerMenuItemsBottom}
        active="Profile Settings"
        isKycCheck={true}
      />

      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14">
        <Header
          menuItemsTop={freelancerMenuItemsTop}
          menuItemsBottom={freelancerMenuItemsBottom}
          activeMenu="Profile Settings"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Settings', link: '#' },
            { label: 'Profile', link: '#' },
          ]}
        />

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 mb-6">
          <div className="w-full mx-auto mt-2">
            <div className="card rounded-xl border shadow-sm overflow-hidden">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="border-b px-4 sm:px-6">
                  <div className="flex sm:flex-row items-center justify-between gap-3">
                    <TabsList className="bg-transparent h-12 w-full md:w-auto p-0 overflow-x-auto no-scrollbar flex-nowrap -mx-2 px-2 sm:mx-0 sm:px-0">
                      <TabsTrigger
                        value="experience"
                        className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent flex-none"
                      >
                        <Briefcase className="h-4 w-4 mr-0 sm:mr-2" />
                        <span className="hidden sm:inline">Experience</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="education"
                        className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent flex-none"
                      >
                        <GraduationCap className="h-4 w-4 mr-0 sm:mr-2" />
                        <span className="hidden sm:inline">Education</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="projects"
                        className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent flex-none"
                      >
                        <FolderKanban className="h-4 w-4 mr-0 sm:mr-2" />
                        <span className="hidden sm:inline">Projects</span>
                      </TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-2 ml-auto overflow-x-auto no-scrollbar">
                      {activeTab === 'experience' && (
                        <AddExperience
                          onFormSubmit={() => setExpRefreshKey((v) => v + 1)}
                        />
                      )}
                      {activeTab === 'education' && (
                        <AddEducation
                          onFormSubmit={() => setEduRefreshKey((v) => v + 1)}
                        />
                      )}
                      {activeTab === 'projects' && (
                        <AddProject
                          onFormSubmit={() => setProjRefreshKey((v) => v + 1)}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Experience Tab */}
                <TabsContent value="experience" className="m-0">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Professional Experience
                    </CardTitle>
                    <CardDescription>
                      Showcase your work history and roles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {expLoading ? (
                      <ExperienceSkeleton />
                    ) : experiences.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-muted-foreground">
                        <Briefcase className="h-10 w-10" />
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            No experience added yet
                          </p>
                          <p className="text-sm">
                            Add your professional experience to showcase your
                            background.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {experiences.map((exp: any, idx: number) => (
                          <ExperienceCard
                            key={idx}
                            _id={exp._id}
                            {...exp}
                            onDelete={async (id?: string) => {
                              if (!id) return;
                              try {
                                await axiosInstance.delete(
                                  `/freelancer/${user.uid}/experience/${id}`,
                                );
                                notifySuccess('Experience deleted.');
                                setExpRefreshKey((v) => v + 1);
                              } catch (e) {
                                notifyError(
                                  'Failed to delete experience.',
                                  'Error',
                                );
                              }
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </TabsContent>

                {/* Education Tab */}
                <TabsContent value="education" className="m-0">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Educational Background
                    </CardTitle>
                    <CardDescription>
                      Add and manage your education
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {eduLoading ? (
                      <EducationSkeleton />
                    ) : educationInfo.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-muted-foreground">
                        <GraduationCap className="h-10 w-10" />
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            No education added yet
                          </p>
                          <p className="text-sm">
                            Include your education to complete your profile.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {educationInfo.map((education: any, idx: number) => (
                          <EducationInfoCard
                            key={idx}
                            {...education}
                            onDelete={() =>
                              handleEducationDelete(education._id)
                            }
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </TabsContent>

                {/* Projects Tab */}
                <TabsContent value="projects" className="m-0">
                  <CardHeader>
                    <CardTitle className="text-lg">Past Projects</CardTitle>
                    <CardDescription>
                      Manage your portfolio projects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {projLoading ? (
                      <ProjectsSkeleton />
                    ) : projects.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-muted-foreground">
                        <FolderKanban className="h-10 w-10" />
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            No projects yet
                          </p>
                          <p className="text-sm">
                            Add projects to showcase your work.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project: any, idx: number) => (
                          <ProjectCard
                            key={idx}
                            {...project}
                            onClick={() => handleProjectClick(project)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Dialogs */}
                    {selectedProject && (
                      <ProjectDetailsDialog
                        isOpen={isDetailsDialogOpen}
                        onClose={handleCloseDialogs}
                        onEdit={handleEditProject}
                        onDelete={handleDeleteSuccess}
                        project={selectedProject}
                      />
                    )}
                    {selectedProject && (
                      <EditProjectDialog
                        isOpen={isEditDialogOpen}
                        onClose={handleCloseDialogs}
                        onSuccess={handleEditSuccess}
                        project={selectedProject}
                      />
                    )}
                  </CardContent>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ExperienceSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-4 bg-muted">
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EducationSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-4 bg-muted">
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="h-48 bg-muted" />
      ))}
    </div>
  );
}
