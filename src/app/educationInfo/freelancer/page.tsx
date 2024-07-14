'use client';
import React, { useEffect, useState } from 'react';
import { Search, CalendarIcon, UserIcon } from 'lucide-react';
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
import SidebarMenu from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import Breadcrumb from '@/components/shared/breadcrumbList';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EducationInfoCard from '@/components/cards/freelancerProfile/eductaionInfoCard';

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
const educationData = [
  {
    degree: 'Bachelor of Science in Mechanical Engineering',
    universityName: 'University of California, Berkeley',
    fieldOfStudy: 'Mechanical Engineering',
    start: '2002-01-01',
    end: '2006-01-01',
    grade: '3.90 GPA',
  },
  {
    degree: 'Bachelor of Arts in English Language and Culture',
    universityName: 'University of Groningen',
    fieldOfStudy: 'English Language and Culture',
    start: '2014-01-01',
    end: '2017-01-01',
    grade: '3.84 GPA',
  },
  {
    degree: 'MBA in Business Administration',
    universityName: 'University of Maine',
    fieldOfStudy: 'Business Administration',
    start: '2014-01-01',
    end: '2016-01-01',
    grade: 'Magna Cum Laude',
  },
];

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

  // const handleDelete = (index: number) => {
  //   const updatedEducation = education.filter((_, i) => i !== index);
  //   setEducation(updatedEducation);
  //   localStorage.setItem('education', JSON.stringify(updatedEducation)); // Update local storage
  // };

  // const handleEdit = (index: number) => {
  //   setEditIndex(index);
  //   const educationInfo = education[index];
  //   form.setValue('degree', educationInfo.degree);
  //   form.setValue('universityName', educationInfo.universityName);
  //   form.setValue('fieldOfStudy', educationInfo.fieldOfStudy);
  //   form.setValue('start', new Date(educationInfo.start));
  //   form.setValue('end', new Date(educationInfo.end));
  //   form.setValue('grade', educationInfo.grade);
  //   setIsDialogOpen(true);
  // };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Freelancer Work"
      />
      <CollapsibleSidebarMenu menuItems={menuItemsTop} active="Dashboard" />

      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu menuItems={menuItemsTop} active="Projects" />
          <Breadcrumb
            items={[
              { label: 'Dashboard', link: '/dashboard/freelancer' },
              { label: 'Profile', link: '/settings/personal-info' },
              { label: 'Education Info', link: '#' },
            ]}
          />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/user.png" alt="@shadcn" />
                  <AvatarFallback>
                    <UserIcon size={16} />{' '}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>&ldquo;user email&rdquo;</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main
          className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 
                grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
        >
          {educationData.map((educationInfo: any, index: number) => (
            <EducationInfoCard key={index} {...educationInfo} />
          ))}

          <div>
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
                              <Input
                                placeholder="Enter your grade"
                                {...field}
                              />
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
        </main>
      </div>
    </div>
  );
}
