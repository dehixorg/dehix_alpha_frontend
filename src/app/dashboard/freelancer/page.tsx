'use client';
import Link from 'next/link';
import {
  Boxes,
  CheckCircle,
  ChevronRight,
  Clock,
  File,
  Home,
  LineChart,
  ListFilter,
  Package,
  PanelLeft,
  Search,
  Settings,
  ShoppingCart,
  Users2,
  UserIcon,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RootState } from '@/lib/store';
import StatCard from '@/components/shared/statCard';
import InterviewCard from '@/components/shared/interviewCard';
import { axiosInstance } from '@/lib/axiosinstance';
import SidebarMenu, { MenuItem } from '@/components/menu/sidebarMenu';

const sampleInterview = {
  interviewer: 'John Doe',
  interviewee: 'Jane Smith',
  skill: 'React Development',
  interviewDate: new Date('2023-11-23T10:30:00Z'),
  rating: 4.5,
  comments: 'Great communication skills and technical expertise.',
};

export default function Dashboard() {
  const menuItemsTop: MenuItem[] = [
    {
      href: '#',
      isActive: 'logo',
      icon: <Boxes className="h-4 w-4 transition-all group-hover:scale-110" />,
      label: 'Dehix',
    },
    {
      href: '#',
      isActive: true,
      icon: <Home className="h-5 w-5" />,
      label: 'Dashboard',
    },
    {
      href: '#',
      isActive: false,
      icon: <Package className="h-5 w-5" />,
      label: 'Projects',
    },
    {
      href: '#',
      isActive: false,
      icon: <Users2 className="h-5 w-5" />,
      label: 'Customers',
    },
    {
      href: '#',
      isActive: false,
      icon: <LineChart className="h-5 w-5" />,
      label: 'Analytics',
    },
    {
      href: '/dashboard/freelancer/interview',
      isActive: false,
      icon: <Users2 className="h-5 w-5" />,
      label: 'Interviews',
    },
  ];

  const menuItemsBottom: MenuItem[] = [
    {
      href: '/settings/personal-info',
      isActive: false,
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
    },
  ];

  const user = useSelector((state: RootState) => state.user);
  const [responseData, setResponseData] = useState<any>({}); // State to hold response data

  console.log(responseData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/freelancer/${user.uid}`); // Example API endpoint, replace with your actual endpoint
        setResponseData(response.data.projects); // Store response data in state
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    fetchData(); // Call fetch data function on component mount
  }, [user.uid]); // Empty dependency array ensures it runs only once on mount

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <Boxes className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">Dehix</span>
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-foreground"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Package className="h-5 w-5" />
                  Projects
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Users2 className="h-5 w-5" />
                  Customers
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <LineChart className="h-5 w-5" />
                  Settings
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
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
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <Card
                className="sm:col-span-2 flex flex-col h-full"
                x-chunk="dashboard-05-chunk-0"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-4xl mb-3">$1000</CardTitle>
                </CardHeader>
                <CardFooter className=" grid gap-4 grid-cols-4">
                  <div className="col-span-3">
                    <CardTitle>Total Earnings</CardTitle>
                    <CardDescription className="max-w-lg text-balance leading-relaxed">
                      Your total earnings from projects.
                    </CardDescription>
                  </div>
                  <div className="flex items-end justify-end">
                    <ChevronRight className="h-12 w-12 text-muted-foreground" />
                  </div>
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
            <Tabs defaultValue="active">
              <div className="flex items-center">
                <TabsList>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                </TabsList>
                <div className="ml-auto flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-sm"
                      >
                        <ListFilter className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only">Filter</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem checked>
                        Completed
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem>
                        Pending
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem>
                        Ongoing
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-sm"
                  >
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only">Export</span>
                  </Button>
                </div>
              </div>
              <TabsContent value="active">
                <Card>
                  <CardHeader className="px-7">
                    <CardTitle>Projects</CardTitle>
                    <CardDescription>
                      Recent projects from your account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {responseData &&
                          Object.values(responseData).map((project: any) => (
                            <TableRow key={project.id}>
                              <TableCell>
                                {/* <Link href={project.githubLink}> */}
                                <div className="font-medium">
                                  {project.projectName}
                                </div>
                                {/* </Link> */}
                                {/* <div className="hidden text-sm text-muted-foreground md:inline">{project.refer}</div> */}
                              </TableCell>
                              <TableCell>{project.projectType}</TableCell>
                              <TableCell>
                                <Badge
                                  className="text-xs"
                                  variant={
                                    project.verified ? 'secondary' : 'outline'
                                  }
                                >
                                  {project.verified
                                    ? 'Verified'
                                    : 'Not Verified'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(project.start).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" variant="outline">
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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
