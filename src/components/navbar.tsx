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

interface UserNavProps {
  items: NavItem[];
}

export function Navbar({ items }: UserNavProps) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {items.map((item, index) => (
          <NavigationMenuItem key={index}>
            <Link href={item.link} legacyBehavior passHref>
              <NavigationMenuLink
                className={`${navigationMenuTriggerStyle()} text-base font-semibold ${
                  item.isButton
                    ? 'dark:bg-primary dark:text-black text-white bg-black px-5 py-3'
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
  );
}
