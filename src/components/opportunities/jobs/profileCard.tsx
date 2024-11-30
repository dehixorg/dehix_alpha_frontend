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

const ProfileCard: React.FC<ProfileProps> = ({
  profile,
  projectId,
  bidExist,
}) => {
  const [amount, setAmount] = React.useState('');
  const [descriptionValue, setDescription] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isBidSubmitted, setIsBidSubmitted] = React.useState(false); // New state to track bid submission
  const user = useSelector((state: RootState) => state.user);
  const [showMore, setShowMore] = React.useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
