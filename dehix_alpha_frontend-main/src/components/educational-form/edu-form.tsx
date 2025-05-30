'use client';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  degree: z.string().nonempty('Degree is required'),
  universityName: z.string().nonempty('University name is required'),
  fieldOfStudy: z.string().nonempty('Field of study is required'),
  startDate: z.string().nonempty('Start date is required'),
  endDate: z.string().nonempty('End date is required'),
  grade: z.string().nonempty('Grade is required'),
  oracleAssigned: z.string().nonempty('Oracle assigned is required'),
  verificationStatus: z.string().nonempty('Verification status is required'),
  verificationUpdateTime: z
    .string()
    .nonempty('Verification update time is required'),
  comments: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

export default function EducationForm() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      degree: '',
      universityName: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      grade: '',
      oracleAssigned: '',
      verificationStatus: '',
      verificationUpdateTime: '',
      comments: '',
    },
  });

  const handleSubmit = (values: FormSchema) => {
    console.log({ values });
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-24">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="max-w-md w-full grid gap-4"
          style={{ gridTemplateColumns: '1fr 1fr' }}
        >
          <FormField
            control={form.control}
            name="degree"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Degree</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Degree"
                    type="text"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="universityName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>University Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="University name"
                    type="text"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fieldOfStudy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Field of Study</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Field of study"
                    type="text"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Start date"
                    type="date"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input
                    placeholder="End date"
                    type="date"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Grade"
                    type="text"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="oracleAssigned"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Oracle Assigned</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Oracle assigned"
                    type="text"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="verificationStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Status</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Verification status"
                    type="text"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="verificationUpdateTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Update Time</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Verification update time"
                    type="datetime-local"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="comments"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Comments</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Comments"
                    type="text"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full col-span-2">
            Submit
          </Button>
        </form>
      </Form>
    </main>
  );
}
