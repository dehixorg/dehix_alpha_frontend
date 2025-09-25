'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { axiosInstance } from '@/lib/axiosinstance';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/header/header';
import { Button } from '@/components/ui/button';

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  linkedin?: string;
  personalWebsite?: string;
  connects?: string;
  ProjectList: string[];
}

export default function BusinessProfile() {
  const { business_id } = useParams<{ business_id: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (business_id) {
      const fetchBusinessDetails = async () => {
        try {
          const response = await axiosInstance.get(`/public/business`);
          if (response.status === 200) {
            setUser(response.data);
          }
        } catch (error) {
          console.error('Error fetching business details', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to fetch business details.',
          });
        } finally {
          setLoading(false);
        }
      };

      fetchBusinessDetails();
    }
  }, [business_id]);

  const handleShare = () => {
    const shareData = {
      title: 'Business Profile',
      text: `Check out the profile of ${user?.firstName} ${user?.lastName} at ${user?.companyName}.`,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator
        .share(shareData)
        .catch((err) => console.error('Error sharing:', err));
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Sharing is not supported on this browser.',
      });
    }
  };
  return (
    <div className="flex min-h-screen bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Business Profile"
      />

      <div className="flex mb-8 flex-1 flex-col sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Business Profile"
          breadcrumbItems={[
            { label: 'Dashboard', link: '/dashboard' },
            {
              label: 'Business Profile',
              link: '/dashboard/business-profile',
            },
            { label: `#${business_id}`, link: '#' },
          ]}
        />

        <main className="flex flex-col items-center p-4 sm:px-6 sm:py-4 gap-6">
          <h1>Business Profile Overview</h1>
          <Card className="w-full max-w-4xl bg-black text-white p-4 shadow-md">
            <Card className="p-14 flex items-center rounded-lg">
              {loading ? (
                <Skeleton className="w-24 h-24 rounded-full mr-6" />
              ) : (
                <Avatar className="w-24 h-24 rounded-full mr-6 relative overflow-hidden border-4 border-primary shadow-lg hover:scale-110 transition-transform duration-300 ease-in-out">
                  <AvatarImage
                    src={'/default-avatar.png'}
                    alt={`${user?.firstName} ${user?.lastName} Profile Picture`}
                    className="object-cover w-full h-full"
                  />
                  <AvatarFallback>{`${user?.firstName?.[0] || 'J'}${user?.lastName?.[0] || 'D'}`}</AvatarFallback>
                </Avatar>
              )}
            </Card>
            {/* Projects List */}
            <Card className="w-full max-w-4xl shadow-lg">
              <CardHeader>
                <CardTitle>Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-6 w-48" />
                ) : user?.ProjectList?.length ? (
                  <ul className="list-disc pl-5">
                    {user.ProjectList.map((project, index) => (
                      <li key={index}>{project}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No projects listed.</p>
                )}
              </CardContent>
            </Card>
            <Card className="w-full max-w-4xl shadow-lg">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-6 w-48" />
                ) : (
                  <>
                    <p>Email: {user?.email}</p>
                    {user?.linkedin && (
                      <p>
                        LinkedIn:{' '}
                        <a
                          href={user.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {user.linkedin}
                        </a>
                      </p>
                    )}
                    {user?.personalWebsite && (
                      <p>
                        Website:{' '}
                        <a
                          href={user.personalWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {user.personalWebsite}
                        </a>
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Card>
          <Button onClick={handleShare} className="mt-4">
            Share Profile
          </Button>
        </main>
      </div>
    </div>
  );
}
