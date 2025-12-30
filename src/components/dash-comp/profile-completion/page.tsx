import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  Circle,
  AlertCircle,
  ArrowUpRight,
  User,
  Briefcase,
  Mail,
  Phone,
  FileText,
  Award,
  ShieldCheck,
  Layers,
  Camera,
  Book,
} from 'lucide-react';

import StatItem from '../../shared/StatItem';

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
import { notifyError } from '@/utils/toastMessage';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phone: string;
  profilePic: string;
  description: string;
  resume?: string;
  coverLetter?: string;
  githubLink?: string;
  linkedin?: string;
  personalWebsite?: string;
  // Legacy top-level collections (still present in some responses)
  skills?: any[];
  domain?: any[];
  projectDomain?: any[];
  // New normalized attributes structure from /freelancer/{id}
  attributes?: any[];
  education?: Record<string, any>;
  projects?: Record<string, any>;
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
// Map field types to their corresponding icons
const fieldIcons: Record<string, React.ReactNode> = {
  // Personal Information
  firstname: <User className="h-3 w-3" />,
  lastname: <User className="h-3 w-3" />,
  username: <User className="h-3 w-3" />,
  email: <Mail className="h-3 w-3" />,
  phone: <Phone className="h-3 w-3" />,
  'profile pic': <Camera className="h-3 w-3" />,
  description: <FileText className="h-3 w-3" />,
  resume: <FileText className="h-3 w-3" />,

  // Professional Information
  skills: <Award className="h-3 w-3" />,
  domain: <Briefcase className="h-3 w-3" />,
  'project domain': <Layers className="h-3 w-3" />,
  education: <Book className="h-3 w-3" />,
  'professional experience': <Briefcase className="h-3 w-3" />,
  projects: <Layers className="h-3 w-3" />,
  'cover letter': <FileText className="h-3 w-3" />,

  // Verification
  'kyc verification': <ShieldCheck className="h-3 w-3" />,

  // Fallback
  default: <Circle className="h-3 w-3 text-muted-foreground/50" />,
};
const PERSONAL_INFO = '/freelancer/settings/personal-info';
const KYC = '/freelancer/settings/kyc';

const fieldNavigationMap: Record<string, string> = {
  'first name': PERSONAL_INFO,
  'last name': PERSONAL_INFO,
  username: PERSONAL_INFO,
  email: PERSONAL_INFO,
  phone: PERSONAL_INFO,
  profile: PERSONAL_INFO,
  description: PERSONAL_INFO,
  skills: PERSONAL_INFO,
  domain: PERSONAL_INFO,
  'project domain': PERSONAL_INFO,

  'kyc application': KYC,
  'kyc verification': KYC,
};

// Helper function to get the appropriate icon for a field
const getFieldIcon = (field: string) => {
  return fieldIcons[field.toLowerCase()] || fieldIcons.default;
};

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
        notifyError('Something went wrong. Please try again.', 'Error');
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const calculateCompletionPercentage = (profile: UserProfile) => {
    const attrs = Array.isArray(profile.attributes) ? profile.attributes : [];

    const hasSkillsFromAttributes = attrs.some(
      (attr: any) => attr?.type === 'SKILL',
    );
    const hasDomainsFromAttributes = attrs.some(
      (attr: any) => attr?.type === 'DOMAIN',
    );
    const hasProjectDomainsFromAttributes = attrs.some(
      (attr: any) => attr?.type === 'PROJECT_DOMAIN',
    );

    const hasEducation = !!(
      profile.education && Object.keys(profile.education).length > 0
    );
    const hasProjects = !!(
      profile.projects && Object.keys(profile.projects).length > 0
    );
    const hasProfessionalExperience = !!(
      profile.professionalInfo &&
      Object.keys(profile.professionalInfo || {}).length > 0
    );

    // Define the fields we want to check and their validation criteria
    const fieldsToCheck = {
      firstName: Boolean(profile.firstName?.trim()),
      lastName: Boolean(profile.lastName?.trim()),
      userName: Boolean(profile.userName?.trim()),
      email: Boolean(profile.email?.trim()),
      phone: Boolean(profile.phone?.trim()),
      profilePic: Boolean(profile.profilePic?.trim()),
      description: Boolean(profile.description?.trim()),
      resume: Boolean(profile.resume?.trim()),
      coverLetter: Boolean(profile.coverLetter?.trim()),
      githubLink: Boolean(profile.githubLink?.trim()),
      linkedin: Boolean(profile.linkedin?.trim()),
      personalWebsite: Boolean(profile.personalWebsite?.trim()),
      // Prefer new attributes-based structure, fall back to legacy arrays
      skills:
        hasSkillsFromAttributes ||
        (Array.isArray(profile.skills) && profile.skills.length > 0),
      domain:
        hasDomainsFromAttributes ||
        (Array.isArray(profile.domain) && profile.domain.length > 0),
      projectDomain:
        hasProjectDomainsFromAttributes ||
        (Array.isArray(profile.projectDomain) &&
          profile.projectDomain.length > 0),
      education: hasEducation,
      projects: hasProjects,
      professionalExperience: hasProfessionalExperience,
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

  const handleFieldClick = (field: string) => {
    const lowerField = field.toLowerCase().trim();
    for (const [key, route] of Object.entries(fieldNavigationMap)) {
      if (lowerField.includes(key)) {
        router.push(route);
        return;
      }
    }
    router.push('/freelancer/settings/personal-info'); // fallback
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
      ? '[&>*]:bg-red-500'
      : completionPercentage < 70
        ? '[&>*]:bg-yellow-500'
        : '[&>*]:bg-green-500';

  return (
    <Card className="rounded-none rounded-b-lg w-full overflow-hidden border-0 shadow-sm bg-gradient-to-br from-card to-card/70">
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
              className={cn('h-1 bg-foreground/20', completionColor)}
            />
          </div>

          {incompleteFields.length > 0 && completionPercentage < 100 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm font-medium">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span>Complete these to improve your profile:</span>
              </div>
              <ScrollArea className="h-[100px] pr-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {incompleteFields.map((field, index) => (
                    <div
                      key={index}
                      onClick={() => handleFieldClick(field)}
                      className="cursor-pointer"
                    >
                      <StatItem
                        icon={getFieldIcon(field)}
                        value={field}
                        label=""
                        className="h-full"
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
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
