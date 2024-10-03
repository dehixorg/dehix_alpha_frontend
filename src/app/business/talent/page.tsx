'use client';

import { Search } from '@/components/search';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Breadcrumb from '@/components/shared/breadcrumbList';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import DropdownProfile from '@/components/shared/DropdownProfile';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import { CardTitle } from '@/components/ui/card';
import SkillDomainForm from '@/components/business/hireTalent.tsx/skillDomainForm';
import TalentCard from '@/components/business/hireTalent.tsx/talentCard';

export default function Talent() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Dehix Talent"
      />

      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 py-6 items-center gap-4 border-b bg-background px-4  sm:border-0  sm:px-6">
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
            <Search className="w-full md:w-[200px] lg:w-[336px]" />
          </div>
          <DropdownProfile />
        </header>

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            {' '}
            {/* Takes 2/3 of the space on large screens */}
            <SkillDomainForm />
          </div>

          {/* Right side: Talent */}
          <div className="space-y-6">
            {' '}
            {/* Takes 1/3 of the space */}
            <CardTitle className="group flex items-center gap-2 text-2xl">
              Talent
            </CardTitle>
            <div className="">
              <TalentCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
