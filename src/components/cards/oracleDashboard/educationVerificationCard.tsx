'use client';
import React, { useEffect, useState } from 'react';
import { MessageSquareIcon, MapPin} from 'lucide-react';
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';

interface EducationProps {
  type: string;
  location: string;
  degree: string;
  startFrom: string;
  endTo: string | 'current';
  grade: string;
  comments: string;
  fieldOfStudy: string;
  status: string | 'pending'; // Add initial status prop
  onStatusUpdate: (newStatus: string) => void;
  onCommentUpdate: (newComment: string) => void;
}

const FormSchema = z.object({
  type: z.enum(['verified', 'rejected'], {
    required_error: 'You need to select a type.',
  }),
  comment: z.string().optional(),
});

const EducationVerificationCard: React.FC<EducationProps> = ({
  type,
  degree,
  location,
  startFrom,
  endTo,
  grade,
  // referencePersonName,
  fieldOfStudy,
  comments,
  status, // Get initial status from props
  onStatusUpdate,
  onCommentUpdate,
}) => {
  const [verificationStatus, setVerificationStatus] = useState(status); // Use initial status
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: 'onChange', // Enable validation on change
  });

  // Watch the 'type' field to check if it's selected
  const selectedType = form.watch('type');

  useEffect(() => {
    // Ensure verificationStatus is set after the component mounts
    setVerificationStatus(status);
  }, [status]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    // Update status based on selection
    setVerificationStatus(data.type);
    onStatusUpdate(data.type);
    // console.log("Comments:", data.comment || "");
    onCommentUpdate(data.comment || '');
  }

  return (
    <Card className="max-w-full md:max-w-2xl">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>{type}</span>
          {verificationStatus === 'pending' ||
          verificationStatus === 'added' ? (
            <Badge className="bg-warning-foreground text-white">PENDING</Badge>
          ) : verificationStatus === 'verified' ? (
            <Badge className="bg-success text-white">VERIFIED</Badge>
          ) : (
            <Badge className="bg-red-500 text-white">REJECTED</Badge>
          )}
        </CardTitle>
        <CardDescription className="text-justify text-gray-600">
          {/* {instituteName} */}
          <br />
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-lg text-gray-600 flex items-center mt-3">
                <MapPin className="mr-2" />
                {location}
              </p>
            </TooltipTrigger>
            <TooltipContent side="bottom">Location</TooltipContent>
          </Tooltip>
          {/* <br /> */}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-2">
          <p className="text-m text-gray-600 mb-2">
            <span className="text-gray-500 font-semibold">degree:</span>{' '}
            {degree}
          </p>
          <p className="text-m text-gray-600 mb-2">
            <span className="text-gray-500 font-semibold">Field Of study:</span>{' '}
            {fieldOfStudy}
          </p>
          <p className="text-m text-gray-600 mb-2">
            <span className="text-gray-500 font-semibold">Grade:</span> {grade}
          </p>

          {/* <div className="mt-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-gray-600 flex items-center">
                  <User className="mr-2" />
                  {referencePersonName}
                </p>
              </TooltipTrigger>
              <TooltipContent side="bottom">Reference Person</TooltipContent>
            </Tooltip>
          </div> */}

          {comments && (
            <p className="mt-2 flex items-center text-gray-500 border p-3 rounded">
              <MessageSquareIcon className="mr-2" />
              {comments}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <div className="flex flex-1 gap-4">
          {new Date(startFrom).toLocaleDateString()} -
          {endTo !== 'current'
            ? new Date(endTo).toLocaleDateString()
            : 'Current'}
        </div>

        {(verificationStatus === 'pending' ||
          verificationStatus === 'added') && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6 mt-6"
            >
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Choose Verification Status:</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-4"
                      >
                        <FormItem className="flex items-center space-x-3">
                          <FormControl>
                            <RadioGroupItem value="verified" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Verified
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3">
                          <FormControl>
                            <RadioGroupItem value="rejected" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Rejected
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comments:</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter comments:" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={!selectedType || form.formState.isSubmitting}
              >
                Submit
              </Button>
            </form>
          </Form>
        )}
      </CardFooter>
    </Card>
  );
};

export default EducationVerificationCard;
