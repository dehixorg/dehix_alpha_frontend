'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { axiosInstance } from '@/lib/axiosinstance';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/header/header';

interface UserProfile {
  firstName: string;
  lastName: string;
  userName: string;
  profilePic?: string;
  email: string;
  dob: string;
  linkedin?: string;
  github?: string;
  personalWebsite?: string;
  connects?: string;
  workExperience?: string;
  description?: string;
  professionalInfo?: {
    jobTitle?: string;
    company?: string;
    workDescription?: string;
    workFrom?: string;
    workTo?: string;
    githubRepoLink?: string;
  };
  skills?: { _id: string; name: string; level: string }[];
  education?: {
    degree?: string;
    universityName?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
  };
  projects?: {
    [key: string]: {
      _id: string;
      projectName: string;
      description: string;
      role: string;
      techUsed: string[];
      start: string;
      end: string;
      githubLink?: string;
    };
  };
  linkedIn?: string;
  website?: string;
}

const formatDate = (date: string) => new Date(date).toLocaleDateString();

export default function FreelancerProfile() {
  const { freelancer_id } = useParams<{ freelancer_id: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (freelancer_id) {
      const fetchFreelancerDetails = async () => {
        try {
          const response = await axiosInstance.get(
            `/freelancer/${freelancer_id}/profile-info`,
          );
          if (response.status === 200) {
            setUser(response.data);
          }
        } catch (error) {
          console.error('Error fetching freelancer details', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to fetch freelancer details.',
          });
        } finally {
          setLoading(false);
        }
      };

      fetchFreelancerDetails();
    }
  }, [freelancer_id]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active=""
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="active"
          breadcrumbItems={[
            { label: 'Business', link: '/dashboard/business' },
            { label: 'Freelancer Profile', link: '/dashboard/business' },
            {
              label: `${user?.firstName}  ${user?.lastName} `,
              link: `/dashboard/business/${freelancer_id}`,
            },
          ]}
        />

        <main className="flex flex-col items-center p-4 sm:px-6 sm:py-0 mb-10">
          <Card className="w-full max-w-4xl bg-black text-white p-4 shadow-md">
            <Card className="p-14 flex items-center rounded-lg">
              {loading ? (
                <Skeleton className="w-24 h-24 rounded-full mr-6" />
              ) : (
                <Avatar className="w-24 h-24 rounded-full mr-6 relative overflow-hidden border-4 border-primary shadow-lg hover:scale-110 transition-transform duration-300 ease-in-out">
                  <AvatarImage
                    src={user?.profilePic || '/default-avatar.png'}
                    alt={`${user?.firstName} ${user?.lastName} Profile Picture`}
                    className="object-cover w-full h-full"
                  />
                  <AvatarFallback>{`${user?.firstName?.[0] || 'J'}${user?.lastName?.[0] || 'D'}`}</AvatarFallback>
                </Avatar>
              )}
              <div>
                <h2 className="text-2xl font-bold">
                  {loading ? (
                    <Skeleton className="h-6 w-48" />
                  ) : (
                    `${user?.firstName} ${user?.lastName}`
                  )}
                </h2>
                <p className="text-lg">
                  {loading ? (
                    <Skeleton className="h-4 w-64 mt-2" />
                  ) : (
                    user?.description || 'No description provided.'
                  )}
                </p>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-4 mt-4">
              {/* Professional Info */}
              <Card className="p-4 rounded-lg">
                <CardHeader className="bg-black p-3 mt-0 mb-4 text-white rounded-sm text-center">
                  <CardTitle>Professional Info</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-4 w-32 mb-2" />
                    </>
                  ) : (
                    <>
                      <p>
                        Job Title: {user?.professionalInfo?.jobTitle || 'N/A'}
                      </p>
                      <p>Company: {user?.professionalInfo?.company || 'N/A'}</p>
                      <p>
                        Description:{' '}
                        {user?.professionalInfo?.workDescription || 'N/A'}
                      </p>
                      <p>
                        Duration:{' '}
                        {formatDate(user?.professionalInfo?.workFrom || '')} -{' '}
                        {formatDate(user?.professionalInfo?.workTo || '')}
                      </p>
                      <p>
                        GitHub:{' '}
                        {user?.professionalInfo?.githubRepoLink || 'N/A'}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Skills */}
              <Card className="p-4 rounded-lg">
                <CardHeader className="bg-black p-3 mt-1 mb-4 text-white rounded-sm text-center">
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-4 w-48" />
                  ) : user?.skills && user.skills.length > 0 ? (
                    user.skills.map((skill) => (
                      <p key={skill._id}>
                        {skill.name} {skill.level}
                      </p>
                    ))
                  ) : (
                    <p>No skills added.</p>
                  )}
                </CardContent>
              </Card>

              {/* Education */}
              <Card className="p-4 rounded-lg">
                <CardHeader className="bg-black p-3 mt-1 mb-4 text-white rounded-sm text-center">
                  <CardTitle>Education</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <>
                      <p>Degree: {user?.education?.degree || 'N/A'}</p>
                      <p>
                        University: {user?.education?.universityName || 'N/A'}
                      </p>
                      <p>
                        Field of Study: {user?.education?.fieldOfStudy || 'N/A'}
                      </p>
                      <p>
                        Duration: {formatDate(user?.education?.startDate || '')}{' '}
                        - {formatDate(user?.education?.endDate || '')}
                      </p>
                      <p>Grade: {user?.education?.grade || 'N/A'}</p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Projects */}
              <Card className="p-4 rounded-lg">
                <CardHeader className="bg-black p-3 mt-0 mb-4 text-white rounded-sm text-center">
                  <CardTitle>Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-4 w-48" />
                  ) : user?.projects &&
                    Object.keys(user.projects).length > 0 ? (
                    Object.values(user.projects).map((project) => (
                      <div key={project._id}>
                        <h4>{project.projectName}</h4>
                        <p>{project.description}</p>
                        <p>Role: {project.role}</p>
                        <p>Tech Used: {project.techUsed.join(', ')}</p>
                        <p>
                          Duration: {formatDate(project.start)} -{' '}
                          {formatDate(project.end)}
                        </p>
                        <p>GitHub: {project.githubLink}</p>
                      </div>
                    ))
                  ) : (
                    <p>No projects added.</p>
                  )}
                </CardContent>
              </Card>

              {/* Other Info */}
              <Card className="p-4 rounded-lg">
                <CardHeader className="bg-black p-2 mt-0 mb-4 text-white rounded-sm text-center">
                  <CardTitle>Other Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>LinkedIn: {user?.linkedIn || 'N/A'}</p>
                  <p>Website: {user?.website || 'N/A'}</p>
                </CardContent>
              </Card>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
