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
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
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
      <CardContent className="pb-2">
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
            className="overflow-hidden border bg-card shadow-sm transition-shadow hover:shadow-md"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={talent.profilePic}
                      alt={`${talent.firstName} ${talent.lastName}`}
                    />
                    <AvatarFallback>
                      {talent.firstName?.slice(0, 1).toUpperCase() || ''}
                      {talent.lastName?.slice(0, 1).toUpperCase() || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <CardTitle>
                      {talent.userName
                        ? `@${talent.userName}`
                        : `${talent.firstName} ${talent.lastName}`}
                    </CardTitle>
                    <CardDescription>
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
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Invited
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
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
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <div className="flex justify-between p-6 pt-2">
              <div className="flex gap-2">
                {/* <Button size="sm" variant="ghost">
                  Cancel
                </Button> */}
                {showDecisionActions && (
                  <>
                    <Button
                      size="sm"
                      variant="default"
                      disabled={updatingFreelancerId === talent.freelancerId}
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
                  className="flex items-center gap-1"
                  onClick={() => handleViewProfile(talent.freelancerId)}
                >
                  <ExternalLink className="h-3 w-3" />
                  View Profile
                </Button>
              </div>
            </div>
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
