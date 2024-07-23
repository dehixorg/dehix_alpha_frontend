'use client';

import { useState, useRef } from 'react';
import { z, ZodError } from 'zod';
import { LoaderCircle, Rocket, Eye, EyeOff } from 'lucide-react';
import { ToastAction } from '@radix-ui/react-toast';
import { useRouter } from 'next/navigation';
import { UserCredential } from 'firebase/auth';
import { useDispatch } from 'react-redux';

import DatePicker from './datepicker';
import PhoneNumberForm from './phoneNumberChecker';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { axiosInstance, initializeAxiosWithToken } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';
import { loginUser } from '@/lib/utils';
import { setUser } from '@/lib/userSlice';
import 'react-datepicker/dist/react-datepicker.css';

// Define Zod schema for password validation
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long');
const workExperienceSchema = z
  .number()
  .min(0, 'Work experience must be at least 0 years')
  .max(60, 'Work experience must not exceed 60 years');

export default function FreelancerRegisterForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [workExperience, setWorkExperience] = useState<number | string>('');
  const [workExperienceError, setWorkExperienceError] = useState<string>('');
  const [dob, setDob] = useState<Date | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const maxDate = new Date();

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
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: `Error: ${error.message}`,
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(''); // Clear the error message as user types
  };
  const handleWorkExperienceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setWorkExperience(value);
    setWorkExperienceError(''); // Clear the error message as user types
  };
  const handleDateChange = (date: Date | null) => {
    setDob(date);
    console.log('Selected Date:', date);
  };
  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
  };

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    const formData = {
      firstName: (document.getElementById('first-name') as HTMLInputElement)
        .value,
      lastName: (document.getElementById('last-name') as HTMLInputElement)
        .value,
      email: (document.getElementById('email') as HTMLInputElement).value,
      phone: phoneNumber,
      userName: (document.getElementById('username') as HTMLInputElement).value,
      githubLink: (document.getElementById('github') as HTMLInputElement).value,
      linkedin: (document.getElementById('linkedin') as HTMLInputElement).value,
      personalWebsite: (
        document.getElementById('personalWebsite') as HTMLInputElement
      ).value,
      perHourPrice: (
        document.getElementById('perHourPrice') as HTMLInputElement
      ).value,
      resume: (document.getElementById('resume') as HTMLInputElement).value,
      password: (document.getElementById('password') as HTMLInputElement).value,
      dob: '2024-07-06T20:12:22.047Z',
      workExperience: (
        document.getElementById('workExperience') as HTMLInputElement
      ).value,
      connects: 0,
      professionalInfo: {},
      skills: [],
      education: {},
      role: 'freelancer',
      projects: {},
      isFreelancer: true,
      refer: { name: 'string', contact: 'string' },
      consultant: { status: 'notApplied' },
      pendingProject: [],
      rejectedProject: [],
      acceptedProject: [],
      oracleProject: [],
      userDataForVerification: [],
      interviewsAligned: [],
      oracleStatus: 'notApplied',
    };

    try {
      // Validate password using Zod schema
      passwordSchema.parse(password);
      workExperienceSchema.parse(Number(workExperience));
      // comment the API call
      
      await axiosInstance.post('/register/freelancer', formData);
      toast({ title: 'Account created successfully!' });
      handleLogin(formData.email, formData.password);
      formRef.current?.reset();
      
      
    } catch (error: any) {
      // Handle Zod validation error
      if (error instanceof ZodError) {
        setPasswordError(error.errors[0].message);
      } else if (error.errors[0].path.includes('workExperience')) {
        setWorkExperienceError(error.errors[0].message);
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
  }

  return (
    <form onSubmit={onSubmit} ref={formRef}>
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="first-name">First name</Label>
            <Input id="first-name" placeholder="Max" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="last-name">Last name</Label>
            <Input id="last-name" placeholder="Robinson" required />
          </div>
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="phone">Phone Number</Label>
          <div>
            <PhoneNumberForm
              phoneNumber={phoneNumber}
              onPhoneNumberChange={handlePhoneNumberChange}
            />
          </div>
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="yourusername"
            required
          />
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            type="url"
            placeholder="https://github.com/yourusername"
            required
          />
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            type="url"
            placeholder="https://www.linkedin.com/in/yourprofile"
            required
          />
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="personalWebsite">Personal Website</Label>
          <Input
            id="personalWebsite"
            type="url"
            placeholder="https://www.yourwebsite.com"
            required
          />
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="perHourPrice">Hourly Rate ($)</Label>
          <Input id="perHourPrice" type="number" placeholder="0" required />
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="resume">Resume (URL)</Label>
          <Input
            id="resume"
            type="url"
            placeholder="https://www.yourresume.com"
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
          {passwordError && (
            <p className="text-red-500 text-xs mt-1">{passwordError}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="grid gap-2">
            <Label htmlFor="DOB">DOB</Label>
            <div className="">
              <DatePicker
                selected={dob}
                onChange={handleDateChange}
                maxDate={maxDate}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="workExperience">Work Experience (Years)</Label>
            <Input
              id="workExperience"
              type="number"
              placeholder="0"
              value={workExperience}
              onChange={handleWorkExperienceChange}
              required
              min="0"
              max="60"
            />
            {workExperienceError && (
              <p className="text-red-500 text-xs mt-1">{workExperienceError}</p>
            )}
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-primary text-black"
          disabled={isLoading}
        >
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
