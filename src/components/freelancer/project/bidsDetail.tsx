import * as React from 'react';
import { useState, useEffect } from 'react';
import { PackageOpen } from 'lucide-react';

import BidDialog from './bidDialog';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { axiosInstance } from '@/lib/axiosinstance';
import { Card } from '@/components/ui/card';

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
  companyName?: string;
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

interface BidsDetailsProps {
  id: string;
}

const BidsDetails: React.FC<BidsDetailsProps> = ({ id }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get(`/business/${id}/project`); 
        if (response.data) {
          setUserData(response.data); 
        } else {
          setError('No user data available.');
        } 
      } catch (error) {
        setError('Error fetching user data.');
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleUpdateStatus = async (bidId: string, status: string) => {
    try {
      await axiosInstance.put(`/bid/${bidId}/status`, { status });
      //console.log(`Bid ${bidId} updated with status: ${status}`);
    } catch (error) {
      console.error(`Error updating bid status for ${bidId}:`, error);
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
                          <BidDialog
                            handleUpdateStatus={handleUpdateStatus}
                            projectId={id} // Pass the project ID
                            bidId={profile._id ?? ''} // Pass the profile ID
                          />
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
                        <p className="text-gray-500 text-lg">
                          No bid profiles found
                        </p>
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

export default BidsDetails;
