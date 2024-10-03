'use client';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { Search } from '@/components/search';
import DropdownProfile from '@/components/shared/DropdownProfile';
import { RootState } from '@/lib/store';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Breadcrumb from '@/components/shared/breadcrumbList';
import ExperienceCard from '@/components/cards/experienceCard';
import { axiosInstance } from '@/lib/axiosinstance';
import { AddExperience } from '@/components/dialogs/addExperiences';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';

export default function ProfessionalInfo() {
  const user = useSelector((state: RootState) => state.user);
  const [refresh, setRefresh] = useState(false);
  const [experiences, setExperiences] = useState<any>([]);
  const handleFormSubmit = () => {
    // Toggle the refresh state to trigger useEffect
    setRefresh((prev) => !prev);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/freelancer/${user.uid}`); // Example API endpoint, replace with your actual endpoint
        console.log('API Response get:', response.data?.professionalInfo);
        setExperiences(Object.values(response.data?.professionalInfo)); // Store response data in state
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
        active="Professional Info"
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4  sm:border-0  sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Professional Info"
          />
          <Breadcrumb
            items={[
              { label: 'Dashboard', link: '/dashboard/freelancer' },
              { label: 'Professional Info', link: '#' },
            ]}
          />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="w-full md:w-[200px] lg:w-[336px]" />
          </div>
          <DropdownProfile />
        </header>
        <main
          className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 
                grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
        >
          {experiences.map((exp: any, index: number) => (
            <ExperienceCard key={index} {...exp} />
          ))}
          <AddExperience onFormSubmit={handleFormSubmit} />
        </main>
      </div>
    </div>
  );
}
