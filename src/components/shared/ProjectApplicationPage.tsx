'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Clock,
  DollarSign,
  Calendar,
  User,
  Briefcase,
  Star,
  Loader2,
  Check,
  Eye,
  UserCircle,
  ChevronDown,
  X,
} from 'lucide-react';

import { Textarea } from '../ui/textarea';

import ProjectAnalyticsDrawer from './ProjectAnalyticsDrawer';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';

interface Profile {
  _id: string;
  domain: string;
  freelancersRequired: string;
  skills: string[];
  experience: number;
  minConnect: number;
  rate: number;
  description: string;
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

interface ProjectApplicationFormProps {
  project: any;
  isLoading: boolean;
  onCancel: () => void;
  bidExist?: boolean;
}

const ProjectApplicationForm: React.FC<ProjectApplicationFormProps> = ({
  project,
  isLoading,
  onCancel,
}) => {
  const [coverLetter, setCoverLetter] = useState<string>('');
  const minChars = 500;
  const maxChars = 2000;
  const [showFullText, setShowFullText] = useState<boolean>(false);
  const maxLength = 100;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isBidSubmitted, setIsBidSubmitted] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [isBidLoading, setIsBidLoading] = useState(false);

  const [showAnalyticsDrawer, setShowAnalyticsDrawer] = useState(false);

  const [freelancerProfiles, setFreelancerProfiles] = useState<
    FreelancerProfile[]
  >([]);
  const [selectedFreelancerProfile, setSelectedFreelancerProfile] =
    useState<FreelancerProfile | null>(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const user = useSelector((state: RootState) => state.user);
  const [userConnects, setUserConnects] = useState<number>(0);
  const [appliedProfileIds, setAppliedProfileIds] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const connects = parseInt(localStorage.getItem('DHX_CONNECTS') || '0', 10);
    setUserConnects(connects);

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

      // FIX: Correctly extract the array from the nested API response object
      if (profilesData && profilesData.consultant) {
        const consultantData = profilesData.consultant;
        profilesData = Object.values(consultantData);
      }

      // FIX: Ensure profilesData is always an array before setting the state to prevent map errors
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
  }, [user.uid, selectedProfile]);

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

      const appliedProfiles = project.profiles.filter((profile: any) =>
        profilesUserAppliedFor.includes(profile._id || ''),
      );

      if (appliedProfiles.length > 0) {
        setIsBidSubmitted(true);
      } else {
        setIsBidSubmitted(false);
      }
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
    fetchAppliedData();
    if (selectedProfile) {
      fetchFreelancerProfiles();
    }
  }, [fetchAppliedData, fetchFreelancerProfiles, selectedProfile]);

  const toggleText = () => {
    setShowFullText(!showFullText);
  };

  const shouldTruncate = project?.description?.length > maxLength;
  const displayedText =
    showFullText || !shouldTruncate
      ? project?.description
      : project?.description.slice(0, maxLength) + '...';

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

  const handleViewApplicationClick = () => {
    setShowAnalyticsDrawer(true);
  };

  const fetchMoreConnects = async () => {
    try {
      await axiosInstance.patch(
        `/public/connect?userId=${user.uid}&isFreelancer=${true}`,
      );
      toast({
        title: 'Connects Requested',
        description: 'Your request for more connects has been submitted.',
      });
      const currentConnects = parseInt(
        localStorage.getItem('DHX_CONNECTS') || '0',
        10,
      );
      const updatedConnects = Math.max(0, currentConnects + 100);
      localStorage.setItem('DHX_CONNECTS', updatedConnects.toString());

      window.dispatchEvent(new Event('connectsUpdated'));
    } catch (error) {
      console.error('Error requesting connects:', error);
      toast({
        title: 'Something went wrong',
        description: 'Please try again later.',
      });
    }
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile || !selectedProfile._id) {
      toast({
        title: 'Error',
        description: 'No profile selected for bidding',
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
        description: 'Connects are insufficient',
      });
      return;
    }

    if (coverLetter.length < minChars) {
      toast({
        title: 'Cover letter too short',
        description: `Please write at least ${minChars} characters.`,
      });
      return;
    }

    if (coverLetter.length > maxChars) {
      toast({
        title: 'Cover letter too long',
        description: `Maximum allowed is ${maxChars} characters.`,
      });
      return;
    }

    setIsBidLoading(true);
    try {
      const bidData: any = {
        current_price: bidAmount,
        description: coverLetter,
        bidder_id: user.uid,
        profile_id: selectedProfile._id,
        project_id: project._id,
        biddingValue: bidAmount,
        profile_type: selectedProfile.profileType || 'FREELANCER',
      };

      if (selectedFreelancerProfile?._id) {
        bidData.freelancer_profile_id = selectedFreelancerProfile._id;
      }
      console.log(bidData);
      await axiosInstance.post(`/bid`, bidData);

      const updatedConnects = (currentConnects - bidAmount).toString();
      localStorage.setItem('DHX_CONNECTS', updatedConnects);
      window.dispatchEvent(new Event('connectsUpdated'));

      setBidAmount(0);
      setDialogOpen(false);
      setIsBidSubmitted(true);
      setCoverLetter('');
      setSelectedFreelancerProfile(null);
      toast({
        title: 'Application Submitted',
        description: 'Your application has been successfully submitted.',
      });
      fetchAppliedData();
      setShowAnalyticsDrawer(true);
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast({
        title: 'Something went wrong',
        description: 'Please try again later.',
      });
    } finally {
      setIsBidLoading(false);
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

  const totalBids = project?.bids?.length || 0;
  const avgBid =
    totalBids > 0
      ? (
          project?.bids?.reduce(
            (sum: any, bid: any) => sum + (bid?.current_price || 0),
            0,
          ) / totalBids
        ).toFixed(2)
      : 'N/A';
  const postedDate = new Date(
    project?.createdAt || Date.now(),
  ).toLocaleDateString();

  const hasAppliedToAnyProfileInProject = appliedProfileIds.some((appliedId) =>
    project.profiles.some((p: any) => p._id === appliedId),
  );
  
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
  const handleProfileSelection = (profile: Profile) => {
    // FIX: Allow selection of an applied profile to view proposal, but prevent deselecting it
    if (appliedProfileIds.includes(profile._id)) {
      setSelectedProfile(profile);
      return;
    }
    setSelectedProfile((prevSelected) => {
      if (prevSelected?._id === profile._id) {
        return null;
      }
      return profile;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {!showAnalyticsDrawer && (
        <>
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold">
                      {project?.projectName}
                    </h1>
                    <p className="text-sm">Posted on {postedDate}</p>
                  </div>
                  <p className="text-muted-foreground">
                    Position: {project?.projectType} Developer
                  </p>
                  <div className="mt-4">
                    <p>{displayedText}</p>
                    {shouldTruncate && (
                      <button
                        onClick={toggleText}
                        className="text-blue-500 hover:underline text-sm mt-2"
                      >
                        {showFullText ? 'less' : 'more'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <h2 className="text-lg font-medium mb-2">Skills required</h2>
                  <div className="flex flex-wrap gap-2">
                    {project?.skillsRequired?.map((skill: any, index: any) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1 rounded-full bg-gray-200 text-gray-700"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-medium mb-4">Client Information</h2>
                <div className="flex items-start gap-4">
                  <div className="bg-red-500 rounded-full w-8 h-8 flex items-center justify-center text-white">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="font-medium">{project?.companyName}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <Briefcase size={14} />
                      <span>12 projects posted</span>
                      <span className="mx-1">|</span>
                      <DollarSign size={14} />
                      <span>$3.5k spent</span>
                    </div>
                    <div className="flex items-center mt-2">
                      <Star className="text-yellow-400" size={16} />
                      <span className="ml-1">4.5</span>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm">
                  {project?.companyName} is a leading technology company focused
                  on innovative AI solutions. They have a history of successful
                  project completions with freelancers on our platform.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-medium mb-4">Project Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium">Domains</h3>
                    <p>{project?.projectDomain?.join(', ')}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Status</h3>
                    <p>{project?.status}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Budget Type</h3>
                    <p>{project?.budget?.type}</p>
                  </div>
                  {project?.budget?.type.toUpperCase() === 'HOURLY' ? (
                    <>
                      <div>
                        <h3 className="font-medium">Hourly Rate</h3>
                        <p>
                          ${project?.budget?.hourly?.minRate || 0} - $
                          {project?.budget?.hourly?.maxRate || 0} /hr
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium">Estimated Hours</h3>
                        <p>
                          {project?.budget?.hourly?.estimatedHours || 0} hours
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium">Total Budget</h3>
                        <p>
                          ~$
                          {(
                            (((project?.budget?.hourly?.minRate || 0) +
                              (project?.budget?.hourly?.maxRate || 0)) /
                              2) *
                            (project?.budget?.hourly?.estimatedHours || 0)
                          ).toLocaleString()}
                        </p>
                      </div>
                    </>
                  ) : project?.budget?.type.toUpperCase() === 'FIXED' ? (
                    <div>
                      <h3 className="font-medium">Fixed Budget</h3>
                      <p>
                        ${project?.budget?.fixedAmount?.toLocaleString() || 0}
                      </p>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-medium mb-4">Bid Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium">Total Bids</h3>
                    <p>{totalBids}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Average Bid</h3>
                    <p>${avgBid}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">
                    Your Application
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {selectedProfile && (
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          key={selectedProfile._id}
                          variant="secondary"
                          className="border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 flex items-center gap-1"
                        >
                          {selectedProfile.domain || 'N/A'}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProfile(null);
                            }}
                            className="ml-1 text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100 focus:outline-none"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      </div>
                    )}
                    <div className="relative profile-dropdown-container">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        className="flex items-center gap-2"
                        disabled={hasAppliedToSelectedProfile}
                      >
                        {selectedFreelancerProfile ? selectedFreelancerProfile.profileName : 'Add Profiles'}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`}
                        />
                      </Button>

                      {showProfileDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                          {isLoadingProfiles ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="animate-spin w-4 h-4 mr-2" />
                              <span className="text-sm text-muted-foreground">
                                Loading profiles...
                              </span>
                            </div>
                          ) : freelancerProfiles.length === 0 ? (
                            <div className="p-4 text-center">
                              <UserCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                No profiles created yet
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Create profiles in your settings
                              </p>
                            </div>
                          ) : (
                            <div className="p-2">
                              {Array.isArray(freelancerProfiles) && freelancerProfiles.length > 0 ? (
                                freelancerProfiles.map((profile) => (
                                  <div
                                    key={profile._id}
                                    className={`p-3 rounded-md cursor-pointer transition-all duration-200 border-2 mb-2 ${
                                      selectedFreelancerProfile?._id === profile._id
                                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                                        : 'border-transparent hover:border-muted-foreground hover:bg-muted'
                                    }`}
                                    onClick={() => {
                                      if (!hasAppliedToSelectedProfile) {
                                        setSelectedFreelancerProfile(
                                          selectedFreelancerProfile?._id === profile._id
                                            ? null
                                            : profile,
                                        );
                                        setShowProfileDropdown(false);
                                      }
                                    }}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-sm text-foreground">
                                          {profile.profileName}
                                        </h4>
                                      </div>
                                      {selectedFreelancerProfile?._id === profile._id && (
                                        <div className="flex items-center justify-center w-5 h-5 bg-green-500 rounded-full ml-2">
                                          <Check className="w-3 h-3 text-white" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-4 text-center">
                                  <UserCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    No profiles created yet
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Create profiles in your settings
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4">
                  <label
                    htmlFor="coverLetter"
                    className="block mb-2 font-medium"
                  >
                    Cover Letter
                  </label>
                  <Textarea
                    value={coverLetter}
                    onChange={handleCoverLetterChange}
                    placeholder="Write your cover letter..."
                    rows={8}
                    className="w-full p-3 border rounded-md resize-none"
                    disabled={hasAppliedToSelectedProfile}
                  />
                  <div className="text-sm mt-1 text-right">
                    <span
                      className={
                        coverLetter.length < minChars
                          ? 'text-yellow-600'
                          : coverLetter.length > maxChars
                            ? 'text-red-600'
                            : ''
                      }
                    >
                      {coverLetter.length < minChars &&
                        `${
                          minChars - coverLetter.length
                        } characters left to reach minimum.`}
                      {coverLetter.length >= minChars &&
                        coverLetter.length <= maxChars &&
                        `${maxChars - coverLetter.length} characters left.`}
                      {coverLetter.length > maxChars &&
                        'Character limit exceeded!'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  {hasAppliedToSelectedProfile ? (
                    <Button
                      onClick={handleViewApplicationClick}
                      className="w-full md:w-auto px-8"
                    >
                      <Eye className="mr-2 h-4 w-4" /> View Proposal
                    </Button>
                  ) : (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <Button
                        onClick={handleApplyClick}
                        className="w-full md:w-auto px-8"
                        disabled={
                          isLoading || hasAppliedToSelectedProfile || !selectedProfile
                        }
                      >
                        {isLoading
                          ? 'Submitting...'
                          : hasAppliedToSelectedProfile
                            ? 'Applied'
                            : 'Apply Now'}
                      </Button>
                      {selectedProfile &&
                      userConnects < (selectedProfile.minConnect || 0) ? (
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Insufficient Connects</DialogTitle>
                            <DialogDescription>
                              You don&apos;t have enough connects to apply for
                              this project.
                              <br />
                              Please{' '}
                              <span
                                className="text-blue-600 font-bold cursor-pointer"
                                onClick={fetchMoreConnects}
                              >
                                Request Connects
                              </span>{' '}
                              to proceed.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setDialogOpen(false)}
                            >
                              Close
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      ) : (
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>
                              Apply for {project.projectName}
                            </DialogTitle>
                            <DialogDescription>
                              Submit your bid to apply for this project.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleBidSubmit}>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                  htmlFor="bidAmount"
                                  className="text-center"
                                >
                                  Connects
                                </Label>
                                <div className="col-span-3 relative">
                                  <Input
                                    id="bidAmount"
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) =>
                                      setBidAmount(Number(e.target.value))
                                    }
                                    className="w-full pl-2 pr-1"
                                    required
                                    min={selectedProfile?.minConnect}
                                    placeholder="Enter connects amount"
                                  />
                                  <div className="absolute right-8 top-1/2 transform -translate-y-1/2 text-grey-500 pointer-events-none">
                                    connects
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button
                                type="submit"
                                disabled={isBidSubmitted || isBidLoading}
                              >
                                {isBidLoading ? (
                                  <Loader2 className="animate-spin w-6 h-6" />
                                ) : isBidSubmitted ? (
                                  'Applied'
                                ) : (
                                  'Submit Bid'
                                )}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      )}
                    </Dialog>
                  )}
                  <Button
                    onClick={onCancel}
                    variant="outline"
                    className="w-full md:w-auto px-8"
                  >
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-medium mb-4">Experience</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="text-gray-500" size={18} />
                    <div>
                      <p className="font-medium">3+ yrs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="text-gray-500" size={18} />
                    <div>
                      <p className="font-medium">Hourly rate</p>
                      <p>
                        ${project?.budget?.hourly?.minRate || 0} - $
                        {project?.budget?.hourly?.maxRate || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="text-gray-500" size={18} />
                    <div>
                      <p className="font-medium">Time per week</p>
                      <p>40 hours</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="text-gray-500" size={18} />
                    <div>
                      <p className="font-medium">Project length</p>
                      <p>3 to 5 months</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {project?.profiles?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    Profiles Needed
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4 h-[70vh] overflow-y-scroll no-scrollbar">
                    {project?.profiles?.map((profile: any, index: any) => (
                      <Card
                        key={profile?._id || index}
                        className={`border cursor-pointer ${
                          // FIX: Conditional styling for selected vs applied profiles
                          selectedProfile?._id === profile._id
                            ? appliedProfileIds.includes(profile._id)
                              ? 'border-red-500 ring-2 ring-red-500' // Applied and selected
                              : 'border-blue-500 ring-2 ring-blue-500' // Not applied but selected
                            : appliedProfileIds.includes(profile._id)
                              ? 'border-red-500' // Applied but not selected
                              : 'border-gray-200' // Default state
                        }`}
                        onClick={() => handleProfileSelection(profile)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-medium text-xs">
                              {profile?.domain} Developer
                            </h3>
                            <div className="flex items-center">
                              <Badge variant="outline" className="ml-2">
                                {profile?.profileType}
                              </Badge>
                              <Badge variant="outline">
                                {profile?.freelancersRequired} Needed
                              </Badge>
                            </div>
                          </div>
                          <p className="mb-3 text-sm">{profile?.description}</p>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">
                                Experience
                              </p>
                              <p className="font-medium">
                                {profile?.experience}+ years
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Rate</p>
                              <p className="font-medium">${profile?.rate}/hr</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                Minimum Connect
                              </p>
                              <p className="font-medium">
                                {profile?.minConnect}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {profile?.skills?.map((skill: any, idx: any) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="border border-gray-200"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
      {showAnalyticsDrawer && (
        <div className="col-span-1 md:col-span-3">
          <ProjectAnalyticsDrawer
            projectData={project}
            setShowAnalyticsDrawer={setShowAnalyticsDrawer}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectApplicationForm;