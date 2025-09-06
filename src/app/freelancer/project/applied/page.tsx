'use client';
import { Loader2, PackageOpen } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import { ProjectCard } from '@/components/cards/projectCard';
import { StatusEnum } from '@/utils/freelancer/enum';
import { toast } from '@/components/ui/use-toast';

interface Project {
  _id: string;
  projectName: string;
  description: string;
  email: string;
  verified?: any;
  isVerified?: string;
  companyName: string;
  start?: Date;
  end?: Date;
  skillsRequired: string[];
  experience?: string;
  role: string;
  projectType: string;
  totalNeedOfFreelancer?: {
    category?: string;
    needOfFreelancer?: number;
    appliedCandidates?: string[];
    rejected?: string[];
    accepted?: string[];
    status?: string;
  }[];
  status?: StatusEnum;
  team?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export default function AppliedProject() {
  const user = useSelector((state: RootState) => state.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [projectStatus, setProjectStatus] = useState('PENDING');

  const statusOptions: { value: string; label: string; description: string }[] =
    [
      {
        value: 'PENDING',
        label: 'Projects Under Verification',
        description:
          'Track the status of your projects currently undergoing verification before final approval.',
      },
      {
        value: 'ACTIVE',
        label: 'Active Projects',
        description: 'Browse and manage your active freelance projects.',
      },
      {
        value: 'REJECTED',
        label: 'Rejected Projects',
        description: 'View the list of projects that have been rejected.',
      },
      {
        value: 'COMPLETED',
        label: 'Completed Projects',
        description: 'Review your successfully completed projects.',
      },
      {
        value: 'ALL',
        label: 'All Projects',
        description: 'View all projects associated with your profile.',
      },
    ];

  const currentStatus = statusOptions.find(
    (option) => option.value === projectStatus,
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const url =
          projectStatus === 'ALL'
            ? `/freelancer/project`
            : `/freelancer/project?status=${projectStatus}`;

        const response = await axiosInstance.get(url);
        setProjects(response.data.data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong. Please try again.',
        });
        console.error('API Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user.uid, projectStatus]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="sm:gap-8 sm:py-0 sm:pl-14 md:pl-0 mb-8">
        <div className="flex justify-between items-center mb-8 ml-6 pr-6">
          <div>
            <h1 className="text-3xl font-bold">{currentStatus?.label}</h1>
            <p className="text-gray-400 mt-2">{currentStatus?.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="project-status"
              className="text-gray-600 font-medium"
            >
              Filter by Status:
            </label>
            <select
              id="project-status"
              value={projectStatus}
              onChange={(e) => setProjectStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <Loader2 size={40} className="animate-spin" />
          </div>
        ) : (
          <main
            className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 
              grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
          >
            {projects.length === 0 ? (
              <div className="col-span-full text-center mt-20 w-full">
                <PackageOpen className="mx-auto text-gray-500" size="100" />
                <p className="text-gray-500">No projects available</p>
              </div>
            ) : (
              projects.map((project, index: number) => (
                <ProjectCard key={index} project={project} type={user.type} />
              ))
            )}
          </main>
        )}
      </div>
    </div>
  );
}
