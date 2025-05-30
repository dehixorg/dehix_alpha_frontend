import React from 'react';

import Header from '@/components/header/header';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';

const MarketHeader: React.FC = () => {
  return (
    <div className="flex flex-col sm:py-0 mb-8">
      <Header
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        activeMenu="Dashboard"
        breadcrumbItems={[
          { label: 'Business', link: '/dashboard/business' },
          { label: 'Business Marketplace', link: '#' },
        ]}
      />
      <div className="mb-8 ml-6 mt-8">
        <h1 className="text-3xl font-bold"> Business Marketplace </h1>
        <p className="text-gray-400 mt-2">
          Discover a curated selection of business opportunities designed to
          connect freelancers with potential clients and projects.
        </p>
      </div>
    </div>
  );
};

export default MarketHeader;
