import React, { useEffect, useState } from 'react';
import {
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LoaderCircle,
  Rocket,
  Shield,
  User,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';

import countries from '../../../country-codes.json';

import PhoneNumberForm from './phoneNumberChecker';

import { cn } from '@/lib/utils';
import TextInput from '@/components/shared/input'; // Import the reusable TextInput component
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
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
import DateOfBirthPicker from '@/components/DateOfBirthPicker/DateOfBirthPicker';
import TermsDialog from '@/components/shared/FreelancerTermsDialog';
import EmailOtpDialog from '@/components/shared/emailOtpDialog';

function getPasswordStrength(password: string) {
  const rules = [
    { label: 'At least 8 characters', test: (pw: string) => pw.length >= 8 },
    { label: 'Contains a number', test: (pw: string) => /[0-9]/.test(pw) },
    {
      label: 'Contains a special character',
      test: (pw: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
    },
    {
      label: 'Contains an uppercase letter',
      test: (pw: string) => /[A-Z]/.test(pw),
    },
    {
      label: 'Contains a lowercase letter',
      test: (pw: string) => /[a-z]/.test(pw),
    },
  ];
  const passed = rules.map((rule) => rule.test(password));
  const level = passed.filter(Boolean).length;
  let color = 'bg-red-500';
  let label = 'Weak';
  if (level >= 2) {
    color = 'bg-yellow-400';
    label = 'Medium';
  }
  if (level >= 3) {
    color = 'bg-blue-400';
    label = 'Good';
  }
  if (level >= 4) {
    color = 'bg-green-500';
    label = 'Strong';
  }
  return {
    label,
    color,
    level,
    rules: rules.map((r, i) => ({ label: r.label, passed: passed[i] })),
  };
}

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
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-6 mb-10 sm:mb-8">
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

const getAgeWorkExperienceDifference = (today: any, dobDate: any) => {
  return (
    today.getFullYear() -
    dobDate.getFullYear() -
    (today <
    new Date(today.getFullYear(), dobDate.getMonth(), dobDate.getDate())
      ? 1
      : 0)
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
      .min(4, { message: 'Username must be at least 4 characters long' })
      .max(20, { message: 'Username must be less than 20 characters long' })
      .regex(/^[a-zA-Z0-9]{4}[a-zA-Z0-9_]*$/, {
        message: 'Underscore allowed only after 4 letters/numbers',
      }),
    phone: z
      .string()
      .min(10, { message: 'Phone number must be at least 10 digits.' })
      .regex(/^\d+$/, { message: 'Phone number can only contain digits.' }),
    githubLink: z
      .string()
      .optional()
      .refine(
        (value) =>
          !value ||
          /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/.test(value),
        {
          message:
            'GitHub URL must start with "https://github.com/" or "www.github.com/" and have a valid username',
        },
      ),

    linkedin: z
      .string()
      .optional()
      .refine(
        (value) =>
          !value ||
          /^https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/.test(value),
        {
          message:
            'LinkedIn URL must start with "https://www.linkedin.com/in/" and have a valid username',
        },
      ),
    personalWebsite: z
      .string()
      .optional()
      .refine(
        (value) =>
          !value ||
          /^(https?:\/\/|www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}.*[a-zA-Z0-9].*$/.test(
            value,
          ),
        {
          message:
            'Invalid website URL. Must start with "www." or "https://" and contain letters',
        },
      ), // Allow empty string or valid URL
    password: z.string().min(6, { message: '' }),
    perHourPrice: z
      .number()
      .max(300, 'Per hour price must not excedd 300')
      .refine((value) => value >= 0, {
        message: 'Price must be a non-negative number.',
      }),
    referralCode: z.string().optional(),
    workExperience: z
      .number()
      .min(0, 'Work experience must be at least 0 years')
      .max(60, 'Work experience must not exceed 60 years'),
    dob: z
      .union([z.string(), z.date()])
      .optional()
      .refine(
        (value) => {
          if (!value) return true; // Allow empty (optional) field

          const dobDate = new Date(value);
          const today = new Date();
          const minDate = new Date();
          minDate.setFullYear(today.getFullYear() - 16); // Subtract 16 years

          return dobDate <= minDate;
        },
        {
          message: 'You must be at least 16 years old',
        },
      ),
    confirmPassword: z
      .string()
      .min(6, 'Confirm Password must be at least 6 characters long'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'], // Associate the error with the `confirmPassword` field
    message: 'Passwords do not match',
  })
  .refine(
    (data) => {
      if (!data.dob) return true; // Skip check if DOB is not provided

      const dobDate = new Date(data.dob);
      const today = new Date();
      const age = getAgeWorkExperienceDifference(today, dobDate);

      return data.workExperience <= age;
    },
    {
      path: ['workExperience'],
      message: 'Work experience cannot be greater than your age',
    },
  );

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function FreelancerPage() {
  const [currentStep, setCurrentStep] = useState(0);

  // const steps = [
  //   {
  //     title: 'Account Details',
  //     description: 'Basic information',
  //     icon: <UserCircle className="w-6 h-6" />,
  //   },
  //   {
  //     title: 'Company Info',
  //     description: 'About your business',
  //     icon: <Building2 className="w-6 h-6" />,
  //   },
  //   {
  //     title: 'Verification',
  //     description: 'Contact details',
  //     icon: <Shield className="w-6 h-6" />,
  //   },
  // ];

  return (
    <div className="flex w-full items-center justify-center">
      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-4">
        <Stepper currentStep={currentStep} />
        <div className="flex justify-center w-full">
          <div className="w-full max-w-4xl">
            <FreelancerRegisterForm
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface FreelancerRegisterFormProps {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

function FreelancerRegisterForm({
  currentStep,
  setCurrentStep,
}: FreelancerRegisterFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    label: string;
    color: string;
    level: number;
    rules: { label: string; passed: boolean }[];
  }>({ label: '', color: '', level: 0, rules: [] });
  const [code, setCode] = useState<string>('IN');
  const [phone, setPhone] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false); // State for checkbox
  const [Isverified, setIsVerified] = useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [isEmailOtpDialogOpen, setIsEmailOtpDialogOpen] =
    useState<boolean>(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [dialogEmail, setDialogEmail] = useState<string>('');
  const searchParams = useSearchParams();
  const [isTermsDialog, setIsTermsDialog] = useState(false);
  const [lastCheckedUsername, setLastCheckedUsername] = useState<string | null>(
    null,
  );
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
      linkedin: '',
      personalWebsite: '',
      password: '',
      perHourPrice: 0,
      workExperience: 0,
      referralCode: '',
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
        'userName',
        'password',
        'confirmPassword',
      ]);
      if (isValid) {
        // Check if email is already verified and matches the verified email
        const currentEmail = form.getValues('email');
        if (isEmailVerified && verifiedEmail === currentEmail) {
          // Email already verified and matches, proceed to next step
          setCurrentStep((s: number) => s + 1);
        } else {
          // Email not verified or doesn't match the verified email, open OTP dialog
          const email = currentEmail;
          if (email) {
            setDialogEmail(email);
            setIsEmailOtpDialogOpen(true);
          }
        }
      } else {
        notifyError(
          'Please fill in all required fields before proceeding.',
          'Validation Error',
        );
      }
    } else if (currentStep === 1) {
      const isValid = await form.trigger([
        'githubLink',
        'linkedin',
        'personalWebsite',
        'perHourPrice',
        'workExperience',
      ]);
      if (isValid) {
        const { userName } = form.getValues();
        setIsVerified(true);
        try {
          const username = userName;
          if (username === lastCheckedUsername) {
            setCurrentStep(currentStep + 1);
            return;
          }

          const response = await axiosInstance.get(
            `/public/username/check-duplicate?username=${username}&is_freelancer=true`,
          );

          if (response.data.duplicate === false) {
            setCurrentStep(currentStep + 1);
          } else {
            notifyError(
              'This username is already taken. Please choose another one.',
              'User Already Exists',
            );
            setLastCheckedUsername(username);
          }
        } catch (error: any) {
          notifyError(
            'There was an error while checking the username.',
            'API Error',
          );
        } finally {
          setIsVerified(false);
        }
      } else {
        notifyError(
          'Please fill in all required fields before proceeding.',
          'Validation Error',
        );
      }
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    // Ensure email is verified and matches the verified email before submitting
    const currentEmail = form.getValues('email');
    if (!isEmailVerified || verifiedEmail !== currentEmail) {
      notifyError(
        'Please verify your email before submitting the form.',
        'Email Not Verified',
      );
      return;
    }

    const referralCodeFromQuery = searchParams.get('referral');

    const referralCodeFromForm = data.referralCode;

    const referralCode = referralCodeFromQuery || referralCodeFromForm || null;
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
    const url = referralCode
      ? `/register/freelancer?referralCode=${referralCode}`
      : '/register/freelancer';
    try {
      await axiosInstance.post(url, formData);
      notifySuccess(
        'Redirecting to login page...',
        'Account created successfully!',
      );
      setIsModalOpen(true);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Something went wrong!';
      console.error('API Error:', error);
      notifyError(errorMessage, 'Uh oh! Something went wrong.');
    } finally {
      setTimeout(() => setIsLoading(false), 100);
    }
  };

  const handleEmailVerificationSuccess = () => {
    const currentEmail = form.getValues('email');
    setIsEmailVerified(true);
    setVerifiedEmail(currentEmail);
    setCurrentStep((s: number) => s + 1);
    notifySuccess(
      'Email verified successfully! Proceeding to next step.',
      'Success',
    );
  };

  // If the email field changes after verification, invalidate the verification
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'email') {
        const current = value.email;
        if (verifiedEmail && current !== verifiedEmail) {
          setIsEmailVerified(false);
          setVerifiedEmail(null);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, verifiedEmail]);
  useEffect(() => {
    const referralCode = searchParams.get('referral');
    if (referralCode) {
      form.setValue('referralCode', referralCode);
    }
  }, [searchParams, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-3xl mx-auto"
      >
        <div className="w-full p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="grid gap-4 sm:gap-6 w-full">
            {/* First Step */}
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
                  disabled={isEmailOtpDialogOpen}
                />
                <div className="flex flex-col gap-2 mt-1">
                  <Label className="text-sm font-medium">Date of Birth</Label>
                  <Controller
                    control={form.control}
                    name="dob"
                    render={({ field }) => <DateOfBirthPicker field={field} />}
                  />
                </div>
              </div>
              {/* UserName */}
              <TextInput
                control={form.control}
                name="userName"
                label="Username"
                placeholder="JohnDoe123"
              />

              {/* Password and Confirm Password */}
              <div className="space-y-2">
                <Label>Password</Label>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div>
                          <div className="relative">
                            <Input
                              placeholder="Enter your password"
                              type={showPassword ? 'text' : 'password'}
                              className="pr-10"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setPasswordStrength(
                                  getPasswordStrength(e.target.value),
                                );
                              }}
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
                          {/* Password Strength Indicator */}
                          <div className="flex flex-col gap-2 mt-2">
                            {/* Progress Bar */}
                            <div className="flex w-40 h-2 rounded overflow-hidden">
                              <div
                                className={`flex-1 ${passwordStrength.level >= 1 ? passwordStrength.color : 'bg-gray-200'} transition-all`}
                              ></div>
                              <div
                                className={`flex-1 ${passwordStrength.level >= 2 ? passwordStrength.color : 'bg-gray-200'} transition-all`}
                              ></div>
                              <div
                                className={`flex-1 ${passwordStrength.level >= 3 ? passwordStrength.color : 'bg-gray-200'} transition-all`}
                              ></div>
                              <div
                                className={`flex-1 ${passwordStrength.level >= 4 ? passwordStrength.color : 'bg-gray-200'} transition-all`}
                              ></div>
                            </div>
                            <span
                              className={`text-xs font-semibold ${
                                passwordStrength.label === 'Weak'
                                  ? 'text-red-500'
                                  : passwordStrength.label === 'Medium'
                                    ? 'text-yellow-500'
                                    : passwordStrength.label === 'Good'
                                      ? 'text-blue-500'
                                      : 'text-green-600'
                              }`}
                            >
                              {passwordStrength.label}
                            </span>
                            {/* Checklist */}
                            <ul className="mt-1 space-y-1">
                              {passwordStrength.rules.map((rule, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-center gap-2 text-xs"
                                >
                                  {rule.passed ? (
                                    <Check className="text-green-500 w-4 h-4" />
                                  ) : (
                                    <X className="text-red-500 w-4 h-4" />
                                  )}
                                  <span
                                    className={
                                      rule.passed
                                        ? 'text-green-600'
                                        : 'text-red-500'
                                    }
                                  >
                                    {rule.label}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
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
                  className="w-full sm:w-auto flex items-center justify-center"
                  disabled={Isverified}
                >
                  {Isverified ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Second Step */}
            <div
              className={cn('grid gap-4', currentStep === 1 ? '' : 'hidden')}
            >
              {/* GitHub and referral Code */}
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  control={form.control}
                  name="githubLink"
                  label="GitHub"
                  type="url"
                  placeholder="https://github.com/yourusername"
                  className="w-full"
                />
                <TextInput
                  control={form.control}
                  name="referralCode"
                  label="Referral"
                  type="string"
                  placeholder="JOHN123"
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

              {/* Hourly Rate and Work Experience */}
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

            {/* Final Step */}
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
                  onChange={() => {
                    if (!isTermsDialog) {
                      setIsChecked(!isChecked);
                    }
                  }}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <span
                    onClick={() => setIsTermsDialog(true)}
                    className="text-primary hover:underline"
                  >
                    Terms and Conditions
                  </span>
                </label>
                <TermsDialog
                  open={isTermsDialog}
                  setOpen={setIsTermsDialog}
                  setIsChecked={setIsChecked}
                />
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
            {/* Email OTP Dialog */}
            <EmailOtpDialog
              email={dialogEmail}
              isOpen={isEmailOtpDialogOpen}
              setIsOpen={setIsEmailOtpDialogOpen}
              onVerificationSuccess={handleEmailVerificationSuccess}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
