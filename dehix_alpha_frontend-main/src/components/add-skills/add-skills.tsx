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
  skillName: z.string().nonempty('Skill name is required'),
  skillLevel: z
    .string()
    .nonempty('Skill level is required')
    .regex(/^[0-5]$/, 'Skill level should be between 0 and 5'),
  yearsOfExperience: z
    .string()
    .nonempty('Years of experience is required')
    .regex(/^\d*$/, 'Years of experience should be a positive integer or zero'),
  interviewStatus: z.string().nonempty('Interview status is required'),
  interviewInfoId: z.string().nonempty('Interview info ID is required'),
  interviewerRating: z
    .string()
    .nonempty('Interviewer rating is required')
    .regex(/^[0-5]$/, 'Interviewer rating should be between 0 and 5'),
});

type FormSchema = z.infer<typeof formSchema>;

export default function AddSkillForm() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skillName: '',
      skillLevel: '',
      yearsOfExperience: '',
      interviewStatus: '',
      interviewInfoId: '',
      interviewerRating: '',
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
            name="skillName"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Skill Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Skill name"
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
            name="skillLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skill Level</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Skill level"
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
            name="yearsOfExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years of Experience</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Years of experience"
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
            name="interviewStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interview Status</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Interview status"
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
            name="interviewInfoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interview Info ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Interview info ID"
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
            name="interviewerRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interviewer Rating</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Interviewer rating"
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
