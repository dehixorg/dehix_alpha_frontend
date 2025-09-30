'use client';
import React, { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  DollarSign,
  FileText,
  Gavel,
  LaptopMinimal,
  Settings,
  Ticket,
  User,
  UsersRound,
  ChevronDown,
} from 'lucide-react';
import { DocumentData } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

import { Badge } from '../ui/badge';

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { RootState } from '@/lib/store';
import {
  markAllNotificationsAsRead,
  subscribeToUserNotifications,
} from '@/utils/common/firestoreUtils';

export const NotificationButton = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [notifications, setNotifications] = useState<DocumentData[]>([]);
  const [showAll, setShowAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Sort notifications by timestamp (latest first) and limit display
  const sortedNotifications = notifications.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const displayedNotifications = showAll
    ? sortedNotifications
    : sortedNotifications.slice(0, 5);

  const hasMoreNotifications = sortedNotifications.length > 5;

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Set up real-time listener for user notifications
    if (user?.uid) {
      unsubscribe = subscribeToUserNotifications(user.uid, (data) => {
        setNotifications(data);
      });
    }

    // Clean up the listener when the component is unmounted
    return () => {
      if (unsubscribe) {
        unsubscribe(); // Call unsubscribe only if it is defined
      }
    };
  }, [user]);

  // Reset showAll when popover closes
  const handlePopoverClose = () => {
    setShowAll(false);
  };

  function iconGetter(entity: string): JSX.Element {
    switch (entity) {
      case 'Account':
        return <User />;
      case 'Settings':
        return <Settings />;
      case 'Document':
        return <FileText />;
      case 'Bid':
        return <Gavel />;
      case 'Interview':
        return <LaptopMinimal />;
      case 'Hire':
        return <UsersRound />;
      case 'Transaction':
        return <DollarSign />;
      case 'Verification':
        return <Check />;
      case 'Ticket':
        return <Ticket />;
      default:
        return <Bell />;
    }
  }

  // Dynamic height calculation based on notification count and screen size
  const getPopoverHeight = () => {
    const headerHeight = 70; // Header area height
    const buttonAreaHeight = unreadCount > 0 ? 140 : 100; // Button area height (varies based on buttons shown)
    const notificationHeight = 85; // Height per notification

    const displayCount = showAll
      ? Math.min(sortedNotifications.length, 10) // Increased max to 10 notifications
      : Math.min(5, sortedNotifications.length);

    const notificationsAreaHeight = displayCount * notificationHeight;
    const totalCalculatedHeight =
      headerHeight + notificationsAreaHeight + buttonAreaHeight;

    // Responsive max heights
    if (typeof window !== 'undefined') {
      const screenHeight = window.innerHeight;
      const maxHeightMobile = screenHeight * 0.75; // 75% of screen height on mobile
      const maxHeightDesktop = Math.min(700, screenHeight * 0.85); // Max 700px or 85% of screen
      const isMobile = window.innerWidth < 768;

      const maxHeight = isMobile ? maxHeightMobile : maxHeightDesktop;

      // Ensure we don't exceed screen limits
      return Math.min(totalCalculatedHeight, maxHeight);
    }

    return Math.min(totalCalculatedHeight, 600); // Increased fallback height
  };

  const getScrollAreaHeight = () => {
    const headerHeight = 70;
    const buttonAreaHeight = unreadCount > 0 ? 140 : 100;
    const popoverHeight = getPopoverHeight();
    const availableHeight = popoverHeight - headerHeight - buttonAreaHeight;

    // Ensure minimum scroll area height
    return Math.max(200, availableHeight);
  };

  const getPopoverWidth = () => {
    if (typeof window !== 'undefined') {
      const screenWidth = window.innerWidth;
      if (screenWidth < 640) return 'calc(100vw - 2rem)'; // Mobile: full width minus padding
      if (screenWidth < 768) return '360px'; // Small tablet
      return '380px'; // Desktop
    }
    return '380px'; // Fallback
  };

  return (
    <Popover onOpenChange={(open) => !open && handlePopoverClose()}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full hover:scale-105 transition-transform"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell
            strokeWidth={1.25}
            className="w-5 h-5 relative rounded-full hover:scale-105 transition-transform"
            aria-hidden="true"
          />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-white text-[10px] leading-none shadow-sm">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 overflow-hidden transition-all duration-300 ease-in-out fixed-notification"
        style={{
          width: getPopoverWidth(),
          height: getPopoverHeight(),
        }}
      >
        <div className="h-full flex flex-col">
          {/* Header - Fixed height */}
          <div className="flex justify-between items-center p-4 border-b border-border flex-shrink-0 bg-gradient-to-br from-background/70 to-muted/40">
            <h3 className="font-semibold text-base">Notifications</h3>
            <Badge className="rounded-md uppercase text-xs font-normal dark:bg-muted bg-muted-foreground/30 dark:hover:bg-muted/20 hover:bg-muted-foreground/20 flex items-center px-2 py-1 text-black dark:text-white">
              {unreadCount} unread
            </Badge>
          </div>

          {/* Content Area - Scrollable */}
          {notifications.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-3">
                {/* Simple inline illustration */}
                <div className="mx-auto w-28 h-28 sm:w-32 sm:h-32">
                  <svg
                    viewBox="0 0 200 200"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                        <stop
                          offset="0%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity="0.25"
                        />
                        <stop
                          offset="100%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity="0.05"
                        />
                      </linearGradient>
                    </defs>
                    <circle cx="100" cy="100" r="80" fill="url(#grad)" />
                    <g fill="hsl(var(--primary))" opacity="0.25">
                      <rect x="70" y="70" width="60" height="40" rx="8" />
                      <circle cx="140" cy="70" r="6" />
                      <circle cx="60" cy="110" r="4" />
                    </g>
                  </svg>
                </div>
                <h4 className="text-base sm:text-lg font-semibold">
                  You&apos;re all caught up
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  New notifications will appear here. Check back later.
                </p>
              </div>
            </div>
          ) : (
            <div
              className="flex-1 overflow-y-auto notification-scroll"
              style={{
                height: `${getScrollAreaHeight()}px`,
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
              }}
            >
              <style>
                {`
                  .notification-scroll::-webkit-scrollbar {
                    display: none;
                  }
                `}
              </style>
              <div className="p-3 space-y-3">
                {displayedNotifications.map((notification: any) => (
                  <div
                    onClick={() => router.push(notification.path)}
                    key={notification.id}
                    className="rounded-lg py-3 px-3 cursor-pointer hover:bg-muted hover:opacity-75 transition border border-transparent hover:border-primary/20 bg-card"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative flex-shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-hidden="true"
                          className="w-10 h-10 rounded-full"
                        >
                          {iconGetter(notification.entity)}
                        </Button>

                        {!notification.isRead && (
                          <Badge
                            variant="default"
                            className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 bg-blue-500 border-2 border-background"
                          />
                        )}
                      </div>

                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium leading-tight text-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(notification.timestamp),
                            {
                              addSuffix: true,
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons Container - Fixed at bottom */}
          <div className="flex-shrink-0 p-3 bg-background/95 backdrop-blur-sm">
            <div className="space-y-2">
              {/* View More/Show Less Button */}
              {hasMoreNotifications && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-primary hover:text-primary hover:bg-primary/10 transition-all duration-200"
                  onClick={() => setShowAll(!showAll)}
                >
                  <ChevronDown
                    className={`mr-2 h-4 w-4 transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`}
                  />
                  {showAll
                    ? 'Show Less'
                    : `View More (${sortedNotifications.length - 5} more)`}
                </Button>
              )}

              {/* Mark all as read button - Only visible when there are unread notifications */}
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs sm:text-sm"
                  onClick={async () => {
                    try {
                      await markAllNotificationsAsRead(user.uid);
                    } finally {
                      // Optimistically update UI
                      setNotifications((prev) =>
                        prev.map((n) => ({ ...n, isRead: true })),
                      );
                    }
                  }}
                >
                  <Check
                    className="mr-2 h-3 w-3 sm:h-4 sm:w-4"
                    aria-label="Mark all as read"
                  />
                  <span className="hidden md:inline">Mark all as read</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
