'use client';

import React from 'react';
import {
  MoreVertical,
  Calendar,
  Briefcase,
  CheckCircle,
  XCircle,
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FreelancerInvitation,
  FreelancerInvitationStatus,
} from '@/types/freelancerInvitation';
import { statusOutlineClasses } from '@/utils/common/getBadgeStatus';

interface FreelancerInvitationCardProps {
  invitation: FreelancerInvitation;
  onAccept: (invitation: FreelancerInvitation) => void;
  onReject: (invitation: FreelancerInvitation) => void;
  onViewDetails: (projectId: string) => void;
  isProcessing: boolean;
}

const FreelancerInvitationCard: React.FC<FreelancerInvitationCardProps> = ({
  invitation,
  onAccept,
  onReject,
  onViewDetails,
  isProcessing,
}) => {
  return (
    <Card
      className="hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => onViewDetails(invitation.projectId)}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{invitation.projectName}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {invitation.companyName}
          </p>
          <Badge className={`${statusOutlineClasses(invitation.status)} mt-2`}>
            {invitation.status}
          </Badge>
        </div>
        {invitation.status === FreelancerInvitationStatus.PENDING && (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isProcessing}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onAccept(invitation)}
                  disabled={isProcessing}
                  className="cursor-pointer"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept Invitation
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onReject(invitation)}
                  disabled={isProcessing}
                  className="cursor-pointer text-destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Invitation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-3">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{invitation.profileDomain}</span>
        </div>
        {invitation.profileDescription && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {invitation.profileDescription}
          </p>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            Invited: {new Date(invitation.invitedAt).toLocaleDateString()}
          </span>
        </div>
        <Badge variant="outline" className="mt-2">
          {invitation.projectStatus}
        </Badge>
      </CardContent>
    </Card>
  );
};

export default FreelancerInvitationCard;
