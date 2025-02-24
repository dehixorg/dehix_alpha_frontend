import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { Badge } from '@/components/ui/badge';

const profileFormSchema = z.object({
  projectName: z.string().min(2, {
    message: 'First Name must be at least 2 characters.',
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

  description: z.string().max(160).min(4).optional(),
  profiles: z
    .array(
      z.object({
        domain: z.string(),
        freelancersRequired: z // condition for freelancer
          .string()
          .refine((val) => parseInt(val, 10) > 0, {
            message: 'Number of freelancers required should be greater than 0.',
          }),
        skills: z.array(z.string()),
        experience: z.string(),
        minConnect: z.string(),
        rate: z //condition for rate
          .string()
          .refine((val) => parseFloat(val) >= 0, {
            message: 'Per hour rate should not be less than 0.',
          }),
        description: z.string().max(160).min(4),
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
  const [skills, setSkills] = useState<any>([]);
  const [currSkills, setCurrSkills] = useState<any>([]);
  const [tmpSkill, setTmpSkill] = useState<any>('');

  const [domains, setDomains] = useState<any>([]);
  const [currDomains] = useState<any>([]);

  const [projectDomains, setProjectDomains] = useState<any>([]); // add projectDomain
  const [currProjectDomains, setCurrProjectDomains] = useState<any>([]);
  const [tmpProjectDomains, setTmpProjectDomains] = useState<any>('');

  const [loading, setLoading] = useState(false);

  const handleAddProjectDomain = () => {
    if (
      tmpProjectDomains &&
      !currProjectDomains.some((domain: any) => domain === tmpProjectDomains)
    ) {
      setCurrProjectDomains([...currProjectDomains, tmpProjectDomains]);
      setTmpProjectDomains('');
    }
  };

  const handleDeleteProjectDomain = (domainToDelete: string) => {
    setCurrProjectDomains(
      currProjectDomains.filter((domain: any) => domain !== domainToDelete),
    );
  };

  const handleAddSkill = () => {
    if (tmpSkill && !currSkills.some((skill: any) => skill === tmpSkill)) {
      setCurrSkills([...currSkills, tmpSkill]);
      setTmpSkill('');
    }
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    setCurrSkills(currSkills.filter((skill: any) => skill !== skillToDelete));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectDomainResponse = await axiosInstance.get('/projectdomain');
        console.log(
          'projectDomain API Response get:',
          projectDomainResponse.data.data,
        );
        const transformedProjectDomain = projectDomainResponse.data.data.map(
          (skill: projectDomain) => ({
            value: skill.label, // Set the value to label
            label: skill.label, // Set the label to label
          }),
        );
        setProjectDomains(transformedProjectDomain);

        const domainResponse = await axiosInstance.get('/domain');
        console.log('Domain API Response get:', domainResponse.data.data);
        const transformedDomain = domainResponse.data.data.map(
          (skill: Domain) => ({
            value: skill.label, // Set the value to label
            label: skill.label, // Set the label to label
            domain_id: skill._id,
          }),
        );
        setDomains(transformedDomain);

        const skillsResponse = await axiosInstance.get('/skills');
        console.log('Skills API Response get:', skillsResponse.data.data);
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

  async function onSubmit(data: ProfileFormValues) {
    setLoading(true);
    try {
      console.log('Form body:', {
        ...data,
        role: '',
        projectType: '',
        skillsRequired: currSkills,
        domains: currDomains,
      });

      const response = await axiosInstance.post(`/project/business`, {
        ...data,
        role: '',
        projectType: 'FREELANCE',
        skillsRequired: currSkills,
        domains: currDomains,
      });
      console.log('API Response:', response.data);

      toast({
        title: 'Project Added',
        description: 'Your project has been successfully added.',
      });
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
                              onClick={handleAddSkill}
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
                                  onClick={() => handleDeleteSkill(skill)}
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
