'use client';

import type React from 'react';
import { useState } from 'react';
import { MapPin, Briefcase, Award, ExternalLink } from 'lucide-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

interface FreelancerCardProps {
  freelancer: any;
  onInvite: (freelancerId: string) => Promise<void>;
  isInvited: boolean;
}

const FreelancerCard: React.FC<FreelancerCardProps> = ({
  freelancer,
  onInvite,
  isInvited,
}) => {
  const [isInviting, setIsInviting] = useState(false);
  const [invited, setInvited] = useState(isInvited);

  const handleInvite = async () => {
    if (invited) return;

    setIsInviting(true);
    try {
      await onInvite(freelancer._id);
      setInvited(true);
      toast({
        title: 'Success',
        description: `Invitation sent to ${freelancer.name}`,
      });
    } catch (error) {
      console.error('Error inviting freelancer:', error);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={freelancer.avatar || `/placeholder.svg?height=48&width=48`}
                alt={freelancer.name}
              />
              <AvatarFallback>
                {freelancer.name?.slice(0, 2).toUpperCase() || 'FT'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{freelancer.name}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {freelancer.role || freelancer.title}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Award className="h-4 w-4 text-muted-foreground" />
            <span>{freelancer.experience || '0'} years experience</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{freelancer.location || 'Remote'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span>{freelancer.domain?.join(', ') || 'Various domains'}</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {freelancer.skills?.slice(0, 3).map((skill: string) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
            {freelancer.skills?.length > 3 && (
              <Badge variant="outline">
                +{freelancer.skills.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button size="sm" variant="outline" className="flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          View Profile
        </Button>
        <Button
          size="sm"
          onClick={handleInvite}
          disabled={isInviting || invited}
          variant={invited ? 'secondary' : 'default'}
        >
          {isInviting ? 'Inviting...' : invited ? 'Invited' : 'Invite'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FreelancerCard;
