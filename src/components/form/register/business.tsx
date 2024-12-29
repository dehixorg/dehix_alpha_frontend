'use client';

import React, { useState } from 'react';
import { LoaderCircle, Rocket, Eye, EyeOff } from 'lucide-react';
import { ToastAction } from '@radix-ui/react-toast';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import countries from '../../../country-codes.json';

import PhoneNumberForm from './phoneNumberChecker';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import TextInput from '@/components/shared/input'; // Adjust the import path as needed
import { Button } from '@/components/ui/button';
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
import { Label } from '@/components/ui/label';
import { axiosInstance } from '@/lib/axiosinstance';
import { Input } from '@/components/ui/input';
import OtpLogin from '@/components/shared/otpDialog';

const businessRegisterSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
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
        message: 'LinkedIn URL must start with "https://www.linkedin.com/in/"',
      },
    ),
  personalWebsite: z.string().url('Invalid URL').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

type BusinessRegisterFormValues = z.infer<typeof businessRegisterSchema>;

export default function BusinessRegisterForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [code, setCode] = useState<string>('IN');
  const [phone, setPhone] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState<string>('');
  const [passwordStrengthClass, setPasswordStrengthClass] =
    useState<string>('');
  const [isChecked, setIsChecked] = useState<boolean>(false); // State for checkbox

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const checkPasswordStrength = (password: string) => {
    let strength = '';
    let className = '';

    const strongRegex = new RegExp(
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{12,}$',
    );
    const mediumRegex = new RegExp(
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d!@#$%^&*]{8,}$',
    );

    if (strongRegex.test(password)) {
      strength = 'Strong';
      className = 'text-green-500';
    } else if (mediumRegex.test(password)) {
      strength = 'Medium';
      className = 'text-yellow-500';
    } else if (password.length > 0) {
      strength = 'Weak';
      className = 'text-red-500';
    }

    setPasswordStrength(strength);
    setPasswordStrengthClass(className);
  };

  const form = useForm<BusinessRegisterFormValues>({
    resolver: zodResolver(businessRegisterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
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

  const onSubmit = async (data: BusinessRegisterFormValues) => {
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
      // handleLogin(data.email, data.password);
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 grid-cols-2">
          <div className="grid gap-2">
            <TextInput
              control={form.control}
              name="firstName"
              label="First name"
              placeholder="John"
            />
          </div>
          <div className="grid gap-2">
            <TextInput
              control={form.control}
              name="lastName"
              label="Last name"
              placeholder="Doe"
            />
          </div>

          <div className="grid gap-2">
            <TextInput
              control={form.control}
              name="companyName"
              label="Company Name"
              placeholder="Tech Innovators"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company-size">Company Size</Label>
            <Controller
              control={form.control}
              name="companySize"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="company-size" className="w-auto">
                    <SelectValue placeholder="Select a Company Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Company Size</SelectLabel>
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

          <div className="grid gap-2">
            <TextInput
              control={form.control}
              name="position"
              label="Position"
              placeholder="CTO"
            />
          </div>
          <div className="grid gap-2">
            <TextInput
              control={form.control}
              name="email"
              label="Email"
              placeholder="john.doe@techinnovators.com"
              type="email"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <PhoneNumberForm
              control={form.control}
              setCode={setCode}
              code={code}
            />
          </div>

          <div className="grid gap-2">
            <TextInput
              control={form.control}
              name="linkedin"
              label="LinkedIn"
              placeholder="https://www.linkedin.com/in/username"
              type="url"
              className="w-full"
            />
          </div>

          <div className="grid gap-2">
            <TextInput
              control={form.control}
              name="personalWebsite"
              label="Personal Website"
              type="url"
              placeholder="https://www.yourwebsite.com"
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
                          onChange={(e) => {
                            field.onChange(e);
                            checkPasswordStrength(e.target.value);
                          }}
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <OtpLogin
            phoneNumber={phone}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
          />

          <div className="space-y-2 col-span-2">
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

          <div className="flex items-center gap-2 col-span-2">
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

          <div className="col-span-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isChecked} // Button disabled when loading or checkbox unchecked
            >
              {isLoading ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="mr-2 h-4 w-4" />
              )}{' '}
              Create an account
            </Button>
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
