'use client';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { RootState } from '@/lib/store';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { axiosInstance } from '@/lib/axiosinstance';
import ProjectCard from '@/components/cards/freelancerProjectCard';
import { AddProject } from '@/components/dialogs/addProject';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';
import Header from '@/components/header/header';
import { toast } from '@/components/ui/use-toast';

export default function Projects() {
  const user = useSelector((state: RootState) => state.user);
  const [refresh, setRefresh] = useState(false);
  const [projects, setProjects] = useState<any>([]);

  const handleFormSubmit = () => {
    setRefresh((prev) => !prev);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/freelancer/${user.uid}/project`);

        // Check if the response and projects data exist before setting the state
        if (response?.data?.projects) {
          setProjects(Object.values(response.data.projects));
        } else {
          // If no projects, set projects to an empty array to avoid errors
          setProjects([]);
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong. Please try again.',
        });
        console.error('API Error:', error);
      }
    };

    fetchData();
  }, [user.uid, refresh]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Projects"
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Projects"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Settings', link: '#' },
            { label: 'Projects', link: '#' },
          ]}
        />
        <main
          className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 
                grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
        >
          {projects.length > 0 ? (
            projects.map((project: any, index: number) => (
              <ProjectCard key={index} {...project} />
            ))
          ) : (
            <p>No projects found.</p> // Optionally show a message if there are no projects
          )}
          <AddProject onFormSubmit={handleFormSubmit} />
        </main>
      </div>
    </div>
  );
}
