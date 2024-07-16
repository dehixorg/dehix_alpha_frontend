import * as React from 'react';
import Link from 'next/link';
import { PanelLeft } from 'lucide-react';

import { ThemeToggle } from '../shared/themeToggle';

import { MenuItem } from './sidebarMenu';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface CollapsibleSidebarMenuProps {
  menuItems: MenuItem[];
  active: string;
  setActive?: (page: string) => void; // Making setActive optional
}

const CollapsibleSidebarMenu: React.FC<CollapsibleSidebarMenuProps> = ({
  menuItems,
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
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          {menuItems.map((item, index) => (
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
          <div className="pt-5 mx-auto">
            <ThemeToggle />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default CollapsibleSidebarMenu;
