'use client';

import { useState } from 'react';
import { Copy, Check, Share2, Gift, Sparkles, AlertCircle } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ReferralDialogProps {
  children: React.ReactNode;
  referralCode: string | null;
  referralLink: string;
  loading: boolean;
}

export function ReferralDialog({
  children,
  referralCode,
  referralLink,
  loading,
}: ReferralDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(text);
        setTimeout(() => setCopied(null), 2000);
      },
      (err) => {
        console.error('Failed to copy text: ', err);
      },
    );
  };

  const handleShare = (text: string) => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Join me on our platform!',
          text: 'Check out this awesome platform!',
          url: text,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(text).then(
        () => {
          setCopied(text);
          setTimeout(() => setCopied(null), 2000);
        },
        (err) => {
          console.error('Failed to copy text: ', err);
        },
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div onClick={handleTriggerClick} className="w-full">
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-0 shadow-xl">
        <div className="relative px-6 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground flex items-center">
                <Gift className="h-6 w-6 mr-2 text-primary" />
                Refer & Earn
              </DialogTitle>
              <DialogDescription className="mt-1 text-muted-foreground">
                Invite friends and earn rewards when they sign up!
              </DialogDescription>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ) : referralCode ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="referral-link"
                      className="text-sm font-medium"
                    >
                      Your Referral Link
                    </Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="referral-link"
                      readOnly
                      value={referralLink}
                      className="pr-16 font-mono text-sm"
                    />
                    <Button
                      size="icon"
                      variant={copied === referralLink ? 'default' : 'ghost'}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
                      onClick={() => handleCopy(referralLink)}
                    >
                      {copied === referralLink ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="referral-code"
                    className="text-sm font-medium"
                  >
                    Or share your code
                  </Label>
                  <div className="relative">
                    <Input
                      id="referral-code"
                      readOnly
                      value={referralCode}
                      className="pr-16 font-mono text-sm"
                    />
                    <Button
                      size="icon"
                      variant={copied === referralCode ? 'default' : 'ghost'}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
                      onClick={() => handleCopy(referralCode)}
                    >
                      {copied === referralCode ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-sm flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                    How it works
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Share your referral link with friends</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>They sign up using your link</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Earn rewards when they complete their profile</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <AlertCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-sm font-medium">
                  No referral code found
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  We couldn&lsquo;t find your referral information. Please try
                  again later.
                </p>
                <DialogPrimitive.Close asChild>
                  <Button variant="outline" className="mt-4">
                    Close
                  </Button>
                </DialogPrimitive.Close>
              </div>
            )}
          </div>
        </div>

        <div className="bg-muted/30 px-6 py-4 flex justify-end space-x-3">
          <Button
            onClick={() => referralLink && handleShare(referralLink)}
            size="sm"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            disabled={!referralLink}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share with friends
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
