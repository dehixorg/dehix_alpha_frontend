import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus } from 'lucide-react';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';

const experienceFormSchema = z.object({
  company: z.string().min(1, { message: 'Company name is required.' }),
  jobTitle: z.string().min(1, { message: 'Job title is required.' }),
  workDescription: z
    .string()
    .min(1, { message: 'Work description is required.' }),
  workFrom: z.string().min(1, { message: 'Work start date is required.' }),
  workTo: z.string().min(1, { message: 'Work end date is required.' }),
  referencePersonName: z
    .string()
    .min(1, { message: 'Reference person name is required.' }),
  referencePersonContact: z
    .string()
    .min(1, { message: 'Reference person contact is required.' }),
  githubRepoLink: z.string().url({ message: 'Invalid URL.' }).optional(),
  comments: z.string().optional(),
});

type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

export function AddExperience() {
  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      company: '',
      jobTitle: '',
      workDescription: '',
      workFrom: '',
      workTo: '',
      referencePersonName: '',
      referencePersonContact: '',
      githubRepoLink: '',
      comments: '',
    },
    mode: 'all',
  });

  async function onSubmit(data: ExperienceFormValues) {
    try {
      const response = await axiosInstance.post('/experience', data);
      console.log('API Response:', response.data);

      toast({
        title: 'Experience Added',
        description: 'The experience has been successfully added.',
      });
    } catch (error) {
      console.error('API Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add experience. Please try again later.',
      });
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="my-auto">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="lg:max-w-screen-lg overflow-y-scroll max-h-screen">
        <DialogHeader>
          <DialogTitle>Add Experience</DialogTitle>
          <DialogDescription>
            Fill in the details of your experience below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name" {...field} />
                  </FormControl>
                  <FormDescription>Enter the company name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter job title" {...field} />
                  </FormControl>
                  <FormDescription>Enter the job title</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter work description" {...field} />
                  </FormControl>
                  <FormDescription>Enter the work description</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work From</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>Select the start date</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work To</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>Select the end date</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="referencePersonName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Person Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter reference person name"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the reference person&apos;s name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="referencePersonContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Person Contact</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter reference person contact"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the reference person&apos;s contact
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="githubRepoLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub Repo Link</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter GitHub repository link"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the GitHub repository link (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter any comments" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter any comments (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Add Experience</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}