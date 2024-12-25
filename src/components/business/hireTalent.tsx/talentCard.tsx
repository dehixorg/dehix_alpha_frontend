'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';
import InfiniteScroll from '@/components/ui/infinite-scroll';
import { toast } from '@/components/ui/use-toast';
import { Dehix_Talent_Card_Pagination, HireDehixTalentStatusEnum } from '@/utils/enum';

interface DehixTalent {
  freelancer_id: any;
  _id: string;
  skillName?: string;
  domainName?: string;
  experience: string;
  monthlyPay: string;
  status: HireDehixTalentStatusEnum;
  activeStatus: boolean;
}

interface Talent {
  freelancer_id: string;
  Name: string;
  userName: string;
  profilePic: string;
  dehixTalent: DehixTalent;
}

interface TalentCardProps {
  skillFilter: string | null;
  domainFilter: string | null;
}

const TalentCard: React.FC<TalentCardProps> = ({ skillFilter, domainFilter }) => {
  const [filteredTalents, setFilteredTalents] = useState<Talent[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isRequestInProgress = useRef(false);

  const resetAndFetchData = useCallback(() => {
    setTalents([]);
    setSkip(0);
    setHasMore(true);
    fetchTalentData(0, true);
  }, [skillFilter, domainFilter]);

  const fetchTalentData = useCallback(
    async (newSkip = skip, reset = false) => {
      if (isRequestInProgress.current || loading || !hasMore) return;

      try {
        isRequestInProgress.current = true;
        setLoading(true);

        const response = await axiosInstance.get(
          `freelancer/dehixtalent?limit=${Dehix_Talent_Card_Pagination.BATCH}&skip=${newSkip}`
        );

        if (response.data.data.length < Dehix_Talent_Card_Pagination.BATCH) {
          setHasMore(false);
        }

        setTalents((prev) =>
          reset ? response.data.data : [...prev, ...response.data.data]
        );
        setSkip(newSkip + Dehix_Talent_Card_Pagination.BATCH);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.statusCode === 404
            ? 'No more talents to load.'
            : 'Something went wrong. Please try again later.';

        setHasMore(false);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        });
      } finally {
        setLoading(false);
        isRequestInProgress.current = false;
      }
    },
    [skip, loading, hasMore]
  );

  useEffect(() => {
    resetAndFetchData();
  }, [skillFilter, domainFilter, resetAndFetchData]);

  useEffect(() => {
    const filtered = talents.filter((talent) => {
      if (skillFilter === 'all' && domainFilter === 'all') return true;
      if (skillFilter === 'all' && domainFilter === talent.dehixTalent.domainName) return true;
      if (skillFilter === talent.dehixTalent.skillName && domainFilter === 'all') return true;
      if (
        skillFilter === talent.dehixTalent.skillName ||
        domainFilter === talent.dehixTalent.domainName
      )
        return true;

      return false;
    });
    setFilteredTalents(filtered);
  }, [skillFilter, domainFilter, talents]);

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {filteredTalents.map((talent) => {
        const talentEntry = talent.dehixTalent;

        return (
          <Card key={talentEntry._id} className="w-full sm:w-[350px] lg:w-[450px]">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={talent.profilePic || '/default-avatar.png'} />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <CardTitle>{talent.Name || 'Unknown'}</CardTitle>
                <p className="text-sm text-muted-foreground">{talent.userName}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Skill</span>
                    <Badge>{talentEntry.skillName || 'N/A'}</Badge>
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
                <Link href={`/business/freelancerProfile/${talent.freelancer_id}`}>
                  <Button className="w-full">View</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
      <InfiniteScroll hasMore={hasMore} isLoading={loading} next={fetchTalentData} threshold={1}>
        {hasMore && <Loader2 className="my-4 h-8 w-8 animate-spin" />}
      </InfiniteScroll>
    </div>
  );
};

export default TalentCard;
