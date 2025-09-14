'use client';
import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Phone,
  Calendar,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';

import TalentLayout from '@/components/marketComponents/TalentLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { axiosInstance } from '@/lib/axiosinstance';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';

// Define data types for clarity and better development experience
interface AcceptedTalent {
  _id: string;
  skillName?: string;
  domainName?: string;
  experience: string;
  description: string;
  freelancerInLobby: any[];
}

const AcceptedTalentsPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const [acceptedTalents, setAcceptedTalents] = useState<AcceptedTalent[]>([]);
  const [loading, setLoading] = useState(true);

  const businessId = user?.uid;

  useEffect(() => {
    console.log('businessId:', businessId);
    async function fetchAcceptedTalents() {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/business/hire-dehixtalent/free/${businessId}/accepted`
        );
        // Assuming the data is an array directly from the response
        setAcceptedTalents(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching accepted talents:', error);
      } finally {
        setLoading(false);
      }
    }

    if (businessId) {
      fetchAcceptedTalents();
    }
  }, [businessId]);

  // Skeleton Card component to show while loading
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
    <TalentLayout activeTab="accepted">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Accepted Talents</h2>
        <span className="text-muted-foreground">
          {loading ? 'Loading...' : `Showing ${acceptedTalents.length} results`}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          : acceptedTalents.map((job) => (
              <Card key={job._id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                      {/* Avatar is not available in the provided data */}
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {job.skillName?.slice(0, 2).toUpperCase() ||
                            job.domainName?.slice(0, 2).toUpperCase() ||
                            '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        {/* Displaying skill or domain name as the main title */}
                        <CardTitle>{job.skillName || job.domainName}</CardTitle>
                        <CardDescription>{job.description}</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Accepted
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {job.freelancerInLobby?.length || 0} freelancers in lobby
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Required experience: {job.experience} years</span>
                    </div>
                    {/* The location, phone, and availability fields are not present in the provided JSON
                    You may need to fetch more detailed freelancer data if these are needed */}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end pt-2">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Details
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
      </div>
    </TalentLayout>
  );
};

export default AcceptedTalentsPage;