import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Card } from '../ui/card';
import { toast } from '../ui/use-toast';

import { Label } from '@/components/ui/label';
import { axiosInstance } from '@/lib/axiosinstance';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const profileFormSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First Name must be at least 2 characters.',
  }),
  lastName: z.string().min(2, {
    message: 'Last Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Email must be a valid email address.',
  }),
  phone: z.string().min(10, {
    message: 'Phone number must be at least 10 digits.',
  }),
  companyName: z.string().optional(),
  companySize: z.string().optional(),
  position: z.string().optional(),
  linkedIn: z.string().url().optional(),
  website: z.string().url().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function BusinessForm({ user_id }: { user_id: string }) {
  const [user, setUser] = useState<any>({});
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      companyName: '',
      companySize: '',
      position: '',
      linkedIn: '',
      website: '',
    },
    mode: 'all',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/business/${user_id}`);
        console.log('API Response get:', response.data);
        setUser(response.data);
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    fetchData();
  }, [user_id]);

  useEffect(() => {
    form.reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      companyName: user?.companyName || '',
      companySize: user?.companySize || '',
      position: user?.position || '',
      linkedIn: user?.linkedin || '',
      website: user?.personalWebsite || '',
    });
  }, [user, form]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      // console.log('Form data:', data);
      const response = await axiosInstance.put(`/business/${user_id}`, {
        ...data,
      });
      console.log('API Response:', response.data);

      setUser({
        ...user,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        companyName: data.companyName,
        companySize: data.companySize,
        position: data.position,
        linkedin: data.linkedIn,
        personalWebsite: data.website,
      });

      // You can update other fields here as needed
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('API Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile. Please try again later.',
      });
    }
  }

  return (
    <Card className="p-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>First Name</Label>
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Enter your first name" {...field} />
                    </FormControl>
                    <FormDescription>Enter your first name</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Enter your last name" {...field} />
                    </FormControl>
                    <FormDescription>Enter your last name </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter your email</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter your phone number"
                      type="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter your phone number</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Company Name</Label>
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter your company name" {...field} />
                  </FormControl>
                  <FormDescription>Enter your company name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Company Size</Label>
            <FormField
              control={form.control}
              name="companySize"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter your company size" {...field} />
                  </FormControl>
                  <FormDescription>Enter your company size</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Position</Label>
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter your position" {...field} />
                  </FormControl>
                  <FormDescription>Enter your position</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>LinkedIn URL</Label>
            <FormField
              control={form.control}
              name="linkedIn"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter your LinkedIn URL"
                      type="url"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter your LinkedIn URL</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Website URL</Label>
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter your website URL"
                      type="url"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter your website URL</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            className="bg-gray-600 text-white hover:bg-gray-800"
            type="submit"
          >
            Submit
          </Button>
        </form>
      </Form>
    </Card>
  );
}
