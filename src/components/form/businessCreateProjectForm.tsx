import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useSelector } from 'react-redux';
import { Plus, X } from 'lucide-react';

import { Card } from '../ui/card';

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
import { RootState } from '@/lib/store';
import { Badge } from '@/components/ui/badge';

const profileFormSchema = z.object({
  projectName: z.string().min(2, {
    message: 'Project Name must be at least 2 characters.',
  }),
  email: z
    .string({
      required_error: 'Please select an email to display.',
    })
    .email(),
  //adddomain
  projectDomain: z.array(z.string()),

  urls: z
    .array(
      z.object({
        value: z.string().url({ message: 'Please enter a valid URL.' }),
      }),
    )
    .optional(),

  description: z.string().max(500).min(20).optional(),
  profiles: z
    .array(
      z.object({
        domain: z.string(),
        freelancersRequired: z.string().refine((val) => parseInt(val, 10) > 0, {
          message: 'Number of freelancers required must be greater than 0.',
        }),
        skills: z.array(z.string()),
        experience: z.string(),
        minConnect: z.string(),
        rate: z //condition for rate
          .string()
          .refine((val) => parseFloat(val) >= 0, {
            message: 'Rate per hour must be non-negative.',
          }),
        description: z.string().max(200).min(20),
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

  const [skills, setSkills] = useState<Skill[]>([]);
  const [currSkills, setCurrSkills] = useState<string[]>([]);

  const [domains, setDomains] = useState<Domain[]>([]);

  const [projectDomains, setProjectDomains] = useState<projectDomain[]>([]);
  const [currProjectDomains, setCurrProjectDomains] = useState<string[]>([]);
  const [tmpProjectDomains, setTmpProjectDomains] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const handleAddProjectDomain = () => {
    if (tmpProjectDomains && !currProjectDomains.includes(tmpProjectDomains)) {
      setCurrProjectDomains([...currProjectDomains, tmpProjectDomains]);
      setTmpProjectDomains('');
    }
  };

  const handleDeleteProjectDomain = (domainToDelete: string) => {
    setCurrProjectDomains(
      currProjectDomains.filter((domain: any) => domain !== domainToDelete),
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectDomainResponse, domainResponse, skillsResponse] =
          await Promise.all([
            axiosInstance.get('/projectdomain'),
            axiosInstance.get('/domain'),
            axiosInstance.get('/skills'),
          ]);
        if (domainResponse.status == 200 && domainResponse?.data?.data) {
          setDomains(
            domainResponse?.data?.data.map((domain: any) => ({
              value: domain?.label,
              label: domain?.label,
            })),
          );
        }
        if (skillsResponse.status == 200 && skillsResponse?.data?.data) {
          setSkills(
            skillsResponse?.data?.data.map((skill: any) => ({
              value: skill?.label,
              label: skill?.label,
            })),
          );
        }
        if (
          projectDomainResponse.status == 200 &&
          projectDomainResponse?.data?.data
        ) {
          setProjectDomains(
            projectDomainResponse?.data?.data.map((projectDoamin: any) => ({
              value: projectDoamin?.label,
              label: projectDoamin?.label,
            })),
          );
        }
      } catch (error) {
        console.error('API Error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load data. Please try again later.',
        });
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

  // A function to add skills to a specific profile
  const handleAddSkillToProfile = (profileIndex: any, skill: any) => {
    const currentSkills = form.getValues(`profiles.${profileIndex}.skills`);
    if (!currentSkills.includes(skill)) {
      form.setValue(`profiles.${profileIndex}.skills`, [
        ...currentSkills,
        skill,
      ]);
    }
    if (!currSkills.includes(skill)) {
      setCurrSkills([...currSkills, skill]);
    }
  };

  // A function to remove skills from a specific profile
  const handleRemoveSkillFromProfile = (profileIndex: any, skill: any) => {
    const updatedSkills = form
      .getValues(`profiles.${profileIndex}.skills`)
      .filter((s) => s !== skill);
    form.setValue(`profiles.${profileIndex}.skills`, updatedSkills);

    setCurrSkills(currSkills.filter((skill) => skill !== skill));
  };

  async function onSubmit(data: ProfileFormValues) {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        `/project/business/${user.uid}`,
        {
          ...data,
          companyId: user.uid,
          role: '',
          projectType: '',
          projectDomain: currProjectDomains,
          skillsRequired: currSkills,
        },
      );
      if (response.status === 200) {
        toast({
          title: 'Project Added',
          description: 'Your project has been successfully added.',
        });
      } else {
        throw new Error('Failed to add project');
      }
    } catch (error) {
      console.error('API Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add project. Please try again later.',
      });
    } finally {
      setLoading(false);
      form.reset(defaultValues); //add reset after form is submit
    }
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
                <FormLabel>Description</FormLabel>
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
                key={index}
                name={`urls.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && 'sr-only')}>
                      URLs
                    </FormLabel>
                    <FormDescription className={cn(index !== 0 && 'sr-only')}>
                      Enter URL of your account
                    </FormDescription>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
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
              <div key={index} className="border p-4 mb-4 rounded-md">
                <FormField
                  control={form.control}
                  name={`profiles.${index}.domain`}
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Profile Domain</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select domain" />
                            </SelectTrigger>
                          </FormControl>
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
                              onValueChange={(value) =>
                                handleAddSkillToProfile(index, value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select skill" />
                              </SelectTrigger>
                              <SelectContent>
                                {skills.map((skill) => (
                                  <SelectItem
                                    key={skill._id}
                                    value={skill.label}
                                  >
                                    {skill.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {/* <Button
                              variant="outline"
                              type="button"
                              size="icon"
                              className="ml-2"
                              onClick={handleAddSkill}
                            >
                              <Plus className="h-4 w-4" />
                            </Button> */}
                          </div>
                          <div className="flex flex-wrap mt-5">
                            {form
                              .getValues(`profiles.${index}.skills`)
                              .map((skill, skillIndex) => (
                                <Badge
                                  key={skillIndex}
                                  className="uppercase mx-1 text-xs font-normal bg-gray-400 flex items-center"
                                >
                                  {skill}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveSkillFromProfile(index, skill)
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
                      <FormControl>
                        <Input placeholder="Enter Min Connects" {...field} />
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
                })
              }
            >
              Add Profile
            </Button>
          </div>
          <Button
            type="submit"
            className="lg:col-span-2 xl:col-span-2 mt-4"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Create Project'}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
