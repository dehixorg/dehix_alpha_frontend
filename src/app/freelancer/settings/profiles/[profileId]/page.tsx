'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import {
  Plus,
  X,
  Save,
  ArrowLeft,
  Trash2,
  Pencil,
  User,
  DollarSign,
  FileText,
  Linkedin,
  Globe2,
  Tags,
  Layers,
  Github,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { RootState } from '@/lib/store';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';
import Header from '@/components/header/header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

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
      setIsEditMode(false);
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

  const handleCancelEdit = () => {
    // Revert form state to the last loaded profile and exit edit mode
    if (profile) {
      setEditingProfileData(profile);
    }
    setIsEditMode(false);
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
        <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8">
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
            <div className="grid w-full gap-4 py-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-80" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-36 w-full" />
                    <Skeleton className="h-36 w-full" />
                    <Skeleton className="h-36 w-full" />
                  </div>
                </CardContent>
              </Card>
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
        <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8">
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
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-2 md:gap-8">
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
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8">
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
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-2 md:gap-8">
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

            {!isEditMode && (
              <Alert className="bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-300">
                <AlertTitle className="font-semibold">View mode</AlertTitle>
                <AlertDescription>
                  You are viewing your profile. Click the{' '}
                  <span className="font-medium">Edit</span> button to make
                  changes.
                </AlertDescription>
              </Alert>
            )}

            <Card className="bg-gradient-to-r from-primary/5 to-background shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold">
                        {editingProfileData.profileName || 'Untitled Profile'}
                      </h1>
                      {!isEditMode && (
                        <Badge variant="secondary">
                          {editingProfileData.profileType === 'Consultant'
                            ? 'Consultant'
                            : 'Freelancer'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      {isEditMode
                        ? 'Edit your professional profile'
                        : 'Viewing your professional profile'}
                    </p>

                    {!isEditMode && (
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        {editingProfileData.githubLink && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <a
                                    href={editingProfileData.githubLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Github className="h-4 w-4" />
                                    <span className="hidden md:inline">
                                      {' '}
                                      GitHub
                                    </span>
                                  </a>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Open GitHub</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {editingProfileData.linkedinLink && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <a
                                    href={editingProfileData.linkedinLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Linkedin className="h-4 w-4" />
                                    <span className="hidden md:inline">
                                      {' '}
                                      LinkedIn
                                    </span>
                                  </a>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Open LinkedIn</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {editingProfileData.personalWebsite && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <a
                                    href={editingProfileData.personalWebsite}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Globe2 className="h-4 w-4" />
                                    <span className="hidden md:inline">
                                      {' '}
                                      Website
                                    </span>
                                  </a>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Open Website</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 md:flex-none">
                    {isEditMode ? (
                      <>
                        <Button
                          onClick={handleUpdateProfile}
                          disabled={isUpdating}
                          className="flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {isUpdating ? 'Updating...' : 'Save Changes'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="flex items-center gap-2"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="default"
                          onClick={() => setIsEditMode(true)}
                          className="flex items-center gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => setDeleteDialogOpen(true)}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted-foreground/20 dark:bg-muted/20">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Your headline, summary, and basic details clients will see.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {isEditMode ? (
                      <>
                        <div className="flex justify-between items-center">
                          <Label htmlFor="profileName">Profile Name</Label>
                          <span
                            className={`text-sm ${
                              (editingProfileData.profileName || '').length >
                              100
                                ? 'text-red-500'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {(editingProfileData.profileName || '').length}/100
                          </span>
                        </div>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="profileName"
                            value={editingProfileData.profileName || ''}
                            onChange={(e) =>
                              handleInputChange('profileName', e.target.value)
                            }
                            placeholder="e.g., Frontend Developer"
                            className={`pl-9 ${
                              (editingProfileData.profileName || '').length >
                              100
                                ? 'border-red-500'
                                : ''
                            }`}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Keep it short and specific. Example: Senior React
                          Engineer.
                        </p>
                      </>
                    ) : (
                      <>
                        <Label>Profile Name</Label>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <p className="text-lg font-medium">
                            {editingProfileData.profileName &&
                            editingProfileData.profileName.trim().length > 0
                              ? editingProfileData.profileName
                              : 'Untitled Profile'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="space-y-2">
                    {isEditMode ? (
                      <>
                        <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="hourlyRate"
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="1"
                            value={editingProfileData.hourlyRate || ''}
                            onChange={(e) =>
                              handleInputChange(
                                'hourlyRate',
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            placeholder="50"
                            className="pl-9"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          You can adjust pricing per project. Keep it
                          competitive.
                        </p>
                      </>
                    ) : (
                      <>
                        <Label>Hourly Rate ($)</Label>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <p className="text-lg font-medium">
                            {editingProfileData.hourlyRate
                              ? `$${editingProfileData.hourlyRate}/hr`
                              : 'Not specified'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {isEditMode ? (
                    <>
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
                      <p className="text-xs text-muted-foreground">
                        Summarize your strengths, recent achievements, and the
                        value you bring.
                      </p>
                    </>
                  ) : (
                    <>
                      <Label>Description</Label>
                      {editingProfileData.description &&
                      editingProfileData.description.trim().length > 0 ? (
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                          <p className="text-muted-foreground whitespace-pre-line">
                            {editingProfileData.description}
                          </p>
                        </div>
                      ) : (
                        <Card className="mt-2 bg-muted/30">
                          <CardContent className="py-6 flex items-center gap-3">
                            <svg
                              width="28"
                              height="28"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="opacity-60"
                            >
                              <path
                                d="M4 5H20V19H4V5Z"
                                stroke="#9CA3AF"
                                strokeWidth="1.5"
                              />
                              <path
                                d="M7 9H17"
                                stroke="#9CA3AF"
                                strokeWidth="1.5"
                              />
                              <path
                                d="M7 13H14"
                                stroke="#9CA3AF"
                                strokeWidth="1.5"
                              />
                            </svg>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                No description yet.
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Use Edit to add a short summary that highlights
                                your strengths.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Tags className="h-4 w-4 text-muted-foreground" /> Skills
                    </Label>
                    {isEditMode ? (
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
                                  !editingProfileData.skills?.includes(
                                    skill._id,
                                  ),
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
                    ) : null}
                    <div className="flex flex-wrap gap-2 mt-5">
                      {editingProfileData.skills?.length > 0 ? (
                        editingProfileData.skills.map(
                          (skillId: string, index: number) => (
                            <Badge
                              key={index}
                              className="uppercase text-xs font-normal bg-gray-300 flex items-center px-2 py-1"
                            >
                              {getSkillNameById(skillId)}
                              {isEditMode ? (
                                <X
                                  className="ml-2 h-3 w-3 cursor-pointer"
                                  onClick={() => handleDeleteSkill(skillId)}
                                />
                              ) : null}
                            </Badge>
                          ),
                        )
                      ) : (
                        <Card className="w-full bg-muted/30">
                          <CardContent className="py-6 flex items-center gap-3">
                            <svg
                              width="28"
                              height="28"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="opacity-60"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="8"
                                stroke="#9CA3AF"
                                strokeWidth="1.5"
                              />
                              <path
                                d="M8 12H16"
                                stroke="#9CA3AF"
                                strokeWidth="1.5"
                              />
                              <path
                                d="M12 8V16"
                                stroke="#9CA3AF"
                                strokeWidth="1.5"
                              />
                            </svg>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                No skills added yet.
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Use Edit to add relevant skills you actively
                                use.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />{' '}
                      Domains
                    </Label>
                    {isEditMode ? (
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
                    ) : null}
                    <div className="flex flex-wrap gap-2 mt-5">
                      {editingProfileData.domains?.length > 0 ? (
                        editingProfileData.domains.map(
                          (domainId: string, index: number) => (
                            <Badge
                              key={index}
                              className="uppercase text-xs font-normal bg-gray-300 flex items-center px-2 py-1"
                            >
                              {getDomainNameById(domainId)}
                              {isEditMode ? (
                                <X
                                  className="ml-2 h-3 w-3 cursor-pointer"
                                  onClick={() => handleDeleteDomain(domainId)}
                                />
                              ) : null}
                            </Badge>
                          ),
                        )
                      ) : (
                        <Card className="w-full bg-muted/30">
                          <CardContent className="py-6 flex items-center gap-3">
                            <svg
                              width="28"
                              height="28"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="opacity-60"
                            >
                              <rect
                                x="5"
                                y="5"
                                width="14"
                                height="14"
                                stroke="#9CA3AF"
                                strokeWidth="1.5"
                              />
                              <path
                                d="M5 12H19"
                                stroke="#9CA3AF"
                                strokeWidth="1.5"
                              />
                            </svg>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                No domains added yet.
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Use Edit to add the industries or areas you
                                focus on.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>

                {isEditMode && <Separator />}

                <div className="flex flex-1 gap-4">
                  <div className="space-y-2">
                    {isEditMode ? (
                      <>
                        <Label
                          htmlFor="githubLink"
                          className="flex items-center gap-2"
                        >
                          <Github className="h-4 w-4 text-muted-foreground" />{' '}
                          GitHub
                        </Label>

                        <div className="relative">
                          <Input
                            id="githubLink"
                            value={editingProfileData.githubLink || ''}
                            onChange={(e) =>
                              handleInputChange('githubLink', e.target.value)
                            }
                            placeholder="https://github.com/username"
                          />
                        </div>
                      </>
                    ) : editingProfileData.githubLink ? (
                      <></>
                    ) : (
                      <Card className="bg-muted/30">
                        <CardContent className="py-4 flex items-center gap-3">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="opacity-60"
                          >
                            <path
                              d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.838 21.489C9.338 21.58 9.52 21.27 9.52 21.004C9.52 20.77 9.511 20.147 9.506 19.31C6.73 19.918 6.048 17.98 6.048 17.98C5.594 16.836 4.882 16.533 4.882 16.533C3.873 15.846 4.958 15.86 4.958 15.86C6.067 15.937 6.652 16.999 6.652 16.999C7.646 18.701 9.364 18.207 10.049 17.954C10.141 17.254 10.43 16.78 10.75 16.518C8.58 16.253 6.3 15.403 6.3 11.657C6.3 10.572 6.68 9.694 7.332 9.01C7.226 8.744 6.894 7.796 7.432 6.478C7.432 6.478 8.265 6.193 9.5 7.258C10.29 7.04 11.14 6.93 11.99 6.926C12.84 6.93 13.69 7.04 14.48 7.258C15.715 6.193 16.548 6.478 16.548 6.478C17.086 7.796 16.754 8.744 16.648 9.01C17.3 9.694 17.68 10.572 17.68 11.657C17.68 15.413 15.398 16.251 13.224 16.512C13.62 16.842 13.966 17.478 13.966 18.452C13.966 19.874 13.952 20.735 13.952 21.002C13.952 21.27 14.13 21.584 14.638 21.49C18.613 20.165 21.48 16.417 21.48 12C21.48 6.477 17.003 2 12 2Z"
                              stroke="#9CA3AF"
                              strokeWidth="1.2"
                            />
                          </svg>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              No GitHub link
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Share your repositories to boost credibility.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  <div className="space-y-2">
                    {isEditMode ? (
                      <>
                        <Label
                          htmlFor="linkedinLink"
                          className="flex items-center gap-2"
                        >
                          <Linkedin className="h-4 w-4 text-muted-foreground" />{' '}
                          LinkedIn
                        </Label>

                        <div className="relative">
                          <Input
                            id="linkedinLink"
                            value={editingProfileData.linkedinLink || ''}
                            onChange={(e) =>
                              handleInputChange('linkedinLink', e.target.value)
                            }
                            placeholder="https://linkedin.com/in/username"
                          />
                        </div>
                      </>
                    ) : editingProfileData.linkedinLink ? (
                      <></>
                    ) : (
                      <Card className="bg-muted/30">
                        <CardContent className="py-4 flex items-center gap-3">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="opacity-60"
                          >
                            <rect
                              x="3"
                              y="3"
                              width="18"
                              height="18"
                              rx="2"
                              stroke="#9CA3AF"
                              strokeWidth="1.2"
                            />
                            <path
                              d="M7 10V17"
                              stroke="#9CA3AF"
                              strokeWidth="1.2"
                            />
                            <circle cx="7" cy="7" r="1" fill="#9CA3AF" />
                          </svg>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              No LinkedIn link
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Add LinkedIn to help clients learn more about you.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  <div className="space-y-2">
                    {isEditMode ? (
                      <>
                        <Label
                          htmlFor="personalWebsite"
                          className="flex items-center gap-2"
                        >
                          <Globe2 className="h-4 w-4 text-muted-foreground" />{' '}
                          Website
                        </Label>

                        <div className="relative">
                          <Input
                            id="personalWebsite"
                            value={editingProfileData.personalWebsite || ''}
                            onChange={(e) =>
                              handleInputChange(
                                'personalWebsite',
                                e.target.value,
                              )
                            }
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                      </>
                    ) : editingProfileData.personalWebsite ? (
                      <></>
                    ) : (
                      <Card className="bg-muted/30">
                        <CardContent className="py-4 flex items-center gap-3">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="opacity-60"
                          >
                            <path
                              d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z"
                              stroke="#9CA3AF"
                              strokeWidth="1.2"
                            />
                            <path
                              d="M2 12H22"
                              stroke="#9CA3AF"
                              strokeWidth="1.2"
                            />
                            <path
                              d="M12 2C9 5.5 9 18.5 12 22C15 18.5 15 5.5 12 2Z"
                              stroke="#9CA3AF"
                              strokeWidth="1.2"
                            />
                          </svg>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              No website
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Add your portfolio or personal site link.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  <div className="space-y-2">
                    {isEditMode && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted-foreground/20 dark:bg-muted/20">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold">
                    Projects
                  </CardTitle>
                  <p className="text-sm text-muted-foreground hidden md:block">
                    Showcase the work you are proud of.
                  </p>
                  {isEditMode ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowProjectDialog(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Projects
                    </Button>
                  ) : null}
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
                          {isEditMode ? (
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
                          ) : null}
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <Card className="flex flex-col items-center justify-center py-12">
                    <div className="mb-4 opacity-70">
                      <svg
                        width="72"
                        height="72"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="14"
                          rx="2"
                          stroke="#9CA3AF"
                          strokeWidth="1.5"
                        />
                        <path d="M3 9H21" stroke="#9CA3AF" strokeWidth="1.5" />
                        <circle cx="7" cy="7" r="1" fill="#9CA3AF" />
                        <circle cx="10" cy="7" r="1" fill="#9CA3AF" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      No projects added to this profile yet
                    </p>
                    {isEditMode ? (
                      <Button
                        variant="outline"
                        onClick={() => setShowProjectDialog(true)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Projects
                      </Button>
                    ) : null}
                  </Card>
                )}
              </CardContent>
            </Card>

            <Card className="bg-muted-foreground/20 dark:bg-muted/20">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold">
                    Experience
                  </CardTitle>
                  <p className="text-sm text-muted-foreground hidden md:block">
                    Relevant roles and responsibilities you have handled.
                  </p>
                  {isEditMode ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowExperienceDialog(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Experience
                    </Button>
                  ) : null}
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
                            {isEditMode ? (
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
                            ) : null}
                          </div>
                        </Card>
                      ),
                    )}
                  </div>
                ) : (
                  <Card className="flex flex-col items-center justify-center py-12">
                    <div className="mb-4 opacity-70">
                      <svg
                        width="72"
                        height="72"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 7H18V17C18 18.105 17.105 19 16 19H8C6.895 19 6 18.105 6 17V7Z"
                          stroke="#9CA3AF"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M9 7V5C9 3.895 9.895 3 11 3H13C14.105 3 15 3.895 15 5V7"
                          stroke="#9CA3AF"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      No experience added to this profile yet
                    </p>
                    {isEditMode ? (
                      <Button
                        variant="outline"
                        onClick={() => setShowExperienceDialog(true)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Experience
                      </Button>
                    ) : null}
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
