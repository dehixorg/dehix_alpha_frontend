'use client';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { RootState } from '@/lib/store';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { axiosInstance } from '@/lib/axiosinstance';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';
import Header from '@/components/header/header';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function FreelancerBids() {
  const user = useSelector((state: RootState) => state.user);
  const [bids, setBids] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if the user is a freelancer and has a valid ID
    if (
      !user.isLoggedIn ||
      user.userType !== 'freelancer' ||
      !user.freelancerId
    ) {
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Assuming your GET /bid endpoint is secure and filters by the authenticated user's ID
        const response = await axiosInstance.get(`/bid`);

        const bidData = response.data?.data;

        if (!bidData || !Array.isArray(bidData)) {
          console.warn('No bid data found, setting empty array.');
          setBids([]);
          return;
        }

        setBids(bidData);
        console.log('Fetched Bids:', bidData); // Log the fetched data here
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong. Please try again.',
        });
        console.error('API Error:', error);
        setBids([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user.isLoggedIn, user.userType, user.freelancerId]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="My Bids"
        isKycCheck={true}
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="My Bids"
          breadcrumbItems={[
            { label: 'Dashboard', link: '/dashboard/freelancer' },
            { label: 'My Bids', link: '#' },
          ]}
        />
        <main
          className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 
             grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
        >
          {/* This section is now purely for a loading state and a message, no bids are rendered */}
          {isLoading ? (
            <CardSkeleton />
          ) : (
            <p>Bids have been fetched. Check the console for the data.</p>
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
    </>
  );
};
