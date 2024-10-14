'use client';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Search } from '@/components/search';
import SidebarMenu from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';
import Breadcrumb from '@/components/shared/breadcrumbList';
import EducationInfoCard from '@/components/cards/educationInfoCard';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import { AddEducation } from '@/components/dialogs/addEduction';
import DropdownProfile from '@/components/shared/DropdownProfile';

export default function Education() {
  const user = useSelector((state: RootState) => state.user);
  const [refresh, setRefresh] = useState(false);
  const [educationInfo, setEducationInfo] = useState<any>([]);
  const handleFormSubmit = () => {
    // Toggle the refresh state to trigger useEffect
    setRefresh((prev) => !prev);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/freelancer/${user.uid}`); // Example API endpoint, replace with your actual endpoint
        console.log(
          'API Response get:',
          Object.values(response.data?.education),
        );
        setEducationInfo(Object.values(response.data?.education)); // Store response data in state
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    fetchData(); // Call fetch data function on component mount
  }, [user.uid, refresh]);

  // const handleDelete = (index: number) => {
  //   const updatedEducation = education.filter((_, i) => i !== index);
  //   setEducation(updatedEducation);
  //   localStorage.setItem('education', JSON.stringify(updatedEducation)); // Update local storage
  // };

  // const handleEdit = (index: number) => {
  //   setEditIndex(index);
  //   const educationInfo = education[index];
  //   form.setValue('degree', educationInfo.degree);
  //   form.setValue('universityName', educationInfo.universityName);
  //   form.setValue('fieldOfStudy', educationInfo.fieldOfStudy);
  //   form.setValue('start', new Date(educationInfo.start));
  //   form.setValue('end', new Date(educationInfo.end));
  //   form.setValue('grade', educationInfo.grade);
  //   setIsDialogOpen(true);
  // };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Education"
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4  sm:border-0  sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Education"
          />
          <Breadcrumb
            items={[
              { label: 'Settings', link: '#' },
              { label: 'Educational Info', link: '#' },
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
          {educationInfo.map((education: any, index: number) => (
            <EducationInfoCard key={index} {...education} />
          ))}
          <AddEducation onFormSubmit={handleFormSubmit} />
        </main>
      </div>
    </div>
  );
}
