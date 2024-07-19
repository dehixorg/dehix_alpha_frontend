import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { useSelector } from 'react-redux';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';

// Schema for form validation using zod
const projectFormSchema = z.object({
  projectName: z.string().min(1, { message: 'Project name is required.' }),
  description: z.string().min(1, { message: 'Description is required.' }),
  githubLink: z.string().url({ message: 'Invalid URL.' }).optional(),
  start: z.string().min(1, { message: 'Start date is required.' }),
  end: z.string().min(1, { message: 'End date is required.' }),
  refer: z.string().min(1, { message: 'Reference is required.' }),
  techUsed: z.string().min(1, { message: 'Technologies used are required.' }),
  role: z.string().min(1, { message: 'Role is required.' }),
  projectType: z.string().optional(),
  verificationStatus: z.string().optional(),
  comments: z.string().optional(),
});

// Type for form values
type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface AddProjectProps {
  onFormSubmit: () => void;
}

export const AddProject: React.FC<AddProjectProps> = ({ onFormSubmit }) => {
  const user = useSelector((state: RootState) => state.user);

  // Form setup with react-hook-form and zodResolver
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      projectName: '',
      description: '',
      githubLink: '',
      start: '',
      end: '',
      refer: '',
      techUsed: '',
      role: '',
      projectType: '',
      verificationStatus: 'added',
      comments: '',
    },
    mode: 'all',
  });

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isDialogOpen) {
      form.reset({
        projectName: '',
        description: '',
        githubLink: '',
        start: '',
        end: '',
        refer: '',
        techUsed: '',
        role: '',
        projectType: '',
        verificationStatus: 'added',
        comments: '',
      });
    }
  }, [isDialogOpen, form]);

  // Submit handler for the form
  async function onSubmit(data: ProjectFormValues) {
    try {
      // Convert comma-separated techUsed string into an array
      const techUsedArray = data.techUsed
        .split(',')
        .map((tech) => tech.trim())
        .filter((tech) => tech !== '');

      const response = await axiosInstance.post(
        `/freelancer/${user.uid}/project`,
        {
          ...data,
          techUsed: techUsedArray,
          verified: false,
          oracleAssigned: '',
          start: data.start ? new Date(data.start).toISOString() : null,
          end: data.end ? new Date(data.end).toISOString() : null,
          verificationUpdateTime: new Date().toISOString(),
        },
      );
      console.log('API Response:', response.data);
      onFormSubmit();
      setIsDialogOpen(false);
      toast({
        title: 'Project Added',
        description: 'The project has been successfully added.',
      });
    } catch (error) {
      console.error('API Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add project. Please try again later.',
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
          <DialogTitle>Add Project</DialogTitle>
          <DialogDescription>
            Fill in the details of your project below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormDescription>Enter the project name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project description" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the project description
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="githubLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub Repo Link</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter GitHub repository link"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the GitHub repository link (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="start"
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
              name="end"
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
              name="refer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project reference" {...field} />
                  </FormControl>
                  <FormDescription>Enter the project reference</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="techUsed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technologies Used</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter technologies used (comma separated)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the technologies used (comma separated)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter role" {...field} />
                  </FormControl>
                  <FormDescription>Enter the role</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project type" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the project type (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter any comments" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter any comments (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Add Project</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
