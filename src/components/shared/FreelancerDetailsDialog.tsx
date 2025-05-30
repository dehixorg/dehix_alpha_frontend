import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';

import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/hooks/use-toast';

interface FreelancerDetailsDialogProps {
  freelancerId: string;
  onClose: () => void;
}

const FreelancerDetailsDialog: React.FC<FreelancerDetailsDialogProps> = ({
  freelancerId,
  onClose,
}) => {
  const [freelancerDetails, setFreelancerDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFreelancerDetails = async () => {
      if (freelancerId) {
        setLoading(true);
        try {
          const response = await axiosInstance.get(
            `/freelancer/${freelancerId}`,
          );
          setFreelancerDetails(response.data);
        } catch (error) {
          console.error('Error fetching freelancer details:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Something went wrong.Please try again.',
          }); // Error toast
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFreelancerDetails();
  }, [freelancerId]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-base">
                {freelancerDetails?.userName}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Details of the freelancer.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center">
              <Image
                src={
                  freelancerDetails?.profilePic ||
                  'https://img.freepik.com/premium-photo/flat-icon-design_1258715-221692.jpg?semt=ais_hybrid'
                }
                alt="Profile of freelancer"
                width={80}
                height={80}
                className="rounded-full border-2 border-gray-300 mb-3 object-cover"
                unoptimized
              />
              <h2 className="text-lg font-semibold">{`${freelancerDetails?.firstName} ${freelancerDetails?.lastName}`}</h2>
              <p className="text-sm text-gray-500">{freelancerDetails?.role}</p>

              <div className="mt-3 space-y-1 text-center">
                <p className="text-sm">Email: {freelancerDetails?.email}</p>
                <p className="text-sm">Phone: {freelancerDetails?.phone}</p>
                <p className="text-sm">
                  Hourly Rate: ${freelancerDetails?.perHourPrice}
                </p>
              </div>

              <div className="flex space-x-3 mt-4">
                {freelancerDetails?.githubLink && (
                  <a
                    href={freelancerDetails?.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      GitHub
                    </Button>
                  </a>
                )}
                {freelancerDetails?.linkedin && (
                  <a
                    href={freelancerDetails?.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      LinkedIn
                    </Button>
                  </a>
                )}
                {freelancerDetails?.personalWebsite && (
                  <a
                    href={freelancerDetails?.personalWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      Website
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </>
        )}
        <DialogFooter className="mt-4"></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FreelancerDetailsDialog;
