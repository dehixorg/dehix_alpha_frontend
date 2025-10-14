'use client';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { RootState } from '@/lib/store';
import SidebarMenu from '@/components/menu/sidebarMenu';
import ExperienceCard from '@/components/cards/experienceCard';
import { axiosInstance } from '@/lib/axiosinstance';
import { AddExperience } from '@/components/dialogs/addExperiences';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';
import Header from '@/components/header/header';
import { notifyError } from '@/utils/toastMessage';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function ProfessionalInfo() {
  const user = useSelector((state: RootState) => state.user);
  const [refresh, setRefresh] = useState(false);
  const [experiences, setExperiences] = useState<any>([]);

  const [isLoading, setIsLoading] = useState(false);
  const handleFormSubmit = () => {
    setRefresh((prev) => !prev);
  };
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/freelancer/${user.uid}`);

        // Check if response.data?.data.professionalInfo is valid before using Object.values()
        const professionalInfo = response.data?.data?.professionalInfo;

        if (!professionalInfo || typeof professionalInfo !== 'object') {
          console.warn(
            'No professional experience data found, setting empty array.',
          );
          if (isMounted) setExperiences([]);
          return;
        }

        if (isMounted) setExperiences(Object.values(professionalInfo));
      } catch (error) {
        notifyError('Something went wrong. Please try again.');
        console.error('API Error:', error);
        if (isMounted) setExperiences([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [user.uid, refresh]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Professional Info"
        isKycCheck={true}
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Professional Info"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Settings', link: '#' },
            { label: 'Professional Info', link: '#' },
          ]}
        />
        <main
          className="grid flex-1 items-stretch gap-4 p-4 sm:px-6 sm:py-2 md:gap-8 
                grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
        >
          {isLoading ? (
            <CardSkeleton />
          ) : (
            <>
              {experiences.map((exp: any, index: number) => (
                <ExperienceCard key={index} {...exp} />
              ))}
              <AddExperience onFormSubmit={handleFormSubmit} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

const CardSkeleton = () => {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="w-full mx-auto md:max-w-2xl p-4 bg-muted ">
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full rounded-md" />
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-6 w-40" />
          </CardContent>
        </Card>
      ))}
      <Skeleton className="h-10 w-10 rounded-md" />
    </>
  );
};
