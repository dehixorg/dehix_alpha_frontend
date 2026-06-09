'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { CreditCard, Loader2, Zap, IndianRupee } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
import {
  fetchAndUpdateConnects,
  updateConnectsBalance,
} from '@/lib/updateConnects';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PRICE_PER_CONNECT = Number(
  process.env.NEXT_PUBLIC_CONNECTS_PRICE_PER_UNIT || '1',
);

interface RequestConnectsDialogProps {
  userId: string;
}

export default function RequestConnectsDialog({
  userId,
}: RequestConnectsDialogProps) {
  const user = useSelector((state: RootState) => state.user);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK');
        setRazorpayLoaded(false);
      };
      document.body.appendChild(script);
    } else if (window.Razorpay) {
      setRazorpayLoaded(true);
    }
  }, []);

  const parsedAmount = parseInt(amount, 10);
  const isValidAmount =
    !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= 200;
  const totalPrice = isValidAmount ? parsedAmount * PRICE_PER_CONNECT : 0;

  const handlePayment = async () => {
    if (!isValidAmount) {
      notifyError(
        'Please enter a valid number of connects (1-200).',
        'Invalid input',
      );
      return;
    }

    if (!razorpayLoaded || !window.Razorpay) {
      notifyError('Payment system is loading. Please try again.', 'Not ready');
      return;
    }

    setLoading(true);
    try {
      const backendUserType =
        user?.type === 'freelancer' ? 'FREELANCER' : 'BUSINESS';

      // Step 1: Create Razorpay order on the backend
      const orderResponse = await axiosInstance.post(
        '/token-request/create-order',
        {
          userId,
          userType: backendUserType,
          amount: parsedAmount,
        },
      );

      const {
        orderId,
        amount: amountInPaise,
        currency,
      } = orderResponse.data.data;

      // Step 2: Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency,
        name: 'Dehix',
        description: `Purchase ${parsedAmount} Connects`,
        order_id: orderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // Step 3: Verify payment on the backend
            const verifyResponse = await axiosInstance.post(
              '/token-request/verify-payment',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            );

            const { remainingConnects } = verifyResponse.data.data;

            // Update local connects balance
            if (remainingConnects !== undefined && remainingConnects !== null) {
              updateConnectsBalance(remainingConnects);
            } else if (user?.type) {
              await fetchAndUpdateConnects(
                user.type as 'freelancer' | 'business',
                true,
              );
            }

            window.dispatchEvent(new Event('connectsUpdated'));

            notifySuccess(
              `${parsedAmount} connects have been added to your account!`,
              'Payment Successful!',
            );

            setOpen(false);
            setAmount('');
          } catch (verifyError: any) {
            console.error('Payment verification failed:', verifyError);
            notifyError(
              'Payment was received but verification failed. Please contact support.',
              'Verification Error',
            );
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#f59e0b',
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        notifyError(
          response.error?.description || 'Payment failed. Please try again.',
          'Payment Failed',
        );
        setLoading(false);
      });

      razorpay.open();
    } catch (error: any) {
      console.error('Error initiating payment:', error?.response || error);
      notifyError('Failed to initiate payment. Please try again.', 'Error');
      setLoading(false);
    }
  };

  const presetAmounts = [10, 20, 50, 100];

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        Buy <CreditCard className="h-4 w-4" />
      </Button>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setLoading(false);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Buy Connects</DialogTitle>
            <DialogDescription>
              Purchase connects instantly via Razorpay.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 p-2">
            {/* Preset amounts */}
            <div className="grid grid-cols-4 gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  variant={amount === String(preset) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAmount(String(preset))}
                  className="text-sm"
                >
                  {preset}
                </Button>
              ))}
            </div>

            {/* Custom input */}
            <div>
              <label
                htmlFor="connectsAmount"
                className="text-sm text-muted-foreground"
              >
                Or enter a custom amount (1-200)
              </label>
              <Input
                id="connectsAmount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 25"
                type="number"
                inputMode="numeric"
                step={1}
                min={1}
                max={200}
                className="mt-2"
              />
            </div>

            {/* Price display */}
            {isValidAmount && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                    <Zap className="h-4 w-4" />
                    <span>{parsedAmount} connects</span>
                  </div>
                  <div className="flex items-center gap-1 text-lg font-bold text-amber-800 dark:text-amber-200">
                    <IndianRupee className="h-4 w-4" />
                    <span>{totalPrice}</span>
                  </div>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  @ ₹{PRICE_PER_CONNECT} per connect
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={loading || !isValidAmount}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay ₹{totalPrice || 0}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
