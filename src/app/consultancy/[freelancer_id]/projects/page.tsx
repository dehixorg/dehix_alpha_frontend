'use client';

import React, { useState, useEffect } from 'react';
import { PackageOpen, Boxes, Home } from 'lucide-react';
import { useSelector } from 'react-redux';

import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import ProjectCard from '@/components/cards/freelancerProjectCard';

interface Project {
  _id: string;
  projectName: string;
  description: string;
  verified: boolean;
  githubLink: string;
  liveDemoLink?: string;
  thumbnail?: string;
  start: string;
  end: string;
  refer: string;
  techUsed: string[];
  role: string;
  projectType: string;
  oracleAssigned: string | null;
  verificationStatus: string;
  verificationUpdateTime: string;
  comments: string;
  status: string;
}

export default function FreelancerProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Fetch projects where the current user is enrolled as a freelancer/consultant
        const response = await axiosInstance.get(`/project/consultant`);
        setProjects(response.data.data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch projects. Please try again.',
        });
        console.error('Error fetching projects:', error);

        // Fallback to mock data if API fails
        const mockProjects: Project[] = [
          {
            _id: '7326a104-9b14-4149-9075-ff7b992e92e8',
            projectName: 'waveshare',
            description:
              'A project involving wave sharing technology for energy distribution',
            verified: false,
            githubLink: 'https://github.com/StrawhatLuffy500m',
            liveDemoLink: 'https://waveshare-demo.example.com',
            thumbnail:
              'https://de-test-bucket-8285.s3.ap-south-1.amazonaws.com/1752',
            start: '2025-07-06T00:00:00.000+00:00',
            end: '2025-08-09T00:00:00.000+00:00',
            refer: 'trial',
            techUsed: ['React', 'Node.js', 'MongoDB'],
            role: 'Frontend Developer',
            projectType: 'Web Application',
            oracleAssigned: '8797685f-767e-4bc7-87b0-87c36a4509d5',
            verificationStatus: 'ADDED',
            verificationUpdateTime: '2025-07-09T15:51:43.920+00:00',
            comments: 'Project is currently in development phase',
            status: 'IN_PROGRESS',
          },
          {
            _id: '02dac6f9-c5e9-4eaa-9ebe-c45387f4796a',
            projectName: 'LoRa Waveshare',
            description:
              'Implementation of LoRa technology for wave sharing systems',
            verified: false,
            githubLink: 'https://github.com/StrawhatLuffy500m',
            liveDemoLink: 'https://lora-waveshare-demo.example.com',
            thumbnail:
              'https://de-test-bucket-8285.s3.ap-south-1.amazonaws.com/1752',
            start: '2025-06-29T00:00:00.000+00:00',
            end: '2025-08-09T00:00:00.000+00:00',
            refer: 'trial',
            techUsed: ['Azure', 'IoT', 'Python'],
            role: 'IoT Specialist',
            projectType: 'IoT Solution',
            oracleAssigned: '8797685f-767e-4bc7-87b0-87c36a4509d5',
            verificationStatus: 'ADDED',
            verificationUpdateTime: '2025-07-09T15:52:24.373+00:00',
            comments: 'Final testing phase',
            status: 'COMPLETED',
          },
          {
            _id: '3a7b8c9d-0e1f-2g3h-4i5j-6k7l8m9n0o1p',
            projectName: 'Ocean Energy Monitor',
            description: 'Monitoring system for ocean energy platforms',
            verified: true,
            githubLink: 'https://github.com/StrawhatLuffy500m/ocean-energy',
            thumbnail: 'https://example.com/ocean-energy-thumbnail.jpg',
            start: '2025-05-15T00:00:00.000+00:00',
            end: '2025-07-30T00:00:00.000+00:00',
            refer: 'production',
            techUsed: ['TypeScript', 'Docker', 'Kubernetes'],
            role: 'Lead Developer',
            projectType: 'Monitoring System',
            oracleAssigned: null,
            verificationStatus: 'VERIFIED',
            verificationUpdateTime: '2025-06-20T10:15:30.000+00:00',
            comments: 'Successfully deployed to production',
            status: 'COMPLETED',
          },
        ];
        setProjects(mockProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user.uid]);

  const currentProjects = projects.filter(
    (project) => project.status !== 'COMPLETED',
  );
  const completedProjects = projects.filter(
    (project) => project.status === 'COMPLETED',
  );

  const menuItemsTop = [
    {
      href: '#',
      icon: <Boxes className="h-4 w-4 transition-all group-hover:scale-110" />,
      label: 'My Projects',
    },
  ];

  const menuItemsBottom = [
    {
      href: '/dashboard/freelancer',
      icon: <Home className="h-5 w-5" />,
      label: 'Home',
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <SidebarMenu
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          active="My Projects"
        />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 mb-8">
          <Header
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            activeMenu="My Projects"
            breadcrumbItems={[
              { label: 'Projects', link: '#' },
              { label: 'My Projects', link: '#' },
            ]}
          />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading projects...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="My Projects"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="My Projects"
          breadcrumbItems={[
            { label: 'Projects', link: '#' },
            { label: 'My Projects', link: '#' },
          ]}
        />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                Current Projects {`(${currentProjects.length})`}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
                {currentProjects.length > 0 ? (
                  currentProjects.map((project) => (
                    <ProjectCard
                      key={project._id}
                      _id={project._id}
                      projectName={project.projectName}
                      description={project.description}
                      verified={project.verified}
                      githubLink={project.githubLink}
                      liveDemoLink={project.liveDemoLink}
                      thumbnail={project.thumbnail}
                      start={project.start}
                      end={project.end}
                      refer={project.refer}
                      techUsed={project.techUsed}
                      role={project.role}
                      projectType={project.projectType}
                      oracleAssigned={project.oracleAssigned}
                      verificationUpdateTime={project.verificationUpdateTime}
                      comments={project.comments}
                    />
                  ))
                ) : (
                  <div className="text-center py-10 col-span-full">
                    <PackageOpen className="mx-auto text-gray-500" size="100" />
                    <p className="text-gray-500">No current projects</p>
                  </div>
                )}
              </div>

              <Separator className="my-1" />

              <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                Completed Projects {`(${completedProjects.length})`}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
                {completedProjects.length > 0 ? (
                  completedProjects.map((project) => (
                    <ProjectCard
                      key={project._id}
                      _id={project._id}
                      projectName={project.projectName}
                      description={project.description}
                      verified={project.verified}
                      githubLink={project.githubLink}
                      liveDemoLink={project.liveDemoLink}
                      thumbnail={project.thumbnail}
                      start={project.start}
                      end={project.end}
                      refer={project.refer}
                      techUsed={project.techUsed}
                      role={project.role}
                      projectType={project.projectType}
                      oracleAssigned={project.oracleAssigned}
                      verificationUpdateTime={project.verificationUpdateTime}
                      comments={project.comments}
                    />
                  ))
                ) : (
                  <div className="text-center py-10 col-span-full">
                    <PackageOpen className="mx-auto text-gray-500" size="100" />
                    <p className="text-gray-500">No completed projects</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
