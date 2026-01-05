'use client';
import React, { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  DollarSign,
} from 'lucide-react';

import LiveCaptureField from './register/livecapture';
import KYCDetailsView from './KYCDetailsView';

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
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { cn } from '@/lib/utils';
import ImageUploader from '@/components/fileUpload/ImageUploader';
import KycStatusAlert from '@/components/shared/KycStatusAlert';

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

// Helper function to transform form data for KYCDetailsView
const transformKYCDataForView = (formValues: KYCFormValues) => {
  return {
    businessProof: formValues.businessProof,
    businessProfit: formValues.businessProfit,
    frontImageUrl:
      typeof formValues.frontImageUrl === 'string'
        ? formValues.frontImageUrl
        : undefined,
    backImageUrl:
      typeof formValues.backImageUrl === 'string'
        ? formValues.backImageUrl
        : undefined,
    liveCaptureUrl:
      typeof formValues.liveCaptureUrl === 'string'
        ? formValues.liveCaptureUrl
        : undefined,
  };
};

export function KYCForm({ user_id }: { user_id: string }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [kycStatus, setKycStatus] = useState<string>('PENDING');
  const [rejectionReason, setRejectionReason] = useState<string | undefined>(
    undefined,
  );
  const [currentStep, setCurrentStep] = useState<number>(1);
  const submitIntentRef = useRef(false);
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

  const fetchData = React.useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/business/${user_id}`);
      const kycData = response.data?.kyc;
      setKycStatus(kycData?.status || 'PENDING');
      setRejectionReason(kycData?.rejectionReason);
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
  }, [user_id, reset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
  }, [form, kycStatus]);

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
          status: 'APPLIED',
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

      // Wait for a short period to allow backend to process the update
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await fetchData();

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

  const hasFileOrUrl = (v: unknown) =>
    !!(
      (typeof v === 'string' && v.trim() !== '') ||
      (typeof File !== 'undefined' && v instanceof File)
    );

  const step1Complete = () => {
    const v = form.getValues();
    return (
      (v.businessProof?.trim()?.length || 0) > 0 &&
      Number(v.businessProfit) > 0 &&
      hasFileOrUrl(v.frontImageUrl) &&
      hasFileOrUrl(v.backImageUrl)
    );
  };

  const step2Complete = () => {
    const v = form.getValues();
    return hasFileOrUrl(v.liveCaptureUrl);
  };

  const allComplete = () => step1Complete() && step2Complete();

  const handleNext = () => {
    if (currentStep === 1 && !step1Complete()) {
      const v = form.getValues();
      if (!v.businessProof?.trim())
        form.setError('businessProof' as any, { message: 'Required' } as any);
      if (!v.businessProfit || Number(v.businessProfit) <= 0)
        form.setError('businessProfit' as any, { message: 'Required' } as any);
      if (!hasFileOrUrl(v.frontImageUrl))
        form.setError('frontImageUrl' as any, { message: 'Required' } as any);
      if (!hasFileOrUrl(v.backImageUrl))
        form.setError('backImageUrl' as any, { message: 'Required' } as any);
      return;
    }
    if (currentStep === 2 && !step2Complete()) {
      form.setError('liveCaptureUrl' as any, { message: 'Required' } as any);
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, steps.length));
  };
  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const READ_ONLY_STATUSES = [
    'APPLIED',
    'VERIFIED',
    'APPROVED',
    'SUCCESS',
    'IN_REVIEW',
    'UNDER_REVIEW',
  ];
  const isReadOnly = READ_ONLY_STATUSES.includes(
    (kycStatus || '').toUpperCase(),
  );

  // Badge color purely based on KYC status
  const statusColors = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED' || s === 'VERIFIED' || s === 'SUCCESS')
      return 'bg-green-500/10 text-green-600 hover:bg-green-500/20';
    if (s === 'REJECTED' || s === 'FAILED')
      return 'bg-red-500/10 text-red-600 hover:bg-red-500/20';
    if (s === 'APPLIED' || s === 'IN_REVIEW' || s === 'UNDER_REVIEW')
      return 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20';
    // Pending-like statuses
    if (s === 'PENDING')
      return 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20';
    return 'bg-muted text-muted-foreground hover:bg-muted/20';
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
            'text-xs md:text-sm font-medium border-0 capitalize hover:bg-primary/60',
            statusColors(kycStatus),
          )}
        >
          {kycStatus.toLowerCase()}
        </Badge>
      </div>
      <KycStatusAlert status={kycStatus} rejectionReason={rejectionReason} />

      {isReadOnly ? (
        <KYCDetailsView kycData={transformKYCDataForView(form.getValues())} />
      ) : (
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
                            <InputGroup>
                              <InputGroupText>
                                <BadgeCheck className="h-4 w-4" />
                              </InputGroupText>
                              <InputGroupInput
                                placeholder="Enter your business registration number"
                                {...field}
                              />
                            </InputGroup>
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
                            <InputGroup>
                              <InputGroupText>
                                <DollarSign className="h-4 w-4" />
                              </InputGroupText>
                              <InputGroupInput
                                placeholder="Enter your annual business profit"
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                              <InputGroupText>YEARLY</InputGroupText>
                            </InputGroup>
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
                            <FormControl>
                              <ImageUploader
                                label="Document Front Image"
                                value={field.value as File | string | null}
                                onChange={field.onChange}
                                accept={{
                                  'image/*': ['.png', '.jpg', '.jpeg'],
                                }}
                                maxSize={5 * 1024 * 1024}
                                previewHeight={160}
                              />
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
                            <FormControl>
                              <ImageUploader
                                label="Document Back Image"
                                value={field.value as File | string | null}
                                onChange={field.onChange}
                                accept={{
                                  'image/*': ['.png', '.jpg', '.jpeg'],
                                }}
                                maxSize={5 * 1024 * 1024}
                                previewHeight={160}
                              />
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
                        <p className="text-muted-foreground mb-2">
                          Front Image
                        </p>
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
                    onClick={handleBack}
                    disabled={currentStep === 1 || loading}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  {currentStep < steps.length ? (
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={handleNext}
                      disabled={
                        loading ||
                        (currentStep === 1 && !step1Complete()) ||
                        (currentStep === 2 && !step2Complete()) ||
                        isReadOnly
                      }
                      variant="default"
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={loading || !allComplete() || isReadOnly}
                      onClick={() => {
                        // Mark explicit intent to submit via button click
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
      )}
    </Card>
  );
}
