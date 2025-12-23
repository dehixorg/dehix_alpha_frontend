'use client';

import * as React from 'react';
import Link from 'next/link';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

interface NavItem {
  label: string;
  link: string;
  isButton?: boolean;
}

interface NavbarProps {
  items: NavItem[];
}

export function Navbar({ items }: NavbarProps) {
  return (
    <header className="sm:static fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b h-16">
      <div className="flex h-full items-center justify-center px-4 sm:px-6 md:px-6">
        <NavigationMenu>
          <NavigationMenuList>
            {items.map((item, index) => (
              <NavigationMenuItem key={index}>
                <Link href={item.link} legacyBehavior passHref>
                  <NavigationMenuLink
                    className={`${navigationMenuTriggerStyle()} text-base font-semibold ${
                      item.isButton
                        ? 'bg-black text-white dark:bg-primary dark:text-black'
                        : ''
                    }`}
                  >
                    {item.label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        </div>
        </header>
  );
}
