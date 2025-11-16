'use client';

import {
  PackageOpen,
  FolderDot,
  Pointer,
  FileCheck,
  CircleX,
  Inbox,
  Search,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { Skeleton } from '@/components/ui/skeleton';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import { ProjectCard } from '@/components/cards/projectCard';
import { StatusEnum } from '@/utils/freelancer/enum';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import {
  menuItemsBottom as freelancerMenuItemsBottom,
  menuItemsTop as freelancerMenuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import FreelancerInvitationCard from '@/components/freelancer/invitations/FreelancerInvitationCard';
import EmptyState from '@/components/shared/EmptyState';
import {
  FreelancerInvitation,
  FreelancerInvitationsResponse,
} from '@/types/freelancerInvitation';

// Section header component
function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-4 sm:px-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
        <p className="text-gray-400 mt-2 text-sm sm:text-base">{subtitle}</p>
      </div>
      {right}
    </div>
  );
}

// Toggle between FREELANCER and CONSULTANT
function FilterToggle({
  projectType,
  onChange,
  id,
}: {
  projectType: string;
  onChange: (value: string) => void;
  id?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Badge className="font-medium">FREELANCER</Badge>
      <Switch
        id={id}
        checked={projectType === 'FREELANCER'}
        onCheckedChange={(checked) =>
          onChange(checked ? 'FREELANCER' : 'CONSULTANT')
        }
      />
      <Badge className="font-medium">CONSULTANT</Badge>
    </div>
  );
}

interface Project {
  _id: string;
  projectName: string;
  description: string;
  email: string;
  verified?: any;
  isVerified?: string;
  companyName: string;
  start?: Date;
  end?: Date;
  skillsRequired: string[];
  experience?: string;
  role: string;
  projectType: string;
  totalNeedOfFreelancer?: {
    category?: string;
    needOfFreelancer?: number;
    appliedCandidates?: string[];
    rejected?: string[];
    accepted?: string[];
    status?: string;
  }[];
  status?: StatusEnum;
  team?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Project list component
const ProjectList = ({
  status,
  projectType,
  refreshTrigger,
}: {
  status: string;
  projectType?: string;
  refreshTrigger?: number;
}) => {
  const user = useSelector((state: RootState) => state.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let url = `/freelancer/project?status=${status}`;
        if (projectType) {
          url += `&project_type=${projectType}`;
        }
        const response = await axiosInstance.get(url);
        const projectsData = response.data.data;
        if (status === 'ACTIVE') {
          const filteredProjects = projectsData.filter(
            (project: Project) => project.status === 'ACTIVE',
          );
          setProjects(filteredProjects);
        } else {
          setProjects(projectsData);
        }
      } catch (error) {
        notifyError('Something went wrong. Please try again.', 'Error');
        console.error('API Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user.uid, status, projectType, refreshTrigger]);

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-col sm:gap-8 sm:py-0 mb-8">
        {isLoading ? (
          <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-6 w-20 rounded-full" />
                  ))}
                </div>
                <div className="pt-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex justify-between items-center pt-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <main className="grid grid-cols-1 flex-1 items-start gap-4 px-4 sm:px-6 sm:py-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
            {projects.length === 0 ? (
              <div className="col-span-full w-full">
                <EmptyState
                  icon={
                    <PackageOpen
                      className="mx-auto text-muted-foreground"
                      size={100}
                    />
                  }
                  title="No projects available"
                  description="Once you have projects in this status, they will appear here."
                  className="border-0 bg-transparent py-6"
                />
              </div>
            ) : (
              projects.map((project, index: number) => (
                <ProjectCard key={index} project={project} type={user.type} />
              ))
            )}
          </main>
        )}
      </div>
    </div>
  );
};

// Main page component
export default function ProjectPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [projectType, setProjectType] = useState('FREELANCER');
  const [activeTab, setActiveTab] = useState('current');

  // Invitation state
  const [invitations, setInvitations] = useState<FreelancerInvitationsResponse>(
    {
      pending: [],
      accepted: [],
      rejected: [],
    },
  );
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingInvitation, setProcessingInvitation] = useState<
    string | null
  >(null);
  const [projectsRefreshTrigger, setProjectsRefreshTrigger] = useState(0);

  // Fetch invitations
  const fetchInvitations = async () => {
    setInvitationsLoading(true);
    try {
      const response = await axiosInstance.get('/freelancer/invitations');
      const data = response?.data?.data;

      setInvitations({
        pending: data?.pending || [],
        accepted: data?.accepted || [],
        rejected: data?.rejected || [],
      });
    } catch (error: any) {
      console.error('Failed to fetch invitations:', error);
      notifyError('Failed to load invitations', 'Error');
      setInvitations({
        pending: [],
        accepted: [],
        rejected: [],
      });
    } finally {
      setInvitationsLoading(false);
    }
  };

  // Handle accept invitation
  const handleAcceptInvitation = async (invitation: FreelancerInvitation) => {
    setProcessingInvitation(invitation.hireId);
    try {
      await axiosInstance.post('/freelancer/respond-invite', {
        hireId: invitation.hireId,
        freelancer_professional_profile_id: invitation.freelancerEntryId,
        projectId: invitation.projectId,
        profileId: invitation.profileId,
        action: 'ACCEPT',
      });
      notifySuccess('Invitation accepted successfully', 'Success');
      await fetchInvitations();
      setProjectsRefreshTrigger((prev) => prev + 1);
    } catch (error: any) {
      console.error('Failed to accept invitation:', error);
      notifyError(
        error?.response?.data?.message || 'Failed to accept invitation',
        'Error',
      );
    } finally {
      setProcessingInvitation(null);
    }
  };

  // Handle reject invitation
  const handleRejectInvitation = async (invitation: FreelancerInvitation) => {
    setProcessingInvitation(invitation.hireId);
    try {
      await axiosInstance.post('/freelancer/respond-invite', {
        hireId: invitation.hireId,
        freelancer_professional_profile_id: invitation.freelancerEntryId,
        projectId: invitation.projectId,
        profileId: invitation.profileId,
        action: 'REJECT',
      });
      notifySuccess('Invitation rejected successfully', 'Success');
      await fetchInvitations();
      setProjectsRefreshTrigger((prev) => prev + 1);
    } catch (error: any) {
      console.error('Failed to reject invitation:', error);
      notifyError(
        error?.response?.data?.message || 'Failed to reject invitation',
        'Error',
      );
    } finally {
      setProcessingInvitation(null);
    }
  };

  // Handle view invitation details
  const handleViewInvitationDetails = (projectId: string) => {
    router.push(`/freelancer/project/${projectId}`);
  };

  // Filter pending invitations based on search
  const filteredInvitations = useMemo(() => {
    const pendingInvitations = invitations.pending;

    if (!searchQuery) return pendingInvitations;

    const query = searchQuery.toLowerCase();
    return pendingInvitations.filter(
      (inv) =>
        inv.projectName.toLowerCase().includes(query) ||
        inv.companyName.toLowerCase().includes(query) ||
        inv.profileDomain.toLowerCase().includes(query),
    );
  }, [invitations.pending, searchQuery]);

  // Sync tab with URL
  useEffect(() => {
    const parts = pathname.split('/');
    const tabFromUrl = parts[parts.length - 1];
    if (
      ['current', 'applied', 'invitations', 'completed', 'rejected'].includes(
        tabFromUrl,
      )
    ) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab('current');
      router.replace('/freelancer/project/current'); // default
    }
  }, [pathname, router]);

  // Fetch invitations when invitations tab is active
  useEffect(() => {
    if (activeTab === 'invitations') {
      fetchInvitations();
    }
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/freelancer/project/${tab}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col pb-10">
      <SidebarMenu
        menuItemsTop={freelancerMenuItemsTop}
        menuItemsBottom={freelancerMenuItemsBottom}
        active="Projects"
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Dashboard"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Projects', link: '/freelancer/project' },
          ]}
        />

        <div className="flex-1">
          <div className="w-full px-4 sm:px-6 py-2">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full flex flex-col gap-4"
            >
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-2 overflow-x-auto no-scrollbar">
                <TabsTrigger
                  value="current"
                  className="flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                >
                  <FolderDot className="h-4 w-4" /> Current
                </TabsTrigger>
                <TabsTrigger
                  value="applied"
                  className="flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                >
                  <Pointer className="h-4 w-4" /> Applied
                </TabsTrigger>
                <TabsTrigger
                  value="invitations"
                  className="flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                >
                  <Inbox className="h-4 w-4" /> Invitations
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                >
                  <FileCheck className="h-4 w-4" /> Completed
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                >
                  <CircleX className="h-4 w-4" /> Rejected
                </TabsTrigger>
              </TabsList>

              <TabsContent value="current">
                <SectionHeader
                  title="Current Projects"
                  subtitle="Browse and manage your active freelance projects"
                  right={
                    <FilterToggle
                      id="project-type"
                      projectType={projectType}
                      onChange={setProjectType}
                    />
                  }
                />
                <ProjectList
                  status="ACTIVE"
                  projectType={projectType}
                  refreshTrigger={projectsRefreshTrigger}
                />
              </TabsContent>

              <TabsContent value="applied">
                <SectionHeader
                  title="Projects Under Verification"
                  subtitle="Track the status of your projects currently undergoing verification before final approval."
                  right={
                    <FilterToggle
                      id="project-type-applied"
                      projectType={projectType}
                      onChange={setProjectType}
                    />
                  }
                />
                <ProjectList status="PENDING" projectType={projectType} />
              </TabsContent>

              <TabsContent value="invitations">
                <SectionHeader
                  title="Project Invitations"
                  subtitle="Review and respond to pending project invitations. Accepted invitations appear in Current tab, rejected ones in Rejected tab."
                />

                {/* Search bar */}
                <div className="px-4 sm:px-6 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by project, company, or profile..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Pending invitations list */}
                <div className="px-4 sm:px-6">
                  {invitationsLoading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-48" />
                      ))}
                    </div>
                  ) : filteredInvitations.length === 0 ? (
                    <EmptyState
                      icon={
                        <Inbox className="h-12 w-12 text-muted-foreground" />
                      }
                      title="No pending invitations"
                      description="New invitations will appear here. Accepted invitations move to Current tab, rejected ones to Rejected tab."
                      className="py-12"
                    />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredInvitations.map((invitation) => (
                        <FreelancerInvitationCard
                          key={invitation.hireId}
                          invitation={invitation}
                          onAccept={handleAcceptInvitation}
                          onReject={handleRejectInvitation}
                          onViewDetails={handleViewInvitationDetails}
                          isProcessing={
                            processingInvitation === invitation.hireId
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="completed">
                <SectionHeader
                  title="Completed Projects"
                  subtitle="Explore and manage your successfully completed freelance projects."
                  right={
                    <FilterToggle
                      id="project-type-completed"
                      projectType={projectType}
                      onChange={setProjectType}
                    />
                  }
                />
                <ProjectList status="COMPLETED" projectType={projectType} />
              </TabsContent>

              <TabsContent value="rejected">
                <SectionHeader
                  title="Rejected Projects"
                  subtitle="Explore and Review projects that were not selected and gain insights for future submissions."
                  right={
                    <FilterToggle
                      id="project-type-rejected"
                      projectType={projectType}
                      onChange={setProjectType}
                    />
                  }
                />
                <ProjectList
                  status="REJECTED"
                  projectType={projectType}
                  refreshTrigger={projectsRefreshTrigger}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
