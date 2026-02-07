'use client';

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Wallet } from 'lucide-react';
import { usePathname } from 'next/navigation';

import CollapsibleSidebarMenu from '../menu/collapsibleSidebarMenu';
import { MenuItem } from '../menu/sidebarMenu';
import DropdownProfile from '../shared/DropdownProfile';
import { NotificationButton } from '../shared/notification';
import Breadcrumb from '../shared/breadcrumbList';
import { Button } from '../ui/button';
import { DisplayConnectsDialog } from '../shared/DisplayConnectsDialog';
import { Input } from '../ui/input';

import { startTour } from '@/lib/tourSlice';
import TourMenu from '@/components/tour/shared/TourMenu';
import { RootState } from '@/lib/store';
import type { TourTarget } from '@/lib/tourSlice';

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
  const dispatch = useDispatch();
  const [connects, setConnects] = useState<number>(0);
  const pathname = usePathname();

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

  const PAGE_TOUR_ROUTE_MAP: { path: string; target: TourTarget }[] = [
    // Freelancer
    { path: '/freelancer/project/current', target: 'current-projects' },
    { path: '/freelancer/interviewer', target: 'interviewer-profile' },
    { path: '/freelancer/interviewee', target: 'interviewee' },
    { path: '/freelancer/oracleDashboard', target: 'oracle-dashboard' },
    { path: '/freelancer/market', target: 'market' },
    { path: '/freelancer/talent', target: 'talent' },
    { path: '/freelancer/leaderboard', target: 'leaderboard' },

    // Business
    { path: '/dashboard/business', target: 'business-dashboard' },
    { path: '/business/market', target: 'business-market' },
    { path: '/business/projects', target: 'business-projects' },
    { path: '/business/talent', target: 'business-talent' },

    // Shared
    { path: '/project-invitations', target: 'project-invitations' },
    { path: '/dashboard', target: 'dashboard' },
    { path: '/chat', target: 'chat' },
    { path: '/notes', target: 'notes' },

    // Freelancer Settings
    {
      path: '/freelancer/settings/personal-info',
      target: 'personal-info-form',
    },
    { path: '/freelancer/settings/profiles', target: 'profiles-center' },
    { path: '/freelancer/settings/profile', target: 'experience' },
    { path: '/freelancer/settings/kyc', target: 'kyc' },
    { path: '/freelancer/settings/levels-badges', target: 'level-badges' },
    { path: '/freelancer/settings/streak', target: 'streak' },
    { path: '/freelancer/settings/transactions', target: 'transaction' },
    { path: '/freelancer/settings/resume', target: 'resume' },
    { path: '/settings/feedback', target: 'feedback' },
    { path: '/reports', target: 'reports' },

    // Business Settings
    { path: '/business/settings/business-info', target: 'business-info' },
    { path: '/business/settings/kyc', target: 'business-kyc' },
    {
      path: '/business/settings/transactions',
      target: 'business-transactions',
    },
  ];

  const getPageTarget = (): TourTarget | null => {
    return (
      PAGE_TOUR_ROUTE_MAP.find((route) => pathname.startsWith(route.path))
        ?.target ?? null
    );
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
  const [, setSearchFocused] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target?.tagName?.toLowerCase();
      if (e.key === '/' && !e.altKey && !e.ctrlKey && !e.metaKey) {
        if (
          tag !== 'input' &&
          tag !== 'textarea' &&
          !(target as any)?.isContentEditable
        ) {
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

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block" data-tour="search">
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

        {/* Platform Tour */}
        <div>
          <TourMenu
            onThisPageTour={() => {
              const target = getPageTarget();
              if (!target) return;
              dispatch(startTour({ mode: 'page', target }));
            }}
            onFullPlatformTour={() => {
              const isFreelancerSettings =
                pathname.startsWith('/freelancer/settings') ||
                pathname.startsWith('/reports') ||
                pathname.startsWith('/settings/feedback');

              const isBusinessSettings =
                pathname.startsWith('/business/settings');

              dispatch(
                startTour({
                  mode: 'platform',
                  target:
                    isFreelancerSettings || isBusinessSettings
                      ? 'sidebar'
                      : 'navigation',
                }),
              );
            }}
          />
        </div>

        {user?.uid ? (
          <div data-tour="header-connects">
            <DisplayConnectsDialog userId={user.uid} connects={connects} />
          </div>
        ) : (
          <div data-tour="header-connects">
            <Button variant="ghost" size="sm">
              <Wallet className="h-4 w-4" />
            </Button>
          </div>
        )}
        {/* Notification Button */}
        <div data-tour="header-notifications">
          <NotificationButton />
        </div>

        {/* Profile Dropdown */}
        <div data-tour="header-profile">
          <DropdownProfile setConnects={setConnects} />
        </div>
      </div>
    </header>
  );
};

export default Header;
