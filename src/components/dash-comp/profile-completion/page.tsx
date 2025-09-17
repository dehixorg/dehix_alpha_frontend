import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

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
import { Progress } from '@/components/ui/progress';

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phone: string;
  profilePic: string;
  description: string;
  skills: any[];
  domain: any[];
  projectDomain: any[];
  kyc?: {
    status: string;
    frontImageUrl?: string;
    backImageUrl?: string;
    liveCaptureUrl?: string;
    businessProof?: string;
  };
  professionalInfo: Record<string, any>;
}

interface ProfileCompletionProps {
  userId: string;
}

interface CompletionFields {
  [key: string]: boolean;
}

const ProfileCompletion = ({ userId }: ProfileCompletionProps) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [completionFields, setCompletionFields] = useState<CompletionFields>(
    {},
  );
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get(`/freelancer/${userId}`);
        const data = response.data.data; // Access the data property from the response
        setUserProfile(data);

        // Calculate the completion percentage based on the fetched data
        const { percentage, fields } = calculateCompletionPercentage(data);
        setCompletionPercentage(percentage);
        setCompletionFields(fields);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong. Please try again.',
        });
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const calculateCompletionPercentage = (profile: UserProfile) => {
    // Define the fields we want to check and their validation criteria
    const fieldsToCheck = {
      firstName: Boolean(profile.firstName?.trim()),
      lastName: Boolean(profile.lastName?.trim()),
      userName: Boolean(profile.userName?.trim()),
      email: Boolean(profile.email?.trim()),
      phone: Boolean(profile.phone?.trim()),
      profilePic: Boolean(profile.profilePic?.trim()),
      description: Boolean(profile.description?.trim()),
      skills: Array.isArray(profile.skills) && profile.skills.length > 0,
      domain: Array.isArray(profile.domain) && profile.domain.length > 0,
      projectDomain:
        Array.isArray(profile.projectDomain) &&
        profile.projectDomain.length > 0,
      kycApplied: Boolean(profile.kyc && profile.kyc.status !== 'NOT_APPLIED'),
      kycVerified: Boolean(profile.kyc && profile.kyc.status === 'VERIFIED'),
    };

    const totalFields = Object.keys(fieldsToCheck).length;
    const completedFields = Object.values(fieldsToCheck).filter(Boolean).length;

    return {
      percentage: (completedFields / totalFields) * 100,
      fields: fieldsToCheck,
    };
  };

  const getIncompleteFields = () => {
    if (!completionFields) return [];

    const incomplete = Object.entries(completionFields)
      .filter(([, isComplete]) => !isComplete)
      .map(([field]) => {
        // Convert camelCase to readable text
        const readableField = field
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase());

        // Special case for KYC fields
        if (field === 'kycApplied') return 'KYC Application';
        if (field === 'kycVerified') return 'KYC Verification';

        return readableField;
      });

    return incomplete;
  };

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

  const incompleteFields = getIncompleteFields();

  return (
    <Card className="w-full border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Profile Completion</CardTitle>

          <Button
            onClick={() => router.push('/freelancer/settings/personal-info')}
            variant="ghost"
            size="icon"
          >
            <ChevronRight />
          </Button>
        </div>
        <CardDescription>
          Complete your profile to increase visibility
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-full mr-3">
                <div className="h-3 w-full overflow-hidden">
                  <Progress value={completionPercentage} className="h-1 mt-1" />
                </div>
              </div>
              <span className="text-sm font-bold whitespace-nowrap">
                {completionPercentage.toFixed(0)}%
              </span>
            </div>
          </div>

          {incompleteFields.length > 0 && completionPercentage < 100 && (
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Missing information:</p>
              <ul className="list-disc pl-5 mt-1">
                {incompleteFields.slice(0, 3).map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
                {incompleteFields.length > 3 && (
                  <li>And {incompleteFields.length - 3} more...</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletion;
