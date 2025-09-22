import React, { useState } from 'react';
import {
  Github,
  Linkedin,
  Briefcase,
  DollarSign,
  Globe,
  Layers,
  Eye,
  UserPlus,
  Award,
} from 'lucide-react';

// UI Components
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
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
interface FreelancerCardProps {
  name: string;
  skills: { name: string }[];
  domains: { name: string }[];
  experience: number | string;
  profile: string;
  userName: string;
  monthlyPay: number | string;
  githubUrl?: string;
  linkedInUrl?: string;
  websiteUrl?: string;
}

const FreelancerCard: React.FC<FreelancerCardProps> = ({
  name,
  skills = [],
  domains = [],
  experience,
  profile,
  userName,
  monthlyPay,
  githubUrl,
  linkedInUrl,
  websiteUrl,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="mx-auto max-w-[1000px] group relative overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 bg-muted-foreground/20 dark:bg-muted/20 cursor-pointer">
      <div className="md:flex md:gap-6">
        {/* Left Side - Profile */}
        <div className="p-6 md:p-8 flex flex-col items-center md:items-start md:border-r md:border-border pt-4 md:w-80 bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
          <div className="relative mb-4">
            <Avatar className="h-24 w-24 border-4 border-primary/10">
              <AvatarImage src={profile} alt={name} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
          </div>

          <CardHeader className="p-0 text-center md:text-left w-full">
            <CardTitle className="text-xl font-bold tracking-tight">
              {name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              @{userName || 'username'}
            </p>
          </CardHeader>

          <div className="mt-4 w-full">
            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground bg-muted/40">
                <Briefcase className="h-3.5 w-3.5" />
                {Number(experience) || 0} yrs
              </span>
              {Number(monthlyPay) > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground bg-muted/40">
                  <DollarSign className="h-3.5 w-3.5" />
                  {Number(monthlyPay)}/hr
                </span>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-4 flex gap-3">
            {githubUrl && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                      className="p-2 rounded-full hover:bg-accent transition-colors"
                    >
                      <Github className="h-5 w-5" />
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
                      className="p-2 rounded-full hover:bg-accent transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>LinkedIn Profile</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Right Side - Details */}
        <div className="flex-1 md:p-8 pt-4 flex flex-col">
          {/* Skills Section */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" /> Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {!skills || skills.length === 0 ? (
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground px-3 py-1 rounded-md border bg-muted/30">
                  No skills added yet
                </span>
              ) : (
                <>
                  {skills.slice(0, 6).map((skill: any, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="font-normal px-3 py-1 rounded-md"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                  {skills.length > 6 && !isExpanded && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground h-auto p-1"
                      onClick={() => setIsExpanded(true)}
                    >
                      +{skills.length - 6} more
                    </Button>
                  )}
                </>
              )}
            </div>

            {isExpanded && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {skills?.slice(6).map((skill: any, index: number) => (
                    <Badge
                      key={index + 6}
                      variant="outline"
                      className="font-normal px-3 py-1 rounded-md"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground h-auto p-1 mt-2 text-xs"
                  onClick={() => setIsExpanded(false)}
                >
                  Show less
                </Button>
              </div>
            )}
          </div>

          {/* Domains Section */}
          {domains && domains.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold mb-3 uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <Layers className="h-4 w-4" /> Domains
              </h3>
              <div className="flex flex-wrap gap-2">
                {domains.map((domain: any, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="font-normal px-3 py-1 rounded-full border-primary/20"
                  >
                    {domain.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-auto flex flex-col sm:flex-row sm:flex-row-reverse items-stretch sm:items-center gap-3 pt-5 border-t border-border">
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  className="w-full sm:min-w-[140px]"
                  aria-label="Open website"
                >
                  <Globe className="h-4 w-4 mr-2" /> Website
                </Button>
              </a>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:min-w-[140px]"
                  aria-label="View full profile"
                >
                  <Eye className="h-4 w-4 mr-2" /> View Profile
                </Button>
              </DialogTrigger>

              {/* Profile Dialog */}
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl tracking-tight">
                    Freelancer Profile
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Overview of this freelancer&lsquo;s experience, skills, and
                    domains.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-2">
                  {/* Top profile summary */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-4 border-primary/10">
                        <AvatarImage
                          src={profile}
                          alt={name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
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
                      <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground bg-muted/40">
                        <Briefcase className="h-3.5 w-3.5" />{' '}
                        {Number(experience) || 0} yrs
                      </span>
                      {Number(monthlyPay) > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground bg-muted/40">
                          <DollarSign className="h-3.5 w-3.5" />{' '}
                          {Number(monthlyPay)}/hr
                        </span>
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
                      <div className="flex flex-wrap gap-2">
                        {!skills || skills.length === 0 ? (
                          <div className="text-sm text-muted-foreground inline-flex items-center gap-2 px-3 py-1 rounded-md border bg-muted/30">
                            No skills provided
                          </div>
                        ) : (
                          skills
                            .slice(0, 10)
                            .map((skill: any, index: number) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="font-normal px-3 py-1 rounded-md"
                              >
                                {skill.name}
                              </Badge>
                            ))
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <Layers className="h-4 w-4" /> Domains
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
                        <div className="text-sm text-muted-foreground inline-flex items-center gap-2 px-3 py-1 rounded-md border bg-muted/30">
                          No domains listed
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer actions inside content for mobile stacking */}
                  <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {websiteUrl && (
                        <a
                          href={websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm" className="gap-2">
                            <Globe className="h-4 w-4" /> Website
                          </Button>
                        </a>
                      )}
                      {githubUrl && (
                        <a
                          href={githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm" className="gap-2">
                            <Github className="h-4 w-4" /> GitHub
                          </Button>
                        </a>
                      )}
                      {linkedInUrl && (
                        <a
                          href={linkedInUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm" className="gap-2">
                            <Linkedin className="h-4 w-4" /> LinkedIn
                          </Button>
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md"
                        aria-label="Hire freelancer"
                      >
                        <UserPlus className="h-4 w-4 mr-2" /> Hire Now
                      </Button>
                    </div>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              className="w-full sm:min-w-[140px] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-md hover:shadow-lg"
              aria-label="Hire freelancer"
            >
              <UserPlus className="h-4 w-4 mr-2" /> Hire Now
            </Button>
          </div>
        </div>
      </div>
      {/* Hover effect border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 dark:group-hover:border-primary/30 rounded-xl pointer-events-none transition-all duration-300"></div>
    </Card>
  );
};

export default FreelancerCard;
