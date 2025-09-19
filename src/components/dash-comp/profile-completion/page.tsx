import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Circle, AlertCircle, ArrowUpRight } from 'lucide-react';

import { cn } from '@/lib/utils';
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
import { Badge } from '@/components/ui/badge';

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
        <CardHeader className="pb-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
          </div>
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-4 w-48" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const incompleteFields = getIncompleteFields();

  const completionColor =
    completionPercentage < 30
      ? 'bg-red-500'
      : completionPercentage < 70
        ? 'bg-yellow-500'
        : 'bg-green-500';

  return (
    <Card className="w-full overflow-hidden border-0 shadow-sm bg-gradient-to-br from-card to-card/70">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Profile Strength
            </CardTitle>
            <CardDescription className="text-sm">
              {completionPercentage === 100
                ? 'Your profile is complete! 🎉'
                : 'Complete your profile to increase your visibility and get more opportunities.'}
            </CardDescription>
          </div>
          <Button
            onClick={() => router.push('/freelancer/settings/personal-info')}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowUpRight />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium mt-2">
                {completionPercentage.toFixed(0)}%
              </span>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs font-medium border-0',
                  completionPercentage < 30
                    ? 'bg-red-500/10 text-red-600'
                    : completionPercentage < 70
                      ? 'bg-yellow-500/10 text-yellow-600'
                      : 'bg-green-500/10 text-green-600',
                )}
              >
                {completionPercentage < 30
                  ? 'Beginner'
                  : completionPercentage < 70
                    ? 'Intermediate'
                    : 'Expert'}
              </Badge>
            </div>
            <Progress
              value={completionPercentage}
              className={cn('h-1', `[&>*]:${completionColor}`)}
            />
          </div>

          {incompleteFields.length > 0 && completionPercentage < 100 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm font-medium">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span>Complete these to improve your profile:</span>
              </div>
              <ul className="space-y-2">
                {incompleteFields.slice(0, 3).map((field, index) => (
                  <li
                    key={index}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <Circle className="h-3 w-3 text-muted-foreground/50" />
                    <span>{field}</span>
                  </li>
                ))}
                {incompleteFields.length > 3 && (
                  <li className="text-xs text-muted-foreground pl-5">
                    +{incompleteFields.length - 3} more items to complete
                  </li>
                )}
              </ul>
            </div>
          )}

          {completionPercentage === 100 && (
            <div className="flex items-center space-x-2 rounded-md bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <p>Your profile is 100% complete! Great job! 🎉</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletion;
