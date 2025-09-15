// src/components/marketComponents/profileCards/acceptedProfileCards.tsx
'use client';
import React from 'react';
import {
  User,
  MapPin,
  Phone,
  ExternalLink,
  CheckCircle,
  Mail,
  Github,
} from 'lucide-react';

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
import { Skeleton } from '@/components/ui/skeleton';

interface AcceptedProfileCardsProps {
  talents: any[];
  loading: boolean;
  calculateExperience: (professionalInfo: any[]) => string;
}

const AcceptedProfileCards: React.FC<AcceptedProfileCardsProps> = ({
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
        talents.map((talent) => (
          <Card key={talent._id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={talent.profilePic}
                      alt={talent.firstName}
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
                    <CardDescription>{talent.role}</CardDescription>
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
                    {calculateExperience(talent.professionalInfo)} of experience
                  </span>
                </div>
                {talent.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{talent.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{talent.email}</span>
                </div>
                {talent.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{talent.phone}</span>
                  </div>
                )}
                {talent.githubLink && (
                  <div className="flex items-center gap-2 text-sm">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={talent.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      GitHub Profile
                    </a>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-2">
                  {talent.skills?.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                Accepted on{' '}
                {talent.kyc?.createdAt
                  ? new Date(talent.kyc.createdAt).toLocaleDateString()
                  : 'N/A'}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Send Message
                </Button>
                <Button size="sm" className="flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Contact
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))
      ) : (
        <p className="col-span-full text-center text-muted-foreground">
          No accepted talents found.
        </p>
      )}
    </div>
  );
};

export default React.memo(AcceptedProfileCards);