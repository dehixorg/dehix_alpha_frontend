'use client';
import Link from 'next/link';
import {
  Boxes,
  Home,
  LineChart,
  Package,
  PanelLeft,
  ShoppingCart,
  Users2,
} from 'lucide-react';
import { useSelector } from 'react-redux';

import InterviewProfile from './profile';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { RootState } from '@/lib/store';
import SidebarMenu, { MenuItem } from '@/components/menu/sidebarMenu';

function InterviewPage() {
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
      icon: <Users2 className="h-5 w-5" />,
      label: 'Profile',
    },
    {
      href: '#',
      isActive: false,
      icon: <Package className="h-5 w-5" />,
      label: 'Current',
    },
    {
      href: '#',
      isActive: false,
      icon: <LineChart className="h-5 w-5" />,
      label: 'History',
    },
  ];
  const menuItemsBottom: MenuItem[] = [
    {
      href: '/dashboard/freelancer',
      isActive: false,
      icon: <Home className="h-5 w-5" />,
      label: 'Settings',
    },
  ];

  const user = useSelector((state: RootState) => state.user);

  return (
    <div className="flex min-h-screen w-full">
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
                  <Link href="#">Profile</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:flex-col xl:flex-col">
          <InterviewProfile />
        </main>
      </div>
    </div>
  );
}

export default InterviewPage;
