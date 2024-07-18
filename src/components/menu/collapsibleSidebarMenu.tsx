import * as React from 'react';
import Link from 'next/link';
import { PanelLeft } from 'lucide-react';

import { ThemeToggle } from '../shared/themeToggle';

import { MenuItem } from './sidebarMenu';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface CollapsibleSidebarMenuProps {
  menuItemsTop: MenuItem[];
  menuItemsBottom: MenuItem[];
  active: string;
  setActive?: (page: string) => void; // Making setActive optional
}

const CollapsibleSidebarMenu: React.FC<CollapsibleSidebarMenuProps> = ({
  menuItemsTop,
  menuItemsBottom,
  active,
  setActive = () => null, // Defaulting setActive to a no-op function
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex flex-col justify-between sm:max-w-xs"
      >
        <nav className="grid gap-6 text-lg font-medium">
          {menuItemsTop.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={() => setActive(item.label)}
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
        <div className="pt-5 mx-auto">
          <ThemeToggle />
        </div>
        <nav className="grid gap-6 text-lg font-medium">
          {menuItemsBottom.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={() => setActive(item.label)}
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
