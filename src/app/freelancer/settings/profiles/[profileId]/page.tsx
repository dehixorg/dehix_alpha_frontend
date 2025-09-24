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
  const [, setFreelancerProjects] = useState<any>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isProjectDetailsOpen, setIsProjectDetailsOpen] = useState(false);
  const [tmpSkill, setTmpSkill] = useState<string>('');
  const [tmpDomain, setTmpDomain] = useState<string>('');

  useEffect(() => {
    if (profileId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          await fetchSkillsAndDomains();
          await fetchProfile();
          await fetchFreelancerProjects();
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [profileId]);

  const getSkillNameById = (skillId: string) => {
    if (!skillId || !skillsOptions || skillsOptions.length === 0) {
      return skillId || '';
    }
    const skill = skillsOptions.find((s: any) => s._id === skillId);
    return skill ? skill.label || skill.name : skillId;
  };

  const getDomainNameById = (domainId: string) => {
    if (!domainId || !domainsOptions || domainsOptions.length === 0) {
      return domainId || '';
    }
    const domain = domainsOptions.find((d: any) => d._id === domainId);
    return domain ? domain.label || domain.name : domainId;
  };

  const transformProfileForAPI = (profileData: any) => {
    const transformedSkills =
      profileData.skills?.map((skill: any) => {
        if (typeof skill === 'string') {
          return skill;
        }
        return skill._id;
      }) || [];

    const transformedDomains =
      profileData.domains?.map((domain: any) => {
        if (typeof domain === 'string') {
          return domain;
        }
        return domain._id;
      }) || [];

    return {
      ...profileData,
      skills: transformedSkills,
      domains: transformedDomains,
    };
  };

  const fetchProfile = async () => {
    if (!profileId) return;

    try {
      const response = await axiosInstance.get(
        `/freelancer/profile/${profileId}`,
      );
      const profileData = response.data.data;

      if (profileData.projects && profileData.projects.length > 0) {
        try {
          const freelancerResponse = await axiosInstance.get(
            `/freelancer/${user.uid}`,
          );
          const freelancerData = freelancerResponse.data.data || {};
          const freelancerProjects = freelancerData.projects || {};

          const allFreelancerProjects = Array.isArray(freelancerProjects)
            ? freelancerProjects
            : Object.values(freelancerProjects);

          const enrichedProjects = profileData.projects.map(
            (profileProject: any) => {
              const fullProject = allFreelancerProjects.find(
                (fp: any) => fp._id === profileProject._id,
              );
              return fullProject || profileProject;
            },
          );

          profileData.projects = enrichedProjects;
        } catch (projectError) {
          console.warn('Could not fetch complete project data:', projectError);
        }
      }

      const processedProfileData = {
        ...profileData,
        skills: (profileData.skills || []).map((s: any) =>
          typeof s === 'string' ? s : s._id,
        ),
        domains: (profileData.domains || []).map((d: any) =>
          typeof d === 'string' ? d : d._id,
        ),
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
    }
  };

  const fetchSkillsAndDomains = async () => {
    try {
      const [skillsResponse, domainsResponse, freelancerResponse] =
        await Promise.all([
          axiosInstance.get('/skills'),
          axiosInstance.get('/domain'), // Corrected endpoint
          axiosInstance.get(`/freelancer/${user.uid}`),
        ]);

      const allSkills = skillsResponse.data.data || [];
      const allDomains = domainsResponse.data.data || [];
      const freelancerData = freelancerResponse.data.data || {};

      const freelancerSkillNames = (freelancerData.skills || [])
        .map((s: any) => s.name || s.label)
        .filter(Boolean);

      const freelancerDomainNames = (freelancerData.domain || [])
        .map((d: any) => d.name || d.label)
        .filter(Boolean);

      const skillsForOptions = allSkills.filter((s: any) =>
        freelancerSkillNames.includes(s.label || s.name),
      );
      const domainsForOptions = allDomains.filter((d: any) =>
        freelancerDomainNames.includes(d.label || d.name),
      );

      setSkillsOptions(skillsForOptions);
      setDomainsOptions(domainsForOptions);

      setSkillsAndDomainsLoaded(true);
    } catch (error) {
      console.error('Error fetching skills and domains:', error);
      toast({
        title: 'Error',
        description:
          'Could not load skills and domains. Please ensure you have added skills to your main profile.',
        variant: 'destructive',
      });
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

    setIsUpdating(true);
    try {
      const updatePayload = transformProfileForAPI(editingProfileData);

      await axiosInstance.put(
        `/freelancer/profile/${profile._id}`,
        updatePayload,
      );

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      await fetchProfile();
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
    if (!tmpSkill || !editingProfileData) return;

    const selectedSkill = skillsOptions.find(
      (skill: any) => (skill.label || skill.name) === tmpSkill,
    );

    if (selectedSkill) {
      const skillIdToAdd = selectedSkill._id;

      const isAlreadyAdded = (editingProfileData.skills || []).includes(
        skillIdToAdd,
      );

      if (!isAlreadyAdded) {
        const updatedSkills = [
          ...(editingProfileData.skills || []),
          skillIdToAdd,
        ];
        setEditingProfileData((prev: any) => ({
          ...prev,
          skills: updatedSkills,
        }));
      }
      setTmpSkill('');
    }
  };

  const handleAddDomain = () => {
    if (!tmpDomain || !editingProfileData) return;

    const selectedDomain = domainsOptions.find(
      (domain: any) => (domain.label || domain.name) === tmpDomain,
    );

    if (selectedDomain) {
      const domainIdToAdd = selectedDomain._id;

      const isAlreadyAdded = (editingProfileData.domains || []).includes(
        domainIdToAdd,
      );

      if (!isAlreadyAdded) {
        const updatedDomains = [
          ...(editingProfileData.domains || []),
          domainIdToAdd,
        ];
        setEditingProfileData((prev: any) => ({
          ...prev,
          domains: updatedDomains,
        }));
      }
      setTmpDomain('');
    }
  };

  const handleDeleteSkill = (skillIdToDelete: string) => {
    if (!editingProfileData || !editingProfileData.skills) return;

    const updatedSkills = editingProfileData.skills.filter(
      (id: string) => id !== skillIdToDelete,
    );
    setEditingProfileData((prev: any) => ({ ...prev, skills: updatedSkills }));
  };

  const handleDeleteDomain = (domainIdToDelete: string) => {
    if (!editingProfileData || !editingProfileData.domains) return;

    const updatedDomains = editingProfileData.domains.filter(
      (id: string) => id !== domainIdToDelete,
    );
    setEditingProfileData((prev: any) => ({
      ...prev,
      domains: updatedDomains,
    }));
  };

  const handleRemoveProject = async (projectId: string) => {
    if (!profile?._id) return;

    try {
      const updatedProjects = (editingProfileData.projects || []).filter(
        (project: any) => project._id !== projectId,
      );

      setEditingProfileData((prev: any) => ({
        ...prev,
        projects: updatedProjects,
      }));

      const updatePayload = transformProfileForAPI({
        ...editingProfileData,
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
      await fetchProfile();
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
      const updatedExperiences = (editingProfileData.experiences || []).filter(
        (experience: any) => experience._id !== experienceId,
      );

      setEditingProfileData((prev: any) => ({
        ...prev,
        experiences: updatedExperiences,
      }));

      const updatePayload = transformProfileForAPI({
        ...editingProfileData,
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
      await fetchProfile();
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
      <div className="flex min-h-screen w-full flex-col">
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
    <div className="flex min-h-screen w-full flex-col">
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
            { label: editingProfileData.profileName, link: '#' },
          ]}
        />
        <main className="grid flex-1 items-start sm:px-6 sm:py-0 md:gap-8">
          <div className="space-y-6">
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

            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">
                  {editingProfileData.profileName}
                </h1>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="profileName">Profile Name</Label>
                      <span
                        className={`text-sm ${
                          (editingProfileData.profileName || '').length > 100
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

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="description">Description</Label>
                    <span
                      className={`text-sm ${
                        (editingProfileData.description || '').length > 500
                          ? 'text-red-500'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {(editingProfileData.description || '').length}/500
                    </span>
                  </div>
                  <Textarea
                    id="description"
                    value={editingProfileData.description || ''}
                    onChange={(e) =>
                      handleInputChange('description', e.target.value)
                    }
                    placeholder="Describe your expertise and experience..."
                    rows={4}
                    className={
                      (editingProfileData.description || '').length > 500
                        ? 'border-red-500'
                        : ''
                    }
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex items-center mt-2">
                      <Select
                        onValueChange={(value) => setTmpSkill(value)}
                        value={tmpSkill || ''}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select skill" />
                        </SelectTrigger>
                        <SelectContent>
                          {skillsOptions
                            .filter(
                              (skill: any) =>
                                !editingProfileData.skills?.includes(skill._id),
                            )
                            .map((skill: any) => (
                              <SelectItem
                                key={skill._id}
                                value={skill.label || skill.name}
                              >
                                {skill.label || skill.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        type="button"
                        size="icon"
                        className="ml-2"
                        disabled={!tmpSkill}
                        onClick={handleAddSkill}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-5">
                      {editingProfileData.skills?.length > 0 ? (
                        editingProfileData.skills.map(
                          (skillId: string, index: number) => (
                            <Badge
                              key={index}
                              className="uppercase text-xs font-normal bg-gray-300 flex items-center px-2 py-1"
                            >
                              {getSkillNameById(skillId)}
                              <X
                                className="ml-2 h-3 w-3 cursor-pointer"
                                onClick={() => handleDeleteSkill(skillId)}
                              />
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
                    <div className="flex items-center mt-2">
                      <Select
                        onValueChange={(value) => setTmpDomain(value)}
                        value={tmpDomain || ''}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {domainsOptions
                            .filter(
                              (domain: any) =>
                                !editingProfileData.domains?.includes(
                                  domain._id,
                                ),
                            )
                            .map((domain: any) => (
                              <SelectItem
                                key={domain._id}
                                value={domain.label || domain.name}
                              >
                                {domain.label || domain.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        type="button"
                        size="icon"
                        className="ml-2"
                        disabled={!tmpDomain}
                        onClick={handleAddDomain}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-5">
                      {editingProfileData.domains?.length > 0 ? (
                        editingProfileData.domains.map(
                          (domainId: string, index: number) => (
                            <Badge
                              key={index}
                              className="uppercase text-xs font-normal bg-gray-300 flex items-center px-2 py-1"
                            >
                              {getDomainNameById(domainId)}
                              <X
                                className="ml-2 h-3 w-3 cursor-pointer"
                                onClick={() => handleDeleteDomain(domainId)}
                              />
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

                <Separator />

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
                {editingProfileData.projects &&
                editingProfileData.projects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {editingProfileData.projects.map(
                      (project: any, index: number) => (
                        <div key={project._id || index} className="relative">
                          <ProjectCard
                            {...project}
                            onClick={() => handleProjectClick(project)}
                          />
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
                      ),
                    )}
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
                {editingProfileData.experiences &&
                editingProfileData.experiences.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {editingProfileData.experiences.map(
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
              {selectedProject.thumbnail && (
                <div className="w-full">
                  <Image
                    src={selectedProject.thumbnail}
                    alt={`${selectedProject.projectName} thumbnail`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

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
