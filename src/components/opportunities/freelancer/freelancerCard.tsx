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
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import ConnectsDialog from '@/components/shared/ConnectsDialog';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifySuccess, notifyError } from '@/utils/toastMessage';
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
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: RootState) => state.user);

  const handleHireNow = async () => {
    // Backend will deduct connects; show toast and sync remaining connects locally
    const requiredConnects = parseInt(
      process.env.NEXT_PUBLIC__APP_HIRE_TALENT_COST || '0',
      10,
    );
    try {
      const res = await axiosInstance.post(`/business/hire-dehixtalent/hire-now`);
      const remaining = res?.data?.remainingConnects;
      if (typeof remaining === 'number') {
        localStorage.setItem('DHX_CONNECTS', String(remaining));
        // Trigger a global event so header wallet rerenders
        window.dispatchEvent(new Event('connectsUpdated'));
      }
      notifySuccess(
        `Deducted ${requiredConnects} connects.${
          typeof remaining === 'number' ? ` Remaining: ${remaining}` : ''
        }`,
        'Hire Now successful',
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        (error?.response?.status === 400
          ? 'Insufficient connects to proceed.'
          : 'Failed to complete Hire Now. Please try again.');
      notifyError(message, 'Hire Now failed');
      throw error; // keep ConnectsDialog loading UX consistent
    }
  };

  const noopValidate = async () => true;

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

  return (
    <Card className="mx-auto max-w-[1000px] group relative overflow-hidden rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border border-border/60 bg-background">
      <div className="md:flex md:gap-6 border border-gray-200 dark:border-gray-800 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 bg-muted-foreground/20 dark:bg-muted/20">
        {/* Left Side - Profile */}
  <div className="flex flex-col items-center md:items-start md:border-r md:border-border md:pr-6 md:w-80 p-4 pr-0 md:p-6 bg-muted-foreground/20 dark:bg-muted/20">
          <div className="relative mb-3">
            <Avatar className="h-20 w-20 ring-2 ring-primary/10">
              <AvatarImage src={profile} alt={name} className="object-cover" />
              <AvatarFallback className="bg-muted text-foreground/70 text-lg font-semibold">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
          </div>

          <CardHeader className="p-0 text-center md:text-left w-full">
            <CardTitle className="text-lg font-semibold tracking-tight">
              {name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              @{userName || 'username'}
            </p>
          </CardHeader>

          <div className="mt-4 w-full">
            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
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
          </div>

          {/* Social Links */}
          <div className="mt-3 flex gap-2">
            {githubUrl && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="GitHub"
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
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="LinkedIn"
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
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="websiteUrl"
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
        </div>

        {/* Right Side - Details */}
        <div className="flex-1 flex flex-col p-4 md:p-6 md:pl-0">
          {/* Skills Section */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" /> Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {!skills || skills.length === 0 ? (
                <Badge
                  variant="outline"
                  className="font-normal px-3 py-1 rounded-md text-muted-foreground"
                >
                  No skills added yet
                </Badge>
              ) : (
                <>
                  {skills.slice(0, 8).map((skill: any, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="font-normal px-3 py-1 rounded-full"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                  {skills.length > 8 && !isExpanded && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground h-auto p-1 text-xs"
                      onClick={() => setIsExpanded(true)}
                    >
                      +{skills.length - 8} more
                    </Button>
                  )}

                  {isExpanded && (
                    <div className="flex flex-wrap gap-2">
                      {skills?.slice(8).map((skill: any, index: number) => (
                        <Badge
                          key={index + 8}
                          variant="secondary"
                          className="font-normal px-3 py-1 rounded-full"
                        >
                          {skill.name}
                        </Badge>
                      ))}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground h-auto p-1 text-xs"
                        onClick={() => setIsExpanded(false)}
                      >
                        Show less
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
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
                    className="font-normal px-3 py-1 rounded-full"
                  >
                    {domain.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-auto flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-3 pt-5 border-t border-border">
            <div className="flex items-center gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    ria-label="View full profile"
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
                      Overview of this freelancer&lsquo;s experience, skills,
                      and domains.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 py-2">
                    {/* Top profile summary */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
                        {websiteUrl && (
                          <a
                            href={websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
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
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
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
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
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
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <Globe className="h-4 w-4" /> Website
                            </Button>
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <ConnectsDialog
                          form={{} as any}
                          loading={loading}
                          setLoading={setLoading}
                          onSubmit={handleHireNow}
                          isValidCheck={noopValidate}
                          userId={user?.uid}
                          buttonText="Hire Now"
                          userType="BUSINESS"
                          requiredConnects={parseInt(
                            process.env.NEXT_PUBLIC__APP_HIRE_TALENT_COST || '0',
                            10,
                          )}
                          skipRedirect
                        />
                      </div>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <ConnectsDialog
              form={{} as any}
              loading={loading}
              setLoading={setLoading}
              onSubmit={handleHireNow}
              isValidCheck={noopValidate}
              userId={user?.uid}
              buttonText="Hire Now"
              userType="BUSINESS"
              requiredConnects={parseInt(
                process.env.NEXT_PUBLIC__APP_HIRE_TALENT_COST || '0',
                10,
              )}
              skipRedirect
            />
          </div>
        </div>
      </div>
      {/* Hover effect border */}
      <div className="absolute inset-0 border border-transparent group-hover:border-primary/20 dark:group-hover:border-primary/30 rounded-xl pointer-events-none transition-all duration-300"></div>
    </Card>
  );
};

export default FreelancerCard;
