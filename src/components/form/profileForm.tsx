import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { DatePicker } from '../shared/datePicker';
import { Card } from '../ui/card';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

interface ProfileFormProps {
  user: {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    phone: string;
    dob: string; // Ensure this matches the expected format for DatePicker
    role: string;
    projects: []; // Adjust this type as per your data structure
    githubLink: string;
    linkedin: string;
    personalWebsite: string;
    perHourPrice: number;
    connects: number;
    resume: {
      type: string;
      data: number[];
    };
    workExperience: number;
    isFreelancer: boolean;
    oracleStatus: string;
    pendingProject: any[]; // Adjust this type as per your data structure
    rejectedProject: any[]; // Adjust this type as per your data structure
    acceptedProject: any[]; // Adjust this type as per your data structure
    oracleProject: any[]; // Adjust this type as per your data structure
    userDataForVerification: any[]; // Adjust this type as per your data structure
    interviewsAligned: string[]; // Adjust this type as per your data structure
    createdAt: string; // Ensure this matches the expected format for DatePicker
    updatedAt: string; // Ensure this matches the expected format for DatePicker
    __v: number;
  };
}

const profileFormSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First Name must be at least 2 characters.',
  }),
  lastName: z.string().min(2, {
    message: 'Last Name must be at least 2 characters.',
  }),
  username: z
    .string()
    .min(2, {
      message: 'Username must be at least 2 characters.',
    })
    .max(30, {
      message: 'Username must not be longer than 30 characters.',
    }),
  email: z
    .string({
      required_error: 'Please select an email to display.',
    })
    .email(),
  phone: z.string().min(10, {
    message: 'Phone number must be at least 10 digits.',
  }),
  role: z.string(),
  bio: z.string().max(160).min(4),
  urls: z
    .array(
      z.object({
        value: z.string().url({ message: 'Please enter a valid URL.' }),
      }),
    )
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm({ user: initialUser }: ProfileFormProps) {
  const [user, setUser] = useState(initialUser);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.userName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || '',
      bio: '', // Set initial bio if needed
    },
    mode: 'all',
  });

  // const { fields, append } = useFieldArray({
  //   name: 'urls',
  //   control: form.control,
  // });

  function onSubmit(data: ProfileFormValues) {
    console.log('SUBMITTED')
    // Assuming `data` contains all form field values
    // Update `user` state with new data
    setUser({
      ...user,
      firstName: data.firstName,
      lastName: data.lastName,
      userName: data.username,
      email: data.email,
      phone: data.phone,
      // dob: data.dob.toISOString(), // Assuming `dob` is a Date object
      role: data.role,
      // Update other fields as needed
    });

    console.log('Form data:', data); // Log form data

    toast({
      title: 'You submitted the following values:',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Card className="p-10">
      <Form {...form}>
        <form
          onSubmit={()=>form.handleSubmit(onSubmit)}
          className="gap-10 lg:grid lg:grid-cols-2 xl:grid-cols-2"
        >
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your first name"
                    {...field}
                    defaultValue={user?.firstName || ''}
                  />
                </FormControl>
                <FormDescription>Enter your first name</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your last name"
                    {...field}
                    defaultValue={user?.lastName || ''}
                  />
                </FormControl>
                <FormDescription>Enter your last name</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your username"
                    {...field}
                    defaultValue={user?.userName || ''}
                    onChange={(e) => {
                      field.onChange(e);
                      setUser({ ...user, userName: e.target.value });
                    }}
                  />
                </FormControl>
                <FormDescription>Enter your username</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email"
                    {...field}
                    defaultValue={user?.email || ''}
                  />
                </FormControl>
                <FormDescription>Enter your email</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+91"
                    {...field}
                    defaultValue={user?.phone || ''}
                  />
                </FormControl>
                <FormMessage />
                <FormDescription>Enter your phone number</FormDescription>
              </FormItem>
            )}
          />
          {/* <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth{'\t'} </FormLabel>
                <FormControl>
                  <DatePicker {...field} />
                </FormControl>
                <FormDescription>
                  Your date of birth is used to calculate your age.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Role or Position</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultdefaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Developer">Developer</SelectItem>
                      <SelectItem value="Designer">Designer</SelectItem>
                      <SelectItem value="Product Manager">
                        Product Manager
                      </SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Enter your current role or position
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="lg:col-span-2 xl:col-span-2">
            Update profile
          </Button>
        </form>
      </Form>
    </Card>
  );
}
