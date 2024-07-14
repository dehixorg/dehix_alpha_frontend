/* eslint-disable react/prop-types */

'use client';
import Link from 'next/link';
import {
  Boxes,
  Sparkles,
  Home,
  LineChart,
  Package,
  Search,
  Settings,
  Users2,
  UserIcon,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import SidebarMenu, { MenuItem } from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface FormData {
  skills: string;
  experience: string;
  monthlyPay: string;
  domain: string; // Added domain field to FormData interface
}

interface PopoverContentFormProps {
  tableData: FormData[];
  setTableData: React.Dispatch<React.SetStateAction<FormData[]>>;
}
// eslint-disable-next-line react/prop-types
const PopoverContentForm: React.FC<PopoverContentFormProps> = ({
  tableData,
  setTableData,
}) => {
  const { register, handleSubmit, reset } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = (data) => {
    setTableData([...tableData, data]); // Add new form data to tableData state
    reset(); // Reset the form after submission
  };

  return (
    <PopoverContent className="w-80 right-0">
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Skills/Domains</h4>
          <p className="text-sm text-muted-foreground">
            Enter your skills / Domains, experience, and monthly pay.
          </p>
        </div>
        <div className="grid gap-2">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="skills">Skills/Domain</Label>
            <Input
              id="skills"
              {...register('skills')}
              className="col-span-2 h-8"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="experience">Experience</Label>
            <Input
              id="experience"
              {...register('experience')}
              className="col-span-2 h-8"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="monthlyPay">Monthly Pay</Label>
            <Input
              id="monthlyPay"
              {...register('monthlyPay')}
              className="col-span-2 h-8"
            />
          </div>
        </div>
        <div className="flex justify-center">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
      </form>
    </PopoverContent>
  );
};

const Dashboard = () => {
  const menuItemsTop: MenuItem[] = [
    {
      href: '#',
      icon: <Boxes className="h-4 w-4 transition-all group-hover:scale-110" />,
      label: 'Dehix',
    },
    {
      href: '#',
      icon: <Home className="h-5 w-5" />,
      label: 'Dashboard',
    },
    {
      href: '#',
      icon: <Package className="h-5 w-5" />,
      label: 'Projects',
    },
    {
      href: '#',
      icon: <Users2 className="h-5 w-5" />,
      label: 'Customers',
    },
    {
      href: '#',
      icon: <LineChart className="h-5 w-5" />,
      label: 'Analytics',
    },
    {
      href: '/dashboard/talent',
      icon: <Sparkles className="h-5 w-5" />,
      label: 'Talent',
    },
  ];

  const menuItemsBottom: MenuItem[] = [
    {
      href: '/settings/personal-info',
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
    },
  ];

  const user = useSelector((state: RootState) => state.user);
  const [responseData, setResponseData] = useState<any>({});
  const [tableData, setTableData] = useState<FormData[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set()); // Use Set for expanded rows

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/freelancer/${user.uid}`);
        setResponseData(response.data.projects);
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    fetchData();
  }, [user.uid]);

  // Function to toggle row expansion
  const toggleRow = (index: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Dashboard"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu menuItems={menuItemsTop} active="Dashboard" />
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
        <div className="ml-5">
          <h1 className="text-3xl font-semibold mb-4">Talent</h1>
        </div>
        <section className="flex justify-center">
          <div className="ml-5 mr-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Skills/Domain</Button>
              </PopoverTrigger>
              <PopoverContentForm
                tableData={tableData}
                setTableData={setTableData}
              />
            </Popover>
          </div>
        </section>
        <section className="m-5">
          <Card>
            <CardHeader className="px-7">
              <CardTitle>Skills/Domains</CardTitle>
              <CardDescription>
                Recent added skills and domains.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Skills/Domains</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Monthly pay</TableHead>
                    <TableHead>Show/Hide</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responseData &&
                    Object.values(responseData).map(
                      (project: any, index: number) => (
                        <TableRow key={project.id}>
                          {/* Table cells */}
                          <TableCell>{project.skills}</TableCell>
                          <TableCell>{project.experience}</TableCell>
                          <TableCell>{project.monthlyPay}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleRow(index)}
                            >
                              {expandedRows.has(index) ? 'Hide' : 'Show'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  {tableData.map((rowData, index) => (
                    <TableRow key={index + responseData.length}>
                      <TableCell>{rowData.skills}</TableCell>
                      <TableCell>{rowData.experience}</TableCell>
                      <TableCell>{rowData.monthlyPay}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleRow(index + responseData.length)}
                        >
                          {expandedRows.has(index + responseData.length)
                            ? 'Hide'
                            : 'Show'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
