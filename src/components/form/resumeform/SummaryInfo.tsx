import React from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';

export default function SummaryInfo() {
  const form = useForm({
    defaultValues: {
      summary: '',
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Form Header */}
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Professional Summary</h2>
        <p className="text-sm text-gray-500">
          Write a short introduction for your resume.
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => {
            console.log(data);
          })}
          className="space-y-5"
        >
          {/* Summary Field */}
          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-gray-500 mt-1">
                  Professional Summary
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="A brief, engaging text about yourself"
                    className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
