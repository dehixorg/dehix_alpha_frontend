import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
// import { Check, X } from 'lucide-react';
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
    label = 'Fair';
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
// // Password strength helper
// function getPasswordStrength(password: string): { label: string; color: string; level: number } {
//   let level = 0;
//   if (password.length >= 8) level++;
//   if (/[A-Z]/.test(password)) level++;
//   if (/[a-z]/.test(password)) level++;
//   if (/[0-9]/.test(password)) level++;
//   if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) level++;
//   if (level <= 2) return { label: 'Weak', color: 'bg-red-500', level: 1 };
//   if (level === 3 || level === 4) return { label: 'Medium', color: 'bg-yellow-500', level: 2 };
//   return { label: 'Strong', color: 'bg-green-500', level: 3 };
// }
import {
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
  Check,
   X,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';

import countries from '../../../country-codes.json';

import PhoneNumberForm from './phoneNumberChecker';

import TextInput from '@/components/shared/input';
import OtpLogin from '@/components/shared/otpDialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';
import { cn } from '@/lib/utils';
import TermsDialog from '@/components/shared/BusinessTermsDialog';

interface StepperProps {
  currentStep: number;
}

const Stepper = ({ currentStep = 0 }: StepperProps) => {
  const steps = [
    { id: 0, title: 'Personal Info', icon: User },
    { id: 1, title: 'Company Info', icon: Briefcase },
    { id: 2, title: 'Verification', icon: Shield },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-4  sm:py-6 mb-10 sm:mb-8">
      <div className="text-center space-y-2 sm:space-y-4">
        <h1 className="text-3xl font-bold">
          Create Your Business <span className="block">Account</span>
        </h1>
        <p className="text-muted-foreground">
          Join our community and find the best talent in web3 space
        </p>
      </div>
      <div className="my-4 text-center text-xs sm:text-sm">
        Are you a Freelancer?{' '}
        <Button variant="outline" size="sm" className="ml-2" asChild>
          <Link href="/auth/sign-up/freelancer">Register Freelancer</Link>
        </Button>
      </div>
      <div className="flex items-center justify-center sm:mt-8 px-2 sm:px-0">
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

const businessRegisterSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    userName: z.string().min(1, 'Username is required'),
    companyName: z.string().min(1, 'Company name is required'),
    companySize: z.string().min(1, 'Company size is required'),
    position: z.string().min(1, 'Position is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    referralCode: z.string().optional(),
    linkedin: z
      .string()
      .url('Invalid URL')
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
      ),
    password: z.string().min(8, ''),
    confirmPassword: z
      .string()
      .min(8, 'Confirm Password must be at least 8 characters long'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'], // Associate the error with the `confirmPassword` field
    message: 'Passwords do not match',
  });

type BusinessRegisterFormValues = z.infer<typeof businessRegisterSchema>;

export default function BusinessRegisterPage() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="flex w-full items-center justify-center">
      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-4">
        <Stepper currentStep={currentStep} />
        <div className="flex justify-center w-full ">
          <div className="w-full max-w-4xl">
            <BusinessRegisterForm
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface BusinessRegisterFormProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

function BusinessRegisterForm({
  currentStep,
  setCurrentStep,
}: BusinessRegisterFormProps) {
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
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [Isverified, setIsVerified] = useState<boolean>(false);
  const [isTermsDialog, setIsTermsDialog] = useState(false);
  const searchParams = useSearchParams();
  const [lastCheckedUsername, setLastCheckedUsername] = useState<string | null>(
    null,
  );
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const form = useForm<BusinessRegisterFormValues>({
    resolver: zodResolver(businessRegisterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      userName: '',
      companyName: '',
      companySize: '',
      position: '',
      email: '',
      phone: '',
      linkedin: '',
      personalWebsite: '',
      password: '',
      referralCode: '',
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
        'userName',
        'email',
        'password',
        'confirmPassword',
      ]);
      if (isValid) {
        const { userName } = form.getValues();
        try {
          setIsVerified(true);
          const username = userName;
          if (username === lastCheckedUsername) {
            setCurrentStep(currentStep + 1);
            return;
          }
          const response = await axiosInstance.get(
            `/public/username/check-duplicate?username=${username}&is_business=true`,
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
    } else if (currentStep === 1) {
      const isValid = await form.trigger([
        'companyName',
        'companySize',
        'position',
        'linkedin',
        'personalWebsite',
      ]);

      if (isValid) {
        setCurrentStep(currentStep + 1);
      } else {
        notifyError(
          'Please fill in all required fields before proceeding.',
          'Validation Error',
        );
      }
    }
  };

  const onSubmit = async (data: BusinessRegisterFormValues) => {
    setIsLoading(true);
    const referralCodeFromQuery = searchParams.get('referral');

    const referralCodeFromForm = data.referralCode;

    const referralCode = referralCodeFromQuery || referralCodeFromForm || null;
    setPhone(
      `${countries.find((c) => c.code === code)?.dialCode}${data.phone}`,
    );
    const formData = {
      ...data,
      phone: `${countries.find((c) => c.code === code)?.dialCode}${data.phone}`,
      phoneVerify: false,
      isBusiness: true,
      connects: 0,
      otp: '123456',
      otpverified: 'No',
      ProjectList: [],
      Appliedcandidates: [],
      hirefreelancer: [],
      refer: '',
      verified: '',
      isVerified: false,
    };
    const url = referralCode
      ? `/register/business?referralCode=${referralCode}`
      : '/register/business';
    try {
      await axiosInstance.post(url, formData);
      notifySuccess(
        'Your business account has been created.',
        'Account created successfully!',
      );
      setIsModalOpen(true);
    } catch (error: any) {
      console.error('API Error:', error);
      notifyError(
        `Error: ${error.response?.data.message || 'Something went wrong!'}`,
        'Uh oh! Something went wrong.',
      );
    } finally {
      setIsLoading(false);
    }
  };
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
                <TextInput
                  control={form.control}
                  name="firstName"
                  label="First name"
                  placeholder="First Name"
                />
                <TextInput
                  control={form.control}
                  name="lastName"
                  label="Last name"
                  placeholder="Last Name"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  control={form.control}
                  name="userName"
                  label="Username"
                  placeholder="Username"
                />
                <TextInput
                  control={form.control}
                  name="email"
                  label="Email"
                  placeholder="Enter your email"
                  type="email"
                />
              </div>
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
                                  : passwordStrength.label === 'Fair'
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
              <TextInput
                control={form.control}
                name="companyName"
                label="Company Name"
                placeholder="Company Name"
              />
              <div className="grid gap-2">
                <Label htmlFor="company-size">Company Size</Label>
                <Controller
                  control={form.control}
                  name="companySize"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="company-size">
                        <SelectValue placeholder="Select Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="0-20">0-20</SelectItem>
                          <SelectItem value="20-50">20-50</SelectItem>
                          <SelectItem value="50-100">50-100</SelectItem>
                          <SelectItem value="100-500">100-500</SelectItem>
                          <SelectItem value="500+">500 +</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  control={form.control}
                  name="position"
                  label="Position"
                  placeholder="CTO"
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
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  control={form.control}
                  name="linkedin"
                  label="LinkedIn"
                  placeholder="https://www.linkedin.com/in/username"
                  type="url"
                />
                <TextInput
                  control={form.control}
                  name="personalWebsite"
                  label="Portfolio Url"
                  type="url"
                  placeholder="https://www.yourwebsite.com"
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

            {/* Third Step */}
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
          </div>
        </div>
        <OtpLogin
          phoneNumber={phone}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      </form>
    </Form>
  );
}
