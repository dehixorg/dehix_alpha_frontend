import * as React from 'react';
import { useState, useEffect } from 'react';
import { CheckCircle, PackageOpen, Video, XCircle } from 'lucide-react';

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import { axiosInstance } from '@/lib/axiosinstance';
import { Button } from '@/components/ui/button';
import { StatusEnum } from '@/utils/freelancer/enum';
import { toast } from '@/components/ui/use-toast';

interface ProjectProfile {
  selectedFreelancer?: string[];
  totalBid?: number[];
  domain?: string;
  freelancersRequired?: string;
  skills?: string[];
  experience?: number;
  minConnect?: number;
  rate?: number;
  description?: string;
  _id?: string;
  bids?: BidDetail[];
  profiles?: any;
}

interface BidDetail {
  _id: string;
  userName: string;
  description: string;
  current_price: string;
  bid_status: StatusEnum; //enum
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserData {
  data: ProjectProfile;
}

interface BidsDetailsProps {
  id: string;
}

const BidsDetails: React.FC<BidsDetailsProps> = ({ id }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | undefined>(undefined);
  const [bids, setBids] = useState<BidDetail[]>([]);
  const [loadingBids, setLoadingBids] = useState<{ [key: string]: boolean }>(
    {},
  );
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get(`/project/${id}`);
        setUserData(response.data);
      } catch (error) {
        setError('Error fetching user data.');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong.Please try again.',
        }); // Error toast
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

  const fetchBid = React.useCallback(
    async (profileId: string) => {
      try {
        const response = await axiosInstance.get(
          `/bid/project/${id}/profile/${profileId}/bid`,
        );
        setBids(response.data?.data || []);
      } catch (e) {
        console.error(e);
      }
    },
    [id],
  );

  useEffect(() => {
    if (profileId) {
      fetchBid(profileId);
    }
  }, [profileId, fetchBid]);

  const handleUpdateStatus = async (bidId: string, status: string) => {
    try {
      setLoadingBids((prev) => ({ ...prev, [bidId]: true }));
      await axiosInstance.put(`/bid/${bidId}/status`, { status });

      setBids((prev: any) =>
        prev.map((bid: any) =>
          bid._id === bidId ? { ...bid, bid_status: status } : bid,
        ),
      );
    } catch (error) {
      console.error(`Error updating bid status for ${bidId}:`, error);
      setError('Failed to update bid status.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong.Please try again.',
      }); // Error toast
    } finally {
      setLoadingBids((prev) => ({ ...prev, [bidId]: false }));
    }
  };

  const fetchBid = async (profileId: string) => {
    try {
      const response = await axiosInstance.get(
        `/bid/project/${id}/profile/${profileId}/bid`,
      );
      setBids(response.data?.data || []);
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong.Please try again.',
      }); // Error toast
    }
  };
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="mb-8 mt-4">
        {loading ? (
          <div className="text-center py-10">
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p>{error}</p>
          </div>
        ) : userData?.data?.profiles?.length ? (
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
                <AccordionContent>
                  <div className="p-4 flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                      <p>Experience:</p>
                      <p>{profile.experience ?? 'N/A'}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <p>Min Connect:</p>
                      <p>{profile.minConnect ?? 'N/A'}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <p>Total Bids:</p>
                      <p>{bids.length}</p>
                    </div>
                  </div>
                  <Accordion type="single" collapsible>
                    {['Pending', 'Accepted', 'Rejected', 'Lobby'].map(
                      (status) => (
                        <AccordionItem key={status} value={`${status}-bids`}>
                          <AccordionTrigger>{`${status} Bids`}</AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pt-4">
                              <Carousel className="w-full">
                                <CarouselContent className="flex justify-center mt-3 gap-4">
                                  {bids.filter(
                                    (bid) => bid.bid_status === status,
                                  ).length > 0 ? (
                                    bids
                                      .filter(
                                        (bid) => bid.bid_status === status,
                                      )
                                      .map((bid) => (
                                        <CarouselItem
                                          key={bid._id}
                                          className="flex shrink-0 w-1/3 justify-center"
                                        >
                                          <Card
                                            key={bid._id}
                                            className="border border-gray-800 rounded-lg p-6  shadow-lg "
                                          >
                                            <h3 className="font-semibold text-xl mb-2">
                                              {bid.userName}
                                            </h3>
                                            <p className=" mb-4">
                                              {bid.description}
                                            </p>
                                            <div className="flex flex-col mb-4">
                                              <span className="text-sm ">
                                                Current Price: $
                                                {bid.current_price}
                                              </span>
                                            </div>

                                            <div className="flex flex-col md:flex-row justify-between mt-4 space-y-2 md:space-y-0 md:space-x-2 w-full">
                                              {(status === 'Pending' ||
                                                status === 'Lobby') && (
                                                <>
                                                  <Button
                                                    className="flex items-center justify-center bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600 transition w-full h-10 md:w-auto"
                                                    onClick={() =>
                                                      handleUpdateStatus(
                                                        bid._id,
                                                        'Accepted',
                                                      )
                                                    }
                                                    disabled={
                                                      loadingBids[bid._id]
                                                    }
                                                  >
                                                    {loadingBids[bid._id] ? (
                                                      'Loading...'
                                                    ) : (
                                                      <>
                                                        <CheckCircle className="mr-2 h-5 w-5" />{' '}
                                                        Accept
                                                      </>
                                                    )}
                                                  </Button>
                                                  <Button
                                                    className="flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition w-full h-10 md:w-auto"
                                                    onClick={() =>
                                                      handleUpdateStatus(
                                                        bid._id,
                                                        'Rejected',
                                                      )
                                                    }
                                                    disabled={
                                                      loadingBids[bid._id]
                                                    }
                                                  >
                                                    {loadingBids[bid._id] ? (
                                                      'Loading...'
                                                    ) : (
                                                      <>
                                                        <XCircle className="mr-2 h-5 w-5" />
                                                        reject
                                                      </>
                                                    )}
                                                  </Button>
                                                  <Button className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition w-full h-10 md:w-auto">
                                                    <Video className="mr-2 h-5 w-5" />
                                                    Interview
                                                  </Button>
                                                </>
                                              )}
                                            </div>
                                          </Card>
                                        </CarouselItem>
                                      ))
                                  ) : (
                                    <div className=" col-span-1 md:col-span-2 lg:col-span-3 text-gray-500">
                                      No bids to show
                                    </div>
                                  )}
                                </CarouselContent>

                                {bids.filter((bid) => bid.bid_status === status)
                                  .length > 1 && (
                                  <>
                                    <div className="flex">
                                      <CarouselPrevious className="absolute left-0 top-1 transform -translate-y-1/2 p-2 shadow-md transition-colors">
                                        Previous
                                      </CarouselPrevious>
                                      <CarouselNext className="absolute right-0 top-1 transform -translate-y-1/2 p-2 shadow-md transition-colors">
                                        Next
                                      </CarouselNext>
                                    </div>
                                  </>
                                )}
                              </Carousel>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ),
                    )}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-10 w-full mt-10">
            <PackageOpen className="mx-auto text-gray-500" size="100" />
            <p className="text-gray-500 text-lg">No bid profiles found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BidsDetails;
