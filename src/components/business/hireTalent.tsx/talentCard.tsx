'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { axiosInstance } from '@/lib/axiosinstance';
import InfiniteScroll from '@/components/ui/infinite-scroll';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton component
import { Dehix_Talent_Card_Pagination } from '@/utils/enum';

interface DehixTalent {
  _id: string;
  skillName?: string;
  domainName?: string;
  experience: string;
  monthlyPay: string;
  status: string;
  activeStatus: boolean;
}

interface Talent {
  Name: string;
  dehixTalent: DehixTalent;
}

interface TalentCardProps {
  skillFilter: string | null;
  domainFilter: string | null;
}

const TalentCard: React.FC<TalentCardProps> = ({
  skillFilter,
  domainFilter,
}) => {
  const [filteredTalents, setFilteredTalents] = useState<Talent[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true); // Separate state for initial loading
  const isRequestInProgress = useRef(false);

  // Function to reset state when filters change
  const resetAndFetchData = useCallback(() => {
    setTalents([]);
    setSkip(0);
    setHasMore(true);
    setInitialLoading(true); // Set initial loading to true when filters change
    fetchTalentData(0, true); // Pass 0 as the skip value to start from the beginning
  }, [skillFilter, domainFilter]);

  const fetchTalentData = useCallback(
    async (newSkip = skip, reset = false) => {
      if (isRequestInProgress.current || loading || !hasMore) return;

      try {
        isRequestInProgress.current = true;
        setLoading(true);

        const response = await axiosInstance.get(
          `freelancer/dehixTalent?limit=${Dehix_Talent_Card_Pagination.BATCH}&skip=${newSkip}`,
        );

        if (
          response.status === 404 ||
          response.data.data.length < Dehix_Talent_Card_Pagination.BATCH
        ) {
          setHasMore(false);
          return;
        }

        if (response?.data?.data) {
          setTalents((prev) =>
            reset ? response.data.data : [...prev, ...response.data.data],
          );
          setSkip(newSkip + Dehix_Talent_Card_Pagination.BATCH);
        } else {
          throw new Error('Fail to fetch data');
        }
      } catch (error) {
        console.error('Error fetching talent data', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong. Please try again.',
        });
      } finally {
        setLoading(false);
        setInitialLoading(false); // Set initial loading to false once data is fetched
        isRequestInProgress.current = false;
      }
    },
    [skip, loading, hasMore],
  );

  // Reload cards when filter changes
  useEffect(() => {
    resetAndFetchData();
  }, [skillFilter, domainFilter, resetAndFetchData]);

  // Apply the filters to the talents
  useEffect(() => {
    const filtered = talents.filter((talent) => {
      if (skillFilter == 'all' && domainFilter == 'all') {
        return true;
      } else if (
        skillFilter == 'all' &&
        domainFilter == talent.dehixTalent.domainName
      ) {
        return true;
      } else if (
        skillFilter == talent.dehixTalent.skillName &&
        domainFilter == 'all'
      ) {
        return true;
      } else if (
        skillFilter == talent.dehixTalent.skillName ||
        domainFilter == talent.dehixTalent.domainName
      ) {
        return true;
      } else {
        return false;
      }
    });
    setFilteredTalents(filtered);
  }, [skillFilter, domainFilter, talents]);

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {initialLoading ? (
        // Skeleton loader while data is being fetched
        Array.from({ length: 6 }).map((_, index) => (
          <Card
            key={index}
            className="w-full sm:w-[350px] lg:w-[450px] animate-pulse"
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex flex-col">
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-4 w-24 mt-1" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between mb-3">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="mb-3 flex items-center gap-4">
                 <Skeleton className="h-5 w-16 rounded-md " />
                 <Skeleton className="h-5 w-10 rounded-md " />
</div>

              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        filteredTalents.map((talent) => {
          const talentEntry = talent.dehixTalent;
          const label = talentEntry.skillName ? 'Skill' : 'Domain';
          const value = talentEntry.skillName || talentEntry.domainName || 'N/A';

          return (
            <Card
              key={talentEntry._id}
              className="w-full sm:w-[350px] lg:w-[450px]"
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage
                    src="/placeholder.svg?height=80&width=80"
                    alt="Profile picture"
                  />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <CardTitle>{talent.Name || 'Unknown'}</CardTitle>
                  <p className="text-sm text-muted-foreground">{value}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{label}</span>
                      <Badge>{value}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">Experience</span>
                      <Badge>{talentEntry.experience} years</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">Monthly Pay</span>
                      <Badge>${talentEntry.monthlyPay}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
      <InfiniteScroll
        hasMore={hasMore}
        isLoading={loading}
        next={fetchTalentData}
        threshold={1}
      >
        {hasMore && <Loader2 className="my-4 h-8 w-8 animate-spin" />}
      </InfiniteScroll>
    </div>
  );
};

export default TalentCard;
