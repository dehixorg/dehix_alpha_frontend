'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Filter, PackageOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Header from '@/components/header/header';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/oracleMenuItems';
import { StatusEnum } from '@/utils/freelancer/enum';
import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';
import BusinessVerificationCard from '@/components/cards/oracleDashboard/businessVerificationCard';

type FilterOption = 'all' | 'current' | 'verified' | 'rejected';

export default function ProfessionalInfo() {

  const [businessdata, setBusinessData] = useState<any[]>([]);

  const [filter, setFilter] = useState<FilterOption>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFilterChange = (newFilter: FilterOption) => {
    setFilter(newFilter);
    setIsDialogOpen(false);
  };

  const filteredData = businessdata.filter((data) => {
    if (filter === 'all') {
      return true;
    }
    return (
      data.verificationStatus === filter ||
      (filter === 'current' && data.verificationStatus === StatusEnum.PENDING)
    );
  });

  const fetchData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `/verification/oracle?doc_type=business`,
      );
      
      const result = response.data.data;

      const flattenedData = result.flatMap((entry: any) =>
        entry.result?.projects
          ? Object.values(entry.result.projects).map((project: any) => ({
            ...project,
            verifier_id: entry.verifier_id,
            verifier_username: entry.verifier_username,
          }))
          : [],
      );
      setBusinessData(flattenedData);
    } catch (error) {
      console.log(error, 'error in getting verification data');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong.Please try again.',
      }); // Error toast
    }
  }, []);

  // Log the requesterId state after it updates
  // useEffect(() => {
  //   console.log(requesterId);
  // }, [requesterId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // const filteredData = dummyBusinessData.filter((data) => {
  //   if (filter === 'all') {
  //     return true;
  //   }
  //   return (
  //     data.status === filter ||
  //     (filter === 'current' && data.status === 'pending')
  //   );
  // });

  const updateBusinessStatus = (index: number, newStatus: string) => {
    const updatedData = [...businessdata];
    updatedData[index].status = newStatus;
    setBusinessData(updatedData); // Assuming you set this in state
  };

  const updateCommentStatus = (index: number, newComment: string) => {
    const updatedData = [...businessdata];
    updatedData[index].comments = newComment;
    setBusinessData(updatedData);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Business Verification"
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Dashboard"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Oracle', link: '#' },
            {
              label: 'Business Verification',
              link: '#',
            },
          ]}
        />
        <div className="mb-8 ml-4 flex justify-between mt-8 md:mt-4 items-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Business Verification</h1>
            <p className="text-gray-400 mt-2">
              Monitor the status of your Business verifications.
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="mr-8 mb-12"
            onClick={() => setIsDialogOpen(true)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter Education Status</DialogTitle>
            </DialogHeader>
            <RadioGroup
              defaultValue="all"
              value={filter}
              onValueChange={(value: FilterOption) => handleFilterChange(value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="filter-all" />
                <label htmlFor="filter-all">All</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="current" id="filter-current" />
                <label htmlFor="filter-current">Pending</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="verified" id="filter-verified" />
                <label htmlFor="filter-verified">Verified</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rejected" id="filter-rejected" />
                <label htmlFor="filter-rejected">Rejected</label>
              </div>
            </RadioGroup>
            <DialogFooter>
              <Button type="button" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <main
          className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 
                grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
        >
          {filteredData.map((data, index) => (
            <BusinessVerificationCard
              key={index}
              _id={data._id}
              firstName={data.firstName}
              lastName={data.lastName}
              email={data.email}
              phone={data.phone}
              companyName={data.companyName}
              companySize={data.companySize}
              referenceEmail={data.referenceEmail}
              websiteLink={data.websiteLink}
              linkedInLink={data.linkedInLink}
              githubLink={data.githubLink}
              comments={data.comments}
              status={data.status} // Pass the status to the card component
              onStatusUpdate={(newStatus) =>
                updateBusinessStatus(index, newStatus)
              }
              onCommentUpdate={(newComment) =>
                updateCommentStatus(index, newComment)
              }
            />
          ))}
          {/* {dummyBusinessData.length == 0 ? (
            <div className="text-center w-[90vw] px-auto mt-20 py-10">
              <PackageOpen className="mx-auto text-gray-500" size="100" />
              <p className="text-gray-500">
                No Business verification for you now.
              </p>
            </div>
          ) : null} */}
        </main>
      </div>
    </div>
  );
}
