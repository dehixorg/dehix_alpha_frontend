'use client';
import Link from 'next/link';
import {
  BookOpen,
  Boxes,
  Briefcase,
  HomeIcon,
  Package,
  Search,
  User,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Input } from '@/components/ui/input';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import SidebarMenu, { MenuItem } from '@/components/menu/sidebarMenu';
import { CreateProjectBusinessForm } from '@/components/form/businessCreateProjectForm';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import UserDropdownMenu from '@/components/dropdown/user';

export default function Dashboard() {
  const menuItemsTop: MenuItem[] = [
    {
      href: '#',
      icon: <Boxes className="h-4 w-4 transition-all group-hover:scale-110" />,
      label: 'Dehix',
    },
    {
      href: '',
      icon: <User className="h-5 w-5" />,
      label: 'Personal Info',
    },
    {
      href: '#',
      icon: <Briefcase className="h-5 w-5" />,
      label: 'Professional Info',
    },
    {
      href: '#',
      icon: <Package className="h-5 w-5" />,
      label: 'Projects',
    },
    {
      href: '#',
      icon: <BookOpen className="h-5 w-5" />,
      label: 'Education',
    },
  ];

  const menuItemsBottom: MenuItem[] = [
    {
      href: '/dashboard/freelancer',
      icon: <HomeIcon className="h-5 w-5" />,
      label: 'Home',
    },
  ];

  const user = useSelector((state: RootState) => state.user);
  const [responseData, setResponseData] = useState<any>({}); // State to hold response data

  console.log(responseData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/freelancer/${user.uid}`); // Example API endpoint, replace with your actual endpoint
        console.log('API Response:', response.data.projects);
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
        active=""
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu menuItems={menuItemsTop} active="" />
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#">Business</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Create Project</BreadcrumbPage>
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
          <UserDropdownMenu email={user.email} type={user.type} />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <CreateProjectBusinessForm />
        </main>
      </div>
    </div>
  );
}
