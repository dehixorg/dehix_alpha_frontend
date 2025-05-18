'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Paperclip,
  Clock,
  DollarSign,
  Calendar,
  User,
  Briefcase,
  Star,
  Loader2,
  Check,
  Loader,
} from 'lucide-react';

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
import { Textarea } from '../ui/textarea';

// Define interfaces for props
interface Bid {
  _id: string;
  userName: string;
  current_price: number;
  bid_status: string;
  description: string;
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

interface Budget {
  type: string;
  hourly?: {
    minRate?: number;
    maxRate?: number;
    estimatedHours?: number;
  };
  fixedAmount?: number;
}

interface ProjectData {
  _id: string;
  projectName: string;
  projectDomain: string[];
  description: string;
  companyName: string;
  skillsRequired: string[];
  status: string;
  projectType: string;
  profiles: Profile[];
  bids: Bid[];
  budget: Budget;
  createdAt: string;
}

interface ProjectApplicationFormProps {
  project: ProjectData;
  isLoading: boolean;
  onSubmit: (coverLetter: string, attachment: File | null) => Promise<void>;
  onCancel: () => void;
  bidExist?: boolean;
}

const ProjectApplicationForm: React.FC<ProjectApplicationFormProps> = ({
  project,
  isLoading,
  onSubmit,
  onCancel,
  bidExist = false,
}) => {
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [showFullText, setShowFullText] = useState<boolean>(false);
  const maxLength = 100; // Number of characters to show when collapsed

  // Bid dialog and state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isBidSubmitted, setIsBidSubmitted] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [isBidLoading, setIsBidLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // User and connects state
  const user = useSelector((state: RootState) => state.user);
  const [userConnects, setUserConnects] = useState<number>(0);
  const [bidProfiles, setBidProfiles] = useState<string[]>([]);

  // Load user connects on component mount and fetch existing bids
  useEffect(() => {
    const connects = parseInt(localStorage.getItem('DHX_CONNECTS') || '0', 10);
    setUserConnects(connects);

    // Listen for connects updates
    const handleConnectsUpdated = () => {
      const updatedConnects = parseInt(localStorage.getItem('DHX_CONNECTS') || '0', 10);
      setUserConnects(updatedConnects);
    };

    window.addEventListener('connectsUpdated', handleConnectsUpdated);

    // Fetch existing bids
    fetchBidData();

    return () => {
      window.removeEventListener('connectsUpdated', handleConnectsUpdated);
    };
  }, [user.uid]);

  // Fetch user's existing bids
  const fetchBidData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/bid/${user.uid}/bid`);
      const profileIds = response.data.data.map((bid: any) => bid.profile_id); // Extract profile_ids
      setBidProfiles(profileIds);
    } catch (error) {
      console.error('API Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      }); // Error toast
    }
  }, [user.uid]);

  const toggleText = () => {
    setShowFullText(!showFullText);
  };

  const shouldTruncate = project?.description?.length > maxLength;
  const displayedText =
    showFullText || !shouldTruncate
      ? project?.description
      : project?.description.slice(0, maxLength) + '...';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target?.files?.[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleApplyClick = () => {
    // If there are profiles, open the bid dialog with the first profile
    if (project?.profiles && project.profiles.length > 0) {
      const profile = project.profiles[0];
      setSelectedProfile(profile);
      setBidAmount(profile.minConnect || 0);
      setDialogOpen(true);
    } else {
      // If no profiles, proceed with regular submission
      onSubmit(coverLetter, attachment);
    }
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

    setIsBidLoading(true);
    try {
      await axiosInstance.post(`/bid`, {
        current_price: bidAmount,
        description: coverLetter, // Using coverLetter as the description
        bidder_id: user.uid,
        profile_id: selectedProfile._id,
        project_id: project._id,
        biddingValue: bidAmount,
      });

      const updatedConnects = (currentConnects - bidAmount).toString();
      localStorage.setItem('DHX_CONNECTS', updatedConnects);
      window.dispatchEvent(new Event('connectsUpdated'));

      // If there's an attachment, submit that too
      if (attachment) {
        await onSubmit(coverLetter, attachment);
      }

      setBidAmount(0);
      setDialogOpen(false);
      setIsBidSubmitted(true);
      toast({
        title: 'Application Submitted',
        description: 'Your application has been successfully submitted.',
      });
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

  // Calculate bid summary
  const totalBids = project?.bids?.length || 0;
  const avgBid =
    totalBids > 0
      ? (
        project?.bids?.reduce(
          (sum, bid) => sum + (bid?.current_price || 0),
          0,
        ) / totalBids
      ).toFixed(2)
      : 'N/A';

  // Format posted date
  const postedDate = new Date(
    project?.createdAt || Date.now(),
  ).toLocaleDateString();

  if (isLoading) {
    return <div className="text-center py-10"><Loader2 className='animate-spin w-5 h-5' /></div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Column - Main Content (2/3 width) */}
      <div className="md:col-span-2 space-y-6">
        {/* Project Header */}
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
                {project?.skillsRequired?.map((skill, index) => (
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

        {/* Client Information */}
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
              {project?.companyName} is a leading technology company focused on
              innovative AI solutions. They have a history of successful project
              completions with freelancers on our platform.
            </p>
          </CardContent>
        </Card>

        {/* Project Details */}
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
                    <p>{project?.budget?.hourly?.estimatedHours || 0} hours</p>
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
                  <p>${project?.budget?.fixedAmount?.toLocaleString() || 0}</p>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Bid Summary */}
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

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Your Application
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {/* Cover Letter */}
            <div className="mb-4">
              <label htmlFor="coverLetter" className="block mb-2 font-medium">
                Cover Letter
              </label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="min-h-32 w-full"
                placeholder="Explain why you're a good fit for this project..."
              />
            </div>

            <div>
              <p className="block mb-2 font-medium">Attachment</p>
              <p className="text-sm text-muted-foreground mb-2">
                Attach your resume to strengthen your profile
              </p>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => document.getElementById('fileUpload')?.click()}
                >
                  <Paperclip size={16} />
                  <span>Attach File</span>
                </Button>
                <Input
                  id="fileUpload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              {attachment && <p className="mt-2 text-sm">{attachment.name}</p>}
            </div>

            <div className="flex gap-4 mt-4">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <Button
                  onClick={handleApplyClick}
                  className="w-full md:w-auto px-8"
                  disabled={isLoading || isBidSubmitted || bidExist || (project?.profiles?.length > 0 && project.profiles.every(p => bidProfiles.includes(p._id || '')))}
                >
                  {isLoading ? 'Submitting...' :
                    bidExist || isBidSubmitted || (project?.profiles?.length > 0 && project.profiles.every(p => bidProfiles.includes(p._id || '')))
                      ? 'Applied' : 'Apply Now'}
                </Button>

                {selectedProfile && userConnects < (selectedProfile.minConnect || 0) ? (
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Insufficient Connects</DialogTitle>
                      <DialogDescription>
                        You don&apos;t have enough connects to apply for this project.
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
                      <DialogTitle>Apply for {project.projectName}</DialogTitle>
                      <DialogDescription>
                        Submit your bid to apply for this project.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleBidSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="bidAmount" className="text-center">
                            Connects
                          </Label>
                          <div className="col-span-3 relative">
                            <Input
                              id="bidAmount"
                              type="number"
                              value={bidAmount}
                              onChange={(e) => setBidAmount(Number(e.target.value))}
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
                          disabled={bidExist || isBidSubmitted || isBidLoading}
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
              <Button
                onClick={onCancel}
                variant="outline"
                className="w-full md:w-auto px-8"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Experience and Profiles (1/3 width) */}
      <div className="space-y-6">
        {/* Experience Card */}
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

        {/* Profiles Section */}
        {project?.profiles?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Profiles Needed
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-4 h-[70vh] overflow-y-scroll no-scrollbar">
                {project?.profiles?.map((profile, index) => (
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
                          <p className="text-xs text-gray-500">Experience</p>
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
                          <p className="font-medium">{profile?.minConnect}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {profile?.skills?.map((skill, idx) => (
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
                        className={`w-full mt-4 ${bidProfiles.includes(profile._id || '') ? 'cursor-not-allowed' : ''}`}
                        onClick={() => {
                          if (!bidProfiles.includes(profile._id || '')) {
                            setSelectedProfile(profile);
                            setBidAmount(profile.minConnect || 0);
                            setDialogOpen(true);
                          }
                        }}
                        disabled={bidProfiles.includes(profile._id || '') || bidExist || isBidSubmitted}
                      >
                        {bidProfiles.includes(profile._id || '') ? (
                          <span className="flex items-center justify-center">
                            <Check className="mr-2 h-4 w-4" /> Applied
                          </span>
                        ) : 'Apply for this role'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectApplicationForm;