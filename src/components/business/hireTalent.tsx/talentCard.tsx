'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { axiosInstance } from '@/lib/axiosinstance';
import InfiniteScroll from '@/components/ui/infinite-scroll';

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

const TalentCard: React.FC = () => {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 3; // Load 3 items per API request
  const isRequestInProgress = useRef(false);

  const fetchTalentData = useCallback(async () => {
    if (isRequestInProgress.current || loading || !hasMore) return;

    try {
      isRequestInProgress.current = true;
      setLoading(true);

      const response = await axiosInstance.get(
        `freelancer/dehixTalent?limit=${limit}&skip=${skip}`,
      );

      setTalents((prev) => [...prev, ...response.data.data]);
      setSkip((prev) => prev + limit);

      if (response.data.data.length < limit) {
        setHasMore(false);
      }
      if (response.status === 404) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching talent data', error);
    } finally {
      setLoading(false);
      isRequestInProgress.current = false;
    }
  }, [skip, loading, hasMore]);

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {talents.map((talent) => {
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
                    <Badge>{talentEntry.monthlyPay} USD</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
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
