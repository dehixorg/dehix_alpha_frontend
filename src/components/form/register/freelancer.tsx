'use client';

import React, { useState, useRef } from 'react';
import { z } from 'zod';
import { ToastAction } from '@radix-ui/react-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  Rocket,
  Shield,
  User,
  UserCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import countries from '../../../country-codes.json';

import PhoneNumberForm from './phoneNumberChecker';

import { cn } from '@/lib/utils';
import TextInput from '@/components/shared/input'; // Import the reusable TextInput component
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import OtpLogin from '@/components/shared/otpDialog';
interface Step {
  id: number;
  title: string;
  icon: React.ElementType;
}

interface StepperProps {
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ currentStep = 0 }) => {
  const steps: Step[] = [
    { id: 0, title: 'Personal Info', icon: User },
    { id: 1, title: 'Professional Info', icon: Briefcase },
    { id: 2, title: 'Verification', icon: Shield },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-6 mb-4 sm:mb-8">
      <div className="text-center space-y-2 sm:space-y-4">
        <h1 className="text-3xl font-bold">
          Create Your Freelancer <span className="block">Account</span>
        </h1>
        <p className="text-muted-foreground">
          Join our community and start your Freelancing Journey.
        </p>
      </div>
      <div className="my-4 text-center text-xs sm:text-sm">
        Are you a business?{' '}
        <Button variant="outline" size="sm" className="ml-2" asChild>
          <Link href="/auth/sign-up/business">Register Business</Link>
        </Button>
      </div>
      <div className="flex items-center justify-center mt-4 sm:mt-8 px-2 sm:px-0">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="relative">
              <div
                className={`w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border-2 transition-all duration-300
                ${
                  currentStep > step.id
                    ? 'bg-primary border-primary'
                    : currentStep === step.id
                      ? 'border-primary bg-background text-primary'
                      : 'border-muted bg-background text-muted'
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 text-background" />
                ) : (
                  <step.icon className="w-4 h-4 sm:w-6 sm:h-6" />
                )}
              </div>
              <span
                className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs sm:text-sm whitespace-nowrap font-medium
                ${currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-20 sm:w-40 mx-2 sm:mx-4 h-[2px] bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: currentStep > step.id ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const profileFormSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: 'First Name must be at least 2 characters.' }),
    lastName: z
      .string()
      .min(2, { message: 'Last Name must be at least 2 characters.' }),
    email: z
      .string()
      .email({ message: 'Email must be a valid email address.' }),
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
    perHourPrice: z
      .number()
      .max(300, 'Per hour price must not excedd 300')
      .refine((value) => value >= 0, {
        message: 'Price must be a non-negative number.',
      }),
    workExperience: z
      .number()
      .min(0, 'Work experience must be at least 0 years')
      .max(60, 'Work experience must not exceed 60 years'),
    dob: z.string().optional(),
    confirmPassword: z
      .string()
      .min(6, 'Confirm Password must be at least 6 characters long'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'], // Associate the error with the `confirmPassword` field
    message: 'Passwords do not match',
  });

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function FreelancerPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    {
      title: 'Account Details',
      description: 'Basic information',
      icon: <UserCircle className="w-6 h-6" />,
    },
    {
      title: 'Company Info',
      description: 'About your business',
      icon: <Building2 className="w-6 h-6" />,
    },
    {
      title: 'Verification',
      description: 'Contact details',
      icon: <Shield className="w-6 h-6" />,
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <Stepper currentStep={currentStep} />
      {/* Form content goes here */}
      <FreelancerRegisterForm
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />
    </div>
  );
}

interface FreelancerRegisterFormProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

function FreelancerRegisterForm({
  currentStep,
  setCurrentStep,
}: FreelancerRegisterFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [code, setCode] = useState<string>('IN');
  const [phone, setPhone] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false); // State for checkbox
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

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

  const handlePreviousStep = async () => {
    setCurrentStep(currentStep - 1);
  };

  const handleNextStep = async () => {
    if (currentStep === 0) {
      const isValid = await form.trigger([
        'firstName',
        'lastName',
        'email',
        'dob',
        'password',
        'confirmPassword',
      ]);
      if (isValid) {
        setCurrentStep(currentStep + 1);
      } else {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Please fill in all required fields before proceeding.',
        });
      }
    } else if (currentStep === 1) {
      const isValid = await form.trigger([
        'userName',
        'githubLink',
        'linkedin',
        'personalWebsite',
        'perHourPrice',
        'resume',
        'workExperience',
      ]);
      if (isValid) {
        setCurrentStep(currentStep + 1);
      } else {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Please fill in all required fields before proceeding.',
        });
      }
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setPhone(
      `${countries.find((c) => c.code === code)?.dialCode}${data.phone}`,
    );

    setIsLoading(true);
    const formData = {
      ...data,
      phone: `${countries.find((c) => c.code === code)?.dialCode}${data.phone}`,
      phoneVerify: false,
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
      // oracleStatus: 'notApplied',
      dob: data.dob ? new Date(data.dob).toISOString() : null,
    };
    try {
      await axiosInstance.post('/register/freelancer', formData);
      toast({
        title: 'Account created successfully!',
        description: 'Redirecting to login page...',
      });

      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="w-full p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="grid gap-4 sm:gap-6 w-full">
            {/* FirstStep */}
            <div
              className={cn('grid gap-4', currentStep === 0 ? '' : 'hidden')}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {/* First Name and Last Name */}
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

              {/* Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  control={form.control}
                  name="email"
                  label="Email"
                  placeholder="john.doe@techinnovators.com"
                  type="email"
                />

                <TextInput
                  control={form.control}
                  name="dob"
                  label="Date of Birth"
                  type="date"
                  className="w-full"
                />
              </div>
              {/* Password and Confirm Password */}
              <div className="space-y-2">
                <Label>Password</Label>
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
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute inset-y-0 right-0 px-3 flex items-center"
                          >
                            {showPassword ? (
                              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                            ) : (
                              <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Confirm your password"
                            type={showPassword ? 'text' : 'password'}
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute inset-y-0 right-0 px-3 flex items-center"
                          >
                            {showPassword ? (
                              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                            ) : (
                              <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full sm:w-auto"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Second Step */}
            <div
              className={cn('grid gap-4', currentStep === 1 ? '' : 'hidden')}
            >
              {/* Username and GitHub */}
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  control={form.control}
                  name="userName"
                  label="Username"
                  placeholder="JohnDoe123"
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
              <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="grid gap-4 sm:grid-cols-2">
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

              {/* Work Experience */}
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  control={form.control}
                  name="workExperience"
                  label="Work Experience (Years)"
                  type="number"
                  placeholder="0"
                  className="w-full"
                />
              </div>

              <div className="flex gap-2 justify-between mt-4">
                <Button
                  type="button"
                  onClick={handlePreviousStep}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full sm:w-auto"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            <div
              className={cn('grid gap-4', currentStep === 2 ? '' : 'hidden')}
            >
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <PhoneNumberForm
                  control={form.control}
                  setCode={setCode}
                  code={code}
                />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="terms"
                  checked={isChecked}
                  onChange={() => setIsChecked(!isChecked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="/terms" className="text-primary hover:underline">
                    Terms and Conditions
                  </a>
                </label>
              </div>
              <div className="flex gap-2 flex-col sm:flex-row justify-between mt-4">
                <Button
                  type="button"
                  onClick={handlePreviousStep}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={isLoading || !isChecked}
                >
                  {isLoading ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Rocket className="mr-2 h-4 w-4" />
                  )}
                  Create account
                </Button>
              </div>
            </div>

            {/* OTP Login */}
            <OtpLogin
              phoneNumber={phone}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
