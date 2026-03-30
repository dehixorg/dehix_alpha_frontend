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
  application?: {
    status?:
      | 'INVITED'
      | 'SELECTED'
      | 'REJECTED'
      | 'APPLIED'
      | 'LOBBY'
      | 'INTERVIEW';
  };
}
interface ProfileCardsProps {
  talents: Talent[];
  loading: boolean;
  calculateExperience: (professionalInfo: ProfessionalExperience[]) => string;
  onDecision?: (
    freelancerId: string,
    status: 'SELECTED' | 'REJECTED' | 'LOBBY' | 'INTERVIEW',
    freelancer_professional_profile_id: string | undefined,
  ) => Promise<void>;
}

const InvitedProfileCards: React.FC<ProfileCardsProps> = ({
  talents,
  loading,
  onDecision,
}) => {
  const router = useRouter();
  const [updatingFreelancerId, setUpdatingFreelancerId] = useState<
    string | null
  >(null);

  const handleViewProfile = (talentId: string) => {
    router.replace(`/freelancer-profile/${talentId}`);
  };

  const handleDecision = async (
    freelancerId: string,
    status: 'SELECTED' | 'REJECTED' | 'LOBBY' | 'INTERVIEW',
    freelancer_professional_profile_id: string | undefined,
  ) => {
    if (!onDecision || !freelancerId) return;
    try {
      setUpdatingFreelancerId(freelancerId);
      await onDecision(
        freelancerId,
        status,
        freelancer_professional_profile_id,
      );
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

  const statusLabelMap: Record<string, string> = {
    INVITED: 'Invited',
    SELECTED: 'Accepted',
    REJECTED: 'Rejected',
    APPLIED: 'Applied',
    LOBBY: 'In Lobby',
    INTERVIEW: 'Interview',
  };

  const statusStyleMap: Record<string, string> = {
    INVITED:
      'bg-amber-500/10 text-amber-700 dark:text-amber-200 border-amber-500/20',
    SELECTED:
      'bg-green-500/10 text-green-700 dark:text-green-200 border-green-500/20',
    REJECTED: 'bg-red-500/10 text-red-700 dark:text-red-200 border-red-500/20',
    APPLIED:
      'bg-blue-500/10 text-blue-700 dark:text-blue-200 border-blue-500/20',
    LOBBY:
      'bg-purple-500/10 text-purple-700 dark:text-purple-200 border-purple-500/20',
    INTERVIEW:
      'bg-indigo-500/10 text-indigo-700 dark:text-indigo-200 border-indigo-500/20',
  };

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

                {(() => {
                  const rawStatus = talent.application?.status ?? 'INVITED';
                  const label = statusLabelMap[rawStatus] ?? rawStatus;
                  const style =
                    statusStyleMap[rawStatus] ?? statusStyleMap.INVITED;

                  return (
                    <Badge
                      variant="secondary"
                      className={`flex items-center gap-1 rounded-full text-xs font-medium px-3 py-1 border ${style}`}
                    >
                      <Clock className="h-3 w-3" />
                      {label}
                    </Badge>
                  );
                })()}
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
                {(() => {
                  const currentStatus = talent.application?.status ?? 'INVITED';
                  const showAcceptReject =
                    currentStatus === 'APPLIED' ||
                    currentStatus === 'LOBBY' ||
                    currentStatus === 'INTERVIEW';
                  const showLobby = currentStatus === 'APPLIED';
                  const showInterview =
                    currentStatus === 'APPLIED' || currentStatus === 'LOBBY';

                  return (
                    <>
                      {showAcceptReject && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            disabled={
                              updatingFreelancerId === talent.freelancerId
                            }
                            className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 transition-all duration-200 shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-emerald-400/60 disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={() =>
                              handleDecision(
                                talent.freelancerId,
                                'SELECTED',
                                (talent as any).application
                                  ?.freelancer_professional_profile_id,
                              )
                            }
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={
                              updatingFreelancerId === talent.freelancerId
                            }
                            className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400 transition-all duration-200 shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-red-400/60 disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={() =>
                              handleDecision(
                                talent.freelancerId,
                                'REJECTED',
                                (talent as any).application
                                  ?.freelancer_professional_profile_id,
                              )
                            }
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {showLobby && (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={
                            updatingFreelancerId === talent.freelancerId
                          }
                          className="bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400 transition-all duration-200 shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-violet-400/60 disabled:opacity-60 disabled:cursor-not-allowed"
                          onClick={() =>
                            handleDecision(
                              talent.freelancerId,
                              'LOBBY',
                              (talent as any).application
                                ?.freelancer_professional_profile_id,
                            )
                          }
                        >
                          Add to Lobby
                        </Button>
                      )}

                      {showInterview && (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={
                            updatingFreelancerId === talent.freelancerId
                          }
                          className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-all duration-200 shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-indigo-400/60 disabled:opacity-60 disabled:cursor-not-allowed"
                          onClick={() =>
                            handleDecision(
                              talent.freelancerId,
                              'INTERVIEW',
                              (talent as any).application
                                ?.freelancer_professional_profile_id,
                            )
                          }
                        >
                          Move to Interview
                        </Button>
                      )}
                    </>
                  );
                })()}
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
