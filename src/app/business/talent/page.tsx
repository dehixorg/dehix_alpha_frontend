'use client';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Breadcrumb from '@/components/shared/breadcrumbList';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import DropdownProfile from '@/components/shared/DropdownProfile';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import { Card, CardTitle } from '@/components/ui/card';
import SkillDomainForm from '@/components/business/hireTalent.tsx/skillDomainForm';

export default function Talent() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Dehix Talent"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Dehix Talent"
          />
          <Breadcrumb
            items={[
              { label: 'Business', link: '/dashboard/business' },
              { label: 'HireTalent', link: '#' },
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

        {/* Main content area */}
        <main className="flex flex-col lg:flex-row gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:gap-16">
          
          {/* Left side: SkillDomainForm */}
          <div className="lg:w-2/3"> {/* Takes 2/3 of the space on large screens */}
            <SkillDomainForm />
          </div>
          
          {/* Right side: Talent */}
          <div className="lg:w-1/3 space-y-6"> {/* Takes 1/3 of the space */}
            <Card>
              <CardTitle className="group flex items-center gap-2 text-2xl">
                Talent
              </CardTitle>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
