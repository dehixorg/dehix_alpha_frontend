import * as React from 'react';
import Link from 'next/link';
import { PanelLeft } from 'lucide-react';

import { MenuItem } from './sidebarMenu';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface CollapsibleSidebarMenuProps {
  menuItems: MenuItem[];
  active: string;
}

const CollapsibleSidebarMenu: React.FC<CollapsibleSidebarMenuProps> = ({
  menuItems,
  active,
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center gap-4 px-2.5 ${
                item.label === 'Dehix'
                  ? 'group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base'
                  : item.label === active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.icon}
              {item.label !== 'Dehix' && item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default CollapsibleSidebarMenu;
