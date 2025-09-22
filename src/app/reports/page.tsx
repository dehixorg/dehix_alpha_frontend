'use client';

import { useSelector } from 'react-redux';
import { usePathname, useSearchParams } from 'next/navigation';
import { FileText, History as HistoryIcon } from 'lucide-react';

import { RootState } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Reports"
        isKycCheck={true}
      />

      <div className="flex flex-col sm:gap-6 sm:py-0 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Reports"
          breadcrumbItems={breadcrumbItems}
        />

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0">
          <div className="w-full mx-auto max-w-6xl">
            {/* Header Section */}
            <div className="flex flex-col gap-2 mb-6">
              <h1 className="text-2xl font-bold tracking-tight">
                Reports Center
              </h1>
              <p className="text-muted-foreground">
                Generate and manage your reports in one place
              </p>
            </div>

            {/* Main Content */}
            <div className="bg-muted/20 rounded-xl border shadow-sm overflow-hidden">
              <Tabs defaultValue="new" className="w-full">
                <div className="border-b px-6">
                  <TabsList className="bg-transparent h-12 w-full md:w-auto p-0">
                    <TabsTrigger
                      value="new"
                      className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      New Report
                    </TabsTrigger>
                    <TabsTrigger
                      value="history"
                      className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      <HistoryIcon className="mr-2 h-4 w-4" />
                      Past Reports
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="new" className="m-0">
                    <Card className="border-0 shadow-none bg-transparent">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Create New Report
                        </CardTitle>
                        <CardDescription>
                          Fill in the details below to generate a new report
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <NewReportTab reportData={reportData} />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="history" className="m-0">
                    <Card className="border-0 shadow-none bg-transparent">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Report History
                        </CardTitle>
                        <CardDescription>
                          View and manage your previously generated reports
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <PastReportsTab />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
