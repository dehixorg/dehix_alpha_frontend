'use client';

import SidebarMenu from '@/components/menu/sidebarMenu';
import { CreateProjectBusinessForm } from '@/components/form/businessCreateProjectForm';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import Header from '@/components/header/header';

export default function Dashboard() {
  // Removed: const user = useSelector((state: RootState) => state.user);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active=""
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu=""
          breadcrumbItems={[
            { label: 'Business', link: '/dashboard/business' },
            { label: 'Create Project', link: '#' },
          ]}
        />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-2 md:gap-8">
          <CreateProjectBusinessForm />
        </main>
      </div>
    </div>
  );
}
