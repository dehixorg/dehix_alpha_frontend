import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { apiHelperService } from "@/services/report";
import { apiHelperService as profileService } from "@/services/profilepic";

const reportSchema = z.object({
  subject: z.string().min(3, { message: "Subject is required" }),
  description: z.string().min(10, { message: "Description must be more detailed" }),
  report_role: z.string().min(1, { message: "Report role is required" }),
  report_type: z.string().min(1, { message: "Report type is required" }),
  reportedId: z.string().min(1, { message: "Reported ID is required" }),
  status: z.string().optional(),
  reportedById: z.string().optional(),
  imageMeta: z
    .array(
      z.object({
        Location: z.string(),
        Key: z.string(),
        Bucket: z.string(),
      })
    )
    .optional(),
});

export type ReportFormValues = z.infer<typeof reportSchema>;

export function ReportForm({ initialData }: { initialData: ReportFormValues }) {
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
        reportedById: initialData.reportedId,
        status: "OPEN",
        ...(imageMetaArray.length > 0 && { imageMeta: imageMetaArray }),
      };

      const res = await apiHelperService.createReport(finalPayload);
      console.log("Report submitted successfully:", res);
    } catch (error) {
      console.error("Failed to submit report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

 return (
  <Card className="p-6 rounded-lg border-none shadow-none">
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
                    <Input className="h-9" placeholder="Issue subject" {...field} />
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
                  <Select defaultValue={field.value} onValueChange={() => {}} disabled>
                    <FormControl>
                      <SelectTrigger className="bg-gray-100 cursor-not-allowed h-9">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={field.value}>{field.value}</SelectItem>
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
                  <Select defaultValue={field.value} onValueChange={() => {}} disabled>
                    <FormControl>
                      <SelectTrigger className="bg-gray-100 cursor-not-allowed h-9">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={field.value}>{field.value}</SelectItem>
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
       {/* 🖼 Image Upload with Preview and Validation */}
<FormItem>
  <Label>Upload Screenshots (up to 3)</Label>
  <FormControl>
    <Input
      type="file"
      accept="image/*"
      multiple
      onChange={(e) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (files.length > 3) {
          setFileError("You can only upload up to 3 images.");
          setImageFiles([]); // Optional: clear if over limit
        } else {
          setFileError(null);
          setImageFiles(files);
        }
      }}
    />
  </FormControl>

  {/* 🔴 File error message */}
  {fileError && (
    <p className="text-sm text-red-600 mt-1">{fileError}</p>
  )}

  {/* 🖼 Image Preview with Delete and View */}
{imageFiles.length > 0 && (
  <div className="mt-3 flex gap-4 flex-wrap">
    {imageFiles.map((file, idx) => {
      const imageUrl = URL.createObjectURL(file);
      return (
        <div key={idx} className="relative w-24 h-24 border rounded overflow-hidden group">
          {/* 🖼 Click to view */}
          <a href={imageUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={imageUrl}
              alt={`screenshot-${idx}`}
              className="object-cover w-full h-full hover:opacity-80 cursor-pointer"
            />
          </a>

          {/* ❌ Cancel Button */}
          <button
            type="button"
            onClick={() => removeImage(idx)}
            className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-600 hover:bg-red-100 transition"
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
        <Button type="submit" className="h-9 px-4" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </Button>
      </form>
    </Form>
  </Card>
);
}
