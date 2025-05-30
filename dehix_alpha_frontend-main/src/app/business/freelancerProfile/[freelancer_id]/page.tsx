'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  X,
  Briefcase,
  GraduationCap,
  Code,
  Layers,
  BookOpen,
  UserCircle,
} from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Skill {
  _id: string;
  name: string;
}

interface Domain {
  _id: string;
  name: string;
}

interface Project {
  _id: string;
  projectName: string;
  description: string;
  role: string;
  start: string;
  end: string;
  techUsed: string[];
  githubLink?: string;
  projectType?: string;
}

interface ProfessionalExperience {
  _id: string;
  jobTitle: string;
  company: string;
  workFrom: string;
  workTo: string;
}

interface Education {
  _id: string;
  degree: string;
  fieldOfStudy: string;
  grade: string;
  startDate: string;
  endDate: string;
}

interface FreelancerProfile {
  firstName: string;
  lastName: string;
  description: string;
  profilePic?: string;
  skills: Skill[];
  domain: Domain[];
  projectDomain: Domain[];
  projects: Project[];
  professionalInfo: ProfessionalExperience[];
  education: Education[];
}

const FreelancerProfile = () => {
  const { freelancer_id } = useParams<{ freelancer_id: string }>();
  const [profileData, setProfileData] = useState<FreelancerProfile | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (freelancer_id) {
      const fetchFreelancerDetails = async () => {
        try {
          setLoading(true);
          const response = await axiosInstance.get(
            `/freelancer/${freelancer_id}/profile-info`,
          );
          if (response.status === 200) {
            setProfileData(response.data);
          }
        } catch (error) {
          console.error('Error fetching freelancer details', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to fetch freelancer details.',
          });
        } finally {
          setLoading(false);
        }
      };

      fetchFreelancerDetails();
    }
  }, [freelancer_id]);

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM yyyy');
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-pulse space-y-4">
            <div className="h-12 w-48 bg-muted rounded"></div>
            <div className="h-64 w-full max-w-2xl bg-muted rounded"></div>
            <div className="h-32 w-full max-w-2xl bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const ProjectDialog = ({
    project,
    onClose,
  }: {
    project: Project;
    onClose: () => void;
  }) => {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-card text-card-foreground p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{project.projectName}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Description</h3>
              <p className="text-muted-foreground">{project.description}</p>
            </div>

            <div>
              <h3 className="font-semibold">Role</h3>
              <p className="text-muted-foreground">{project.role}</p>
            </div>

            <div>
              <h3 className="font-semibold">Duration</h3>
              <p className="text-muted-foreground">
                {formatDate(project.start)} - {formatDate(project.end)}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Technologies Used</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {project.techUsed?.map((tech, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-muted rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {project.githubLink && (
              <div>
                <h3 className="font-semibold">GitHub</h3>
                <a
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {project.githubLink}
                </a>
              </div>
            )}

            {project.projectType && (
              <div>
                <h3 className="font-semibold">Project Type</h3>
                <p className="text-muted-foreground">{project.projectType}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active=""
      />
      <div className="flex flex-col sm:gap-4 mb-8 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Projects"
          breadcrumbItems={[
            { label: 'Business', link: '/dashboard/business' },
            { label: 'Business Marketplace', link: '/business/market' },
            { label: 'Freelancer Profile', link: '/business/market' },
            {
              label: `${profileData?.firstName || ''} ${profileData?.lastName || ''}`,
              link: `/dashboard/business/${freelancer_id}`,
            },
          ]}
        />

        <div className="flex p-3 px-3 md:px-14 relative flex-col sm:gap-8 sm:py-0">
          <main className="mt-8 max-w-4xl mx-auto">
            {/* Profile Info */}
            <Card className="mb-8 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted border-2 border-border shadow-md">
                    {profileData?.profilePic ? (
                      <Image
                        src={profileData.profilePic}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary/10">
                        <UserCircle className="h-12 w-12 text-primary/60" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {profileData?.firstName} {profileData?.lastName}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      {profileData?.description || 'No description available'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="mb-6 overflow-hidden border border-border shadow-md">
              <CardHeader className="bg-primary/5 border-b border-border py-4">
                <CardTitle className="text-md font-semibold text-primary flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {profileData?.skills?.map((skill) => (
                    <div
                      key={skill._id}
                      className="flex items-center gap-1 px-3 py-1 bg-muted/50 border border-border rounded-full shadow-sm"
                    >
                      <span>{skill.name}</span>
                    </div>
                  ))}
                  {!profileData?.skills?.length && (
                    <p className="text-muted-foreground italic">
                      No skills added
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Domain */}
            <Card className="mb-6 overflow-hidden border border-border shadow-md">
              <CardHeader className="bg-indigo-500/5 dark:bg-indigo-500/10 border-b border-border py-4">
                <CardTitle className="text-md font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Domain
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-1">
                  {profileData?.domain?.map((domain) => (
                    <div
                      key={domain._id}
                      className="py-2 px-3 bg-muted/50 border border-border rounded-md mb-2 shadow-sm"
                    >
                      {domain.name}
                    </div>
                  ))}
                  {!profileData?.domain?.length && (
                    <p className="text-muted-foreground italic">
                      No domains added
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Project Domain */}
            <Card className="mb-6 overflow-hidden border border-border shadow-md">
              <CardHeader className="bg-purple-500/5 dark:bg-purple-500/10 border-b border-border py-4">
                <CardTitle className="text-md font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Project Domain
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-1">
                  {profileData?.projectDomain?.map((domain) => (
                    <div
                      key={domain._id}
                      className="py-2 px-3 bg-muted/50 border border-border rounded-md mb-2 shadow-sm"
                    >
                      {domain.name}
                    </div>
                  ))}
                  {!profileData?.projectDomain?.length && (
                    <p className="text-muted-foreground italic">
                      No project domains added
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card className="mb-6 overflow-hidden border border-border shadow-md">
              <CardHeader className="bg-green-500/5 dark:bg-green-500/10 border-b border-border py-4">
                <CardTitle className="text-md font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-6">
                  {profileData &&
                  profileData.projects &&
                  profileData.projects.length > 0 ? (
                    profileData.projects.slice(0, 3).map((project) => (
                      <div
                        key={project._id}
                        className="border-b border-border pb-4 last:border-b-0"
                      >
                        <div className="flex justify-between items-start">
                          <h3
                            className="font-medium text-foreground hover:text-primary cursor-pointer"
                            onClick={() => setSelectedProject(project)}
                          >
                            {project.projectName}
                          </h3>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic">
                      No projects added
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Professional Experience */}
            <Card className="mb-6 overflow-hidden border border-border shadow-md">
              <CardHeader className="bg-amber-500/5 dark:bg-amber-500/10 border-b border-border py-4">
                <CardTitle className="text-md font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Professional Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {profileData &&
                  profileData.professionalInfo &&
                  profileData.professionalInfo.length > 0 ? (
                    profileData.professionalInfo
                      .slice(0, 5)
                      .map((experience) => (
                        <div
                          key={experience._id}
                          className="flex gap-4 p-3 bg-muted/50 border border-border rounded-md shadow-sm"
                        >
                          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/30 rounded-md flex items-center justify-center flex-shrink-0">
                            <Briefcase className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">
                              {experience.jobTitle}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {experience.company}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(experience.workFrom)} -{' '}
                              {formatDate(experience.workTo)}
                            </p>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-muted-foreground italic">
                      No professional experience added
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Separator className="h-px bg-border my-6" />

            {/* Education */}
            <Card className="mb-6 overflow-hidden border border-border shadow-md">
              <CardHeader className="bg-cyan-500/5 dark:bg-cyan-500/10 border-b border-border py-4">
                <CardTitle className="text-md font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {profileData?.education?.length ? (
                    profileData.education.slice(0, 3).map((edu) => (
                      <div
                        key={edu._id}
                        className="flex justify-between p-3 bg-muted/50 border border-border rounded-md shadow-sm"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {edu.degree}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {edu.fieldOfStudy}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Grade: {edu.grade}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground bg-cyan-500/5 dark:bg-cyan-500/10 px-3 py-1 rounded-md h-fit">
                          {formatDate(edu.startDate)} -{' '}
                          {formatDate(edu.endDate)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic">
                      No education details added
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>

        {selectedProject && (
          <ProjectDialog
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </div>
    </div>
  );
};

export default FreelancerProfile;
