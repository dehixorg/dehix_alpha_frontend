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
  AlertCircle,
} from 'lucide-react';
import { DocumentData } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';

import { Badge } from '../ui/badge';

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RootState } from '@/lib/store';
import {
  markAllNotificationsAsRead,
  subscribeToUserNotifications,
} from '@/utils/common/firestoreUtils';
import { axiosInstance } from '@/lib/axiosinstance';
import { fetchAndUpdateConnects } from '@/lib/updateConnects';
import { notifyError } from '@/utils/toastMessage';

// Merge incoming notifications with existing ones, deduplicating by id
const mergeNotifications = (
  prev: DocumentData[],
  incoming: DocumentData[],
): DocumentData[] => {
  const map = new Map<string, DocumentData>();
  for (const n of prev) map.set(n.id, n);
  for (const n of incoming) map.set(n.id, n); // incoming wins on conflict
  return Array.from(map.values());
};

const getSafeDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  // Handle Firestore Timestamp
  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  // Handle numeric seconds (likely Firestore seconds without toDate in some mocks/serials)
  if (typeof timestamp === 'number' && timestamp < 1e12) {
    return new Date(timestamp * 1000);
  }
  // Handle numeric millis
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  // Handle string/Date
  const d = new Date(timestamp);
  return !isNaN(d.getTime()) ? d : null;
};

export const NotificationButton = () => {
  const user = useSelector((state: RootState) => state.user);
  const [notifications, setNotifications] = useState<DocumentData[]>([]);
  const [showAll, setShowAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const sortedNotifications = [...notifications].sort(
    (a, b) =>
      (getSafeDate(b.timestamp)?.getTime() ?? 0) -
      (getSafeDate(a.timestamp)?.getTime() ?? 0),
  );
  const displayedNotifications = showAll
    ? sortedNotifications
    : sortedNotifications.slice(0, 5);
  const hasMoreNotifications = sortedNotifications.length > 5;

  const userType =
    user?.type &&
    ['freelancer', 'business'].includes(String(user.type).toLowerCase())
      ? (String(user.type).toLowerCase() as 'freelancer' | 'business')
      : undefined;

  const processedNotificationIds = React.useRef(new Set<string>());
  const isMounted = React.useRef(true);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const maybeRefreshConnects = React.useCallback(
    (list: DocumentData[]) => {
      if (!user?.uid || !userType) return;

      let needsRefresh = false;
      const newConnectsApprovedIds: string[] = [];

      list.forEach((n) => {
        // Skip if already processed
        if (processedNotificationIds.current.has(n.id)) return;

        // Check if this is a "connects approved" notification
        const isConnectsApproved =
          typeof n.message === 'string' &&
          /connects.*approved|approved.*connects/i.test(n.message);

        if (isConnectsApproved) {
          needsRefresh = true;
          newConnectsApprovedIds.push(n.id);
        }

        // Mark all notifications as processed
        processedNotificationIds.current.add(n.id);
      });

      // Only call fetchAndUpdateConnects once for new connects-approved notifications
      if (needsRefresh && newConnectsApprovedIds.length > 0) {
        // IDs are already tracked in processedNotificationIds by the loop above
        fetchAndUpdateConnects(userType, true).catch(() => {});
      }
    },
    [user?.uid, userType],
  );

  const fetchFromApi = React.useCallback(() => {
    if (!user?.uid) return;

    // Cancel previous request if still in flight
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    axiosInstance
      .get('/token-request/me/notifications', {
        signal: abortControllerRef.current.signal,
      })
      .then((r) => {
        if (!isMounted.current) return;
        const list: DocumentData[] = (r.data?.data ?? []).filter(
          (item: any) => item && item.id,
        );
        if (list.length > 0) {
          maybeRefreshConnects(list);
          setNotifications((prev) => mergeNotifications(prev, list));
        }
        setFetchError(null);
      })
      .catch((error) => {
        if (!isMounted.current) return;
        // Don't set error for aborted requests
        if (error.name === 'AbortError' || error.name === 'CanceledError') {
          return;
        }
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch notifications';
        console.error('Failed to fetch notifications:', error);
        setFetchError(errorMessage);
      });
  }, [user?.uid, maybeRefreshConnects]);

  useEffect(() => {
    if (!user?.uid) return;

    // Firestore real-time (works when same Firebase project)
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = subscribeToUserNotifications(user.uid, (data) => {
        if (isMounted.current && data.length > 0) {
          maybeRefreshConnects(data);
          setNotifications((prev) => mergeNotifications(prev, data));
        }
      });
    } catch {
      // Firestore subscription failed - API polling is the fallback
    }

    // API: fetch immediately + poll every 45s as reliable fallback
    fetchFromApi();
    const interval = setInterval(fetchFromApi, 45_000);

    return () => {
      unsubscribe?.();
      clearInterval(interval);
    };
  }, [user?.uid, fetchFromApi, maybeRefreshConnects]);

  // Refetch when popover opens; reset showAll when it closes
  const handlePopoverChange = (open: boolean) => {
    if (open) {
      fetchFromApi(); // immediate fresh data when user clicks bell
    } else {
      setShowAll(false);
    }
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

  return (
    <Popover onOpenChange={handlePopoverChange}>
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
      <PopoverContent className="p-0 transition-all duration-300 ease-in-out fixed-notification rounded-xl">
        {/* Header - Fixed height */}
        <div className="flex justify-between items-center p-4 border-b border-border flex-shrink-0 bg-gradient-to-br from-background/70 to-muted/40 rounded-t-xl">
          <h3 className="font-semibold text-base">Notifications</h3>
          <Badge className="rounded-md uppercase text-xs font-normal dark:bg-muted bg-muted-foreground/30 dark:hover:bg-muted/20 hover:bg-muted-foreground/20 flex items-center px-2 py-1 text-black dark:text-white">
            {unreadCount} unread
          </Badge>
        </div>

        {/* Error Display */}
        {fetchError && (
          <div className="px-4 pt-3">
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {fetchError}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Content Area - Scrollable */}
        {notifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8  rounded-b-xl">
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
                  key={notification.id}
                  className="rounded-lg py-3 px-3 border border-transparent bg-card"
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
                        {(() => {
                          const date = getSafeDate(notification.timestamp);
                          return date
                            ? formatDistanceToNow(date, { addSuffix: true })
                            : '';
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons Container - Fixed at bottom */}
        <div className="flex-shrink-0 p-3 rounded-b-xl">
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
                    await axiosInstance.put(
                      '/token-request/me/notifications/read',
                    );
                    setNotifications((prev) =>
                      prev.map((n) => ({ ...n, isRead: true })),
                    );

                    try {
                      if (user?.uid) {
                        await markAllNotificationsAsRead(user.uid);
                      }
                    } catch (firestoreError) {
                      console.error(
                        'Firestore mark-read failed (non-blocking):',
                        firestoreError,
                      );
                    }
                  } catch (error) {
                    console.error(
                      'Failed to mark notifications as read:',
                      error,
                    );
                    notifyError(
                      'Failed to mark notifications as read. Please try again.',
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
      </PopoverContent>
    </Popover>
  );
};
