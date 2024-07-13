'use client';
import Image from 'next/image';
import Link from 'next/link';
import {
  Boxes,
  CheckCircle,
  Clock,
  Home,
  LineChart,
  Package,
  Search,
  Settings,
  Users2,
} from 'lucide-react';
import { useSelector } from 'react-redux';

import SidebarMenu, { MenuItem } from '@/components/menu/sidebarMenu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { RootState } from '@/lib/store';
import StatCard from '@/components/shared/statCard';
import { ProjectCard } from '@/components/cards/projectCard';
import InterviewCard from '@/components/shared/interviewCard';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import { menuItemsBottom, menuItemsTop } from '@/config/menuItems/business/dashboardMenuItems';

const sampleInterview = {
  interviewer: 'John Doe',
  interviewee: 'Jane Smith',
  skill: 'React Development',
  interviewDate: new Date('2023-11-23T10:30:00Z'),
  rating: 4.5,
  comments: 'Great communication skills and technical expertise.',
};

export default function Dashboard() {
  const user = useSelector((state: RootState) => state.user);
  console.log(user);
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Dashboard"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          {/* side bar need to make caomponent */}
          <CollapsibleSidebarMenu menuItems={menuItemsTop} active="Dashboard" />

          {/* bredcrumbs need to make compont  */}
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Business</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* search need to remove without changing the layout */}
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>

          {/* profile dropdown need to create separeant component */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Image
                  src="/placeholder-user.jpg"
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="overflow-hidden rounded-full"
                />
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
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {/* Create project card */}
              <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
                <CardHeader className="pb-3">
                  <CardTitle>Your Projects</CardTitle>
                  <CardDescription className="max-w-lg text-balance leading-relaxed">
                    Introducing Our Dynamic Projects Dashboard for Seamless
                    Management and Insightful Analysis.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button>
                    <Link href="/business/add-project">Create New Project</Link>
                  </Button>
                </CardFooter>
              </Card>

              <StatCard
                title="Active Projects"
                value={12}
                icon={<CheckCircle className="h-6 w-6 text-success" />}
                additionalInfo="+10% from last month"
              />

              <StatCard
                title="Pending Projects"
                value={5}
                icon={<Clock className="h-6 w-6 text-warning" />}
                additionalInfo="2 new projects this week"
              />
            </div>
            <Separator className="my-1" />
            <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
              Current Projects {'(2)'}
            </h2>
            <div className="flex gap-4 overflow-x-scroll no-scrollbar pb-8">
              <ProjectCard className="min-w-[45%] " projectType={'current'} />
              <ProjectCard className="min-w-[45%] " projectType={'current'} />
            </div>

            <Separator className="my-1" />
            <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
              Completed Projects {'(3)'}
            </h2>
            <div className="flex gap-4 overflow-x-scroll no-scrollbar pb-8">
              <ProjectCard className="min-w-[45%] " projectType={'completed'} />
              <ProjectCard className="min-w-[45%] " projectType={'completed'} />
              <ProjectCard className="min-w-[45%] " projectType={'completed'} />
            </div>
          </div>
          <div className="space-y-6">
            <CardTitle className="group flex items-center gap-2 text-2xl">
              Interviews
            </CardTitle>
            <InterviewCard {...sampleInterview} />
            <InterviewCard {...sampleInterview} />
          </div>
        </main>
      </div>
    </div>
  );
}
