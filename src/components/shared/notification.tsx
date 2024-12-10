import React from 'react';
import { Bell, BellRing, Check } from 'lucide-react';

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

type Notification = {
  id: string;
  title: string;
  description: string;
  isRead: boolean;
};

interface NotificationProps {
  notifications: Notification[];
  onMarkAllAsRead: () => void;
}

export const NotificationButton: React.FC<NotificationProps> = ({
  notifications,
  onMarkAllAsRead,
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                >
                  <div>
                    {!notification.isRead && (
                      <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {notification.description}
                    </p>
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
              onClick={onMarkAllAsRead}
            >
              <Check className="mr-2 h-4 w-4" /> Mark all as read
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
