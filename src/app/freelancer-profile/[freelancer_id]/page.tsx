'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  X,
  Briefcase,
  GraduationCap,
  Code,
  UserCircle,
  Award,
} from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import Cookies from 'js-cookie';

import ProjectCard from '@/components/cards/freelancerProjectCard';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';
import {
  menuItemsTop,
  menuItemsBottom,
} from '@/config/menuItems/business/dashboardMenuItems';
import {
  menuItemsTop as freelancerMenuItemsTop,
  menuItemsBottom as freelancerMenuItemsBottom,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ConnectsDialog from '@/components/shared/ConnectsDialog';
import EmptyState from '@/components/shared/EmptyState';
import { RootState, useAppSelector } from '@/lib/store';

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
  attributes?: any[];
  skills: Skill[];
  domain: Domain[];
  projectDomain: Domain[];
  projects: Project[];
  professionalInfo: ProfessionalExperience[];
  education: Education[];
}

const FreelancerProfile = () => {
  const userTypeFromStore = useAppSelector((s) => s.user.type);
  const userType = userTypeFromStore || (Cookies.get('userType') as any);
  const isFreelancer = userType === 'freelancer';

  const sidebarMenuItemsTop = isFreelancer
    ? freelancerMenuItemsTop
    : menuItemsTop;
  const sidebarMenuItemsBottom = isFreelancer
    ? freelancerMenuItemsBottom
    : menuItemsBottom;
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

            const attrs = Array.isArray(freelancerData.attributes)
              ? freelancerData.attributes
              : [];

            const skillsFromAttributes: Skill[] = attrs
              .filter((attr: any) => attr?.type === 'SKILL')
              .map((attr: any) => ({
                _id: attr._id,
                name: attr.name,
              }));

            const domainsFromAttributes: Domain[] = attrs
              .filter((attr: any) => attr?.type === 'DOMAIN')
              .map((attr: any) => ({
                _id: attr._id,
                name: attr.name,
              }));

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
              attributes: attrs,
              skills:
                skillsFromAttributes.length > 0
                  ? skillsFromAttributes
                  : freelancerData.skills || [],
              domain:
                domainsFromAttributes.length > 0
                  ? domainsFromAttributes
                  : freelancerData.domain || [],
              projectDomain: freelancerData.projectDomain || [],
              projects: freelancerData.projects || [],
              professionalInfo: freelancerData.professionalInfo || [],
              education: freelancerData.education || [],
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
        freelancerId: freelancer_id,
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
        <SidebarMenu
          menuItemsTop={sidebarMenuItemsTop}
          menuItemsBottom={sidebarMenuItemsBottom}
          active=""
        />
        <div className="flex flex-col sm:gap-4 mb-8 sm:pl-14">
          <Header
            menuItemsTop={sidebarMenuItemsTop}
            menuItemsBottom={sidebarMenuItemsBottom}
            activeMenu="Projects"
            breadcrumbItems={[{ label: 'Freelancer', link: '#' }]}
          />

          <div className="flex p-3 md:px-14 relative flex-col sm:gap-8 sm:py-4 max-w-full overflow-x-hidden">
            <main className="w-full max-w-4xl mx-auto space-y-6">
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 min-w-0">
                      <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full" />
                      <div className="space-y-3 min-w-0 w-full">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-7 w-44" />
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full max-w-xl" />
                          <Skeleton className="h-4 w-4/5 max-w-lg" />
                        </div>
                      </div>
                    </div>
                    <Skeleton className="h-10 w-full sm:w-32" />
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border border-border shadow-md">
                <CardHeader className="py-4">
                  <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <div className="flex flex-wrap gap-2">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-6 w-20 rounded-full" />
                      ))}
                    </div>
                  </div>
                  <Separator className="h-px bg-border" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <div className="flex flex-wrap gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-6 w-24 rounded-full" />
                      ))}
                    </div>
                  </div>
                  <Separator className="h-px bg-border" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-32" />
                    <div className="flex flex-wrap gap-2">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-6 w-28 rounded-full" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border border-border shadow-md">
                <CardHeader className="py-4">
                  <Skeleton className="h-5 w-28" />
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-40 w-full rounded-xl" />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border border-border shadow-md">
                <CardHeader className="py-4">
                  <Skeleton className="h-5 w-52" />
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex gap-4 p-3 bg-muted/50 border border-border rounded-md"
                    >
                      <Skeleton className="h-12 w-12 rounded-md flex-shrink-0" />
                      <div className="space-y-2 w-full">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-56" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="overflow-hidden border border-border shadow-md">
                <CardHeader className="py-4">
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-3 bg-muted/50 border border-border rounded-md"
                    >
                      <div className="space-y-2 w-full">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-56" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-7 w-32 rounded-md" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </main>
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
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-3">
        <div className="bg-card text-card-foreground p-4 sm:p-6 rounded-lg max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto shadow-lg border">
          <div className="flex justify-between items-center gap-3 mb-4">
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
                  className="text-primary hover:underline break-all"
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
        menuItemsTop={sidebarMenuItemsTop}
        menuItemsBottom={sidebarMenuItemsBottom}
        active=""
      />
      <div className="flex flex-col sm:gap-4 mb-8 sm:pl-14">
        <Header
          menuItemsTop={sidebarMenuItemsTop}
          menuItemsBottom={sidebarMenuItemsBottom}
          activeMenu="Projects"
          breadcrumbItems={[
            { label: 'Freelancer', link: '#' },
            {
              label: `${profileData?.firstName || ''} ${profileData?.lastName || ''}`,
              link: '#',
            },
          ]}
        />

        <div className="flex p-3 md:px-14 relative flex-col sm:gap-8 sm:py-4 max-w-full overflow-x-hidden">
          <main className="m:mt-8 w-full max-w-4xl mx-auto">
            {/* Profile Info */}
            <Card className="mb-8 shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 min-w-0">
                    <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden bg-muted border-2 border-border shadow-md flex-shrink-0">
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
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold text-foreground">
                          {profileData?.firstName} {profileData?.lastName}
                        </h1>
                        <Badge
                          variant="outline"
                          className="text-xs font-medium border-primary/30 text-primary bg-primary/5"
                        >
                          Freelancer
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground max-w-xl">
                        {profileData?.description ||
                          'This freelancer has not added a description yet.'}
                      </p>
                    </div>
                  </div>
                  {!isFreelancer && (
                    <div className="w-full sm:w-auto">
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
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Skills & Domains */}
            <Card className="mb-6 overflow-hidden border border-border shadow-md">
              <CardHeader className="bg-primary/5 border-b border-border py-4">
                <CardTitle className="text-md font-semibold text-primary flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Skills & Domains
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profileData?.skills?.map((skill) => (
                      <Badge
                        key={skill._id}
                        variant="outline"
                        className="text-xs px-3 py-1 rounded-full border-primary/20 bg-primary/5"
                      >
                        {skill.name}
                      </Badge>
                    ))}
                    {!profileData?.skills?.length && (
                      <p className="text-muted-foreground italic text-sm">
                        No skills added
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="h-px bg-border" />

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Domains
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profileData?.domain?.map((domain) => (
                      <Badge
                        key={domain._id}
                        variant="outline"
                        className="text-xs px-3 py-1 rounded-full border-indigo-500/30 bg-indigo-500/5 text-indigo-700 dark:text-indigo-300"
                      >
                        {domain.name}
                      </Badge>
                    ))}
                    {!profileData?.domain?.length && (
                      <p className="text-muted-foreground italic text-sm">
                        No domains added
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="h-px bg-border" />

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Project Domains
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profileData?.projectDomain?.map((domain) => (
                      <Badge
                        key={domain._id}
                        variant="outline"
                        className="text-xs px-3 py-1 rounded-full border-purple-500/30 bg-purple-500/5 text-purple-700 dark:text-purple-300"
                      >
                        {domain.name}
                      </Badge>
                    ))}
                    {!profileData?.projectDomain?.length && (
                      <p className="text-muted-foreground italic text-sm">
                        No project domains added
                      </p>
                    )}
                  </div>
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
                {profileData &&
                profileData.projects &&
                profileData.projects.length > 0 ? (
                  <div className="space-y-4">
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
                    {profileData.projects.length > 4 && (
                      <p className="text-sm text-muted-foreground text-center mt-4">
                        And {profileData.projects.length - 4} more projects...
                      </p>
                    )}
                  </div>
                ) : (
                  <EmptyState
                    title="No projects added yet"
                    description="Once this freelancer adds projects to their profile, you'll see them listed here."
                    icon={<Code className="h-16 w-16 text-green-500" />}
                    className="py-10 border-border/60 bg-background"
                  />
                )}
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
                {profileData &&
                profileData.professionalInfo &&
                profileData.professionalInfo.length > 0 ? (
                  <div className="space-y-4">
                    {profileData.professionalInfo
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
                      ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No professional experience added"
                    description="Work experience added by the freelancer will appear here."
                    icon={<Briefcase className="h-16 w-16 text-amber-500" />}
                    className="py-10 border-border/60 bg-background"
                  />
                )}
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
                {profileData?.education?.length ? (
                  <div className="space-y-4">
                    {profileData.education.slice(0, 3).map((edu) => (
                      <div
                        key={edu._id}
                        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-3 bg-muted/50 border border-border rounded-md shadow-sm"
                      >
                        <div className="min-w-0">
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
                        <div className="text-sm text-muted-foreground bg-cyan-500/5 dark:bg-cyan-500/10 px-3 py-1 rounded-md h-fit w-fit">
                          {formatDate(edu.startDate)} -{' '}
                          {formatDate(edu.endDate)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No education details added"
                    description="Education details added by the freelancer will appear here."
                    icon={<GraduationCap className="h-16 w-16 text-cyan-500" />}
                    className="py-10 border-border/60 bg-background"
                  />
                )}
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
