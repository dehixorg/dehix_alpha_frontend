'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';
import Header from '@/components/header/header';
import ProfileInfo from '@/components/freelancerProfile/ProfileInfo';
import Sections from '@/components/freelancerProfile/Sections';
import ProfessionalExperience from '@/components/freelancerProfile/ProfessionalExperience';
import Projects from '@/components/freelancerProfile/Projects';
import ProjectDialog from '@/components/freelancerProfile/ProjectDialog';
import FreelancerProfileSkeleton from '@/components/freelancerProfile/FreelancerProfileSkeleton';
import Education from '@/components/freelancerProfile/Education';
export interface UserProfile {
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
  kyc: {
    _id: string;
    status: 'PENDING' | 'VERIFIED' | 'REUPLOAD' | 'APPLIED' | 'STOPPED';
  };
  professionalInfo?: {
    jobTitle?: string;
    company?: string;
    workDescription?: string;
    workFrom?: string;
    workTo?: string;
    githubRepoLink?: string;
  }[];
  skills?: { _id: string; name: string; level: string }[];
  domain?: { _id: string; name: string }[];
  projectDomain?: { _id: string; name: string }[];
  education?: {
    degree?: string;
    universityName?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
  }[];
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
      projectType: string;
      verified: boolean;
    };
  };
}

export default function FreelancerProfile() {
  const { freelancer_id } = useParams<{ freelancer_id: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleProjects, setVisibleProjects] = useState(3);
  const [dialog, setDialog] = useState<any | null>(null);

  useEffect(() => {
    if (freelancer_id) {
      const fetchFreelancerDetails = async () => {
        try {
          setLoading(true);
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

  if (loading) {
    return <FreelancerProfileSkeleton />;
  }

  const sections = [
    {
      title: 'Skills',
      key: 'skills',
      data: user?.skills || [],
    },
    {
      title: 'Domain',
      key: 'domain',
      data: user?.domain || [],
    },
    {
      title: 'Project Domain',
      key: 'projectDomain',
      data: user?.projectDomain || [],
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active=""
      />
      <div className="flex flex-col sm:gap-4  sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Projects"
          breadcrumbItems={[
            { label: 'Business', link: '/dashboard/business' },
            { label: 'HireTalent', link: '/business/talent' },
            { label: 'Freelancer Profile', link: '/dashboard/business' },
            {
              label: `${user?.firstName}  ${user?.lastName} `,
              link: `/dashboard/business/${freelancer_id}`,
            },
          ]}
        />
        <div className="flex p-3 relative sm:pl-6 flex-col sm:gap-8 sm:py-0 ">
          <main className="mt-8">
            {user && <ProfileInfo user={user} />}
            <Sections sections={sections} />
            <Education education={user?.education || []} />
            <ProfessionalExperience
              professionalInfo={user?.professionalInfo || []}
            />
            <Projects
              projects={Object.values(user?.projects || {})}
              visibleProjects={visibleProjects}
              setVisibleProjects={setVisibleProjects}
              setDialog={setDialog}
            />
          </main>
        </div>
        {dialog && <ProjectDialog dialog={dialog} setDialog={setDialog} />}
      </div>
    </div>
  );
}
