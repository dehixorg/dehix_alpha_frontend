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
                    ? 'bg-primary text-black px-5 py-3 rounded-md'
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
