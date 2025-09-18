'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Loader2,
  UserCircle,
  ChevronDown,
  X,
  FileText,
  Award,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  SendHorizonal,
  PlusCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Profile {
  _id: string;
  domain: string;
  freelancersRequired: number;
  skills: string[];
  experience: number;
  minConnect?: number;
  rate?: number;
  description?: string;
  profileType: 'FREELANCER' | 'CONSULTANT';
}

interface FreelancerProfile {
  _id: string;
  profileName: string;
  description: string;
  skills: Array<{ _id: string; label: string }>;
  domains: Array<{ _id: string; label: string }>;
  projects: any[];
  experiences: any[];
  portfolioLinks?: string[];
  githubLink?: string;
  linkedinLink?: string;
  personalWebsite?: string;
  hourlyRate?: number;
  availability?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ProjectData {
  _id: string;
  projectName: string;
  projectDomain: string[];
  description: string;
  companyName: string;
  skillsRequired?: string[];
  status: string;
  projectType: string;
  profiles?: Profile[];
  bids?: Bid[];
  budget: Budget;
  createdAt: string;
  updatedAt?: string;
}

interface Bid {
  _id: string;
  userName: string;
  current_price: number;
  bid_status: string;
  description: string;
}

interface Budget {
  type: 'fixed' | 'hourly';
  hourly?: {
    minRate: number;
    maxRate: number;
    estimatedHours?: number;
  };
  fixedAmount?: number;
}

interface ProjectApplicationFormProps {
  project: ProjectData;
  isLoading: boolean;
  onCancel: () => void;
  bidExist?: boolean;
}

const ProjectApplicationForm = ({
  project,
  isLoading,
  onCancel,
}: ProjectApplicationFormProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string>('');
  const minChars = 500;
  const maxChars = 2000;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [freelancerProfiles, setFreelancerProfiles] = useState<
    FreelancerProfile[]
  >([]);
  const [selectedFreelancerProfile, setSelectedFreelancerProfile] =
    useState<FreelancerProfile | null>(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [appliedProfileIds, setAppliedProfileIds] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const user = useSelector((state: RootState) => state.user);
  const [userConnects, setUserConnects] = useState<number>(0);

  useEffect(() => {
    const connects = parseInt(localStorage.getItem('DHX_CONNECTS') || '0', 10);
    setUserConnects(connects);
    console.log(userConnects);

    const handleConnectsUpdated = () => {
      const updatedConnects = parseInt(
        localStorage.getItem('DHX_CONNECTS') || '0',
        10,
      );
      setUserConnects(updatedConnects);
    };

    window.addEventListener('connectsUpdated', handleConnectsUpdated);
    return () => {
      window.removeEventListener('connectsUpdated', handleConnectsUpdated);
    };
  }, [user.uid]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        showProfileDropdown &&
        !target.closest('.profile-dropdown-container')
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const fetchFreelancerProfiles = useCallback(async () => {
    if (!user.uid) return;

    setIsLoadingProfiles(true);
    try {
      let apiEndpoint = '/freelancer/profiles';
      if (selectedProfile?.profileType === 'CONSULTANT') {
        apiEndpoint = '/freelancer/consultant';
      }

      const response = await axiosInstance.get(apiEndpoint);
      let profilesData = response.data.data;

      if (profilesData && profilesData.consultant) {
        const consultantData = profilesData.consultant;
        profilesData = Object.values(consultantData);
      }

      const finalProfiles = Array.isArray(profilesData) ? profilesData : [];
      setFreelancerProfiles(finalProfiles);
    } catch (error) {
      console.error('Error fetching freelancer profiles:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load your profiles. Please try again.',
      });
      setFreelancerProfiles([]);
    } finally {
      setIsLoadingProfiles(false);
    }
  }, [user.uid, selectedProfile?.profileType]);

  const fetchAppliedData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/bid/${user.uid}/bid`);
      const profilesUserAppliedFor = response.data.data
        .filter(
          (bid: any) =>
            bid.project_id === project._id && bid.bidder_id === user.uid,
        )
        .map((bid: any) => bid.profile_id);
      setAppliedProfileIds(profilesUserAppliedFor);
    } catch (error) {
      console.error('API Error fetching applied data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to retrieve application status. Please try again.',
      });
    }
  }, [user.uid, project._id, project.profiles]);

  useEffect(() => {
    const loadData = async () => {
      await fetchAppliedData();
      if (selectedProfile) {
        await fetchFreelancerProfiles();
      }
    };
    loadData();
  }, [fetchAppliedData, fetchFreelancerProfiles, selectedProfile]);

  const handleApplyClick = () => {
    if (!selectedProfile) {
      toast({
        title: 'Action Required',
        description: 'Please select a profile to apply with before proceeding.',
        variant: 'destructive',
      });
      return;
    }
    setDialogOpen(true);
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProfile?._id) {
      toast({
        title: 'Error',
        description: 'No profile selected for bidding',
        variant: 'destructive',
      });
      return;
    }

    const currentConnects = parseInt(
      localStorage.getItem('DHX_CONNECTS') || '0',
      10,
    );

    if (
      isNaN(bidAmount) ||
      isNaN(currentConnects) ||
      bidAmount > currentConnects
    ) {
      toast({
        title: 'Insufficient Connects',
        description: 'You do not have enough connects to place this bid.',
        variant: 'destructive',
      });
      return;
    }

    if (coverLetter.length < minChars) {
      toast({
        title: 'Cover Letter Too Short',
        description: `Please write at least ${minChars} characters.`,
        variant: 'destructive',
      });
      return;
    }

    if (coverLetter.length > maxChars) {
      toast({
        title: 'Cover Letter Too Long',
        description: `Maximum allowed is ${maxChars} characters.`,
        variant: 'destructive',
      });
      return;
    }
    try {
      const bidData = {
        current_price: bidAmount,
        description: coverLetter,
        bidder_id: user.uid,
        profile_id: selectedProfile._id,
        project_id: project._id,
        biddingValue: bidAmount,
        profile_type: selectedProfile.profileType || 'FREELANCER',
        ...(selectedFreelancerProfile?._id && {
          freelancer_profile_id: selectedFreelancerProfile._id,
        }),
      } as const;

      await axiosInstance.post('/bid', bidData);

      const updatedConnects = (currentConnects - bidAmount).toString();
      localStorage.setItem('DHX_CONNECTS', updatedConnects);
      window.dispatchEvent(new Event('connectsUpdated'));

      // Reset form state
      setBidAmount(0);
      setDialogOpen(false);
      setCoverLetter('');
      setSelectedFreelancerProfile(null);

      // Show success message
      toast({
        title: 'Application Submitted',
        description: 'Your application has been successfully submitted.',
      });

      // Refresh data
      await fetchAppliedData();
    } catch (error: unknown) {
      console.error('Error submitting bid:', error);

      let errorMessage = 'Failed to submit application. Please try again.';
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response: any }).response;
        if (response?.data?.message) {
          errorMessage = response.data.message;
        }
      }

      toast({
        title: 'Submission Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleCoverLetterChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const value = e.target.value.replace(/\s{10,}/g, ' ').replace(/^\s+/, '');
    if (value.length <= maxChars) {
      setCoverLetter(value);
    }
  };

  const hasAppliedToSelectedProfile = selectedProfile
    ? appliedProfileIds.includes(selectedProfile._id)
    : false;

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="animate-spin w-5 h-5" />
      </div>
    );
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/20 dark:to-primary/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Your Application
            </CardTitle>
            <CardDescription className="mt-1">
              {selectedProfile
                ? `Applying as a ${selectedProfile.domain} ${selectedProfile.profileType?.toLowerCase() || 'freelancer'}`
                : 'Select a profile to continue'}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedProfile && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className={cn(
                        'py-1.5 px-3 rounded-full border-2 transition-all',
                        'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:border-green-800 dark:text-green-300',
                        'hover:bg-green-100 dark:hover:bg-green-900/70',
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5" />
                        <span>{selectedProfile.domain || 'N/A'}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProfile(null);
                          }}
                          className="ml-1 -mr-1 p-0.5 rounded-full hover:bg-green-200/50 dark:hover:bg-green-800/50 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-background">
                    <p>Selected profile type</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isPopoverOpen}
                  className="w-full justify-between"
                >
                  {selectedFreelancerProfile?.profileName || 'Select a profile'}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="end">
                <ScrollArea className="h-[280px]">
                  {isLoadingProfiles ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <Loader2 className="animate-spin w-6 h-6 text-primary mb-3" />
                      <p className="text-sm font-medium">Loading profiles</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Finding your professional profiles...
                      </p>
                    </div>
                  ) : freelancerProfiles.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                        <UserCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h4 className="text-sm font-medium mb-1">
                        No profiles found
                      </h4>
                      <p className="text-xs text-muted-foreground mb-4">
                        You haven&quot;t created any freelancer profiles yet.
                      </p>
                      <Button size="sm" variant="outline" className="gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Create Profile
                      </Button>
                    </div>
                  ) : (
                    <div className="p-2">
                      <div className="px-3 py-2">
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                          Select a Profile
                        </h4>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Cover Letter</h3>
              </div>
              <div className="text-xs text-muted-foreground">
                {coverLetter.length}/{maxChars} characters
              </div>
            </div>

            <div className="relative">
              <Textarea
                value={coverLetter}
                onChange={handleCoverLetterChange}
                placeholder="Tell us why you`re the perfect fit for this project. Include relevant experience, skills, and any other details that make you stand out..."
                rows={8}
                className={cn(
                  'w-full p-4 border rounded-lg resize-none transition-all duration-200',
                  'focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1',
                  hasAppliedToSelectedProfile ? 'bg-muted/50' : 'bg-background',
                  coverLetter.length > maxChars ? 'border-destructive/50' : '',
                )}
                disabled={hasAppliedToSelectedProfile}
              />

              {coverLetter.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center p-4 max-w-xs mx-auto">
                    <Lightbulb className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">
                      Tip: A personalized cover letter increases your chances of
                      getting hired by 2x!
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Minimum {minChars} characters</span>
                <span>
                  {coverLetter.length < minChars
                    ? `${minChars - coverLetter.length} more required`
                    : 'Minimum reached'}
                </span>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className={cn(
                    'h-full',
                    coverLetter.length < minChars
                      ? 'bg-yellow-500'
                      : coverLetter.length > maxChars
                        ? 'bg-destructive'
                        : 'bg-primary',
                  )}
                  initial={{ width: '0%' }}
                  animate={{
                    width: `${Math.min((coverLetter.length / maxChars) * 100, 100)}%`,
                    transition: { duration: 0.3, ease: 'easeOut' },
                  }}
                />
              </div>
              <div className="mt-1 text-right">
                <span
                  className={cn(
                    'text-xs',
                    coverLetter.length < minChars
                      ? 'text-yellow-600'
                      : coverLetter.length > maxChars
                        ? 'text-destructive'
                        : 'text-success',
                  )}
                >
                  {coverLetter.length < minChars ? (
                    <span className="flex items-center justify-end gap-1">
                      <AlertCircle className="h-3 w-3 inline" />
                      {minChars - coverLetter.length} more characters needed
                    </span>
                  ) : coverLetter.length > maxChars ? (
                    <span className="flex items-center justify-end gap-1">
                      <AlertCircle className="h-3 w-3 inline" />
                      {coverLetter.length - maxChars} characters over limit
                    </span>
                  ) : (
                    <span className="flex items-center justify-end gap-1">
                      <CheckCircle2 className="h-3 w-3 inline" />
                      Your cover letter is ready to submit
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full md:w-auto ml-auto"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Cancel'
            )}
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={handleApplyClick}
                className="w-full md:w-auto px-8"
                disabled={
                  !selectedProfile ||
                  coverLetter.length < minChars ||
                  coverLetter.length > maxChars
                }
              >
                <SendHorizonal className="mr-2 h-4 w-4" />
                Submit Application
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Application</DialogTitle>
                <DialogDescription>
                  Are you sure you want to submit your application? This will
                  use {selectedProfile?.minConnect || 0} connects.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={(e) => {
                    handleBidSubmit(e);
                    setDialogOpen(false);
                  }}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectApplicationForm;
