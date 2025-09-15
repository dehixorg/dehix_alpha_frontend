'use client';
import React, { useEffect } from 'react';
import { Mail, Clock, User, ExternalLink } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// ------------------- Types -------------------
interface Skill {
  _id: string;
  name: string;
}
interface ProfessionalExperience {
  workFrom: string;
  workTo: string;
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

interface ProfileCardsProps {
  talents: Talent[];
  loading: boolean;
  calculateExperience: (professionalInfo: ProfessionalExperience[]) => string;
}

// ------------------- Component -------------------
const InvitedProfileCards: React.FC<ProfileCardsProps> = ({
  talents,
  loading,
  calculateExperience,
}) => {
  useEffect(() => {
    console.log('🔄 ProfileCards re-render because props changed');
  }, [talents, loading]);

  // Skeleton Card
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {loading
        ? Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))
        : talents.map((talent) => (
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
                    <span>
                      {calculateExperience(talent.professionalInfo)} of
                      experience
                    </span>
                  </div>
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
  );
};

// ✅ Memoize to prevent unnecessary re-renders
export default React.memo(InvitedProfileCards);
