import { zodResolver } from '@hookform/resolvers/zod';
import { ToastAction } from '@radix-ui/react-toast';
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
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
  icon: React.ElementType;
}

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
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-6 mb-4 sm:mb-8">
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
    linkedin: z
      .string()
      .url('Invalid URL')
      .optional()
      .refine(
        (value) => !value || value.startsWith('https://www.linkedin.com/in/'),
        {
          message:
            'LinkedIn URL must start with "https://www.linkedin.com/in/"',
        },
      ),
    personalWebsite: z.string().url('Invalid URL').optional(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
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
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-4 py-4 sm:py-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            Create Your Business <span className="block">Account</span>
          </h1>
          <p className="text-muted-foreground">
            Join our community and find the best talent in web3 space
          </p>
        </div>
        <Stepper currentStep={currentStep} />
        <div className="flex justify-center w-full">
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
  const [code, setCode] = useState<string>('IN');
  const [phone, setPhone] = useState<string>('');
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [Isverified, setIsVerified] = useState<boolean>(false);
  const router = useRouter();

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
        'companyName',
        'companySize',
        'position',
        'linkedin',
        'personalWebsite',
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

  const onSubmit = async (data: BusinessRegisterFormValues) => {
    setIsModalOpen(true);
    // Simulate OTP verification after 5 seconds
    setTimeout(() => {
      setIsVerified(true);
      setIsModalOpen(false);
      toast({
        title: 'Phone number verified successfully!',
        description: 'You can now create your account.',
      });
    }, 5000);

    setIsLoading(true);
    setPhone(
      `${countries.find((c) => c.code === code)?.dialCode}${data.phone}`,
    );
    const formData = {
      ...data,
      phone: `${countries.find((c) => c.code === code)?.dialCode}${data.phone}`,
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
    try {
      await axiosInstance.post('/register/business', formData);
      toast({
        title: 'Account created successfully!',
        description: 'Your business account has been created.',
      });
      setIsModalOpen(true);
      router.push('/auth/login');
    } catch (error: any) {
      console.error('API Error:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: `Error: ${error.response?.data || 'Something went wrong!'}`,
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
              <TextInput
                control={form.control}
                name="position"
                label="Position"
                placeholder="CTO"
              />
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
