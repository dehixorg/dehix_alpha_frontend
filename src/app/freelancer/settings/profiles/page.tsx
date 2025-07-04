'use client';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

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
import { Plus, X, Edit, Save, Trash2 } from 'lucide-react';
import { FreelancerProfile } from '@/types/freelancer';
import AddEditProfileDialog from '@/components/dialogs/addEditProfileDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
export default function ProfilesPage() {
  const user = useSelector((state: RootState) => state.user);
  const [profiles, setProfiles] = useState<FreelancerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDescription, setNewProfileDescription] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] =
    useState<FreelancerProfile | null>(null);
  const [editingProfileData, setEditingProfileData] = useState<any>({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, [user.uid]);

  const fetchProfiles = async () => {
    if (!user.uid) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/freelancer/profiles`);
      const profilesData = response.data.data || [];
      setProfiles(profilesData);

      // Set the first profile as active tab, or empty string if no profiles
      if (profilesData.length > 0 && !activeTab && profilesData[0]._id) {
        setActiveTab(profilesData[0]._id);
      }
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
  };

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
      const response = await axiosInstance.post(`/freelancer/profile`, {
        profileName: newProfileName.trim(),
        description: description,
        skills: [],
        domains: [],
        projects: [],
        experiences: [],
        education: [],
        portfolioLinks: [],
      });

      const newProfile = response.data.data;
      setProfiles([...profiles, newProfile]);
      if (newProfile._id) {
        setActiveTab(newProfile._id);
      }
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

      // If deleting the active tab, switch to another tab
      if (activeTab === profileToDelete) {
        const remainingProfiles = profiles.filter(
          (p) => p._id !== profileToDelete,
        );
        setActiveTab(
          remainingProfiles.length > 0 && remainingProfiles[0]._id
            ? remainingProfiles[0]._id
            : '',
        );
      }

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

  const handleEditProfile = (profile: FreelancerProfile) => {
    setEditingProfile(profile);
    setIsEditDialogOpen(true);
  };

  const handleProfileSaved = () => {
    fetchProfiles();
    setIsEditDialogOpen(false);
    setEditingProfile(null);
  };

  const handleUpdateProfile = async (profileId: string, updatedData: any) => {
    setIsUpdating(true);
    try {
      await axiosInstance.put(`/freelancer/profile/${profileId}`, updatedData);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      fetchProfiles();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (profileId: string, field: string, value: any) => {
    setEditingProfileData((prev) => ({
      ...prev,
      [profileId]: {
        ...prev[profileId],
        [field]: value,
      },
    }));
  };

  const getProfileData = (profile: FreelancerProfile) => {
    return editingProfileData[profile._id!] || profile;
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
                  Create and manage multiple professional profiles to showcase
                  different aspects of your expertise.
                </p>
              </div>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Profile
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p>Loading profiles...</p>
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">
                  No profiles added
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first professional profile to get started.
                </p>
              </div>
            ) : (
              <div className="w-full">
                {/* Custom Tab Navigation */}
                <div className="flex">
                  {profiles
                    .filter((profile) => profile._id)
                    .map((profile) => (
                      <button
                        key={profile._id}
                        onClick={() => setActiveTab(profile._id!)}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                          activeTab === profile._id
                            ? 'text-blue-600 border-blue-600 bg-blue-50'
                            : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{profile.profileName}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProfile(profile._id!);
                            }}
                            className="ml-1 text-red-500 hover:text-red-700 opacity-70 hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </button>
                    ))}
                </div>

                {/* Tab Content */}
                {profiles
                  .filter((profile) => profile._id)
                  .map((profile) => (
                    <div
                      key={profile._id}
                      className={`${
                        activeTab === profile._id ? 'block' : 'hidden'
                      }`}
                    >
                      <div className="border-t border-gray-200 p-6">
                        <div className="space-y-6">
                          {/* Profile Header */}
                          <div className="flex justify-between items-center pb-4 border-b">
                            <h2 className="text-xl font-semibold">
                              {getProfileData(profile).profileName}
                            </h2>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleUpdateProfile(
                                    profile._id!,
                                    getProfileData(profile),
                                  )
                                }
                                disabled={isUpdating}
                                className="flex items-center gap-2"
                              >
                                <Save className="h-4 w-4" />
                                {isUpdating ? 'Updating...' : 'Update'}
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
                                Delete
                              </Button>
                            </div>
                          </div>
                          {/* Profile Form Content */}
                          <div className="space-y-6">
                            {/* Profile Name */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`profileName-${profile._id}`}>
                                  Profile Name
                                </Label>
                                <Input
                                  id={`profileName-${profile._id}`}
                                  value={
                                    getProfileData(profile).profileName || ''
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      profile._id!,
                                      'profileName',
                                      e.target.value,
                                    )
                                  }
                                  placeholder="e.g., Frontend Developer"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`hourlyRate-${profile._id}`}>
                                  Hourly Rate ($)
                                </Label>
                                <Input
                                  id={`hourlyRate-${profile._id}`}
                                  type="number"
                                  value={
                                    getProfileData(profile).hourlyRate || ''
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      profile._id!,
                                      'hourlyRate',
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  placeholder="50"
                                />
                              </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                              <Label htmlFor={`description-${profile._id}`}>
                                Description
                              </Label>
                              <Textarea
                                id={`description-${profile._id}`}
                                value={
                                  getProfileData(profile).description || ''
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    profile._id!,
                                    'description',
                                    e.target.value,
                                  )
                                }
                                placeholder="Describe your expertise and experience..."
                                rows={4}
                              />
                            </div>

                            {/* Skills and Domains */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Skills</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select skills" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="javascript">
                                      JavaScript
                                    </SelectItem>
                                    <SelectItem value="react">React</SelectItem>
                                    <SelectItem value="nodejs">
                                      Node.js
                                    </SelectItem>
                                    <SelectItem value="python">
                                      Python
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {profile.skills &&
                                  profile.skills.length > 0 ? (
                                    profile.skills.map(
                                      (skill: any, index: number) => (
                                        <Badge key={index} variant="secondary">
                                          {typeof skill === 'string'
                                            ? skill
                                            : skill.label || skill.name}
                                          <X className="h-3 w-3 ml-1 cursor-pointer" />
                                        </Badge>
                                      ),
                                    )
                                  ) : (
                                    <p className="text-muted-foreground text-sm">
                                      No skills selected
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Domains</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select domains" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="frontend">
                                      Frontend
                                    </SelectItem>
                                    <SelectItem value="backend">
                                      Backend
                                    </SelectItem>
                                    <SelectItem value="fullstack">
                                      Full Stack
                                    </SelectItem>
                                    <SelectItem value="mobile">
                                      Mobile
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {profile.domains &&
                                  profile.domains.length > 0 ? (
                                    profile.domains.map(
                                      (domain: any, index: number) => (
                                        <Badge key={index} variant="secondary">
                                          {typeof domain === 'string'
                                            ? domain
                                            : domain.label || domain.name}
                                          <X className="h-3 w-3 ml-1 cursor-pointer" />
                                        </Badge>
                                      ),
                                    )
                                  ) : (
                                    <p className="text-muted-foreground text-sm">
                                      No domains selected
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Links */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`githubLink-${profile._id}`}>
                                  GitHub Link
                                </Label>
                                <Input
                                  id={`githubLink-${profile._id}`}
                                  value={
                                    getProfileData(profile).githubLink || ''
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      profile._id!,
                                      'githubLink',
                                      e.target.value,
                                    )
                                  }
                                  placeholder="https://github.com/username"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`linkedinLink-${profile._id}`}>
                                  LinkedIn Link
                                </Label>
                                <Input
                                  id={`linkedinLink-${profile._id}`}
                                  value={
                                    getProfileData(profile).linkedinLink || ''
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      profile._id!,
                                      'linkedinLink',
                                      e.target.value,
                                    )
                                  }
                                  placeholder="https://linkedin.com/in/username"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`personalWebsite-${profile._id}`}
                                >
                                  Personal Website
                                </Label>
                                <Input
                                  id={`personalWebsite-${profile._id}`}
                                  value={
                                    getProfileData(profile).personalWebsite ||
                                    ''
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      profile._id!,
                                      'personalWebsite',
                                      e.target.value,
                                    )
                                  }
                                  placeholder="https://yourwebsite.com"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`availability-${profile._id}`}>
                                  Availability
                                </Label>
                                <Select
                                  value={
                                    getProfileData(profile).availability ||
                                    'FREELANCE'
                                  }
                                  onValueChange={(value) =>
                                    handleInputChange(
                                      profile._id!,
                                      'availability',
                                      value,
                                    )
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select availability" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="FULL_TIME">
                                      Full Time
                                    </SelectItem>
                                    <SelectItem value="PART_TIME">
                                      Part Time
                                    </SelectItem>
                                    <SelectItem value="CONTRACT">
                                      Contract
                                    </SelectItem>
                                    <SelectItem value="FREELANCE">
                                      Freelance
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Action Buttons for Adding Items */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Button
                                variant="outline"
                                onClick={() => handleEditProfile(profile)}
                                className="flex items-center gap-2"
                              >
                                <Plus className="h-4 w-4" />
                                Add Projects
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleEditProfile(profile)}
                                className="flex items-center gap-2"
                              >
                                <Plus className="h-4 w-4" />
                                Add Experience
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleEditProfile(profile)}
                                className="flex items-center gap-2"
                              >
                                <Plus className="h-4 w-4" />
                                Add Education
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
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
              <label className="text-sm font-medium">Profile Name</label>
              <Input
                placeholder="e.g., Frontend Developer, Backend Engineer"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
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

      {/* Edit Profile Dialog */}
      <AddEditProfileDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        profile={editingProfile}
        onProfileSaved={handleProfileSaved}
        freelancerId={user.uid}
      />

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
