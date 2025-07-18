'use client';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
import { Plus, X, Save, ArrowLeft, Trash2, Info } from 'lucide-react';
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

// Add these imports at the top
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList, // Add this if using newer versions
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfileDetailPage() {
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const params = useParams();
  const profileId = params.profileId as string;

  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingProfileData, setEditingProfileData] = useState<any>({});
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showExperienceDialog, setShowExperienceDialog] = useState(false);
  const [freelancerProjects, setFreelancerProjects] = useState<any>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [skillsOpen, setSkillsOpen] = useState(false);
const [domainsOpen, setDomainsOpen] = useState(false);
const [skillsOptions, setSkillsOptions] = useState<any[]>([]);
const [domainsOptions, setDomainsOptions] = useState<any[]>([]);
const [selectedSkills, setSelectedSkills] = useState<any[]>([]);
const [selectedDomains, setSelectedDomains] = useState<any[]>([]);

  useEffect(() => {
    if (profileId) {
      fetchProfile();
      fetchSkillsAndDomains();
      fetchFreelancerProjects();
    }
  }, [profileId, user.uid]);

  useEffect(() => {
  if (profile) {
    setSelectedSkills(profile.skills || []);
    setSelectedDomains(profile.domains || []);
    
    // Ensure editingProfileData has the correct format
    setEditingProfileData(prev => ({
      ...prev,
      skills: profile.skills || [],
      domains: profile.domains || []
    }));
  }
}, [profile]);

  const fetchProfile = async () => {
  if (!profileId) return;

  setIsLoading(true);
  try {
    console.log('Fetching profile...', profileId); // Debug log
    const response = await axiosInstance.get(`/freelancer/profile/${profileId}`);
    console.log('Full API response:', response.data); // Debug log
    
    const profileData = response.data.data;
    console.log('Profile data received:', profileData); // Debug log
    
    // Normalize skills from API response
    const normalizedSkills = Array.isArray(profileData.skills) 
      ? profileData.skills.map(skill => {
          const skillObj = { _id: skill, name: skill };
          console.log('Normalized skill:', skill, '->', skillObj); // Debug log
          return skillObj;
        })
      : [];
    
    console.log('Normalized skills:', normalizedSkills); // Debug log
    
    setProfile(profileData);
    setSelectedSkills(normalizedSkills);
    setEditingProfileData({
      ...profileData,
      skills: normalizedSkills
    });
    
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

  const handleSkillSelect = (skill: any) => {
  console.log('Skill selected (raw):', skill); // Debug log
  
  // Convert to object format for UI
  const skillObj = typeof skill === 'string' 
    ? { _id: skill, name: skill }
    : skill;

  console.log('Skill selected (processed):', skillObj); // Debug log

  setSelectedSkills(prev => {
    const isSelected = prev.some(s => 
      (typeof s === 'string' && s === skillObj.name) ||
      (typeof s !== 'string' && s.name === skillObj.name)
    );

    const newSkills = isSelected
      ? prev.filter(s => 
          (typeof s === 'string' ? s : s.name) !== skillObj.name
        )
      : [...prev, skillObj];

    console.log('Updated skills:', newSkills); // Debug log
    
    // Update the editing profile data
    setEditingProfileData(prev => ({
      ...prev,
      skills: newSkills
    }));
    
    return newSkills;
  });
};

const normalizeSkill = (skill: string | any) => {
  if (typeof skill === 'string') {
    return {
      _id: skill,
      name: skill
    };
  }
  return {
    _id: skill._id || Math.random().toString(36).substring(2, 9),
    name: skill.name || skill.label || skill.skillName || 'Unnamed Skill'
  };
};

const handleDomainSelect = (domain: any) => {
  setSelectedDomains(prevDomains => {
    const isSelected = prevDomains.some(d => 
      (typeof d === 'string' && typeof domain === 'string' && d === domain) ||
      (d._id && domain._id && d._id === domain._id) ||
      (d.name && domain.name && d.name === domain.name)
    );

    const newDomains = isSelected 
      ? prevDomains.filter(d => 
          (typeof d === 'string' && typeof domain === 'string' && d !== domain) ||
          (d._id && domain._id && d._id !== domain._id) ||
          (d.name && domain.name && d.name !== domain.name)
        )
      : [...prevDomains, domain];
    
    // Update the editing profile data
    setEditingProfileData(prev => ({
      ...prev,
      domains: newDomains
    }));
    
    return newDomains;
  });
};

  const fetchSkillsAndDomains = async () => {
  try {
    const freelancerResponse = await axiosInstance.get(`/freelancer/${user.uid}`);
    const freelancerData = freelancerResponse.data.data || {};
    
    // Ensure these are always arrays
    setSkillsOptions(Array.isArray(freelancerData.skills) ? freelancerData.skills : []);
    setDomainsOptions(Array.isArray(freelancerData.domain) ? freelancerData.domain : []);
  } catch (error) {
    console.error('Error fetching skills and domains:', error);
    setSkillsOptions([]);
    setDomainsOptions([]);
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

  setIsUpdating(true);
  try {
    // 1. Update skills separately using the dedicated endpoint
    if (selectedSkills.length > 0) {
      await axiosInstance.put(
  `/skill`, // Matches FREELANCER_SKILLS_ADD_BY_ID = "/skill"
  {
    skills: selectedSkills.map(s => typeof s === 'string' ? s : s.name),
    // Include freelancer_id if required by your schema
    freelancer_id: user.uid
  }
);
    }

    // 2. Update other profile fields
    const payload = {
      profileName: editingProfileData.profileName,
      description: editingProfileData.description,
      hourlyRate: editingProfileData.hourlyRate,
      // Include other non-skill/domain fields
    };

    await axiosInstance.put(`/freelancer/profile/${profile._id}`, payload);

    toast({ title: 'Success', description: 'Profile updated' });
    fetchProfile(); // Refresh data
  } catch (error) {
    toast({ title: 'Error', variant: 'destructive' });
  } finally {
    setIsUpdating(false);
  }
};

// Add this normalization function
const normalizeSkills = (skills: any[]) => {
  return skills.map(skill => {
    if (typeof skill === 'string') return skill;
    return skill.name || skill.label || skill.skillName || skill._id || '';
  });
};

  const handleInputChange = (field: string, value: any) => {
    setEditingProfileData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRemoveProject = async (projectId: string) => {
    if (!profile?._id) return;

    try {
      const updatedProjects = (profile.projects || []).filter(
        (project: any) => project._id !== projectId,
      );

      await axiosInstance.put(`/freelancer/profile/${profile._id}`, {
        ...profile,
        projects: updatedProjects,
      });

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

      await axiosInstance.put(`/freelancer/profile/${profile._id}`, {
        ...profile,
        experiences: updatedExperiences,
      });

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

  if (isLoading) {
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
                    <Label htmlFor="profileName">Profile Name</Label>
                    <Input
                      id="profileName"
                      value={editingProfileData.profileName || ''}
                      onChange={(e) =>
                        handleInputChange('profileName', e.target.value)
                      }
                      placeholder="e.g., Frontend Developer"
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingProfileData.description || ''}
                    onChange={(e) =>
                      handleInputChange('description', e.target.value)
                    }
                    placeholder="Describe your expertise and experience..."
                    rows={4}
                  />
                </div>

                <Separator />

                {/* Skills and Domains */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
{/* Skills Selection */}
<div className="space-y-2">
  <Label>Skills</Label>
  <Popover open={skillsOpen} onOpenChange={setSkillsOpen}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={skillsOpen}
        className="w-full justify-between"
      >
        {selectedSkills?.length > 0 
          ? `${selectedSkills.length} skills selected` 
          : "Select skills..."}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-full p-0">
      <Command>
        <CommandInput placeholder="Search skills..." />
        <CommandEmpty>No skills found.</CommandEmpty>
        <CommandList>
          <CommandGroup>
            {skillsOptions?.map((skill) => {
              const skillValue = typeof skill === 'string' ? skill : skill._id || skill.name || skill.label || skill.skillName;
              const skillLabel = typeof skill === 'string' ? skill : skill.name || skill.label || skill.skillName || skill._id;
              
              const isSelected = selectedSkills?.some(s => 
                (typeof s === 'string' && typeof skill === 'string' && s === skill) ||
                (s._id && skill._id && s._id === skill._id) ||
                (s.name && skill.name && s.name === skill.name)
              );

              return (
                <CommandItem
                  key={skillValue}
                  value={skillValue}
                  onSelect={() => handleSkillSelect(skill)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isSelected ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {skillLabel}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
   {/* Existing Skills Badges */}
{/* Skills Badges Display */}
  <div className="flex flex-wrap gap-2 mt-2">
    {selectedSkills?.length > 0 ? (
      selectedSkills.map((skill, index) => {
        const skillName = typeof skill === 'string' ? skill : skill.name;
        return (
          <Badge
            key={skillName || index}
            variant="secondary"
            className="bg-primary text-primary-foreground"
          >
            {skillName}
            <button
              type="button"
              onClick={() => handleSkillSelect(skill)}
              className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })
    ) : (
      <p className="text-muted-foreground text-sm">
        {skillsOptions?.length > 0 
          ? "No skills selected. Click to add some."
          : "No skills available. Add skills to your account first."}
      </p>
    )}
  </div>
</div>

  {/* Domains Selection */}
  <div className="space-y-2">
  <Label>Domains</Label>
  <Popover open={domainsOpen} onOpenChange={setDomainsOpen}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={domainsOpen}
        className="w-full justify-between"
      >
        {selectedDomains?.length > 0 
          ? `${selectedDomains.length} domains selected` 
          : "Select domains..."}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-full p-0">
      <Command>
        <CommandInput placeholder="Search domains..." />
        <CommandEmpty>No domains found.</CommandEmpty>
        <CommandList>
          <CommandGroup>
            {domainsOptions?.map((domain) => {
              const domainValue = typeof domain === 'string' ? domain : domain._id || domain.name || domain.label || domain.domainName;
              const domainLabel = typeof domain === 'string' ? domain : domain.name || domain.label || domain.domainName || domain._id;
              
              const isSelected = selectedDomains?.some(d => 
                (typeof d === 'string' && typeof domain === 'string' && d === domain) ||
                (d._id && domain._id && d._id === domain._id) ||
                (d.name && domain.name && d.name === domain.name)
              );

              return (
                <CommandItem
                  key={domainValue}
                  value={domainValue}
                  onSelect={() => handleDomainSelect(domain)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isSelected ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {domainLabel}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
  <div className="flex flex-wrap gap-2 mt-2">
    {selectedDomains?.length > 0 ? (
      selectedDomains.map((domain, index) => {
        const domainLabel = typeof domain === 'string' 
          ? domain 
          : domain.name || domain.label || domain.domainName;
        
        return (
          <Badge
            key={index}
            variant="secondary"
            className="bg-secondary text-secondary-foreground"
          >
            {domainLabel}
            <button
              type="button"
              onClick={() => handleDomainSelect(domain)}
              className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
            >
              <X className="h-3 w-3" />
            </button>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.projects.map((project: any, index: number) => (
                      <Card key={project._id || index} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">
                            {project.projectName || project.name}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProject(project._id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {project.description}
                        </p>
                        {project.role && (
                          <p className="text-xs text-muted-foreground">
                            Role: {project.role}
                          </p>
                        )}
                        {project.techUsed && project.techUsed.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.techUsed
                              .slice(0, 3)
                              .map((tech: string, techIndex: number) => (
                                <Badge
                                  key={techIndex}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tech}
                                </Badge>
                              ))}
                            {project.techUsed.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{project.techUsed.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </Card>
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
                        <Card key={experience._id || index} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">
                              {experience.jobTitle || experience.title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveExperience(experience._id)
                              }
                              className="text-destructive hover:text-destructive/80"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {experience.company}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {experience.workFrom} - {experience.workTo}
                          </p>
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
    </div>
  );
}
