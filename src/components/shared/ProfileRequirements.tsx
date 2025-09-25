import { Briefcase, Users, Star, Zap } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Profile {
  domain: string;
  skills: string[];
  experience: number;
  freelancersRequired: string | number;
  consultantRequired?: string | number;
  className?: string;
  icon?: React.ReactNode;
  profileType: string;
}

interface ProfileRequirementsProps {
  profile: Profile;
  className?: string;
  variant?: 'default' | 'compact';
}

const getDomainIcon = (domain: string) => {
  const icons: Record<string, JSX.Element> = {
    web: <Zap className="h-4 w-4 text-blue-500" />,
    mobile: <Zap className="h-4 w-4 text-purple-500" />,
    design: <Zap className="h-4 w-4 text-pink-500" />,
    marketing: <Zap className="h-4 w-4 text-green-500" />,
    writing: <Zap className="h-4 w-4 text-yellow-500" />,
  };
  return (
    icons[domain.toLowerCase()] || (
      <Briefcase className="h-4 w-4 text-gray-500" />
    )
  );
};

export function ProfileRequirements({
  profile,
  className = '',
  variant = 'default',
}: ProfileRequirementsProps) {
  const DomainIcon = getDomainIcon(profile.domain);
  if (variant === 'compact') {
    return (
      <Card
        className={cn(
          'overflow-hidden hover:shadow-md transition-shadow relative',
          className,
        )}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
              {DomainIcon}
            </div>
            <CardTitle className="text-base font-semibold">
              {profile.domain} Profile
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Skills Required</span>
                <span>{profile.skills?.length || 0}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills?.slice(0, 3).map((skill, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-xs font-normal"
                  >
                    {skill}
                  </Badge>
                ))}
                {profile.skills?.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{profile.skills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Star className="h-3 w-3 text-amber-500" />
                  <span>Experience</span>
                </div>
                <p className="font-medium">{profile.experience} years</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Users className="h-3 w-3 text-blue-500" />
                  <span>Required</span>
                </div>
                <p className="font-medium">{profile.freelancersRequired}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'overflow-hidden hover:shadow-lg transition-all duration-300',
        className,
      )}
    >
      <CardHeader className="bg-gradient-to-r from-primary/5 to-background p-6 rounded-t-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
              {DomainIcon}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold ">
                <span>{profile.domain} Profile </span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Looking for {profile.freelancersRequired}{' '}
                {profile.freelancersRequired === 1
                  ? 'freelancer'
                  : 'freelancers'}
              </p>
            </div>
            <div className="flex justify-between">
              
              {profile.profileType && (
                <Badge variant="default" className="text-xs font-medium">
                  {profile.profileType}
                </Badge>
              )}
              
            </div>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-award"
                  >
                    <circle cx="12" cy="8" r="6" />
                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                  </svg>
                </div>
                <h3 className="font-medium">Required Skills</h3>
              </div>
              <span className="text-sm text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {profile.skills?.length}{' '}
                {profile.skills?.length === 1 ? 'skill' : 'skills'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {profile.skills?.map((skill, idx) => (
                <div key={idx} className="relative group">
                  <Badge
                    variant="secondary"
                    className="px-3 py-1.5 text-sm font-medium transition-all duration-200 group-hover:bg-primary/10 group-hover:text-foreground"
                  >
                    {skill}
                  </Badge>
                </div>
              ))}
            </div>

            {profile.skills?.length === 0 && (
              <p className="text-sm text-muted-foreground italic pt-1">
                No specific skills required
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {profile.profileType === 'CONSULTANT'
                      ? 'Consultant'
                      : 'Freelancer'}
                  </p>
                  <p className="font-semibold">
                    {profile.profileType === 'CONSULTANT'
                      ? profile.consultantRequired || 0
                      : profile.freelancersRequired}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                  <Star className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <p className="font-semibold">{profile.experience} yrs+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
