'use client';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';
import EducationInfoCard from '@/components/cards/educationInfoCard';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import { AddEducation } from '@/components/dialogs/addEduction';
import Header from '@/components/header/header';
import { notifyError, notifySuccess } from '@/utils/toastMessage';

export default function Education() {
  const user = useSelector((state: RootState) => state.user);
  const [refresh, setRefresh] = useState(false);
  const [educationInfo, setEducationInfo] = useState<any>([]);
  const handleFormSubmit = () => {
    // Toggle the refresh state to trigger useEffect
    setRefresh((prev) => !prev);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/freelancer/${user.uid}`);

        const educationData = response.data?.data;

        if (!educationData || typeof educationData !== 'object') {
          console.warn('No education data found, setting empty array.');
          if (isMounted) setEducationInfo([]);
          return;
        }

        if (isMounted)
          setEducationInfo(Object.values(response.data.data.education));
      } catch (error) {
        notifyError('Something went wrong. Please try again.');
        console.error('API Error:', error);
        if (isMounted) setEducationInfo([]); // Ensure UI doesn't break
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [user.uid, refresh]);
   const handleDelete = async (educationId: string) => {
    try {
      await axiosInstance.delete(`/freelancer/education/${educationId}`);
      notifySuccess('Education record deleted successfully!');
      // Trigger a refresh to update the UI
      setRefresh((prev) => !prev);
    } catch (error) {
      notifyError('Failed to delete education. Please try again.');
    }
  };
  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Education"
        isKycCheck={true}
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Education"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Settings', link: '#' },
            { label: 'Educational Info', link: '#' },
          ]}
        />

        <main
          className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-2 md:gap-8 
                grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
        >
          {educationInfo.map((education: any, index: number) => (
            <EducationInfoCard
              key={index}
              {...education}
              onDelete={handleDelete}
            />
          ))}
          <AddEducation onFormSubmit={handleFormSubmit} />
        </main>
      </div>
    </div>
  );
}
