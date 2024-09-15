'use client';
import { Search, User } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { useSelector } from 'react-redux';

import { Badge } from '@/components/ui/badge';
import Breadcrumb from '@/components/shared/breadcrumbList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DropdownProfile from '@/components/shared/DropdownProfile';
import { Input } from '@/components/ui/input';
import ProjectDetailCard from '@/components/freelancer/project/projectDetailCard';
import { ProjectProfileDetailCard } from '@/components/freelancer/project/projectProfileDetailCard';
import SidebarMenu from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsTop,
  menuItemsBottom,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';

interface Project {
  _id: string;
  projectName: string | undefined | null;
  description: string | undefined | null;
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
  Bids?: any;
  profiles?: {
    domain?: string;
    freelancersRequired?: string;
    skills?: string[];
    experience?: number;
    minConnect?: number;
    rate?: number;
    description?: string;
  }[];
  status?: 'Active' | 'Pending' | 'Completed' | 'Rejected';
  team?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const getStatusBadge = (status: string | undefined) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return { text: 'ACTIVE', className: 'bg-blue-500 hover:bg-blue-600' };
    case 'pending':
      return { text: 'PENDING', className: 'bg-warning hover:bg-warning' };
    case 'completed':
      return { text: 'ACCEPTED', className: 'bg-success hover:bg-success' };
    case 'rejected':
      return { text: 'REJECTED', className: 'bg-red-500 hover:bg-red-600' };
    default:
      return { text: 'UNKNOWN', className: 'bg-gray-500 hover:bg-gray-600' };
  }
};
export default function Dashboard() {
  const { project_id } = useParams<{ project_id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const user = useSelector((state: RootState) => state.user);
  const [bids, setBids] = useState([
    {
      userName: '',
      current_price: '',
      bid_status: '',
      bidder_id: '',
    },
  ]);
  const [exist, setExist] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/business/${project_id}/project`,
        );
        setProject(response.data.data.data);
        if (response.data.data.message == 'Already Applied') {
          setExist(true);
        }
      } catch (error) {
        console.error('API Error:', error);
      }
    };
    fetchData();
  }, [project_id]);
  const fetchBid = useCallback(() => {
    async () => {
      try {
        const response = await axiosInstance(`bid/${project_id}/project/bid`);
        setBids(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };
  }, []);
  useEffect(() => {
    fetchBid();
  }, [project_id, exist]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Market"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Market"
          />

          <Breadcrumb
            items={[
              { label: 'Freelancer', link: '/dashboard/freelancer' },
              { label: 'Project', link: '/freelancer/market' },
              { label: project_id, link: '#' },
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

          <DropdownProfile />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div>
              <ProjectDetailCard
                projectName={project?.projectName}
                description={project?.description}
                email={project?.email}
                status={project?.status}
                startDate={project?.createdAt}
                endDate={project?.end}
                domains={[]}
                skills={project?.skillsRequired}
              />
            </div>
            {/* <Separator className="my-1" />
            <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
              Profiles
            </h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-4 sm:overflow-x-scroll sm:no-scrollbar pb-8">
              <ProjectProfileDetailCard className="w-full min-w-full p-4 shadow-md rounded-lg" />
            </div> */}
          </div>

          <div className="space-y-6">
            <CardTitle className="group flex items-center gap-2 text-2xl">
              Profiles
            </CardTitle>
            {project?.profiles?.map((profile: any, index: number) => (
              <ProjectProfileDetailCard
                key={index}
                className="w-full min-w-full p-4 shadow-md rounded-lg"
                {...profile}
                exist={exist}
              />
            ))}
          </div>
          <Card x-chunk="dashboard-01-chunk-5">
            <CardHeader>
              <CardTitle>Total Bids {bids.length}</CardTitle>
            </CardHeader>
            {bids.map((data) => {
              const { text, className } = getStatusBadge(data.bid_status);
              return (
                <CardContent className="grid gap-8" key={data.bidder_id}>
                  <div className="flex items-center gap-4">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                      {/* <AvatarImage src="/avatars/01.png" alt="Avatar" /> */}
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none md:ml-6">
                        {data.userName}
                      </p>
                      {/* <p className="text-sm text-muted-foreground">
                    {data.bidderEmail}
                  </p> */}
                    </div>
                    <div className="ml-auto font-medium">
                      ${data.current_price}
                    </div>
                    <Badge className={className}>{text}</Badge>
                  </div>
                </CardContent>
              );
            })}
          </Card>
        </main>
      </div>
    </div>
  );
}
