import React, { useState } from 'react';
import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export function ProjectSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="mt-10">
      <Button className="md:hidden p-4" onClick={toggleSidebar}>
        <Menu className="h-6 w-6" />
      </Button>

      <div
        className={`fixed inset-y-0 left-0 z-40
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:fixed md:translate-x-0`}
      >
        <ScrollArea className="min-h-screen w-60 rounded-md border top-0 left-0">
          <div className="p-4">
            <h4 className="mb-4 mt-2 text-xl font-bold leading-none text-center">
              Projects
            </h4>
            <Separator className="my-4" />
            <div className="p-2">
              <div className="mb-4">
                <div className="text-lg font-semibold mt-2 space-y-2">
                  <div className="flex items-center gap-2 hover:bg-slate-500 cursor-pointer rounded-lg p-2">
                    <span>All Project</span>
                  </div>
                  <div className="flex items-center gap-2 hover:bg-slate-500 cursor-pointer rounded-lg p-2">
                    <span>Current Project</span>
                  </div>
                  <div className="flex items-center gap-2 hover:bg-slate-500 cursor-pointer rounded-lg p-2">
                    <span>Ongoing Project</span>
                  </div>
                  <div className="flex items-center gap-2 hover:bg-slate-500 cursor-pointer rounded-lg p-2">
                    <span>Completed Project</span>
                  </div>
                  <div className="flex items-center gap-2 hover:bg-slate-500 cursor-pointer rounded-lg p-2">
                    <span>Rejected Project</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-30" onClick={toggleSidebar} />
      )}
    </div>
  );
}
