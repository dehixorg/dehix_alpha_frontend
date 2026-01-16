import * as React from 'react';
import { useSelector } from 'react-redux';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

import { updateConnectsBalance } from '@/lib/updateConnects';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
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
    unit?: string;
  };
  projectId: string;
  bidExist: boolean;
}

const ProfileCard: React.FC<ProfileProps> = ({
  profile,
  projectId,
  bidExist,
}) => {
  const [amount, setAmount] = React.useState<number>(profile.minConnect ?? 0);
  const [descriptionValue, setDescription] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isBidSubmitted, setIsBidSubmitted] = React.useState(false);
  const [showMore, setShowMore] = React.useState(false);
  const user = useSelector((state: RootState) => state.user);
  const [userConnects] = React.useState<number>(
    parseInt(localStorage.getItem('DHX_CONNECTS') || '0', 10),
  );
  const [isloading, SetIsloading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentConnects = parseInt(
      localStorage.getItem('DHX_CONNECTS') || '0',
      10,
    );

    if (
      typeof profile.minConnect !== 'number' ||
      isNaN(amount) ||
      isNaN(currentConnects) ||
      amount > currentConnects
    ) {
      notifyError('Connects are insufficient');
      return; // Prevent API call if validation fails
    }

    SetIsloading(true);
    try {
      await axiosInstance.post(`/bid`, {
        current_price: amount,
        description: descriptionValue,
        bidder_id: user.uid,
        profile_id: profile._id,
        project_id: projectId,
        biddingValue: amount,
      });

      // Update connects balance
      const remainingConnects = response?.data?.remainingConnects;
      if (typeof remainingConnects === 'number') {
        updateConnectsBalance(remainingConnects);
      } else {
        // Fallback to calculation if backend doesn't return remainingConnects
        updateConnectsBalance(currentConnects - amount);
      }

      setAmount(0);
      setDescription('');
      setDialogOpen(false);
      setIsBidSubmitted(true);
      notifySuccess('The Bid has been successfully added.', 'Bid Added');
    } catch (error) {
      console.error('Error submitting bid:', error);
      notifyError('Please try again later.', 'Something went wrong');
    } finally {
      SetIsloading(false);
    }
  };

  const toggleShowMore = () => setShowMore(!showMore);

  const fetchMoreConnects = async () => {
    try {
      await axiosInstance.patch(
        `/public/connect?userId=${user.uid}&isFreelancer=${true}`,
      );
      notifySuccess(
        'Your request for more connects has been submitted.',
        'Connects Requested',
      );
      const currentConnects = parseInt(
        localStorage.getItem('DHX_CONNECTS') || '0',
        10,
      );
      const updatedConnects = Math.max(0, currentConnects - 100);
      localStorage.setItem('DHX_CONNECTS', updatedConnects.toString());

      window.dispatchEvent(new Event('connectsUpdated'));
    } catch (error) {
      console.error('Error requesting connects:', error);
      notifyError('Please try again later.', 'Something went wrong');
    }
  };

  return (
    <div className="w-full max-w-5xl p-4 border border-gray-400 border-opacity-30 rounded bg-secondary">
      <div className="flex flex-col sm:flex-row justify-between items-start">
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

        <div className="mt-4 sm:mt-0">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="px-5"
                type="button"
                disabled={bidExist || isBidSubmitted}
              >
                {isBidSubmitted ? 'Added' : !bidExist ? 'Bid' : 'Applied'}
              </Button>
            </DialogTrigger>
            {userConnects < profile.minConnect! ? (
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Insufficient Connects</DialogTitle>
                  <DialogDescription>
                    You don&apos;t have enough connects to create a project.
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
                  <DialogTitle>Bid</DialogTitle>
                  <DialogDescription>
                    Click on bid if you want to bid for this profile.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-center">
                        Amount
                      </Label>
                      <div className="col-span-3 relative">
                        <Input
                          id="amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="w-full pl-2 pr-1"
                          required
                          min={profile.minConnect}
                          placeholder="Enter amount"
                        />
                        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 text-grey-500 pointer-events-none">
                          {profile.unit || 'connects'}
                        </div>
                      </div>
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
                    <Button
                      type="submit"
                      disabled={bidExist || isBidSubmitted || isloading}
                    >
                      {isloading ? (
                        <Loader2 className="animate-spin w-6 h-6" />
                      ) : isBidSubmitted ? (
                        'Added'
                      ) : (
                        'Bid'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            )}
          </Dialog>
        </div>
      </div>

      {profile.description && (
        <div className="mt-4 text-gray-400">
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
