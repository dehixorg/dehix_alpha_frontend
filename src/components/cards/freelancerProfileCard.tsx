import React from 'react';
import {
  Edit,
  Trash2,
  Eye,
  Globe,
  Github,
  Linkedin,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FreelancerProfile } from '@/types/freelancer';

interface FreelancerProfileCardProps {
  profile: FreelancerProfile;
  onEdit: (profile: FreelancerProfile) => void;
  onDelete: (profileId: string) => void;
  onView: (profile: FreelancerProfile) => void;
  onToggleStatus: (profileId: string, isActive: boolean) => void;
}

const FreelancerProfileCard: React.FC<FreelancerProfileCardProps> = ({
  profile,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
}) => {
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'FULL_TIME':
        return 'bg-green-500';
      case 'PART_TIME':
        return 'bg-yellow-500';
      case 'CONTRACT':
        return 'bg-blue-500';
      case 'FREELANCE':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatAvailability = (availability: string) => {
    return availability
      .replace('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {profile.profileName}
              {profile.isActive ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              {profile.description && profile.description.length > 100
                ? `${profile.description.substring(0, 100)}...`
                : profile.description || ''}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Skills */}
        <div>
          <h4 className="text-sm font-medium mb-2">Skills</h4>
          <div className="flex flex-wrap gap-1">
            {profile.skills?.slice(0, 4).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill.name}
              </Badge>
            ))}
            {profile.skills && profile.skills.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{profile.skills.length - 4} more
              </Badge>
            )}
          </div>
        </div>

        {/* Domains */}
        <div>
          <h4 className="text-sm font-medium mb-2">Domains</h4>
          <div className="flex flex-wrap gap-1">
            {profile.domains?.slice(0, 3).map((domain, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {domain.name}
              </Badge>
            ))}
            {profile.domains && profile.domains.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{profile.domains.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Projects:</span>
            <span className="ml-1 font-medium">
              {profile.projects?.length || 0}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Experience:</span>
            <span className="ml-1 font-medium">
              {profile.experiences?.length || 0}
            </span>
          </div>
        </div>

        {/* Availability and Rate */}
        <div className="space-y-2">
          {profile.availability && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Badge
                className={`text-xs ${getAvailabilityColor(profile.availability)}`}
              >
                {formatAvailability(profile.availability)}
              </Badge>
            </div>
          )}
          {profile.hourlyRate && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                ${profile.hourlyRate}/hour
              </span>
            </div>
          )}
        </div>

        {/* Links */}
        <div className="flex gap-2">
          {profile.githubLink && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                    <Github className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>GitHub Profile</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {profile.linkedinLink && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>LinkedIn Profile</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {profile.personalWebsite && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                    <Globe className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Personal Website</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex justify-between">
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(profile)}
                  className="p-2"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(profile)}
                  className="p-2"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(profile._id!)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Button
          variant={profile.isActive ? 'secondary' : 'default'}
          size="sm"
          onClick={() => onToggleStatus(profile._id!, !profile.isActive)}
        >
          {profile.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FreelancerProfileCard;
