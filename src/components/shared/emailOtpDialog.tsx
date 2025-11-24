'use client';

import React, { useEffect, useState, useCallback } from 'react';

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
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';

interface EmailOtpDialogProps {
  email: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onVerificationSuccess: () => void;
}

const EmailOtpDialog: React.FC<EmailOtpDialogProps> = ({
  email,
  isOpen,
  setIsOpen,
  onVerificationSuccess,
}) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const maskEmail = (value: string) => {
    try {
      const parts = value.split('@');
      if (parts.length !== 2) return value;
      const local = parts[0];
      const domain = parts[1];
      return `${local.charAt(0)}***@${domain}`;
    } catch (err) {
      return value;
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

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

  const sendOtp = useCallback(async () => {
    setError(null);
    setSuccess('');
    setIsSending(true);
    try {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          // indicate pending via explicit state for each attempt
          setResendCountdown(60);
          await axiosInstance.post('/public/send-email-otp', { email });
          setSuccess('OTP sent successfully to your email');
          notifySuccess('OTP sent successfully to your email');
          break;
        } catch (err: any) {
          setResendCountdown(0);

          // If this was the last allowed attempt, rethrow to be handled below
          if (attempt === 3) {
            throw err;
          }
        }
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || 'Failed to send OTP';
      notifyError(message, 'Error');
      setError(message);
    } finally {
      setIsSending(false);
    }
  }, [email]);

  const verifyOtp = useCallback(async () => {
    setIsVerifying(true);
    setError(null);
    try {
      await axiosInstance.post('/public/verify-email-otp', {
        email,
        otp,
      });
      notifySuccess('Email verified successfully!');
      setSuccess('Email verified successfully!');
      onVerificationSuccess?.();
      setIsOpen(false);
    } catch (err: any) {
      const code = err?.response?.data?.code;
      if (code === 'OTP_MISMATCH') {
        setError('Invalid OTP. Please try again.');
        notifyError('Invalid OTP. Please try again.', 'Error');
      } else if (code === 'OTP_EXPIRED') {
        setError('OTP has expired. Please request a new one.');
        notifyError('OTP has expired. Please request a new one.', 'Error');
      } else {
        const message = err?.response?.data?.message || 'Failed to verify OTP';
        setError(message);
        notifyError(message, 'Error');
      }
    } finally {
      setIsVerifying(false);
    }
  }, [email, otp, onVerificationSuccess, setIsOpen]);

  useEffect(() => {
    if (otp.length === 6) {
      verifyOtp();
    }
  }, [otp, verifyOtp]);

  // Reset state when the dialog opens/closes to avoid stale values
  useEffect(() => {
    if (isOpen) {
      // clear previous values when opening
      setOtp('');
      setError(null);
      setSuccess('');
    } else {
      // clear countdown when dialog is closed
      setResendCountdown(0);
    }
  }, [isOpen]);

  useEffect(() => {
    // guard auto-send: only send when dialog opens and there's no active countdown
    if (isOpen && email && resendCountdown === 0) {
      sendOtp();
    }
  }, [isOpen, email, resendCountdown, sendOtp]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <p className="text-sm text-center text-gray-500">
            OTP sent to <strong>{maskEmail(email)}</strong>
          </p>
          <DialogTitle>Verify Your Email</DialogTitle>
          <DialogDescription>
            Please enter the 6-digit OTP sent to your email address.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col justify-center items-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
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

          <Button
            disabled={isSending || resendCountdown > 0 || isVerifying}
            className="mt-5"
            onClick={() => sendOtp()}
          >
            {resendCountdown > 0
              ? `Resend OTP in ${resendCountdown}`
              : isSending
                ? 'Sending OTP'
                : 'Resend OTP'}
          </Button>

          <div className="p-6 text-center">
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
          </div>

          {(isSending || isVerifying) && loadingIndicator}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailOtpDialog;
