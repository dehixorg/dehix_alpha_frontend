import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  Linkedin,
  Loader2,
  LoaderCircle,
  Rocket,
  Shield,
  User,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';

import countries from '../../../country-codes.json';

import PhoneNumberForm from './phoneNumberChecker';

import TextInput from '@/components/shared/input';
import OtpLogin from '@/components/shared/otpDialog';
import PasswordStrength, {
  getPasswordStrength,
} from '@/components/form/PasswordStrength';
import EmailOtpDialog from '@/components/shared/emailOtpDialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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

  const activeStep = steps.find((s) => s.id === currentStep) ?? steps[0];
  const progressValue = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              Step {currentStep + 1} of {steps.length}
            </Badge>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight truncate">
              {activeStep.title}
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete the steps below to finish setting up your business account.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <Progress value={progressValue} className="h-2" />
      </div>

      <nav aria-label="Registration steps" className="mt-4">
        <ol className="grid grid-cols-3 gap-2">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isDone = currentStep > step.id;

            return (
              <li
                key={step.id}
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  'rounded-lg border px-2 py-2 sm:px-3 sm:py-3 transition-colors',
                  isActive
                    ? 'border-primary/40 bg-primary/5 shadow-sm'
                    : isDone
                      ? 'border-border bg-muted/30'
                      : 'border-border bg-background hover:bg-muted/20',
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      'h-7 w-7 sm:h-8 sm:w-8 rounded-full border flex items-center justify-center shrink-0',
                      isDone
                        ? 'bg-primary border-primary text-primary-foreground'
                        : isActive
                          ? 'border-primary text-primary'
                          : 'border-muted-foreground/30 text-muted-foreground',
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        'text-xs sm:text-sm font-medium truncate',
                        isActive ? 'text-foreground' : 'text-muted-foreground',
                      )}
                      title={step.title}
                    >
                      {step.title}
                    </p>
                    <p className="hidden sm:block text-[11px] text-muted-foreground truncate">
                      {step.id === 0
                        ? 'Basics & security'
                        : step.id === 1
                          ? 'Company details'
                          : 'Phone & consent'}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
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
    <div className="w-full">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <section className="hidden lg:block">
            <div className="sticky top-10">
              <div className="rounded-2xl border bg-gradient p-8">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 border flex items-center justify-center px-3">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-3xl font-bold tracking-tight">
                      Create your business account
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Post roles faster, manage candidates, and collaborate with
                      your team in one place.
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid gap-3 text-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <p className="text-muted-foreground">
                      Set up your company profile to attract the right talent.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-4 w-4 text-primary" />
                    <p className="text-muted-foreground">
                      Verify your phone and accept terms to secure your account.
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <Button size="lg" className="w-full rounded-xl" asChild>
                    <Link
                      href="/auth/sign-up/freelancer"
                      className="flex items-center justify-center gap-2"
                    >
                      Register as a Freelancer
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full">
            <Card className="w-full rounded-xl">
              <CardHeader>
                <div className="lg:hidden mb-2">
                  <CardTitle>Create your business account</CardTitle>
                  <CardDescription>
                    Join our community and find the best talent in web3 space.
                  </CardDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 my-2"
                    asChild
                  >
                    <Link href="/auth/sign-up/freelancer">
                      Register Freelancer
                    </Link>
                  </Button>
                </div>
                <Stepper currentStep={currentStep} />
              </CardHeader>
              <CardContent>
                <BusinessRegisterForm
                  currentStep={currentStep}
                  setCurrentStep={setCurrentStep}
                />
              </CardContent>
            </Card>
          </section>
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
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [isEmailOtpDialogOpen, setIsEmailOtpDialogOpen] =
    useState<boolean>(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [dialogEmail, setDialogEmail] = useState<string>('');
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
        const currentEmail = form.getValues('email');
        if (!isEmailVerified || verifiedEmail !== currentEmail) {
          const email = currentEmail;
          if (email) {
            setDialogEmail(email);
            setIsEmailOtpDialogOpen(true);
          }
          return;
        }

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
    const currentEmail = form.getValues('email');
    if (!isEmailVerified || verifiedEmail !== currentEmail) {
      notifyError(
        'Please verify your email before submitting the form.',
        'Email Not Verified',
      );
      return;
    }

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

  const handleEmailVerificationSuccess = () => {
    const currentEmail = form.getValues('email');
    setIsEmailVerified(true);
    setVerifiedEmail(currentEmail);
    setIsEmailOtpDialogOpen(false);
    notifySuccess('Email verified successfully! You can continue.', 'Success');
  };

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="grid gap-4 sm:gap-6 w-full">
          <div className="grid gap-2">
            {currentStep === 0 && (
              <p className="text-sm text-muted-foreground">
                Use your real details—clients will see your name and profile
                later.
              </p>
            )}
            {currentStep === 1 && (
              <p className="text-sm text-muted-foreground">
                Add your company details so freelancers know who they’ll work
                with.
              </p>
            )}
            {currentStep === 2 && (
              <p className="text-sm text-muted-foreground">
                Verify your phone and accept the terms to create your account.
              </p>
            )}
          </div>

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
                  disabled={isEmailOtpDialogOpen}
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
                          {field.value && (
                            <PasswordStrength
                              passwordStrength={passwordStrength}
                            />
                          )}
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
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  control={form.control}
                  name="companyName"
                  label="Company Name"
                  placeholder="Company Name"
                />
                <FormField
                  control={form.control}
                  name="companySize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Size</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
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
                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="url"
                            placeholder="https://www.linkedin.com/in/username"
                            className="pl-9"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="personalWebsite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio URL</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="url"
                            placeholder="https://www.yourwebsite.com"
                            className="pl-9"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-2 justify-between mt-4">
                <Button
                  type="button"
                  onClick={handlePreviousStep}
                  className="w-full sm:w-auto"
                  variant="outline"
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
                <Checkbox
                  id="terms"
                  checked={isChecked}
                  onCheckedChange={() => {
                    if (!isTermsDialog) {
                      setIsChecked(!isChecked);
                    }
                  }}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground"
                >
                  I agree to the{' '}
                  <span
                    onClick={() => setIsTermsDialog(true)}
                    className="text-primary hover:underline cursor-pointer"
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
                  variant="outline"
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
        <EmailOtpDialog
          email={dialogEmail}
          isOpen={isEmailOtpDialogOpen}
          setIsOpen={setIsEmailOtpDialogOpen}
          onVerificationSuccess={handleEmailVerificationSuccess}
        />
      </form>
    </Form>
  );
}
