'use client';
import React, { useEffect, useState } from 'react';
import { Mail, Clock, User, MapPin, ExternalLink } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

import TalentLayout from '@/components/marketComponents/TalentLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { axiosInstance } from '@/lib/axiosinstance';
import { Skeleton } from '@/components/ui/skeleton';
    interface Skill {
      _id: string;
      name: string;
    }
  interface Talent {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePic: string;
    domainName: string;
    professionalInfo: ProfessionalExperience[];
    skills: Skill[];
  }

// Helper function to calculate experience
interface ProfessionalExperience {
  workFrom: string;
  workTo: string;
}

const calculateExperience = (professionalInfo: ProfessionalExperience[]): string => {
  if (!professionalInfo || professionalInfo.length === 0) {
    return 'Not specified';
  }

  // Find the longest work duration
  let longestExperienceInMonths: number = 0;

  professionalInfo.forEach((job: ProfessionalExperience) => {
    if (job.workFrom && job.workTo) {
      const start: Date = new Date(job.workFrom);
      const end: Date = new Date(job.workTo);
      const diffInMonths: number =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());
      if (diffInMonths > longestExperienceInMonths) {
        longestExperienceInMonths = diffInMonths;
      }
    }
  });

  const years: number = Math.floor(longestExperienceInMonths / 12);
  const months: number = longestExperienceInMonths % 12;

  if (years === 0 && months === 0) {
    return 'Less than a month';
  } else if (years === 0) {
    return `${months} month${months > 1 ? 's' : ''}`;
  } else if (months === 0) {
    return `${years} year${years > 1 ? 's' : ''}`;
  } else {
    return `${years} year${years > 1 ? 's' : ''} and ${months} month${months > 1 ? 's' : ''}`;
  }
};

const InvitedTalentsPage = () => {
  const [invitedTalents, setInvitedTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.user);
  const businessId = user?.uid;

  useEffect(() => {
    console.log('Business ID:', businessId);
    async function fetchInvitedTalents() {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `business/hire-dehixtalent/free/${businessId}/invited`
        );
        setInvitedTalents(response.data.data);
        console.log(response.data.data);
      } catch (error) {
        console.error('Error fetching invited talents:', error);
      } finally {
        setLoading(false);
      }
    }

    if (businessId) {
      fetchInvitedTalents();
    }
  }, [businessId]);

  // Skeleton Card component
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
    <TalentLayout activeTab="invited">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Invited Talents</h2>
        <span className="text-muted-foreground">
          {loading ? 'Loading...' : `Showing ${invitedTalents.length} results`}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          : invitedTalents.map((talent) => (
              <Card key={talent._id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={talent.profilePic}
                          alt={`${talent.firstName} ${talent.lastName}`}
                        />
                        <AvatarFallback>
                          {talent.firstName?.slice(0, 1).toUpperCase() || ''}
                          {talent.lastName?.slice(0, 1).toUpperCase() || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>
                          {talent.firstName} {talent.lastName}
                        </CardTitle>
                        <CardDescription>{talent.domainName}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Invited
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{calculateExperience(talent.professionalInfo)} of experience</span>
                    </div>
                {/* <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{talent.location}</span>
                </div> */}
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{talent.email}</span>
                </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {talent.skills.map((skill: Skill) => (
                        <Badge key={skill._id} variant="secondary">
                          {skill.name}
                        </Badge>
                        ))}
                    </div>
                  </div>
                </CardContent>
                <div className="flex justify-between p-6 pt-2">
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Profile
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
      </div>
    </TalentLayout>
  );
};

export default InvitedTalentsPage;