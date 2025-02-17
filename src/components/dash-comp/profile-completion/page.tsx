import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  profilePic: string;
  description: string;
  skills: string[];
  domain: string[];
  professionalInfo: Record<string, any>;
}

interface ProfileCompletionProps {
  userId: string;
}

const ProfileCompletion = ({ userId }: ProfileCompletionProps) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get(`/freelancer/${userId}`);
        console.log(`Response: ${response}`);
        const data = response.data;
        console.log(`data: ${data}`);
        setUserProfile(data);

        // Calculate the completion percentage based on the fetched data
        const percentage = calculateCompletionPercentage(data);
        setCompletionPercentage(percentage);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong.Please try again.',
        }); // Error toast
      }
    };

    fetchUserProfile();
  }, [userId]);

  const calculateCompletionPercentage = (profile: UserProfile) => {
    // Define the fields we want to check and their validation criteria
    const fieldsToCheck = {
      firstName: Boolean(profile.firstName?.trim()),
      lastName: Boolean(profile.lastName?.trim()),
      userName: Boolean(profile.userName?.trim()),
      profilePic: Boolean(profile.profilePic?.trim()),
      description: Boolean(profile.description?.trim()),
      skills: Array.isArray(profile.skills) && profile.skills.length > 0,
      domain: Array.isArray(profile.domain) && profile.domain.length > 0,
      professionalInfo: Boolean(
        Object.keys(profile.professionalInfo || {}).length > 0,
      ),
    };

    const totalFields = Object.keys(fieldsToCheck).length;
    const completedFields = Object.values(fieldsToCheck).filter(Boolean).length;

    return (completedFields / totalFields) * 100;
  };
  console.log(userProfile);

  if (!userProfile) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Profile Completion</CardTitle>
              <CardDescription>
                Complete your profile to increase visibility
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-[100px] h-[20px] rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">Profile Completion</CardTitle>
            <CardDescription>
              Complete your profile to increase visibility
            </CardDescription>
          </div>
          <Button
            className="w-32"
            onClick={() => router.push('/freelancer/settings/personal-info')}
            variant="default"
          >
            Complete Profile
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-full mr-3">
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-in-out"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
              <span className="text-xl font-bold whitespace-nowrap">
                {completionPercentage.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletion;
