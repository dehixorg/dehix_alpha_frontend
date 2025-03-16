import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Image from 'next/image';

import LiveCaptureField from './register/livecapture';

import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
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
import { kycBadgeColors } from '@/utils/freelancer/enum';

const kycFormSchema = z.object({
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

type KYCFormValues = z.infer<typeof kycFormSchema>;

export function KYCForm({ user_id }: { user_id: string }) {
  const [user, setUser] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [kycStatus, setKycStatus] = useState<string>('PENDING');

  const form = useForm<KYCFormValues>({
    resolver: zodResolver(kycFormSchema),
    defaultValues: {
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
        const response = await axiosInstance.get(`/business/${user_id}`);

        setUser(response.data);
        if (response?.data?.kyc?.status) {
          setKycStatus(response?.data?.kyc?.status);
        }
      } catch (error) {
        console.error('API Error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong. Please try again.',
        });
      }
    };
    fetchData();
  }, [user_id]);

  useEffect(() => {
    form.reset({
      aadharOrGovtId: user?.kyc?.aadharOrGovtId || '',
      frontImageUrl: user?.kyc?.frontImageUrl || '',
      backImageUrl: user?.kyc?.backImageUrl || '',
      liveCaptureUrl: user?.kyc?.liveCaptureUrl || '',
    });
  }, [user, form]);

  async function onSubmit(data: KYCFormValues) {
    setLoading(true);
    try {
      const uploadedUrls = {
        frontImageUrl: data.frontImageUrl,
        backImageUrl: data.backImageUrl,
        liveCaptureUrl: data.liveCaptureUrl,
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
        uploadedUrls.liveCaptureUrl = response.data.data.Location;
      }

      const kyc = {
        aadharOrGovtId: data.aadharOrGovtId,
        frontImageUrl: uploadedUrls.frontImageUrl,
        backImageUrl: uploadedUrls.backImageUrl,
        liveCaptureUrl: uploadedUrls.liveCaptureUrl,
        status: 'APPLIED',
      };

      await axiosInstance.put(`/business/kyc`, {
        ...user,
        kyc,
      });

      setUser({
        ...user,
        kyc,
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
    <Card className="p-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            {loading ? 'Loading...' : 'Save KYC'}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
