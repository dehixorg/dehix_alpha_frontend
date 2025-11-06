'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Briefcase, User } from 'lucide-react';
import { ProjectInvitation } from '@/types/invitation';
import { Badge } from '@/components/ui/badge';
import { statusOutlineClasses } from '@/utils/common/getBadgeStatus';

interface Props {
  invitation: ProjectInvitation;
  onViewProject?: (projectId: string) => void;
}

const InvitationCard: React.FC<Props> = ({ invitation, onViewProject }) => {
  return (
    <Card className="p-4 border border-border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{invitation.projectName}</h3>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="w-4 h-4" aria-hidden />
            <span>{invitation.profileDomain}</span>
          </div>
        </div>
        <div className="text-right">
          <Badge className={statusOutlineClasses(invitation.status)}>
            {invitation.status}
          </Badge>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <User className="w-5 h-5 text-muted-foreground" />
        <div>
          <div className="font-medium">{invitation.freelancerName}</div>
          {invitation.freelancerEmail && (
            <div className="text-sm text-muted-foreground">
              {invitation.freelancerEmail}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            Invited on {new Date(invitation.invitedAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => onViewProject?.(invitation.projectId)}
          >
            View Project
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default InvitationCard;
