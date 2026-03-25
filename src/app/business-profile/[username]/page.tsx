'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Mail, Linkedin, Globe, Code, MessageSquare } from 'lucide-react';

import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import {
  menuItemsTop as freelancerMenuItemsTop,
  menuItemsBottom as freelancerMenuItemsBottom,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notifyError } from '@/utils/toastMessage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { axiosInstance } from '@/lib/axiosinstance';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/header/header';
import { Button } from '@/components/ui/button';
import { RootState } from '@/lib/store';
import { ProjectCard } from '@/components/cards/projectCard';
import EmptyState from '@/components/shared/EmptyState';

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  linkedin?: string;
  personalWebsite?: string;
  connects?: string;
  ProjectList: any[];
}

export default function BusinessProfile() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [businessId, setBusinessId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const user = useSelector((state: RootState) => state.user);
  const isFreelancer =
    user?.userType === 'freelancer' || user?.type === 'freelancer';

  const sidebarMenuItemsTop = isFreelancer
    ? freelancerMenuItemsTop
    : menuItemsTop;
  const sidebarMenuItemsBottom = isFreelancer
    ? freelancerMenuItemsBottom
    : menuItemsBottom;

  useEffect(() => {
    if (username) {
      const fetchBusinessDetails = async () => {
        try {
          // Try fetching by username first
          const response = await axiosInstance.get(
            `/public/business/username/${username}`,
          );
          if (response.status === 200) {
            setUserProfile(response.data);
            setBusinessId(response.data._id || '');
          }
        } catch (error: any) {
          // If username lookup fails, try by ID (backward compatibility)
          if (
            error?.response?.status === 404 ||
            error?.response?.status === 500
          ) {
            try {
              const fallbackResponse = await axiosInstance.get(
                `/public/business/${username}`,
              );
              if (fallbackResponse.status === 200) {
                setUserProfile(fallbackResponse.data);
                setBusinessId(fallbackResponse.data._id || '');
              }
            } catch (fallbackError) {
              console.error('Error fetching business details', fallbackError);
              notifyError('Failed to fetch business details.', 'Error');
            }
          } else {
            console.error('Error fetching business details', error);
            notifyError('Failed to fetch business details.', 'Error');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchBusinessDetails();
    }
  }, [username]);

  const handleShare = () => {
    const shareData = {
      title: 'Business Profile',
      text: `Check out the profile of ${userProfile?.firstName} ${userProfile?.lastName} at ${userProfile?.companyName}.`,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator
        .share(shareData)
        .catch((err) => console.error('Error sharing:', err));
    } else {
      notifyError('Sharing is not supported on this browser.', 'Error');
    }
  };

  const handleChatWithBusiness = () => {
    if (!user?.uid || !businessId) return;
    const sessionKey = `chat_session_${Date.now()}`;
    const chatData = {
      newChat: true,
      userId: businessId,
      userName: userProfile
        ? `${userProfile.firstName} ${userProfile.lastName}`.trim() ||
          userProfile.companyName
        : 'Business',
      userEmail: userProfile?.email || null,
      userPhoto: null,
      userType: 'business',
    };
    localStorage.setItem(sessionKey, JSON.stringify(chatData));
    router.push(`/chat?session=${sessionKey}`);
  };

  return (
    <div className="flex min-h-screen bg-muted/40 w-full flex-col">
      {user?.isLoggedIn && (
        <SidebarMenu
          menuItemsTop={sidebarMenuItemsTop}
          menuItemsBottom={sidebarMenuItemsBottom}
          active=""
        />
      )}

      <div
        className={`flex mb-8 flex-1 flex-col ${user?.isLoggedIn ? 'sm:pl-14' : ''}`}
      >
        {user?.isLoggedIn && (
          <Header
            menuItemsTop={sidebarMenuItemsTop}
            menuItemsBottom={sidebarMenuItemsBottom}
            activeMenu="Business Profile"
            breadcrumbItems={[
              { label: 'Dashboard', link: '/dashboard' },
              {
                label: 'Business Profile',
                link: '#',
              },
              { label: `${userProfile?.companyName || username}`, link: '#' },
            ]}
          />
        )}

        <main className="flex flex-col items-center p-4 sm:px-6 sm:py-4 gap-6 w-full">
          <Card className="w-full max-w-4xl bg-black text-white p-4 shadow-md">
            <Card className="p-14 flex items-center rounded-lg">
              {loading ? (
                <Skeleton className="w-24 h-24 rounded-full mr-6" />
              ) : (
                <Avatar className="w-24 h-24 rounded-full mr-6 relative overflow-hidden border-4 border-primary shadow-lg hover:scale-110 transition-transform duration-300 ease-in-out">
                  <AvatarImage
                    src={'/default-avatar.png'}
                    alt={`${userProfile?.firstName} ${userProfile?.lastName} Profile Picture`}
                    className="object-cover w-full h-full"
                  />
                  <AvatarFallback>{`${userProfile?.firstName?.[0] || 'B'}${userProfile?.lastName?.[0] || 'U'}`}</AvatarFallback>
                </Avatar>
              )}
            </Card>
            {/* Projects List */}
            <Card className="w-full max-w-4xl shadow-lg mt-6">
              <CardHeader className="bg-green-500/5 dark:bg-green-500/10 border-b border-border py-4">
                <CardTitle className="text-md font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                ) : userProfile?.ProjectList?.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userProfile.ProjectList.map((project: any) => (
                      <ProjectCard key={project._id} project={project} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No projects added yet"
                    description="Once this business adds projects to their profile, you'll see them listed here."
                    icon={<Code className="h-16 w-16 text-green-500" />}
                    className="py-10 border-border/60 bg-background"
                  />
                )}
              </CardContent>
            </Card>
            <Card className="w-full max-w-4xl shadow-lg mt-4">
              <CardHeader className="bg-blue-500/5 dark:bg-blue-500/10 border-b border-border py-4">
                <CardTitle className="text-md font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-black dark:text-white">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-6 w-64" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Email
                        </p>
                        <p className="font-medium">{userProfile?.email}</p>
                      </div>
                    </div>
                    {userProfile?.linkedin && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                          <Linkedin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            LinkedIn
                          </p>
                          <a
                            href={userProfile.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {userProfile.linkedin}
                          </a>
                        </div>
                      </div>
                    )}
                    {userProfile?.personalWebsite && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                          <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Website
                          </p>
                          <a
                            href={userProfile.personalWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {userProfile.personalWebsite}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </Card>
          <Button onClick={handleShare} className="mt-4">
            Share Profile
          </Button>
          {user?.isLoggedIn && isFreelancer && (
            <Button
              onClick={handleChatWithBusiness}
              className="mt-4 flex items-center gap-2"
              variant="outline"
            >
              <MessageSquare className="h-4 w-4" />
              Chat with Business
            </Button>
          )}
        </main>
      </div>
    </div>
  );
}
