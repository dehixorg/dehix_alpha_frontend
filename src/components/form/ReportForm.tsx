import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquareText } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { apiHelperService } from '@/services/report';
import { RootState } from '@/lib/store';
import ImageUploader from '@/components/fileUpload/ImageUploader';
import { notifyError } from '@/utils/toastMessage';

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
  onSubmitted?: () => boolean | Promise<boolean>;
}) {
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: initialData,
  });
  const [image1, setImage1] = useState<File | string | null>(null);
  const [image2, setImage2] = useState<File | string | null>(null);
  const [image3, setImage3] = useState<File | string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedUploads, setFailedUploads] = useState<
    { index: number; name: string; error: string }[]
  >([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const user = useSelector((state: RootState) => state.user);

  const onSubmit = async (data: ReportFormValues) => {
    try {
      setSubmitError(null);
      setIsSubmitting(true);

      const imageMetaArray = [];
      const images = [image1, image2, image3].filter(
        (img) => img && img instanceof File,
      ) as File[];
      const failed: { index: number; name: string; error: string }[] = [];

      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          try {
            const response = await apiHelperService.uploadReportImage(file);
            if (response?.data?.data) {
              const imageData = response.data.data;
              if (imageData.Location && imageData.Key && imageData.Bucket) {
                imageMetaArray.push({
                  Location: imageData.Location,
                  Key: imageData.Key,
                  Bucket: imageData.Bucket,
                });
              }
            }
          } catch (uploadError: any) {
            const errDetail =
              uploadError?.response?.data?.message ||
              uploadError?.message ||
              JSON.stringify(uploadError?.response?.data || uploadError);
            failed.push({ index: i, name: file.name, error: errDetail });
            notifyError(
              `Failed to upload image ${i + 1}${file?.name ? ` (${file.name})` : ''}: ${errDetail}`,
              'Image Upload Failed',
            );
          }
        }
        setFailedUploads(failed);
      }

      const finalPayload = {
        ...data,
        reportedById: user?.uid,
        status: 'OPEN',
        ...(imageMetaArray.length > 0 && { imageMeta: imageMetaArray }),
      };

      await apiHelperService.createReport(finalPayload);

      form.reset();
      setImage1(null);
      setImage2(null);
      setImage3(null);

      await onSubmitted?.();
    } catch (error: any) {
      const details =
        error?.response?.data?.message ||
        error?.message ||
        JSON.stringify(error?.response?.data || error);
      setSubmitError(
        `Could not submit the report. Please try again. Details: ${details}`,
      );
      notifyError(
        'Could not submit the report. Please try again.',
        typeof details === 'string' ? details : 'Submission failed',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border-none shadow-none p-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-[2] min-w-[200px]">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <Label>Subject</Label>
                    <FormControl>
                      <InputGroup>
                        <InputGroupText>
                          <MessageSquareText className="h-4 w-4" />
                        </InputGroupText>
                        <InputGroupInput
                          className="h-9"
                          placeholder="Issue subject"
                          {...field}
                        />
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

          <FormField
            control={form.control}
            name="reportedId"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <input type="hidden" readOnly {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormItem>
            <Label>Upload Screenshots (up to 3)</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <ImageUploader
                label="Screenshot 1"
                value={image1}
                onChange={setImage1}
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                maxSize={5 * 1024 * 1024}
                previewHeight={160}
              />
              <ImageUploader
                label="Screenshot 2"
                value={image2}
                onChange={setImage2}
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                maxSize={5 * 1024 * 1024}
                previewHeight={160}
              />
              <ImageUploader
                label="Screenshot 3"
                value={image3}
                onChange={setImage3}
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                maxSize={5 * 1024 * 1024}
                previewHeight={160}
              />
            </div>
            <FormDescription>
              Attach up to 3 optional screenshots of the issue.
            </FormDescription>
          </FormItem>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
          {submitError && (
            <div
              role="alert"
              aria-live="assertive"
              className="mt-3 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-destructive"
            >
              <p className="text-sm">{submitError}</p>
            </div>
          )}
          {failedUploads.length > 0 && (
            <div className="mt-3 rounded-md border border-destructive/20 bg-destructive/5 p-3">
              <p className="text-sm font-medium text-destructive">
                Some images failed to upload:
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-destructive">
                {failedUploads.map((f) => (
                  <li key={`${f.index}-${f.name}`}>
                    Image {f.index + 1}
                    {f.name ? ` (${f.name})` : ''}: {f.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
