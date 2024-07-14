'use client';
import React, { useState } from 'react';
import { MessageSquareIcon } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface businessProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  companySize: string;
  referenceEmail: string;
  websiteLink: string;
  linkedInLink: string;
  githubLink: string;
  comments: string | '';
}

const FormSchema = z.object({
  type: z.enum(['verified', 'rejected'], {
    required_error: 'You need to select a type.',
  }),
});

const BusinessVerificationCard: React.FC<businessProps> = ({
  firstName,
  lastName,
  email,
  phone,
  companyName,
  companySize,
  referenceEmail,
  websiteLink,
  linkedInLink,
  githubLink,
  comments,
}) => {
  const [verificationStatus, setVerificationStatus] = useState<
    'pending' | 'verified' | 'rejected'
  >('pending');
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setVerificationStatus(data.type); // Set status based on selected type
  }

  return (
    <Card className="max-full mx-auto md:max-w-2xl">
      <CardHeader>
        <CardTitle className="flex">
          {firstName} {lastName}
        </CardTitle>
        <CardDescription className="block mt-1 text-justify tracking-wide leading-tight font-bold text-gray-600">
          {companyName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {verificationStatus === 'pending' ? (
          <Badge className="bg-warning hover:bg-warning">PENDING</Badge>
        ) : verificationStatus === 'verified' ? (
          <Badge className="bg-success hover:bg-success">VERIFIED</Badge>
        ) : (
          <Badge className="bg-red-500 hover:bg-red-500">REJECTED</Badge>
        )}

        <div className="mt-4">
          <div className="mt-4">
            <p>
              <span className="text-gray-500 font-semibold">Company Size:</span>{' '}
              {companySize}
            </p>
            <p>
              <span className="text-gray-500 font-semibold">Email:</span>{' '}
              {email}
            </p>
            <p>
              <span className="text-gray-500 font-semibold">Phone:</span>{' '}
              {phone}
            </p>
          </div>

          <div className="mt-4">
            <p>
              <span className="text-gray-500 font-semibold">Website Link:</span>{' '}
              {websiteLink}
            </p>
            <p>
              <span className="text-gray-500 font-semibold">
                LinkedIn Link:
              </span>{' '}
              {linkedInLink}
            </p>
            <p>
              <span className="text-gray-500 font-semibold">Github Link:</span>{' '}
              {githubLink}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600">
              <span className="text-gray-500 font-semibold">Refer Email:</span>{' '}
              {referenceEmail}
            </p>
          </div>

          <p className="mt-2 flex text-gray-500 border p-3 rounded">
            <MessageSquareIcon className="pr-1" />
            {comments}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-2/3 space-y-6"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Choose:</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="verified" />
                        </FormControl>
                        <FormLabel className="font-normal">Verified</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="rejected" />
                        </FormControl>
                        <FormLabel className="font-normal">Rejected</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardFooter>
    </Card>
  );
};

export default BusinessVerificationCard;
