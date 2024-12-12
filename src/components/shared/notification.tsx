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
} from 'lucide-react';
import { DocumentData } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

import { Avatar } from '@/components/ui/avatar';
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
              {notifications.map((notification: any) => (
                <div
                  onClick={() => router.push(notification.path)}
                  key={notification.id} // Use the unique ID from Firestore (instead of index)
                  className="rounded py-4 mb-4 items-start cursor-pointer hover:bg-muted hover:opacity-75 transition"
                >
                  <div>
                    {!notification.isRead && (
                      <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                    )}
                  </div>
                  <div className="space-y-1 px-3">
                    <div className="flex items-center space-x-2 mb-2">
                      {/* Avatar with Icon */}
                      <Avatar className="h-6 w-6 text-white flex items-center justify-center p-1 ring-1 ring-white">
                        {iconGetter(notification.entity)}
                      </Avatar>

                      {/* Title */}
                      <p className="text-sm font-medium leading-none">
                        {notification.message} {/* message from Firestore */}
                      </p>
                    </div>
                    <p className="flex justify-end text-xs text-muted-foreground">
                      {formatDate(notification.timestamp)}
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
