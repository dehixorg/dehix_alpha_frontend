import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CheckCircle,
  Video,
  XCircle,
  Users,
  PackageOpen,
  Eye,
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
  DialogDescription,
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

// Freelancer Application Dialog Component
const FreelancerApplicationDialog = React.memo(
  ({
    freelancer,
    bidData,
    isOpen,
    onClose,
  }: {
    freelancer: Freelancer | null;
    bidData: BidDetail | null;
    isOpen: boolean;
    onClose: () => void;
  }) => {
    if (!freelancer) return null;

    const fullName =
      freelancer.firstName && freelancer.lastName
        ? `${freelancer.firstName} ${freelancer.lastName}`.trim()
        : freelancer.userName;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <FreelancerAvatar
                profilePic={freelancer.profilePic}
                userName={freelancer.userName}
              />
              <div>
                <h2 className="text-xl font-bold">{fullName}</h2>
                <p className="text-sm text-gray-500">@{freelancer.userName}</p>
              </div>
            </DialogTitle>
            <DialogDescription>
              Freelancer Application Details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Email
                  </span>
                  <p className="text-sm">{freelancer.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Role
                  </span>
                  <p className="text-sm">{freelancer.role || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Work Experience
                  </span>
                  <p className="text-sm">
                    {freelancer.workExperience
                      ? `${freelancer.workExperience} years`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Hourly Rate
                  </span>
                  <p className="text-sm">
                    {freelancer.perHourPrice
                      ? `$${freelancer.perHourPrice}/hour`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {freelancer.description && (
              <div>
                <h3 className="text-lg font-semibold mb-3">About</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {freelancer.description}
                </p>
              </div>
            )}

            {/* Cover Letter */}
            {bidData?.description && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Cover Letter</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {bidData.description}
                  </p>
                </div>
              </div>
            )}

            {/* Freelancer Profile Used */}
            {bidData?.freelancer_profile_id && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Profile Used for Application
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">
                        {bidData.freelancer_profile_id.profileName}
                      </h4>
                      {bidData.freelancer_profile_id.hourlyRate && (
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          ${bidData.freelancer_profile_id.hourlyRate}/hr
                        </p>
                      )}
                    </div>
                    {bidData.freelancer_profile_id.availability && (
                      <Badge variant="outline" className="text-xs">
                        {bidData.freelancer_profile_id.availability}
                      </Badge>
                    )}
                  </div>

                  {bidData.freelancer_profile_id.description && (
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                      {bidData.freelancer_profile_id.description}
                    </p>
                  )}

                  {/* Profile Skills */}
                  {bidData.freelancer_profile_id.skills &&
                    bidData.freelancer_profile_id.skills.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2 block">
                          Skills:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {bidData.freelancer_profile_id.skills.map(
                            (skill: any, index: number) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                              >
                                {skill.label}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {/* Profile Domains */}
                  {bidData.freelancer_profile_id.domains &&
                    bidData.freelancer_profile_id.domains.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2 block">
                          Domains:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {bidData.freelancer_profile_id.domains.map(
                            (domain: any, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300"
                              >
                                {domain.label}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {/* Profile Links */}
                  <div className="flex gap-3 text-xs">
                    {bidData.freelancer_profile_id.githubLink && (
                      <a
                        href={bidData.freelancer_profile_id.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        GitHub
                      </a>
                    )}
                    {bidData.freelancer_profile_id.linkedinLink && (
                      <a
                        href={bidData.freelancer_profile_id.linkedinLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        LinkedIn
                      </a>
                    )}
                    {bidData.freelancer_profile_id.personalWebsite && (
                      <a
                        href={bidData.freelancer_profile_id.personalWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Portfolio
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Skills */}
            {freelancer.skills && freelancer.skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {freelancer.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill.name}
                      {skill.level && ` (${skill.level})`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Domain */}
            {freelancer.domain && freelancer.domain.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Domain Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {freelancer.domain.map((domain, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {domain.name}
                      {domain.level && ` (${domain.level})`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);
FreelancerApplicationDialog.displayName = 'FreelancerApplicationDialog';

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
  const [selectedFreelancer, setSelectedFreelancer] =
    useState<Freelancer | null>(null);
  const [selectedBidData, setSelectedBidData] = useState<BidDetail | null>(
    null,
  );
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);

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

  // Handle opening application dialog
  const handleViewApplication = useCallback(
    (freelancer: Freelancer, bidData: BidDetail) => {
      setSelectedFreelancer(freelancer);
      setSelectedBidData(bidData);
      setIsApplicationDialogOpen(true);
    },
    [],
  );

  // Handle closing application dialog
  const handleCloseApplicationDialog = useCallback(() => {
    setIsApplicationDialogOpen(false);
    setSelectedFreelancer(null);
    setSelectedBidData(null);
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
            const bidData = data as BidDetail;
            return (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    freelancer && handleViewApplication(freelancer, bidData)
                  }
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
    [bids, getActionOptions, handleViewApplication],
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

      {/* Freelancer Application Dialog */}
      <FreelancerApplicationDialog
        freelancer={selectedFreelancer}
        bidData={selectedBidData}
        isOpen={isApplicationDialogOpen}
        onClose={handleCloseApplicationDialog}
      />
    </>
  );
};

export default BidsDetails;
