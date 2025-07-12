'use client';
import React, { useEffect, useState } from 'react';
import { MessageSquareIcon, MapPin, MoreVertical } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';

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
import { toast } from '@/components/ui/use-toast';
import { RootState } from '@/lib/store';
import { getReportTypeFromPath } from '@/utils/getReporttypeFromPath';
import { NewReportTab } from '@/components/report-tabs/NewReportTabs';

interface EducationProps {
  _id: string;
  type: string;
  location: string;
  degree: string;
  startFrom: string;
  endTo: string | 'current';
  grade: string;
  comments: string;
  fieldOfStudy: string;
  status: string | 'pending';
  onStatusUpdate: (newStatus: string) => void;
  onCommentUpdate: (newComment: string) => void;
}

const FormSchema = z.object({
  type: z.enum(['Approved', 'Denied'], {
    required_error: 'You need to select a type.',
  }),
  comment: z.string().optional(),
});

const EducationVerificationCard: React.FC<EducationProps> = ({
  _id,
  type,
  degree,
  location,
  startFrom,
  endTo,
  grade,
  fieldOfStudy,
  comments,
  status,
  onStatusUpdate,
  onCommentUpdate,
}) => {
  const [verificationStatus, setVerificationStatus] = useState(status);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openReport, setOpenReport] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: 'onChange',
  });

  const selectedType = form.watch('type');

  const user = useSelector((state: RootState) => state.user);
  const pathname = usePathname();
  const reportType = getReportTypeFromPath(pathname);

  const reportData = {
    subject: '',
    description: '',
    report_role: user?.type || 'STUDENT',
    report_type: reportType,
    status: 'OPEN',
    reportedbyId: user?.uid || 'user123',
    reportedId: user?.uid || 'user123',
  };

  useEffect(() => {
    setVerificationStatus(status);
  }, [status]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await axiosInstance.put(
        `/verification/${_id}/oracle?doc_type=education`,
        {
          comments: data.comment,
          verification_status: data.type,
        },
      );
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong.Please try again.',
      });
    }
    setVerificationStatus(data.type);
    onStatusUpdate(data.type);
    onCommentUpdate(data.comment || '');
  }

  return (
    <Card className="max-w-full md:max-w-2xl relative">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span>{type}</span>
          <div className="flex items-center space-x-2">
            {verificationStatus === 'pending' ||
            verificationStatus === 'added' ? (
              <Badge className="bg-warning-foreground text-white">
                PENDING
              </Badge>
            ) : verificationStatus === 'Approved' ? (
              <Badge className="bg-success text-white">Approved</Badge>
            ) : (
              <Badge className="bg-red-500 text-white">Denied</Badge>
            )}

            {/* Report menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-md z-50">
                  <button
                    onClick={() => {
                      setOpenReport(true);
                      setMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardTitle>
        <CardDescription className="text-justify text-gray-600">
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-lg text-gray-600 flex items-center mt-3">
                <MapPin className="mr-2" />
                {location}
              </p>
            </TooltipTrigger>
            <TooltipContent side="bottom">Location</TooltipContent>
          </Tooltip>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mt-2">
          <p className="text-m text-gray-600 mb-2">
            <span className="text-gray-500 font-semibold">Degree:</span>{' '}
            {degree}
          </p>
          <p className="text-m text-gray-600 mb-2">
            <span className="text-gray-500 font-semibold">Field Of Study:</span>{' '}
            {fieldOfStudy}
          </p>
          <p className="text-m text-gray-600 mb-2">
            <span className="text-gray-500 font-semibold">Grade:</span> {grade}
          </p>

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
          {new Date(startFrom).toLocaleDateString()} -{' '}
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
                          <FormLabel className="font-normal">Denied</FormLabel>
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

      {/* Report Modal */}
      {openReport && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-md w-full max-w-lg relative shadow-lg">
            <button
              onClick={() => setOpenReport(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
            >
              ✕
            </button>
            <NewReportTab reportData={reportData} />
          </div>
        </div>
      )}
    </Card>
  );
};

export default EducationVerificationCard;
