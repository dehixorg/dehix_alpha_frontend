'use client';
import { Search, UserIcon } from 'lucide-react';
import { useSelector } from 'react-redux';

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
import { RootState } from '@/lib/store';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Breadcrumb from '@/components/shared/breadcrumbList';
// import { axiosInstance } from '@/lib/axiosinstance';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/oracleMenuItems';
import EducationVerificationCard from '@/components/cards/oracleDashboard/educationVerificationCard';

export default function ProfessionalInfo() {
  const user = useSelector((state: RootState) => state.user);
  const dummyEducationData = {
    type: "Bachelor's Degree",
    instituteName: 'University of Example',
    location: 'Example City, Example Country',
    startFrom: '2018-09-01',
    endTo: '2022-06-15',
    grade: 'A',
    referencePersonName: 'Dr. John Doe',
    degreeNumber: '123456789',
    comments: '',
  };
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Education Verification"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu
            menuItems={menuItemsTop}
            active="Education Verification"
          />
          <Breadcrumb
            items={[
              { label: 'Freelancer', link: '/dashboard/freelancer' },
              {
                label: 'Oracle Dashboard',
                link: '/dashboard/freelancer/oracleDashboard/businessVerification',
              },
              {
                label: 'Education Verification',
                link: '/dashboard/freelancer/oracleDashboard/educationVerification',
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
        <main
          className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 
                grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
        >
          <EducationVerificationCard
            type={dummyEducationData.type}
            instituteName={dummyEducationData.instituteName}
            location={dummyEducationData.location}
            startFrom={dummyEducationData.startFrom}
            endTo={dummyEducationData.endTo}
            grade={dummyEducationData.grade}
            referencePersonName={dummyEducationData.referencePersonName}
            degreeNumber={dummyEducationData.degreeNumber}
            comments={dummyEducationData.comments}
          />
          <EducationVerificationCard
            type={dummyEducationData.type}
            instituteName={dummyEducationData.instituteName}
            location={dummyEducationData.location}
            startFrom={dummyEducationData.startFrom}
            endTo={dummyEducationData.endTo}
            grade={dummyEducationData.grade}
            referencePersonName={dummyEducationData.referencePersonName}
            degreeNumber={dummyEducationData.degreeNumber}
            comments={dummyEducationData.comments}
          />
        </main>
      </div>
    </div>
  );
}