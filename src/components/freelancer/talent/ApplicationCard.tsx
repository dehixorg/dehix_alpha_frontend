import { Briefcase, CalendarDays, FileText } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ApplicationCardProps = {
  companyName: string;
  contactName: string;
  profilePic?: string;
  initials: string;
  status: string;
  talentName?: string;
  experience?: string | number;
  description?: string;
  postStatus?: string;
  postUpdatedAt?: string | number | Date;
  updatedAt?: string | number | Date;
  coverLetter?: string;
  activeStatus:
    | 'APPLIED'
    | 'SELECTED'
    | 'REJECTED'
    | 'INVITED'
    | 'LOBBY'
    | 'INTERVIEW';
  isApplying: boolean;
  onApply: () => void;
};

const ApplicationCard = ({
  companyName,
  contactName,
  profilePic,
  initials,
  status,
  talentName,
  experience,
  description,
  postStatus,
  postUpdatedAt,
  updatedAt,
  coverLetter,
  activeStatus,
  isApplying,
  onApply,
}: ApplicationCardProps) => {
  return (
    <Card className="h-full overflow-hidden border-border/60 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profilePic} alt={companyName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="text-base leading-none truncate">
                {companyName}
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground truncate">
                {contactName || 'Business contact'}
              </p>
            </div>
          </div>

          <Badge
            variant="secondary"
            className="shrink-0 rounded-full text-[10px] font-semibold uppercase tracking-wide"
          >
            {status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex h-full flex-col gap-3 text-sm">
        {(talentName || experience) && (
          <p className="text-xs font-medium text-primary uppercase tracking-wide">
            {talentName}
            {experience ? ` · ${experience} yrs exp` : ''}
          </p>
        )}

        {description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {description}
          </p>
        )}

        <div className="grid gap-2">
          {(postStatus || postUpdatedAt) && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Post</span>
                <Badge
                  variant="outline"
                  className="rounded-full text-[10px] font-semibold uppercase tracking-wide"
                >
                  {postStatus || 'NA'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {postUpdatedAt && (
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {new Date(postUpdatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Last updated</span>
            </div>
            <span className="text-[11px] text-muted-foreground shrink-0">
              {updatedAt ? new Date(updatedAt).toLocaleDateString() : 'NA'}
            </span>
          </div>
        </div>

        {coverLetter && (
          <div className="rounded-md border border-border/60 bg-muted/20 p-3 text-xs">
            <div className="mb-2 flex items-center gap-2 text-foreground">
              <FileText className="h-4 w-4" />
              <p className="font-medium">Cover letter</p>
            </div>
            <p className="line-clamp-3 whitespace-pre-line text-muted-foreground leading-relaxed">
              {coverLetter}
            </p>
          </div>
        )}

        <div className="border-t pt-3 border-border/60 flex items-center justify-end">
          {activeStatus === 'INVITED' ? (
            <Button
              size="sm"
              variant="outline"
              type="button"
              disabled={isApplying}
              onClick={onApply}
            >
              {isApplying ? 'Applying...' : 'Apply'}
            </Button>
          ) : (
            <Button size="sm" variant="outline" type="button">
              View details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationCard;
