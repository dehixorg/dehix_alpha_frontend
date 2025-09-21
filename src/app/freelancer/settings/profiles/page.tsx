'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Eye, User, Briefcase, Pencil } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FreelancerProfile } from '@/types/freelancer';

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
  const [activeTab, setActiveTab] = useState<'freelancer' | 'consultant'>(
    'freelancer',
  );
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
      toast({
        title: 'Error',
        description: 'Failed to load profiles',
        variant: 'destructive',
      });
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
      toast({
        title: 'Error',
        description: 'Profile name is required',
        variant: 'destructive',
      });
      return;
    }

    const description =
      newProfileDescription.trim() ||
      `Professional profile for ${newProfileName.trim()}. This profile showcases my skills and experience in this domain.`;

    if (description.length < 10) {
      toast({
        title: 'Error',
        description: 'Description must be at least 10 characters long',
        variant: 'destructive',
      });
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

      setProfiles([...profiles, newProfile]);
      setNewProfileName('');
      setNewProfileDescription('');
      setIsCreateDialogOpen(false);

      toast({
        title: 'Success',
        description: 'Profile created successfully',
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to create profile',
        variant: 'destructive',
      });
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

      toast({
        title: 'Profile Deleted',
        description: 'Profile has been successfully deleted.',
      });
      fetchProfiles();
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
    }
  };
  const freelancerProfiles = profiles.filter(
    (p) => p.profileType === 'Freelancer' || !p.profileType, // Handles old profiles
  );
  const consultantProfiles = profiles.filter(
    (p) => p.profileType === 'Consultant',
  );
  const handleViewProfile = (profileId: string) => {
    router.push(`/freelancer/settings/profiles/${profileId}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Profiles"
        isKycCheck={true}
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14 mb-8">
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
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Professional Profiles</h1>
                <p className="text-muted-foreground">
                  Create and manage profiles to showcase your expertise.
                </p>
              </div>
            </div>

            {/* --- TAB NAVIGATION BUTTONS --- */}
            <div className="flex border-b">
              <Button
                variant="ghost"
                onClick={() => setActiveTab('freelancer')}
                className={`rounded-none ${activeTab === 'freelancer' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
              >
                Freelancer Profiles ({freelancerProfiles.length})
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab('consultant')}
                className={`rounded-none ${activeTab === 'consultant' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
              >
                Consultant Profiles ({consultantProfiles.length})
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p>Loading profiles...</p>
              </div>
            ) : (
              <>
                {/* --- SECTION FOR FREELANCER PROFILES --- */}
                {activeTab === 'freelancer' && (
                  <div>
                    {freelancerProfiles.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">
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
                          <Card
                            key={profile._id}
                            className="hover:shadow-lg transition-shadow flex flex-col h-full"
                          >
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    {profile.profileName}
                                  </CardTitle>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {profile.description &&
                                    profile.description.length > 100
                                      ? `${profile.description.substring(0, 100)}...`
                                      : profile.description ||
                                        'No description available'}
                                  </p>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-1 flex flex-col">
                              <div className="flex-1 space-y-4">
                                <div className="min-h-[60px]">
                                  {profile.skills &&
                                  profile.skills.length > 0 ? (
                                    <div>
                                      <p className="text-sm font-medium mb-2">
                                        Skills:
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {profile.skills
                                          .slice(0, 3)
                                          .map((skill: any, index: number) => (
                                            <Badge
                                              key={index}
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              {typeof skill === 'string'
                                                ? skill
                                                : skill.name || skill.skillName}
                                            </Badge>
                                          ))}
                                        {profile.skills.length > 3 && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            +{profile.skills.length - 3} more
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="text-sm font-medium mb-2">
                                        Skills:
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        No skills added
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <div className="min-h-[60px]">
                                  {profile.domains &&
                                  profile.domains.length > 0 ? (
                                    <div>
                                      <p className="text-sm font-medium mb-2">
                                        Domains:
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {profile.domains
                                          .slice(0, 2)
                                          .map((domain: any, index: number) => (
                                            <Badge
                                              key={index}
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {typeof domain === 'string'
                                                ? domain
                                                : domain.name ||
                                                  domain.domainName}
                                            </Badge>
                                          ))}
                                        {profile.domains.length > 2 && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            +{profile.domains.length - 2} more
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="text-sm font-medium mb-2">
                                        Domains:
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        No domains added
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Briefcase className="h-4 w-4" />
                                    <span>
                                      {profile.projects?.length || 0} Projects
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    <span>
                                      {profile.experiences?.length || 0}{' '}
                                      Experience
                                    </span>
                                  </div>
                                </div>
                                <div className="text-sm min-h-[20px]">
                                  {profile.hourlyRate ? (
                                    <>
                                      <span className="font-medium">
                                        Rate:{' '}
                                      </span>
                                      <span className="text-green-600">
                                        ${profile.hourlyRate}/hr
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">
                                      No rate set
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 pt-4 mt-auto">
                                <Button
                                  onClick={() =>
                                    router.push(
                                      `/freelancer/settings/profiles/view/${profile._id!}`,
                                    )
                                  }
                                  variant="outline"
                                  className="flex-1 flex items-center gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  View
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleViewProfile(profile._id!)
                                  }
                                  className="flex-1 flex items-center gap-2"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteProfile(profile._id!)
                                  }
                                  className="flex items-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setNewProfileType('Freelancer');
                            setIsCreateDialogOpen(true);
                          }}
                          className="flex items-center justify-center h-full min-h-[200px]"
                        >
                          <Plus className="h-6 w-6" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* --- SECTION FOR CONSULTANT PROFILES --- */}
                {activeTab === 'consultant' && (
                  <div>
                    {consultantProfiles.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">
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
                          <Card
                            key={profile._id}
                            className="hover:shadow-lg transition-shadow flex flex-col h-full"
                          >
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    {profile.profileName}
                                  </CardTitle>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {profile.description &&
                                    profile.description.length > 100
                                      ? `${profile.description.substring(0, 100)}...`
                                      : profile.description ||
                                        'No description available'}
                                  </p>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-1 flex flex-col">
                              <div className="flex-1 space-y-4">
                                <div className="min-h-[60px]">
                                  {profile.skills &&
                                  profile.skills.length > 0 ? (
                                    <div>
                                      <p className="text-sm font-medium mb-2">
                                        Skills:
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {profile.skills
                                          .slice(0, 3)
                                          .map((skill: any, index: number) => (
                                            <Badge
                                              key={index}
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              {typeof skill === 'string'
                                                ? skill
                                                : skill.name || skill.skillName}
                                            </Badge>
                                          ))}
                                        {profile.skills.length > 3 && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            +{profile.skills.length - 3} more
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="text-sm font-medium mb-2">
                                        Skills:
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        No skills added
                                      </p>
                                    </div>
                                  )}
                                </div>
                                {/* Domains */}
                                <div className="min-h-[60px]">
                                  {profile.domains &&
                                  profile.domains.length > 0 ? (
                                    <div>
                                      <p className="text-sm font-medium mb-2">
                                        Domains:
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {profile.domains
                                          .slice(0, 2)
                                          .map((domain: any, index: number) => (
                                            <Badge
                                              key={index}
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {typeof domain === 'string'
                                                ? domain
                                                : domain.name ||
                                                  domain.domainName}
                                            </Badge>
                                          ))}
                                        {profile.domains.length > 2 && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            +{profile.domains.length - 2} more
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="text-sm font-medium mb-2">
                                        Domains:
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        No domains added
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Briefcase className="h-4 w-4" />
                                    <span>
                                      {profile.projects?.length || 0} Projects
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    <span>
                                      {profile.experiences?.length || 0}{' '}
                                      Experience
                                    </span>
                                  </div>
                                </div>
                                <div className="text-sm min-h-[20px]">
                                  {profile.hourlyRate ? (
                                    <>
                                      <span className="font-medium">
                                        Rate:{' '}
                                      </span>
                                      <span className="text-green-600">
                                        ${profile.hourlyRate}/hr
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">
                                      No rate set
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 pt-4 mt-auto">
                                <Button
                                  onClick={() =>
                                    router.push(
                                      `/freelancer/settings/profiles/view/${profile._id!}`,
                                    )
                                  }
                                  variant="outline"
                                  className="flex-1 flex items-center gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  View
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleViewProfile(profile._id!)
                                  }
                                  className="flex-1 flex items-center gap-2"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteProfile(profile._id!)
                                  }
                                  className="flex items-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setNewProfileType('Consultant');
                            setIsCreateDialogOpen(true);
                          }}
                          className="flex items-center justify-center h-full min-h-[200px]"
                        >
                          <Plus className="h-6 w-6" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
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
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this profile? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProfile}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
