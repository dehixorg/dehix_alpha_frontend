'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance'; // Ensure this is correctly configured
import { Button } from '@/components/ui/button';
import Header from '@/components/header/header';

interface UserProfile {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  linkedin?: string;
  personalWebsite?: string;
  connects?: string;
  projectsList: string[];
}

export default function BusinessProfile() {
  const { business_id } = useParams() as { business_id: string };
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (business_id) {
      const fetchBusinessDetails = async () => {
        try {
          const response = await axiosInstance.get(
            `/business/${business_id}/details`,
          ); // Update endpoint as per your API
          if (response.status === 200) {
            setUser(response.data);
          } else {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: `Unexpected response code: ${response.status}`,
            });
          }
        } catch (error) {
          console.error('Error fetching business details:', error);
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
      {/* Sidebar */}
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Business Profile"
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col sm:pl-14">
        {/* Header */}
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

        {/* Content */}
        <main className="flex flex-col items-center p-4 sm:px-6 gap-6">
          {/* Profile Overview */}
          <h1 className="text-center text-xl font-bold text-foreground">
            Business Profile Overview
          </h1>
          <Card className="w-full max-w-4xl shadow-lg">
            <CardHeader></CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center gap-6">
              {loading ? (
                <Skeleton className="w-24 h-24 rounded-full" />
              ) : (
                <Image
                  src={`/api/avatar/${business_id}`}
                  alt={`${user?.firstName} ${user?.lastName}`}
                  className="w-24 h-24 rounded-full"
                />
              )}
              <div className="text-center md:text-left">
                {loading ? (
                  <Skeleton className="h-6 w-48" />
                ) : (
                  <>
                    <h2 className="text-2xl font-bold">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-sm text-gray-600">{user?.companyName}</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
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

          {/* Projects List */}
          <Card className="w-full max-w-4xl shadow-lg">
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-6 w-48" />
              ) : user?.projectsList?.length ? (
                <ul className="list-disc pl-5">
                  {user.projectsList.map((project, index) => (
                    <li key={index}>{project}</li>
                  ))}
                </ul>
              ) : (
                <p>No projects listed.</p>
              )}
            </CardContent>
          </Card>
          <Button onClick={handleShare} className="mt-4">
            Share Profile
          </Button>
        </main>
      </div>
    </div>
  );
}
