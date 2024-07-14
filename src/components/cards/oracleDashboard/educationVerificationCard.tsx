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

interface EducationProps {
  type: string;
  instituteName: string;
  location: string;
  startFrom: string;
  endTo: string | 'current';
  grade: string;
  referencePersonName: string;
  degreeNumber: string;
  comments: string | '';
}

const FormSchema = z.object({
  type: z.enum(['verified', 'rejected'], {
    required_error: 'You need to select a type.',
  }),
});

const EducationVerificationCard: React.FC<EducationProps> = ({
  type,
  instituteName,
  location,
  startFrom,
  endTo,
  grade,
  referencePersonName,
  degreeNumber,
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
        <CardTitle className="flex">{type}</CardTitle>
        <CardDescription className="block mt-1 uppercase tracking-wide leading-tight font-medium text-white">
          {instituteName}
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
          <p>{location}</p>
          <p>Degree Number: {degreeNumber}</p>
          <p>Grade: {grade}</p>

          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Reference: {referencePersonName}
            </p>
          </div>
          <p className="mt-2 flex text-gray-500 border p-3 rounded">
            <MessageSquareIcon className="pr-1" />
            {comments}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <div className="flex flex-1 gap-4">
          {new Date(startFrom).toLocaleDateString()}-
          {endTo !== 'current'
            ? new Date(endTo).toLocaleDateString()
            : 'Current'}
        </div>

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

export default EducationVerificationCard;
