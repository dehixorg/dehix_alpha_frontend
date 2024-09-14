import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useSelector } from 'react-redux';

import { toast } from '../ui/use-toast';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';

const FormSchema = z
  .object({
    degree: z.string().optional(),
    universityName: z.string().optional(),
    fieldOfStudy: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    grade: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return start < end;
      }
      return true;
    },
    {
      message: 'Start Date must be before End Date',
      path: ['endDate'], // Show error on endDate field
    },
  );

interface AddEducationProps {
  onFormSubmit: () => void;
}

export const AddEducation: React.FC<AddEducationProps> = ({ onFormSubmit }) => {
  const user = useSelector((state: RootState) => state.user);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      degree: '',
      universityName: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      grade: '',
    },
  });

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isDialogOpen) {
      form.reset({
        degree: '',
        universityName: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        grade: '',
      });
    }
  }, [isDialogOpen, form]);

  async function onSubmit(data: any) {
    try {
      const formattedData = {
        ...data,
        startDate: data.startDate
          ? new Date(data.startDate).toISOString()
          : null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        oracleAssigned: data.oracleAssigned || '',
        verificationStatus: data.verificationStatus || 'added',
        verificationUpdateTime: data.verificationUpdateTime || new Date(),
        comments: '',
      };
      const response = await axiosInstance.post(
        `/freelancer/${user.uid}/education`,
        formattedData,
      );
      console.log('API Response:', response.data);
      onFormSubmit();
      setIsDialogOpen(false);
      toast({
        title: 'Education Added',
        description: 'The education has been successfully added.',
      });
    } catch (error) {
      console.error('API Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add education. Please try again later.',
      });
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="my-auto">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="lg:max-w-screen-lg overflow-y-scroll max-h-screen">
        <DialogHeader>
          <DialogTitle>Add Education</DialogTitle>
          <DialogDescription>Add your relevant Education.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="degree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter Degree</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your degree title" {...field} />
                  </FormControl>
                  <FormDescription>Enter your degree title</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="universityName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>University Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your university name"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter your university name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fieldOfStudy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter Field of Study</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your field of study" {...field} />
                  </FormControl>
                  <FormDescription>Enter Field of Study</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>Select the start date</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>Select the end date</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your grade" {...field} />
                  </FormControl>
                  <FormDescription>Enter your grade</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
