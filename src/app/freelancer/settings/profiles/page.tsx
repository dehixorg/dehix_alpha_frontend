'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Plus, BarChart3, Sparkles } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

import { RootState } from '@/lib/store';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';
import Header from '@/components/header/header';
import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DeleteConfirmationDialog from '@/components/shared/DeleteConfirmationDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import ProfileSummaryCard from '@/components/cards/ProfileSummaryCard';
import { FreelancerProfile } from '@/types/freelancer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ProfilesPage() {
  const [profileType, setProfileType] = useState<'Freelancer' | 'Consultant'>(
    'Freelancer',
  );
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const [freelancerProfiles, setFreelancerProfiles] = useState<
    FreelancerProfile[]
  >([]);
  const [consultantProfiles, setConsultantProfiles] = useState<any[]>([]);
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
      setFreelancerProfiles(profilesData);
    } catch (error) {
      console.error('Error fetching freelancer profiles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load freelancer profiles',
        variant: 'destructive',
      });
      setFreelancerProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [user.uid]);

  /** Fetch Consultant Profiles */
  const fetchConsultantProfiles = useCallback(async () => {
    if (!user.uid) return;
    try {
      const response = await axiosInstance.get(`/freelancer/consultant`);
      const profilesData = response.data.data || [];
      console.log('consultant data ', profilesData);
      setConsultantProfiles(Object.values(profilesData.consultant || {}));
    } catch (error) {
      console.error('Error fetching consultant profiles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load consultant profiles',
        variant: 'destructive',
      });
      setConsultantProfiles([]);
    }
  }, [user.uid]);

  useEffect(() => {
    fetchFreelancerProfiles();
    fetchConsultantProfiles();
  }, [fetchFreelancerProfiles, fetchConsultantProfiles]);

  /** Create Profile */
  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) {
      toast({
        title: 'Error',
        description: 'Profile name is required',
        variant: 'destructive',
      });
      return;
    }

    const description =
      newProfileDescription.trim() ||
      `Professional profile for ${newProfileName.trim()}.`;

    if (description.length < 10) {
      toast({
        title: 'Error',
        description: 'Description must be at least 10 characters long',
        variant: 'destructive',
      });
      return;
    }

    try {
      let freelancerData: any = {};
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
      setProfileType('Freelancer');
      setIsCreateDialogOpen(false);

      // Switch to the relevant tab so the newly created profile is visible immediately
      setActiveTab(
        newProfileType === 'Consultant' ? 'consultant' : 'freelancer',
      );

      toast({
        title: 'Success',
        description: `${profileType} profile created successfully`,
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: 'Error',
        description: `Failed to create ${profileType.toLowerCase()} profile`,
        variant: 'destructive',
      });
    }
  };

  /** Delete Profile */
  const handleDeleteProfile = (
    profileId: string,
    type: 'Freelancer' | 'Consultant',
  ) => {
    setProfileToDelete(profileId);
    setProfileTypeToDelete(type);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProfile = async () => {
    if (!profileToDelete || !profileTypeToDelete) return;
    try {
      const apiUrl =
        profileTypeToDelete === 'Freelancer'
          ? `/freelancer/profile/${profileToDelete}`
          : `/freelancer/consultant/${profileToDelete}`;

      await axiosInstance.delete(apiUrl);

      toast({
        title: 'Profile Deleted',
        description: `${profileTypeToDelete} profile deleted successfully.`,
      });

      fetchFreelancerProfiles();
      fetchConsultantProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete profile',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
      setProfileTypeToDelete(null);
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
                      <Card className="bg-background/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-muted-foreground">
                            Total Profiles
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                          {totalProfiles}
                        </CardContent>
                      </Card>
                      <Card className="bg-background/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-muted-foreground">
                            Freelancer
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                          {totalFreelancer}
                        </CardContent>
                      </Card>
                      <Card className="bg-background/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-muted-foreground">
                            Consultant
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                          {totalConsultant}
                        </CardContent>
                      </Card>
                      <Card className="bg-background/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-muted-foreground">
                            Avg Projects / Profile
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                          {avgProjects}
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-background/50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" /> Top Profiles by
                          Projects
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {topProjectProfiles.length === 0 ? (
                          <div className="text-sm text-muted-foreground">
                            No data available yet. Create your first profile to
                            see analytics.
                          </div>
                        ) : (
                          <div className="w-full overflow-x-auto">
                            <svg
                              viewBox={`0 0 400 ${topProjectProfiles.length * 34}`}
                              className="min-w-[360px]"
                            >
                              {topProjectProfiles.map((p, i) => {
                                const max = Math.max(
                                  ...topProjectProfiles.map(
                                    (tp) => tp.projects?.length || 0,
                                  ),
                                  1,
                                );
                                const value = p.projects?.length || 0;
                                const barWidth = (value / max) * 300;
                                const y = i * 34 + 8;
                                return (
                                  <g key={p._id || i}>
                                    <text
                                      x={0}
                                      y={y + 12}
                                      className="fill-current text-xs"
                                      style={{ fontSize: 12 }}
                                    >
                                      {(p.profileName || 'Profile').slice(
                                        0,
                                        18,
                                      )}
                                    </text>
                                    <rect
                                      x={120}
                                      y={y}
                                      width={barWidth}
                                      height={16}
                                      className="fill-primary/70"
                                      rx={4}
                                    />
                                    <text
                                      x={120 + barWidth + 8}
                                      y={y + 12}
                                      className="fill-current text-xs"
                                      style={{ fontSize: 12 }}
                                    >
                                      {value}
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>
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
              Enter details for your new professional profile.
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
                placeholder="Describe your expertise... (min 10 chars)"
                value={newProfileDescription}
                onChange={(e) => setNewProfileDescription(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="profile-type" className="text-sm font-medium">
                Profile Type
              </label>
              <Select
                value={profileType}
                onValueChange={(val: 'Freelancer' | 'Consultant') =>
                  setProfileType(val)
                }
              >
                <SelectTrigger id="profile-type" className="mt-1">
                  <SelectValue placeholder="Select profile type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Freelancer">Freelancer</SelectItem>
                  <SelectItem value="Consultant">Consultant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setNewProfileName('');
                setNewProfileDescription('');
                setProfileType('Freelancer');
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
