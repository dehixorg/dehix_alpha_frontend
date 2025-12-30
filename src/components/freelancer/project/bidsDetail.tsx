import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CheckCircle,
  Video,
  XCircle,
  Users,
  PackageOpen,
  Eye,
  Briefcase,
  Code,
  Layers,
  BookOpen,
  UserCircle,
  Clock,
  DollarSign,
  MoreVertical,
  File,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import ProjectCard from '@/components/cards/freelancerProjectCard';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';
import { Skeleton } from '@/components/ui/skeleton';
import { profileTypeOutlineClasses } from '@/utils/common/getBadgeStatus';
import StatItem from '@/components/shared/StatItem';
import { formatCurrency } from '@/utils/format';
// Constants - Backend expects uppercase values
const BID_STATUSES = [
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'PANEL',
  'INTERVIEW',
] as const;
type BidStatus = (typeof BID_STATUSES)[number];

// Types
interface Freelancer {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  profilePic?: string;
  description?: string;
  skills?: Array<{ name: string; level: string; experience?: string }>;
  domain?: Array<{ name: string; level: string; experience?: string }>;
  workExperience?: number;
  perHourPrice?: number;
  role?: string;
}

interface FreelancerProfile {
  _id: string;
  profileName: string;
  description: string;
  skills: Array<{ _id: string; label: string }>;
  domains: Array<{ _id: string; label: string }>;
  projects: any[];
  experiences: any[];
  portfolioLinks?: string[];
  githubLink?: string;
  linkedinLink?: string;
  personalWebsite?: string;
  hourlyRate?: number;
  availability?: string;
}

interface BidDetail {
  _id: string;
  userName: string;
  description: string;
  current_price: string;
  bid_status: BidStatus;
  bidder_id?: string;
  freelancer?: Freelancer;
  freelancer_profile_id?: FreelancerProfile;
}

interface ProjectProfile {
  _id?: string;
  domain?: string;
  experience?: number;
  minConnect?: number;
  rate?: number;
  totalBid?: number[];
  profiles?: any;
}

interface BidsDetailsProps {
  id: string;
}

// Constants for status formatting
const BID_STATUS_FORMATS = [
  {
    value: 'PENDING',
    textValue: 'Pending',
    bgColor: '#D97706',
    textColor: '#FFFFFF',
  },
  {
    value: 'ACCEPTED',
    textValue: 'Accepted',
    bgColor: '#059669',
    textColor: '#FFFFFF',
  },
  {
    value: 'REJECTED',
    textValue: 'Rejected',
    bgColor: '#DC2626',
    textColor: '#FFFFFF',
  },
  {
    value: 'PANEL',
    textValue: 'Panel',
    bgColor: '#7C3AED',
    textColor: '#FFFFFF',
  },
  {
    value: 'INTERVIEW',
    textValue: 'Interview',
    bgColor: '#2563EB',
    textColor: '#FFFFFF',
  },
] as const;

// Memoized components
const FreelancerAvatar = React.memo(
  ({ profilePic, userName }: { profilePic?: string; userName: string }) => (
    <>
      {profilePic ? (
        <Image
          src={profilePic}
          alt={userName}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      <div
        className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center ${profilePic ? 'hidden' : ''}`}
      >
        <span className="text-white font-semibold text-sm">
          {userName.charAt(0).toUpperCase()}
        </span>
      </div>
    </>
  ),
);
FreelancerAvatar.displayName = 'FreelancerAvatar';
// Profile Dialog Component
const ProfileDialog = React.memo(
  ({
    isOpen,
    onClose,
    profileData,
    loading,
    bidData,
    isFreelancerProfile,
  }: {
    isOpen: boolean;
    onClose: () => void;
    profileData: any;
    loading: boolean;
    bidData: any;
    isFreelancerProfile: boolean;
  }) => {
    const router = useRouter();

    const getProfileDisplayName = (
      profileData: any,
      bidData: any,
      isFreelancerProfile: boolean,
    ): string => {
      if (isFreelancerProfile) {
        const fullName =
          `${profileData?.firstName ?? ''} ${profileData?.lastName ?? ''}`.trim();
        return (
          fullName ||
          bidData?.userName ||
          profileData?.userName ||
          'Freelancer Profile'
        );
      }

      const freelancerName =
        `${profileData?.freelancerId?.firstName ?? ''} ${profileData?.freelancerId?.lastName ?? ''}`.trim();
      return (
        freelancerName ||
        bidData?.userName ||
        profileData?.profileName ||
        'Profile Details'
      );
    };

    const getProfileUsername = (
      profileData: any,
      bidData: any,
      isFreelancerProfile: boolean,
    ): string => {
      if (bidData?.userName) {
        return bidData.userName;
      }

      if (isFreelancerProfile) {
        return profileData?.userName || 'freelancer';
      }

      return (
        profileData?.freelancerId?.userName ||
        profileData?.userName ||
        'freelancer'
      );
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Profile Details</DialogTitle>
          </DialogHeader>

          <div className="sticky top-0 border-b bg-gradient">
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div
                  className="flex items-center gap-3 min-w-0 cursor-pointer"
                  onClick={() => {
                    const freelancerId =
                      profileData?.freelancerId?._id ||
                      bidData?.bidder_id ||
                      bidData?.freelancer?._id;
                    if (freelancerId)
                      router.push(`/freelancer-profile/${freelancerId}`);
                  }}
                >
                  {profileData?.profilePic ||
                  profileData?.freelancerId?.profilePic ? (
                    <Image
                      src={
                        profileData?.profilePic ||
                        profileData?.freelancerId?.profilePic
                      }
                      alt="Profile"
                      className="h-11 w-11 rounded-full object-cover"
                      width={44}
                      height={44}
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-muted flex items-center justify-center border">
                      <UserCircle className="h-7 w-7 text-muted-foreground" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="font-semibold leading-none truncate">
                        {getProfileDisplayName(
                          profileData,
                          bidData,
                          isFreelancerProfile,
                        )}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      @
                      {getProfileUsername(
                        profileData,
                        bidData,
                        isFreelancerProfile,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(profileData?.hourlyRate || profileData?.perHourPrice) && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1.5"
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>
                      ${profileData?.hourlyRate || profileData?.perHourPrice}/hr
                    </span>
                  </Badge>
                )}
                {profileData?.availability && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1.5"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>{profileData.availability}</span>
                  </Badge>
                )}
                {profileData?.workExperience && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1.5"
                  >
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>{profileData.workExperience} yrs</span>
                  </Badge>
                )}
                {isFreelancerProfile && profileData?.role && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1.5"
                  >
                    <UserCircle className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[240px]">
                      {profileData.role}
                    </span>
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-4 sm:p-5">
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-10 w-2/3" />
              </div>
            </div>
          ) : (
            <ScrollArea className="max-h-[calc(90vh-120px)]">
              <div className="p-4 sm:p-5 pt-0 sm:pt-0 space-y-5">
                {profileData?.description && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        About
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {profileData.description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {bidData?.description && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <File className="h-4 w-4" />
                        Cover letter
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                        {bidData.description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {(profileData?.skills?.length > 0 ||
                  profileData?.domains?.length > 0 ||
                  (isFreelancerProfile && profileData?.domain?.length > 0)) && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Expertise</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {profileData?.skills?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Skills
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {profileData.skills.map(
                              (skill: any, index: number) => (
                                <Badge key={index} variant="secondary">
                                  {skill.label || skill.name}
                                  {skill.level && ` (${skill.level})`}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {profileData?.domains?.length > 0 && (
                        <>
                          {profileData?.skills?.length > 0 && <Separator />}
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Domains
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {profileData.domains.map(
                                (domain: any, index: number) => (
                                  <Badge key={index} variant="secondary">
                                    {domain.label || domain.name}
                                    {domain.level && ` (${domain.level})`}
                                  </Badge>
                                ),
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {isFreelancerProfile &&
                        profileData?.domain?.length > 0 && (
                          <>
                            {(profileData?.skills?.length > 0 ||
                              profileData?.domains?.length > 0) && (
                              <Separator />
                            )}
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Domain expertise
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {profileData.domain.map(
                                  (domain: any, index: number) => (
                                    <Badge key={index} variant="secondary">
                                      {domain.name}
                                      {domain.level && ` (${domain.level})`}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>
                          </>
                        )}
                    </CardContent>
                  </Card>
                )}

                {/* Domain for freelancer profile */}
                {isFreelancerProfile &&
                  profileData?.domain &&
                  profileData.domain.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Layers className="w-5 h-5" />
                        Domain Expertise
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profileData.domain.map(
                          (domain: any, index: number) => (
                            <Badge
                              key={index}
                              className="bg-background text-foreground border border-border hover:bg-accent hover:text-accent-foreground"
                              variant="outline"
                            >
                              {domain.name}
                              {domain.level && ` (${domain.level})`}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {/* Skills for freelancer profile */}
                {isFreelancerProfile &&
                  profileData?.skills &&
                  profileData.skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profileData.skills.map((skill: any) => (
                          <Badge
                            key={
                              skill._id ||
                              skill.id ||
                              `skill-${skill.name}-${skill.level}`
                            }
                            className="bg-background text-foreground border border-border hover:bg-accent hover:text-accent-foreground"
                            variant="outline"
                          >
                            {skill.name}
                            {skill.level && ` (${skill.level})`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Projects */}
                {profileData?.projects && profileData.projects.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Projects <Badge>{profileData.projects.length}</Badge>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profileData.projects
                        .slice(0, 4)
                        .map((project: any, index: number) => {
                          return (
                            <ProjectCard
                              key={project._id || index}
                              {...project}
                              isViewOnly={true}
                            />
                          );
                        })}
                    </div>
                    {profileData.projects.length > 4 && (
                      <p className="text-sm text-muted-foreground text-center mt-4">
                        And {profileData.projects.length - 4} more projects...
                      </p>
                    )}
                  </div>
                )}

                {/* Work Experience */}
                {profileData?.experiences &&
                  profileData.experiences.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Work Experience ({profileData.experiences.length})
                      </h3>
                      <div className="space-y-4">
                        {profileData.experiences
                          .slice(0, 3)
                          .map((experience: any, index: number) => (
                            <div
                              key={index}
                              className="bg-muted/50 p-4 rounded-lg border border-border"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-foreground text-base">
                                    {experience.jobTitle}
                                  </h4>
                                  <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mt-1">
                                    {experience.company}
                                  </p>
                                </div>
                                {experience.workFrom && experience.workTo && (
                                  <span className="text-sm text-muted-foreground font-medium ml-4 whitespace-nowrap">
                                    {new Date(
                                      experience.workFrom,
                                    ).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                    })}{' '}
                                    -{' '}
                                    {new Date(
                                      experience.workTo,
                                    ).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                    })}
                                  </span>
                                )}
                              </div>
                              {experience.workDescription && (
                                <div className="mt-3">
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {experience.workDescription}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        {profileData.experiences.length > 3 && (
                          <p className="text-sm text-muted-foreground text-center mt-4">
                            And {profileData.experiences.length - 3} more
                            experiences...
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                {/* Professional Info for freelancer profile */}
                {isFreelancerProfile &&
                  profileData?.professionalInfo &&
                  profileData.professionalInfo.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Professional Experience
                      </h3>
                      <div className="space-y-4">
                        {profileData.professionalInfo
                          .slice(0, 3)
                          .map((exp: any, index: number) => (
                            <div
                              key={index}
                              className="bg-muted/50 p-4 rounded-lg border border-border"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-foreground text-base">
                                    {exp.jobTitle}
                                  </h4>
                                  <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mt-1">
                                    {exp.company}
                                  </p>
                                </div>
                                {exp.workFrom && exp.workTo && (
                                  <span className="text-sm text-muted-foreground font-medium ml-4 whitespace-nowrap">
                                    {new Date(exp.workFrom).toLocaleDateString(
                                      'en-US',
                                      {
                                        year: 'numeric',
                                        month: 'short',
                                      },
                                    )}{' '}
                                    -{' '}
                                    {new Date(exp.workTo).toLocaleDateString(
                                      'en-US',
                                      {
                                        year: 'numeric',
                                        month: 'short',
                                      },
                                    )}
                                  </span>
                                )}
                              </div>
                              {exp.workDescription && (
                                <div className="mt-3">
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {exp.workDescription}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Work Experience for freelancer profile */}
                {isFreelancerProfile &&
                  profileData?.workExperience &&
                  profileData.workExperience > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Work Experience
                      </h3>
                      <div className="bg-muted/50 p-4 rounded-lg border border-border">
                        <p className="text-foreground leading-relaxed">
                          {profileData.workExperience} years of professional
                          experience
                        </p>
                      </div>
                    </div>
                  )}

                {/* Contact & Links */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Email:
                      </span>
                      <p>
                        {profileData?.freelancerId?.email ||
                          profileData?.email ||
                          'Not provided'}
                      </p>
                    </div>
                    {(profileData?.githubLink ||
                      profileData?.linkedinLink ||
                      profileData?.personalWebsite) && (
                      <div>
                        <span className="font-medium text-muted-foreground">
                          Links:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profileData?.githubLink && (
                            <a
                              href={profileData.githubLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              GitHub ↗
                            </a>
                          )}
                          {profileData?.linkedinLink && (
                            <a
                              href={profileData.linkedinLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              LinkedIn ↗
                            </a>
                          )}
                          {profileData?.personalWebsite && (
                            <a
                              href={profileData.personalWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Portfolio ↗
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    );
  },
);
ProfileDialog.displayName = 'ProfileDialog';

const BidsDetails: React.FC<BidsDetailsProps> = ({ id }) => {
  const [userData, setUserData] = useState<{ data: ProjectProfile } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string>();
  const [bids, setBids] = useState<BidDetail[]>([]);
  const [, setLoadingBids] = useState<Record<string, boolean>>({});
  const [loadingFreelancerDetails, setLoadingFreelancerDetails] =
    useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );
  const [, setSelectedFreelancerId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [selectedBidData, setSelectedBidData] = useState<any>(null);

  // Interview dialog state
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false);

  // Memoized bid counts
  const bidCounts = useMemo(
    () =>
      BID_STATUSES.reduce(
        (acc, status) => {
          acc[status] = bids.filter((bid) => bid.bid_status === status).length;
          return acc;
        },
        {} as Record<BidStatus, number>,
      ),
    [bids],
  );

  // Fetch project data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return;

      try {
        const response = await axiosInstance.get(`/project/${id}`);
        setUserData(response.data);
        setError(null);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || 'Failed to fetch project data';
        setError(errorMessage);
        notifyError(errorMessage, 'Error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  // Create freelancer object from API data
  const createFreelancerObject = useCallback(
    (freelancerData: any, bidderId: string, userName?: string): Freelancer => ({
      _id: freelancerData?._id || bidderId,
      userName: freelancerData?.userName || userName || '',
      firstName: freelancerData?.firstName || '',
      lastName: freelancerData?.lastName || '',
      email: freelancerData?.email || '',
      profilePic: freelancerData?.profilePic,
      description:
        freelancerData?.description || `Freelancer: ${userName || 'Unknown'}`,
      skills: freelancerData?.skills || [],
      domain: freelancerData?.domain || [],
      workExperience: freelancerData?.workExperience || 0,
      perHourPrice: freelancerData?.perHourPrice || 0,
      role: freelancerData?.role || '',
    }),
    [],
  );

  // Fetch bids and freelancer details
  const fetchBid = useCallback(
    async (profileId: string) => {
      try {
        setLoadingFreelancerDetails(true);
        setError(null);

        const response = await axiosInstance.get(
          `/bid/project/${id}/profile/${profileId}/bid`,
        );
        const bidsData = response.data?.data || [];

        if (bidsData.length === 0) {
          setBids([]);
          return;
        }

        // Get unique bidder IDs
        const uniqueBidderIds: string[] = Array.from(
          new Set(
            bidsData
              .map((bid: any) => bid.bidder_id)
              .filter((id: string) => id && id.trim()),
          ),
        );

        // Fetch freelancer data in parallel
        const freelancerMap = new Map();
        if (uniqueBidderIds.length > 0) {
          const freelancerPromises = uniqueBidderIds.map(
            async (bidderId: string) => {
              try {
                const freelancerResponse = await axiosInstance.get(
                  `/public/freelancer/${bidderId}`,
                );
                return {
                  bidderId,
                  data:
                    freelancerResponse.data?.data || freelancerResponse.data,
                };
              } catch (error: any) {
                console.warn(
                  `Failed to fetch freelancer ${bidderId}:`,
                  error.message,
                );
                return { bidderId, data: null };
              }
            },
          );

          const freelancerResults = await Promise.all(freelancerPromises);
          freelancerResults.forEach(({ bidderId, data }) => {
            freelancerMap.set(bidderId, data);
          });
        }

        // Map bids with freelancer data
        const bidsWithFreelancerDetails = bidsData.map((bid: any) => ({
          ...bid,
          freelancer: createFreelancerObject(
            freelancerMap.get(bid.bidder_id),
            bid.bidder_id,
            bid.userName,
          ),
        }));

        setBids(bidsWithFreelancerDetails);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || 'Failed to fetch bid details';
        setError(errorMessage);
        notifyError(errorMessage, 'Error');
      } finally {
        setLoadingFreelancerDetails(false);
      }
    },
    [id, createFreelancerObject],
  );

  useEffect(() => {
    if (profileId) {
      fetchBid(profileId);
    }
  }, [profileId, fetchBid]);

  // Fetch profile data for dialog
  const fetchProfileData = useCallback(
    async (
      profileId: string,
      isFreelancerProfile: boolean = false,
      freelancerIdOverride?: string,
    ) => {
      try {
        setLoadingProfile(true);
        let response;

        if (isFreelancerProfile) {
          // Fetch general freelancer profile
          response = await axiosInstance.get(`/public/freelancer/${profileId}`);
        } else {
          // Fetch specific freelancer profile
          response = await axiosInstance.get(
            `/freelancer/profile/${profileId}`,
          );
        }

        if (response.status === 200) {
          const profileData = response.data.data || response.data;

          // For specific profiles, enrich with freelancer information if we have a freelancer ID
          if (!isFreelancerProfile && freelancerIdOverride) {
            try {
              const freelancerResponse = await axiosInstance.get(
                `/public/freelancer/${freelancerIdOverride}`,
              );
              if (freelancerResponse.status === 200) {
                const freelancerData =
                  freelancerResponse.data?.data || freelancerResponse.data;
                // Merge freelancer data with profile data for better display
                profileData.freelancerId = freelancerData;
              }
            } catch (enrichError) {
              console.warn(
                'Could not enrich profile with freelancer data:',
                enrichError,
              );
            }
          }

          // If this profile has projects, enrich project data with complete freelancer data
          if (profileData.projects && profileData.projects.length > 0) {
            try {
              // Get freelancer ID - use override if provided, otherwise determine from context
              let freelancerId;
              if (freelancerIdOverride) {
                // Use the freelancer ID passed from the bid data
                freelancerId = freelancerIdOverride;
              } else if (isFreelancerProfile) {
                // For general freelancer profile, profileId IS the freelancer ID
                freelancerId = profileId;
              } else {
                // For specific freelancer profile, try to get freelancer ID from profile data
                freelancerId =
                  profileData.freelancerId || profileData.freelancer_id;

                // If still not found, we can't enrich the projects
                if (!freelancerId) {
                  console.warn(
                    '⚠️ No freelancer ID found in profile data:',
                    profileData,
                  );
                  return;
                }
              }

              if (freelancerId) {
                // Fetch complete freelancer project data using public endpoint
                const freelancerResponse = await axiosInstance.get(
                  `/public/freelancer/${freelancerId}`,
                );
                const freelancerData =
                  freelancerResponse.data?.data || freelancerResponse.data;

                if (freelancerData.projects) {
                  // Convert projects object to array if needed
                  const allFreelancerProjects = Array.isArray(
                    freelancerData.projects,
                  )
                    ? freelancerData.projects
                    : Object.values(freelancerData.projects || {});

                  // Merge profile projects with complete freelancer project data
                  const enrichedProjects = profileData.projects.map(
                    (profileProject: any) => {
                      const fullProject = allFreelancerProjects.find(
                        (fp: any) => fp._id === profileProject._id,
                      );

                      // Use full project data if available, otherwise merge with profile project data
                      let enrichedProject;
                      if (fullProject) {
                        // Use full project data but ensure all fields are present
                        enrichedProject = {
                          ...profileProject, // Start with profile project as base
                          ...fullProject, // Override with full project data
                          // Explicitly ensure these fields are copied
                          thumbnail:
                            fullProject.thumbnail || profileProject.thumbnail,
                          liveDemoLink:
                            fullProject.liveDemoLink ||
                            profileProject.liveDemoLink,
                          githubLink:
                            fullProject.githubLink || profileProject.githubLink,
                        };
                      } else {
                        enrichedProject = profileProject;
                      }
                      return enrichedProject;
                    },
                  );

                  profileData.projects = enrichedProjects;
                }
              } else {
                console.warn(
                  '⚠️ No freelancer ID found for enriching projects',
                );
              }
            } catch (projectError) {
              console.warn(
                'Could not fetch complete project data:',
                projectError,
              );
              // Continue with existing profile data if project fetch fails
            }
          }
          setProfileData(profileData);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);

        // If fetching specific profile failed and we have a freelancer ID, try fetching general freelancer profile
        if (!isFreelancerProfile && freelancerIdOverride) {
          try {
            const fallbackResponse = await axiosInstance.get(
              `/public/freelancer/${freelancerIdOverride}`,
            );
            if (fallbackResponse.status === 200) {
              const fallbackData =
                fallbackResponse.data.data || fallbackResponse.data;
              setProfileData(fallbackData);
              return;
            }
          } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
          }
        }

        notifyError('Failed to fetch profile details.', 'Error');
      } finally {
        setLoadingProfile(false);
      }
    },
    [],
  );

  // Handle opening profile dialog
  const handleOpenProfileDialog = useCallback(
    (
      profileId: string,
      freelancerId: string,
      hasProfile: boolean,
      bidData?: any,
    ) => {
      if (hasProfile) {
        // If freelancer has a profile, show the specific profile
        setSelectedProfileId(profileId);
        setSelectedFreelancerId(freelancerId); // Store freelancer ID for enrichment
        fetchProfileData(profileId, false, freelancerId); // false = specific profile
      } else {
        // If freelancer has no profile, show general freelancer profile
        setSelectedProfileId(null);
        setSelectedFreelancerId(freelancerId);
        fetchProfileData(freelancerId, true); // true = general freelancer profile
      }
      setSelectedBidData(bidData);
      setIsProfileDialogOpen(true);
    },
    [fetchProfileData],
  );

  // Handle closing profile dialog
  const handleCloseProfileDialog = useCallback(() => {
    setIsProfileDialogOpen(false);
    setSelectedProfileId(null);
    setSelectedFreelancerId(null);
    setProfileData(null);
    setSelectedBidData(null);
  }, []);

  // Interview dialog handlers
  const handleOpenInterviewDialog = useCallback(() => {
    setIsInterviewDialogOpen(true);
  }, []);

  // Update bid status
  const handleUpdateStatus = useCallback(
    async (bidId: string, status: BidStatus) => {
      try {
        setLoadingBids((prev) => ({ ...prev, [bidId]: true }));

        await axiosInstance.put(`/bid/${bidId}/status`, { bid_status: status });

        // Optimistic update
        setBids((prev) =>
          prev.map((bid) =>
            bid._id === bidId ? { ...bid, bid_status: status } : bid,
          ),
        );

        notifySuccess(
          `Bid status updated to ${status.toLowerCase()}.`,
          'Success',
        );
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || 'Failed to update bid status';
        setError(errorMessage);
        notifyError(errorMessage, 'Error');
      } finally {
        setLoadingBids((prev) => ({ ...prev, [bidId]: false }));
      }
    },
    [],
  );

  // Get action options based on bid status
  const getActionOptions = useCallback(
    (status: BidStatus) => {
      const actions = {
        accept: {
          actionName: 'Accept',
          actionIcon: <CheckCircle className="w-4 h-4 text-green-600" />,
          type: 'Button' as const,
          handler: ({ id }: { id: string }) =>
            handleUpdateStatus(id, 'ACCEPTED'),
        },
        reject: {
          actionName: 'Reject',
          actionIcon: <XCircle className="w-4 h-4 text-red-600" />,
          type: 'Button' as const,
          handler: ({ id }: { id: string }) =>
            handleUpdateStatus(id, 'REJECTED'),
        },
        panel: {
          actionName: 'Send to Panel',
          actionIcon: <Users className="w-4 h-4 text-yellow-600" />,
          type: 'Button' as const,
          handler: ({ id }: { id: string }) => handleUpdateStatus(id, 'PANEL'),
        },
        interview: {
          actionName: 'Schedule Interview',
          actionIcon: <Video className="w-4 h-4 text-blue-600" />,
          type: 'Button' as const,
          handler: ({ id }: { id: string }) =>
            handleUpdateStatus(id, 'INTERVIEW'),
        },
      };

      const statusActions: Record<BidStatus, (typeof actions.accept)[]> = {
        PENDING: [
          actions.accept,
          actions.reject,
          actions.panel,
          actions.interview,
        ],
        PANEL: [actions.accept, actions.reject, actions.interview],
        INTERVIEW: [actions.accept, actions.reject],
        ACCEPTED: [],
        REJECTED: [],
      };

      return statusActions[status] || [];
    },
    [handleUpdateStatus],
  );

  const statusFormatMap = useMemo(() => {
    return BID_STATUS_FORMATS.reduce(
      (acc, s) => {
        acc[s.value] = s;
        return acc;
      },
      {} as Record<BidStatus, (typeof BID_STATUS_FORMATS)[number]>,
    );
  }, []);

  const renderStatusBadge = (status: BidStatus) => {
    const fmt = statusFormatMap[status];
    if (!fmt) {
      return (
        <Badge variant="outline" className="text-xs">
          {status}
        </Badge>
      );
    }

    return (
      <Badge
        className="text-xs"
        style={{ backgroundColor: fmt.bgColor, color: fmt.textColor }}
      >
        {fmt.textValue}
      </Badge>
    );
  };

  const BidsTable = ({ status }: { status: BidStatus }) => {
    const rows = bids.filter((bid) => bid.bid_status === status);
    const router = useRouter();

    if (rows.length === 0) {
      return (
        <div className="py-10">
          <div className="flex flex-col items-center gap-2 text-center">
            <PackageOpen className="h-10 w-10 text-muted-foreground" />
            <div className="text-sm font-medium">No bids in this stage</div>
            <div className="text-sm text-muted-foreground">
              When bids move to {status.toLowerCase()}, they will show up here.
            </div>
          </div>
        </div>
      );
    }

    return (
      <ScrollArea className="w-full rounded-xl">
        <div className="min-w-[980px] rounded-xl">
          <Table className="rounded-xl">
            <TableHeader className="rounded-xl">
              <TableRow>
                <TableHead className="text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Freelancer
                </TableHead>
                <TableHead className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Bid Amount
                </TableHead>
                <TableHead className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Profile Used
                </TableHead>
                <TableHead className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Application
                </TableHead>
                <TableHead className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Interview
                </TableHead>
                <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground w-16">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((data) => {
                const freelancer = data?.freelancer;
                const userName =
                  data?.userName || freelancer?.userName || 'Unknown';
                const fullName =
                  freelancer?.firstName && freelancer?.lastName
                    ? `${freelancer.firstName} ${freelancer.lastName}`.trim()
                    : userName;
                const freelancerProfile = data?.freelancer_profile_id;
                const freelancerId = data?.bidder_id || freelancer?._id;

                const handleViewProfile = () => {
                  if (freelancerProfile && freelancerId) {
                    handleOpenProfileDialog(
                      freelancerProfile._id,
                      freelancerId,
                      true,
                      data,
                    );
                  } else if (freelancerId) {
                    handleOpenProfileDialog(
                      freelancerId,
                      freelancerId,
                      false,
                      data,
                    );
                  }
                };

                const actionOptions = getActionOptions(status);

                return (
                  <TableRow
                    key={data._id}
                    className="hover:bg-muted/10 transition-colors"
                  >
                    <TableCell
                      className="text-left cursor-pointer"
                      onClick={() =>
                        router.push(`/freelancer-profile/${freelancerId}`)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <FreelancerAvatar
                          profilePic={freelancer?.profilePic}
                          userName={userName}
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-foreground line-clamp-1">
                            {fullName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            @{userName}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="font-medium text-foreground">
                        {data?.current_price
                          ? formatUSD(Number(data.current_price))
                          : 'N/A'}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      {freelancerProfile ? (
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium text-foreground">
                            {freelancerProfile.profileName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {freelancerProfile.skills
                              ?.slice(0, 2)
                              .map((skill: any) => skill.label)
                              .join(', ')}
                            {freelancerProfile.skills?.length > 2
                              ? ` +${freelancerProfile.skills.length - 2}`
                              : ''}
                          </div>
                          {freelancerProfile.hourlyRate && (
                            <div className="text-xs text-muted-foreground">
                              {formatUSD(freelancerProfile.hourlyRate)}/hr
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No profile selected
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {renderStatusBadge(data.bid_status)}
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleViewProfile}
                        className="h-8"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenInterviewDialog}
                        className="h-8"
                      >
                        <Video className="mr-2 h-4 w-4" />
                        Interview
                      </Button>
                    </TableCell>

                    <TableCell className="text-right">
                      {actionOptions.length > 0 ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-label="Bid actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actionOptions.map((opt: any) => (
                              <DropdownMenuItem
                                key={opt.actionName}
                                onClick={() => opt.handler({ id: data._id })}
                                className="cursor-pointer flex items-center gap-2"
                              >
                                {opt.actionIcon}
                                <span className="text-sm font-medium">
                                  {opt.actionName}
                                </span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <></>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
  };

  // Format rate nicely in USD
  const formatUSD = (value?: number | string | null) => {
    if (value === null || value === undefined || isNaN(Number(value)))
      return 'N/A';
    const fractionDigits = 2; // USD typically uses 2 decimal places
    return formatCurrency(value, 'USD', fractionDigits, fractionDigits);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 animate-in fade-in-50">
        <div className="space-y-6">
          <div className="h-8 w-64">
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-3/4" />
          </div>
          <div className="mt-4">
            <Skeleton className="h-6 w-40 mb-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto p-4">
        <Accordion type="single" collapsible>
          {userData!.data.profiles.map((profile: any) => (
            <AccordionItem
              key={profile._id}
              value={profile._id || ''}
              onClick={() => setProfileId(profile._id)}
              className="mb-3 overflow-hidden rounded-xl border card shadow-sm"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between w-full">
                  <h4 className="text-base sm:text-lg font-semibold tracking-tight">
                    {profile.domain ?? 'N/A'}
                  </h4>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`text-xs px-2 py-0.5 rounded ${profileTypeOutlineClasses(profile.profileType)}`}
                    >
                      {profile?.profileType || 'FREELANCER'}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-xs px-2 mr-2 py-0.5 rounded-md"
                    >
                      {formatUSD(profile.rate)}
                      {formatUSD(profile.rate) !== 'N/A' ? '/hr' : ''}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-4">
                    <StatItem
                      color="green"
                      icon={
                        <Briefcase className="w-4 h-4 text-green-600 dark:text-green-400" />
                      }
                      label="Experience"
                      value={profile.experience ?? 'N/A'}
                    />
                    <StatItem
                      color="amber"
                      icon={
                        <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      }
                      label="Min Connect"
                      value={profile.minConnect ?? 'N/A'}
                    />
                    <StatItem
                      color="blue"
                      icon={
                        <PackageOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      }
                      label="Total Bids"
                      value={profile.totalBid?.length || 0}
                    />
                  </div>

                  <Tabs defaultValue="PENDING" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-2 rounded-md bg-muted/30 p-1 mb-4">
                      {BID_STATUSES.map((status) => (
                        <TabsTrigger
                          key={status}
                          value={status}
                          className="justify-between gap-2"
                        >
                          <span className="truncate">
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </span>
                          <Badge
                            variant="secondary"
                            className="h-5 px-2 text-[10px]"
                          >
                            {bidCounts[status] || 0}
                          </Badge>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {BID_STATUSES.map((status) => (
                      <TabsContent key={status} value={status} className="mt-4">
                        {loadingFreelancerDetails ? (
                          <div className="space-y-4 py-4">
                            <div className="flex justify-between items-center">
                              <Skeleton className="h-8 w-48" />
                              <Skeleton className="h-9 w-32" />
                            </div>
                            <div className="space-y-2">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                  <div className="flex items-center space-x-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2">
                                      <Skeleton className="h-4 w-32" />
                                      <Skeleton className="h-3 w-24" />
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-9 w-24" />
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <Skeleton className="h-8 w-24" />
                              <div className="flex space-x-2">
                                <Skeleton className="h-9 w-9 rounded-md" />
                                <Skeleton className="h-9 w-9 rounded-md" />
                                <Skeleton className="h-9 w-9 rounded-md" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Card className="border border-border/60 rounded-2xl shadow-sm bg-card/95">
                            <CardContent className="p-0">
                              <BidsTable status={status as BidStatus} />
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <ProfileDialog
        isOpen={isProfileDialogOpen}
        onClose={handleCloseProfileDialog}
        profileData={profileData}
        loading={loadingProfile}
        isFreelancerProfile={!selectedProfileId}
        bidData={selectedBidData}
      />

      <Dialog
        open={isInterviewDialogOpen}
        onOpenChange={setIsInterviewDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              Work in Progress
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-6xl mb-4">🚧</div>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Interview functionality is currently under development.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BidsDetails;
