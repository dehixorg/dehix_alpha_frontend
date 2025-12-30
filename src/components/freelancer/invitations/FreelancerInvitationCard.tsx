'use client';

import React from 'react';
import {
  MoreVertical,
  Calendar,
  Briefcase,
  CheckCircle,
  XCircle,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      className="hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={() => onViewDetails(invitation.projectId)}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-3">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base sm:text-lg truncate">
            {invitation.projectName}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1 truncate">
            {invitation.companyName}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge className={statusOutlineClasses(invitation.status)}>
              {invitation.status}
            </Badge>
            {invitation.projectStatus && (
              <Badge variant="outline" className="uppercase">
                {invitation.projectStatus}
              </Badge>
            )}
          </div>
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
        {invitation.status === FreelancerInvitationStatus.PENDING && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              disabled={isProcessing}
              onClick={(e) => {
                e.stopPropagation();
                onReject(invitation);
              }}
              className="text-destructive hover:text-destructive"
            >
              <XCircle className="mr-2 h-4 w-4" /> Reject
            </Button>
            <Button
              size="sm"
              disabled={isProcessing}
              onClick={(e) => {
                e.stopPropagation();
                onAccept(invitation);
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Accept
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FreelancerInvitationCard;
