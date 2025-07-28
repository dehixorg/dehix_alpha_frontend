"use client";
import * as React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import SidebarMenu from "@/components/menu/sidebarMenu";
import Header from "@/components/header/header";
import {
  menuItemsBottom,
  menuItemsTop,
} from "@/config/menuItems/freelancer/scheduleInterviewMenuItems";
import CurrentInterviews from "@/components/freelancer/scheduleInterview/CurrentInterviews";
import BidedInterviews from "@/components/freelancer/scheduleInterview/BidedInterviews";

export default function ScheduleInterviewPage() {
  return (
    <div className="flex min-h-screen w-full">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="ScheduleInterviews"
      />
      <div className="flex flex-col w-full mb-8 sm:py-0 sm:gap-2 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="ScheduleInterviews"
          breadcrumbItems={[
            { label: "Freelancer", link: "/dashboard/freelancer" },
            { label: "Schedule Interview", link: "#" },
          ]}
        />

        <Tabs defaultValue="bided" className="w-full mt-6">
          <TabsList className="grid mx-auto max-w-sm grid-cols-3 mb-4">
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="bided">Bided</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            <CurrentInterviews />
          </TabsContent>
          <TabsContent value="bided">
            <BidedInterviews />
          </TabsContent>
          <TabsContent value="history">
            <p className="text-muted-foreground">Coming soon…</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
