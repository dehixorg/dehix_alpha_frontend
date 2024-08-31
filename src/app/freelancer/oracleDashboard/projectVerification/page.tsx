'use client';
import { Search, Filter, PackageOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
//import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/oracleMenuItems';
import DropdownProfile from '@/components/shared/DropdownProfile';
import dummyData from '@/dummydata.json';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import ProjectVerificationCard from '@/components/cards/oracleDashboard/projectVerificationCard';
// Define a union type for the filter options
type FilterOption = 'all' | 'current' | 'verified' | 'rejected';
interface ProjectData {
  projectName: string;
  description: string;
  githubLink: string;
  start: string;
  end: string;
  refer: string;
  techUsed: string[];
  comments: string;
  role:string;
  projectType:string;
  verificationStatus: string;
  onStatusUpdate: (newStatus: string) => void;
  onCommentUpdate: (newComment: string) => void;
}

export default function ProfessionalInfo() {
  const [projectData, setProjectData] = useState<ProjectData[]>([]);
  const user = useSelector((state: RootState) => state.user);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFilterChange = (newFilter: FilterOption) => {
    setFilter(newFilter);
    setIsDialogOpen(false);
  };

  const filteredData = projectData.filter((data) => {
    if (filter === 'all') {
      return true;
    }
    return (
      data. verificationStatus === filter ||
      (filter === 'current' && data. verificationStatus === 'pending')
    );
  });

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(
        `/freelancer/${user.uid}/oracle?doc_type=project`,
      );
      // console.log(response.data)
      setProjectData(response.data.data);
      const flattenedData=response.data.data.flatMap((entry:any) =>
        Object.values(entry.projects)
      );
      setProjectData(flattenedData);
    } catch (error) {
      console.log(error, 'error in getting verification data');
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const updateProjectStatus = (index: number, newStatus: string) => {
    const updatedData = [...projectData];
    updatedData[index]. verificationStatus = newStatus;
    setProjectData(updatedData); // Assuming you set this in state
  };

  const updateCommentStatus = (index: number, newComment: string) => {
    const updatedData = [...projectData];
    updatedData[index].comments = newComment;
    setProjectData(updatedData);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop} // Assuming these are defined elsewhere
        menuItemsBottom={menuItemsBottom} // Assuming these are defined elsewhere
        active="Project Verification"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          {/* CollapsibleSidebarMenu and Breadcrumb components */}
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Project Verification"
          />
          <Breadcrumb
            items={[
              { label: 'Freelancer', link: '/dashboard/freelancer' },
              {
                label: 'Oracle Dashboard',
                link: '/freelancer/oracleDashboard/businessVerification',
              },
              {
                label: 'Project Verification',
                link: '#',
              },
            ]}
          />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter Project Status</DialogTitle>
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

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {filteredData.map((data, index) => (
            <ProjectVerificationCard
              key={index}
              projectName={data.projectName}
              description={data.description}
              githubLink={data.githubLink}
              startFrom={data.start}
              endTo={data.end}
              role={data.role}
              projectType={data.projectType}
              reference={data.refer}
              techUsed={data.techUsed}
              comments={data.comments}
              status={data.verificationStatus} 
              onStatusUpdate={(newStatus) =>
                updateProjectStatus(index, newStatus)
              }
              onCommentUpdate={(newComment) =>
                updateCommentStatus(index, newComment)
              }
            />
          ))}
         {projectData.length===0? <div className="text-center w-[90vw] px-auto mt-20 py-10">
            <PackageOpen className="mx-auto text-gray-500" size="100" />
            <p className="text-gray-500">
              No Project verification for you now.
            </p>
          </div>:null}
        </main>
      </div>
    </div>
  );
}
