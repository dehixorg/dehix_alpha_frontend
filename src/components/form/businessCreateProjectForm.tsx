import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';
import { useSelector } from 'react-redux';

import { Card } from '../ui/card';
import ConnectsDialog from '../shared/ConnectsDialog';

import { cn } from '@/lib/utils';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';
import { Badge } from '@/components/ui/badge';
import { RootState } from '@/lib/store';

const profileFormSchema = z.object({
  projectName: z.string().min(2, {
    message: 'Project Name must be at least 2 characters.',
  }),

  email: z
    .string({
      required_error: 'Email is required.',
    })
    .email({ message: 'Please enter a valid email address.' }),

  projectDomain: z
    .array(z.string().min(1, { message: 'Project domain cannot be empty.' }))
    .min(1, { message: 'At least one project domain is required.' }),

  urls: z
    .array(
      z.object({
        value: z.string().url({ message: 'Please enter a valid URL.' }),
      }),
    )
    .optional(),

  description: z
    .string()
    .min(4, { message: 'Description must be at least 4 characters long.' })
    .max(160, { message: 'Description cannot exceed 160 characters.' })
    .optional(),

  profiles: z
    .array(
      z.object({
        domain: z.string().min(1, { message: 'Domain is required.' }),

        freelancersRequired: z
          .string()
          .refine((val) => /^\d+$/.test(val) && parseInt(val, 10) > 0, {
            message:
              'Number of freelancers required should be a positive number.',
          }),

        skills: z
          .array(z.string().min(1, { message: 'Skill name cannot be empty.' }))
          .min(1, { message: 'At least one skill is required.' }),

        experience: z
          .string()
          .refine(
            (val) =>
              /^\d+$/.test(val) &&
              parseInt(val, 10) >= 0 &&
              parseInt(val, 10) <= 40,
            {
              message: 'Experience must be a number between 0 and 40.',
            },
          ),

        domain_id: z.string().min(1, { message: 'Domain ID is required.' }),

        minConnect: z
          .string()
          .refine((val) => /^\d+$/.test(val) && parseInt(val, 10) > 0, {
            message: 'Minimum connect must be at least 1.',
          }),

        rate: z
          .string()
          .refine(
            (val) => /^\d+(\.\d{1,2})?$/.test(val) && parseFloat(val) >= 0,
            {
              message: 'Per hour rate should be a valid non-negative number.',
            },
          ),

        description: z
          .string()
          .min(4, {
            message: 'Description must be at least 4 characters long.',
          })
          .max(160, { message: 'Description cannot exceed 160 characters.' }),
      }),
    )
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const defaultValues: Partial<ProfileFormValues> = {
  projectName: '',
  email: '', //default field for email
  projectDomain: [],
  description: '',
  profiles: [
    {
      domain: '',
      freelancersRequired: '',
      skills: [],
      experience: '',
      minConnect: '',
      rate: '',
      description: '',
      domain_id: '',
    },
  ],
};

interface Skill {
  _id: string;
  label: string;
}

interface Domain {
  _id: string;
  label: string;
}

interface projectDomain {
  _id: string;
  label: string;
}

export function CreateProjectBusinessForm() {
  const user = useSelector((state: RootState) => state.user);
  const [skills, setSkills] = useState<any>([]);
  const [currSkills, setCurrSkills] = useState<any>([]);
  const [tmpSkill, setTmpSkill] = useState<any>('');

  const [domains, setDomains] = useState<any>([]);
  const [currDomains, setCurrDomains] = useState<any>([]);

  const [projectDomains, setProjectDomains] = useState<any>([]); // add projectDomain
  const [currProjectDomains, setCurrProjectDomains] = useState<any>([]);
  const [tmpProjectDomains, setTmpProjectDomains] = useState<any>('');

  const [loading, setLoading] = useState(false);

  const handleAddProjectDomain = () => {
    if (
      tmpProjectDomains &&
      !currProjectDomains.some((d: any) => d === tmpProjectDomains)
    ) {
      const updatedDomains = [...currProjectDomains, tmpProjectDomains];

      setCurrProjectDomains(updatedDomains);
      setTmpProjectDomains('');

      form.setValue('projectDomain', updatedDomains);
    }
  };

  const handleDeleteProjectDomain = (domainToDelete: string) => {
    const updatedDomains = currProjectDomains.filter(
      (domain: any) => domain !== domainToDelete,
    );

    setCurrProjectDomains(updatedDomains);
    form.setValue('projectDomain', updatedDomains);
  };

  const handleAddSkill = (index: number) => {
    if (tmpSkill && !currSkills.includes(tmpSkill)) {
      const updatedSkills = [...currSkills, tmpSkill];
      setCurrSkills(updatedSkills);
      setTmpSkill('');

      form.setValue(`profiles.${index}.skills`, updatedSkills);
    }
  };

  const handleDeleteSkill = (index: number, skillToDelete: string) => {
    const updatedSkills = currSkills.filter(
      (skill: any) => skill !== skillToDelete,
    );
    setCurrSkills(updatedSkills);

    form.setValue(`profiles.${index}.skills`, updatedSkills);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectDomainResponse = await axiosInstance.get('/projectdomain');
        const transformedProjectDomain = projectDomainResponse.data.data.map(
          (skill: projectDomain) => ({
            value: skill.label, // Set the value to label
            label: skill.label, // Set the label to label
          }),
        );
        setProjectDomains(transformedProjectDomain);

        const domainResponse = await axiosInstance.get('/domain');
        const transformedDomain = domainResponse.data.data.map(
          (skill: Domain) => ({
            value: skill.label, // Set the value to label
            label: skill.label, // Set the label to label
            domain_id: skill._id,
          }),
        );

        setDomains(transformedDomain);

        const skillsResponse = await axiosInstance.get('/skills');
        const transformedSkills = skillsResponse.data.data.map(
          (skill: Skill) => ({
            value: skill.label, // Set the value to label
            label: skill.label, // Set the label to label
          }),
        );
        setSkills(transformedSkills);
      } catch (error) {
        console.error('API Error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong.Please try again.',
        }); // Error toast
      }
    };
    fetchData();
  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { fields: urlFields, append: appendUrl } = useFieldArray({
    name: 'urls',
    control: form.control,
  });

  const {
    fields: profileFields,
    append: appendProfile,
    remove: removeProfile,
  } = useFieldArray({
    name: 'profiles',
    control: form.control,
  });

  const removeUrl = (index: number) => {
    const currentUrls = form.getValues('urls') || [];
    const updatedUrls = currentUrls.filter((_, i) => i !== index);
    form.setValue('urls', updatedUrls);
  };

  async function onSubmit(data: ProfileFormValues) {
    setLoading(true);
    try {
      await axiosInstance.post(`/project/business`, {
        ...data,
        role: '',
        projectType: 'FREELANCE',
        skillsRequired: currSkills,
        domains: currDomains,
        companyId: user.uid,
        companyName: user.displayName,
      });
      toast({
        title: 'Project Added',
        description: 'Your project has been successfully added.',
      });

      const connectsCost = parseInt(
        process.env.NEXT_PUBLIC__APP_PROJECT_CREATION_COST || '0',
        10,
      );

      const updatedConnects = (
        parseInt(localStorage.getItem('DHX_CONNECTS') || '0') - connectsCost
      ).toString();
      localStorage.setItem('DHX_CONNECTS', updatedConnects);

      window.dispatchEvent(new Event('connectsUpdated'));
    } catch (error) {
      console.error('API Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add project. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
    form.reset(defaultValues); //add reset after form is submit
  }

  return (
    <Card className="p-10">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="gap-5 lg:grid lg:grid-cols-2 xl:grid-cols-2"
        >
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your Project Name" {...field} />
                </FormControl>
                <FormDescription>Enter your Project name</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormDescription>Enter your email</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="projectDomain"
            render={() => (
              <FormItem className="col-span-2">
                <FormLabel>Project Domain</FormLabel>
                <FormControl>
                  <div>
                    <div className="flex items-center mt-2">
                      <Select
                        onValueChange={(value) => setTmpProjectDomains(value)}
                        value={tmpProjectDomains || ''}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              tmpProjectDomains
                                ? tmpProjectDomains
                                : 'Select project domain'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {projectDomains
                            .filter(
                              (projectDomains: any) =>
                                !currProjectDomains.some(
                                  (d: any) => d.name === projectDomains.label,
                                ),
                            )
                            .map((projectDomains: any, index: number) => (
                              <SelectItem
                                key={index}
                                value={projectDomains.label}
                              >
                                {projectDomains.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        type="button"
                        size="icon"
                        className="ml-2"
                        onClick={handleAddProjectDomain}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap mt-5">
                      {currProjectDomains.map((domain: any, index: number) => (
                        <Badge
                          className="uppercase mx-1 text-xs font-normal bg-gray-400 flex items-center"
                          key={index}
                        >
                          {domain}
                          <button
                            type="button"
                            onClick={() => handleDeleteProjectDomain(domain)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Profile Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="lg:col-span-2 xl:col-span-2">
            {urlFields.map((field, index) => (
              <FormField
                control={form.control}
                key={field.id} // Ensure proper list key handling
                name={`urls.${index}.value`}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <div className="flex-1">
                      <FormLabel className={cn(index !== 0 && 'sr-only')}>
                        URLs
                      </FormLabel>
                      <FormDescription
                        className={`${index !== 0 ? 'sr-only' : ''} mb-2`}
                      >
                        Enter URL of your account
                      </FormDescription>
                      <FormControl>
                        <div className="flex justify-center items-center  gap-3 mb-2">
                          <Input {...field} />
                          {index >= 0 && (
                            <Button
                              variant="outline"
                              type="button"
                              size="icon"
                              className="ml-2"
                              onClick={() => removeUrl(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage className="my-2.5" />
                    </div>
                  </FormItem>
                )}
              />
            ))}
            <Button
              className="mt-2"
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendUrl({ value: '' })}
            >
              Add URL
            </Button>
          </div>

          <div className="lg:col-span-2 xl:col-span-2">
            {profileFields.map((field, index) => (
              <div key={index} className="border p-4 mb-4 rounded-md relative">
                <X
                  onClick={() => removeProfile(index)}
                  className="w-5 hover:text-red-600 h-5 absolute right-2 top-1 cursor-pointer"
                />
                <FormField
                  control={form.control}
                  name={`profiles.${index}.domain`}
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Profile Domain</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            const selectedDomain = domains.find(
                              (d: any) => d.label === value,
                            );
                            form.setValue(
                              `profiles.${index}.domain`,
                              selectedDomain?.label || '',
                            );
                            form.setValue(
                              `profiles.${index}.domain_id`,
                              selectedDomain?.domain_id || '',
                            );
                          }}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select domain" />
                          </SelectTrigger>
                          <SelectContent>
                            {domains.map((domain: any, index: number) => (
                              <SelectItem key={index} value={domain.label}>
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
                  name={`profiles.${index}.freelancersRequired`}
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Number of Freelancers Required</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter number"
                          min={1}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`profiles.${index}.skills`}
                  render={() => (
                    <FormItem className="mb-4">
                      <FormLabel>Skills</FormLabel>
                      <FormControl>
                        <div>
                          <div className="flex items-center mt-2">
                            <Select
                              onValueChange={(value) => setTmpSkill(value)}
                              value={tmpSkill || ''}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select skill" />
                              </SelectTrigger>
                              <SelectContent>
                                {skills.map((skill: any, index: number) => (
                                  <SelectItem key={index} value={skill.label}>
                                    {skill.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              type="button"
                              size="icon"
                              className="ml-2"
                              onClick={() => handleAddSkill(index)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap mt-5">
                            {currSkills.map((skill: any, index: number) => (
                              <Badge
                                className="uppercase mx-1 text-xs font-normal bg-gray-400 flex items-center"
                                key={index}
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteSkill(index, skill)
                                  }
                                  className="ml-2 text-red-500 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`profiles.${index}.experience`}
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Experience</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter experience"
                          min={0}
                          max={60}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`profiles.${index}.minConnect`}
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Min Connect</FormLabel>
                      <FormDescription>
                        Minimum number of connects for the project
                      </FormDescription>
                      <FormControl>
                        <Input
                          placeholder="Enter Min Connects (Recommended: 10)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`profiles.${index}.rate`}
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Per Hour Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter rate"
                          min={0}
                          max={200}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`profiles.${index}.description`}
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => removeProfile(index)}
                >
                  Remove Profile
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() =>
                appendProfile({
                  domain: '',
                  freelancersRequired: '',
                  skills: [],
                  experience: '',
                  minConnect: '',
                  rate: '',
                  description: '',
                  domain_id: '',
                })
              }
            >
              Add Profile
            </Button>
          </div>
          <div className="lg:col-span-2 xl:col-span-2 mt-4">
            <ConnectsDialog
              loading={loading}
              isValidCheck={form.trigger}
              onSubmit={form.handleSubmit(onSubmit)}
              setLoading={setLoading}
              userId={user.uid}
              buttonText={'Create Project'}
              userType={'BUSINESS'}
              requiredConnects={parseInt(
                process.env.NEXT_PUBLIC__APP_PROJECT_CREATION_COST || '0',
                10,
              )}
            />
          </div>
        </form>
      </Form>
    </Card>
  );
}
