'use client';
import { PackageOpen } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
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

export default function CompletedProject() {
  const user = useSelector((state: RootState) => state.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [projectStatus, setProjectStatus] = useState('COMPLETED');

  const statusOptions: { value: string; label: string; description: string }[] =
    [
      {
        value: 'COMPLETED',
        label: 'Completed Projects',
        description:
          'Explore and manage your successfully completed freelance projects.',
      },
      {
        value: 'ACTIVE',
        label: 'Active Projects',
        description: 'Browse and manage your active freelance projects.',
      },
      {
        value: 'PENDING',
        label: 'Projects Under Verification',
        description:
          'Track the status of your projects currently undergoing verification before final approval.',
      },
      {
        value: 'REJECTED',
        label: 'Rejected Projects',
        description: 'View the list of projects that have been rejected.',
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
      <div className="flex flex-col sm:gap-8 sm:py-0 md:pl-0 sm:pl-14 mb-8">
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
          <div
            className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 
                grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
          >
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-6 w-20 rounded-full" />
                  ))}
                </div>
                <div className="pt-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex justify-between items-center pt-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            ))}
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
