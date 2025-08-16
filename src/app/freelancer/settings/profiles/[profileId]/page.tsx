'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { Plus, X, Save, ArrowLeft, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProjectCard from '@/components/cards/freelancerProjectCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FreelancerProfile } from '@/types/freelancer';
import ProjectSelectionDialog from '@/components/dialogs/ProjectSelectionDialog';
import ExperienceSelectionDialog from '@/components/dialogs/ExperienceSelectionDialog';

export default function ProfileDetailPage() {
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const params = useParams();
  const profileId = params.profileId as string;

  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingProfileData, setEditingProfileData] = useState<any>({});
  const [skillsOptions, setSkillsOptions] = useState<any[]>([]);
  const [domainsOptions, setDomainsOptions] = useState<any[]>([]);
  const [skillsAndDomainsLoaded, setSkillsAndDomainsLoaded] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showExperienceDialog, setShowExperienceDialog] = useState(false);
  const [freelancerProjects, setFreelancerProjects] = useState<any>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isProjectDetailsOpen, setIsProjectDetailsOpen] = useState(false);
  const [tmpSkill, setTmpSkill] = useState<string>('');
  const [tmpDomain, setTmpDomain] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (profileId) {
      fetchSkillsAndDomains().then(() => {
        fetchProfile();
        fetchFreelancerProjects();
      });
    }
  });

  // Helper function to get skill name from ID
  const getSkillNameById = (skillId: string) => {
    if (!skillId || !skillsOptions || skillsOptions.length === 0) {
      return skillId || '';
    }

    // Try multiple matching strategies
    let skill = skillsOptions.find((s: any) => s.skillId === skillId);
    if (!skill) skill = skillsOptions.find((s: any) => s._id === skillId);
    if (!skill) skill = skillsOptions.find((s: any) => s.id === skillId);
    if (!skill) skill = skillsOptions.find((s: any) => s.name === skillId);

    // If still not found, try case-insensitive name matching
    if (!skill) {
      skill = skillsOptions.find(
        (s: any) =>
          (s.name || s.label || s.skillName)?.toLowerCase() ===
          skillId.toLowerCase(),
      );
    }

    return skill
      ? skill.name || skill.label || skill.skillName || skillId
      : skillId;
  };

  // Helper function to get domain name from ID
  const getDomainNameById = (domainId: string) => {
    if (!domainId || !domainsOptions || domainsOptions.length === 0) {
      return domainId || '';
    }

    // Try multiple matching strategies
    let domain = domainsOptions.find((d: any) => d.domainId === domainId);
    if (!domain) domain = domainsOptions.find((d: any) => d._id === domainId);
    if (!domain) domain = domainsOptions.find((d: any) => d.id === domainId);
    if (!domain) domain = domainsOptions.find((d: any) => d.name === domainId);

    // If still not found, try case-insensitive name matching
    if (!domain) {
      domain = domainsOptions.find(
        (d: any) =>
          (d.name || d.label || d.domainName)?.toLowerCase() ===
          domainId.toLowerCase(),
      );
    }

    return domain
      ? domain.name || domain.label || domain.domainName || domainId
      : domainId;
  };

  // Helper function to transform profile data for backend API
  const transformProfileForAPI = (profileData: any) => {
    const transformedSkills =
      profileData.skills?.map((skill: any) => {
        if (typeof skill === 'string') {
          return skill;
        }
        // Prioritize skillId field, then fallback to other ID fields
        const skillId =
          skill.skillId || skill._id || skill.id || skill.value || skill.name;
        return skillId;
      }) || [];

    const transformedDomains =
      profileData.domains?.map((domain: any) => {
        if (typeof domain === 'string') {
          return domain;
        }
        // Prioritize domainId field, then fallback to other ID fields
        const domainId =
          domain.domainId ||
          domain._id ||
          domain.id ||
          domain.value ||
          domain.name;
        return domainId;
      }) || [];

    return {
      ...profileData,
      skills: transformedSkills,
      domains: transformedDomains,
    };
  };

  const fetchProfile = async () => {
    if (!profileId) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `/freelancer/profile/${profileId}`,
      );
      const profileData = response.data.data;

      // If profile has projects, fetch complete project data to ensure we have thumbnails
      if (profileData.projects && profileData.projects.length > 0) {
        try {
          const freelancerResponse = await axiosInstance.get(
            `/freelancer/${user.uid}`,
          );
          const freelancerData = freelancerResponse.data.data || {};
          const freelancerProjects = freelancerData.projects || {};

          // Convert projects object to array if it's an object
          const allFreelancerProjects = Array.isArray(freelancerProjects)
            ? freelancerProjects
            : Object.values(freelancerProjects);

          // Merge profile projects with complete freelancer project data
          const enrichedProjects = profileData.projects.map(
            (profileProject: any) => {
              const fullProject = allFreelancerProjects.find(
                (fp: any) => fp._id === profileProject._id,
              );

              // Use full project data if available, otherwise use profile project data
              return fullProject || profileProject;
            },
          );

          profileData.projects = enrichedProjects;
        } catch (projectError) {
          console.warn('Could not fetch complete project data:', projectError);
          // Continue with existing profile data if project fetch fails
        }
      }

      // Ensure skills and domains are properly formatted as arrays of strings
      const processedProfileData = {
        ...profileData,
        skills: Array.isArray(profileData.skills) ? profileData.skills : [],
        domains: Array.isArray(profileData.domains) ? profileData.domains : [],
      };

      setProfile(processedProfileData);
      setEditingProfileData(processedProfileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
      router.push('/freelancer/settings/profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSkillsAndDomains = async () => {
    try {
      const freelancerResponse = await axiosInstance.get(
        `/freelancer/${user.uid}`,
      );
      const freelancerData = freelancerResponse.data.data || {};

      const skillsData = freelancerData.skills || [];
      const skillsArray = Array.isArray(skillsData) ? skillsData : [];
      setSkillsOptions(skillsArray);

      const domainsData = freelancerData.domain || [];
      const domainsArray = Array.isArray(domainsData) ? domainsData : [];
      setDomainsOptions(domainsArray);

      setSkillsAndDomainsLoaded(true);
    } catch (error) {
      console.error('Error fetching skills and domains:', error);
    }
  };

  const fetchFreelancerProjects = async () => {
    try {
      const freelancerResponse = await axiosInstance.get(
        `/freelancer/${user.uid}`,
      );
      const freelancerData = freelancerResponse.data.data || {};
      const projectsData = freelancerData.projects || {};
      setFreelancerProjects(projectsData);
    } catch (error) {
      console.error('Error fetching freelancer projects:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile?._id) return;

    // Client-side validation
    if (
      !editingProfileData.profileName ||
      editingProfileData.profileName.trim().length === 0
    ) {
      toast({
        title: 'Validation Error',
        description: 'Profile name is required',
        variant: 'destructive',
      });
      return;
    }

    if (
      !editingProfileData.description ||
      editingProfileData.description.trim().length < 10
    ) {
      toast({
        title: 'Validation Error',
        description: 'Description must be at least 10 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (editingProfileData.profileName.length > 100) {
      toast({
        title: 'Validation Error',
        description: 'Profile name must be less than 100 characters',
        variant: 'destructive',
      });
      return;
    }

    if (editingProfileData.description.length > 500) {
      toast({
        title: 'Validation Error',
        description: 'Description must be less than 500 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    try {
      // Transform the data to match backend schema
      const updatePayload = transformProfileForAPI(editingProfileData);

      await axiosInstance.put(
        `/freelancer/profile/${profile._id}`,
        updatePayload,
      );
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      fetchProfile();
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

  const handleInputChange = (field: string, value: any) => {
    setEditingProfileData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddSkill = () => {
    if (!tmpSkill || !profile || !skillsOptions || skillsOptions.length === 0)
      return;

    const selectedSkill = skillsOptions.find(
      (skill: any) =>
        (skill.name || skill.label || skill.skillName) === tmpSkill,
    );

    if (selectedSkill) {
      // Add the skillId (string) to the profile, not the entire object
      const skillIdToAdd =
        selectedSkill.skillId ||
        selectedSkill._id ||
        selectedSkill.id ||
        selectedSkill.name;

      // Check if skill is already added by comparing IDs
      const isAlreadyAdded = profile.skills?.some((skill: any) => {
        const existingSkillId =
          typeof skill === 'string'
            ? skill
            : skill.skillId || skill._id || skill.id || skill.name;
        return existingSkillId === skillIdToAdd;
      });

      if (!isAlreadyAdded) {
        const updatedSkills = [...(profile.skills || []), skillIdToAdd];
        setProfile({ ...profile, skills: updatedSkills });
        setEditingProfileData({
          ...editingProfileData,
          skills: updatedSkills,
        });
      }
      setTmpSkill('');
      setSearchQuery('');
    }
  };

  const handleAddDomain = () => {
    if (
      !tmpDomain ||
      !profile ||
      !domainsOptions ||
      domainsOptions.length === 0
    )
      return;

    const selectedDomain = domainsOptions.find(
      (domain: any) =>
        (domain.name || domain.label || domain.domainName) === tmpDomain,
    );

    if (selectedDomain) {
      // Add the domainId (string) to the profile, not the entire object
      const domainIdToAdd =
        selectedDomain.domainId ||
        selectedDomain._id ||
        selectedDomain.id ||
        selectedDomain.name;

      // Check if domain is already added by comparing IDs
      const isAlreadyAdded = profile.domains?.some((domain: any) => {
        const existingDomainId =
          typeof domain === 'string'
            ? domain
            : domain.domainId || domain._id || domain.id || domain.name;
        return existingDomainId === domainIdToAdd;
      });

      if (!isAlreadyAdded) {
        const updatedDomains = [...(profile.domains || []), domainIdToAdd];
        setProfile({ ...profile, domains: updatedDomains });
        setEditingProfileData({
          ...editingProfileData,
          domains: updatedDomains,
        });
      }
      setTmpDomain('');
      setSearchQuery('');
    }
  };

  const handleDeleteSkill = (skillIdToDelete: string) => {
    if (!profile || !profile.skills) return;

    const updatedSkills = profile.skills.filter((skill: any) => {
      const skillId =
        typeof skill === 'string'
          ? skill
          : skill.skillId || skill._id || skill.id || skill.name;
      return skillId !== skillIdToDelete;
    });
    setProfile({ ...profile, skills: updatedSkills });
    setEditingProfileData({ ...editingProfileData, skills: updatedSkills });
  };

  const handleDeleteDomain = (domainIdToDelete: string) => {
    if (!profile || !profile.domains) return;

    const updatedDomains = profile.domains.filter((domain: any) => {
      const domainId =
        typeof domain === 'string'
          ? domain
          : domain.domainId || domain._id || domain.id || domain.name;
      return domainId !== domainIdToDelete;
    });
    setProfile({ ...profile, domains: updatedDomains });
    setEditingProfileData({ ...editingProfileData, domains: updatedDomains });
  };

  const handleRemoveProject = async (projectId: string) => {
    if (!profile?._id) return;

    try {
      const updatedProjects = (profile.projects || []).filter(
        (project: any) => project._id !== projectId,
      );

      // Transform the data to match backend schema
      const updatePayload = transformProfileForAPI({
        ...profile,
        projects: updatedProjects,
      });

      await axiosInstance.put(
        `/freelancer/profile/${profile._id}`,
        updatePayload,
      );

      toast({
        title: 'Success',
        description: 'Project removed from profile successfully',
      });
      fetchProfile();
    } catch (error: any) {
      console.error('Error removing project:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove project from profile',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveExperience = async (experienceId: string) => {
    if (!profile?._id) return;

    try {
      const updatedExperiences = (profile.experiences || []).filter(
        (experience: any) => experience._id !== experienceId,
      );

      // Transform the data to match backend schema
      const updatePayload = transformProfileForAPI({
        ...profile,
        experiences: updatedExperiences,
      });

      await axiosInstance.put(
        `/freelancer/profile/${profile._id}`,
        updatePayload,
      );

      toast({
        title: 'Success',
        description: 'Experience removed from profile successfully',
      });
      fetchProfile();
    } catch (error: any) {
      console.error('Error removing experience:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove experience from profile',
        variant: 'destructive',
      });
    }
  };

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setIsProjectDetailsOpen(true);
  };

  const handleCloseProjectDetails = () => {
    setIsProjectDetailsOpen(false);
    setSelectedProject(null);
  };

  const handleDeleteProfile = async () => {
    if (!profile?._id) return;

    try {
      await axiosInstance.delete(`/freelancer/profile/${profile._id}`);
      toast({
        title: 'Profile Deleted',
        description: 'Profile has been successfully deleted.',
      });
      router.push('/freelancer/settings/profiles');
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete profile',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading || !skillsAndDomainsLoaded) {
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
              { label: 'Profiles', link: '/freelancer/settings/profiles' },
              { label: 'Profile Details', link: '#' },
            ]}
          />
          <main className="grid flex-1 items-start sm:px-6 sm:py-0 md:gap-8">
            <div className="text-center py-12">
              <p>Loading profile...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!profile) {
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
              { label: 'Profiles', link: '/freelancer/settings/profiles' },
              { label: 'Profile Details', link: '#' },
            ]}
          />
          <main className="grid flex-1 items-start sm:px-6 sm:py-0 md:gap-8">
            <div className="text-center py-12">
              <p>Profile not found</p>
              <Button
                onClick={() => router.push('/freelancer/settings/profiles')}
                className="mt-4"
              >
                Back to Profiles
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
            { label: 'Profiles', link: '/freelancer/settings/profiles' },
            { label: profile.profileName, link: '#' },
          ]}
        />
        <main className="grid flex-1 items-start sm:px-6 sm:py-0 md:gap-8">
          <div className="space-y-6">
            {/* Back to Profiles Button */}
            <div>
              <Button
                variant="outline"
                onClick={() => router.push('/freelancer/settings/profiles')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Profiles
              </Button>
            </div>

            {/* Profile Header with Actions */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">{profile.profileName}</h1>
                <p className="text-muted-foreground">
                  Edit your professional profile
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={isUpdating}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Name and Hourly Rate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="profileName">Profile Name</Label>
                      <span
                        className={`text-sm ${
                          (editingProfileData.profileName || '').length === 0
                            ? 'text-red-500'
                            : (editingProfileData.profileName || '').length >
                                100
                              ? 'text-red-500'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {(editingProfileData.profileName || '').length}/100
                      </span>
                    </div>
                    <Input
                      id="profileName"
                      value={editingProfileData.profileName || ''}
                      onChange={(e) =>
                        handleInputChange('profileName', e.target.value)
                      }
                      placeholder="e.g., Frontend Developer"
                      className={
                        (editingProfileData.profileName || '').length === 0 ||
                        (editingProfileData.profileName || '').length > 100
                          ? 'border-red-500'
                          : ''
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={editingProfileData.hourlyRate || ''}
                      onChange={(e) =>
                        handleInputChange(
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
                  <div className="flex justify-between items-center">
                    <Label htmlFor="description">Description</Label>
                    <span
                      className={`text-sm ${
                        (editingProfileData.description || '').length < 10
                          ? 'text-red-500'
                          : (editingProfileData.description || '').length > 500
                            ? 'text-red-500'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {(editingProfileData.description || '').length}/500 (min:
                      10)
                    </span>
                  </div>
                  <Textarea
                    id="description"
                    value={editingProfileData.description || ''}
                    onChange={(e) =>
                      handleInputChange('description', e.target.value)
                    }
                    placeholder="Describe your expertise and experience... (minimum 10 characters)"
                    rows={4}
                    className={
                      (editingProfileData.description || '').length < 10 ||
                      (editingProfileData.description || '').length > 500
                        ? 'border-red-500'
                        : ''
                    }
                  />
                </div>

                <Separator />

                {/* Skills and Domains */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex items-center mt-2">
                      <Select
                        onValueChange={(value) => {
                          setTmpSkill(value);
                          setSearchQuery('');
                        }}
                        value={tmpSkill || ''}
                        onOpenChange={(open) => {
                          if (!open) setSearchQuery('');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={tmpSkill ? tmpSkill : 'Select skill'}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Add search input */}
                          <div className="p-2 relative">
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="Search skills"
                            />
                            {searchQuery && (
                              <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white text-xl transition-colors mr-2"
                              >
                                ×
                              </button>
                            )}
                          </div>
                          {/* Filtered skill list */}
                          {skillsOptions &&
                            skillsOptions.length > 0 &&
                            skillsOptions
                              .filter((skill: any) => {
                                const skillName =
                                  skill.name || skill.label || skill.skillName;
                                if (!skillName) return false;

                                const matchesSearch = skillName
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase());

                                const isAlreadySelected = profile?.skills?.some(
                                  (s: any) => {
                                    const existingSkillId =
                                      typeof s === 'string'
                                        ? s
                                        : s.skillId || s._id || s.id || s.name;
                                    const currentSkillId =
                                      skill.skillId ||
                                      skill._id ||
                                      skill.id ||
                                      skill.name;
                                    return existingSkillId === currentSkillId;
                                  },
                                );

                                return matchesSearch && !isAlreadySelected;
                              })
                              .map((skill: any, index: number) => (
                                <SelectItem
                                  key={
                                    skill.skillId ||
                                    skill._id ||
                                    skill.id ||
                                    index
                                  }
                                  value={
                                    skill.name || skill.label || skill.skillName
                                  }
                                >
                                  {skill.name || skill.label || skill.skillName}
                                </SelectItem>
                              ))}
                          {/* No matching skills */}
                          {skillsOptions &&
                            skillsOptions.length > 0 &&
                            skillsOptions.filter((skill: any) => {
                              const skillName =
                                skill.name || skill.label || skill.skillName;
                              if (!skillName) return false;

                              const matchesSearch = skillName
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase());

                              const isAlreadySelected = profile?.skills?.some(
                                (s: any) => {
                                  const existingSkillId =
                                    typeof s === 'string'
                                      ? s
                                      : s.skillId || s._id || s.id || s.name;
                                  const currentSkillId =
                                    skill.skillId ||
                                    skill._id ||
                                    skill.id ||
                                    skill.name;
                                  return existingSkillId === currentSkillId;
                                },
                              );

                              return matchesSearch && !isAlreadySelected;
                            }).length === 0 && (
                              <div className="p-2 text-gray-500 italic text-center">
                                No matching skills
                              </div>
                            )}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        type="button"
                        size="icon"
                        className="ml-2"
                        disabled={!tmpSkill}
                        onClick={() => {
                          handleAddSkill();
                          setTmpSkill('');
                          setSearchQuery('');
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-5">
                      {profile.skills && profile.skills.length > 0 ? (
                        profile.skills.map((skill: any, index: number) => {
                          const skillId =
                            typeof skill === 'string'
                              ? skill
                              : skill.skillId ||
                                skill._id ||
                                skill.id ||
                                skill.name;
                          const skillName = getSkillNameById(skillId);

                          return (
                            <Badge
                              key={index}
                              className="uppercase text-xs font-normal bg-gray-300 flex items-center px-2 py-1"
                            >
                              {skillName}
                              <X
                                className="ml-2 h-3 w-3 cursor-pointer"
                                onClick={() => handleDeleteSkill(skillId)}
                              />
                            </Badge>
                          );
                        })
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No skills selected
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Domains</Label>
                    <div className="flex items-center mt-2">
                      <Select
                        onValueChange={(value) => {
                          setTmpDomain(value);
                          setSearchQuery('');
                        }}
                        value={tmpDomain || ''}
                        onOpenChange={(open) => {
                          if (!open) setSearchQuery('');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              tmpDomain ? tmpDomain : 'Select domain'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Add search input */}
                          <div className="p-2 relative">
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="Search domains"
                            />
                            {searchQuery && (
                              <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white text-xl transition-colors mr-2"
                              >
                                ×
                              </button>
                            )}
                          </div>
                          {/* Filtered domain list */}
                          {domainsOptions &&
                            domainsOptions.length > 0 &&
                            domainsOptions
                              .filter((domain: any) => {
                                const domainName =
                                  domain.name ||
                                  domain.label ||
                                  domain.domainName;
                                if (!domainName) return false;

                                const matchesSearch = domainName
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase());

                                const isAlreadySelected =
                                  profile?.domains?.some((d: any) => {
                                    const existingDomainId =
                                      typeof d === 'string'
                                        ? d
                                        : d.domainId || d._id || d.id || d.name;
                                    const currentDomainId =
                                      domain.domainId ||
                                      domain._id ||
                                      domain.id ||
                                      domain.name;
                                    return existingDomainId === currentDomainId;
                                  });

                                return matchesSearch && !isAlreadySelected;
                              })
                              .map((domain: any, index: number) => (
                                <SelectItem
                                  key={
                                    domain.domainId ||
                                    domain._id ||
                                    domain.id ||
                                    index
                                  }
                                  value={
                                    domain.name ||
                                    domain.label ||
                                    domain.domainName
                                  }
                                >
                                  {domain.name ||
                                    domain.label ||
                                    domain.domainName}
                                </SelectItem>
                              ))}
                          {/* No matching domains */}
                          {domainsOptions &&
                            domainsOptions.length > 0 &&
                            domainsOptions.filter((domain: any) => {
                              const domainName =
                                domain.name ||
                                domain.label ||
                                domain.domainName;
                              if (!domainName) return false;

                              const matchesSearch = domainName
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase());

                              const isAlreadySelected = profile?.domains?.some(
                                (d: any) => {
                                  const existingDomainId =
                                    typeof d === 'string'
                                      ? d
                                      : d.domainId || d._id || d.id || d.name;
                                  const currentDomainId =
                                    domain.domainId ||
                                    domain._id ||
                                    domain.id ||
                                    domain.name;
                                  return existingDomainId === currentDomainId;
                                },
                              );

                              return matchesSearch && !isAlreadySelected;
                            }).length === 0 && (
                              <div className="p-2 text-gray-500 italic text-center">
                                No matching domains
                              </div>
                            )}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        type="button"
                        size="icon"
                        className="ml-2"
                        disabled={!tmpDomain}
                        onClick={() => {
                          handleAddDomain();
                          setTmpDomain('');
                          setSearchQuery('');
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-5">
                      {profile.domains && profile.domains.length > 0 ? (
                        profile.domains.map((domain: any, index: number) => {
                          const domainId =
                            typeof domain === 'string'
                              ? domain
                              : domain.domainId ||
                                domain._id ||
                                domain.id ||
                                domain.name;
                          const domainName = getDomainNameById(domainId);

                          return (
                            <Badge
                              key={index}
                              className="uppercase text-xs font-normal bg-gray-300 flex items-center px-2 py-1"
                            >
                              {domainName}
                              <X
                                className="ml-2 h-3 w-3 cursor-pointer"
                                onClick={() => handleDeleteDomain(domainId)}
                              />
                            </Badge>
                          );
                        })
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No domains selected
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="githubLink">GitHub Link</Label>
                    <Input
                      id="githubLink"
                      value={editingProfileData.githubLink || ''}
                      onChange={(e) =>
                        handleInputChange('githubLink', e.target.value)
                      }
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedinLink">LinkedIn Link</Label>
                    <Input
                      id="linkedinLink"
                      value={editingProfileData.linkedinLink || ''}
                      onChange={(e) =>
                        handleInputChange('linkedinLink', e.target.value)
                      }
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="personalWebsite">Personal Website</Label>
                    <Input
                      id="personalWebsite"
                      value={editingProfileData.personalWebsite || ''}
                      onChange={(e) =>
                        handleInputChange('personalWebsite', e.target.value)
                      }
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability</Label>
                    <Select
                      value={editingProfileData.availability || 'FREELANCE'}
                      onValueChange={(value) =>
                        handleInputChange('availability', value)
                      }
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
              </CardContent>
            </Card>

            {/* Projects Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold">
                    Projects
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setShowProjectDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Projects
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {profile.projects && profile.projects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {profile.projects.map((project: any, index: number) => (
                      <div key={project._id || index} className="relative">
                        <ProjectCard
                          {...project}
                          onClick={() => handleProjectClick(project)}
                        />
                        {/* Remove button overlay */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveProject(project._id);
                          }}
                          className="absolute top-2 right-2 z-10 h-8 w-8 p-0 bg-red-500/80 hover:bg-red-600/90 text-white rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No projects added to this profile
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setShowProjectDialog(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Projects
                    </Button>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Experience Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold">
                    Experience
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setShowExperienceDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Experience
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {profile.experiences && profile.experiences.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.experiences.map(
                      (experience: any, index: number) => (
                        <Card
                          key={experience._id || index}
                          className="p-4 bg-background border"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg mb-1">
                                {experience.jobTitle || experience.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {experience.company}
                              </p>
                              <p className="text-xs text-muted-foreground mb-3">
                                {new Date(
                                  experience.workFrom,
                                ).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                })}{' '}
                                -{' '}
                                {new Date(experience.workTo).toLocaleDateString(
                                  'en-US',
                                  {
                                    year: 'numeric',
                                    month: 'short',
                                  },
                                )}
                              </p>
                              {experience.workDescription && (
                                <p className="text-sm text-foreground">
                                  {experience.workDescription}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveExperience(experience._id)
                              }
                              className="text-destructive hover:text-destructive/80 ml-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ),
                    )}
                  </div>
                ) : (
                  <Card className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No experience added to this profile
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setShowExperienceDialog(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Experience
                    </Button>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Project and Experience Dialogs */}
      <ProjectSelectionDialog
        open={showProjectDialog}
        onOpenChange={setShowProjectDialog}
        freelancerId={user.uid}
        currentProfileId={profileId}
        onSuccess={() => {
          fetchProfile();
        }}
      />

      <ExperienceSelectionDialog
        open={showExperienceDialog}
        onOpenChange={setShowExperienceDialog}
        freelancerId={user.uid}
        currentProfileId={profileId}
        onSuccess={() => {
          fetchProfile();
        }}
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
            <Button variant="destructive" onClick={handleDeleteProfile}>
              Delete Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View-Only Project Details Dialog */}
      {selectedProject && (
        <Dialog
          open={isProjectDetailsOpen}
          onOpenChange={handleCloseProjectDetails}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {selectedProject.projectName}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Project Image */}
              {selectedProject.thumbnail && (
                <div className="w-full">
                  <Image
                    src={selectedProject.thumbnail}
                    alt={`${selectedProject.projectName} thumbnail`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Description</h3>
                    <p className="text-muted-foreground">
                      {selectedProject.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Role</h3>
                    <p className="text-muted-foreground">
                      {selectedProject.role}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Project Type</h3>
                    <Badge variant="outline">
                      {selectedProject.projectType}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Duration</h3>
                    <p className="text-muted-foreground">
                      {new Date(selectedProject.start).toLocaleDateString()} -{' '}
                      {new Date(selectedProject.end).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Technologies Used
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.techUsed?.map(
                        (tech: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {tech}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Links</h3>
                    <div className="space-y-2">
                      {selectedProject.githubLink && (
                        <a
                          href={selectedProject.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                        >
                          GitHub Repository
                        </a>
                      )}
                      {selectedProject.liveDemoLink && (
                        <a
                          href={selectedProject.liveDemoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                        >
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
