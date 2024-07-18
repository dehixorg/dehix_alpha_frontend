'use client';

import { useState, useRef } from 'react';
import { LoaderCircle, Rocket, Eye, EyeOff } from 'lucide-react';
import { ToastAction } from '@radix-ui/react-toast';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { UserCredential } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { axiosInstance, initializeAxiosWithToken } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';
import { loginUser } from '@/lib/utils';
import { setUser } from '@/lib/userSlice';

export default function BusinessRegisterForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogin = async (email: string, pass: string): Promise<void> => {
    try {
      const userCredential: UserCredential = await loginUser(email, pass);
      const user = userCredential.user;

      // Get the ID token
      const accessToken = await user.getIdToken();
      console.log('Bearer ' + accessToken);
      initializeAxiosWithToken(accessToken);
      const claims = await user.getIdTokenResult();
      console.log('Type:', claims.claims.type);
      console.log('User ID ' + userCredential.user.uid);
      dispatch(setUser({ ...userCredential.user, type: claims.claims.type }));
      console.log(userCredential.user);
      router.replace(`/dashboard/${claims.claims.type}`);
    } catch (error: any) {
      // Optionally handle error based on its type
      setIsLoading(false);
      console.error(error.message);
      return error.message;
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    const formData = {
      firstName: (document.getElementById('first-name') as HTMLInputElement)
        .value,
      lastName: (document.getElementById('last-name') as HTMLInputElement)
        .value,
      companyName: (document.getElementById('company-name') as HTMLInputElement)
        .value,
      companySize: (document.getElementById('company-size') as HTMLInputElement)
        .value,
      password: (document.getElementById('password') as HTMLInputElement).value,
      email: (document.getElementById('email') as HTMLInputElement).value,
      phone: (document.getElementById('phone') as HTMLInputElement).value,
      position: (document.getElementById('position') as HTMLInputElement).value,
      refer: 'Jane Smith',
      verified: 'No',
      isVerified: false,
      linkedin: (document.getElementById('linkedin') as HTMLInputElement).value,
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
      await axiosInstance.post('/register/business', formData);
      toast({
        title: 'Account created successfully!',
        description: 'Your business account has been created.',
      });
      handleLogin(formData.email, formData.password);
      formRef.current?.reset();
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
          <Input id="company-size" placeholder="50-100" required />
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
          <Input id="phone" type="tel" placeholder="123-456-7890" required />
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
