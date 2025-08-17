'use client';

import React, { useState, useEffect } from 'react';
import { PackageOpen, Boxes, Home, Plus, X } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { useSelector } from 'react-redux';

import ConsultantCard from '@/components/cards/ConsultantCard';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header/header';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';

interface Skill {
  label: string;
}

interface Domain {
  label: string;
}

const consultancyFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  skills: z.array(
    z.object({
      name: z.string().min(1, 'Skill is required'),
    })
  ),
  domains: z.array(
    z.object({
      name: z.string().min(1, 'Domain is required'),
    })
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

export default function ConsultancyDomainPage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [allDomains, setAllDomains] = useState<Domain[]>([]);
  const [tmpSkill, setTmpSkill] = useState<string>('');
  const [tmpDomain, setTmpDomain] = useState<string>('');
  const [searchSkillQuery, setSearchSkillQuery] = useState<string>('');
  const [searchDomainQuery, setSearchDomainQuery] = useState<string>('');
  const user = useSelector((state: RootState) => state.user);
  const [consultancies, setConsultancies] = useState<ConsultancyFormValues[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [consultancyIds, setConsultancyIds] = useState<string[]>([]);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [skillsResponse, domainsResponse, consultantsResponse] = await Promise.all([
        axiosInstance.get('/skills'),
        axiosInstance.get('/domain'),
        axiosInstance.get(`/freelancer/consultant`)
      ]);

      console.log('Raw consultants response:', consultantsResponse.data);

      setAllSkills(skillsResponse.data.data);
      setAllDomains(domainsResponse.data.data);

      // Normalize consultantsResponse.data
      const consultantsArray = Array.isArray(consultantsResponse.data) 
        ? consultantsResponse.data 
        : Object.values(consultantsResponse.data);

      // Extract ids
      setConsultancyIds(consultantsArray.map((c: any) => c._id));

      // Transform the API response to match your local state format
      const formattedConsultants = consultantsArray.map((consultant: any) => ({
        name: consultant.name || '',
        skills: consultant.skills?.map((s: string) => ({ name: s })) || [],
        domains: consultant.domain?.map((d: string) => ({ name: d })) || [],
        description: consultant.description || '',
        urls: consultant.links?.map((u: string) => ({ value: u })) || [],
        perHourRate: consultant.price
      }));

      setConsultancies(formattedConsultants);
      console.log('Formatted consultants:', formattedConsultants);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load data. Please try again.',
      });
      console.error('API Error:', error);
    }
  };

  fetchData();
}, [user.uid]);


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
    if (tmpSkill && !skillFields.some(field => field.name === tmpSkill)) {
      appendSkill({ name: tmpSkill });
      setTmpSkill('');
      setSearchSkillQuery('');
    }
  };

  const handleAddDomain = () => {
    if (tmpDomain && !domainFields.some(field => field.name === tmpDomain)) {
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

  const startEditing = (index: number) => {
    setEditingIndex(index);
    form.reset(consultancies[index]);
    setIsDialogOpen(true);
  };

  const deleteConsultancy = async (index: number) => {
  const consultant_id = consultancyIds[index];

  try {
    await axiosInstance.delete(`/freelancer/consultant/${consultant_id}`);

    setConsultancies(prev => prev.filter((_, i) => i !== index));
    setConsultancyIds(prev => prev.filter((_, i) => i !== index));

    toast({
      title: "Success",
      description: "Consultancy removed successfully",
    });
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to remove consultancy",
      variant: "destructive",
    });
    console.error(error);
  }
};


 const onSubmit = async (data: ConsultancyFormValues) => {
  try {
    const apiPayload = {
      status: "NOT_APPLIED",
      description: data.description || '',
      price: data.perHourRate,
      domain: data.domains.map(d => d.name),
      skills: data.skills.map(s => s.name),
      links: data.urls?.map(u => u.value).filter(Boolean) || [],
    };

    console.log("Sending payload:", apiPayload);

    let response;
    if (editingIndex !== null) {
      // Update existing consultancy
      const consultant_id = consultancyIds[editingIndex];
      response = await axiosInstance.put(`/freelancer/consultant/${consultant_id}`, apiPayload);
    } else {
      // Create new consultancy
      response = await axiosInstance.post('/freelancer/consultant', apiPayload);
    }

    console.log('API Response:', response.data);

    // Update local state
    const statePayload = {
      name: data.name,
      skills: data.skills,
      domains: data.domains,
      description: data.description || '',
      urls: data.urls || [],
      perHourRate: data.perHourRate
    };

    if (editingIndex !== null) {
      // Update existing item in state
      const updated = [...consultancies];
      updated[editingIndex] = statePayload;
      setConsultancies(updated);
    } else {
      // Add new item to state
      setConsultancies([...consultancies, statePayload]);
      // Also add the new ID if this was a create operation
      setConsultancyIds([...consultancyIds, response.data._id]);
    }

    // Reset form and close dialog
    form.reset({
      name: '',
      skills: [],
      domains: [],
      description: '',
      urls: [{ value: '' }],
      perHourRate: undefined,
    });
    
    setEditingIndex(null);
    setIsDialogOpen(false);
    
    toast({
      title: 'Success',
      description: `Consultancy ${editingIndex !== null ? 'updated' : 'added'} successfully`,
    });
  } catch (error: any) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to save consultancy data',
    });
  }
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

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Consultancy Domain"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Consultancy Domain"
          breadcrumbItems={[
            { label: 'Consultancy', link: '#' },
            { label: 'Domain', link: '#' },
          ]}
        />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Consultancy Domains</h1>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Consultancy Domain
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl overflow-y-auto max-h-screen">
                  <DialogHeader>
                    <DialogTitle>
                      {editingIndex !== null ? 'Edit Consultancy Domain' : 'Add Consultancy Domain'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingIndex !== null ? 'Update your consultancy profile' : 'Create a new consultancy profile'}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      {/* Form fields remain the same as before */}
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
                              <SelectValue placeholder={tmpSkill ? tmpSkill : 'Select skill'} />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="p-2 relative">
                                <input
                                  type="text"
                                  value={searchSkillQuery}
                                  onChange={(e) => setSearchSkillQuery(e.target.value)}
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
                                      .includes(searchSkillQuery.toLowerCase()) &&
                                    !skillFields.some(field => field.name === skill.label)
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
                                  !skillFields.some(field => field.name === skill.label)
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
                              <SelectValue placeholder={tmpDomain ? tmpDomain : 'Select domain'} />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="p-2 relative">
                                <input
                                  type="text"
                                  value={searchDomainQuery}
                                  onChange={(e) => setSearchDomainQuery(e.target.value)}
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
                                      .includes(searchDomainQuery.toLowerCase()) &&
                                    !domainFields.some(field => field.name === domain.label)
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
                                    .includes(searchDomainQuery.toLowerCase()) &&
                                  !domainFields.some(field => field.name === domain.label)
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
                        <Button type="submit">Save</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex flex-wrap gap-6">
            {consultancies.length > 0 ? (
                consultancies.map((consultancy, index) => (
                  <div
        key={index}
        className="relative group w-[380px] p-4 rounded-xl shadow-md bg-black border border-gray-800"
      >
                    <ConsultantCard
                      name={consultancy.name}
                      skills={consultancy.skills.map(s => s.name)}
                      domains={consultancy.domains.map(d => d.name)}
                      description={consultancy.description}
                      urls={consultancy.urls?.filter(u => u.value)}
                      perHourRate={consultancy.perHourRate}
                    />
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(index)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteConsultancy(index)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              
            ) : (
              <div className="flex flex-col items-center justify-center mt-[5rem]">
                <PackageOpen className="mx-auto text-gray-500" size="100" />
                <p className="text-gray-500 mt-4">
                  No consultancy domains created yet. Click "Add Consultancy Domain" to get started.
                </p>
              </div>
            )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}