'use client';

import React, { useState, useEffect } from 'react';
import { Search, PackageOpen, Boxes, Home, Plus, X } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { useSelector } from 'react-redux';

import ConsultantCard from '@/components/cards/ConsultantCard';
import { Input } from '@/components/ui/input';
import SidebarMenu from '@/components/menu/sidebarMenu';
import DropdownProfile from '@/components/shared/DropdownProfile';
import Breadcrumb from '@/components/shared/breadcrumbList';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from '@/components/ui/select';
import { CardTitle } from '@/components/ui/card';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import { ProjectCard } from '@/components/cards/projectCard';
import { Separator } from '@/components/ui/separator';

interface Skill {
  label: string;
}

interface Domain {
  label: string;
}

// Define the schema for the form using Zod
const consultancyFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  skills: z.string().min(1, 'Skill is required'),
  domains: z.string().min(1, 'Domain is required'),
  description: z.string().optional(),
  urls: z
    .array(
      z.object({
        value: z.string().url({ message: 'Please enter a valid URL.' }),
      }),
    )
    .optional(),
  perHourRate: z
    .preprocess(
      (val) => (val === '' ? undefined : Number(val)),
      z.number().min(0, 'Per hour rate must be a positive number'),
    )
    .optional(),
});

type ConsultancyFormValues = z.infer<typeof consultancyFormSchema>;

export default function ConsultancyPage() {
  const experience = 5;
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [consultants, setConsultants] = useState<ConsultancyFormValues[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const user = useSelector((state: RootState) => state.user);
  const [responseData, setResponseData] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/business/${user.uid}/projects`,
        );
        setResponseData(response.data.data);

        const skillsResponse = await axiosInstance.get('/skills/all');
        setSkills(skillsResponse.data.data);

        const domainsResponse = await axiosInstance.get('/domain/all');
        setDomains(domainsResponse.data.data);
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    fetchData();
  }, [user.uid]);

  const completedProjects = responseData.filter(
    (project: any) => project.status == 'Completed',
  );
  const pendingProjects = responseData.filter(
    (project: any) => project.status !== 'Completed',
  );

  const form = useForm<ConsultancyFormValues>({
    resolver: zodResolver(consultancyFormSchema),
    defaultValues: {
      name: '',
      skills: '',
      description: '',
      urls: [{ value: '' }],
      perHourRate: undefined,
    },
    mode: 'all',
  });

  const {
    fields: urlFields,
    append: appendUrl,
    remove: removeUrl,
  } = useFieldArray({
    name: 'urls',
    control: form.control,
  });

  const menuItemsTop = [
    {
      href: '#',
      icon: <Boxes className="h-4 w-4 transition-all group-hover:scale-110" />,
      label: 'Dehix',
    },
  ];

  const menuItemsBottom = [
    {
      href: '/dashboard/freelancer',
      icon: <Home className="h-5 w-5" />,
      label: 'Settings',
    },
  ];

  const onSubmit = async (data: ConsultancyFormValues) => {
    try {
      console.log('Form Data:', data);
      setConsultants([...consultants, data]);
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Consultancy Info"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Consultancy Info"
          />
          <Breadcrumb
            items={[
              { label: 'Consultancy', link: '#' },
              { label: 'Consultancy Info', link: '#' },
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
          <DropdownProfile />
        </header>
        {experience < 5 ? (
          <div className="flex flex-col items-center justify-center mt-[10rem]">
            <PackageOpen className="mx-auto text-gray-500" size="100" />
            <p className="text-gray-500 mt-4">
              Your Experience is not Eligible for Consultancy
            </p>
          </div>
        ) : (
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
            <div className="lg:col-span-2 xl:col-span-2 space-y-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Add Consultancy</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Consultancy</DialogTitle>
                    <DialogDescription>
                      Fill in the details of the consultancy below.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter Title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skills</FormLabel>
                            <FormControl>
                              <Select
                                {...field}
                                onValueChange={(value) => field.onChange(value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a skill" />
                                </SelectTrigger>
                                <SelectContent>
                                  {skills.map((skill) => (
                                    <SelectItem
                                      key={skill.label}
                                      value={skill.label}
                                    >
                                      {skill.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="domains"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Domains</FormLabel>
                            <FormControl>
                              <Select
                                {...field}
                                onValueChange={(value) => field.onChange(value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a domain" />
                                </SelectTrigger>
                                <SelectContent>
                                  {domains.map((domain) => (
                                    <SelectItem
                                      key={domain.label}
                                      value={domain.label}
                                    >
                                      {domain.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
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
                              <Input
                                placeholder="Enter description"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="perHourRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Per Hour Rate</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter per hour rate"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value)}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormItem>
                        <FormLabel>URLs</FormLabel>
                        <br />
                        {urlFields.map((urlField, index) => (
                          <div
                            key={urlField.id}
                            className="flex items-center space-x-2"
                          >
                            <FormControl>
                              <Controller
                                name={`urls.${index}.value`}
                                control={form.control}
                                render={({ field }) => (
                                  <Input placeholder="Enter URL" {...field} />
                                )}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              onClick={() => removeUrl(index)}
                              size="icon"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => appendUrl({ value: '' })}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add URL
                        </Button>
                      </FormItem>
                      <DialogFooter>
                        <Button type="submit">Submit</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              <div className="flex flex-wrap gap-8">
                {consultants.length == 0 ? (
                  <div className="flex flex-col items-center justify-center w-full">
                    <PackageOpen className="text-gray-500" size="100" />
                    <p className="text-gray-500">No consultancy added</p>
                  </div>
                ) : (
                  <div>
                    {consultants.map((consultant, index) => (
                      <ConsultantCard
                        key={index}
                        name={consultant.name}
                        skills={consultant.skills}
                        domains={consultant.domains}
                        description={consultant.description}
                        urls={consultant.urls}
                        perHourRate={consultant.perHourRate}
                      />
                    ))}
                  </div>
                )}
              </div>
              <Separator className="my-1" />
              <div className="grid grid-cols-1 gap-4">
                <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                  Current Projects {`(${pendingProjects.length})`}
                </h2>
                <div className="flex gap-4 overflow-x-scroll no-scrollbar pb-8">
                  {pendingProjects.length > 0 ? (
                    pendingProjects.map((project: any, index: number) => (
                      <ProjectCard
                        key={index}
                        className="min-w-[45%]"
                        project={project}
                      />
                    ))
                  ) : (
                    <div className="text-center py-10 w-[100%] ">
                      <PackageOpen
                        className="mx-auto text-gray-500"
                        size="100"
                      />
                      <p className="text-gray-500">No projects available</p>
                    </div>
                  )}
                </div>

                <Separator className="my-1" />
                <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                  Completed Projects {`(${completedProjects.length})`}
                </h2>
                <div className="flex gap-4 overflow-x-scroll no-scrollbar pb-8">
                  {completedProjects.length > 0 ? (
                    completedProjects.map((project: any, index: number) => (
                      <ProjectCard
                        key={index}
                        className="min-w-[45%]"
                        project={project}
                      />
                    ))
                  ) : (
                    <div className="text-center py-10 w-[100%] ">
                      <PackageOpen
                        className="mx-auto text-gray-500"
                        size="100"
                      />
                      <p className="text-gray-500">No projects available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="lg:col-span-1 xl:col-span-1 space-y-4">
              <CardTitle className="group flex items-center gap-2 text-2xl">
                Consultancy Invitations
              </CardTitle>
              <div className="text-center py-10">
                <PackageOpen className="mx-auto text-gray-500" size="100" />
                <p className="text-gray-500">No Consultancy Invitation</p>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
