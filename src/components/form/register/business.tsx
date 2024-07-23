'use client';

import { useState, useRef, useEffect } from 'react';
import { LoaderCircle, Rocket, Eye, EyeOff } from 'lucide-react';
import { ToastAction } from '@radix-ui/react-toast';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { UserCredential } from 'firebase/auth';
import { z, ZodError } from 'zod';

import PhoneNumberForm from './phoneNumberChecker';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { axiosInstance, initializeAxiosWithToken } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';
import { loginUser } from '@/lib/utils';
import { setUser } from '@/lib/userSlice';

// Define Zod schema for password validation
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long');

export default function BusinessRegisterForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [companySize, setCompanySize] = useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogin = async (email: string, pass: string): Promise<void> => {
    try {
      const userCredential: UserCredential = await loginUser(email, pass);
      const user = userCredential.user;

      // Get the ID token
      const accessToken = await user.getIdToken();
      initializeAxiosWithToken(accessToken);
      const claims = await user.getIdTokenResult();
      dispatch(setUser({ ...userCredential.user, type: claims.claims.type }));
      router.replace(`/dashboard/${claims.claims.type}`);
    } catch (error: any) {
      setIsLoading(false);
      console.error(error.message);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(''); // Clear the error message as user types
  };
  const handleCompanySizeChange = (value: string) => {
    setCompanySize(value);
  };

  useEffect(() => {
    const registerBusiness = async () => {
      const formData = {
        firstName: (document.getElementById('first-name') as HTMLInputElement)
          .value,
        lastName: (document.getElementById('last-name') as HTMLInputElement)
          .value,
        companyName: (
          document.getElementById('company-name') as HTMLInputElement
        ).value,
        companySize: companySize,
        password: (document.getElementById('password') as HTMLInputElement)
          .value,
        email: (document.getElementById('email') as HTMLInputElement).value,
        phone: phoneNumber,
        position: (document.getElementById('position') as HTMLInputElement)
          .value,
        refer: 'Jane Smith',
        verified: 'No',
        isVerified: false,
        linkedin: (document.getElementById('linkedin') as HTMLInputElement)
          .value,
        personalWebsite: (
          document.getElementById('personalWebsite') as HTMLInputElement
        ).value,
        isBusiness: true,
        connects: 0,
        otp: '123456',
        otpverified: 'No',
        ProjectList: [],
        Appliedcandidates: [],
        hirefreelancer: [],
      };

      try {
        // Validate password using Zod schema
        passwordSchema.parse(password);

        // API call

        await axiosInstance.post('/register/business', formData);
        toast({
          title: 'Account created successfully!',
          description: 'Your business account has been created.',
        });
        handleLogin(formData.email, formData.password);
        formRef.current?.reset();
      } catch (error: any) {
        // Handle Zod validation error
        if (error instanceof ZodError) {
          setPasswordError(error.errors[0].message);
        } else {
          console.error('API Error:', error);
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: `Error: ${error.response?.data || 'Something went wrong!'}`,
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoading) {
      registerBusiness();
    }
  }, [isLoading, password, phoneNumber, companySize]);

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
  }
  return (
    <form onSubmit={onSubmit} ref={formRef}>
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="first-name">First name</Label>
            <Input id="first-name" placeholder="John" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="last-name">Last name</Label>
            <Input id="last-name" placeholder="Doe" required />
          </div>
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="company-name">Company Name</Label>
          <Input id="company-name" placeholder="Tech Innovators" required />
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="company-size">Company Size</Label>
          <Select onValueChange={handleCompanySizeChange}>
            <SelectTrigger id="company-size" className="w-auto">
              <SelectValue placeholder="Select a Company Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel> Company Size</SelectLabel>
                <SelectItem value="0-20">0-20</SelectItem>
                <SelectItem value="20-50">20-50</SelectItem>
                <SelectItem value="50-100">50-100</SelectItem>
                <SelectItem value="100-500">100-500</SelectItem>
                <SelectItem value="500+">500 +</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="position">Position</Label>
          <Input id="position" placeholder="CTO" required />
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@techinnovators.com"
            required
          />
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="phone">Phone Number</Label>
          <PhoneNumberForm
            phoneNumber={phoneNumber}
            onPhoneNumberChange={handlePhoneNumberChange}
          />
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            type="url"
            placeholder="https://www.linkedin.com/in/johndoe"
            required
          />
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="personalWebsite">Website</Label>
          <Input
            id="personalWebsite"
            type="url"
            placeholder="https://www.johndoe.com"
            required
          />
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              required
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
          </div>
          {passwordError && (
            <p className="text-red-500 text-xs mt-1">{passwordError}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Rocket className="mr-2 h-4 w-4" />
          )}{' '}
          Create an account
        </Button>
      </div>
    </form>
  );
}
