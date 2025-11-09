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
import { useSelector } from 'react-redux';

import ProjectCard from '@/components/cards/freelancerProjectCard';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ConnectsDialog from '@/components/shared/ConnectsDialog';
import { RootState } from '@/lib/store';

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
  liveDemoLink?: string;
  thumbnail?: string;
  projectType?: string;
  verified?: boolean;
  refer?: string;
  oracleAssigned?: string | null;
  verificationUpdateTime?: string;
  comments?: string;
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
  email?: string;
  githubLink?: string;
  linkedin?: string;
  personalWebsite?: string;
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
  const [hireLoading, setHireLoading] = useState(false);
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (freelancer_id) {
      const fetchFreelancerDetails = async () => {
        try {
          setLoading(true);
          const response = await axiosInstance.get(
            `/public/freelancer/${freelancer_id}`,
          );
          if (response.status === 200) {
            const freelancerData = response.data.data || response.data;

            // Transform the data to match our interface
            const transformedData: FreelancerProfile = {
              firstName: freelancerData.firstName || '',
              lastName: freelancerData.lastName || '',
              description: freelancerData.description || '',
              profilePic: freelancerData.profilePic || '',
              email: freelancerData.email || '',
              githubLink: freelancerData.githubLink || '',
              linkedin: freelancerData.linkedin || '',
              personalWebsite: freelancerData.personalWebsite || '',
              skills: freelancerData.skills || [],
              domain: freelancerData.domain || [],
              projectDomain: freelancerData.projectDomain || [],
              projects: freelancerData.projects
                ? Array.isArray(freelancerData.projects)
                  ? freelancerData.projects
                  : Object.values(freelancerData.projects || {})
                : [],
              professionalInfo: freelancerData.professionalInfo
                ? Array.isArray(freelancerData.professionalInfo)
                  ? freelancerData.professionalInfo
                  : Object.values(freelancerData.professionalInfo || {})
                : [],
              education: freelancerData.education
                ? Array.isArray(freelancerData.education)
                  ? freelancerData.education
                  : Object.values(freelancerData.education || {})
                : [],
            };

            setProfileData(transformedData);
          }
        } catch (error) {
          console.error('Error fetching freelancer details', error);
          notifyError('Failed to fetch freelancer details.', 'Error');
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

  const handleHireNow = async (data?: any) => {
    // Backend will deduct connects; show toast and sync remaining connects locally
    const requiredConnects = parseInt(
      process.env.NEXT_PUBLIC__APP_HIRE_TALENT_COST || '0',
      10,
    );
    try {
      // Include freelancer_id in the hire request
      const hireData = {
        ...data,
        freelancer_id: freelancer_id,
      };

      const res = await axiosInstance.post(
        `/business/hire-dehixtalent/hire-now`,
        hireData,
      );
      const remaining = res?.data?.remainingConnects;
      if (typeof remaining === 'number') {
        try {
          localStorage.setItem('DHX_CONNECTS', String(remaining));
        } catch (storageError) {
          console.error(
            'Failed to update connects in localStorage:',
            storageError,
          );
        }
        // Trigger a global event so header wallet rerenders
        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('connectsUpdated'));
          }
        } catch (eventError) {
          console.error(
            'Failed to dispatch connectsUpdated event:',
            eventError,
          );
        }
      }
      notifySuccess(
        `Deducted ${requiredConnects} connects.${
          typeof remaining === 'number' ? ` Remaining: ${remaining}` : ''
        }`,
        'Hire Now successful',
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        (error?.response?.status === 400
          ? 'Insufficient connects to proceed.'
          : 'Failed to complete Hire Now. Please try again.');
      notifyError(message, 'Hire Now failed');
      throw error; // keep ConnectsDialog loading UX consistent
    }
  };

  const noopValidate = async () => true;

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

        <div className="flex p-3 md:px-14 relative flex-col sm:gap-8 sm:py-4">
          <main className="mt-8 max-w-4xl mx-auto">
            {/* Profile Info */}
            <Card className="mb-8 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-6">
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
                  <div>
                    <ConnectsDialog
                      loading={hireLoading}
                      setLoading={setHireLoading}
                      onSubmit={handleHireNow}
                      isValidCheck={noopValidate}
                      userId={user?.uid}
                      buttonText="Hire Now"
                      userType="BUSINESS"
                      requiredConnects={parseInt(
                        process.env.NEXT_PUBLIC__APP_HIRE_TALENT_COST || '0',
                        10,
                      )}
                      skipRedirect
                    />
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
                <div className="space-y-4">
                  {profileData &&
                  profileData.projects &&
                  profileData.projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profileData.projects.slice(0, 4).map((project) => (
                        <ProjectCard
                          key={project._id}
                          _id={project._id}
                          projectName={project.projectName}
                          verificationStatus={
                            project.verified ? 'verified' : 'pending'
                          }
                          githubLink={project.githubLink || ''}
                          liveDemoLink={project.liveDemoLink || ''}
                          thumbnail={project.thumbnail || ''}
                          start={project.start || ''}
                          end={project.end || ''}
                          refer={project.refer || ''}
                          techUsed={project.techUsed || []}
                          role={project.role || ''}
                          projectType={project.projectType || ''}
                          oracleAssigned={project.oracleAssigned || null}
                          verificationUpdateTime={
                            project.verificationUpdateTime || ''
                          }
                          isViewOnly={true}
                          onClick={() => setSelectedProject(project)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No projects added
                    </p>
                  )}
                  {profileData?.projects && profileData.projects.length > 4 && (
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      And {profileData.projects.length - 4} more projects...
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

            {/* Contact Information */}
            <Card className="mb-6 overflow-hidden border border-border shadow-md">
              <CardHeader className="bg-blue-500/5 dark:bg-blue-500/10 border-b border-border py-4">
                <CardTitle className="text-md font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Email:
                    </span>
                    <p className="mt-1">
                      {profileData?.email || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Links:
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profileData?.githubLink && (
                        <a
                          href={profileData.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          GitHub ↗
                        </a>
                      )}
                      {profileData?.linkedin && (
                        <a
                          href={profileData.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          LinkedIn ↗
                        </a>
                      )}
                      {profileData?.personalWebsite && (
                        <a
                          href={profileData.personalWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Portfolio ↗
                        </a>
                      )}
                      {!profileData?.githubLink &&
                        !profileData?.linkedin &&
                        !profileData?.personalWebsite && (
                          <p className="text-muted-foreground italic">
                            No links provided
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
