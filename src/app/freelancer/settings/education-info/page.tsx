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
import { toast } from '@/components/ui/use-toast';

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
        const response = await axiosInstance.get(`/freelancer/${user.uid}`);

  
        const educationData = response.data?.education;
  
        if (!educationData || typeof educationData !== 'object') {
          console.warn('No education data found, setting empty array.');
          setEducationInfo([]); 
          return;
        }
  
     
        setEducationInfo(Object.values(response.data.data.education));

      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong. Please try again.',
        });
        console.error('API Error:', error);
        setEducationInfo([]); // Ensure UI doesn't break
      }
    };
  
    fetchData();
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
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14 mb-8">
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
