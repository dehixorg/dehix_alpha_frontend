'use client';

import React, { useState } from 'react';
import { LogOut, Menu } from 'lucide-react';

import { Button } from './ui/button';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export function BusinessSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div>
      <Button className="md:hidden p-4" onClick={toggleSidebar}>
        <Menu className="h-6 w-6" />
      </Button>

      <div
        className={`fixed inset-y-0 left-0 z-40
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:fixed md:translate-x-0`}
      >
        <ScrollArea className="min-h-screen w-60 rounded-md border top-0 left-0">
          <div>
            <div className="p-4">
              <h4 className="mb-6 mt-4 text-xl font-bold leading-none text-center">
                Business Page
              </h4>
              <div className="p-4">
                <div className="text-lg font-semibold mb-6 hover:bg-slate-500 cursor-pointer rounded-lg">
                  Profile
                </div>
                <Separator className="-mt-2 mb-4" />
                <div className="text-lg font-semibold mb-6 hover:bg-slate-500 cursor-pointer rounded-lg">
                  Projects
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
