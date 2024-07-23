'use client';
import React from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { Search } from 'lucide-react';

import FAQAccordion from '@/components/accordian/faqAccordian';
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DropdownProfile from '@/components/shared/DropdownProfile';

type FormValues = {
  email: string;
  message: string;
};

const SupportPage: React.FC = () => {
  const methods = useForm<FormValues>({
    defaultValues: {
      email: '',
      message: '',
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = (data: FormValues) => {
    console.log(data);
    // Handle form submission, e.g., send the data to a server
  };

  return (
    <div className="container mx-auto p-4">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold sm:text-2xl md:text-3xl">
          Support Page
        </h1>
        <div className="relative flex items-center gap-4 ml-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full max-w-[300px] rounded-lg bg-background pl-8 sm:w-[200px] lg:w-[336px]"
          />
          <DropdownProfile />
        </div>
      </header>
      <section className="mb-8 text-center mt-[4rem]">
        <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
        <p>
          Email:{' '}
          <a href="mailto:support@example.com" className="text-blue-600">
            support@example.com
          </a>
        </p>
        <p>
          Phone:{' '}
          <a href="tel:+1234567890" className="text-blue-600">
            +123-456-7890
          </a>
        </p>
        <p>Address: 123 Freelance St, Work City, Country</p>
      </section>

      {/* FAQ Section */}
      <section className="mb-8 mt-[4rem]">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Frequently Asked Questions
        </h2>
        <div className="w-full mx-auto">
          <FAQAccordion />
        </div>
      </section>

      {/* Contact Form */}
      <section className="mb-8 mt-[4rem]">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Leave a Comment
        </h2>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto max-w-3xl space-y-4 p-4 border border-gray-300 rounded-lg shadow-md"
          >
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Controller
                  name="email"
                  control={control}
                  rules={{ required: 'Email is required' }}
                  render={({ field }) => (
                    <input
                      type="email"
                      {...field}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  )}
                />
              </FormControl>
              <FormMessage>{errors.email?.message}</FormMessage>
            </FormItem>
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Controller
                  name="message"
                  control={control}
                  rules={{ required: 'Message is required' }}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={4}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  )}
                />
              </FormControl>
              <FormMessage>{errors.message?.message}</FormMessage>
            </FormItem>
            <Button
              type="submit"
              className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Send Message
            </Button>
          </form>
        </FormProvider>
      </section>
    </div>
  );
};

export default SupportPage;
