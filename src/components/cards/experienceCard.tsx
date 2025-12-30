import React from 'react';
import {
  Github,
  MessageSquare,
  ExternalLink,
  User,
  AlertCircle,
  Building2,
  ArrowUpRight,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DateHistory } from '@/components/shared/DateHistory';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';
import DeleteIconButton from '@/components/shared/DeleteIconButton';

export interface ExperienceCardProps {
  _id?: string;
  company: string;
  jobTitle: string;
  workDescription: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  workFrom?: Date | null;
  workTo?: Date | null;
  githubRepoLink?: string;
  comments?: string;
  className?: string;
  referencePersonName?: string;
  referencePersonContact?: string;
  employmentType?:
    | 'full-time'
    | 'part-time'
    | 'contract'
    | 'internship'
    | 'freelance';
  skills?: string[];
  onDelete?: (id?: string) => Promise<void> | void;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  _id,
  company,
  jobTitle,
  workDescription,
  referencePersonName,
  referencePersonContact,
  githubRepoLink,
  verificationStatus = 'pending',
  comments,
  className,
  workFrom,
  workTo,
  employmentType,
  skills = [],
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const employmentTypeLabels = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    contract: 'Contract',
    internship: 'Internship',
    freelance: 'Freelance',
  };

  return (
    <Card
      className={cn(
        'w-full h-full overflow-hidden rounded-xl border bg-card/60 shadow-sm transition-all duration-200 group hover:shadow-md hover:-translate-y-0.5 border-border/50 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40',
        className,
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {company}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{jobTitle}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {employmentType && (
                <Badge variant="outline" className="text-xs">
                  {employmentTypeLabels[employmentType] || employmentType}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge
              status={verificationStatus}
              className="group-hover:shadow-sm transition-shadow"
            />
            {onDelete && (
              <DeleteIconButton
                ariaLabel="Delete experience"
                onDelete={async () => {
                  if (isDeleting) return;
                  try {
                    setIsDeleting(true);
                    await onDelete?.(_id);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting}
              />
            )}
          </div>
        </div>

        {workFrom && <DateHistory startDate={workFrom} endDate={workTo} />}
      </CardHeader>

      <Separator className="group-hover:bg-primary/30 transition-colors" />

      <CardContent className="pt-6 pb-4">
        <div className="space-y-6">
          {/* Removed duplicate DateHistory component */}

          <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
            <p className="text-foreground leading-relaxed">{workDescription}</p>
          </div>

          {skills.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Skills & Technologies
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Card className="w-full h-full overflow-hidden border-border/50 hover:border-primary/20 transition-colors group bg-muted/20">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium">Reference Contact</span>
                  <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent w-full mt-1.5" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="space-y-3">
                {referencePersonName && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary/60 flex-shrink-0" />
                    <span className="text-foreground/90">
                      {referencePersonName}
                    </span>
                  </div>
                )}
                {referencePersonContact && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-foreground/90 hover:text-primary hover:bg-transparent justify-start gap-2 group"
                        asChild
                      >
                        <a
                          href={`tel:${referencePersonContact.replace(/\D/g, '')}`}
                        >
                          <div className="h-2 w-2 rounded-full bg-primary/60 flex-shrink-0 mt-0.5" />
                          <span className="truncate">
                            {referencePersonContact}
                          </span>
                          <ArrowUpRight className="h-3.5 w-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Click to call {referencePersonName || 'reference'}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>

      {(referencePersonName || referencePersonContact) && (
        <CardFooter className="pt-0 pb-6 px-6">
          {comments && (
            <div className="mt-2 p-3 bg-muted/20 rounded-lg border border-border w-full">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{comments}</p>
              </div>
            </div>
          )}
        </CardFooter>
      )}

      {(githubRepoLink || verificationStatus === 'rejected') && (
        <CardFooter className="flex flex-wrap justify-between items-center gap-3 pt-0 pb-6 px-6">
          {verificationStatus === 'rejected' && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                Please update your experience details to meet our verification
                requirements.
              </p>
            </div>
          )}

          {githubRepoLink && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 ml-auto"
              onClick={() => window.open(githubRepoLink, '_blank')}
            >
              <Github className="h-4 w-4" />
              <span>View Repository</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default ExperienceCard;
