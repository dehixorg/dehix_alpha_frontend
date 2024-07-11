// components/Breadcrumb.tsx

import React from 'react';
import Link from 'next/link';

import {
  Breadcrumb as UiBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbProps {
  items: { link: string; label: string }[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <UiBreadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={item.link}>{item.label}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {index !== items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </UiBreadcrumb>
  );
};

export default Breadcrumb;
