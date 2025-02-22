'use client';
import { Filter, PackageOpen } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

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
// import { axiosInstance } from '@/lib/axiosinstance';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import DropdownProfile from '@/components/shared/DropdownProfile';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/oracleMenuItems';
// import WorkExpVerificationCard from '@/components/cards/oracleDashboard/workExpVerificationCard';
// import dummyData from '@/dummydata.json';
import { axiosInstance } from '@/lib/axiosinstance';
import WorkExpVerificationCard from '@/components/cards/oracleDashboard/workExpVerificationCard';
import { StatusEnum } from '@/utils/freelancer/enum';
import { toast } from '@/components/ui/use-toast';
// Define a union type for the filter options
type FilterOption = 'all' | 'current' | 'verified' | 'rejected';
interface JobData {
  _id: string;
  jobTitle: string;
  workDescription: string;
  company: string;
  workFrom: string;
  workTo: string;
  referencePersonName: string;
  referencePersonContact: string;
  githubRepoLink: string;
  comments: string;
  verificationStatus: string;
  onStatusUpdate: (newStatus: string) => void;
  onCommentUpdate: (newComment: string) => void;
}

export default function ProfessionalInfo() {
  const [JobData, setJobData] = useState<JobData[]>([]);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFilterChange = (newFilter: FilterOption) => {
    setFilter(newFilter);
    setIsDialogOpen(false);
  };

  const filteredData = JobData.filter((data) => {
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
        `/verification/oracle?doc_type=experience`,
      );
      setJobData(response.data.data);
      const flattenedData = response.data.data.flatMap((entry: any) =>
        Object.values(entry.professionalInfo),
      );
      setJobData(flattenedData);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong.Please try again.',
      }); // Error toast
      console.log(error, 'error in getting verification data');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateJobStatus = (index: number, newStatus: string) => {
    const updatedData = [...JobData];
    updatedData[index].verificationStatus = newStatus;
    setJobData(updatedData); // Assuming you set this in state
  };

  const updateCommentStatus = (index: number, newComment: string) => {
    const updatedData = [...JobData];
    updatedData[index].comments = newComment;
    setJobData(updatedData);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Experience Verification"
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4  sm:border-0  sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Experience Verification"
          />
          <Breadcrumb
            items={[
              { label: 'Freelancer', link: '/dashboard/freelancer' },
              { label: 'Oracle', link: '#' },
              
              {
                label: 'Experience Verification',
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
          <h1 className="text-3xl font-bold">Experience Verification</h1>
          <p className="text-gray-400 mt-2">
            Stay updated on your work experience verification status. Check back
            regularly for any new updates or requirements.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter Experience Status</DialogTitle>
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
            <WorkExpVerificationCard
              key={index}
              _id={data._id}
              jobTitle={data.jobTitle}
              workDescription={data.workDescription}
              company={data.company}
              startFrom={data.workFrom}
              endTo={data.workTo}
              referencePersonName={data.referencePersonName}
              referencePersonContact={data.referencePersonContact}
              githubRepoLink={data.githubRepoLink}
              comments={data.comments}
              status={data.verificationStatus} // Pass the status to the card component
              onStatusUpdate={(newStatus) => updateJobStatus(index, newStatus)}
              onCommentUpdate={(newComment) =>
                updateCommentStatus(index, newComment)
              }
            />
          ))}
          {JobData.length == 0 ? (
            <div className="text-center w-[90vw] px-auto mt-20 py-10">
              <PackageOpen className="mx-auto text-gray-500" size="100" />
              <p className="text-gray-500">
                No Work Experience verification for you now.
              </p>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
