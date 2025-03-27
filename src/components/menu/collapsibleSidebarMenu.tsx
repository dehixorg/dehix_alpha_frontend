import * as React from 'react';
import Link from 'next/link';
import { PanelLeft } from 'lucide-react';

import { ThemeToggle } from '../shared/themeToggle';

import { MenuItem } from './sidebarMenu';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface CollapsibleSidebarMenuProps {
  menuItemsTop: MenuItem[];
  menuItemsBottom: MenuItem[];
  active: string;
  setActive?: (page: string) => void; // Making setActive optional
  setActiveConversation?: any;
  conversations?: any;
  activeConversation?: any;
}

const CollapsibleSidebarMenu: React.FC<CollapsibleSidebarMenuProps> = ({
  menuItemsTop,
  menuItemsBottom,
  active,
  setActive = () => null, // Defaulting setActive to a no-op function
  conversations,
  setActiveConversation,
  activeConversation
}) => {

  const ChatAvatar = ({ conversation }: { conversation: any }) => {
    if (!conversation || typeof conversation !== "object" || Array.isArray(conversation) || !setActiveConversation) {
      return null;
    }

    const name = conversation.name || "Unknown";
    const isActive = activeConversation?.id === conversation.id;

    return (
      <Avatar
        className={`w-full h-10 flex justify-start gap-2 items-center rounded-full 
    transition-all cursor-pointer 
    ${isActive ? "border-2 border-blue-500 bg-gray-200 dark:bg-gray-700" : "border-transparent"}`}
        onClick={() => setActiveConversation(conversation)}
      >
        <div className="w-10 h-10">
          <AvatarImage src="" alt={name} />
          <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white font-bold">
            {name
              .split(" ")
              .map((word: any) => word.charAt(0).toUpperCase())
              .join("")
              .slice(0, 2)}
          </AvatarFallback>
        </div>
        <span className="text-black dark:text-white">{name}</span>
      </Avatar>

    );
  };

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
              className={`flex items-center gap-4 px-2.5 ${item.label === 'Dehix'
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
          {active === 'Chats' && setActiveConversation && conversations && (
            conversations.map((conv: any) => (
              <ChatAvatar key={conv.id} conversation={conv} />
            ))

          )}
        </nav>

        <nav className="grid gap-6 text-lg font-medium">
          {menuItemsBottom.map((item, index) => (
            <React.Fragment key={index}>
              {/* Check if the current item is "Settings" and add ThemeToggle above it */}
              {item.label === 'Settings' && (
                <div className="flex items-center px-2.5 text-muted-foreground hover:text-foreground mb-1">
                  <ThemeToggle />
                </div>
              )}

              <Link
                href={item.href}
                onClick={() => setActive(item.label)}
                className={`flex items-center gap-4 px-2.5 ${item.label === 'Dehix'
                  ? 'group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base'
                  : item.label === active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {item.icon}
                {item.label !== 'Dehix' && item.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default CollapsibleSidebarMenu;
