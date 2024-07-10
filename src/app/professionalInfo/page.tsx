'use client';
import { User, CalendarIcon } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Label } from '@/components/ui/label';
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
  dob: z.date({
    required_error: 'A start date of working',
  }),
  start: z.date({
    required_error: 'A start date of working',
  }),
  end: z.date({
    required_error: 'A end date of working.',
  }),
});

export default function Page() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
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
                <form action="#" className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        className="block w-full rounded-md border border-gray-300 bg-gray-950 py-2 px-3 text-gray-400 placeholder-gray-500 focus:border-[#00b8d4] focus:outline-none focus:ring-[#00b8d4]"
                        id="first-name"
                        name="firstName"
                        placeholder="Enter your first name"
                        required
                        type="text"
                      />
                      <FormDescription>Enter your first name</FormDescription>
                    </div>

                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        className="block w-full rounded-md border border-gray-300 bg-gray-950 py-2 px-3 text-gray-400 placeholder-gray-500 focus:border-[#00b8d4] focus:outline-none focus:ring-[#00b8d4]"
                        id="last-name"
                        name="lastName"
                        placeholder="Enter your last name"
                        required
                        type="text"
                      />
                      <FormDescription>Enter your last name</FormDescription>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      className="block w-full rounded-md border border-gray-300 bg-gray-950 py-2 px-3 text-gray-400 placeholder-gray-500 focus:border-[#00b8d4] focus:outline-none focus:ring-[#00b8d4]"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      required
                      type="email"
                    />
                    <FormDescription>Enter your email</FormDescription>
                  </div>

                  <div className="flex items-end space-x-2">
                    <div className="flex-1 space-y-2">
                      <Label>Phone Number</Label>
                      <div className="flex items-center space-x-2">
                        <div className="bg-gray-950 text-gray-400 py-2 px-3 rounded-md border border-gray-300">
                          +91
                        </div>
                        <Input
                          className="block w-full rounded-md border border-gray-300 bg-gray-950 py-2 px-3 text-gray-400 placeholder-gray-500 focus:border-[#00b8d4] focus:outline-none focus:ring-[#00b8d4]"
                          id="phone-number"
                          name="phoneNumber"
                          placeholder="Enter your phone number"
                          required
                          type="number"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button className="bg-gray-600 text-white hover:bg-gray-800">
                        Send OTP
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FormItem>
                      <FormLabel>One-Time Password</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormDescription>
                        Please enter the one-time password sent to your phone.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                    <Button className="bg-gray-600 text-white hover:bg-gray-800">
                      Verify
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="dob"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date of birth</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
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
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
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
                  </div>

                  <div className="space-y-2">
                    <Label>Enter your current role or position</Label>
                    <Input
                      className="block w-full rounded-md border border-gray-300 bg-gray-950 py-2 px-3 text-gray-400 placeholder-gray-500 focus:border-[#00b8d4] focus:outline-none focus:ring-[#00b8d4]"
                      id="role"
                      name="role"
                      placeholder="Enter your current role"
                      required
                      type="role"
                    />
                    <FormDescription>Enter your email</FormDescription>
                  </div>

                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input
                      className="block w-full rounded-md border border-gray-300 bg-gray-950 py-2 px-3 text-gray-400 placeholder-gray-500 focus:border-[#00b8d4] focus:outline-none focus:ring-[#00b8d4]"
                      id="company-name"
                      name="companyName"
                      placeholder="Enter your organization's name"
                      required
                      type="text"
                    />
                    <FormDescription>
                      Enter your organization's name
                    </FormDescription>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="start"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
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
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
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
                          <FormDescription>Your start date</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="end"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
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
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
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
                          <FormDescription>Your end date</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Work Location</Label>
                    <Input
                      className="block w-full rounded-md border border-gray-300 bg-gray-950 py-2 px-3 text-gray-400 placeholder-gray-500 focus:border-[#00b8d4] focus:outline-none focus:ring-[#00b8d4]"
                      id="location"
                      name="location"
                      placeholder="Enter your work location"
                      required
                      type="text"
                    />
                    <FormDescription>Enter your work location</FormDescription>
                  </div>

                  <div className="space-y-2">
                    <Label>URLs</Label>
                    <Input
                      className="block w-full rounded-md border border-gray-300 bg-gray-950 py-2 px-3 text-gray-400 placeholder-gray-500 focus:border-[#00b8d4] focus:outline-none focus:ring-[#00b8d4]"
                      id="url"
                      name="ursl"
                      placeholder="Enter URL of your account"
                      required
                      type="url"
                    />
                    <Input
                      className="block w-full rounded-md border border-gray-300 bg-gray-950 py-2 px-3 text-gray-400 placeholder-gray-500 focus:border-[#00b8d4] focus:outline-none focus:ring-[#00b8d4]"
                      id="url"
                      name="ursl"
                      placeholder="Enter URL of your account"
                      required
                      type="url"
                    />
                    <FormDescription>
                      Enter URL of your accounts
                    </FormDescription>
                    <Button className="bg-gray-600 text-white hover:bg-gray-800">
                      Add URL
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
