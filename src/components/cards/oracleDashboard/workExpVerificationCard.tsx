'use client';
import React, { useEffect, useState } from 'react';
import {
  MessageSquareIcon,
  Github,
  Mail,
  User2Icon,
  Phone,
  Building,
} from 'lucide-react'; // Importing Mail icon from Lucide React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { axiosInstance } from '@/lib/axiosinstance';
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

interface WorkExpProps {
  _id:string;
  jobTitle: string;
  workDescription: string;
  startFrom: string;
  endTo: string | 'current';
  company: string;
  referencePersonName: string;
  referencePersonContact: string;
  githubRepoLink: string;
  comments: string;
  status: string | 'Pending'; // Add initial status prop
  onStatusUpdate: (newStatus: string) => void;
  onCommentUpdate: (newComment: string) => void;
}

const FormSchema = z.object({
  type: z.enum(['Approved', 'Denied'], {
    required_error: 'You need to select a type.',
  }),
  comment: z.string().optional(),
});

const WorkExpVerificationCard: React.FC<WorkExpProps> = ({
  _id,
  jobTitle,
  workDescription,
  startFrom,
  company,
  endTo,
  referencePersonName,
  referencePersonContact,
  githubRepoLink,
  comments,
  status, // Get initial status from props
  onStatusUpdate,
  onCommentUpdate,
}) => {
  const [verificationStatus, setVerificationStatus] = useState(status);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const selectedType = form.watch('type');
  useEffect(() => {
    // Ensure verificationStatus is set after the component mounts
    setVerificationStatus(status);
  }, [status]);

 async function onSubmit(data: z.infer<typeof FormSchema>) {
    const response= await axiosInstance.put(`/freelancer/${_id}/oracle?doc_type=experience`,{
      comments:data.comment,
      verification_status:data.type
    })
    console.log("Comments:", data.comment || "",{...data,
      verification_status:data.type},_id);
    setVerificationStatus(data.type);
    onStatusUpdate(data.type);
    // console.log("Comments:", data.comment || "");
    onCommentUpdate(data.comment || '');
  }

  return (
    <Card className="max-w-full mx-auto md:min-w-[30vw]">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>{jobTitle}</span>
          {githubRepoLink && (
            <a
              href={githubRepoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white underline ml-auto"
            >
              <Github />
            </a>
          )}
        </CardTitle>
        <CardDescription className="text-justify text-gray-600">
          {verificationStatus === 'Pending' ? (
            <Badge className="bg-warning-foreground text-white my-2">
              Pending
            </Badge>
          ) : verificationStatus === 'Approved' ? (
            <Badge className="bg-success text-white my-2">Approved</Badge>
          ) : (
            <Badge className="bg-red-500 text-white my-2">Denied</Badge>
          )}
          <br />
          {workDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-4">
          <div className="mt-4">
            <p className="mt-4 mb-3 text-m text-gray-600 flex items-center">
              <span className="flex">
                <Building className="mr-2" />
                {company}
              </span>
            </p>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-gray-600 flex items-center">
                  <User2Icon className="mr-2" />
                  {referencePersonName}
                </p>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {referencePersonName}
              </TooltipContent>
            </Tooltip>
            {/* Adding Tooltip for Reference Person Email */}
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-gray-600 flex items-center mt-2">
                  <Phone className="mr-2" />
                  {referencePersonContact}
                </p>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {referencePersonContact}
              </TooltipContent>
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

        {verificationStatus === 'Pending' && (
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
                            <RadioGroupItem value="Approved" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Approved
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3">
                          <FormControl>
                            <RadioGroupItem value="Denied" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Denied
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

export default WorkExpVerificationCard;
