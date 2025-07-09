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
  Plus,
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

// Define interfaces for props
interface Bid {
  _id: string;
  userName: string;
  current_price: number;
  bid_status: string;
  description: string;
  profile_id: string; // Ensure bid has profile_id
}

interface Profile {
  _id: string;
  domain: string;
  freelancersRequired: string;
  skills: string[];
  experience: number;
  minConnect: number;
  rate: number;
  description: string;
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
  bidExist?: boolean; // This prop is now less critical as we derive applied status internally
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
  const maxLength = 100; // Number of characters to show when collapsed

  // Bid dialog and state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isBidSubmitted, setIsBidSubmitted] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [isBidLoading, setIsBidLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [appliesBidData, setAppliesBidData] = useState<any>([]);
  // State to control ProjectAnalyticsDrawer visibility
  const [showAnalyticsDrawer, setShowAnalyticsDrawer] = useState(false);

  // Freelancer profiles state
  const [freelancerProfiles, setFreelancerProfiles] = useState<
    FreelancerProfile[]
  >([]);
  const [selectedFreelancerProfile, setSelectedFreelancerProfile] =
    useState<FreelancerProfile | null>(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  const user = useSelector((state: RootState) => state.user);
  const [userConnects, setUserConnects] = useState<number>(0);
  const [appliedProfileIds, setAppliedProfileIds] = useState<string[]>([]);

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

    fetchAppliedData(); // Fetch applied bids on component mount
    fetchFreelancerProfiles(); // Fetch freelancer profiles

    return () => {
      window.removeEventListener('connectsUpdated', handleConnectsUpdated);
    };
  }, [user.uid]);

  const fetchFreelancerProfiles = useCallback(async () => {
    if (!user.uid) return;

    setIsLoadingProfiles(true);
    try {
      const response = await axiosInstance.get('/freelancer/profiles');
      const profilesData = response.data.data || [];
      setFreelancerProfiles(profilesData);
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
  }, [user.uid]);

  const fetchAppliedData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/bid/${user.uid}/bid`);

      // Filter bids for the current project and extract profile IDs
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
        console.log('Applied profiles:', appliedProfiles);

        setAppliesBidData(appliedProfiles);
        setIsBidSubmitted(true);
      } else {
        setAppliesBidData([]);
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
  }, [user.uid, project._id, project.profiles]); // Added project dependencies

  const toggleText = () => {
    setShowFullText(!showFullText);
  };

  const shouldTruncate = project?.description?.length > maxLength;
  const displayedText =
    showFullText || !shouldTruncate
      ? project?.description
      : project?.description.slice(0, maxLength) + '...';

  const handleApplyClick = () => {
    if (project?.profiles && project.profiles.length > 0) {
      if (project.profiles.length === 1) {
        setSelectedProfile(project.profiles[0]);
        setBidAmount(project.profiles[0].minConnect || 0);
      } else {
        setSelectedProfile(null);
      }
      setDialogOpen(true);
    }
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
      typeof selectedProfile.minConnect !== 'number' ||
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
      };

      // Add freelancer profile ID if selected
      if (selectedFreelancerProfile?._id) {
        bidData.freelancer_profile_id = selectedFreelancerProfile._id;
      }

      await axiosInstance.post(`/bid`, bidData);

      const updatedConnects = (currentConnects - bidAmount).toString();
      localStorage.setItem('DHX_CONNECTS', updatedConnects);
      window.dispatchEvent(new Event('connectsUpdated'));

      setBidAmount(0);
      setDialogOpen(false);
      setIsBidSubmitted(true); // Mark as applied for this project
      setCoverLetter('');
      setSelectedFreelancerProfile(null); // Reset selected freelancer profile
      toast({
        title: 'Application Submitted',
        description: 'Your application has been successfully submitted.',
      });
      fetchAppliedData(); // Re-fetch to update applied profiles
      setShowAnalyticsDrawer(true); // Show analytics drawer on successful bid
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

  // Determine if the main "Apply Now" button should be disabled or changed to "View Application"
  const hasAppliedToAnyProfileInProject = appliedProfileIds.some((appliedId) =>
    project.profiles.some((p: any) => p._id === appliedId),
  );

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="animate-spin w-5 h-5" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {!showAnalyticsDrawer && (
        <>
          {' '}
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
                <CardTitle className="text-lg font-medium">
                  Your Application
                </CardTitle>
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
                    disabled={hasAppliedToAnyProfileInProject} // Disable textarea if already applied
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

                {/* Profiles Section */}
                <div className="mb-6">
                  <label className="block mb-3 font-medium text-base">
                    Select Profile (Optional)
                  </label>
                  {isLoadingProfiles ? (
                    <div className="flex items-center justify-center p-6 border rounded-lg bg-muted">
                      <Loader2 className="animate-spin w-5 h-5 mr-3" />
                      <span className="text-muted-foreground">
                        Loading your profiles...
                      </span>
                    </div>
                  ) : freelancerProfiles.length === 0 ? (
                    <div className="p-6 border rounded-lg bg-muted text-center">
                      <UserCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-foreground mb-2 font-medium">
                        No profiles created yet
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Create profiles in your settings to showcase different
                        skill sets
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 max-h-80 overflow-y-auto pr-2">
                        {freelancerProfiles.map((profile) => (
                          <Card
                            key={profile._id}
                            className={`cursor-pointer transition-all duration-200 border-2 ${
                              selectedFreelancerProfile?._id === profile._id
                                ? 'border-green-500 shadow-md'
                                : 'border-border hover:border-muted-foreground hover:shadow-sm'
                            }`}
                            onClick={() => {
                              if (!hasAppliedToAnyProfileInProject) {
                                setSelectedFreelancerProfile(
                                  selectedFreelancerProfile?._id === profile._id
                                    ? null
                                    : profile,
                                );
                              }
                            }}
                          >
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-semibold text-base text-foreground">
                                  {profile.profileName}
                                </h4>
                                {selectedFreelancerProfile?._id ===
                                  profile._id && (
                                  <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>

                              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                {profile.description.length > 120
                                  ? `${profile.description.substring(0, 120)}...`
                                  : profile.description}
                              </p>

                              {profile.skills.length > 0 && (
                                <div className="mb-3">
                                  <div className="flex flex-wrap gap-2">
                                    {profile.skills.slice(0, 4).map((skill) => (
                                      <Badge
                                        key={skill._id}
                                        variant="secondary"
                                        className="text-xs px-2 py-1"
                                      >
                                        {skill.label}
                                      </Badge>
                                    ))}
                                    {profile.skills.length > 4 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs px-2 py-1"
                                      >
                                        +{profile.skills.length - 4} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-3">
                                  {profile.domains.length > 0 && (
                                    <span className="font-medium text-foreground">
                                      {profile.domains
                                        .slice(0, 2)
                                        .map((domain) => domain.label)
                                        .join(', ')}
                                      {profile.domains.length > 2 &&
                                        ` +${profile.domains.length - 2}`}
                                    </span>
                                  )}
                                  {profile.hourlyRate && (
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                      ${profile.hourlyRate}/hr
                                    </span>
                                  )}
                                </div>
                                {profile.availability && (
                                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                                    {profile.availability}
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-4 mt-4">
                  {hasAppliedToAnyProfileInProject ? (
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
                          isLoading ||
                          isBidSubmitted ||
                          hasAppliedToAnyProfileInProject
                        }
                      >
                        {isLoading
                          ? 'Submitting...'
                          : hasAppliedToAnyProfileInProject
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
                        className="border border-gray-200"
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-medium text-xs">
                              {profile?.domain} Developer
                            </h3>
                            <Badge variant="outline">
                              {profile?.freelancersRequired} Needed
                            </Badge>
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
                          <Button
                            size="sm"
                            className={`w-full mt-4 ${
                              appliedProfileIds.includes(profile._id || '')
                                ? 'cursor-not-allowed'
                                : ''
                            }`}
                            onClick={() => {
                              if (
                                !appliedProfileIds.includes(profile._id || '')
                              ) {
                                setSelectedProfile(profile);
                                setBidAmount(profile.minConnect || 0);
                                setDialogOpen(true);
                              } else {
                                // If already applied to this specific profile, show analytics drawer
                                setShowAnalyticsDrawer(true);
                              }
                            }}
                            disabled={
                              appliedProfileIds.includes(profile._id || '') ||
                              isBidSubmitted // Disable if any profile for this project is applied
                            }
                          >
                            {appliedProfileIds.includes(profile._id || '') ? (
                              <span className="flex items-center justify-center">
                                <Check className="mr-2 h-4 w-4" /> Applied
                              </span>
                            ) : (
                              'Apply for this role'
                            )}
                          </Button>
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
          {' '}
          {/* Changed from grid-cols-1 to md:col-span-3 */}
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
