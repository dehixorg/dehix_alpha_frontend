// src/components/marketComponents/profileCards/invitedProfileCards.tsx
'use client';
import React, { useState } from 'react';
import {
  Clock,
  User,
  ExternalLink,
  Github,
  Linkedin,
  Link2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/EmptyState';
interface Skill {
  _id?: string;
  name: string;
}
interface ProfessionalExperience {
  workFrom: string;
  workTo: string;
}
interface Talent {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePic: string;
  domainName: string;
  professionalInfo?: ProfessionalExperience[];
  freelancerId: string;
  skills?: Skill[];
  userName?: string;
  githubLink?: string;
  linkedin?: string;
  personalWebsite?: string;
  description?: string;
  workExperience?: number;
}
interface ProfileCardsProps {
  talents: Talent[];
  loading: boolean;
  calculateExperience: (professionalInfo: ProfessionalExperience[]) => string;
  showDecisionActions?: boolean;
  onDecision?: (
    freelancerId: string,
    status: 'SELECTED' | 'REJECTED',
  ) => Promise<void>;
}

const InvitedProfileCards: React.FC<ProfileCardsProps> = ({
  talents,
  loading,
  showDecisionActions = false,
  onDecision,
}) => {
  const router = useRouter();
  const [updatingFreelancerId, setUpdatingFreelancerId] = useState<
    string | null
  >(null);

  const handleViewProfile = (talentId: string) => {
    router.replace(`/business/freelancerProfile/${talentId}`);
  };

  const handleDecision = async (
    freelancerId: string,
    status: 'SELECTED' | 'REJECTED',
  ) => {
    if (!onDecision || !freelancerId) return;
    try {
      setUpdatingFreelancerId(freelancerId);
      await onDecision(freelancerId, status);
    } finally {
      setUpdatingFreelancerId(null);
    }
  };

  const SkeletonCard = () => (
    <Card className="group relative overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl bg-muted-foreground/20 dark:bg-muted/20">
      <CardHeader className="pb-2 px-6 pt-6">
        <div className="flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>
      <CardContent className="px-6 py-3">
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <div className="flex flex-wrap gap-2 pt-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </CardContent>
      <div className="absolute inset-0 border-2 border-transparent rounded-xl pointer-events-none" />
    </Card>
  );

  return (
    <div className="grid grid-cols-1 gap-6">
      {loading ? (
        Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))
      ) : talents.length > 0 ? (
        talents.map((talent, index) => (
          <Card
            key={`${talent._id}-${index}`}
            className="group relative overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 bg-muted-foreground/20 dark:bg-muted/20"
          >
            <CardHeader className="pb-2 px-6 pt-6">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <Avatar className="h-12 w-12 rounded-xl border border-gray-200 dark:border-gray-700">
                    <AvatarImage
                      src={talent.profilePic}
                      alt={`${talent.firstName} ${talent.lastName}`}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary rounded-xl text-base font-semibold">
                      {talent.firstName?.slice(0, 1).toUpperCase() || ''}
                      {talent.lastName?.slice(0, 1).toUpperCase() || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                      {talent.userName
                        ? `@${talent.userName}`
                        : `${talent.firstName} ${talent.lastName}`}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {talent.userName
                        ? `${talent.firstName} ${talent.lastName}`
                        : talent.domainName}
                    </CardDescription>
                    {talent.userName && (
                      <div className="text-sm text-muted-foreground">
                        {talent.domainName}
                      </div>
                    )}
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 rounded-full text-xs font-medium px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-200 border border-amber-500/20"
                >
                  <Clock className="h-3 w-3" />
                  Invited
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-3">
              <div className="space-y-3">
                {typeof talent.workExperience === 'number' && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{talent.workExperience} years work experience</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span>{talent.email}</span>
                </div>
                {talent.userName && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
                      @{talent.userName}
                    </span>
                  </div>
                )}

                {(talent.githubLink ||
                  talent.linkedin ||
                  talent.personalWebsite) && (
                  <div className="flex flex-wrap gap-2">
                    {talent.githubLink && (
                      <a
                        href={talent.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                      >
                        <Github className="h-3 w-3" />
                        GitHub
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {talent.linkedin && (
                      <a
                        href={talent.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                      >
                        <Linkedin className="h-3 w-3" />
                        LinkedIn
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {talent.personalWebsite && (
                      <a
                        href={talent.personalWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                      >
                        <Link2 className="h-3 w-3" />
                        Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}

                {talent.description && (
                  <div className="rounded-lg border bg-muted/20 p-3 text-sm text-foreground/90">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      About
                    </div>
                    <div className="line-clamp-4">{talent.description}</div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-2">
                  {(talent.skills || []).map((skill: Skill, skillIndex) => (
                    <Badge
                      key={skill._id ?? `${talent._id}-skill-${skillIndex}`}
                      variant="secondary"
                      className="rounded-full text-xs font-medium px-3 py-1 bg-primary/5 hover:bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/10 dark:border-primary/30 transition-all duration-200"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <div className="px-6 py-4 bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                {/* <Button size="sm" variant="ghost">
                  Cancel
                </Button> */}
                {showDecisionActions && (
                  <>
                    <Button
                      size="sm"
                      variant="default"
                      disabled={updatingFreelancerId === talent.freelancerId}
                      className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-md hover:shadow-lg"
                      onClick={() =>
                        handleDecision(talent.freelancerId, 'SELECTED')
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={updatingFreelancerId === talent.freelancerId}
                      onClick={() =>
                        handleDecision(talent.freelancerId, 'REJECTED')
                      }
                    >
                      Reject
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1 rounded-lg"
                  onClick={() => handleViewProfile(talent.freelancerId)}
                >
                  <ExternalLink className="h-3 w-3" />
                  View Profile
                </Button>
              </div>
            </div>

            <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 dark:group-hover:border-primary/30 rounded-xl pointer-events-none transition-all duration-300" />
          </Card>
        ))
      ) : (
        <div className="col-span-full">
          <EmptyState
            icon={<User className="h-10 w-10 text-muted-foreground" />}
            title="No invited talents found"
            className="border-0 bg-transparent py-8"
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(InvitedProfileCards);
