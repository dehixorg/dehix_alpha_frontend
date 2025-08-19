'use client';

import React, { useState, useEffect } from 'react';
import { PackageOpen, Boxes, Home, Plus, X } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { useSelector } from 'react-redux';

import ConsultantCard from '@/components/cards/ConsultantCard';
import SidebarMenu from '@/components/menu/sidebarMenu';
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
import { ProjectStatus } from '@/utils/freelancer/enum';
import { Input } from '@/components/ui/input';
import Header from '@/components/header/header';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface Skill {
  label: string;
}

interface Domain {
  label: string;
}

// Define the schema for the form using Zod
const consultancyFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  skills: z.array(
    z.object({
      name: z.string().min(1, 'Skill is required'),
    }),
  ),
  domains: z.array(
    z.object({
      name: z.string().min(1, 'Domain is required'),
    }),
  ),
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
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [allDomains, setAllDomains] = useState<Domain[]>([]);
  const [tmpSkill, setTmpSkill] = useState<string>('');
  const [tmpDomain, setTmpDomain] = useState<string>('');
  const [searchSkillQuery, setSearchSkillQuery] = useState<string>('');
  const [searchDomainQuery, setSearchDomainQuery] = useState<string>('');
  const user = useSelector((state: RootState) => state.user);
  const [responseData, setResponseData] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await axiosInstance.get(`/project/business`);
        // setResponseData(response.data.data);

        const skillsResponse = await axiosInstance.get('/skills');
        setAllSkills(skillsResponse.data.data);

        const domainsResponse = await axiosInstance.get('/domain');
        setAllDomains(domainsResponse.data.data);
        console.log('All Skills:', allSkills);
        console.log('Search Query:', searchSkillQuery);
        console.log('Skill Fields:', allDomains);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong.Please try again.',
        });
        console.error('API Error:', error);
      }
    };

    fetchData();
  }, [user.uid]);

  const completedProjects = responseData.filter(
    (project: any) => project.status == ProjectStatus.COMPLETED,
  );
  const pendingProjects = responseData.filter(
    (project: any) => project.status !== ProjectStatus.COMPLETED,
  );

  const form = useForm<ConsultancyFormValues>({
    resolver: zodResolver(consultancyFormSchema),
    defaultValues: {
      name: '',
      skills: [],
      domains: [],
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

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    name: 'skills',
    control: form.control,
  });

  const {
    fields: domainFields,
    append: appendDomain,
    remove: removeDomain,
  } = useFieldArray({
    name: 'domains',
    control: form.control,
  });

  const handleAddSkill = () => {
    if (tmpSkill && !skillFields.some((field) => field.name === tmpSkill)) {
      appendSkill({ name: tmpSkill });
      setTmpSkill('');
      setSearchSkillQuery('');
    }
  };

  const handleAddDomain = () => {
    if (tmpDomain && !domainFields.some((field) => field.name === tmpDomain)) {
      appendDomain({ name: tmpDomain });
      setTmpDomain('');
      setSearchDomainQuery('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    removeSkill(index);
  };

  const handleRemoveDomain = (index: number) => {
    removeDomain(index);
  };

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
      setConsultants([...consultants, data]);
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong.Please try again.',
      });
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
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Consultancy Info"
          breadcrumbItems={[
            { label: 'Consultancy', link: '#' },
            { label: 'Consultancy Info', link: '#' },
          ]}
        />
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

                      {/* Skills Section */}
                      <FormItem>
                        <FormLabel>Skills</FormLabel>
                        <div className="flex items-center mt-2">
                          <Select
                            onValueChange={(value) => {
                              setTmpSkill(value);
                              setSearchSkillQuery('');
                            }}
                            value={tmpSkill || ''}
                            onOpenChange={(open) => {
                              if (!open) setSearchSkillQuery('');
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  tmpSkill ? tmpSkill : 'Select skill'
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="p-2 relative">
                                <input
                                  type="text"
                                  value={searchSkillQuery}
                                  onChange={(e) =>
                                    setSearchSkillQuery(e.target.value)
                                  }
                                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                  placeholder="Search skills"
                                />
                                {searchSkillQuery && (
                                  <button
                                    onClick={() => setSearchSkillQuery('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white text-xl transition-colors mr-2"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                              {allSkills
                                .filter(
                                  (skill) =>
                                    skill.label
                                      .toLowerCase()
                                      .includes(
                                        searchSkillQuery.toLowerCase(),
                                      ) &&
                                    !skillFields.some(
                                      (field) => field.name === skill.label,
                                    ),
                                )
                                .map((skill, index) => (
                                  <SelectItem key={index} value={skill.label}>
                                    {skill.label}
                                  </SelectItem>
                                ))}
                              {allSkills.filter(
                                (skill) =>
                                  skill.label
                                    .toLowerCase()
                                    .includes(searchSkillQuery.toLowerCase()) &&
                                  !skillFields.some(
                                    (field) => field.name === skill.label,
                                  ),
                              ).length === 0 && (
                                <div className="p-2 text-gray-500 italic text-center">
                                  No matching skills
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            type="button"
                            size="icon"
                            className="ml-2"
                            disabled={!tmpSkill}
                            onClick={handleAddSkill}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {skillFields.map((field, index) => (
                            <Badge
                              key={field.id}
                              className="uppercase text-xs font-normal bg-gray-300 flex items-center px-2 py-1"
                            >
                              {field.name}
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(index)}
                                className="ml-2 text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </FormItem>

                      {/* Domains Section */}
                      <FormItem>
                        <FormLabel>Domains</FormLabel>
                        <div className="flex items-center mt-2">
                          <Select
                            onValueChange={(value) => {
                              setTmpDomain(value);
                              setSearchDomainQuery('');
                            }}
                            value={tmpDomain || ''}
                            onOpenChange={(open) => {
                              if (!open) setSearchDomainQuery('');
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  tmpDomain ? tmpDomain : 'Select domain'
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="p-2 relative">
                                <input
                                  type="text"
                                  value={searchDomainQuery}
                                  onChange={(e) =>
                                    setSearchDomainQuery(e.target.value)
                                  }
                                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                  placeholder="Search domains"
                                />
                                {searchDomainQuery && (
                                  <button
                                    onClick={() => setSearchDomainQuery('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white text-xl transition-colors mr-2"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                              {allDomains
                                .filter(
                                  (domain) =>
                                    domain.label
                                      .toLowerCase()
                                      .includes(
                                        searchDomainQuery.toLowerCase(),
                                      ) &&
                                    !domainFields.some(
                                      (field) => field.name === domain.label,
                                    ),
                                )
                                .map((domain, index) => (
                                  <SelectItem key={index} value={domain.label}>
                                    {domain.label}
                                  </SelectItem>
                                ))}
                              {allDomains.filter(
                                (domain) =>
                                  domain.label
                                    .toLowerCase()
                                    .includes(
                                      searchDomainQuery.toLowerCase(),
                                    ) &&
                                  !domainFields.some(
                                    (field) => field.name === domain.label,
                                  ),
                              ).length === 0 && (
                                <div className="p-2 text-gray-500 italic text-center">
                                  No matching domains
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            type="button"
                            size="icon"
                            className="ml-2"
                            disabled={!tmpDomain}
                            onClick={handleAddDomain}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {domainFields.map((field, index) => (
                            <Badge
                              key={field.id}
                              className="uppercase text-xs font-normal bg-gray-300 flex items-center px-2 py-1"
                            >
                              {field.name}
                              <button
                                type="button"
                                onClick={() => handleRemoveDomain(index)}
                                className="ml-2 text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </FormItem>

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
                        skills={consultant.skills.map((s) => s.name)}
                        domains={consultant.domains.map((d) => d.name)}
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
                        cardClassName="min-w-[45%]"
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
                        cardClassName="min-w-[45%]"
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
