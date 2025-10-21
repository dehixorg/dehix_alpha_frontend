import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Wallet } from 'lucide-react';

import CollapsibleSidebarMenu from '../menu/collapsibleSidebarMenu';
import { MenuItem } from '../menu/sidebarMenu';
import DropdownProfile from '../shared/DropdownProfile';
import { NotificationButton } from '../shared/notification';
import Breadcrumb from '../shared/breadcrumbList';
import { Button } from '../ui/button';
import { DisplayConnectsDialog } from '../shared/DisplayConnectsDialog';
import { Input } from '../ui/input';

import { RootState } from '@/lib/store';

interface HeaderProps {
  menuItemsTop: MenuItem[];
  menuItemsBottom: MenuItem[];
  activeMenu: string;
  breadcrumbItems?: BreadcrumbMenuItem[];
  searchPlaceholder?: string;
  setActiveConversation?: any;
  conversations?: any;
  activeConversation?: any;
}

interface BreadcrumbMenuItem {
  label: string;
  link: string;
}

const Header: React.FC<HeaderProps> = ({
  menuItemsTop,
  menuItemsBottom,
  activeMenu,
  breadcrumbItems,
  searchPlaceholder,
  conversations,
  activeConversation,
  setActiveConversation,
}) => {
  const user = useSelector((state: RootState) => state.user);
  const [connects, setConnects] = useState<number>(0);

  const fetchConnects = async () => {
    try {
      const data = localStorage.getItem('DHX_CONNECTS');
      const parsedData = data ? parseInt(data) : 0;
      if (!isNaN(parsedData)) {
        setConnects(parsedData);
      }
    } catch (error) {
      console.error('Error fetching connects:', error);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchConnects();
    }
    const updateConnects = () => fetchConnects();
    window.addEventListener('connectsUpdated', updateConnects);

    return () => {
      window.removeEventListener('connectsUpdated', updateConnects);
    };
  }, [user?.uid]);

  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target?.tagName?.toLowerCase();
      if (e.key === '/' && !e.altKey && !e.ctrlKey && !e.metaKey) {
        if (tag !== 'input' && tag !== 'textarea' && !(target as any)?.isContentEditable) {
          e.preventDefault();
          const el = document.getElementById('global-search-input');
          if (el && 'focus' in el) (el as HTMLElement).focus();
          setSearchFocused(true);
        }
      }
      if (e.key === 'Escape') {
        const el = document.getElementById('global-search-input');
        if (el === document.activeElement) {
          (el as HTMLElement).blur();
          setSearchFocused(false);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <header
      role="banner"
      aria-label="Site header"
      className="sticky top-0 z-30 flex h-14 items-center py-6 gap-4 border-b bg-muted-foreground/20 dark:bg-muted/20 px-4 sm:px-6 backdrop-blur-md"
    >
      {/* Sidebar Menu */}
      <CollapsibleSidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active={activeMenu}
        setActiveConversation={setActiveConversation}
        conversations={conversations}
        activeConversation={activeConversation}
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems || []} />

      <div className="relative ml-auto hidden md:block">
        <label htmlFor="global-search-input" className="sr-only">
          Search
        </label>
        <Input
          id="global-search-input"
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={searchPlaceholder || 'Search...'}
          aria-label="Search"
          className="w-[220px] lg:w-[336px]"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 select-none text-xs text-muted-foreground">
          /
        </span>
      </div>

      {user?.uid ? (
        <DisplayConnectsDialog userId={user.uid} connects={connects} />
      ) : (
        <Button variant="ghost" size="sm">
          <Wallet className="h-4 w-4" />
        </Button>
      )}
      {/* Notification Button */}
      <NotificationButton />

      {/* Profile Dropdown */}
      <DropdownProfile setConnects={setConnects} />
    </header>
  );
};

export default Header;
