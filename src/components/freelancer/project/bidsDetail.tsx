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
} from 'lucide-react';

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
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';
import { CustomTable } from '@/components/custom-table/CustomTable';
import {
  FieldType,
  Params as TableProps,
} from '@/components/custom-table/FieldTypes';
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
];

// Memoized components
const FreelancerAvatar = React.memo(
  ({ profilePic, userName }: { profilePic?: string; userName: string }) => (
    <>
      {profilePic ? (
        <img
          src={profilePic}
          alt={userName}
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
    isFreelancerProfile,
  }: {
    isOpen: boolean;
    onClose: () => void;
    profileData: any;
    loading: boolean;
    isFreelancerProfile: boolean;
  }) => {
    if (!profileData && !loading) return null;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                {profileData?.profilePic ||
                profileData?.freelancerId?.profilePic ? (
                  <img
                    src={
                      profileData?.profilePic ||
                      profileData?.freelancerId?.profilePic
                    }
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <UserCircle className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">
                    {isFreelancerProfile
                      ? `${profileData?.firstName || ''} ${profileData?.lastName || ''}`.trim() ||
                        profileData?.userName
                      : profileData?.profileName || 'Profile Details'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {isFreelancerProfile
                      ? `@${profileData?.userName}`
                      : `@${profileData?.freelancerId?.userName || 'freelancer'}`}
                  </p>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading profile...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Header Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
                <div className="flex flex-wrap gap-4 text-sm">
                  {(profileData?.hourlyRate || profileData?.perHourPrice) && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-medium">
                        ${profileData?.hourlyRate || profileData?.perHourPrice}
                        /hr
                      </span>
                    </div>
                  )}
                  {profileData?.availability && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">
                        {profileData.availability}
                      </span>
                    </div>
                  )}
                  {profileData?.workExperience && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">
                        {profileData.workExperience} years experience
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {profileData?.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    About
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {profileData.description}
                  </p>
                </div>
              )}

              {/* Skills */}
              {profileData?.skills && profileData.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill: any, index: number) => (
                      <Badge key={index} variant="secondary">
                        {skill.label || skill.name}
                        {skill.level && ` (${skill.level})`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Domains */}
              {profileData?.domains && profileData.domains.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Domains
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.domains.map((domain: any, index: number) => (
                      <Badge key={index} variant="outline">
                        {domain.label || domain.name}
                        {domain.level && ` (${domain.level})`}
                      </Badge>
                    ))}
                  </div>
                </div>
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
                      {profileData.domain.map((domain: any, index: number) => (
                        <Badge key={index} variant="outline">
                          {domain.name}
                          {domain.level && ` (${domain.level})`}
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
                    Projects ({profileData.projects.length})
                  </h3>
                  <div className="space-y-4">
                    {profileData.projects
                      .slice(0, 3)
                      .map((project: any, index: number) => (
                        <div
                          key={index}
                          className="border-l-4 border-blue-500 pl-4 bg-gray-50 dark:bg-gray-800 p-3 rounded"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">
                              {project.projectName}
                            </h4>
                            {project.githubLink && (
                              <a
                                href={project.githubLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                GitHub ↗
                              </a>
                            )}
                          </div>
                          {project.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              {project.description}
                            </p>
                          )}
                          {project.techUsed && project.techUsed.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {project.techUsed
                                .slice(0, 4)
                                .map((tech: string, techIndex: number) => (
                                  <Badge
                                    key={techIndex}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tech}
                                  </Badge>
                                ))}
                              {project.techUsed.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{project.techUsed.length - 4} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    {profileData.projects.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        And {profileData.projects.length - 3} more projects...
                      </p>
                    )}
                  </div>
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
                            className="border-l-4 border-green-500 pl-4 bg-gray-50 dark:bg-gray-800 p-3 rounded"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">
                                  {experience.jobTitle}
                                </h4>
                                <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                                  {experience.company}
                                </p>
                              </div>
                              {experience.workFrom && experience.workTo && (
                                <span className="text-sm text-gray-500">
                                  {experience.workFrom} - {experience.workTo}
                                </span>
                              )}
                            </div>
                            {experience.workDescription && (
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {experience.workDescription}
                              </p>
                            )}
                          </div>
                        ))}
                      {profileData.experiences.length > 3 && (
                        <p className="text-sm text-gray-500 text-center">
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
                            className="border-l-4 border-green-500 pl-4 bg-gray-50 dark:bg-gray-800 p-3 rounded"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">
                                  {exp.jobTitle}
                                </h4>
                                <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                                  {exp.company}
                                </p>
                              </div>
                              {exp.workFrom && exp.workTo && (
                                <span className="text-sm text-gray-500">
                                  {exp.workFrom} - {exp.workTo}
                                </span>
                              )}
                            </div>
                            {exp.workDescription && (
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {exp.workDescription}
                              </p>
                            )}
                          </div>
                        ))}
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
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Email:
                    </span>
                    <p>
                      {profileData?.email ||
                        profileData?.freelancerId?.email ||
                        'Not provided'}
                    </p>
                  </div>
                  {(profileData?.githubLink ||
                    profileData?.linkedinLink ||
                    profileData?.personalWebsite) && (
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">
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
  const [selectedFreelancerId, setSelectedFreelancerId] = useState<
    string | null
  >(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

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
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        });
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

        // Debug: Log the bid data to see if freelancer_profile_id is populated
        console.log('Fetched bids data:', bidsData);
        bidsData.forEach((bid: any, index: number) => {
          console.log('bids are', bid);
          console.log(`Bid ${index + 1}:`, {
            bidId: bid._id,
            freelancer_profile_id: bid.freelancer_profile_id,
            hasProfile: !!bid.freelancer_profile_id,
            profileType: typeof bid.freelancer_profile_id,
            profileName: bid.freelancer_profile_id?.profileName,
            isObject:
              bid.freelancer_profile_id &&
              typeof bid.freelancer_profile_id === 'object',
          });
        });

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
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        });
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
    async (profileId: string, isFreelancerProfile: boolean = false) => {
      try {
        setLoadingProfile(true);
        let response;

        if (isFreelancerProfile) {
          // Fetch general freelancer profile
          response = await axiosInstance.get(
            `/freelancer/${profileId}/profile-info`,
          );
        } else {
          // Fetch specific freelancer profile
          response = await axiosInstance.get(
            `/freelancer/profile/${profileId}`,
          );
        }

        if (response.status === 200) {
          setProfileData(response.data.data || response.data);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch profile details.',
        });
      } finally {
        setLoadingProfile(false);
      }
    },
    [],
  );

  // Handle opening profile dialog
  const handleOpenProfileDialog = useCallback(
    (profileId: string, freelancerId: string, hasProfile: boolean) => {
      if (hasProfile) {
        setSelectedProfileId(profileId);
        setSelectedFreelancerId(null);
        fetchProfileData(profileId, false);
      } else {
        setSelectedProfileId(null);
        setSelectedFreelancerId(freelancerId);
        fetchProfileData(freelancerId, true);
      }
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

        toast({
          title: 'Success',
          description: `Bid status updated to ${status.toLowerCase()}.`,
        });
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || 'Failed to update bid status';
        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        });
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

  // Create table configuration
  const createTableConfig = useCallback(
    (status: BidStatus): TableProps => ({
      uniqueId: '_id',
      data: bids.filter((bid) => bid.bid_status === status),
      searchColumn: ['userName', 'current_price', 'description'],
      searchPlaceholder: 'Search by username, bid amount etc...',
      fields: [
        {
          textValue: 'Freelancer',
          type: FieldType.CUSTOM,
          CustomComponent: ({ data }: { data: any }) => {
            const freelancer = data?.freelancer;
            const userName =
              data?.userName || freelancer?.userName || 'Unknown';
            const fullName =
              freelancer?.firstName && freelancer?.lastName
                ? `${freelancer.firstName} ${freelancer.lastName}`.trim()
                : userName;

            return (
              <div className="flex items-center gap-3 justify-center">
                <FreelancerAvatar
                  profilePic={freelancer?.profilePic}
                  userName={userName}
                />
                <div>
                  <p className="font-medium text-white">{fullName}</p>
                  <p className="text-sm text-gray-400">@{userName}</p>
                </div>
              </div>
            );
          },
        },
        {
          textValue: 'Bid Amount',
          type: FieldType.CUSTOM,
          CustomComponent: ({ data }: { data: any }) => (
            <span className="font-medium text-green-400">
              ${data?.current_price || 'N/A'}
            </span>
          ),
        },
        {
          textValue: 'Profile Used',
          type: FieldType.CUSTOM,
          CustomComponent: ({ data }: { data: any }) => {
            const freelancerProfile = data?.freelancer_profile_id;

            if (!freelancerProfile) {
              return (
                <div className="text-center">
                  <span className="text-gray-400 text-sm">
                    No profile selected
                  </span>
                </div>
              );
            }

            return (
              <div className="text-center">
                <div className="font-medium text-white text-sm">
                  {freelancerProfile.profileName}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {freelancerProfile.skills
                    ?.slice(0, 2)
                    .map((skill: any) => skill.label)
                    .join(', ')}
                  {freelancerProfile.skills?.length > 2 &&
                    ` +${freelancerProfile.skills.length - 2}`}
                </div>
                {freelancerProfile.hourlyRate && (
                  <div className="text-xs text-green-400 mt-1">
                    ${freelancerProfile.hourlyRate}/hr
                  </div>
                )}
              </div>
            );
          },
        },
        {
          fieldName: 'bid_status',
          textValue: 'Status',
          type: FieldType.STATUS,
          statusFormats: BID_STATUS_FORMATS,
        },
        {
          textValue: 'Application',
          type: FieldType.CUSTOM,
          CustomComponent: ({ data }: { data: any }) => {
            const freelancer = data?.freelancer;
            const freelancerProfile = data?.freelancer_profile_id;

            const handleViewProfile = () => {
              if (freelancerProfile) {
                // If freelancer selected a profile, show the selected profile
                handleOpenProfileDialog(
                  freelancerProfile._id,
                  freelancer._id,
                  true,
                );
              } else if (freelancer) {
                // If no profile selected, show general freelancer profile
                handleOpenProfileDialog('', freelancer._id, false);
              }
            };

            return (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewProfile}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Button>
              </div>
            );
          },
        },
        {
          textValue: 'Actions',
          type: FieldType.ACTION,
          actions: { options: getActionOptions(status) },
        },
      ],
    }),
    [bids, getActionOptions, handleOpenProfileDialog],
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <div className="text-center py-10">
          <p>Loading...</p>
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

  if (!userData?.data?.profiles?.length) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <div className="text-center py-10 w-full mt-10">
          <PackageOpen className="mx-auto text-gray-500" size="100" />
          <p className="text-gray-500 text-lg">No bid profiles found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto p-4">
        <div className="mb-8 mt-4">
          <Accordion type="single" collapsible>
            {userData.data.profiles.map((profile: any) => (
              <AccordionItem
                key={profile._id}
                value={profile._id || ''}
                onClick={() => setProfileId(profile._id)}
              >
                <AccordionTrigger>
                  <div className="flex justify-between items-center w-full">
                    <h3 className="text-lg font-semibold">
                      {profile.domain ?? 'N/A'}
                    </h3>
                    <span className="text-gray-500">
                      Rate: {profile.rate ?? 'N/A'}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                  <div className="px-6 py-4 flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                      <p>Experience: {profile.experience ?? 'N/A'}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <p>Min Connect: {profile.minConnect ?? 'N/A'}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <p>Total Bids: {profile.totalBid?.length || 0}</p>
                    </div>
                  </div>
                  <Tabs defaultValue="PENDING" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 mb-4">
                      {BID_STATUSES.map((status) => (
                        <TabsTrigger key={status} value={status}>
                          {`${status.charAt(0) + status.slice(1).toLowerCase()} (${bidCounts[status] || 0})`}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {BID_STATUSES.map((status) => (
                      <TabsContent key={status} value={status} className="mt-4">
                        {loadingFreelancerDetails ? (
                          <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">
                              Loading freelancer details...
                            </span>
                          </div>
                        ) : (
                          <CustomTable
                            {...createTableConfig(status as BidStatus)}
                          />
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Profile Dialog */}
      <ProfileDialog
        isOpen={isProfileDialogOpen}
        onClose={handleCloseProfileDialog}
        profileData={profileData}
        loading={loadingProfile}
        isFreelancerProfile={!!selectedFreelancerId}
      />
    </>
  );
};

export default BidsDetails;
