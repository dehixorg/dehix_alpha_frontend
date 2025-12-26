// src/components/marketComponents/profileCards/acceptedProfileCards.tsx
'use client';
import {
  User,
  MapPin,
  Phone,
  CheckCircle,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/EmptyState';

// Define the Skill interface as it exists in your project
interface Skill {
  _id: string;
  name: string;
}

interface AcceptedProfileCardsProps {
  talents: any[];
  loading: boolean;
  calculateExperience: (professionalInfo: any[]) => string;
}

const AcceptedProfileCards: React.FC<AcceptedProfileCardsProps> = ({
  talents,
  loading,
  calculateExperience: _calculateExperience,
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
                    <AvatarImage
                      src={talent.profilePic}
                      alt={talent.firstName}
                    />
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
                        : talent.role}
                    </CardDescription>
                    {talent.userName && (
                      <div className="text-sm text-muted-foreground">
                        {talent.role}
                      </div>
                    )}
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
                {typeof talent.workExperience === 'number' && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{talent.workExperience} years work experience</span>
                  </div>
                )}
                {talent.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{talent.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span>{talent.email}</span>
                </div>
                {talent.userName && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
                      @{talent.userName}
                    </span>
                  </div>
                )}
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
                {talent.linkedin && (
                  <div className="flex items-center gap-2 text-sm">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={talent.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {talent.personalWebsite && (
                  <div className="flex items-center gap-2 text-sm">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={talent.personalWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Website
                    </a>
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
            <CardFooter className="flex justify-between pt-2" />
          </Card>
        ))
      ) : (
        <div className="col-span-full">
          <EmptyState
            icon={<User className="h-10 w-10 text-muted-foreground" />}
            title="No accepted talents found"
            className="border-0 bg-transparent py-8"
          />
        </div>
      )}
    </div>
  );
};

export default AcceptedProfileCards;
