import React from 'react';
import Link from 'next/link';

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

// Define TypeScript types for menu items
export interface MenuItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

type SidebarMenuProps = {
  menuItemsTop: MenuItem[];
  menuItemsBottom: MenuItem[];
  active: string;
};

const SidebarMenu: React.FC<SidebarMenuProps> = ({
  menuItemsTop,
  menuItemsBottom,
  active,
}) => {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        {menuItemsTop.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Link
                href={
                  item.label === active || item.label === 'Dehix'
                    ? '#'
                    : item.href
                }
                className={`flex h-9 w-9 items-center justify-center rounded-lg  ${item.label === active || item.label === 'Dehix' ? (item.label === 'Dehix' ? 'group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base' : 'flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8') : 'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8'} transition-colors hover:text-foreground md:h-8 md:w-8`}
              >
                {item.icon}
                <span className="sr-only">{item.label}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        ))}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        {menuItemsBottom.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.label === active || item.label === 'Dehix' ? (item.label === 'Dehix' ? 'group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base' : 'flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8') : 'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8'} transition-colors hover:text-foreground md:h-8 md:w-8`}
              >
                {item.icon}
                <span className="sr-only">{item.label}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        ))}
      </nav>
    </aside>
  );
};

export default SidebarMenu;
