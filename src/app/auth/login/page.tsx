'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { UserCredential } from 'firebase/auth';
import { LoaderCircle, Chrome, Key, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/shared/themeToggle';
import { getUserData, loginGoogleUser, loginUser } from '@/lib/utils';
import { setUser } from '@/lib/userSlice';
import { axiosInstance } from '@/lib/axiosinstance';
import OtpLogin from '@/components/shared/otpDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState<string>('');
  const [pass, setPass] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEmailLoginLoading, setIsEmailLoginLoading] =
    useState<boolean>(false);
  const [isGoogleLoginLoading, setIsGoogleLoginLoading] =
    useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [srMessage, setSrMessage] = useState<string>('');
  const [forgotOpen, setForgotOpen] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotError, setForgotError] = useState<string>('');
  const [forgotMsg, setForgotMsg] = useState<string>('');
  const [isForgotLoading, setIsForgotLoading] = useState<boolean>(false);

  const fetchKYCDetails = async (userId: string, userType: string) => {
    try {
      let endpoint = '';

      if (userType.toLowerCase() === 'business') {
        endpoint = `/business/kyc`;
      } else if (userType.toLowerCase() === 'freelancer') {
        endpoint = `/freelancer/${userId}/kyc`;
      }

      const userResponse = await axiosInstance.get(endpoint);
      const status = userResponse.data.status || null;

      return status;
    } catch (error) {
      console.error('KYC Fetch Error:', error);
      notifyError('Failed to fetch KYC data. Please try again.');
      return null;
    }
  };

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (isEmailLoginLoading) return; // prevent double submit
    setIsEmailLoginLoading(true);
    setFormError('');
    setEmailError('');
    setPasswordError('');

    const emailRegex = /[^@\s]+@[^@\s]+\.[^@\s]+/;
    let hasError = false;
    if (!email || !emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    }
    if (!pass || pass.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      hasError = true;
    }
    if (hasError) {
      setIsEmailLoginLoading(false);
      return;
    }

    // Clear any existing auth state before login
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    Cookies.remove('userType');
    Cookies.remove('token');

    try {
      const response = await axiosInstance.get(
        `/public/user_email?user=${email}`,
      );
      setPhone(response.data.phone);
      const hasPhoneVerify = Object.prototype.hasOwnProperty.call(
        response.data,
        'phoneVerify',
      );
      if (hasPhoneVerify && response.data.phoneVerify === false) {
        setIsModalOpen(true);
      } else {
        try {
          const userCredential: UserCredential = await loginUser(email, pass);
          const { user, claims } = await getUserData(userCredential);

          const result = await fetchKYCDetails(user.uid, claims.type);

          if (result) {
            dispatch(
              setUser({
                ...user,
                type: claims.type,
                kycStatus: result,
              }),
            );
          } else {
            dispatch(setUser({ ...user, type: claims.type }));
          }
          setSrMessage('Login successful. Redirecting to your dashboard.');
          router.replace(`/dashboard/${claims.type}`);

          setTimeout(() => {
            notifySuccess(
              'You have successfully logged in.',
              'Login Successful',
            );
          }, 0);
        } catch (error: any) {
          notifyError('Invalid Email or Password. Please try again.');
          console.error(error.message);
        }
      }
    } catch (error: any) {
      setFormError('Invalid Email or Password. Please try again.');
      notifyError('Invalid Email or Password. Please try again.');
      console.error(error.message);
    } finally {
      setIsEmailLoginLoading(false); // Ensures isLoading resets after API call completion
    }
  };

  const handleGoogle = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (isGoogleLoginLoading) return; // prevent double submit
    setIsGoogleLoginLoading(true);

    try {
      const userCredential: UserCredential = await loginGoogleUser();
      const { user, claims } = await getUserData(userCredential);
      dispatch(setUser({ ...user, type: claims.type }));
      router.replace(`/dashboard/${claims.type}`);

      notifySuccess(
        'You have successfully logged in with Google.',
        'Login Successful',
      );
    } catch (error: any) {
      notifyError('Failed to login with Google. Please try again.');
      console.error(error.message);
    } finally {
      setIsGoogleLoginLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-screen">
      <div className="absolute left-10 top-10">
        <ThemeToggle />
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <form onSubmit={handleLogin} noValidate>
            <div className="grid gap-4">
              {/* SR live updates */}
              <p className="sr-only" aria-live="polite">
                {srMessage}
              </p>
              {formError && (
                <div
                  role="alert"
                  className="rounded-md border border-destructive/40 bg-destructive/10 text-destructive px-3 py-2 text-sm"
                >
                  {formError}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'email-error' : undefined}
                />
                {emailError && (
                  <p id="email-error" className="text-sm text-destructive">
                    {emailError}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotError('');
                      setForgotMsg('');
                      setForgotEmail(email);
                      setForgotOpen(true);
                      setTimeout(() => {
                        const el = document.getElementById('forgot-email');
                        if (el && 'focus' in el) (el as HTMLElement).focus();
                      }, 0);
                    }}
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    onChange={(e) => setPass(e.target.value)}
                    required
                    autoComplete="current-password"
                    aria-invalid={!!passwordError}
                    aria-describedby={
                      passwordError ? 'password-error' : undefined
                    }
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p id="password-error" className="text-sm text-destructive">
                    {passwordError}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isEmailLoginLoading}
              >
                {isEmailLoginLoading ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />{' '}
                    Logging in...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" /> Login
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={isGoogleLoginLoading}
                onClick={handleGoogle}
                aria-label="Sign in with Google"
              >
                {isGoogleLoginLoading ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Chrome className="mr-2 h-4 w-4" />
                )}{' '}
                Google Login
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Button variant="outline" size="sm" className="ml-2" asChild>
              <Link href="/auth/sign-up/freelancer">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="hidden lg:block">
        <Image
          src="/bg.png"
          alt=""
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:invert"
          aria-hidden="true"
        />
      </div>
      {/* OTP Login */}
      <OtpLogin
        phoneNumber={phone}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />

      {/* Forgot Password Dialog */}
      <Dialog
        open={forgotOpen}
        onOpenChange={(open) => {
          setForgotOpen(open);
          if (!open) {
            setTimeout(() => {
              const emailEl = document.getElementById('email');
              if (emailEl && 'focus' in emailEl)
                (emailEl as HTMLElement).focus();
            }, 0);
          }
        }}
      >
        <DialogContent role="dialog" aria-describedby="forgot-desc">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription id="forgot-desc">
              Enter your email address and we will send you reset instructions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="forgot-email">Email</Label>
            <Input
              id="forgot-email"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              autoComplete="email"
              aria-invalid={!!forgotError}
              aria-describedby={forgotError ? 'forgot-error' : undefined}
            />
            {forgotError && (
              <p id="forgot-error" className="text-sm text-destructive">
                {forgotError}
              </p>
            )}
            <p className="sr-only" aria-live="polite">
              {forgotMsg}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForgotOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (isForgotLoading) return;
                setForgotError('');
                setForgotMsg('');
                const emailRegex = /[^@\s]+@[^@\s]+\.[^@\s]+/;
                if (!forgotEmail || !emailRegex.test(forgotEmail)) {
                  setForgotError('Please enter a valid email address.');
                  return;
                }
                setIsForgotLoading(true);
                try {
                  // Simulate async request; wire real API when available
                  await new Promise((res) => setTimeout(res, 800));
                  setForgotMsg('Password reset email sent. Check your inbox.');
                  notifySuccess('Password reset email sent.');
                  setForgotOpen(false);
                } catch (e) {
                  setForgotError(
                    'Unable to send reset email. Please try again later.',
                  );
                  notifyError('Unable to send reset email.');
                } finally {
                  setIsForgotLoading(false);
                }
              }}
              disabled={isForgotLoading}
            >
              {isForgotLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send reset link'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
