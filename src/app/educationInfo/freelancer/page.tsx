'use client';
import React, { useEffect, useState } from 'react';
import { CalendarIcon, Trash2, Pencil } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Input } from '@/components/ui/input';
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
  degree: z.string({
    required_error: 'Role is required',
  }),
  universityName: z.string({
    required_error: 'Company Name is required',
  }),
  fieldOfStudy: z.string({
    required_error: 'Field of study is required',
  }),
  start: z.date({
    required_error: 'A start date of working',
  }),
  end: z.date({
    required_error: 'An end date of working.',
  }),
  grade: z.string({
    required_error: 'A grade score is required',
  }),
});

export default function ProfilePage() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const [education, setEducation] = useState<z.infer<typeof FormSchema>[]>([]);

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
    const savedEducation = localStorage.getItem('experiences');
    if (savedEducation) {
      setEducation(JSON.parse(savedEducation));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('education', JSON.stringify(education));
  }, [education]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (editIndex !== null) {
      const updatedEducation = [...education];
      updatedEducation[editIndex] = data;
      setEducation(updatedEducation);
      localStorage.setItem('education', JSON.stringify(updatedEducation));
      console.log('Updated education:', updatedEducation); // Check updated state
    } else {
      setEducation([...education, data]);
    }
    form.reset();
    setIsDialogOpen(false);
  };

  const handleDelete = (index: number) => {
    const updatedEducation = education.filter((_, i) => i !== index);
    setEducation(updatedEducation);
    localStorage.setItem('education', JSON.stringify(updatedEducation)); // Update local storage
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    const educationInfo = education[index];
    form.setValue('degree', educationInfo.degree);
    form.setValue('universityName', educationInfo.universityName);
    form.setValue('fieldOfStudy', educationInfo.fieldOfStudy);
    form.setValue('start', new Date(educationInfo.start));
    form.setValue('end', new Date(educationInfo.end));
    form.setValue('grade', educationInfo.grade);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col md:flex-row items-center min-h-screen">
      <ProfileSidebar />
      <div className="p-6 rounded-lg w-full h-auto flex flex-col mt-44 m-64">
        <div className="-mt-44">
          <h2 className="text-white text-2xl font-bold mb-4">Education Info</h2>
        </div>

        <div className="w-full">
          {education.map((educationInfo, index) => (
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
                {educationInfo.degree}
              </p>
              <p className="text-gray-700 mb-1">
                University: {educationInfo.universityName}
              </p>
              {educationInfo.fieldOfStudy && (
                <p className="text-gray-600 mb-1">
                  Field of Study: {educationInfo.fieldOfStudy}
                </p>
              )}
              <p className="text-gray-600 mb-1">
                {format(educationInfo.start, 'PPP')} -{' '}
                {format(educationInfo.end, 'PPP')}
              </p>
              {educationInfo.grade && (
                <p className="text-gray-600">Grade: {educationInfo.grade}</p>
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
                Add Education
              </Button>
            </DialogTrigger>

            <DialogContent className="w-full max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Education</DialogTitle>
                <DialogDescription>
                  Add your relevant Education.
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
                      name="degree"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Enter Degree</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your degree title"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter your degree title
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="universityName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your university name"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter your university name
                          </FormDescription>
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
                            <Input
                              placeholder="Enter Reference Person Name"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter Field of Study
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