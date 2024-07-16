'use client';
import React, { useEffect, useState } from 'react';
import { MessageSquareIcon, Github, Mail } from 'lucide-react'; // Importing Mail icon from Lucide React
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

interface ProjectProps {
  projectName: string;
  description: string;
  githubLink: string;
  startFrom: string;
  endTo: string | 'current';
  reference: string;
  techUsed: string[];
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

const ProjectVerificationCard: React.FC<ProjectProps> = ({
  projectName,
  description,
  githubLink,
  startFrom,
  endTo,
  reference,
  techUsed,
  comments,
  status, // Get initial status from props
  onStatusUpdate,
  onCommentUpdate,
}) => {
  const [verificationStatus, setVerificationStatus] = useState(status);
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
    <Card className="max-w-full mx-auto md:max-w-2xl">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>{projectName}</span>
          {githubLink && (
            <div className="ml-auto">
              <a href={githubLink} className="text-sm text-white underline">
                <Github />
              </a>
            </div>
          )}
        </CardTitle>
        <CardDescription className="mt-1 text-justify text-gray-600">
          {verificationStatus === 'pending' ? (
            <Badge className="bg-warning-foreground text-white my-2">
              PENDING
            </Badge>
          ) : verificationStatus === 'verified' ? (
            <Badge className="bg-success text-white my-2">VERIFIED</Badge>
          ) : (
            <Badge className="bg-red-500 text-white my-2">REJECTED</Badge>
          )}
          <br />
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-4">
          <div className="mt-2">
            <span className="font-semibold">Tech Used:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {techUsed.map((tech, index) => (
                <Badge key={index} className="uppercase" variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
          <div className="mt-4">
            {/* Adding Tooltip for Reference with Email */}
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-gray-600 flex items-center">
                  <Mail className="mr-2" />
                  {reference}
                </p>
              </TooltipTrigger>
              <TooltipContent side="bottom">{reference}</TooltipContent>
            </Tooltip>
          </div>
          {comments && (
            <p className="mt-2 flex items-center text-gray-500 border p-3 rounded">
              <MessageSquareIcon className="mr-2" />
              {comments}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <div className="flex gap-4 text-gray-500">
          {new Date(startFrom).toLocaleDateString()} -{' '}
          {endTo !== 'current'
            ? new Date(endTo).toLocaleDateString()
            : 'Current'}
        </div>

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

export default ProjectVerificationCard;
