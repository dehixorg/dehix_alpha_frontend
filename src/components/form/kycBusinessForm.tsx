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
import { Separator } from '@/components/ui/separator';
import { kycBadgeColors } from '@/utils/freelancer/enum';

const kycFormSchema = z.object({
  businessProof: z.string().optional(),
  businessProfit: z.coerce.number().optional(), // Coerces input string to a number
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
  const [loading, setLoading] = useState<boolean>(false);
  const [kycStatus, setKycStatus] = useState<string>('PENDING');

  const form = useForm<KYCFormValues>({
    resolver: zodResolver(kycFormSchema),
    defaultValues: {
      businessProof: '',
      businessProfit: 0,
      frontImageUrl: null,
      backImageUrl: null,
      liveCaptureUrl: null,
    },
    mode: 'onBlur',
  });

  const { reset } = form;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/business/${user_id}`);
        const kycData = response.data?.kyc;
        setKycStatus(kycData?.status || 'PENDING');
        reset({
          businessProof: kycData?.businessProof || '',
          businessProfit: kycData?.businessProfit || 0,
          frontImageUrl: kycData?.frontImageUrl || null,
          backImageUrl: kycData?.backImageUrl || null,
          liveCaptureUrl: kycData?.liveCaptureUrl || null,
        });
      } catch (error) {
        console.error('API Error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load KYC data. Please try again.',
        });
      }
    };
    fetchData();
  }, [user_id, reset]);

  const uploadImage = async (file: File, fieldName: string) => {
    const formData = new FormData();
    formData.append(fieldName, file);
    const response = await axiosInstance.post('/register/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.Location;
  };

  async function onSubmit(data: KYCFormValues) {
    setLoading(true);
    try {
      // The API expects a `userId` field at the root level of the body,
      // and the KYC details nested under a `kyc` key.
      const payload = {
        userId: user_id, // Pass the userId here
        kyc: {
          businessProof: data.businessProof,
          businessProfit: data.businessProfit,
          frontImageUrl: data.frontImageUrl,
          backImageUrl: data.backImageUrl,
          liveCaptureUrl: data.liveCaptureUrl,
          status: 'PENDING',
        },
      };

      if (data.frontImageUrl instanceof File) {
        payload.kyc.frontImageUrl = await uploadImage(data.frontImageUrl, 'frontImageUrl');
      }
      if (data.backImageUrl instanceof File) {
        payload.kyc.backImageUrl = await uploadImage(data.backImageUrl, 'backImageUrl');
      }
      if (data.liveCaptureUrl instanceof File) {
        payload.kyc.liveCaptureUrl = await uploadImage(data.liveCaptureUrl, 'liveCaptureUrl');
      }
      console.log(payload)
      await axiosInstance.put(`/business/kyc`, payload);
      setKycStatus('APPLIED');

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
    <Card className="p-8 md:p-12 shadow-lg relative rounded-xl w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Business KYC Verification</h2>
        <Badge
          className={`text-sm px-3 py-1 font-semibold capitalize ${kycBadgeColors[kycStatus] || ''}`}
        >
          {kycStatus.toLowerCase()}
        </Badge>
      </div>
      <Separator className="my-6" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="businessProof"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Proof</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your business registration number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* New Field for Business Profit */}
          <FormField
            control={form.control}
            name="businessProfit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Profit</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your annual business profit"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="frontImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Front Image</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center gap-4">
                      {field.value && typeof field.value === 'string' ? (
                        <>
                          <Image
                            src={field.value}
                            alt="Front Document"
                            width={200}
                            height={150}
                            className="rounded-lg object-contain border shadow-sm"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange(null)}
                            className="w-full"
                          >
                            Change Image
                          </Button>
                        </>
                      ) : (
                        <div className="w-full">
                          <Input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) field.onChange(file);
                            }}
                            onBlur={field.onBlur}
                            className="cursor-pointer"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            (PNG, JPG, JPEG)
                          </p>
                        </div>
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
                <FormItem>
                  <FormLabel>Document Back Image</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center gap-4">
                      {field.value && typeof field.value === 'string' ? (
                        <>
                          <Image
                            src={field.value}
                            alt="Back Document"
                            width={200}
                            height={150}
                            className="rounded-lg object-contain border shadow-sm"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange(null)}
                            className="w-full"
                          >
                            Change Image
                          </Button>
                        </>
                      ) : (
                        <div className="w-full">
                          <Input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) field.onChange(file);
                            }}
                            onBlur={field.onBlur}
                            className="cursor-pointer"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            (PNG, JPG, JPEG)
                          </p>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LiveCaptureField form={form} />
          </div>

          <div className="col-span-1 md:col-span-2 mt-8">
            <Button
              type="submit"
              className="w-full rounded-md px-6 py-3 text-base font-semibold"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Save KYC'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}