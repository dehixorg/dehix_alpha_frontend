'use client';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FreelancerProfile } from '@/types/freelancer';
import ProjectCard from '@/components/cards/freelancerProjectCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ProfileViewPage() {
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const params = useParams();
  const profileId = params.profileId as string;

  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [skillsOptions, setSkillsOptions] = useState<any[]>([]);
  const [domainsOptions, setDomainsOptions] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isProjectDetailsOpen, setIsProjectDetailsOpen] = useState(false);

  useEffect(() => {
    if (profileId) {
      fetchSkillsAndDomains().then(() => {
        fetchProfile();
      });
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

      setProfile(profileData);
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

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setIsProjectDetailsOpen(true);
  };

  const handleCloseProjectDetails = () => {
    setIsProjectDetailsOpen(false);
    setSelectedProject(null);
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
              { label: 'View Profile', link: '#' },
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
              { label: 'View Profile', link: '#' },
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

            {/* Profile Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">{profile.profileName}</h1>
                <p className="text-muted-foreground">
                  Viewing your professional profile
                </p>
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
                    <Label>Profile Name</Label>
                    <p className="text-lg font-medium">{profile.profileName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Hourly Rate ($)</Label>
                    <p className="text-lg font-medium">
                      {profile.hourlyRate
                        ? `$${profile.hourlyRate}/hr`
                        : 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label>Description</Label>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {profile.description}
                  </p>
                </div>

                <Separator />

                {/* Skills and Domains */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skillsOptions.length > 0 ? (
                        skillsOptions.map((skill) => (
                          <Badge
                            key={skill.skillId || skill._id}
                            className="text-xs font-normal bg-gray-300 px-2 py-1"
                          >
                            {skill.name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No skills available
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Domains</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {domainsOptions.length > 0 ? (
                        domainsOptions.map((domain) => (
                          <Badge
                            key={domain.domainId || domain._id}
                            className="text-xs font-normal bg-gray-300 px-2 py-1"
                          >
                            {domain.name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No domains available
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Link Items */}
                  <div className="space-y-4">
                    {/* GitHub Link */}
                    <div className="flex flex-col space-y-1">
                      <Label className="text-sm font-medium text-gray-400">
                        GitHub
                      </Label>
                      {profile.githubLink ? (
                        <a
                          href={profile.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white font-medium underline hover:text-blue-300 transition-colors"
                        >
                          {profile.githubLink.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <p className="text-gray-500 italic">Not provided</p>
                      )}
                    </div>

                    {/* LinkedIn Link */}
                    <div className="flex flex-col space-y-1">
                      <Label className="text-sm font-medium text-gray-400">
                        LinkedIn
                      </Label>
                      {profile.linkedinLink ? (
                        <a
                          href={profile.linkedinLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white font-medium underline hover:text-blue-300 transition-colors"
                        >
                          {profile.linkedinLink.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <p className="text-gray-500 italic">Not provided</p>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Personal Website */}
                    <div className="flex flex-col space-y-1">
                      <Label className="text-sm font-medium text-gray-400">
                        Personal Website
                      </Label>
                      {profile.personalWebsite ? (
                        <a
                          href={profile.personalWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white font-medium underline hover:text-blue-300 transition-colors"
                        >
                          {profile.personalWebsite.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <p className="text-gray-500 italic">Not provided</p>
                      )}
                    </div>

                    {/* Availability - Now inline with label */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium  text-gray-400">
                        Availability
                      </Label>
                      <p className="capitalize underline">
                        {profile.availability
                          ? profile.availability.toLowerCase().replace('_', ' ')
                          : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projects Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.projects && profile.projects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {profile.projects.map((project: any, index: number) => (
                      <div key={project._id || index}>
                        <ProjectCard
                          {...project}
                          onClick={() => handleProjectClick(project)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground">
                      No projects added to this profile
                    </p>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Experience Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Experience
                </CardTitle>
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
                          <div>
                            <h4 className="font-semibold text-lg mb-1">
                              {experience.jobTitle || experience.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {experience.company}
                            </p>
                            <p className="text-xs text-muted-foreground mb-3">
                              {new Date(experience.workFrom).toLocaleDateString(
                                'en-US',
                                {
                                  year: 'numeric',
                                  month: 'short',
                                },
                              )}{' '}
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
                        </Card>
                      ),
                    )}
                  </div>
                ) : (
                  <Card className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground">
                      No experience added to this profile
                    </p>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

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
