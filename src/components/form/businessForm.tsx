import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { Building2, Save } from 'lucide-react';

import ProfilePictureUpload from '../fileUpload/profilePicture';
import { Label } from '../ui/label';

import { Card } from '@/components/ui/card';
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
import { Type } from '@/utils/enum';
import { setUser } from '@/lib/userSlice';
import { notifyError, notifySuccess } from '@/utils/toastMessage';

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
  linkedin: z
    .string()
    .url({ message: 'Must be a valid URL.' })
    .refine(
      (url) =>
        url.includes('linkedin.com/in/') ||
        url.includes('linkedin.com/company/'),
      {
        message: 'LinkedIn URL must start with: https://www.linkedin.com/in/',
      },
    )
    .optional(),
  website: z.string().url({ message: 'Must be a valid URL.' }).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function BusinessForm({ user_id }: { user_id: string }) {
  const [userInfo, setUserInfo] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch();

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
      linkedin: '',
      website: '',
    },
    mode: 'all',
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!user_id) return;

      try {
        const response = await axiosInstance.get(`/business/${user_id}`);
        const data = response.data;

        // Update form with the latest data
        form.reset({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          companyName: data.companyName || '',
          companySize: data.companySize || '',
          position: data.position || '',
          linkedin: data.linkedin || '',
          website: data.personalWebsite || data.website || '',
        });

        // Update local state
        setUserInfo({
          ...data,
          personalWebsite: data.personalWebsite || data.website || '',
        });
      } catch (error) {
        console.error('Failed to fetch business data:', error);
        notifyError('Failed to load business data. Please refresh the page.');
      }
    };

    fetchData();
  }, [user_id, form]); // Add form to dependencies since we're using reset

  async function onSubmit(data: ProfileFormValues) {
    if (!user_id) {
      const errorMsg = 'User ID is missing. Please refresh the page.';
      console.error(errorMsg);
      notifyError(errorMsg);
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.put(`/business`, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        companyName: data.companyName,
        companySize: data.companySize,
        position: data.position,
        linkedin: data.linkedin,
        personalWebsite: data.website,
        userId: user_id,
      });

      if (res.status >= 200 && res.status < 300) {
        // Refetch the updated data from the server
        const updatedResponse = await axiosInstance.get(`/business/${user_id}`);
        const updatedData = updatedResponse.data;

        // Update local state and Redux
        const userInfoData = {
          ...updatedData,
          personalWebsite:
            updatedData.personalWebsite || updatedData.website || '',
          website: updatedData.personalWebsite || updatedData.website || '',
          uid: user_id,
        };

        setUserInfo(userInfoData);
        dispatch(setUser(userInfoData));

        // Show success message
        notifySuccess(
          'Your profile has been successfully updated.',
          'Profile Updated',
        );
      } else {
        // Handle non-2xx responses
        console.error('Unexpected response status:', res.status);
        notifyError(
          `Failed to update profile. Server returned status ${res.status}.`,
        );
      }
    } catch (error) {
      console.error('API Error:', error);
      notifyError('Failed to update profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 bg-muted-foreground/20 dark:bg-muted/20">
      {/* Page Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Business Information
            </h1>
            <p className="text-sm text-muted-foreground">
              Keep your business profile accurate. It helps freelancers trust
              and recognize you.
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <ProfilePictureUpload
          profile={userInfo.profilePic}
          entityType={Type.BUSINESS}
        />
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Email</Label>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={true}
                        placeholder="Enter your email"
                        type="email"
                        {...field}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>Non editable field</FormDescription>
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
                        disabled={true}
                        placeholder="Enter your phone number"
                        type="tel"
                        {...field}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>Non editable field</FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>LinkedIn URL</Label>
              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Enter your LinkedIn URL"
                        type="url"
                        {...field}
                      />
                    </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
