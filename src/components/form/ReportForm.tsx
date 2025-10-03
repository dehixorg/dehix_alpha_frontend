import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import Image from 'next/image';
import { useSelector } from 'react-redux';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { apiHelperService } from '@/services/report';
import { apiHelperService as profileService } from '@/services/profilepic';
import { RootState } from '@/lib/store';

const reportSchema = z.object({
  subject: z.string().min(3, { message: 'Subject is required' }),
  description: z
    .string()
    .min(10, { message: 'Description must be more detailed' }),
  report_role: z.string().min(1, { message: 'Report role is required' }),
  report_type: z.string().min(1, { message: 'Report type is required' }),
  reportedId: z.string().min(1, { message: 'Reported ID is required' }),
  status: z.string().optional(),
  reportedById: z.string().optional(),
  imageMeta: z
    .array(
      z.object({
        Location: z.string(),
        Key: z.string(),
        Bucket: z.string(),
      }),
    )
    .optional(),
});

export type ReportFormValues = z.infer<typeof reportSchema>;

export function ReportForm({
  initialData,
  onSubmitted,
}: {
  initialData: ReportFormValues;
  onSubmitted?: () => boolean;
}) {
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: initialData,
  });
  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const [fileError, setFileError] = useState<string | null>(null);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useSelector((state: RootState) => state.user);
  const { toast } = useToast();

  const onSubmit = async (data: ReportFormValues) => {
    try {
      setIsSubmitting(true);

      const imageMetaArray = [];

      for (const file of imageFiles.slice(0, 3)) {
        const response = await profileService.uploadProfilePicture(file);
        imageMetaArray.push(response.data.data);
      }

      const finalPayload = {
        ...data,
        reportedById: user?.uid,
        status: 'OPEN',
        ...(imageMetaArray.length > 0 && { imageMeta: imageMetaArray }),
      };

      await apiHelperService.createReport(finalPayload);
      // Show success toast
      toast({
        title: 'Report Submitted Successfully',
        description:
          'Thank you for your report. We will review it and take appropriate action.',
        variant: 'default',
      });
      // Call the onSubmitted callback to close dialog
      if (onSubmitted) {
        onSubmitted();
      }
    } catch (error) {
      console.error('Failed to submit report:', error);

      // Show error toast
      toast({
        title: 'Failed to Submit Report',
        description:
          'There was an error submitting your report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border-none shadow-none p-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* 🧾 Subject, Report Type & Role in One Row */}
          <div className="flex flex-wrap gap-4">
            {/* Subject - 50% */}
            <div className="flex-[2] min-w-[200px]">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <Label>Subject</Label>
                    <FormControl>
                      <Input
                        className="h-9"
                        placeholder="Issue subject"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Report Type - 25% */}
            <div className="flex-1 min-w-[150px]">
              <FormField
                control={form.control}
                name="report_type"
                render={({ field }) => (
                  <FormItem>
                    <Label>Report Type</Label>
                    <Select
                      defaultValue={field.value}
                      onValueChange={() => {}}
                      disabled
                    >
                      <FormControl>
                        {/* CHANGE 1: Replaced `bg-gray-100` with `bg-muted` for disabled inputs */}
                        <SelectTrigger className="bg-muted cursor-not-allowed h-9">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={field.value}>
                          {field.value}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Report Role - 25% */}
            <div className="flex-1 min-w-[150px]">
              <FormField
                control={form.control}
                name="report_role"
                render={({ field }) => (
                  <FormItem>
                    <Label>Role</Label>
                    <Select
                      defaultValue={field.value}
                      onValueChange={() => {}}
                      disabled
                    >
                      <FormControl>
                        {/* CHANGE 1 (repeated): Replaced `bg-gray-100` with `bg-muted` */}
                        <SelectTrigger className="bg-muted cursor-not-allowed h-9">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={field.value}>
                          {field.value}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* 📄 Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <Label>Description</Label>
                <FormControl>
                  <Textarea
                    className="min-h-[80px]"
                    placeholder="Describe the issue in detail..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 🔒 Hidden reportedId */}
          <FormField
            control={form.control}
            name="reportedId"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="hidden" readOnly {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* 🖼 Image Upload */}
          <FormItem>
            <Label>Upload Screenshots (up to 3)</Label>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = e.target.files
                    ? Array.from(e.target.files)
                    : [];
                  if (files.length > 3) {
                    setFileError('You can only upload up to 3 images.');
                    setImageFiles([]);
                  } else {
                    setFileError(null);
                    setImageFiles(files);
                  }
                }}
              />
            </FormControl>

            {/* 🔴 File error message */}
            {fileError && (
              // CHANGE 2: Used `text-destructive` for error messages.
              <p className="text-sm text-destructive mt-1">{fileError}</p>
            )}

            {/* 🖼 Image Preview with Delete and View */}
            {/* 🖼 Image Preview with Delete and View */}
            {imageFiles.length > 0 && (
              <div className="mt-3 flex gap-4 flex-wrap">
                {imageFiles.map((file, idx) => {
                  const imageUrl = URL.createObjectURL(file);
                  return (
                    <div
                      key={idx}
                      className="relative w-24 h-24 border rounded-md overflow-hidden group"
                    >
                      <a
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {/* ✅ FIX: Added the `fill` prop and removed `className` */}
                        <Image
                          src={imageUrl}
                          alt={`screenshot-${idx}`}
                          fill
                          sizes="96px" // Tells browser the image is 96px wide
                          className="object-cover" // Keep object-cover for correct scaling
                        />
                      </a>

                      {/* ❌ Cancel Button (no changes here) */}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-background rounded-full p-1 text-destructive hover:bg-accent transition"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <FormDescription>
              Attach up to 3 optional screenshots of the issue.
            </FormDescription>
          </FormItem>

          {/* 🚀 Submit Button */}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
