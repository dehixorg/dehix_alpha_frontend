import React, { useEffect, useState } from 'react';
import { Bell, Check, ChevronRight } from 'lucide-react';
import { DocumentData } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

import { ButtonIcon } from './buttonIcon';

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

const formatDate = (date: string) => new Date(date).toLocaleDateString();

export const NotificationButton = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [notifications, setNotifications] = useState<DocumentData[]>([]);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    // Set up real-time listener for user notifications
    const unsubscribe = subscribeToUserNotifications(user.uid, (data) => {
      setNotifications(data);
    });

    // Clean up the listener when the component is unmounted
    return () => {
      unsubscribe();
    };
  }, [user]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={19} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="ml-auto text-xs text-muted-foreground">
              {unreadCount} unread
            </p>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No notifications available.
            </p>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id} // Use the unique ID from Firestore (instead of index)
                  className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                >
                  <div>
                    {!notification.isRead && (
                      <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {/* Display the title of the notification */}
                      {notification.message} {/* message from Firestore */}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {/* Display the description of the notification */}
                      {notification.type} - {notification.entity}{' '}
                      {/* type and entity */}
                    </p>
                    <div className="flex justify-between items-center">
                      {/* Timestamp */}
                      <p className="text-xs text-muted-foreground">
                        {formatDate(notification.timestamp)}
                      </p>

                      {/* Button */}
                      <ButtonIcon
                        onClick={() => router.push(notification.path)}
                        icon={<ChevronRight />}
                        className="ml-2" // Add margin if needed for spacing
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                markAllNotificationsAsRead(user.uid);
              }}
            >
              <Check className="mr-2 h-4 w-4" /> Mark all as read
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
