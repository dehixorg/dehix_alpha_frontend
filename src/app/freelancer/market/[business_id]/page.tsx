'use client';
import { Search } from '@/components/search';
import Breadcrumb from '@/components/shared/breadcrumbList';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import DropdownProfile from '@/components/shared/DropdownProfile';
import BusinessProfile from '@/components/marketComponents/businessProfile/businessProfile';
import FreelancerAppLayout from '@/components/layout/FreelancerAppLayout';

export default function Talent() {
  const customHeader = (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:border-0 sm:px-6">
      <CollapsibleSidebarMenu
        menuItemsTop={[]}
        menuItemsBottom={[]}
        active="Market"
      />
      <Breadcrumb
        items={[
          { label: 'Freelancer', link: '/dashboard/freelancer' },
          { label: 'Freelancer Market', link: '#' },
        ]}
      />
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="w-full md:w-[200px] lg:w-[336px]" />
      </div>
      <DropdownProfile />
    </header>
  );

  return (
    <FreelancerAppLayout
      active="Market"
      activeMenu="Market"
      breadcrumbItems={[
        { label: 'Freelancer', link: '/dashboard/freelancer' },
        { label: 'Freelancer Market', link: '#' },
      ]}
      headerSlot={customHeader}
      mainClassName=""
    >
      <BusinessProfile />
    </FreelancerAppLayout>
  );
}
