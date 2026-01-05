import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  DollarSign,
  Eye,
  EyeOff,
  Github,
  Globe,
  Linkedin,
  Loader2,
  LoaderCircle,
  Rocket,
  Shield,
  User,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { Controller, SubmitErrorHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';

import countries from '../../../country-codes.json';
import PasswordStrength, { getPasswordStrength } from '../PasswordStrength';

import PhoneNumberForm from './phoneNumberChecker';

import { cn } from '@/lib/utils';
import TextInput from '@/components/shared/input'; // Import the reusable TextInput component
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { Label } from '@/components/ui/label';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Slider } from '@/components/ui/slider';
import OtpLogin from '@/components/shared/otpDialog';
import DateOfBirthPicker from '@/components/DateOfBirthPicker/DateOfBirthPicker';
import TermsDialog from '@/components/shared/FreelancerTermsDialog';
import EmailOtpDialog from '@/components/shared/emailOtpDialog';

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
            Complete the steps below to finish setting up your freelancer
            account.
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
                          ? 'Links & pricing'
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
        (value) => {
          const v = (value ?? '').trim();
          if (!v) return true;

          // Accept:
          // - github.com/username
          // - www.github.com/username
          // - https://github.com/username (with optional trailing path/query)
          const re =
            /^(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/?(?:[?#].*)?$/;
          return re.test(v);
        },
        {
          message:
            'Enter a valid GitHub profile (e.g. github.com/username or https://github.com/username)',
        },
      ),

    linkedin: z
      .string()
      .optional()
      .refine(
        (value) => {
          const v = (value ?? '').trim();
          if (!v) return true;

          // Accept:
          // - linkedin.com/in/handle
          // - www.linkedin.com/in/handle
          // - https://www.linkedin.com/in/handle
          // (with optional trailing path/query)
          const re =
            /^(?:https?:\/\/)?(?:[a-z]{2,3}\.)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9-_%]+\/?(?:[?#].*)?$/i;
          return re.test(v);
        },
        {
          message:
            'Enter a valid LinkedIn profile (e.g. linkedin.com/in/your-handle)',
        },
      ),
    personalWebsite: z
      .string()
      .optional()
      .refine(
        (value) => {
          const v = (value ?? '').trim();
          if (!v) return true;

          // Accept:
          // - example.com
          // - www.example.com
          // - https://example.com/path?x=y
          // Reject strings without a dot TLD.
          const re =
            /^(?:https?:\/\/)?(?:www\.)?[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+\/?(?:[?#].*)?$/;
          return re.test(v);
        },
        {
          message:
            'Enter a valid website (e.g. example.com or https://example.com)',
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

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <section className="hidden lg:block">
            <div className="sticky top-10">
              <div className="rounded-2xl border bg-gradient p-8">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 border flex items-center justify-center px-3">
                    <Rocket className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-3xl font-bold tracking-tight">
                      Create your freelancer account
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      A clean profile helps clients trust you faster. You’re
                      just a couple of steps away.
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid gap-3 text-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <p className="text-muted-foreground">
                      Verify your email and phone to secure your account.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Briefcase className="mt-0.5 h-4 w-4 text-primary" />
                    <p className="text-muted-foreground">
                      Add links and pricing so clients can evaluate you quickly.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-4 w-4 text-primary" />
                    <p className="text-muted-foreground">
                      Agree to terms and you’re ready to start.
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-xl bg-background/60 border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Estimated time</p>
                    <Badge variant="outline">2-3 minutes</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Keep your details handy (email + phone). You can finish
                    later if needed.
                  </p>
                </div>

                <div className="mt-6">
                  <Button size="lg" className="w-full rounded-xl" asChild>
                    <Link
                      href="/auth/sign-up/business"
                      className="flex items-center justify-center gap-2"
                    >
                      Register as a Business
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
                  <CardTitle>Create your freelancer account</CardTitle>
                  <CardDescription>
                    Join our community and start your freelancing journey.
                  </CardDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 my-2"
                    asChild
                  >
                    <Link href="/auth/sign-up/business">Register Business</Link>
                  </Button>
                </div>
                <Stepper currentStep={currentStep} />
              </CardHeader>
              <CardContent>
                <FreelancerRegisterForm
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
    const encodedReferralCode = referralCode
      ? encodeURIComponent(referralCode)
      : null;
    setPhone(
      `${countries.find((c) => c.code === code)?.dialCode}${data.phone}`,
    );

    setIsLoading(true);
    const formData = {
      ...data,
      phone: `${countries.find((c) => c.code === code)?.dialCode}${data.phone}`,
      phoneNumber: `${countries.find((c) => c.code === code)?.dialCode}${data.phone}`,
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
    const url = encodedReferralCode
      ? `/register/freelancer?referralCode=${encodedReferralCode}`
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

  const onInvalid: SubmitErrorHandler<ProfileFormValues> = (errors) => {
    console.error('FORM_INVALID:', errors);
    notifyError(
      'Please fix the highlighted fields and try again.',
      'Validation Error',
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="w-full"
        noValidate
      >
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
                These details help clients understand your experience and
                pricing.
              </p>
            )}
            {currentStep === 2 && (
              <p className="text-sm text-muted-foreground">
                Verify your phone and accept the terms to create your account.
              </p>
            )}
          </div>

          {currentStep === 0 &&
            isEmailVerified &&
            verifiedEmail === form.getValues('email') && (
              <Alert className="border-primary/30 bg-primary/5">
                <AlertDescription className="text-sm">
                  Email verified. You can continue.
                </AlertDescription>
              </Alert>
            )}

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
                            <InputGroup>
                              <InputGroupInput
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
                            </InputGroup>
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
                          <InputGroup>
                            <InputGroupInput
                              placeholder="Confirm your password"
                              type={showPassword ? 'text' : 'password'}
                              className="pr-10"
                              {...field}
                            />
                          </InputGroup>
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
                <FormField
                  control={form.control}
                  name="githubLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <Github className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            type="url"
                            placeholder="https://github.com/yourusername"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <Linkedin className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            type="url"
                            placeholder="https://www.linkedin.com/in/yourprofile"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </InputGroup>
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
                      <FormLabel>Personal Website</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <Globe className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            type="url"
                            placeholder="https://www.yourwebsite.com"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="perHourPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <DollarSign className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            type="number"
                            inputMode="decimal"
                            min={0}
                            max={300}
                            step={1}
                            placeholder="0"
                            value={field.value ?? 0}
                            onChange={(e) => {
                              const v = e.target.value;
                              field.onChange(v === '' ? 0 : Number(v));
                            }}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* LinkedIn and Personal Website */}
              <div className="grid gap-4 sm:grid-cols-1">
                <FormField
                  control={form.control}
                  name="workExperience"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Work Experience</FormLabel>
                        <span className="text-xs text-muted-foreground">
                          {Number(field.value ?? 0)} yrs
                        </span>
                      </div>
                      <FormControl>
                        <div className="pt-2">
                          <Slider
                            min={0}
                            max={60}
                            step={1}
                            value={[Number(field.value ?? 0)]}
                            onValueChange={([val]) => field.onChange(val)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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
                  className="text-sm text-muted-foreground leading-relaxed"
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
