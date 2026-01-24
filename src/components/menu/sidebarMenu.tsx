// import React from 'react';
// import Link from 'next/link';

// import { ThemeToggle } from '../shared/themeToggle';

// import {
//   Tooltip,
//   TooltipTrigger,
//   TooltipContent,
// } from '@/components/ui/tooltip';

// // Define TypeScript types for menu items
// export interface MenuItem {
//   href: string;
//   icon: React.ReactNode;
//   label: string;
// }

// type SidebarMenuProps = {
//   menuItemsTop: MenuItem[];
//   menuItemsBottom: MenuItem[];
//   active: string;
//   setActive?: (page: string) => void; // Making setActive optional
// };

// const SidebarMenu: React.FC<SidebarMenuProps> = ({
//   menuItemsTop,
//   menuItemsBottom,
//   active,
//   setActive = () => null, // Defaulting setActive to a no-op function
// }) => {
//   return (
//     <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
//       <nav className="flex flex-col items-center gap-4 px-2 py-5">
//         {menuItemsTop.map((item, index) => (
//           <Tooltip key={index}>
//             <TooltipTrigger asChild>
//               <Link
//                 href={item.href}
//                 onClick={() => setActive(item.label)}
//                 className={`flex h-9 w-9 items-center justify-center rounded-lg  ${item.label === active || item.label === 'Dehix' ? (item.label === 'Dehix' ? 'group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base' : 'flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8') : 'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8'} transition-colors hover:text-foreground md:h-8 md:w-8`}
//               >
//                 {item.icon}
//                 <span className="sr-only">{item.label}</span>
//               </Link>
//             </TooltipTrigger>
//             <TooltipContent side="right">{item.label}</TooltipContent>
//           </Tooltip>
//         ))}
//       </nav>

//       <div className="mt-auto mx-auto">
//         <ThemeToggle />
//       </div>
//       <nav className="flex flex-col items-center gap-4 px-2 py-5">
//         {menuItemsBottom.map((item, index) => (
//           <Tooltip key={index}>
//             <TooltipTrigger asChild>
//               <Link
//                 href={item.href}
//                 className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.label === active || item.label === 'Dehix' ? (item.label === 'Dehix' ? 'group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base' : 'flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8') : 'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8'} transition-colors hover:text-foreground md:h-8 md:w-8`}
//               >
//                 {item.icon}
//                 <span className="sr-only">{item.label}</span>
//               </Link>
//             </TooltipTrigger>
//             <TooltipContent side="right">{item.label}</TooltipContent>
//           </Tooltip>
//         ))}
//       </nav>
//     </aside>
//   );
// };

// export default SidebarMenu;

'use client';

import type React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Verified } from 'lucide-react';

import { ThemeToggle } from '../shared/themeToggle';
//import { ChatList } from '../shared/chatList';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RootState } from '@/lib/store';

export interface MenuItem {
  href?: string;
  icon: React.ReactNode;
  label: string;
  subItems?: {
    href: string;
    icon: React.ReactNode;
    label: string;
  }[];
  onClick?: () => void;
}

type SidebarMenuProps = {
  menuItemsTop: MenuItem[];
  menuItemsBottom: MenuItem[];
  active: string;
  setActive?: (page: string) => void;
  isKycCheck?: boolean;
  conversations?: any[];
  activeConversation?: any;
  setActiveConversation?: (conversation: any) => void;
};

const SidebarMenu: React.FC<SidebarMenuProps> = ({
  menuItemsTop,
  menuItemsBottom,
  active,
  setActive = () => null,
  isKycCheck,
  conversations,
  setActiveConversation,
  activeConversation,
}) => {
  const pathname = usePathname();

  const user = useSelector((state: RootState) => state.user);
  const isActive = (href: string) => pathname === href;
  const isActiveParent = (item: MenuItem) => {
    if (isActive(item.href ? item.href : '')) return true;
    return item.subItems?.some((subItem) => isActive(subItem.href));
  };

  const finalMenuItemsTop = [...menuItemsTop];

  if (
    isKycCheck &&
    user?.kycStatus !== 'ACTIVE' &&
    user?.kycStatus !== undefined
  ) {
    finalMenuItemsTop.splice(3, 0, {
      href: `/${user?.type?.toLowerCase()}/settings/kyc`,
      icon: <Verified className="h-5 w-5" />,
      label: 'kyc',
    });
  }

  const ChatAvatar = ({ conversation }: { conversation: any }) => {
    if (
      !conversation ||
      typeof conversation !== 'object' ||
      Array.isArray(conversation) ||
      !setActiveConversation
    ) {
      return null;
    }

    const name = conversation.name || 'Unknown';
    const isActive = activeConversation?.id === conversation.id;

    return (
      <Avatar
        className={`w-10 h-10 cursor-pointer transition-all ${
          isActive ? 'border-2 border-blue-500' : 'border-transparent'
        }`}
        onClick={() => setActiveConversation(conversation)}
      >
        <AvatarImage src="" alt={name} />
        <AvatarFallback>
          {name
            .split(' ')
            .map((word: any) => word.charAt(0).toUpperCase())
            .join('')
            .slice(0, 2)}
        </AvatarFallback>
      </Avatar>
    );
  };

  const MenuIcon = ({ item }: { item: MenuItem }) => {
    if (item.subItems) {
      return (
        <Popover>
          <PopoverTrigger
            aria-haspopup="menu"
            aria-label={item.label}
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              isActiveParent(item)
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground'
            } transition-colors md:h-8 md:w-8`}
          >
            {item.icon}
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="start"
            className="w-48 p-2"
            sideOffset={8}
          >
            <div className="flex flex-col gap-1">
              {item.subItems.map((subItem, subIndex) => (
                <Link
                  key={subIndex}
                  href={subItem.href}
                  onClick={() => setActive(subItem.label)}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                    isActive(subItem.href)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  aria-current={isActive(subItem.href) ? 'page' : undefined}
                >
                  {subItem.icon}
                  {subItem.label}
                </Link>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      );
    }

    // 👇 Handle buttons (onClick menu items)
    if (item.onClick) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={item.onClick}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors md:h-8 md:w-8`}
                aria-label={item.label}
              >
                {item.icon}
                <span className="sr-only">{item.label}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // 👇 Handle normal links
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href ? item.href : ''}
              onClick={() => setActive(item.label)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                item.label === active || item.label === 'Dehix'
                  ? item.label === 'Dehix'
                    ? 'group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base'
                    : 'flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8'
                  : 'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8'
              }`}
              aria-current={
                item.href && isActive(item.href) ? 'page' : undefined
              }
              aria-label={item.label}
            >
              {item.icon}
              <span className="sr-only">{item.label}</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <aside  data-tour="sidebar" className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <div className="flex h-full min-h-0 flex-col">
        <ScrollArea className="flex-1 min-h-0">
          <nav className="flex flex-col items-center gap-4 px-2 py-5">
            {finalMenuItemsTop.map((item, index) => (
              <MenuIcon key={index} item={item} />
            ))}
            {active === 'Chats' &&
              setActiveConversation &&
              conversations &&
              conversations.map((conv) => (
                <ChatAvatar key={conv.id} conversation={conv} />
              ))}
          </nav>
        </ScrollArea>

        <div className="mx-auto flex flex-col items-center gap-4 pb-5">
          <ThemeToggle />
          <nav className="flex flex-col items-center gap-4 px-2">
            {menuItemsBottom.map((item, index) => (
              <MenuIcon key={index} item={item} />
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default SidebarMenu;
