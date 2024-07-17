'use client';
import { Search, UserIcon, Filter } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RootState } from '@/lib/store';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Breadcrumb from '@/components/shared/breadcrumbList';
// import { axiosInstance } from '@/lib/axiosinstance';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/oracleMenuItems';
import BusinessVerificationCard from '@/components/cards/oracleDashboard/businessVerificationCard';
import { Spinner } from '@/components/ui/spinner';

// Define a union type for the filter options
type FilterOption = 'all' | 'current' | 'verified' | 'rejected';

export default function ProfessionalInfo() {
  const user = useSelector((state: RootState) => state.user);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Adjust the delay

    return () => clearTimeout(timer);
  }, []);

  const [dummyBusinessData, setDummyBusinessData] = useState([
    {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '+1234567890',
      companyName: 'Tech Innovators Inc.',
      companySize: '500-1000 employees',
      referenceEmail: 'ref.john.smith@example.com',
      websiteLink: 'https://www.techinnovators.com',
      linkedInLink: 'https://www.linkedin.com/in/johnsmith',
      githubLink: 'https://github.com/johnsmith',
      comments: '',
      status: 'pending',
    },
    {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      phone: '+0987654321',
      companyName: 'Creative Solutions Ltd.',
      companySize: '100-500 employees',
      referenceEmail: 'ref.alice.johnson@example.com',
      websiteLink: 'https://www.creativesolutions.com',
      linkedInLink: 'https://www.linkedin.com/in/alicejohnson',
      githubLink: 'https://github.com/alicejohnson',
      comments: '',
      status: 'pending',
    },
    {
      firstName: 'Robert',
      lastName: 'Brown',
      email: 'robert.brown@example.com',
      phone: '+1122334455',
      companyName: 'Global Enterprises',
      companySize: '1000-5000 employees',
      referenceEmail: 'ref.robert.brown@example.com',
      websiteLink: 'https://www.globalenterprises.com',
      linkedInLink: 'https://www.linkedin.com/in/robertbrown',
      githubLink: 'https://github.com/robertbrown',
      comments: '',
      status: 'pending',
    },
  ]);

  const [filter, setFilter] = useState<FilterOption>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFilterChange = (newFilter: FilterOption) => {
    setFilter(newFilter);
    setIsDialogOpen(false);
  };

  const filteredData = dummyBusinessData.filter((data) => {
    if (filter === 'all') {
      return true;
    }
    return (
      data.status === filter ||
      (filter === 'current' && data.status === 'pending')
    );
  });

  const updateBusinessStatus = (index: number, newStatus: string) => {
    const updatedData = [...dummyBusinessData];
    updatedData[index].status = newStatus;
    setDummyBusinessData(updatedData); // Assuming you set this in state
  };

  const updateCommentStatus = (index: number, newComment: string) => {
    const updatedData = [...dummyBusinessData];
    updatedData[index].comments = newComment;
    setDummyBusinessData(updatedData);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Business Verification"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu
            menuItems={menuItemsTop}
            active="Business Verification"
          />
          <Breadcrumb
            items={[
              { label: 'Freelancer', link: '/dashboard/freelancer' },
              {
                label: 'Oracle Dashboard',
                link: '/dashboard/freelancer/oracleDashboard/businessVerification',
              },
              {
                label: 'Business Verification',
                link: '/dashboard/freelancer/oracleDashboard/businessVerification',
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/user.png" alt="@shadcn" />
                  <AvatarFallback>
                    <UserIcon size={16} />{' '}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
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

        {loading ? (
          <div className="flex items-center justify-center min-h-screen bg-muted/40">
            <Spinner size="large">Loading...</Spinner>
          </div>
        ) : (
          <main
            className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 
                    grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
          >
            {filteredData.map((data, index) => (
              <BusinessVerificationCard
                key={index}
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
          </main>
        )}
      </div>
    </div>
  );
}
