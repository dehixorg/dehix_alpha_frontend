import * as React from 'react';
import { Check, X, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';

import { axiosInstance } from '@/lib/axiosinstance';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { notifyError } from '@/utils/toastMessage';

interface BidDialogProps {
  handleUpdateStatus: (bidId: string, status: string) => void;
  projectId: string;
  bidId: string;
}

interface BidDetails {
  profile_id: string;
  description: string;
  totalBid: number[];
  selectedFreelancer: string[];
  minConnect?: number;
  rate?: number;
  experience?: number;
}

const BidDialog: React.FC<BidDialogProps> = ({
  handleUpdateStatus,
  projectId,
  bidId,
}) => {
  const [bidDetails, setBidDetails] = useState<BidDetails | null>(null); // Use BidDetails type and initialize as null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBidDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `/bid/project/${projectId}/profile/${bidId}/bid`,
        );
        if (response.data) {
          setBidDetails(response.data);
        } else {
          setError('No bid details available.');
        }
      } catch (error) {
        setError('Error fetching bid details.');
        console.error('Error fetching bid details:', error);
        notifyError('Something went wrong. Please try again.', 'Error');
      } finally {
        setLoading(false);
      }
    };

    if (projectId && bidId) {
      fetchBidDetails();
    } else {
      setLoading(false);
    }
  }, [projectId, bidId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Eye className="cursor-pointer text-gray-500 hover:text-blue-500" />
      </DialogTrigger>
      <DialogContent className="p-4 w-full">
        <DialogHeader>
          <DialogTitle>Bids Detail</DialogTitle>
          <DialogDescription>
            Detailed information about the bids.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 overflow-auto max-h-[500px]">
          {/* Ensure both selectedFreelancer and totalBid arrays are available */}
          {bidDetails?.selectedFreelancer?.map(
            (freelancer: string, index: number) => {
              // Ensure each freelancer has a corresponding bid
              const bidAmount = bidDetails.totalBid?.[index] ?? 'N/A';

              return (
                <Card
                  key={index}
                  className="p-4 border border-gray-300 rounded-lg shadow-md"
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">
                      {freelancer}
                    </CardTitle>
                    <CardDescription>{bidDetails.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold">Bid</p>
                        <p>{bidAmount}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                      <button
                        className="text-green-500 hover:text-green-700"
                        onClick={() =>
                          handleUpdateStatus(
                            bidDetails?.profile_id ?? '',
                            'accept',
                          )
                        }
                      >
                        <Check className="w-6 h-6" />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() =>
                          handleUpdateStatus(
                            bidDetails?.profile_id ?? '',
                            'reject',
                          )
                        }
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            },
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BidDialog;
