'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { NewReportTab } from '@/components/report-tabs/NewReportTabs';
import PastReportsTab from '@/components/report-tabs/PastReportsTab';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import { ReportInfo } from '@/config/defaultReportInfo';
import {
  menuItemsTop,
  menuItemsBottom,
} from '@/config/menuItems/freelancer/settingsMenuItems'; // or admin if needed
import { usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { getReportTypeFromPath } from '@/utils/getReporttypeFromPath';
export default function NewReportPage() {
  const user = useSelector((state: RootState) => state.user);
 
  const pathname = usePathname();

  
    const searchParams = useSearchParams();

    const reportType = getReportTypeFromPath(pathname);
 const type = searchParams.get('type');
  const reportInfo: ReportInfo = {
    report_role: user.type || "STUDENT",
    report_type: "GENERAL",
    reportedbyId: user?.uid || "user123", // safer fetch
  };

  const reportData = {
    subject: "",
    description: "",
    report_role: reportInfo.report_role,
    report_type: type ||reportType,
    status: "OPEN",
    reportedbyId: "",
    reportedId: reportInfo.reportedbyId,
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Reports"
        isKycCheck={true}
      />

      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Reports"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Reports', link: '#' },
          ]}
        />

        <main className="grid flex-1 items-start sm:px-6 sm:py-0">
          <div className="w-full bg-white border rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Reports Center</h2>

            <Tabs defaultValue="new">
              <TabsList className="mb-4">
                <TabsTrigger value="new">New Report</TabsTrigger>
                <TabsTrigger value="history">Past Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="new">
                <div className="border rounded-md shadow-sm bg-white p-4">
                  <NewReportTab reportData={reportData} />
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="border rounded-md shadow-sm bg-white p-4">
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
