'use client';
import React, { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Image from 'next/image';
import { Pencil, ChevronLeft, ChevronRight } from 'lucide-react';

import LiveCaptureField from './register/livecapture';

import { Card } from '@/components/ui/card';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
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
import { cn } from '@/lib/utils';
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@/components/ui/shadcn-io/dropzone';

// Badge color purely based on KYC status
const statusColors = (status: string) => {
  const s = (status || '').toUpperCase();
  if (s === 'APPROVED' || s === 'VERIFIED' || s === 'SUCCESS')
    return 'bg-green-500/10 text-green-600 hover:bg-green-500/20';
  if (s === 'REJECTED' || s === 'FAILED')
    return 'bg-red-500/10 text-red-600 hover:bg-red-500/20';
  // Pending-like statuses
  if (
    s === 'PENDING' ||
    s === 'APPLIED' ||
    s === 'IN_REVIEW' ||
    s === 'UNDER_REVIEW'
  )
    return 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20';
  return 'bg-muted text-muted-foreground hover:bg-muted/20';
};
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
  const [currentStep, setCurrentStep] = useState<number>(1);
  const submitIntentRef = useRef(false);
  // Local previews for Dropzones
  const [frontLocalPreview, setFrontLocalPreview] = useState<string>('');
  const [backLocalPreview, setBackLocalPreview] = useState<string>('');
  const [frontFiles, setFrontFiles] = useState<File[] | undefined>(undefined);
  const [backFiles, setBackFiles] = useState<File[] | undefined>(undefined);
  // Review previews (handle File -> object URL and revoke lifecycle)
  const [frontPreview, setFrontPreview] = useState<string>('');
  const [backPreview, setBackPreview] = useState<string>('');
  const [selfiePreview, setSelfiePreview] = useState<string>('');
  const frontUrlRef = useRef<string | null>(null);
  const backUrlRef = useRef<string | null>(null);
  const liveUrlRef = useRef<string | null>(null);
  // Stepper line positioning refs (to mirror freelancer form)
  const lineWrapRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const firstDotRef = useRef<HTMLDivElement | null>(null);
  const lastDotRef = useRef<HTMLDivElement | null>(null);

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
        notifyError('Failed to load KYC data. Please try again.', 'Error');
      }
    };
    fetchData();
  }, [user_id, reset]);

  // Keep review previews in sync with form values (and handle reset)
  useEffect(() => {
    const updatePreview = (
      val: any,
      set: (v: string) => void,
      ref: React.MutableRefObject<string | null>,
    ) => {
      if (ref.current) {
        URL.revokeObjectURL(ref.current);
        ref.current = null;
      }
      if (typeof val === 'string') {
        set(val);
      } else if (typeof File !== 'undefined' && val instanceof File) {
        const url = URL.createObjectURL(val);
        ref.current = url;
        set(url);
      } else {
        set('');
      }
    };

    // initial
    updatePreview(
      form.getValues('frontImageUrl'),
      setFrontPreview,
      frontUrlRef,
    );
    updatePreview(form.getValues('backImageUrl'), setBackPreview, backUrlRef);
    updatePreview(
      form.getValues('liveCaptureUrl'),
      setSelfiePreview,
      liveUrlRef,
    );

    const sub = form.watch((values: any, meta: any) => {
      if (!meta) return;
      if (meta.type === 'reset') {
        updatePreview(
          form.getValues('frontImageUrl'),
          setFrontPreview,
          frontUrlRef,
        );
        updatePreview(
          form.getValues('backImageUrl'),
          setBackPreview,
          backUrlRef,
        );
        updatePreview(
          form.getValues('liveCaptureUrl'),
          setSelfiePreview,
          liveUrlRef,
        );
        return;
      }
      if (meta.name === 'frontImageUrl') {
        updatePreview(values?.frontImageUrl, setFrontPreview, frontUrlRef);
      } else if (meta.name === 'backImageUrl') {
        updatePreview(values?.backImageUrl, setBackPreview, backUrlRef);
      } else if (meta.name === 'liveCaptureUrl') {
        updatePreview(values?.liveCaptureUrl, setSelfiePreview, liveUrlRef);
      }
    });
    return () => {
      if (sub && typeof sub.unsubscribe === 'function') sub.unsubscribe();
      if (frontUrlRef.current) {
        URL.revokeObjectURL(frontUrlRef.current);
        frontUrlRef.current = null;
      }
      if (backUrlRef.current) {
        URL.revokeObjectURL(backUrlRef.current);
        backUrlRef.current = null;
      }
      if (liveUrlRef.current) {
        URL.revokeObjectURL(liveUrlRef.current);
        liveUrlRef.current = null;
      }
    };
  }, [form]);

  // Position the vertical connector line between first and last dots (desktop sidebar)
  useEffect(() => {
    const wrap = lineWrapRef.current;
    const line = lineRef.current;
    const first = firstDotRef.current;
    const last = lastDotRef.current;
    if (!wrap || !line || !first || !last) return;

    const recalc = () => {
      const wrapRect = wrap.getBoundingClientRect();
      const firstRect = first.getBoundingClientRect();
      const lastRect = last.getBoundingClientRect();
      const top = firstRect.top - wrapRect.top + firstRect.height / 2;
      const bottom = lastRect.top - wrapRect.top + lastRect.height / 2;
      const height = Math.max(0, bottom - top);
      line.style.top = `${top}px`;
      line.style.height = `${height}px`;
    };

    recalc();
    window.addEventListener('resize', recalc);
    const t = setTimeout(recalc, 50);
    return () => {
      window.removeEventListener('resize', recalc);
      clearTimeout(t);
    };
  }, [currentStep]);

  const StepDot = ({ active, done }: { active: boolean; done: boolean }) => (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full border ${
        active
          ? 'bg-primary border-primary'
          : done
            ? 'bg-primary/60 border-primary/60'
            : 'bg-muted border-muted-foreground/40'
      }`}
    />
  );

  const uploadImage = async (file: File, fieldName: string) => {
    const formData = new FormData();
    formData.append(fieldName, file);
    const response = await axiosInstance.post(
      '/register/upload-image',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return response.data.data.Location;
  };

  async function onSubmit(data: KYCFormValues) {
    // Only allow submit on final step and when user clicked the submit button
    if (currentStep !== 3 || !submitIntentRef.current) return;
    submitIntentRef.current = false;
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
        payload.kyc.frontImageUrl = await uploadImage(
          data.frontImageUrl,
          'frontImageUrl',
        );
      }
      if (data.backImageUrl instanceof File) {
        payload.kyc.backImageUrl = await uploadImage(
          data.backImageUrl,
          'backImageUrl',
        );
      }
      if (data.liveCaptureUrl instanceof File) {
        payload.kyc.liveCaptureUrl = await uploadImage(
          data.liveCaptureUrl,
          'liveCaptureUrl',
        );
      }

      await axiosInstance.put(`/business/kyc`, payload);
      setKycStatus('APPLIED');

      notifySuccess('Your KYC has been successfully updated.', 'KYC Updated');
    } catch (error) {
      console.error('API Error:', error);
      notifyError('Failed to update KYC. Please try again later.', 'Error');
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    { id: 1, title: 'Business Info', subtitle: 'Enter details and upload' },
    { id: 2, title: 'Selfie', subtitle: 'Capture or upload' },
    { id: 3, title: 'Review', subtitle: 'Confirm and submit' },
  ] as const;

  const step1Complete = () => {
    const v1 = form.getValues('frontImageUrl');
    const v2 = form.getValues('backImageUrl');
    return (
      !!(
        (typeof v1 === 'string' && v1) ||
        (typeof File !== 'undefined' && v1 instanceof File)
      ) &&
      !!(
        (typeof v2 === 'string' && v2) ||
        (typeof File !== 'undefined' && v2 instanceof File)
      )
    );
  };

  return (
    <Card className="p-6 md:p-8 shadow-lg relative rounded-xl w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">
            Business KYC Verification
          </h2>
          <p className="text-sm text-muted-foreground">
            Provide your business details and documents
          </p>
        </div>
        <Badge
          className={cn(
            'text-xs md:text-sm font-medium border-0 capitalize',
            statusColors(kycStatus),
          )}
        >
          {kycStatus.toLowerCase()}
        </Badge>
      </div>
      <Separator className="my-4 md:my-6" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Mobile Horizontal Stepper */}
        <div className="md:hidden col-span-full -mt-1">
          <div className="flex items-center gap-2">
            {steps.map((s, idx) => {
              const active = currentStep === s.id;
              const done = currentStep > s.id;
              return (
                <React.Fragment key={s.id}>
                  {idx > 0 && (
                    <div
                      className={`flex-1 h-px ${done ? 'bg-primary/60' : 'bg-muted-foreground/20'}`}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setCurrentStep(s.id)}
                    aria-current={active ? 'step' : undefined}
                    className={`h-6 w-6 shrink-0 rounded-full border flex items-center justify-center transition ${
                      active
                        ? 'bg-primary border-primary'
                        : done
                          ? 'bg-primary/60 border-primary/60'
                          : 'bg-muted border-muted-foreground/40'
                    }`}
                    title={s.title}
                  >
                    <span className="sr-only">{s.title}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
          <div className="mt-2 grid grid-cols-3 text-[10px] text-muted-foreground">
            {steps.map((s) => (
              <p key={s.id} className="text-center truncate">
                {s.title}
              </p>
            ))}
          </div>
        </div>

        {/* Sidebar Stepper */}
        <aside className="hidden md:block md:col-span-4 lg:col-span-3 relative">
          <div ref={lineWrapRef} className="relative pe-6">
            <div
              ref={lineRef}
              className="pointer-events-none absolute right-6 w-px bg-muted-foreground/20"
            />
            <ol className="space-y-6">
              {steps.map((s, idx) => {
                const active = currentStep === s.id;
                const done = currentStep > s.id;
                return (
                  <li key={s.id} className="relative group">
                    <div
                      className="absolute -right-[5px] top-2.5"
                      ref={
                        idx === 0
                          ? firstDotRef
                          : idx === steps.length - 1
                            ? lastDotRef
                            : undefined
                      }
                    >
                      <StepDot active={active} done={done} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(s.id)}
                      aria-current={active ? 'step' : undefined}
                      className={`w-full rounded-md px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                        active
                          ? 'bg-primary/10 text-foreground'
                          : 'hover:bg-muted/40'
                      }`}
                    >
                      <p className="text-sm md:text-base font-semibold leading-tight">
                        {s.title}
                      </p>
                      <p className="text-xs text-muted-foreground leading-tight">
                        {s.subtitle}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>

        {/* Main Content */}
        <section className="md:col-span-8 lg:col-span-9">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && currentStep < 3) e.preventDefault();
              }}
              className="space-y-6"
            >
              {/* Step Header */}
              <div>
                <p className="text-xs text-muted-foreground">
                  Step {currentStep}/3
                </p>
                <h3 className="text-xl md:text-2xl font-semibold mt-1">
                  {steps[currentStep - 1].title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {steps[currentStep - 1].subtitle}
                </p>
              </div>
              {currentStep === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="businessProof"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Proof</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your business registration number"
                            {...field}
                          />
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
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="frontImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Front Image</FormLabel>
                          <FormControl>
                            <div className="flex flex-col items-center gap-4 w-full">
                              {field.value &&
                              typeof field.value === 'string' ? (
                                <div className="relative">
                                  <Image
                                    src={field.value}
                                    alt="Front Document"
                                    width={260}
                                    height={160}
                                    className="rounded-lg object-contain border shadow-sm"
                                  />
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="secondary"
                                    className="absolute top-2 right-2 rounded-full shadow"
                                    onClick={() => {
                                      field.onChange(null);
                                      setFrontLocalPreview('');
                                      setFrontFiles(undefined);
                                    }}
                                    aria-label="Change front image"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Dropzone
                                  maxSize={5 * 1024 * 1024}
                                  minSize={1}
                                  maxFiles={1}
                                  accept={{
                                    'image/*': ['.png', '.jpg', '.jpeg'],
                                  }}
                                  src={frontFiles}
                                  onDrop={async (accepted) => {
                                    const file = accepted?.[0];
                                    if (file) {
                                      field.onChange(file);
                                      setFrontFiles(accepted);
                                      const reader = new FileReader();
                                      reader.onload = (e) => {
                                        if (
                                          typeof e.target?.result === 'string'
                                        ) {
                                          setFrontLocalPreview(e.target.result);
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    } else {
                                      setFrontFiles(undefined);
                                      setFrontLocalPreview('');
                                    }
                                  }}
                                  onError={() => {}}
                                  className="w-full"
                                >
                                  <DropzoneEmptyState />
                                  <DropzoneContent>
                                    {frontLocalPreview && (
                                      <div className="h-[102px] w-full relative">
                                        <Image
                                          alt="Preview"
                                          className="absolute top-0 left-0 h-full w-full object-cover"
                                          src={frontLocalPreview}
                                          width={260}
                                          height={260}
                                        />
                                      </div>
                                    )}
                                  </DropzoneContent>
                                </Dropzone>
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
                            <div className="flex flex-col items-center gap-4 w-full">
                              {field.value &&
                              typeof field.value === 'string' ? (
                                <div className="relative">
                                  <Image
                                    src={field.value}
                                    alt="Back Document"
                                    width={260}
                                    height={160}
                                    className="rounded-lg object-contain border shadow-sm"
                                  />
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="secondary"
                                    className="absolute top-2 right-2 rounded-full shadow"
                                    onClick={() => {
                                      field.onChange(null);
                                      setBackLocalPreview('');
                                      setBackFiles(undefined);
                                    }}
                                    aria-label="Change back image"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Dropzone
                                  maxSize={5 * 1024 * 1024}
                                  minSize={1}
                                  maxFiles={1}
                                  accept={{
                                    'image/*': ['.png', '.jpg', '.jpeg'],
                                  }}
                                  src={backFiles}
                                  onDrop={async (accepted) => {
                                    const file = accepted?.[0];
                                    if (file) {
                                      field.onChange(file);
                                      setBackFiles(accepted);
                                      const reader = new FileReader();
                                      reader.onload = (e) => {
                                        if (
                                          typeof e.target?.result === 'string'
                                        ) {
                                          setBackLocalPreview(e.target.result);
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    } else {
                                      setBackFiles(undefined);
                                      setBackLocalPreview('');
                                    }
                                  }}
                                  onError={() => {}}
                                  className="w-full"
                                >
                                  <DropzoneEmptyState />
                                  <DropzoneContent>
                                    {backLocalPreview && (
                                      <div className="h-[102px] w-full relative">
                                        <Image
                                          alt="Preview"
                                          className="absolute top-0 left-0 h-full w-full object-cover"
                                          src={backLocalPreview}
                                          width={260}
                                          height={260}
                                        />
                                      </div>
                                    )}
                                  </DropzoneContent>
                                </Dropzone>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">
                      Selfie prerequisites
                    </p>
                    <ul className="list-disc ms-4 space-y-1">
                      <li>
                        Allow camera permission or be ready to upload a clear
                        selfie.
                      </li>
                      <li>Use good lighting and face the camera.</li>
                      <li>Ensure your face is centered and fully visible.</li>
                    </ul>
                  </div>
                  <LiveCaptureField form={form} />
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">Business Proof</p>
                      <p className="font-medium break-words">
                        {form.getValues('businessProof') || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Business Profit</p>
                      <p className="font-medium">
                        {form.getValues('businessProfit') || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    <div>
                      <p className="text-muted-foreground mb-2">Front Image</p>
                      {frontPreview ? (
                        <Image
                          src={frontPreview}
                          alt="Front Document"
                          width={280}
                          height={180}
                          className="rounded-lg object-contain border shadow-sm"
                        />
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          No front image
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-2">Back Image</p>
                      {backPreview ? (
                        <Image
                          src={backPreview}
                          alt="Back Document"
                          width={280}
                          height={180}
                          className="rounded-lg object-contain border shadow-sm"
                        />
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          No back image
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Selfie</p>
                      {selfiePreview ? (
                        <div className="mt-1 inline-block border rounded-lg">
                          <Image
                            src={selfiePreview}
                            alt="Selfie"
                            width={180}
                            height={180}
                            className="rounded-md object-cover"
                          />
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          No selfie provided
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Please confirm that the details and images are correct
                    before submitting.
                  </p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                  disabled={currentStep === 1 || loading}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={() => setCurrentStep((s) => Math.min(3, s + 1))}
                    disabled={
                      loading || (currentStep === 1 && !step1Complete())
                    }
                  >
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading}
                    onClick={() => {
                      submitIntentRef.current = true;
                    }}
                  >
                    {loading ? 'Submitting...' : 'Submit KYC'}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </section>
      </div>
    </Card>
  );
}
