'use client';

import { useSelector } from 'react-redux';
import { usePathname, useSearchParams } from 'next/navigation';

import { RootState } from '@/lib/store';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { NewReportTab } from '@/components/report-tabs/NewReportTabs';
import PastReportsTab from '@/components/report-tabs/PastReportsTab';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import { ReportInfo } from '@/config/report/defaultReportInfo';
import {
  menuItemsTop as freelancerMenuItemsTop,
  menuItemsBottom as freelancerMenuItemsBottom,
} from '@/config/menuItems/freelancer/settingsMenuItems';
import {
  menuItemsTop as businessMenuItemsTop,
  menuItemsBottom as businessMenuItemsBottom,
} from '@/config/menuItems/business/settingsMenuItems';
import { getReportTypeFromPath } from '@/utils/getReporttypeFromPath';

export default function NewReportPage() {
  const user = useSelector((state: RootState) => state.user);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // NEW: Determine role-specific configurations
  const isBusinessRole = user.type === 'business';

  // NEW: Conditionally select the correct menu items and breadcrumbs based on the user's role.
  const menuItemsTop = isBusinessRole
    ? businessMenuItemsTop
    : freelancerMenuItemsTop;
  const menuItemsBottom = isBusinessRole
    ? businessMenuItemsBottom
    : freelancerMenuItemsBottom;

  const breadcrumbItems = isBusinessRole
    ? [
        { label: 'Business', link: '/dashboard/business' },
        { label: 'Reports', link: '#' },
      ]
    : [
        { label: 'Freelancer', link: '/dashboard/freelancer' },
        { label: 'Reports', link: '#' },
      ];

  const reportType = getReportTypeFromPath(pathname);
  const type = searchParams.get('type');
  const reportInfo: ReportInfo = {
    report_role: user.type || 'STUDENT',
    report_type: 'GENERAL',
    reportedbyId: user?.uid || 'user123',
  };

  const reportData = {
    subject: '',
    description: '',
    report_role: reportInfo.report_role,
    report_type: type || reportType,
    status: 'OPEN',
    reportedbyId: '',
    reportedId: reportInfo.reportedbyId,
  };

  return (
    // This `bg-muted/40` is already theme-aware, which is great!
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        // UPDATED: Pass the dynamically chosen menu items
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Reports"
        isKycCheck={true}
      />

      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14 mb-8">
        <Header
          // UPDATED: Pass the dynamically chosen menu and breadcrumb items
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Reports"
          breadcrumbItems={breadcrumbItems}
        />

        <main className="grid flex-1 items-start sm:px-6 sm:py-0">
          {/* CHANGE 1: Replaced `bg-white` with `bg-background`.
              `bg-background` will be white in light mode and a dark color in dark mode. */}
          <div className="w-full bg-background border rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Reports Center</h2>

            <Tabs defaultValue="new">
              <TabsList className="mb-4">
                <TabsTrigger value="new">New Report</TabsTrigger>
                <TabsTrigger value="history">Past Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="new">
                {/* CHANGE 2: Removed redundant styling from the inner div.
                    It will now inherit the `bg-background` from its parent.
                    This prevents a "card-within-a-card" look. Kept padding. */}
                <div className="p-4">
                  <NewReportTab reportData={reportData} />
                </div>
              </TabsContent>

              <TabsContent value="history">
                {/* CHANGE 3: Same as above for consistency. */}
                <div className="p-4">
                  <PastReportsTab />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
