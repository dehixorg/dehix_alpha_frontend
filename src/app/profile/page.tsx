'use client';
import { User, CalendarIcon } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

const FormSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  userName: z.string().min(1, { message: 'Username is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  phoneNumber: z.string().min(10, { message: 'Phone number is required.' }),
  otp: z.string().length(6, { message: 'OTP must be 6 digits.' }).optional(),
  dob: z.date({
    required_error: 'A date of birth is required.',
  }),
  role: z.string().min(1, { message: 'Role is required.' }),
  urls: z.array(z.string().url({ message: 'Invalid URL.' })).optional(),
});

export default function Page() {
  const defaultProfileData = {
    firstName: 'John',
    lastName: 'Doe',
    userName: 'johndoe',
    email: 'john.doe@example.com',
    phoneNumber: '9876543210',
    role: 'Software Engineer',
    dob: new Date('1990-01-01'), // Set to a specific date
    urls: [], // Start with an empty array for URLs
  };
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: defaultProfileData,
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    Object.assign(defaultProfileData, data);

    // Log the updated profile data
    console.log('Updated Profile Data:', defaultProfileData);
  };

  return (
    <div className="flex flex-col md:flex-row">
      <ProfileSidebar />
      <div className="bg-gray-800 sm:min-h-screen w-full flex justify-center items-center py-6 md:py-0">
        <div
          className="bg-black w-full p-1rem rounded-lg flex flex-col items-center justify-center p-4 md:p-8"
          style={{ height: '100%' }}
        >
          <div className="flex flex-col items-center justify-center">
            <section className="flex flex-col items-center justify-center w-full p-6 mt-5 space-y-4 text-white rounded-lg shadow-lg md:ml-5">
              <div className="rounded-full overflow-hidden w-24 h-24 md:w-32 md:h-32 mb-4 bg-gray-700 flex items-center justify-center">
                <User className="w-16 h-16 md:w-20 md:h-20 text-white cursor-pointer" />
              </div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter your first name"
                            />
                          </FormControl>
                          <FormDescription>
                            Enter your first name
                          </FormDescription>
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
                              {...field}
                              placeholder="Enter your last name"
                            />
                          </FormControl>
                          <FormDescription>
                            Enter your last name
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your username" />
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
                          <Input {...field} placeholder="Enter your email" />
                        </FormControl>
                        <FormDescription>Enter your email</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <div className="flex items-center space-x-2">
                          <div className="bg-gray-950 text-gray-400 py-2 px-3 rounded-md border border-gray-300">
                            +91
                          </div>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter your phone number"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Button className="bg-gray-600 text-white hover:bg-gray-800">
                      Send OTP
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>One-Time Password</FormLabel>
                        <FormControl>
                          <InputOTP maxLength={6}>
                            <InputOTPGroup>
                              {Array.from({ length: 6 }).map((_, index) => (
                                <InputOTPSlot
                                  key={index}
                                  index={index}
                                  {...field}
                                />
                              ))}
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormDescription>
                          Please enter the one-time password sent to your phone.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-[240px] pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date('1900-01-01')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Your date of birth is used to calculate your age.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Enter your current role or position
                        </FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="block w-full rounded-md border border-gray-300 bg-gray-950 py-2 px-3 text-gray-400 placeholder-gray-500 focus:border-[#00b8d4] focus:outline-none focus:ring-[#00b8d4]"
                          >
                            <option value="" disabled hidden>
                              Choose your role
                            </option>
                            <option value="Software Engineer">
                              Software Engineer
                            </option>
                            <option value="Data Scientist">
                              Data Scientist
                            </option>
                            <option value="UX UI Designer">
                              UX UI Designer
                            </option>
                            <option value="Project Coordinator">
                              Project Coordinator
                            </option>
                            <option value="Product Manager">
                              Product Manager
                            </option>
                            <option value="Quality Assurance">
                              Quality Assurance
                            </option>
                          </select>
                        </FormControl>
                        <FormDescription>
                          Enter your current role or position
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="urls"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URLs</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter URL of your account"
                          />
                        </FormControl>
                        <FormDescription>
                          Enter URL of your accounts
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button className="bg-gray-600 text-white hover:bg-gray-800">
                    Add URL
                  </Button>

                  <div className="flex justify-end mt-4">
                    <Button
                      type="submit"
                      className="bg-gray-600 text-white hover:bg-gray-800"
                    >
                      Save Profile Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
