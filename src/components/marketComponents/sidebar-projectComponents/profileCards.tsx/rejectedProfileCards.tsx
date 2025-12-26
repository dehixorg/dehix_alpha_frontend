// src/components/marketComponents/profileCards/rejectedProfileCards.tsx
'use client';
import React from 'react';
import {
  User,
  ExternalLink,
  XCircle,
  Github,
  Linkedin,
  Link2,
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
    <div className="grid grid-cols-1 gap-6">
      {loading ? (
        Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))
      ) : talents.length > 0 ? (
        talents.map((talent, index) => (
          <Card
            key={`${talent._id}-${index}`}
            className="overflow-hidden border bg-card shadow-sm transition-shadow hover:shadow-md"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {talent.firstName?.slice(0, 1).toUpperCase() || ''}
                      {talent.lastName?.slice(0, 1).toUpperCase() || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <CardTitle>
                      {talent.userName
                        ? `@${talent.userName}`
                        : `${talent.firstName} ${talent.lastName}`}
                    </CardTitle>
                    <CardDescription>
                      {talent.userName
                        ? `${talent.firstName} ${talent.lastName}`
                        : talent.role || 'N/A'}
                    </CardDescription>
                    {talent.userName && (
                      <div className="text-sm text-muted-foreground">
                        {talent.role || 'N/A'}
                      </div>
                    )}
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
                {typeof talent.workExperience === 'number' && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{talent.workExperience} years work experience</span>
                  </div>
                )}
                {talent.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>{talent.email}</span>
                  </div>
                )}
                {talent.userName && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
                      @{talent.userName}
                    </span>
                  </div>
                )}

                {(talent.githubLink ||
                  talent.linkedin ||
                  talent.personalWebsite) && (
                  <div className="flex flex-wrap gap-2">
                    {talent.githubLink && (
                      <a
                        href={talent.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                      >
                        <Github className="h-3 w-3" />
                        GitHub
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {talent.linkedin && (
                      <a
                        href={talent.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                      >
                        <Linkedin className="h-3 w-3" />
                        LinkedIn
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {talent.personalWebsite && (
                      <a
                        href={talent.personalWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                      >
                        <Link2 className="h-3 w-3" />
                        Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}

                {talent.description && (
                  <div className="rounded-lg border bg-muted/20 p-3 text-sm text-foreground/90">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      About
                    </div>
                    <div className="line-clamp-4">{talent.description}</div>
                  </div>
                )}
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
