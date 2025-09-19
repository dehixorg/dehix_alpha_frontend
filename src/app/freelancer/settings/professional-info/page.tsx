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
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function ProfessionalInfo() {
  const user = useSelector((state: RootState) => state.user);
  const [refresh, setRefresh] = useState(false);
  const [experiences, setExperiences] = useState<any>([]);
  console.log(experiences, 'experiences');
  const [isLoading, setIsLoading] = useState(false);
  const handleFormSubmit = () => {
    setRefresh((prev) => !prev);
  };
  useEffect(() => {
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
          setExperiences([]); // Empty array set kar diya taaki error na aaye
          return;
        }

        setExperiences(Object.values(professionalInfo));
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong. Please try again.',
        });
        console.error('API Error:', error);
        setExperiences([]); // UI break hone se bachega
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user.uid, refresh]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Professional Info"
        isKycCheck={true}
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14 mb-8">
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
          className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 
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
