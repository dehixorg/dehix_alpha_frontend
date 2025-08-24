import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Image from 'next/image';

import { Card } from '../ui/card';

import LiveCaptureField from './register/livecapture';

import { axiosInstance } from '@/lib/axiosinstance';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { kycBadgeColors } from '@/utils/freelancer/enum';

const profileFormSchema = z.object({
  aadharOrGovtId: z.string().optional(),
  frontImageUrl: z
    .union([
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

export default function KYCForm({ user_id }: { user_id: string }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [kycStatus, setKycStatus] = useState<string>('PENDING');
  const [user, setUser] = useState<any>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      aadharOrGovtId: '',
      frontImageUrl: null,
      backImageUrl: null,
      liveCaptureUrl: null,
    },
    mode: 'all',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axiosInstance.get(`/freelancer/${user_id}`);
        setUser(userResponse.data.data);
        setKycStatus(userResponse?.data?.data?.kyc?.status);

        form.reset({
          aadharOrGovtId: userResponse.data.data.kyc?.aadharOrGovtId || '',
          frontImageUrl: userResponse.data.data.kyc?.frontImageUrl || null,
          backImageUrl: userResponse.data.data.kyc?.backImageUrl || null,
          liveCaptureUrl: userResponse.data.data.kyc?.liveCapture || null,
        });
      } catch (error) {
        console.error('API Error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong.Please try again.',
        });
      }
    };

    fetchData();
  }, [user_id, form]);

  useEffect(() => {
    form.reset({
      aadharOrGovtId: user?.kyc?.aadharOrGovtId || '',
      frontImageUrl: user?.kyc?.frontImageUrl || null,
      backImageUrl: user?.kyc?.backImageUrl || null,
      liveCaptureUrl: user?.kyc?.liveCaptureUrl || null,
    });
  }, [user, form]);

  async function onSubmit(data: ProfileFormValues) {
    setLoading(true);
    try {
      const uploadedUrls = {
        frontImageUrl: data.frontImageUrl,
        backImageUrl: data.backImageUrl,
        liveCapture: data.liveCaptureUrl,
      };

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
        uploadedUrls.liveCapture = response.data.data.Location;
      }

      const kyc = {
        aadharOrGovtId: data.aadharOrGovtId,
        frontImageUrl: uploadedUrls.frontImageUrl,
        backImageUrl: uploadedUrls.backImageUrl,
        liveCapture: uploadedUrls.liveCapture,
        status: 'APPLIED',
      };

      await axiosInstance.put(`/freelancer/kyc`, kyc);

      setUser({
        ...user,
        kyc: {
          ...user?.kyc,
          aadharOrGovtId: data.aadharOrGovtId,
          frontImageUrl: uploadedUrls.frontImageUrl,
          backImageUrl: uploadedUrls.backImageUrl,
          liveCaptureUrl: uploadedUrls.liveCapture,
        },
      });

      toast({
        title: 'KYC Updated',
        description: 'Your KYC has been successfully updated.',
      });
    } catch (error) {
      console.error('API Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update KYC. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-10 shadow-lg relative rounded-2xl w-full max-w-7xl min-h-[80vh] mx-auto">
      <Form {...form}>
        <div className="flex flex-col mb-4 sm:mb-6 text-center sm:text-left">
          <div className="text-sm sm:text-base font-medium">
            KYC Status{' '}
            <Badge
              className={`text-xs py-0.5 ${kycBadgeColors[kycStatus] || ''}`}
            >
              {kycStatus.toLowerCase()}
            </Badge>
          </div>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-2"
        >
          <Separator className="col-span-1 md:col-span-2" />

          <FormField
            control={form.control}
            name="aadharOrGovtId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="font-semibold text-sm sm:text-base">
                  Aadhar or Govt Id
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your Aadhar Id"
                    {...field}
                    className="w-2/3 border rounded-md px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frontImageUrl"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="font-semibold text-sm sm:text-base">
                  Document Front Img
                </FormLabel>
                <FormControl>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                    {field.value && typeof field.value === 'string' ? (
                      <>
                        <Image
                          src={field.value}
                          alt="Front Document"
                          width={250}
                          height={250}
                          className="rounded-lg object-contain border shadow-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => field.onChange('')}
                        >
                          Change Image
                        </Button>
                      </>
                    ) : (
                      <Input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) field.onChange(file);
                        }}
                        onBlur={field.onBlur}
                        className="w-full border rounded-md px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="backImageUrl"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="font-semibold text-sm sm:text-base">
                  Document Back Img
                </FormLabel>
                <FormControl>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                    {field.value && typeof field.value === 'string' ? (
                      <>
                        <Image
                          src={field.value}
                          alt="Back Document"
                          width={250}
                          height={250}
                          className="rounded-lg object-contain border shadow-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => field.onChange('')}
                        >
                          Change Image
                        </Button>
                      </>
                    ) : (
                      <Input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) field.onChange(file);
                        }}
                        onBlur={field.onBlur}
                        className="w-full border rounded-md px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormLabel className="font-semibold text-sm sm:text-base">
            {/* Document Front Img */}
            <LiveCaptureField form={form} />
          </FormLabel>

          <Separator className="col-span-1 md:col-span-2" />

          <div className="col-span-1 md:col-span-2">
            <Button
              type="submit"
              className="w-full rounded-md px-6 py-3 text-sm font-semibold disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Update KYC'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
