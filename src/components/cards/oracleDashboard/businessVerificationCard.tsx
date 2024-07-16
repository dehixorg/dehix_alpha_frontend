'use client';
import React, { useEffect, useState } from 'react';
import {
  MessageSquareIcon,
  Linkedin,
  Github,
  GlobeIcon,
  Users,
  Mail,
  Phone,
} from 'lucide-react';
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

interface BusinessProps {
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
  comments: string;
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

const BusinessVerificationCard: React.FC<BusinessProps> = ({
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
  status, // Get initial status from props
  onStatusUpdate,
  onCommentUpdate,
}) => {
  const [verificationStatus, setVerificationStatus] = useState(status); // Use initial status
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  useEffect(() => {
    // Ensure verificationStatus is set after the component mounts
    setVerificationStatus(status);
  }, [status]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setVerificationStatus(data.type);
    onStatusUpdate(data.type);
    // console.log("Comments:", data.comment || "");
    onCommentUpdate(data.comment || '');
  }

  return (
    <Card className="max-w-full md:max-w-2xl">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>
            {firstName} {lastName}
          </span>
          <div className="flex flex-row space-x-3">
            {websiteLink && (
              <a
                href={websiteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline flex items-center"
              >
                <GlobeIcon className="mt-auto" />
              </a>
            )}
            {linkedInLink && (
              <a
                href={linkedInLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm  underline flex items-center"
              >
                <Linkedin />
              </a>
            )}
            {githubLink && (
              <a
                href={githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm  underline flex items-center"
              >
                <Github />
              </a>
            )}
          </div>
        </CardTitle>
        <CardDescription className="mt-1 text-justify text-gray-600">
          {companyName}
          <br />
          {verificationStatus === 'pending' ? (
            <Badge className="bg-warning-foreground text-white mt-2">
              PENDING
            </Badge>
          ) : verificationStatus === 'verified' ? (
            <Badge className="bg-success text-white mt-2">VERIFIED</Badge>
          ) : (
            <Badge className="bg-red-500 text-white mt-2">REJECTED</Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-gray-600 flex items-center">
                <Users className="mr-2" />
                {companySize}
              </p>
            </TooltipTrigger>
            <TooltipContent side="bottom">Company Size</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-gray-600 flex items-center">
                <Mail className="mr-2" />
                {email}
              </p>
            </TooltipTrigger>
            <TooltipContent side="bottom">Email</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-gray-600 flex items-center">
                <Phone className="mr-2" />
                {phone}
              </p>
            </TooltipTrigger>
            <TooltipContent side="bottom">Phone</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-gray-600 flex items-center">
                <Mail className="mr-2" />
                {referenceEmail}
              </p>
            </TooltipTrigger>
            <TooltipContent side="bottom">Reference Email</TooltipContent>
          </Tooltip>

          {comments && (
            <p className="mt-2 flex items-center text-gray-500 border p-3 rounded">
              <MessageSquareIcon className="mr-2" />
              {comments}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        {verificationStatus === 'pending' && (
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
                        className="flex flex-col space-y-1"
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
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
          </Form>
        )}
      </CardFooter>
    </Card>
  );
};

export default BusinessVerificationCard;
