import * as React from 'react';
import { useSelector } from 'react-redux';
import { ChevronDown, ChevronUp } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
import { Badge } from '@/components/ui/badge';

interface ProfileProps {
  profile: {
    _id?: string;
    domain?: string;
    freelancersRequired?: string;
    skills?: string[];
    experience?: number;
    minConnect?: number;
    rate?: number;
    description?: string;
  };
  projectId: string;
  bidExist: boolean;
}

interface Bid {
  _id: string;
  current_price: number;
  description: string;
  userName: string;
}

const ProfileCard: React.FC<ProfileProps> = ({
  profile,
  projectId,
  bidExist,
}) => {
  const [amount, setAmount] = React.useState('');
  const [descriptionValue, setDescription] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isBidSubmitted, setIsBidSubmitted] = React.useState(false); // New state to track bid submission
  const [bids, setBids] = React.useState<Bid[]>([]);
  const [loadingBids, setLoadingBids] = React.useState(false);
  const user = useSelector((state: RootState) => state.user);
  const [showMore, setShowMore] = React.useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const minBid = profile.minConnect || 0;
    if (parseInt(amount) < minBid) {
      toast({
        title: 'Invalid Bid',
        description: `Bid amount must be at least $${minBid}.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      await axiosInstance.post(`/bid`, {
        current_price: amount,
        description: descriptionValue,
        bidder_id: user.uid,
        profile_id: profile._id,
        project_id: projectId, // Use the current project's ID
      });

      setAmount('');
      setDescription('');
      setDialogOpen(false);
      setIsBidSubmitted(true); // Mark bid as submitted
      toast({
        title: 'Bid Added',
        description: 'The Bid has been successfully added.',
      });
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast({
        title: 'Something went wrong',
        description: 'Please try again later.',
      });
    }
  };

  const fetchBids = async () => {
    setLoadingBids(true);
    try {
      console.log(
        `Fetching bids for projectId=${projectId} and profileId=${profile._id}`,
      );
      const response = await axiosInstance.get(
        `/bid/project/${projectId}/profile/${profile._id}/bid`,
      );

      const bidsData = response?.data?.data || [];
      setBids(bidsData);
    } catch (error) {
      console.error('Error fetching bids:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bids. Please try again.',
      });
    } finally {
      setLoadingBids(false);
    }
  };
  React.useEffect(() => {
    if (dialogOpen) {
      fetchBids();
    }
  }, [dialogOpen, profile._id]);

  const toggleShowMore = () => setShowMore(!showMore);

  return (
    <div className="w-full max-w-5xl p-4 border border-gray-400 border-opacity-30 rounded bg-secondary">
      <div className="flex flex-col sm:flex-row justify-between items-start">
        {/* Left: Domain and Freelancers Required in the same line */}
        <div className="space-y-2">
          <p className="font-medium text-lg text-foreground mr-2">
            {profile.domain}
          </p>
          <Badge className="bg-blue-400">
            {profile.freelancersRequired} Positions
          </Badge>
          <Badge className="text-xs ml-2">{profile.experience} Years</Badge>
          <div className="flex items-center flex-wrap">
            Connects required:
            <p className="text-gray-400 text-md ml-2">{profile.minConnect}</p>
          </div>
        </div>

        {/* Right: Bid Button */}
        <div className="mt-4 sm:mt-0">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="px-5"
                type="button"
                disabled={bidExist || isBidSubmitted} // Disable if bid exists or already submitted
              >
                {isBidSubmitted ? 'Added' : !bidExist ? 'Bid' : 'Applied'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Bid</DialogTitle>
                <DialogDescription>
                  Click on bid if you want to bid for this profile.
                </DialogDescription>
              </DialogHeader>
              {loadingBids ? (
                <p className="text-gray-500">Loading previous bids...</p>
              ) : bids && bids.length > 0 ? (
                <div className="mt-4 space-y-3">
                  <h3 className="font-medium text-lg">{bids.length} Bids</h3>
                  <div className="space-y-3">
                    {' '}
                    {/* Scrollable Container */}
                    {bids.map((bid, index) => (
                      <React.Fragment key={bid._id}>
                        <div className="flex items-center justify-between p-2 text-sm">
                          {/* Left: Avatar and Bid Content */}
                          <div className="flex items-start space-x-3">
                            {/* User Avatar Placeholder */}
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                              {bid.userName
                                ? bid.userName[0].toUpperCase()
                                : '?'}
                            </div>

                            {/* Bid Content */}
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-medium">{bid.userName}</p>
                                <p className="text-xs text-gray-500">
                                  just now
                                </p>
                              </div>

                              <p className="text-gray-700">{bid.description}</p>
                            </div>
                          </div>

                          {/* Right: Amount */}
                          <div className="text-green-600 font-semibold text-sm">
                            ${bid.current_price}
                          </div>
                        </div>

                        {/* Add a separator line between bids, but not after the last item */}
                        {index < bids.length - 1 && (
                          <div className="h-px bg-gray-300 mx-2"></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No previous bids found.</p>
              )}
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-center">
                      Amount
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="col-span-3"
                      required
                      min={1}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right block">
                      Description
                    </Label>
                    <Input
                      id="description"
                      type="text"
                      value={descriptionValue}
                      onChange={(e) => setDescription(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={bidExist || isBidSubmitted}>
                    {isBidSubmitted ? 'Added' : 'Bid'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Optional Description */}
      {profile.description && (
        <div className="mt-4 text-gray-400">
          <strong></strong>{' '}
          {profile.description.length > 50 ? (
            <p className="break-words">
              {showMore
                ? profile.description
                : `${profile.description.slice(0, 50)}...`}
              <Button
                size="sm"
                variant="ghost"
                className="flex bg-black hover:bg-black items-center text-sm cursor-pointer ml-auto px-4"
                onClick={toggleShowMore}
              >
                {showMore ? 'Less' : 'More'}
                {showMore ? (
                  <ChevronUp className="ml-1 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-1 h-4 w-4" />
                )}
              </Button>
            </p>
          ) : (
            profile.description
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
