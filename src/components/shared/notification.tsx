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
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:scale-105 transition-transform"
        >
          <Bell className="w-6 h-6 relative rounded-full hover:scale-105 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute top-1 left-9 flex h-4 w-7 items-center justify-center rounded-full bg-red-500 text-white text-xs transform -translate-x-1/2 -translate-y-1/2">
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
          <div className="flex justify-between items-center p-4 border-b border-border flex-shrink-0">
            <h3 className="font-semibold text-base">Notifications</h3>
            <p className="text-xs text-muted-foreground">
              {unreadCount} unread
            </p>
          </div>

          {/* Content Area - Scrollable */}
          {notifications.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <p className="text-sm text-muted-foreground text-center">
                No notifications available.
              </p>
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
                      <div className="flex-shrink-0 relative">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                          <div className="w-4 h-4 sm:w-5 sm:h-5">
                            {iconGetter(notification.entity)}
                          </div>
                        </div>
                        {!notification.isRead && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-blue-500 border-2 border-background" />
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
          <div className="flex-shrink-0 p-3 border-t border-border bg-background/95 backdrop-blur-sm">
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

              {/* Mark all as read button - Always visible when there are unread notifications */}
              {notifications.length > 0 && unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs sm:text-sm"
                  onClick={() => {
                    markAllNotificationsAsRead(user.uid);
                  }}
                >
                  <Check className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Mark all as read
                </Button>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
