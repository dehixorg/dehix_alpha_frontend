import * as React from 'react';
import { useState, useEffect } from 'react';
import { PackageOpen, Eye, Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { axiosInstance } from '@/lib/axiosinstance';

interface BidDetail {
  id: string;
  userName: string;
  description: string;
  status: string;
  amount: number;
  interviewer: string;
  acceptStatus: string;
  rejectStatus: string;
}

interface UserData {
  bids: BidDetail[];
}

interface BidsDetailProps {
  id: string;
}

const BidsDetail: React.FC<BidsDetailProps> = ({ id }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  {
    /* 
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosInstance.get(``);
                const { bids } = response.data;
                setUserData({ bids });
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUserData();
        }
    }, [id]);
*/
  }
  // dummy data
  useEffect(() => {
    const fetchDummyData = () => {
      setTimeout(() => {
        const dummyBids: BidDetail[] = [
          {
            id: '1',
            userName: 'John Doe',
            description: 'Bid for project X',
            status: 'pending',
            amount: 500,
            interviewer: 'link',
            acceptStatus: 'accepted',
            rejectStatus: 'rejected',
          },
          {
            id: '2',
            userName: 'Alice Johnson',
            description: 'Bid for project Y',
            status: 'pending',
            amount: 300,
            interviewer: 'link',
            acceptStatus: 'accepted',
            rejectStatus: 'rejected',
          },
        ];
        setUserData({ bids: dummyBids });
        setLoading(false);
      }, 1000); // Simulate network delay
    };

    fetchDummyData();
  }, [id]);
  const updateBidStatus = async (
    bidId: string,
    status: 'accept' | 'reject',
  ) => {
    try {
      await axiosInstance.post(`/bid/${bidId}/status`, { status });
      setUserData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          bids: prev.bids.map((bid) =>
            bid.id === bidId ? { ...bid, status } : bid,
          ),
        };
      });
    } catch (error) {
      console.error(`Error updating bid status to ${status}:`, error);
    }
  };

  return (
    <div>
      <div className="mb-8 mt-4">
        <Card>
          <div className="lg:overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User-Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead>Interviewer</TableHead>
                  <TableHead>Accept</TableHead>
                  <TableHead>Reject</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <div className="flex justify-center items-center">
                        <p>loading....</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : userData ? (
                  <>
                    {userData.bids.map((bid) => (
                      <TableRow key={bid.id}>
                        <TableCell>{bid.userName}</TableCell>
                        <TableCell>{bid.amount}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="p-4">
                              <DialogHeader>
                                <DialogTitle>User Details</DialogTitle>
                                <DialogDescription>
                                  Detailed information about the bid.
                                </DialogDescription>
                              </DialogHeader>
                              <div>
                                <p>
                                  <strong>Id:</strong> {bid.id}
                                </p>
                                <p>
                                  <strong>User Name:</strong> {bid.userName}
                                </p>
                                <p>
                                  <strong>Status:</strong> {bid.status}
                                </p>
                                <p>
                                  <strong>Amount:</strong> {bid.amount}
                                </p>
                                <p>
                                  <strong>Interviewer:</strong>{' '}
                                  {bid.interviewer}
                                </p>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline">Interview</Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            onClick={() => updateBidStatus(bid.id, 'accept')}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            onClick={() => updateBidStatus(bid.id, 'reject')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <div className="text-center py-10 w-full mt-10">
                        <PackageOpen
                          className="mx-auto text-gray-500"
                          size="100"
                        />
                        <p className="text-gray-500">No data available.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BidsDetail;
