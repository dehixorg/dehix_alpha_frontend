'use client';
import { Filter, PackageOpen } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Search } from '@/components/search';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Breadcrumb from '@/components/shared/breadcrumbList';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import DropdownProfile from '@/components/shared/DropdownProfile';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/oracleMenuItems';
// import EducationVerificationCard from '@/components/cards/oracleDashboard/educationVerificationCard';
// import dummyData from '@/dummydata.json';
import { axiosInstance } from '@/lib/axiosinstance';
import EducationVerificationCard from '@/components/cards/oracleDashboard/educationVerificationCard';
import { StatusEnum } from '@/utils/freelancer/enum';
import { toast } from '@/components/ui/use-toast';
// Define a union type for the filter options
type FilterOption = 'all' | 'current' | 'verified' | 'rejected';
interface EducationData {
  _id: string;
  degree: string;
  universityName: string;
  startDate: string;
  endDate: string;
  grade: string;
  fieldOfStudy: string;
  comments: string;
  verificationStatus: string;
}

export default function ProfessionalInfo() {
  // Initialize state with education data from dummydata.json
  const [educationdata, setEducationData] = useState<EducationData[]>([]);

  const [filter, setFilter] = useState<FilterOption>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFilterChange = (newFilter: FilterOption) => {
    setFilter(newFilter);
    setIsDialogOpen(false);
  };

  const filteredData = educationdata.filter((data) => {
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
        `/verification/oracle?doc_type=education`,
      );
      const data = response.data.data;
      setEducationData(data);
      const flattenedData = data.flatMap((entry: any) =>
        Object.values(entry.education),
      );
      setEducationData(flattenedData);
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

  // const updateEducationStatus = (index: number, newStatus: string) => {
  //   const updatedData = [...educationdata];
  //   updatedData[index].verificationStatus = newStatus;
  //   setEducationData(updatedData); // Update state with new status
  // };

  // const updateCommentStatus = (index: number, newComment: string) => {
  //   const updatedData = [...educationdata];
  //   updatedData[index].comments = newComment;
  //   setEducationData(updatedData); // Update state with new comment
  // };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Education Verification"
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4  sm:border-0  sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Education Verification"
          />
          <Breadcrumb
            items={[
              { label: 'Freelancer', link: '/dashboard/freelancer' },
              { label: 'Oracle', link: '#' },

              {
                label: 'Education Verification',
                link: '#',
              },
            ]}
          />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="w-full md:w-[200px] lg:w-[336px]" />
          </div>

          <Button
            variant="outline"
            size="icon"
            className="ml-4"
            onClick={() => setIsDialogOpen(true)}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <DropdownProfile />
        </header>
        <div className="mb-8 ml-10">
          <h1 className="text-3xl font-bold">Education Verification</h1>
          <p className="text-gray-400 mt-2">
            Monitor the status of your Education verifications.
          </p>
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
            <EducationVerificationCard
              key={index}
              type="education"
              _id={data._id}
              degree={data.degree}
              location={data.universityName} // Note: update as per your interface if needed
              startFrom={data.startDate}
              endTo={data.endDate}
              grade={data.grade}
              fieldOfStudy={data.fieldOfStudy}
              comments={data.comments}
              status={data.verificationStatus}
              onStatusUpdate={(newStatus) => {
                // Handle status update
                console.log('Status updated to:', newStatus);
              }}
              onCommentUpdate={(newComment) => {
                // Handle comment update
                console.log('Comment updated to:', newComment);
              }}
            />
          ))}
          {educationdata.length === 0 ? (
            <div className="text-center w-[90vw] px-auto mt-20 py-10">
              <PackageOpen className="mx-auto text-gray-500" size="100" />
              <p className="text-gray-500">
                No Education verification for you now.
              </p>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
