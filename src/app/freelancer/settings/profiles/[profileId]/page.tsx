'use client';
import React, { useEffect, useState } from 'react';
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
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showExperienceDialog, setShowExperienceDialog] = useState(false);
  const [freelancerProjects, setFreelancerProjects] = useState<any>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (profileId) {
      fetchProfile();
      fetchSkillsAndDomains();
      fetchFreelancerProjects();
    }
  }, [profileId, user.uid]);

  const fetchProfile = async () => {
    if (!profileId) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `/freelancer/profile/${profileId}`,
      );
      const profileData = response.data.data;
      setProfile(profileData);
      setEditingProfileData(profileData);
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

    setIsUpdating(true);
    try {
      await axiosInstance.put(
        `/freelancer/profile/${profile._id}`,
        editingProfileData,
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
                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.skills && profile.skills.length > 0 ? (
                        profile.skills.map((skill: any, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-primary text-primary-foreground"
                          >
                            {typeof skill === 'string'
                              ? skill
                              : skill.name || skill.label || skill.skillName}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No skills selected
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Domains</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.domains && profile.domains.length > 0 ? (
                        profile.domains.map((domain: any, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-secondary text-secondary-foreground"
                          >
                            {typeof domain === 'string'
                              ? domain
                              : domain.name ||
                                domain.label ||
                                domain.domainName}
                          </Badge>
                        ))
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
