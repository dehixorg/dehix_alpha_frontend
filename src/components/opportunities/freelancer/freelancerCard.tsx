import React, { useState } from 'react';
import {
  Github,
  Linkedin,
  Briefcase,
  DollarSign,
  Globe,
  Layers,
  Award,
  UserPlus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import InviteFreelancerDialog from '@/components/dialogs/InviteFreelancerDialog';

interface FreelancerCardProps {
  name: string;
  attributes?: { type?: string; name?: string }[];
  experience: number | string;
  profile: string;
  userName: string;
  monthlyPay: number | string;
  githubUrl?: string;
  linkedInUrl?: string;
  websiteUrl?: string;
  freelancer_id?: string;
  freelancer_professional_profile_id?: string;
}

const FreelancerCard: React.FC<FreelancerCardProps> = ({
  name,
  attributes = [],
  experience,
  profile,
  userName,
  monthlyPay,
  githubUrl,
  linkedInUrl,
  websiteUrl,
  freelancer_id,
  freelancer_professional_profile_id,
}) => {
  const SKILL_PREVIEW_COUNT = 8;
  const DOMAIN_PREVIEW_COUNT = 6;
  const skills = attributes.filter(
    (attr) => attr?.type === 'SKILL' && attr?.name,
  );
  const domains = attributes.filter(
    (attr) => attr?.type === 'DOMAIN' && attr?.name,
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDomainsExpanded, setIsDomainsExpanded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const visibleSkills = isExpanded
    ? skills
    : skills.slice(0, SKILL_PREVIEW_COUNT);
  const hiddenSkillsCount = Math.max(skills.length - SKILL_PREVIEW_COUNT, 0);
  const visibleDomains = isDomainsExpanded
    ? domains
    : domains.slice(0, DOMAIN_PREVIEW_COUNT);
  const hiddenDomainsCount = Math.max(domains.length - DOMAIN_PREVIEW_COUNT, 0);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Small helpers for cleaner UI text
  const formatExperience = (val: number | string) => {
    const n = Number(val) || 0;
    return `${n} yr${n === 1 ? '' : 's'}`;
  };
  const formatPay = (val: number | string) => {
    const n = Number(val) || 0;
    if (n <= 0) return undefined;
    return `${n}/hr`;
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsClosing(true);
      setIsDialogOpen(false);
      // Prevent the immediate next click from re-opening the dialog
      setTimeout(() => setIsClosing(false), 120);
    } else {
      if (!isClosing) setIsDialogOpen(true);
    }
  };
  const router = useRouter();

  return (
    <>
      <Card
        className="mx-auto h-full max-w-[1000px] group relative overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm transition-all duration-300 hover:shadow-md"
        role="button"
        tabIndex={0}
        onClick={() => {
          if (!isClosing) setIsDialogOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!isClosing) setIsDialogOpen(true);
          }
        }}
      >
        <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-muted-foreground/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 dark:border-gray-800 dark:bg-muted/20 sm:min-h-[208px] md:min-h-[220px] md:flex-row md:gap-4 lg:min-h-[240px] lg:gap-5">
          {/* Left Side - Profile */}
          <div className="flex flex-col items-center bg-muted-foreground/20 p-4 dark:bg-muted/20 sm:flex-row sm:items-start sm:gap-4 sm:p-4 md:w-56 md:self-stretch md:flex-col md:gap-0 md:border-r md:border-border md:p-4 lg:w-64 lg:p-5">
            <div className="relative mb-2 sm:mb-0 md:mb-2">
              <Avatar className="h-14 w-14 ring-2 ring-primary/10 sm:h-16 sm:w-16">
                <AvatarImage
                  src={profile}
                  alt={name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-muted text-sm font-semibold text-foreground/70 sm:text-base">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
            </div>

            <CardHeader className="w-full p-0 text-center sm:flex-1 sm:text-left md:flex-none">
              <CardTitle className="text-base font-semibold tracking-tight">
                {name}
              </CardTitle>
              <p className="truncate text-sm text-muted-foreground">
                @{userName || 'username'}
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge
                  variant="secondary"
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px]"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  {formatExperience(experience)}
                </Badge>
                {formatPay(monthlyPay) && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px]"
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    {formatPay(monthlyPay)}
                  </Badge>
                )}
              </div>

              {/* Social Links */}
              <div className="mt-2 flex justify-center gap-1.5 sm:justify-start">
                {githubUrl && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHub"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="GitHub"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Github className="h-4 w-4" />
                          </Button>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>GitHub Profile</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {linkedInUrl && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={linkedInUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="LinkedIn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="LinkedIn"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Linkedin className="h-4 w-4" />
                          </Button>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>LinkedIn Profile</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {websiteUrl && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Website"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="websiteUrl"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Globe className="h-4 w-4" />
                          </Button>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>LinkedIn Profile</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </CardHeader>
          </div>

          {/* Right Side - Details */}
          <div className="flex flex-1 flex-col p-4 pt-0 sm:px-4 sm:pb-4 md:min-h-0 md:p-4 md:pl-0 lg:p-5 lg:pl-0">
            {/* Skills Section */}
            <div className="mb-4 min-h-[76px]">
              <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Award className="h-4 w-4" /> Skills
              </h3>
              <div
                className={`flex flex-wrap gap-2 ${
                  isExpanded ? 'max-h-[82px] overflow-y-auto pr-1' : ''
                }`}
              >
                {!skills || skills.length === 0 ? (
                  <Badge
                    variant="outline"
                    className="font-normal px-3 py-1 rounded-md text-muted-foreground"
                  >
                    No skills added yet
                  </Badge>
                ) : (
                  <>
                    {visibleSkills.map((skill: any, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="rounded-full px-3 py-1 text-xs font-normal"
                      >
                        {skill.name}
                      </Badge>
                    ))}
                    {hiddenSkillsCount > 0 && !isExpanded && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground h-auto p-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsExpanded(true);
                        }}
                      >
                        +{hiddenSkillsCount} more
                      </Button>
                    )}

                    {isExpanded && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground h-auto p-1 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(false);
                          }}
                        >
                          Show less
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Domains Section */}
            {domains && domains.length > 0 && (
              <div className="mb-4 min-h-[76px]">
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Layers className="h-4 w-4" /> Domains
                </h3>
                <div
                  className={`flex flex-wrap gap-2 ${
                    isDomainsExpanded ? 'max-h-[82px] overflow-y-auto pr-1' : ''
                  }`}
                >
                  {visibleDomains.map((domain: any, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="rounded-full px-3 py-1 text-xs font-normal"
                    >
                      {domain.name}
                    </Badge>
                  ))}
                  {hiddenDomainsCount > 0 && (
                    <>
                      {!isDomainsExpanded ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground h-auto p-1 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDomainsExpanded(true);
                          }}
                        >
                          +{hiddenDomainsCount} more
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground h-auto p-1 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDomainsExpanded(false);
                          }}
                        >
                          Show less
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-auto flex flex-col items-stretch gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
                  {/* Profile Dialog */}
                  <DialogContent
                    className="max-w-3xl max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DialogHeader>
                      <DialogTitle className="text-2xl tracking-tight">
                        Freelancer Profile
                      </DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground">
                        Overview of this freelancer&lsquo;s experience, skills,
                        and domains.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-2">
                      {/* Top profile summary */}
                      <div
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 cursor-pointer"
                        onClick={() =>
                          router.push(`/freelancer-profile/${freelancer_id}`)
                        }
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16 ring-2 ring-primary/10">
                            <AvatarImage
                              src={profile}
                              alt={name}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-muted text-foreground/70 text-lg font-semibold">
                              {getInitials(name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h2 className="text-xl font-semibold leading-tight">
                              {name}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                              @{userName || 'username'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="secondary"
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
                          >
                            <Briefcase className="h-3.5 w-3.5" />{' '}
                            {formatExperience(experience)}
                          </Badge>
                          {formatPay(monthlyPay) && (
                            <Badge
                              variant="secondary"
                              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
                            >
                              <DollarSign className="h-3.5 w-3.5" />{' '}
                              {formatPay(monthlyPay)}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Detail sections */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium mb-2 flex items-center gap-2">
                            <Award className="h-4 w-4" /> Skills
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {!skills || skills.length === 0 ? (
                              <Badge
                                variant="outline"
                                className="text-xs px-2 py-0.5 rounded-md text-muted-foreground"
                              >
                                No skills provided
                              </Badge>
                            ) : (
                              skills
                                .slice(0, 10)
                                .map((skill: any, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs px-2 py-0.5 rounded-full"
                                  >
                                    {skill.name}
                                  </Badge>
                                ))
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Layers className="h-4 w-4 mr-1" /> Domains
                          </h3>
                          {domains && domains.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {domains.map((domain: any, index: number) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="font-normal px-3 py-1 rounded-full"
                                >
                                  {domain.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <Badge
                              variant="outline"
                              className="font-normal px-3 py-1 rounded-md text-muted-foreground"
                            >
                              No domains listed
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Footer actions inside content for mobile stacking */}
                      <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {githubUrl && (
                            <a
                              href={githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Github className="h-4 w-4" /> GitHub
                              </Button>
                            </a>
                          )}
                          {linkedInUrl && (
                            <a
                              href={linkedInUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Linkedin className="h-4 w-4" /> LinkedIn
                              </Button>
                            </a>
                          )}
                          {websiteUrl && (
                            <a
                              href={websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Globe className="h-4 w-4" /> Website
                              </Button>
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsInviteDialogOpen(true);
                                setIsDialogOpen(false);
                              }}
                            >
                              <UserPlus className="h-4 w-4" />
                              Invite
                            </Button>
                          </div>
                        </div>
                      </DialogFooter>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsInviteDialogOpen(true);
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                  Invite
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Hover effect border */}
        <div className="absolute inset-0 border border-transparent group-hover:border-primary/20 dark:group-hover:border-primary/30 rounded-xl pointer-events-none transition-all duration-300"></div>
      </Card>

      {/* Invite Freelancer Dialog */}
      <InviteFreelancerDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        freelancerId={freelancer_id || ''}
        freelancer_professional_profile_id={
          freelancer_professional_profile_id || ''
        }
        onSuccess={() => {
          setIsInviteDialogOpen(false);
        }}
      />
    </>
  );
};

export default FreelancerCard;
