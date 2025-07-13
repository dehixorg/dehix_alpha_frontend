import React, { useEffect, useState } from 'react';
import { UserIcon, LogOut, Copy, Check, Share2 } from 'lucide-react'; // Import Share2 icon
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

import { truncateDescription } from './MilestoneTimeline';

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/hooks/use-toast';

const useShare = () => {
  const share = async (title: string, text: string, url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        console.error('Error sharing content:', error);
      }
    } else {
      console.warn('Share API is not supported on this browser.');
    }
  };

  return share;
};

interface DropdownProfileProps {
  setConnects?: (value: number) => void;
}

export default function DropdownProfile({ setConnects }: DropdownProfileProps) {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const [userType, setUserType] = useState<string | null>(null); // Added userType state
  const [referralCode, setReferralCode] = useState<string>('');
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const share = useShare();

  useEffect(() => {
    // Check if user type is available in Redux store
    if (user?.type) {
      setUserType(user.type);
    } else {
      // If not, get it from cookies
      const storedUserType = Cookies.get('userType');
      setUserType(storedUserType || null);
    }
  }, [user]);

  // Fetch referral code from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/${user.type}/${user?.uid}`);
        const fetchCode = response.data.data?.referral?.referralCode || '';
        const connects =
          response.data?.data?.connects ?? response.data?.connects ?? 0;

        localStorage.setItem('DHX_CONNECTS', connects.toString());

        if (setConnects) {
          setConnects(connects);
        }
        setReferralCode(fetchCode);
      } catch (error) {
        console.error('API Error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong.Please try again.',
        }); // Error toast
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

  const handleLogout = () => {
    dispatch(clearUser());
    Cookies.remove('userType');
    Cookies.remove('token');
    router.replace('/auth/login');
  };

  const handleReferralClick = () => {
    setIsReferralOpen(true);
  };

  const handleShare = (text: string) => {
    share('Referral Link', 'Check out this referral link!', text);
  };

  // Generate referral link
  const referralLink = referralCode
    ? `${process.env.NEXT_PUBLIC__BASE_URL}auth/sign-up/freelancer?referral=${referralCode}`
    : '';

  // Handle Copy to Clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(text);
        setTimeout(() => {
          setCopied(null); // Reset after a few seconds
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
            className="overflow-hidden rounded-full hover:scale-105 transition-transform"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL} alt="@shadcn" />
              <AvatarFallback>
                <UserIcon className="w-5 h-5 hover:scale-105 transition-transform" />
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

      {/* Referral Popup */}
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
              {/* Referral Link Section */}
              <div className="mt-4">
                <p className="text-sm sm:text-base font-medium text-gray-300">
                  Referral Link:
                </p>
                <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <a
                    href={referralLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 max-w-full break-words sm:truncate"
                    title={referralLink} // Tooltip for the full link
                  >
                    {truncateDescription(referralLink, 60)}
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleShare(referralLink)} // Share Button
                    className="ml-2 sm:ml-4"
                  >
                    <Share2 size={16} />
                  </Button>
                </div>
              </div>

              {/* Referral Code Section */}
              <div className="mt-4">
                <p className="text-sm sm:text-base font-medium text-gray-300">
                  Referral Code:
                </p>
                <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="font-medium flex-1 truncate">
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
                      <Copy size={16} />
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
