// src/components/marketComponents/profileCards/rejectedProfileCards.tsx
'use client';
import React from 'react';
import { User, ExternalLink, XCircle, RefreshCw } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/EmptyState';

// Define the Skill interface as it exists in your project
interface Skill {
  _id: string;
  name: string;
}

interface RejectedProfileCardsProps {
  talents: any[];
  loading: boolean;
  calculateExperience: (professionalInfo: any[]) => string;
}

const RejectedProfileCards: React.FC<RejectedProfileCardsProps> = ({
  talents,
  loading,
  calculateExperience,
}) => {
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
      {loading ? (
        Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))
      ) : talents.length > 0 ? (
        talents.map((talent, index) => (
          // FIX 1: Use a unique key by combining _id with index
          <Card key={`${talent._id}-${index}`} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {talent.firstName?.slice(0, 1).toUpperCase() || ''}
                      {talent.lastName?.slice(0, 1).toUpperCase() || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>
                      {talent.firstName} {talent.lastName}
                    </CardTitle>
                    <CardDescription>{talent.role || 'N/A'}</CardDescription>
                  </div>
                </div>
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <XCircle className="h-3 w-3" />
                  Rejected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {calculateExperience(talent.professionalInfo)} of experience
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {talent.skills?.map((skill: Skill, skillIndex: number) => (
                    // FIX 2: Use a unique key for skills list
                    <Badge
                      key={`${talent._id}-${skillIndex}`}
                      variant="secondary"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Reconsider
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Profile
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))
      ) : (
        <div className="col-span-full">
          <EmptyState
            icon={<User className="h-10 w-10 text-muted-foreground" />}
            title="No rejected talents found"
            className="border-0 bg-transparent py-8"
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(RejectedProfileCards);
