'use client';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import RequestManagementTable from '@/components/freelancer/consultant/RequestManagementTable';

export default function RequestManagement() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Requests"
      />
      <div className="flex flex-col sm:gap-0 sm:py-0 mb-8 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Requests"
          breadcrumbItems={[
            { label: 'Consultant', link: '/dashboard/consultant' },
            { label: 'Request Management', link: '#' },
          ]}
        />
        <main className="ml-5">
          <RequestManagementTable />
        </main>
      </div>
    </div>
  );
}
