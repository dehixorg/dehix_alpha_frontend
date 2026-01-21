'use client';

import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  UserCredential,
} from 'firebase/auth';
import React, { useEffect, useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';

import PhoneChangeModal from './PhoneChangeModal';

import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { auth } from '@/config/firebaseConfig';
import { setUser } from '@/lib/userSlice';
import { getUserData } from '@/lib/utils';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError } from '@/utils/toastMessage';

interface OtpLoginProps {
  phoneNumber: string;
  isModalOpen: boolean;
  setIsModalOpen: any;
}

function OtpLogin({ phoneNumber, isModalOpen, setIsModalOpen }: OtpLoginProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState(phoneNumber);

  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);

  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  useEffect(() => {
    const recaptchaVerifier = new RecaptchaVerifier(
      auth,
      'recaptcha-container',
      {
        size: 'invisible',
      },
    );

    setRecaptchaVerifier(recaptchaVerifier);

    return () => {
      recaptchaVerifier.clear();
    };
  }, []);

  const verifyOtp = useCallback(async () => {
    startTransition(async () => {
      setError('');

      if (!confirmationResult) {
        setError('Please request OTP first.');
        return;
      }

      try {
        const userCredential: UserCredential =
          await confirmationResult?.confirm(otp);

        const { user, claims } = await getUserData(userCredential);
        // Update phone verification status in mongoDb and firebase
        await axiosInstance.put(`/${claims.type}`, {
          phoneVerify: true,
        });

        dispatch(setUser({ ...user, type: claims.type }));
        router.replace(`/dashboard/${claims.type}`);
      } catch (error) {
        setError('Failed to verify OTP. Please check the OTP.');
        notifyError('Something went wrong. Please try again.', 'Error');
      }
    });
  }, [confirmationResult, otp, dispatch, router, phone]);

  useEffect(() => {
    const hasEnteredAllDigits = otp.length === 6;
    if (hasEnteredAllDigits) {
      verifyOtp();
    }
  }, [otp, verifyOtp]);

  const requestOtp = useCallback(async () => {
    startTransition(async () => {
      setError('');
      setResendCountdown(60);
      if (!recaptchaVerifier) {
        return setError('RecaptchaVerifier is not initialized.');
      }
      try {
        if (phoneNumber.length > 0) {
          const confirmationResult = await signInWithPhoneNumber(
            auth,
            phoneNumber,
            recaptchaVerifier,
          );
          setConfirmationResult(confirmationResult);
          setSuccess('OTP sent successfully.');
        }
      } catch (err: any) {
        console.error(err);
        setResendCountdown(0);
        if (err.code === 'auth/invalid-phone-number') {
          setError('Invalid phone number. Please check the number.');
        } else if (err.code === 'auth/too-many-requests') {
          setError('Too many requests. Please try again later.');
        } else {
          setError('Failed to send OTP. Please try again.');
        }
      }
    });
  }, [phoneNumber, recaptchaVerifier]);
  const handlePhoneChange = (newPhone: string) => {
    setPhone(newPhone);
    requestOtp();
    setShowModal(false);
  };

  useEffect(() => {
    if (isModalOpen && phoneNumber !== '') {
      requestOtp();
    }
  }, [isModalOpen, requestOtp, phoneNumber]);

  const loadingIndicator = (
    <div role="status" className="flex justify-center">
      <svg
        aria-hidden="true"
        className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );

  return (
    <>
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setTimeout(() => {
              const emailEl = document.getElementById('email');
              if (emailEl && 'focus' in emailEl) {
                (emailEl as HTMLElement).focus();
              }
            }, 0);
          }
        }}
      >
        <DialogContent className="rounded-lg">
          <DialogHeader>
            <p className="text-sm text-center text-gray-500">
              OTP sent to{' '}
              <strong>
                {(() => {
                  const raw = phone || phoneNumber || '';
                  if (!raw) return '';
                  const last4 = raw.slice(-4);
                  const masked = raw.slice(0, -4).replace(/\d/g, '*');
                  return `${masked}${last4}`;
                })()}
              </strong>
            </p>
            <button
              className="text-blue-600 text-sm underline mt-1"
              onClick={() => setShowModal(true)}
            >
              Not your number? Change it
            </button>
            <DialogTitle>Enter OTP</DialogTitle>
            <DialogDescription>
              Please enter the OTP sent to your phone number.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col justify-center items-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
              aria-label="One-time password"
              inputMode="numeric"
              autoComplete="one-time-code"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-muted-foreground mt-2" id="otp-help">
              You can paste the 6-digit code here.
            </p>

            <Button
              type="button"
              onClick={requestOtp}
              disabled={isPending || resendCountdown > 0}
              className="mt-5"
              aria-live="polite"
            >
              {resendCountdown > 0
                ? `Resend OTP in ${resendCountdown}`
                : isPending
                  ? 'Sending OTP'
                  : 'Send OTP'}
            </Button>

            <div className="p-10 text-center">
              {error && (
                <p className="text-red-500" role="alert" aria-live="assertive">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-green-500" role="status" aria-live="polite">
                  {success}
                </p>
              )}
            </div>
            {isPending && loadingIndicator}
          </div>
        </DialogContent>
      </Dialog>

      <PhoneChangeModal
        open={showModal}
        setOpen={setShowModal}
        onSubmit={handlePhoneChange}
        setPhone={setPhone}
      />

      <div id="recaptcha-container" aria-hidden="true" />
    </>
  );
}

export default OtpLogin;
