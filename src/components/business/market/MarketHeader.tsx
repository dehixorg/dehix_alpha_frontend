import React from 'react';
import { Search } from 'lucide-react';

import Breadcrumb from '@/components/shared/breadcrumbList';
import DropdownProfile from '@/components/shared/DropdownProfile';
import { Input } from '@/components/ui/input';

const MarketHeader: React.FC = () => {
  return (
    <div>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background  sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Breadcrumb
          items={[
            { label: 'Dashboard', link: '/dashboard/business' },
            { label: 'Business Marketplace', link: '#' },
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
      <div className="mb-8 ml-10 mt-4">
        <h1 className="text-3xl font-bold"> Buisness Marketplace Overview</h1>
        <p className="text-gray-400 mt-2">
          Discover a curated selection of business opportunities designed to
          connect freelancers with potential clients and projects.
        </p>
      </div>
    </div>
  );
};

export default MarketHeader;
