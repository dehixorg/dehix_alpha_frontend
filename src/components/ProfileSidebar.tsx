"use client";

import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutDashboard, LogOut, Menu, Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";

export function ProfileSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="relative">
      <button
        className="md:hidden p-4"
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className={`fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-40
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0`}>
        <ScrollArea className="min-h-screen w-60 rounded-md border top-0 left-0">
          <div>
            <div className="p-4">
              <h4 className="mb-6 mt-4 text-xl font-bold leading-none text-center">Profile</h4>
              <div className="p-4">
                <div className="text-lg font-semibold mb-6 hover:bg-slate-500 cursor-pointer rounded-lg">
                  Your Profile
                </div>
                <Separator className="-mt-2 mb-4" />
                <div className="mb-6">
                  <div className="text-lg font-medium text-gray-400 pb-2">
                    Contents
                  </div>
                  <div className="text-lg font-semibold">
                    <div className="flex flex-1 items-center gap-2 hover:bg-slate-500 cursor-pointer rounded-lg">
                      <LayoutDashboard />
                      Dashboard
                    </div>
                  </div>
                </div>
                <Separator className="-mt-2 mb-4" />
                <div>
                  <div className="text-lg font-medium text-gray-400 pb-2">
                    Settings
                  </div>
                  <div className="text-lg font-semibold">
                    <div className="flex flex-1 items-center gap-2 hover:bg-slate-500 cursor-pointer rounded-lg">
                      <Settings />
                      Account
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="m-10 mt-3">
              <div className="flex flex-1 items-center gap-2">
                <LogOut />
                <Button>Sign Out</Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}
