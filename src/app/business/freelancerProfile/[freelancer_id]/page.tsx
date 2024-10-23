'use client';
import { Search } from '@/components/search';
import React, { useEffect, useState } from 'react';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import SidebarMenu from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import Breadcrumb from '@/components/shared/breadcrumbList';
import DropdownProfile from '@/components/shared/DropdownProfile';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { axiosInstance } from '@/lib/axiosinstance';
import { useParams } from 'next/navigation'; // Import to handle dynamic route params
import { Linkedin, Github, Globe } from "lucide-react";
interface UserProfile {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    dob: string;
    linkedin: string;
    github: string;
    personalWebsite: string;
    connects: string;
    workExperience: string;
  }
const profileFormSchema = z.object({
  // Your schema fields here
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function FreelancerProfile() {
  const { freelancer_id } = useParams(); 
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (freelancer_id) {
      const fetchFreelancerDetails = async () => {
        try {
          setLoading(true);
          const response = await axiosInstance.get(
            `/freelancer/${freelancer_id}/details`
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

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      companyName: '',
      companySize: '',
      position: '',
      linkedIn: '',
      website: '',
    },
    mode: 'all',
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    }
  }, [user, form]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active=""
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:border-0 sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Projects"
          />
          <Breadcrumb
            items={[
              { label: 'Business', link: '/dashboard/business' },
              { label: 'Freelancer Profile', link: '/dashboard/business' },
              { label: `#${freelancer_id}`, link: '#' },
            ]}
          />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="w-full md:w-[200px] lg:w-[336px]" />
          </div>
          <DropdownProfile />
        </header>

        <main className="flex flex-col items-center p-4 sm:px-6 sm:py-0 mb-10">
          <Card className="w-full max-w-4xl bg-black text-white p-4 shadow-md">
            <Card className="p-14 flex items-center rounded-lg">
              <Avatar className="w-24 h-24 rounded-full mr-6">
                <AvatarImage
                  src={user?.avatar || "/placeholder.svg?height=80&width=80"} // Use user's avatar or placeholder
                  alt="Profile picture"
                />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-lg">
                  {user?.description || 'No description provided.'}
                </p>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-4 mt-4">
              {/* Professional Info */}
              <Card className="p-4 rounded-lg">
                <h3 className="text-xl font-semibold">Professional Info</h3>
                <p>Job Title: {user?.professionalInfo?.jobTitle || 'N/A'}</p>
                <p>Company: {user?.professionalInfo?.company || 'N/A'}</p>
                <p>Description: {user?.professionalInfo?.workDescription || 'N/A'}</p>
                <p>
                  Duration: {new Date(user?.professionalInfo?.workFrom).toLocaleDateString()} 
                  - {new Date(user?.professionalInfo?.workTo).toLocaleDateString()}
                </p>
                <p>GitHub: {user?.professionalInfo?.githubRepoLink || 'N/A'}</p>
              </Card>

              {/* Skills */}
              <Card className="p-4 rounded-lg">
                <h3 className="text-xl font-semibold">Skills</h3>
                {user?.skills.length > 0 ? (
                  user.skills.map((skill: any) => (
                    <p key={skill._id}>{skill.name} - Level: {skill.level}</p>
                  ))
                ) : (
                  <p>No skills added.</p>
                )}
              </Card>

              {/* Education */}
              <Card className="p-4 rounded-lg">
                <h3 className="text-xl font-semibold">Education</h3>
                <p>Degree: {user?.education?.degree || 'N/A'}</p>
                <p>University: {user?.education?.universityName || 'N/A'}</p>
                <p>Field of Study: {user?.education?.fieldOfStudy || 'N/A'}</p>
                <p>
                  Duration: {new Date(user?.education?.startDate).toLocaleDateString()} 
                  - {new Date(user?.education?.endDate).toLocaleDateString()}
                </p>
                <p>Grade: {user?.education?.grade || 'N/A'}</p>
              </Card>

              {/* Projects */}
              <Card className="p-4 rounded-lg">
                <h3 className="text-xl font-semibold">Projects</h3>
                {Object.keys(user?.projects || {}).length > 0 ? (
                  Object.values(user.projects).map((project: any) => (
                    <div key={project._id}>
                      <h4>{project.projectName}</h4>
                      <p>{project.description}</p>
                      <p>Role: {project.role}</p>
                      <p>Tech Used: {project.techUsed.join(', ')}</p>
                      <p>
                        Duration: {new Date(project.start).toLocaleDateString()} 
                        - {new Date(project.end).toLocaleDateString()}
                      </p>
                      <p>GitHub: {project.githubLink || 'N/A'}</p>
                      <hr className="my-2" />
                    </div>
                  ))
                ) : (
                  <p>No projects added.</p>
                )}
              </Card>

              {/* Other Info */}
              <Card className="p-4 rounded-lg">
                <h3 className="text-xl font-semibold">Other Info</h3>
                <p>LinkedIn: {user?.linkedIn || 'N/A'}</p>
                <p>Website: {user?.website || 'N/A'}</p>
              </Card>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
