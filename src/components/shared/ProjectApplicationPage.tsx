'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  CheckCircle2,
  ChevronDown,
  Lightbulb,
  Loader2,
  UserX,
  AlertCircle,
  SendHorizontal,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
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
  profileType: 'FREELANCER' | 'CONSULTANT';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const user = useSelector((state: RootState) => state.user);
  const fetchFreelancerProfiles = useCallback(async () => {
    setIsLoadingProfiles(true);
    try {
      const response = await axiosInstance.get('/freelancer/profiles');
      const profilesData = response.data.data || [];
      const validProfiles = Array.isArray(profilesData)
        ? profilesData.filter((p: any) => p.profileType) // Ensure profileType exists
        : [];

      setFreelancerProfiles(validProfiles);

      // If there's only one profile, select it by default
      if (validProfiles.length === 1) {
        setSelectedFreelancerProfile(validProfiles[0]);
      }

      return validProfiles;
    } catch (error: any) {
      console.error('Error fetching freelancer profiles:', error);
      notifyError(
        'Failed to load freelancer profiles. Please try again later.',
      );
      return [];
    } finally {
      setIsLoadingProfiles(false);
    }
  }, []);

  // Filter freelancer profiles based on selected project profile
  const filteredFreelancerProfiles = useMemo(() => {
    if (!selectedProfile || !freelancerProfiles.length) return [];

    const selectedType = selectedProfile.profileType?.toLowerCase();
    if (!selectedType) {
      // If project profile lacks a type, don't filter by type
      return freelancerProfiles;
    }

    return freelancerProfiles.filter((profile) => {
      const profileType = profile.profileType?.toLowerCase();
      return profileType === selectedType;
    });
  }, [selectedProfile, freelancerProfiles]);

  // Handle project profile selection
  const handleProfileSelect = (profile: Profile) => {
    setSelectedProfile(profile);
    setBidAmount(profile.minConnect || 0);
    setSelectedFreelancerProfile(null);
    setIsPopoverOpen(false);
  };

  // Handle freelancer profile selection
  const handleFreelancerSelect = (profile: FreelancerProfile) => {
    setSelectedFreelancerProfile(profile);
  };

  const fetchAppliedData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/bid/${user.uid}/bid`);
      const profilesUserAppliedFor =
        response.data?.data
          ?.filter(
            (bid: any) =>
              bid.project_id === project._id && bid.bidder_id === user.uid,
          )
          ?.map((bid: any) => bid.profile_id) || [];
      return profilesUserAppliedFor;
    } catch (error: any) {
      console.error('API Error fetching applied data:', error);
      notifyError('Failed to retrieve application status. Please try again.');
      return [];
    }
  }, [user.uid, project._id]);
  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchAppliedData();
        await fetchFreelancerProfiles();
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();

    return () => {};
  }, [fetchAppliedData, fetchFreelancerProfiles]);

  const handleApplyClick = () => {
    if (!selectedProfile) {
      notifyError(
        'Please select a profile to apply with before proceeding.',
        'Action Required',
      );
      return;
    }
    setDialogOpen(true);
  };
  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate profile selection
    if (!selectedProfile?._id) {
      notifyError('No profile selected for bidding');
      return;
    }

    // Validate bid amount
    const currentConnects = parseInt(
      localStorage.getItem('DHX_CONNECTS') || '0',
      10,
    );

    // Check minimum bid amount (minConnect from profile)
    const minBid = selectedProfile?.minConnect ?? 0;
    if (isNaN(bidAmount) || bidAmount < minBid) {
      notifyError(`Minimum bid amount is ${minBid} connects.`, 'Bid Too Low');
      return;
    }

    // Check available connects
    if (isNaN(currentConnects) || bidAmount > currentConnects) {
      notifyError(
        'You do not have enough connects to place this bid.',
        'Insufficient Connects',
      );
      return;
    }

    // Validate cover letter length
    if (coverLetter.length < minChars) {
      notifyError(
        `Please write at least ${minChars} characters.`,
        'Cover Letter Too Short',
      );
      return;
    }

    if (coverLetter.length > maxChars) {
      notifyError(
        `Maximum allowed is ${maxChars} characters.`,
        'Cover Letter Too Long',
      );
      return;
    }

    // All validations passed, proceed with submission
    setIsSubmitting(true);
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

      const res = await axiosInstance.post('/bid', bidData);
      const remainingConnects = res?.data?.remainingConnects;
      if (typeof remainingConnects === 'number') {
        localStorage.setItem('DHX_CONNECTS', String(remainingConnects));
        window.dispatchEvent(new Event('connectsUpdated'));
      }

      // Reset form state
      setBidAmount(0);
      setDialogOpen(false);
      setCoverLetter('');
      setSelectedFreelancerProfile(null);

      // Show success message
      notifySuccess(
        'Your application has been successfully submitted.',
        'Application Submitted',
      );

      // Refresh data
      await fetchAppliedData();
      setDialogOpen(false);
    } catch (error: unknown) {
      console.error('Error submitting bid:', error);

      let errorMessage = 'Failed to submit application. Please try again.';
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response: any }).response;
        if (response?.data?.message) {
          errorMessage = response.data.message;
        }
      }

      notifyError(errorMessage, 'Submission Failed');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleBidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string for better UX when clearing the input
    if (value === '') {
      setBidAmount(0);
      return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setBidAmount(numValue);
    }
  };

  const handleBidAmountBlur = () => {
    // When input loses focus, ensure the value meets the minimum requirement
    const minBid = selectedProfile?.minConnect || 0;
    if (bidAmount < minBid) {
      setBidAmount(minBid);
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

  const hasAppliedToSelectedProfile = !selectedFreelancerProfile;

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="animate-spin w-5 h-5" />
      </div>
    );
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="bg-gradient p-6 rounded-t-lg border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              Your Application
            </CardTitle>
            <CardDescription className="mt-1">
              Apply to this project with your profile
            </CardDescription>
          </div>

          <div className="w-full sm:w-auto">
            {selectedProfile ? (
              <div className="flex items-center gap-2">
                <Badge className="rounded-md uppercase text-xs font-normal dark:bg-muted bg-muted-foreground/30 dark:hover:bg-muted/20 hover:bg-muted-foreground/20 flex items-center px-2 py-1 text-black dark:text-white">
                  {selectedProfile.domain} ({selectedProfile.profileType})
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-red-700/20 hover:bg-red-700/40"
                  onClick={() => {
                    setSelectedProfile(null);
                    setSelectedFreelancerProfile(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Select profile
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <ScrollArea className="h-[280px]">
                    {project.profiles && project.profiles.length > 0 ? (
                      <div className="p-2">
                        <div className="px-3 py-2">
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            Select Project Profile
                          </h4>
                          <div className="space-y-1">
                            {project.profiles.map((profile) => (
                              <div
                                key={profile._id}
                                className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProfileSelect(profile);
                                }}
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {profile.domain}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {profile.profileType?.toLowerCase() ===
                                    'freelancer'
                                      ? 'Freelancer'
                                      : 'Consultant'}
                                  </p>
                                </div>
                                {profile.rate !== undefined && (
                                  <Badge variant="outline" className="ml-2">
                                    ${profile.rate}/hr
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          No project profiles available
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {selectedProfile ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">
                Available Freelancer Profiles
              </h3>
              {isLoadingProfiles ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-muted rounded"></div>
                          <div className="h-3 bg-muted rounded w-5/6"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredFreelancerProfiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFreelancerProfiles.map((profile) => (
                    <Card
                      key={profile._id}
                      className={`cursor-pointer transition-all ${
                        selectedFreelancerProfile?._id === profile._id
                          ? 'ring-2 ring-primary'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleFreelancerSelect(profile)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{profile.profileName}</h4>
                          {profile.hourlyRate && (
                            <Badge variant="outline">
                              ${profile.hourlyRate}/hr
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {profile.description}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {profile.skills?.slice(0, 3).map((skill) => (
                            <Badge
                              key={skill._id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {skill.label}
                            </Badge>
                          ))}
                          {(profile.skills?.length || 0) > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(profile.skills?.length || 0) - 3} more
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-lg">
                  <UserX className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <h4 className="text-sm font-medium">
                    No matching profiles found
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    We couldn&apos;t find any freelancer profiles that match
                    this project&apos;s requirements.
                  </p>
                </div>
              )}
            </div>

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
                  placeholder="Tell us why you're the perfect fit for this project. Include relevant experience, skills, and any other details that make you stand out..."
                  rows={8}
                  className={cn(
                    'w-full p-4 border rounded-lg resize-none transition-all duration-200',
                    'focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1',
                    hasAppliedToSelectedProfile
                      ? 'bg-muted/50'
                      : 'bg-background',
                    coverLetter.length > maxChars
                      ? 'border-destructive/50'
                      : '',
                  )}
                  disabled={hasAppliedToSelectedProfile}
                />

                {coverLetter.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center p-4 max-w-xs mx-auto">
                      <Lightbulb className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">
                        Tip: A personalized cover letter increases your chances
                        of getting hired by 2x!
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
                      coverLetter.length > maxChars
                        ? 'bg-destructive'
                        : coverLetter.length >= minChars
                          ? 'bg-green-500'
                          : 'bg-yellow-500',
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
        ) : (
          <div className="text-center py-10 text-muted-foreground dark:text-muted-foreground/40">
            <Lightbulb className="h-6 w-6 mx-auto mb-2" />
            <p>
              Select a project profile above to see matching freelancer
              profiles.
            </p>
            <p className="text-xs mt-1">
              Tip: Click “Select profile” and choose the role you want to apply
              with.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 border-t">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto ml-auto"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Cancel
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
                <SendHorizontal className="mr-2 h-4 w-4" />
                Submit Application
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Application</DialogTitle>
                <DialogDescription className="space-y-4">
                  <div>
                    <p>You are about to submit your application.</p>
                    <p>
                      Minimum required connects:{' '}
                      {selectedProfile?.minConnect || 0}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="bidAmount"
                      className="block text-sm font-medium text-foreground"
                    >
                      Number of Connects to Bid
                    </label>
                    <input
                      type="number"
                      id="bidAmount"
                      min={selectedProfile?.minConnect || 0}
                      value={bidAmount || ''}
                      onChange={handleBidAmountChange}
                      onBlur={handleBidAmountBlur}
                      className="w-full p-2 border rounded"
                      placeholder={`Min ${selectedProfile?.minConnect || 0} connects`}
                    />
                    <p className="text-xs text-muted-foreground">
                      You can bid more connects to increase visibility
                    </p>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleBidSubmit}
                  disabled={isSubmitting || hasAppliedToSelectedProfile}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Confirm'
                  )}
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
