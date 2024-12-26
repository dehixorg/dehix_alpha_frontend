'use client';

import { useState, useRef } from 'react';
import { z } from 'zod';
import { LoaderCircle, Rocket, Eye, EyeOff } from 'lucide-react';
import { ToastAction } from '@radix-ui/react-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import countries from '../../../country-codes.json';

import PhoneNumberForm from './phoneNumberChecker';

import TextInput from '@/components/shared/input'; // Import the reusable TextInput component
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import OtpLogin from '@/components/shared/otpDialog';

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
    .min(10, { message: 'Phone number must be at least 10 digits.' })
    .regex(/^\d+$/, { message: 'Phone number can only contain digits.' }),
  githubLink: z.string().url().optional(),
  resume: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  personalWebsite: z.string().url().or(z.literal('')).optional(), // Allow empty string or valid URL
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
  perHourPrice: z.number().refine((value) => value >= 0, {
    message: 'Price must be a non-negative number.',
  }),
  workExperience: z
    .number()
    .min(0, 'Work experience must be at least 0 years')
    .max(60, 'Work experience must not exceed 60 years'),
  dob: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function FreelancerRegisterForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [code, setCode] = useState<string>('IN');
  const [phone, setPhone] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false); // State for checkbox

  const formRef = useRef<HTMLFormElement>(null);

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
      perHourPrice: 0,
      workExperience: 0,
      dob: '',
    },
    mode: 'all',
  });

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setPhone(
      `${countries.find((c) => c.code === code)?.dialCode}${data.phone}`,
    );

    setIsLoading(true);
    const formData = {
      ...data,
      phone: `${countries.find((c) => c.code === code)?.dialCode}${data.phone}`,
      role: 'freelancer',
      connects: 0,
      professionalInfo: {},
      skills: [],
      domain: [],
      education: {},
      projects: {},
      isFreelancer: true,
      refer: { name: 'string', contact: 'string' },
      pendingProject: [],
      rejectedProject: [],
      acceptedProject: [],
      oracleProject: [],
      userDataForVerification: [],
      interviewsAligned: [],
      oracleStatus: 'notApplied',
      dob: data.dob ? new Date(data.dob).toISOString() : null,
    };
    try {
      await axiosInstance.post('/register/freelancer', formData);
      toast({ title: 'Account created successfully!' });
      setIsModalOpen(true);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Something went wrong!';
      console.error('API Error:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: errorMessage,
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} ref={formRef}>
        <div className="">
          {/* First Name and Last Name */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <TextInput
              control={form.control}
              name="firstName"
              label="First Name"
              placeholder="Max"
              className="w-full"
            />
            <TextInput
              control={form.control}
              name="lastName"
              label="Last Name"
              placeholder="Robinson"
              className="w-full"
            />
          </div>

          {/* Email and Phone Number */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <TextInput
              control={form.control}
              name="email"
              label="Email"
              type="email"
              placeholder="m@example.com"
              className="w-full"
            />
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <PhoneNumberForm
                control={form.control}
                setCode={setCode}
                code={code}
              />
            </div>
          </div>

          {/* Username and GitHub */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <TextInput
              control={form.control}
              name="userName"
              label="Username"
              placeholder="your_username"
              className="w-full"
            />
            <TextInput
              control={form.control}
              name="githubLink"
              label="GitHub"
              type="url"
              placeholder="https://github.com/yourusername"
              className="w-full"
            />
          </div>

          {/* LinkedIn and Personal Website */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <TextInput
              control={form.control}
              name="linkedin"
              label="LinkedIn"
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full"
            />
            <TextInput
              control={form.control}
              name="personalWebsite"
              label="Personal Website"
              type="url"
              placeholder="https://www.yourwebsite.com"
              className="w-full"
            />
          </div>

          {/* Hourly Rate and Resume */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <TextInput
              control={form.control}
              name="perHourPrice"
              label="Hourly Rate ($)"
              type="number"
              placeholder="0"
              className="w-full"
            />
            <TextInput
              control={form.control}
              name="resume"
              label="Resume (URL)"
              type="url"
              placeholder="Enter Google Drive Resume Link"
              className="w-full"
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
                          className="w-full"
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

          {/* DOB and Work Experience */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <TextInput
              control={form.control}
              name="dob"
              label="Date of Birth"
              type="date"
              className="w-full"
            />
            <TextInput
              control={form.control}
              name="workExperience"
              label="Work Experience (Years)"
              type="number"
              placeholder="0"
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
            />
            <label htmlFor="terms">
              I agree to the <a href="/terms">Terms and Conditions</a>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isChecked}
          >
            {isLoading ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="mr-2 h-4 w-4" />
            )}{' '}
            Create an account
          </Button>

          {/* OTP Login */}
          <OtpLogin
            phoneNumber={phone}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
          />
        </div>
      </form>
    </Form>
  );
}
