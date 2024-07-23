import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { LoaderCircle, Eye, EyeOff } from 'lucide-react';
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';

import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { axiosInstance } from '@/lib/axiosinstance';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
// import { DatePicker } from '@/components/shared/datePicker';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { auth } from '@/config/firebaseConfig';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult; // Replace 'any' with the specific type if available
  }
}

const profileFormSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: 'First Name must be at least 2 characters.' }),
  lastName: z
    .string()
    .min(2, { message: 'Last Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Email must be a valid email address.' }),
  userName: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long' })
    .max(20, { message: 'Username must be less than 20 characters long' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Username can only contain letters, numbers, and underscores',
    }), // Adjust regex as needed
  phone: z
    .string()
    .min(10, { message: 'Phone number must be at least 10 digits.' }),
  githubLink: z.string().url().optional(),
  resume: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  personalWebsite: z.string().url().optional(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function FreelancerRegisterForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      userName: '',
      phone: '',
      githubLink: '',
      resume: '',
      linkedin: '',
      personalWebsite: '',
      password: '',
    },
    mode: 'all',
  });

  // Define the Zod schema for OTP verification
  const otpSchema = z.object({
    otp: z
      .string()
      .length(6, { message: 'OTP must be exactly 6 digits' })
      .regex(/^\d+$/, { message: 'OTP must only contain digits' }),
  });

  // Example usage
  type OTPFormValues = z.infer<typeof otpSchema>;
  const otpForm = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
  });

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: async () => {
            await sendOtp();
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
          },
        },
      );

      console.log('TEST:', window.recaptchaVerifier);
    }
  }, []);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const sendOtp = async () => {
    try {
      console.log('TEST START', phoneNumber);
      const recaptchaVerifier = window.recaptchaVerifier as RecaptchaVerifier;
      console.log('TEST:', recaptchaVerifier);
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier,
      );
      console.log('TEST:', confirmationResult);
      console.log(phoneNumber);
      window.confirmationResult = confirmationResult;
    } catch (error) {
      console.error('Error sending OTP', error);
    }
  };

  const handleOTPSubmit = async (data: OTPFormValues) => {
    setOtp(data.otp || '');
    await handleVerifyOTP();
  };

  const handleVerifyOTP = async () => {
    try {
      console.log('OTP:', otp);
      const confirmationResult = window.confirmationResult;
      if (!confirmationResult)
        throw new Error('No OTP confirmation result found');
      console.log(await confirmationResult.confirm(otp));
      setIsModalOpen(false);
    } catch (error) {
      console.error('OTP Verification Error:', error);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    setPhoneNumber(data.phone);
    const formData = {
      ...data,
      perHourPrice: 0,
      role: 'freelancer',
      connects: 0,
      professionalInfo: {},
      skills: [],
      education: {},
      projects: {},
      isFreelancer: true,
      refer: { name: 'string', contact: 'string' },
      consultant: { status: 'notApplied' },
      pendingProject: [],
      rejectedProject: [],
      acceptedProject: [],
      oracleProject: [],
      userDataForVerification: [],
      interviewsAligned: [],
      oracleStatus: 'notApplied',
      workExperience: 1,
      dob: '2024-07-06T20:12:22.047Z',
    };
    console.log('FORM:', data);

    try {
      const response = await axiosInstance.post(
        '/register/freelancer',
        formData,
      );
      if (response.status === 200) {
        sendOtp();
        toast({ title: 'Account created successfully!' });
        setIsModalOpen(true);
      }
      form.reset();
    } catch (error: any) {
      console.error('API Error:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: `Error: ${JSON.stringify(error.response?.data) || 'Something went wrong!'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>First Name</Label>
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Enter your first name" {...field} />
                    </FormControl>
                    <FormDescription>Enter your first name</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Enter your last name" {...field} />
                    </FormControl>
                    <FormDescription>Enter your last name</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter your email</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter your username"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter your username</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter your phone number"
                      type="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter your phone number</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>GithubLink URL</Label>
            <FormField
              control={form.control}
              name="githubLink"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter your githubLink URL"
                      type="url"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter your githubLink URL</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Resume URL</Label>
            <FormField
              control={form.control}
              name="resume"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter your resume URL"
                      type="url"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the URL to your resume
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>LinkedIn URL</Label>
            <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter your LinkedIn URL"
                      type="url"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter your LinkedIn URL</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Personal Website URL</Label>
            <FormField
              control={form.control}
              name="personalWebsite"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter your website URL"
                      type="url"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter your website URL</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Enter your password"
                          type={showPassword ? 'text' : 'password'}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute inset-y-0 right-0 px-3 flex items-center"
                        >
                          {showPassword ? (
                            <Eye className="h-5 w-5" />
                          ) : (
                            <EyeOff className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Password must be at least 6 characters long.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* <div className="space-y-2">
            <Label>Date of Birth</Label>
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DatePicker />
                  </FormControl>
                  <FormDescription>Select your date of birth</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div> */}

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <LoaderCircle className="animate-spin h-5 w-5" />
              ) : (
                'Register'
              )}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogOverlay />
        <DialogContent>
          <DialogTitle>Enter OTP</DialogTitle>
          <Form {...otpForm}>
            <form
              onSubmit={otpForm.handleSubmit(handleOTPSubmit)}
              className="space-y-6"
            >
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Enter OTP" type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <LoaderCircle className="animate-spin h-5 w-5" />
                  ) : (
                    'Verify OTP'
                  )}
                </Button>
                <DialogClose asChild>
                  <Button type="button">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <div id="recaptcha-container" />
    </>
  );
}
