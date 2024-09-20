import * as React from 'react';
import { useState, useEffect } from 'react';
import { PackageOpen } from 'lucide-react';

import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { axiosInstance } from '@/lib/axiosinstance';
import { Eye } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ProjectProfile {
  selectedFreelancer?: string[];
  totalBid?: number[];
  domain?: string;
  freelancersRequired?: string;
  skills?: string[];
  experience?: number;
  minConnect?: number;
  rate?: number;
  description?: string;
  _id?: string;
}

interface BidDetail {
  _id: string;
  projectName: string;
  description: string;
  companyId: string;
  email: string;
  url?: { value: string }[];
  verified?: any;
  isVerified?: string;
  companyName: string;
  start?: Date;
  end?: Date | null;
  skillsRequired: string[];
  experience?: string;
  role?: string;
  projectType?: string;
  profiles?: ProjectProfile[];
  status?: 'Active' | 'Pending' | 'Completed' | 'Rejected';
  team?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserData {
  data: BidDetail;
}

interface BidsDetailProps {
  id: string;
}

const BidsDetail: React.FC<BidsDetailProps> = ({ id }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get(`/business/${id}/project`);
        setUserData(response.data); // Directly set the response data
      } catch (error) {
        setError('Error fetching user data.');
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

  return (
    <div>
      <div className="mb-8 mt-4">
        <Card>
          <div className="lg:overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Min Connect</TableHead>
                  <TableHead>Total Bid</TableHead>
                  <TableHead>More</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <p>Loading...</p>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <p>{error}</p>
                    </TableCell>
                  </TableRow>
                ) : userData?.data.profiles?.length ? (
                  <>
                    {userData.data.profiles.map((profile) => (
                      <TableRow key={profile._id}>
                        <TableCell>{profile.domain ?? 'N/A'}</TableCell>
                        <TableCell>{profile.rate ?? 'N/A'}</TableCell>
                        <TableCell>{profile.experience ?? 'N/A'}</TableCell>
                        <TableCell>{profile.minConnect ?? 'N/A'}</TableCell>
                        <TableCell>{profile.totalBid?.length ?? 0}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Eye className="cursor-pointer text-gray-500 hover:text-blue-500" />
                            </DialogTrigger>
                            <DialogContent className="p-4">
                              <DialogHeader>
                                <DialogTitle>Bids Table</DialogTitle>
                                <DialogDescription>
                                  Detailed information about the Bids .
                                </DialogDescription>
                              </DialogHeader>
                              <div>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-[100px]">Freelancer</TableHead>
                                      <TableHead className="text-right">bids</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                  {profile.selectedFreelancer?.map((freelancer, index) => (
                                      <TableRow key={index}>
                                        <TableCell>{freelancer}</TableCell>
                                        <TableCell>{profile.totalBid?.[index] ?? 'N/A'}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <div className="text-center py-10 w-full mt-10">
                        <PackageOpen className="mx-auto text-gray-500" size="100" />
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
