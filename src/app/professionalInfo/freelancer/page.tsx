'use client';
import React, { useEffect, useState } from 'react';
import { CalendarIcon, Trash2, Pencil } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ProfileSidebar } from '@/components/ProfileSidebar';

const FormSchema = z.object({
  role: z.string({
    required_error: 'Role is required',
  }),
  companyName: z.string({
    required_error: 'Company Name is required',
  }),
  start: z.date({
    required_error: 'A start date of working',
  }),
  end: z.date({
    required_error: 'An end date of working.',
  }),
  referenceName: z.string().optional(),
  referenceEmail: z.string().email().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});

export default function ProfilePage() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const [experiences, setExperiences] = useState<z.infer<typeof FormSchema>[]>(
    [],
  );

  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const toggleDialog = () => {
    setIsDialogOpen(!isDialogOpen);
    if (!isDialogOpen) {
      form.reset(); // Reset the form when opening the dialog
      setEditIndex(null); // Reset editIndex for new experience
    }
  };

  useEffect(() => {
    const savedExperiences = localStorage.getItem('experiences');
    if (savedExperiences) {
      setExperiences(JSON.parse(savedExperiences));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('experiences', JSON.stringify(experiences));
  }, [experiences]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (editIndex !== null) {
      const updatedExperiences = [...experiences];
      updatedExperiences[editIndex] = data;
      setExperiences(updatedExperiences);
      localStorage.setItem('experiences', JSON.stringify(updatedExperiences));
      console.log('Updated Experiences:', updatedExperiences); // Check updated state
    } else {
      setExperiences([...experiences, data]);
    }
    form.reset();
    setIsDialogOpen(false);
  };

  const handleDelete = (index: number) => {
    const updatedExperiences = experiences.filter((_, i) => i !== index);
    setExperiences(updatedExperiences);
    localStorage.setItem('experiences', JSON.stringify(updatedExperiences)); // Update local storage
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    const experience = experiences[index];
    form.setValue('role', experience.role);
    form.setValue('companyName', experience.companyName);
    form.setValue('start', new Date(experience.start));
    form.setValue('end', new Date(experience.end));
    form.setValue('referenceName', experience.referenceName || '');
    form.setValue('referenceEmail', experience.referenceEmail || '');
    form.setValue('location', experience.location || '');
    form.setValue('description', experience.description || '');
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col md:flex-row items-center min-h-screen">
      <ProfileSidebar />
      <div className="p-6 rounded-lg w-full h-auto flex flex-col mt-44 m-64">
        <div className="-mt-44">
          <h2 className="text-white text-2xl font-bold mb-4">Experience</h2>
        </div>

        <div className="w-full">
          {experiences.map((experience, index) => (
            <div
              key={index}
              className="relative bg-white border rounded-lg p-6 mb-4 shadow-lg w-full"
            >
              <div className="absolute top-4 right-4 flex space-x-3">
                <button
                  className="text-gray-800 hover:text-red-600 focus:outline-none"
                  onClick={() => handleDelete(index)}
                >
                  <Trash2 className="h-6 w-6" />
                </button>
                <button
                  className="text-gray-800 hover:text-blue-700 focus:outline-none"
                  onClick={() => handleEdit(index)}
                >
                  <Pencil className="h-6 w-6" />
                </button>
              </div>
              <p className="text-gray-900 text-xl font-semibold mb-1">
                {experience.role}
              </p>
              <p className="text-gray-700 mb-1">{experience.companyName}</p>
              <p className="text-gray-600 mb-1">
                {format(experience.start, 'PPP')} -{' '}
                {format(experience.end, 'PPP')}
              </p>
              {experience.referenceName && (
                <p className="text-gray-600 mb-1">
                  Reference Person Name: {experience.referenceName}
                </p>
              )}
              {experience.referenceEmail && (
                <p className="text-gray-600 mb-1">
                  Reference Person Email: {experience.referenceEmail}
                </p>
              )}
              {experience.location && (
                <p className="text-gray-600 mb-1">
                  Location: {experience.location}
                </p>
              )}
              {experience.description && (
                <p className="text-gray-600">{experience.description}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center mt-8">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gray-600"
                variant="outline"
                onClick={toggleDialog}
              >
                Add Experience
              </Button>
            </DialogTrigger>

            <DialogContent className="w-full max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Experience</DialogTitle>
                <DialogDescription>
                  Add your relevant experience.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-row-4 gap-4 py-4 max-h-[70vh] overflow-y-auto">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Enter your job title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your job title"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter your job title
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your organization's name"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter your organization name
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="start"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={'outline'}
                                    className={cn(
                                      'w-full pl-3 text-left font-normal',
                                      !field.value && 'text-muted-foreground',
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, 'PPP')
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() ||
                                    date < new Date('1900-01-01')
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>Your start date</FormDescription>
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
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={'outline'}
                                    className={cn(
                                      'w-full pl-3 text-left font-normal',
                                      !field.value && 'text-muted-foreground',
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, 'PPP')
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() ||
                                    date < new Date('1900-01-01')
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>Your end date</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="referenceName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Enter Reference Person Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter Reference Person Name"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter Reference Person Name
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="referenceEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Enter Reference Person Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter Reference Person Email"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter Reference Person Email
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Location</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your work location"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter your work location
                          </FormDescription>
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
                            <Textarea
                              placeholder="Enter Description"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Enter Description</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button type="submit" onClick={toggleDialog}>
                        Save changes
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
