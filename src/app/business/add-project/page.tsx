'use client';
import { Search } from 'lucide-react';
// Removed: import { useSelector } from 'react-redux';

import Breadcrumb from '@/components/shared/breadcrumbList';
import { Input } from '@/components/ui/input';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { CreateProjectBusinessForm } from '@/components/form/businessCreateProjectForm';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import DropdownProfile from '@/components/shared/DropdownProfile';

export default function Dashboard() {
  // Removed: const user = useSelector((state: RootState) => state.user);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active=""
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active=""
          />

          <Breadcrumb
            items={[
              { label: 'Business', link: '/dashboard/business' },
              { label: 'Create Project', link: '#' },
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
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <CreateProjectBusinessForm />
        </main>
      </div>
    </div>
  );
}
