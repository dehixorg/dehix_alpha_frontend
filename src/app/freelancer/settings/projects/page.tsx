'use client';
import { Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import DropdownProfile from '@/components/shared/DropdownProfile';
import { Input } from '@/components/ui/input';
import { RootState } from '@/lib/store';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Breadcrumb from '@/components/shared/breadcrumbList';
import { axiosInstance } from '@/lib/axiosinstance';
import ProjectCard from '@/components/cards/freelancerProjectCard';
import { AddProject } from '@/components/dialogs/addProject';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';

export default function Projects() {
  const user = useSelector((state: RootState) => state.user);
  const [refresh, setRefresh] = useState(false);
  const [projects, setProjects] = useState<any>([]);
  const handleFormSubmit = () => {
    // Toggle the refresh state to trigger useEffect
    setRefresh((prev) => !prev);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/freelancer/${user.uid}`); // Example API endpoint, replace with your actual endpoint
        console.log('API Response get:', response.data?.projects);
        setProjects(Object.values(response.data?.projects)); // Store response data in state
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    fetchData(); // Call fetch data function on component mount
  }, [user.uid, refresh]);
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Projects"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Projects"
          />
          <Breadcrumb
            items={[
              { label: 'Dashboard', link: '/dashboard/freelancer' },
              { label: 'Projects', link: '#' },
            ]}
          />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <DropdownProfile />
        </header>
        <main
          className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 
                grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
        >
          {projects.map((project: any, index: number) => (
            
            <ProjectCard key={index} {...project} />
          ))}
          <AddProject onFormSubmit={handleFormSubmit} />
        </main>
      </div>
    </div>
  );
}
