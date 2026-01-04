'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  BarChart3,
  Sparkles,
  Award,
  Layers,
  Github,
  Linkedin,
  Globe,
  DollarSign,
  UserCog,
  Briefcase,
  User,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  BarChart as ReBarChart,
  Bar as ReBar,
  XAxis as ReXAxis,
  YAxis as ReYAxis,
  CartesianGrid as ReCartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer as ReResponsiveContainer,
} from 'recharts';

import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';
import Header from '@/components/header/header';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DeleteConfirmationDialog from '@/components/shared/DeleteConfirmationDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import ProfileSummaryCard from '@/components/cards/ProfileSummaryCard';
import { FreelancerProfile } from '@/types/freelancer';
import StatItem from '@/components/shared/StatItem';
import SelectTagPicker from '@/components/shared/SelectTagPicker';
import EmptyState from '@/components/shared/EmptyState';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectSelectionDialog from '@/components/dialogs/ProjectSelectionDialog';
import ExperienceSelectionDialog from '@/components/dialogs/ExperienceSelectionDialog';

// URL validation functions
const isValidLinkedInUrl = (url: string) => {
  const linkedInRegex =
    /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
  return linkedInRegex.test(url.trim());
};

const isValidWebsiteUrl = (url: string) => {
  const websiteRegex =
    /^https?:\/\/(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?(\/.*)?$/;
  return websiteRegex.test(url.trim());
};

export default function ProfilesPage() {
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const [profiles, setProfiles] = useState<FreelancerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDescription, setNewProfileDescription] = useState('');
  const [newProfileHourlyRate, setNewProfileHourlyRate] = useState<number>(0);
  const [newProfileGithubLink, setNewProfileGithubLink] = useState('');
  const [newProfileLinkedinLink, setNewProfileLinkedinLink] = useState('');
  const [newProfilePersonalWebsite, setNewProfilePersonalWebsite] =
    useState('');
  const [newProfileAvailability, setNewProfileAvailability] =
    useState('FREELANCE');
  // Store full selected option objects for skills/domains
  const [newProfileSkills, setNewProfileSkills] = useState<any[]>([]);
  const [newProfileDomains, setNewProfileDomains] = useState<any[]>([]);
  const [newProfileProjects, setNewProfileProjects] = useState<any[]>([]);
  const [newProfileExperiences, setNewProfileExperiences] = useState<any[]>([]);
  const [skillsOptions, setSkillsOptions] = useState<any[]>([]);
  const [domainsOptions, setDomainsOptions] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showExperienceDialog, setShowExperienceDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'freelancer' | 'consultant'
  >('overview');
  const [newProfileType, setNewProfileType] = useState<
    'Freelancer' | 'Consultant'
  >('Freelancer');

  const fetchProfiles = useCallback(async () => {
    if (!user.uid) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/freelancer/profiles`);
      const profilesData = response.data.data || [];

      // Sort profiles by creation date (newest first)
      const sortedProfiles = profilesData.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Descending order (newest first)
      });

      setProfiles(sortedProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      notifyError('Failed to load profiles');
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [user.uid]);

  const fetchSkillsAndDomains = useCallback(async () => {
    if (!user.uid) return;

    try {
      const freelancerResponse = await axiosInstance.get(
        `/freelancer/${user.uid}`,
      );

      const freelancerData = freelancerResponse.data.data || {};

      const attributes: any[] = Array.isArray(freelancerData.attributes)
        ? freelancerData.attributes
        : [];

      const skillsForOptions = attributes
        .filter((item: any) => item?.type === 'SKILL')
        .map((item: any) => ({
          ...item,
          label: item.label || item.name || '',
        }));

      const domainsForOptions = attributes
        .filter((item: any) => item?.type === 'DOMAIN')
        .map((item: any) => ({
          ...item,
          label: item.label || item.name || '',
        }));

      setSkillsOptions(skillsForOptions);
      setDomainsOptions(domainsForOptions);
    } catch (error) {
      console.error('Error fetching skills and domains:', error);
    }
  }, [user.uid]);

  useEffect(() => {
    fetchProfiles();
    fetchSkillsAndDomains();
  }, [fetchProfiles, fetchSkillsAndDomains]);

  const resetForm = () => {
    setNewProfileName('');
    setNewProfileDescription('');
    setNewProfileHourlyRate(0);
    setNewProfileGithubLink('');
    setNewProfileLinkedinLink('');
    setNewProfilePersonalWebsite('');
    setNewProfileAvailability('FREELANCE');
    setNewProfileSkills([]);
    setNewProfileDomains([]);
    setNewProfileProjects([]);
    setNewProfileExperiences([]);
    setIsCreateDialogOpen(false);
  };

  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) {
      notifyError('Profile name is required');
      return;
    }

    if (
      !newProfileDescription.trim() ||
      newProfileDescription.trim().length < 10
    ) {
      notifyError('Description must be at least 10 characters long');
      return;
    }

    // URL validation
    if (!newProfileLinkedinLink.trim()) {
      notifyError('LinkedIn profile URL is required');
      return;
    }

    if (!isValidLinkedInUrl(newProfileLinkedinLink)) {
      notifyError(
        'Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)',
      );
      return;
    }

    if (!newProfilePersonalWebsite.trim()) {
      notifyError('Personal website URL is required');
      return;
    }

    if (!isValidWebsiteUrl(newProfilePersonalWebsite)) {
      notifyError(
        'Please enter a valid website URL (e.g., https://example.com)',
      );
      return;
    }

    try {
      // Map selected skill/domain option objects to {_id, label} for the API payload
      const skillsPayload = newProfileSkills.map((skill: any) => ({
        _id: skill?.type_id || '',
        label: skill?.name || skill?.label || '',
      }));

      const domainsPayload = newProfileDomains.map((domain: any) => ({
        _id: domain?.type_id || '',
        label: domain?.name || domain?.label || '',
      }));

      const profilePayload = {
        profileName: newProfileName.trim(),
        description: newProfileDescription.trim(),
        profileType: newProfileType,
        hourlyRate: newProfileHourlyRate || 0,
        skills: skillsPayload,
        domains: domainsPayload,
        projects: newProfileProjects,
        experiences: newProfileExperiences,
        portfolioLinks: [],
        githubLink: newProfileGithubLink.trim(),
        linkedinLink: newProfileLinkedinLink.trim(),
        personalWebsite: newProfilePersonalWebsite.trim(),
        availability: newProfileAvailability,
      };

      const response = await axiosInstance.post(
        `/freelancer/profile`,
        profilePayload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data && response.data.success) {
        const newProfile = response.data.data;

        // Use our selected objects directly for immediate display
        const localProfile = {
          ...newProfile,
          profileType: newProfileType,
          skills: newProfileSkills,
          domains: newProfileDomains,
          projects: newProfileProjects,
          experiences: newProfileExperiences,
        } as FreelancerProfile;

        // Add new profile at the beginning (newest first)
        setProfiles((prev) => [localProfile, ...prev]);

        // Reset form
        resetForm();

        // Switch to the relevant tab so the newly created profile is visible immediately
        setActiveTab(
          newProfileType === 'Consultant' ? 'consultant' : 'freelancer',
        );

        notifySuccess('Profile created successfully', 'Success');
      } else {
        throw new Error(response.data?.message || 'Failed to create profile');
      }
    } catch (error: any) {
      console.error('Error creating profile:', error);

      let errorMessage = 'Failed to create profile';
      if (error.response) {
        // Server responded with error status
        errorMessage =
          error.response.data?.message ||
          error.response.statusText ||
          errorMessage;
        console.error('Error details:', error.response.data);
      } else if (error.request) {
        // Request was made but no response
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Other errors
        errorMessage = error.message || errorMessage;
      }

      notifyError(errorMessage);
    }
  };

  const handleDeleteProfile = (profileId: string) => {
    setProfileToDelete(profileId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProfile = async () => {
    if (!profileToDelete) return;

    try {
      await axiosInstance.delete(`/freelancer/profile/${profileToDelete}`);
      notifySuccess(
        'Profile has been successfully deleted.',
        'Profile Deleted',
      );
      fetchProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      notifyError('Failed to delete profile');
    } finally {
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
    }
  };
  const freelancerProfiles = profiles.filter(
    (p) => p.profileType === 'Freelancer' || !p.profileType, // Handles old profiles
  );
  const consultantProfiles = profiles.filter(
    (p) => p.profileType === 'Consultant',
  );

  // --- Derived stats for Overview ---
  const totalProfiles = profiles.length;
  const totalFreelancer = freelancerProfiles.length;
  const totalConsultant = consultantProfiles.length;
  const avgProjects =
    totalProfiles === 0
      ? 0
      : Math.round(
          (profiles.reduce((acc, p) => acc + (p.projects?.length || 0), 0) /
            totalProfiles) *
            10,
        ) / 10;
  const topProjectProfiles = [...profiles]
    .sort((a, b) => (b.projects?.length || 0) - (a.projects?.length || 0))
    .slice(0, 5);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Profiles"
        isKycCheck={true}
      />
      <div className="flex flex-col sm:gap-6 sm:py-0 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Profiles"
          breadcrumbItems={[
            { label: 'Settings', link: '#' },
            { label: 'Profiles', link: '#' },
          ]}
        />
        <main className="grid flex-1 items-start p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="w-full mx-auto max-w-[92vw]">
            <div className="flex flex-col gap-2 mb-6">
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Profiles Center
              </h1>
              <p className="text-muted-foreground">
                Create and manage profiles to showcase your expertise.
              </p>
            </div>

            <div className="bg-muted/20 rounded-xl border shadow-sm overflow-hidden mb-6">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
                className="w-full"
              >
                <div className="border-b px-6">
                  <div className="max-w-full overflow-x-auto no-scrollbar">
                    <TabsList className="bg-transparent h-12 w-max min-w-max md:w-auto p-0 whitespace-nowrap">
                      <TabsTrigger
                        value="overview"
                        className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        <BarChart3 className="mr-2 h-4 w-4" /> Overview
                      </TabsTrigger>
                      <TabsTrigger
                        value="freelancer"
                        className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        <span className="flex items-center gap-2">
                          Freelancer
                          <Badge variant="secondary" className="h-5 px-2">
                            {freelancerProfiles.length}
                          </Badge>
                        </span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="consultant"
                        className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        <span className="flex items-center gap-2">
                          Consultant
                          <Badge variant="secondary" className="h-5 px-2">
                            {consultantProfiles.length}
                          </Badge>
                        </span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                <div className="p-6">
                  {/* Overview */}
                  <TabsContent value="overview" className="m-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <StatItem
                        variant="card"
                        color="blue"
                        label="Total Profiles"
                        value={totalProfiles}
                      />
                      <StatItem
                        variant="card"
                        color="green"
                        label="Freelancer"
                        value={totalFreelancer}
                      />
                      <StatItem
                        variant="card"
                        color="amber"
                        label="Consultant"
                        value={totalConsultant}
                      />
                      <StatItem
                        variant="card"
                        label="Avg Projects / Profile"
                        value={avgProjects}
                      />
                    </div>

                    <Card className="bg-gradient-to-br from-background/70 to-muted/40 border border-border/60">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" /> Top Profiles by
                          Projects
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Profiles ranked by number of projects. Higher bars
                          indicate more projects.
                        </p>
                      </CardHeader>
                      <CardContent>
                        {topProjectProfiles.length === 0 ? (
                          <div className="flex items-center justify-center p-8">
                            <div className="flex items-center gap-6">
                              <svg
                                width="120"
                                height="80"
                                viewBox="0 0 120 80"
                                xmlns="http://www.w3.org/2000/svg"
                                className="opacity-80"
                              >
                                <defs>
                                  <linearGradient
                                    id="emptyGrad"
                                    x1="0"
                                    x2="1"
                                    y1="0"
                                    y2="1"
                                  >
                                    <stop
                                      offset="0%"
                                      stopColor="#cbd5e1"
                                      stopOpacity="0.6"
                                    />
                                    <stop
                                      offset="100%"
                                      stopColor="#a3a3a3"
                                      stopOpacity="0.3"
                                    />
                                  </linearGradient>
                                </defs>
                                <rect
                                  x="8"
                                  y="20"
                                  width="18"
                                  height="40"
                                  rx="3"
                                  fill="url(#emptyGrad)"
                                />
                                <rect
                                  x="36"
                                  y="12"
                                  width="18"
                                  height="48"
                                  rx="3"
                                  fill="url(#emptyGrad)"
                                />
                                <rect
                                  x="64"
                                  y="28"
                                  width="18"
                                  height="32"
                                  rx="3"
                                  fill="url(#emptyGrad)"
                                />
                                <rect
                                  x="92"
                                  y="24"
                                  width="18"
                                  height="36"
                                  rx="3"
                                  fill="url(#emptyGrad)"
                                />
                              </svg>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  No data available yet. Create your first
                                  profile to see analytics.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full">
                            <ReResponsiveContainer width="100%" height={240}>
                              <ReBarChart
                                data={topProjectProfiles.map((p: any) => ({
                                  name: String(
                                    p.profileName || 'Profile',
                                  ).slice(0, 18),
                                  projects: (p.projects || []).length,
                                }))}
                              >
                                <ReCartesianGrid
                                  vertical={false}
                                  stroke="#f0f0f0"
                                />
                                <ReXAxis
                                  dataKey="name"
                                  tickLine={false}
                                  axisLine={false}
                                  tickMargin={10}
                                />
                                <ReYAxis axisLine={false} tickLine={false} />
                                <ReTooltip
                                  wrapperStyle={{ outline: 'none' }}
                                  contentStyle={{
                                    background: 'hsl(var(--popover))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: 6,
                                    color: 'hsl(var(--popover-foreground))',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                  }}
                                  labelStyle={{
                                    color: 'hsl(var(--popover-foreground))',
                                    fontWeight: 600,
                                  }}
                                  cursor={{
                                    fill: 'hsl(var(--muted))',
                                    fillOpacity: 0.2,
                                  }}
                                />
                                <ReBar
                                  dataKey="projects"
                                  barSize={12}
                                  fill="hsl(var(--primary))"
                                  radius={[4, 4, 0, 0]}
                                />
                              </ReBarChart>
                            </ReResponsiveContainer>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Separator className="my-6" />
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => {
                          setNewProfileType('Freelancer');
                          setIsCreateDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Create Freelancer
                        Profile
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setNewProfileType('Consultant');
                          setIsCreateDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Create Consultant
                        Profile
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Freelancer */}
                  <TabsContent value="freelancer" className="m-0">
                    {isLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-50">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="rounded-xl border bg-card p-4 space-y-3"
                          >
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <div className="flex gap-2 pt-2">
                              <Skeleton className="h-6 w-16 rounded-full" />
                              <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                            <div className="pt-2">
                              <Skeleton className="h-9 w-28" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : freelancerProfiles.length === 0 ? (
                      <EmptyState
                        className="py-12 bg-transparent border-0"
                        title="No Freelancer profiles found"
                        description="Create your first Freelancer profile to start applying faster with a ready-to-use summary."
                        Icon={User}
                        actions={
                          <Button
                            onClick={() => {
                              setNewProfileType('Freelancer');
                              setIsCreateDialogOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" /> Create Freelancer
                            Profile
                          </Button>
                        }
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {freelancerProfiles.map((profile) => (
                          <ProfileSummaryCard
                            key={profile._id}
                            profile={profile}
                            onView={() =>
                              router.push(
                                `/freelancer/settings/profiles/${profile._id!}`,
                              )
                            }
                            onDelete={() => handleDeleteProfile(profile._id!)}
                          />
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setNewProfileType('Freelancer');
                            setIsCreateDialogOpen(true);
                          }}
                          className="flex items-center justify-center h-full min-h-[200px] bg-muted-foreground/20 dark:bg-black/20 border-gray-200 dark:border-gray-800 rounded-xl"
                        >
                          <Plus className="h-6 w-6" />
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  {/* Consultant */}
                  <TabsContent value="consultant" className="m-0">
                    {isLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-50">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="rounded-xl border bg-card p-4 space-y-3"
                          >
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <div className="flex gap-2 pt-2">
                              <Skeleton className="h-6 w-16 rounded-full" />
                              <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                            <div className="pt-2">
                              <Skeleton className="h-9 w-28" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : consultantProfiles.length === 0 ? (
                      <EmptyState
                        className="py-12 bg-transparent border-0"
                        title="No Consultant profiles found"
                        description="Create a Consultant profile to showcase your expertise and start getting matched to the right opportunities."
                        Icon={UserCog}
                        actions={
                          <Button
                            onClick={() => {
                              setNewProfileType('Consultant');
                              setIsCreateDialogOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" /> Create Consultant
                            Profile
                          </Button>
                        }
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {consultantProfiles.map((profile) => (
                          <ProfileSummaryCard
                            key={profile._id}
                            profile={profile}
                            onView={() =>
                              router.push(
                                `/freelancer/settings/profiles/${profile._id!}`,
                              )
                            }
                            onDelete={() => handleDeleteProfile(profile._id!)}
                          />
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setNewProfileType('Consultant');
                            setIsCreateDialogOpen(true);
                          }}
                          className="flex items-center justify-center h-full min-h-[200px] bg-muted-foreground/20 dark:bg-black/20 border-gray-200 dark:border-gray-800 rounded-xl"
                        >
                          <Plus className="h-6 w-6" />
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </main>
      </div>

      {/* Create Profile Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New {newProfileType} Profile</DialogTitle>
            <DialogDescription>
              Fill in all the details for your new professional profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Profile Name */}
            <div className="space-y-2">
              <Label htmlFor="profile-name">Profile Name *</Label>
              <Input
                id="profile-name"
                placeholder="e.g., Frontend Developer, Backend Engineer"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="profile-description">Description *</Label>
              <Textarea
                id="profile-description"
                placeholder="Describe your expertise and experience in this area... (minimum 10 characters)"
                value={newProfileDescription}
                onChange={(e) => setNewProfileDescription(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {newProfileDescription.length}/500 characters
              </p>
            </div>

            {/* Hourly Rate */}
            <div className="space-y-2">
              <Label htmlFor="hourly-rate" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Hourly Rate ($)
              </Label>
              <Input
                id="hourly-rate"
                type="number"
                min="0"
                step="1"
                placeholder="50"
                value={newProfileHourlyRate || ''}
                onChange={(e) =>
                  setNewProfileHourlyRate(parseFloat(e.target.value) || 0)
                }
              />
            </div>

            <Separator />

            {/* Skills and Domains */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Award className="h-4 w-4" /> Skills
                </Label>
                <SelectTagPicker
                  label=""
                  options={skillsOptions}
                  selected={newProfileSkills.map((skill: any) => ({
                    name: skill?.label || skill?.name || '',
                    interviewerStatus:
                      skill?.interviewerStatus || 'NOT_APPLIED',
                  }))}
                  onAdd={(value: string) => {
                    const selectedSkill = skillsOptions.find(
                      (s: any) => (s.label || s.name) === value,
                    );
                    if (
                      selectedSkill &&
                      !newProfileSkills.some(
                        (s: any) => s._id === selectedSkill._id,
                      )
                    ) {
                      setNewProfileSkills([
                        ...newProfileSkills,
                        {
                          ...selectedSkill,
                          interviewerStatus: 'NOT_APPLIED',
                        },
                      ]);
                    }
                  }}
                  optionLabelKey="label"
                  selectedNameKey="name"
                  selectPlaceholder="Select skill"
                  searchPlaceholder="Search skills..."
                  hideRemoveButtonInSettings={true}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Layers className="h-4 w-4" /> Domains
                </Label>
                <SelectTagPicker
                  label=""
                  options={domainsOptions}
                  selected={newProfileDomains.map((domain: any) => ({
                    name: domain?.label || domain?.name || '',
                    interviewerStatus:
                      domain?.interviewerStatus || 'NOT_APPLIED',
                  }))}
                  onAdd={(value: string) => {
                    const selectedDomain = domainsOptions.find(
                      (d: any) => (d.label || d.name) === value,
                    );
                    if (
                      selectedDomain &&
                      !newProfileDomains.some(
                        (d: any) => d._id === selectedDomain._id,
                      )
                    ) {
                      setNewProfileDomains([
                        ...newProfileDomains,
                        {
                          ...selectedDomain,
                          interviewerStatus: 'NOT_APPLIED',
                        },
                      ]);
                    }
                  }}
                  optionLabelKey="label"
                  selectedNameKey="name"
                  selectPlaceholder="Select domain"
                  searchPlaceholder="Search domains..."
                  hideRemoveButtonInSettings={true}
                />
              </div>
            </div>

            <Separator />

            {/* Projects and Experiences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Projects
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowProjectDialog(true)}
                  className="w-full justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {newProfileProjects.length > 0
                    ? `${newProfileProjects.length} project(s) selected`
                    : 'Add Projects'}
                </Button>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Experiences
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowExperienceDialog(true)}
                  className="w-full justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {newProfileExperiences.length > 0
                    ? `${newProfileExperiences.length} experience(s) selected`
                    : 'Add Experiences'}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="github-link"
                  className="flex items-center gap-2"
                >
                  <Github className="h-4 w-4" /> GitHub
                </Label>
                <Input
                  id="github-link"
                  placeholder="https://github.com/username"
                  value={newProfileGithubLink}
                  onChange={(e) => setNewProfileGithubLink(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="linkedin-link"
                  className="flex items-center gap-2"
                >
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </Label>
                <Input
                  id="linkedin-link"
                  placeholder="https://linkedin.com/in/username"
                  value={newProfileLinkedinLink}
                  onChange={(e) => setNewProfileLinkedinLink(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="personal-website"
                  className="flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" /> Website
                </Label>
                <Input
                  id="personal-website"
                  placeholder="https://yourwebsite.com"
                  value={newProfilePersonalWebsite}
                  onChange={(e) => setNewProfilePersonalWebsite(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="availability"
                  className="flex items-center gap-2"
                >
                  <UserCog className="h-4 w-4" /> Availability
                </Label>
                <Select
                  value={newProfileAvailability}
                  onValueChange={setNewProfileAvailability}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                    <SelectItem value="FREELANCE">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setNewProfileName('');
                setNewProfileDescription('');
                setNewProfileHourlyRate(0);
                setNewProfileGithubLink('');
                setNewProfileLinkedinLink('');
                setNewProfilePersonalWebsite('');
                setNewProfileAvailability('FREELANCE');
                setNewProfileSkills([]);
                setNewProfileDomains([]);
                setNewProfileProjects([]);
                setNewProfileExperiences([]);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateProfile}>Create Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Profile"
        description="Are you sure you want to delete this profile? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteProfile}
      />

      {/* Project Selection Dialog - Only show when creating from existing profile */}
      {showProjectDialog && user.uid && (
        <ProjectSelectionDialog
          open={showProjectDialog}
          onOpenChange={setShowProjectDialog}
          freelancerId={user.uid}
          currentProfileId="new"
          onSuccess={(selected) => {
            setNewProfileProjects(selected);
            setShowProjectDialog(false);
          }}
        />
      )}

      {/* Experience Selection Dialog - Only show when creating from existing profile */}
      {showExperienceDialog && user.uid && (
        <ExperienceSelectionDialog
          open={showExperienceDialog}
          onOpenChange={setShowExperienceDialog}
          freelancerId={user.uid}
          currentProfileId="new"
          onSuccess={(selected) => {
            setNewProfileExperiences(selected);
            setShowExperienceDialog(false);
          }}
        />
      )}
    </div>
  );
}
