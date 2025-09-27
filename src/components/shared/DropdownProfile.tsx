'use client';
import React, { useEffect, useState } from 'react';
import {
  User as UserIcon,
  LogOut,
  HelpCircle,
  Settings,
  Home,
  AlertCircle,
  Gift,
  Sparkles,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { motion } from 'framer-motion';

import { FaqDialog } from './FaqDialog';
import { ReferralDialog } from './ReferralDialog';

import { getReportTypeFromPath } from '@/utils/getReporttypeFromPath';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RootState } from '@/lib/store';
import { clearUser } from '@/lib/userSlice';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError } from '@/utils/toastMessage';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface DropdownProfileProps {
  setConnects?: (value: number) => void;
}
export default function DropdownProfile({ setConnects }: DropdownProfileProps) {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const [userType, setUserType] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isFaqOpen, setIsFaqOpen] = useState(false); // New state for FAQ dialog
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const pathname = usePathname();

  const reportType = getReportTypeFromPath(pathname);

  useEffect(() => {
    if (user?.type) {
      setUserType(user.type);
    } else {
      const storedUserType = Cookies.get('userType');
      setUserType(storedUserType || null);
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/${user.type}/${user?.uid}`);
        const fetchCode = response.data?.referral?.referralCode || '';

        const connects =
          response.data?.data?.connects ?? response.data?.connects ?? 0;

        localStorage.setItem('DHX_CONNECTS', connects.toString());

        if (setConnects) {
          setConnects(connects);
        }
        setReferralCode(fetchCode);
      } catch (error) {
        console.error('API Error:', error);
        notifyError('Something went wrong. Please try again.', 'Error');
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      fetchData();
    } else {
      console.warn('User ID is not available. Skipping API call.');
      setLoading(false);
    }
  }, [user?.uid, user.type, setConnects]);

  const handleLogout = async () => {
    // Show logging out overlay and prevent interaction
    setIsLoggingOut(true);

    try {
      // Clear sensitive data first
      Cookies.remove('userType');
      Cookies.remove('token');
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      // Clear Redux store
      dispatch(clearUser());

      // Firebase sign out (fire and forget)
      const { auth } = await import('@/config/firebaseConfig');
      auth.signOut().catch(console.error);

      // Force a hard redirect to prevent any state-related issues
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, still redirect to login
      window.location.href = '/auth/login';
    }
  };

  const referralLink =
    referralCode && typeof window !== 'undefined'
      ? `${window.location.origin}/auth/sign-up/freelancer?referral=${referralCode}`
      : '';

  return (
    <>
      <Dialog
        open={isLoggingOut}
        onOpenChange={(open) => {
          // Prevent closing while logging out; allow programmatic close only
          if (!isLoggingOut) setIsLoggingOut(open);
        }}
      >
        <DialogContent className="max-w-md [&>button]:hidden">
          <DialogHeader className="items-center">
            <DialogTitle className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Securing Your Account
            </DialogTitle>
            <DialogDescription className="text-center">
              Just a moment while we sign you out safely...
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex flex-col items-center space-y-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="h-20 w-20 rounded-full flex items-center justify-center"
            >
              <div className="h-14 w-14 border-4 border-primary/30 border-t-primary rounded-full" />
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full h-10 w-10 overflow-hidden ring-2 ring-transparent hover:ring-primary/20 transition-all duration-300"
          >
            <Avatar className="h-9 w-9 border-2 border-background">
              <AvatarImage
                src={user.photoURL || ''}
                alt={user.displayName || 'User'}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/30 text-primary">
                {user.displayName ? (
                  user.displayName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                ) : (
                  <UserIcon className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-64 p-2 rounded-xl shadow-lg border-border/50 backdrop-blur-sm bg-background/95"
          sideOffset={8}
        >
          <div className="px-2 py-3 flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={user.photoURL || ''}
                alt={user.displayName || 'User'}
              />
              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/30 text-primary">
                {user.displayName ? (
                  user.displayName.charAt(0).toUpperCase()
                ) : (
                  <UserIcon className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.displayName || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>

          <DropdownMenuSeparator className="my-2" />

          <DropdownMenuGroup>
            <Link href="/dashboard/freelancer">
              <DropdownMenuItem className="rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/50">
                <Home className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Dashboard</span>
              </DropdownMenuItem>
            </Link>

            {userType === 'freelancer' ? (
              <Link href="/freelancer/settings/personal-info">
                <DropdownMenuItem className="rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/50">
                  <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
            ) : userType === 'business' ? (
              <Link href="/business/settings/business-info">
                <DropdownMenuItem className="rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/50">
                  <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Business Settings</span>
                </DropdownMenuItem>
              </Link>
            ) : (
              <div className="px-3 py-2">
                <Skeleton className="h-4 w-3/4" />
              </div>
            )}

            <DropdownMenuItem
              className="rounded-lg p-0 hover:bg-muted/50"
              onSelect={(e) => e.preventDefault()}
            >
              <FaqDialog isOpen={isFaqOpen} onOpenChange={setIsFaqOpen}>
                <div className="flex flex-1 items-center w-full px-3 py-2">
                  <HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Help & FAQs</span>
                </div>
              </FaqDialog>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="rounded-lg p-0 hover:bg-muted/50"
              onSelect={(e) => e.preventDefault()}
            >
              <ReferralDialog
                referralCode={referralCode}
                referralLink={referralLink}
                loading={loading}
              >
                <div className="flex flex-1 items-center justify-between w-full px-2 py-2">
                  <Gift className="mr-2 h-4 w-4 ml-1 text-muted-foreground" />
                  <span>Refer & Earn</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    <Sparkles className="h-3 w-3 mr-1" /> New
                  </Badge>
                </div>
              </ReferralDialog>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                if (user?.uid && userType) {
                  router.push(`/reports?type=${reportType}`);
                } else {
                  notifyError('User information is missing.', 'Error');
                }
              }}
              className="rounded-lg px-3 py-2 cursor-pointer"
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              <span>Report an Issue</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-2" />

          <DropdownMenuItem
            onClick={handleLogout}
            className="rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
