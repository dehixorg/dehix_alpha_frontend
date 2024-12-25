import React, { useEffect, useState } from 'react';
import { UserIcon, LogOut, Copy, Check, Share2 } from 'lucide-react'; // Import Share2 icon
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RootState } from '@/lib/store';
import { clearUser } from '@/lib/userSlice';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebaseConfig';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { axiosInstance } from '@/lib/axiosinstance';

const useShare = () => {
  const share = async (title: string, text: string, url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        console.log('Content shared successfully');
      } catch (error) {
        console.error('Error sharing content:', error);
      }
    } else {
      console.warn('Share API is not supported on this browser.');
    }
  };

  return share;
};

export default function DropdownProfile() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const [userType, setUserType] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string>('');
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const share = useShare();

  useEffect(() => {
    if (user?.type) {
      setUserType(user.type);
    } else {
      const storedUserType = Cookies.get('userType');
      setUserType(storedUserType || null);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Log out from Firebase
      dispatch(clearUser()); // Clear user from Redux
      Cookies.remove('userType'); // Remove userType cookie
      Cookies.remove('token'); // Remove token cookie
      router.replace('/auth/login'); // Redirect to login page
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/${user.type}/${user?.uid}`);
        const fetchCode = response.data?.referral?.referralCode || '';
        setReferralCode(fetchCode);
      } catch (error) {
        console.error('API Error:', error);
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
  }, [user?.uid]);

  const handleReferralClick = () => {
    setIsReferralOpen(true);
  };

  const handleShare = (text: string) => {
    share('Referral Link', 'Check out this referral link!', text);
  };

  const referralLink = referralCode
    ? `${process.env.NEXT_PUBLIC__APP_DEHIX_URL}auth/sign-up/freelancer?referral=${referralCode}`
    : '';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(text);
        setTimeout(() => {
          setCopied(null);
        }, 2000);
      },
      (err) => {
        console.error('Failed to copy text: ', err);
      },
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL} alt="@shadcn" />
              <AvatarFallback>
                <UserIcon size={16} />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href="/dashboard/freelancer">
            <DropdownMenuItem>Home</DropdownMenuItem>
          </Link>
          <div>
            {userType === 'freelancer' ? (
              <Link href="/freelancer/settings/personal-info">
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </Link>
            ) : userType === 'business' ? (
              <Link href="/business/settings/business-info">
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </Link>
            ) : (
              <p>Loading...</p>
            )}
          </div>
          <Link href="/settings/support">
            <DropdownMenuItem>Support</DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={handleReferralClick}>
            Referral
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut size={18} className="mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isReferralOpen} onOpenChange={setIsReferralOpen}>
        <DialogContent className="max-w-2xl w-full px-4 sm:px-6 md:px-8 py-6 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold">
              Your Referral Information
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-500">
              Share this link and code with your friends to invite them:
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <p className="text-center text-gray-600 text-sm sm:text-base">
              Loading referral information...
            </p>
          ) : referralCode ? (
            <>
              <div className="mt-4">
                <p className="text-sm sm:text-base font-medium text-gray-300">
                  Referral Link:
                </p>
                <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <a
                    href={referralLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white flex-1 max-w-full break-words sm:truncate"
                    title={referralLink}
                  >
                    {referralLink}
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleShare(referralLink)}
                    className="ml-2 sm:ml-4"
                  >
                    <Share2 size={16} className="text-white" />
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm sm:text-base font-medium text-gray-300">
                  Referral Code:
                </p>
                <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="text-white font-medium flex-1 truncate">
                    {referralCode}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(referralCode)}
                    className="ml-2 sm:ml-4"
                  >
                    {copied === referralCode ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} className="text-white" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-600 text-sm sm:text-base">
              No referral code is available for this user.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
