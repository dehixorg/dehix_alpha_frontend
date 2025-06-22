import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CheckCircle, Video, XCircle, Users, PackageOpen } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';
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

interface BidDetail {
  _id: string;
  userName: string;
  description: string;
  current_price: string;
  bid_status: BidStatus;
  bidder_id?: string;
  freelancer?: Freelancer;
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

const BidsDetails: React.FC<BidsDetailsProps> = ({ id }) => {
  const [userData, setUserData] = useState<{ data: ProjectProfile } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string>();
  const [bids, setBids] = useState<BidDetail[]>([]);
  const [loadingBids, setLoadingBids] = useState<Record<string, boolean>>({});
  const [loadingFreelancerDetails, setLoadingFreelancerDetails] =
    useState(false);

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
          CustomComponent: ({ data }) => {
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
          CustomComponent: ({ data }) => (
            <span className="font-medium text-green-400">
              ${data?.current_price || 'N/A'}
            </span>
          ),
        },
        {
          fieldName: 'bid_status',
          textValue: 'Status',
          type: FieldType.STATUS,
          statusFormats: BID_STATUS_FORMATS,
        },
        {
          textValue: 'Actions',
          type: FieldType.ACTION,
          actions: { options: getActionOptions(status) },
        },
      ],
    }),
    [bids, getActionOptions],
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
  );
};

export default BidsDetails;
