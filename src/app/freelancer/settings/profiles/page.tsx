'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Plus, BarChart3, Sparkles } from 'lucide-react';
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
import DeleteConfirmationDialog from '@/components/shared/DeleteConfirmationDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import ProfileSummaryCard from '@/components/cards/ProfileSummaryCard';
import { FreelancerProfile } from '@/types/freelancer';
import StatItem from '@/components/shared/StatItem';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ProfilesPage() {
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const [profiles, setProfiles] = useState<FreelancerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDescription, setNewProfileDescription] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
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
      setProfiles(profilesData);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      notifyError('Failed to load profiles');
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [user.uid]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) {
      notifyError('Profile name is required');
      return;
    }

    const description =
      newProfileDescription.trim() ||
      `Professional profile for ${newProfileName.trim()}. This profile showcases my skills and experience in this domain.`;

    if (description.length < 10) {
      notifyError('Description must be at least 10 characters long');
      return;
    }

    try {
      // Fetch freelancer's personal links for auto-population
      let freelancerData = {};
      try {
        const freelancerResponse = await axiosInstance.get(
          `/freelancer/${user.uid}`,
        );
        freelancerData = freelancerResponse.data.data || {};
      } catch (error) {
        console.warn(
          'Could not fetch freelancer data for personal links:',
          error,
        );
      }

      const profilePayload = {
        profileName: newProfileName.trim(),
        description: description,
        profileType: newProfileType,
        skills: [],
        domains: [],
        projects: [],
        experiences: [],
        portfolioLinks: [],
        // Auto-populate personal links from freelancer data
        githubLink: (freelancerData as any).githubLink || '',
        linkedinLink: (freelancerData as any).linkedin || '',
        personalWebsite: (freelancerData as any).personalWebsite || '',
      };

      const response = await axiosInstance.post(
        `/freelancer/profile`,
        profilePayload,
      );

      const newProfile = response.data.data;
      // Ensure correct local type so it appears in the right tab immediately
      const localProfile = {
        ...newProfile,
        profileType: newProfileType,
      } as FreelancerProfile;

      setProfiles((prev) => [...prev, localProfile]);
      setNewProfileName('');
      setNewProfileDescription('');
      setIsCreateDialogOpen(false);

      // Switch to the relevant tab so the newly created profile is visible immediately
      setActiveTab(
        newProfileType === 'Consultant' ? 'consultant' : 'freelancer',
      );

      notifySuccess('Profile created successfully', 'Success');
    } catch (error) {
      console.error('Error creating profile:', error);
      notifyError('Failed to create profile');
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
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Settings', link: '#' },
            { label: 'Profiles', link: '#' },
          ]}
        />
        <main className="grid flex-1 items-start sm:px-6 sm:py-0 md:gap-8">
          <div className="w-full mx-auto max-w-6xl">
            <div className="flex flex-col gap-2 mb-6">
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Profiles Center
              </h1>
              <p className="text-muted-foreground">
                Create and manage profiles to showcase your expertise.
              </p>
            </div>

            <div className="bg-muted/20 rounded-xl border shadow-sm overflow-hidden">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
                className="w-full"
              >
                <div className="border-b px-6">
                  <TabsList className="bg-transparent h-12 w-full md:w-auto p-0">
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
                      Freelancer ({freelancerProfiles.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="consultant"
                      className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      Consultant ({consultantProfiles.length})
                    </TabsTrigger>
                  </TabsList>
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
                      <div className="text-center py-12">
                        <p>Loading profiles...</p>
                      </div>
                    ) : freelancerProfiles.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">
                          No Freelancer profiles found.
                        </p>
                        <Button
                          onClick={() => {
                            setNewProfileType('Freelancer');
                            setIsCreateDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" /> Create Freelancer
                          Profile
                        </Button>
                      </div>
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
                      <div className="text-center py-12">
                        <p>Loading profiles...</p>
                      </div>
                    ) : consultantProfiles.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">
                          No Consultant profiles found.
                        </p>
                        <Button
                          onClick={() => {
                            setNewProfileType('Consultant');
                            setIsCreateDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" /> Create Consultant
                          Profile
                        </Button>
                      </div>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Profile</DialogTitle>
            <DialogDescription>
              Enter a name and description for your new professional profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="profile-name" className="text-sm font-medium">
                Profile Name
              </label>
              <Input
                id="profile-name"
                placeholder="e.g., Frontend Developer, Backend Engineer"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label
                htmlFor="profile-description"
                className="text-sm font-medium"
              >
                Description (optional)
              </label>
              <Textarea
                id="profile-description"
                placeholder="Describe your expertise and experience in this area... (minimum 10 characters if provided)"
                value={newProfileDescription}
                onChange={(e) => setNewProfileDescription(e.target.value)}
                className="mt-1"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                If left empty, a default description will be generated.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setNewProfileName('');
                setNewProfileDescription('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateProfile}>Create Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Profile"
        description="Are you sure you want to delete this profile? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteProfile}
      />
    </div>
  );
}
