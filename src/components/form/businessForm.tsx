import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Image from 'next/image';

import ProfilePictureUpload from '../fileUpload/profilePicture';

import LiveCaptureField from './register/livecapture';

import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { axiosInstance } from '@/lib/axiosinstance';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  // FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Type } from '@/utils/enum';
import { Separator } from '@/components/ui/separator';
import { kycBadgeColors } from '@/utils/freelancer/enum';

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
  linkedIn: z
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
  aadharOrGovtId: z.string().optional(),
  frontImageUrl: z
    .union([
      // Ensure File is only validated on the client-side
      typeof window !== 'undefined' ? z.instanceof(File) : z.unknown(),
      z.string().url(),
      z.null(),
    ])
    .optional(),

  backImageUrl: z
    .union([
      typeof window !== 'undefined' ? z.instanceof(File) : z.unknown(),
      z.string().url(),
      z.null(),
    ])
    .optional(),

  liveCaptureUrl: z
    .union([
      typeof window !== 'undefined' ? z.instanceof(File) : z.unknown(),
      z.string().url(),
      z.null(),
    ])
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function BusinessForm({ user_id }: { user_id: string }) {
  const [user, setUser] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [kycStatus, setKycStatus] = useState<string>('PENDING');

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
      aadharOrGovtId: '',
      frontImageUrl: '',
      backImageUrl: '',
      liveCaptureUrl: '',
    },
    mode: 'all',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/business`);
        setUser(response.data);
        if (response?.data?.kyc?.status) {
          setKycStatus(response?.data?.kyc?.status);
        }
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
      aadharOrGovtId: user?.kyc?.aadharOrGovtId || '',
      frontImageUrl: user?.kyc?.frontImageUrl || '',
      backImageUrl: user?.kyc?.backImageUrl || '',
      liveCaptureUrl: user?.kyc?.liveCaptureUrl || '',
    });
  }, [user, form]);

  async function onSubmit(data: ProfileFormValues) {
    setLoading(true);
    try {
      const uploadedUrls = {
        frontImageUrl: data.frontImageUrl,
        backImageUrl: data.backImageUrl,
        liveCaptureUrl: data.liveCaptureUrl,
      };
      // Append files to the form data
      if (data.frontImageUrl instanceof File) {
        const frontFormData = new FormData();
        frontFormData.append('frontImageUrl', data.frontImageUrl);

        const response = await axiosInstance.post(
          '/register/upload-image',
          frontFormData,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        uploadedUrls.frontImageUrl = response.data.data.Location;
      }
      if (data.backImageUrl instanceof File) {
        const backFormData = new FormData();
        backFormData.append('backImageUrl', data.backImageUrl);

        const response = await axiosInstance.post(
          '/register/upload-image',
          backFormData,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        uploadedUrls.backImageUrl = response.data.data.Location;
      }
      if (data.liveCaptureUrl instanceof File) {
        const liveFormData = new FormData();
        liveFormData.append('liveCaptureUrl', data.liveCaptureUrl);
        const response = await axiosInstance.post(
          '/register/upload-image',
          liveFormData,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        uploadedUrls.liveCaptureUrl = response.data.data.Location;
      }

      const {
        aadharOrGovtId,
        frontImageUrl,
        backImageUrl,
        liveCaptureUrl,
        ...restData
      } = data;
      const kyc = {
        aadharOrGovtId,
        frontImageUrl: uploadedUrls.frontImageUrl,
        backImageUrl: uploadedUrls.backImageUrl,
        liveCaptureUrl: uploadedUrls.liveCaptureUrl,
        status: 'APPLIED',
      };

      await axiosInstance.put(`/business`, {
        ...restData,
        kyc,
      });

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
        aadharOrGovtId: data.aadharOrGovtId,
        frontImageUrl: data.frontImageUrl,
        backImageUrl: data.backImageUrl,
        liveCaptureUrl: data.liveCaptureUrl,
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
    } finally {
      setLoading(false); // Always reset loading state
    }
  }

  return (
    <Card className="p-10">
      <Form {...form}>
        <ProfilePictureUpload
          user_id={user._id}
          profile={user.profilePic}
          entityType={Type.BUSINESS}
        />
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
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
          <div className="grid grid-cols-2 gap-6">
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

          <div className="grid grid-cols-3 gap-6">
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

          <div className="grid grid-cols-2 gap-6">
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
          <Separator className="col-span-2" />
          <div>
            KYC Status{' '}
            <Badge
              className={`text-xs py-0.5 ${kycBadgeColors[kycStatus] || ' '}`}
            >
              {kycStatus.toLowerCase()}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="aadharOrGovtId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aadhar or Govt Id</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your Aadhar Id" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="frontImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Front Img</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        {field.value && typeof field.value === 'string' ? (
                          <>
                            <Image
                              src={field.value}
                              alt="Front Document"
                              width={128}
                              height={128}
                              className="rounded-md object-cover"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => field.onChange('')}
                              className="ml-auto"
                            >
                              Change Image
                            </Button>
                          </>
                        ) : (
                          <Input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                field.onChange(file);
                              }
                            }}
                            onBlur={field.onBlur}
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="backImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Back Img</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        {field.value && typeof field.value === 'string' ? (
                          <>
                            <Image
                              src={field.value}
                              alt="Back Document"
                              width={128}
                              height={128}
                              className="rounded-md object-cover"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => field.onChange('')}
                              className="ml-auto"
                            >
                              Change Image
                            </Button>
                          </>
                        ) : (
                          <Input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                field.onChange(file);
                              }
                            }}
                            onBlur={field.onBlur}
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <LiveCaptureField form={form} />
            </div>
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Save changes'}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
