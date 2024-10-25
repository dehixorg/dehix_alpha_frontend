import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';

import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';

import { axiosInstance } from '@/lib/axiosinstance';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from '@/components/ui/select';

const profileFormSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First Name must be at least 2 characters.',
  }),
  lastName: z.string().min(2, {
    message: 'Last Name must be at least 2 characters.',
  }),
  username: z
    .string()
    .min(2, {
      message: 'Username must be at least 2 characters.',
    })
    .max(30, {
      message: 'Username must not be longer than 30 characters.',
    }),
  email: z.string().email(),
  phone: z.string().min(10, {
    message: 'Phone number must be at least 10 digits.',
  }),
  role: z.string(),
  personalWebsite: z.string().url().optional(),
  resume: z.string().url().optional(),
  description: z.string().max(500, {
    message: 'Description cannot exceed 500 characters.',
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm({ user_id }: { user_id: string }) {
  // User's current skills, domains, and project domains
  const [userSkills, setUserSkills] = useState<any[]>([]);
  const [userDomains, setUserDomains] = useState<any[]>([]);
  const [userProjectDomains, setUserProjectDomains] = useState<any[]>([]);

  // Options for dropdowns
  const [skillsOptions, setSkillsOptions] = useState<any[]>([]);
  const [domainsOptions, setDomainsOptions] = useState<any[]>([]);
  const [projectDomainsOptions, setProjectDomainsOptions] = useState<any[]>([]);

  const [selectedItems, setSelectedItems] = useState({
    skill: '',
    domain: '',
    projectDomain: '',
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phone: '',
      role: '',
    },
    mode: 'all',
  });

  const addItem = (
    list: any[],
    setList: React.Dispatch<any>,
    item: any,
    type: string,
  ) => {
    if (item && !list.some((i) => i.name === item)) {
      setList([
        ...list,
        {
          name: item,
          level: '',
          experience: '',
          interviewStatus: 'pending',
          interviewInfo: '',
          interviewerRating: 0,
        },
      ]);

      setSelectedItems((prev) => ({ ...prev, [type]: '' }));
    }
  };

  const deleteItem = (
    list: any[],
    setList: React.Dispatch<any>,
    itemName: string,
  ) => {
    setList(list.filter((item) => item.name !== itemName));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axiosInstance.get(`/freelancer/${user_id}`);
        const skillsResponse = await axiosInstance.get('/skills/all');
        const domainsResponse = await axiosInstance.get('/domain/all');
        const projectDomainResponse =
          await axiosInstance.get('/projectDomain/all');

        // Set options for dropdowns
        setSkillsOptions(skillsResponse.data.data);
        setDomainsOptions(domainsResponse.data.data);
        setProjectDomainsOptions(projectDomainResponse.data.data);

        // Set user's current selections
        setUserSkills(userResponse.data.skills || []);
        setUserDomains(userResponse.data.domain || []);
        setUserProjectDomains(userResponse.data.projectDomains || []);

        form.reset({
          firstName: userResponse.data.firstName || '',
          lastName: userResponse.data.lastName || '',
          username: userResponse.data.userName || '',
          email: userResponse.data.email || '',
          phone: userResponse.data.phone || '',
          role: userResponse.data.role || '',
          personalWebsite: userResponse.data.personalWebsite || '',
          resume: userResponse.data.resume || '',
          description: userResponse.data.description || '',
        });
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    fetchData();
  }, [user_id, form]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      await axiosInstance.put(`/freelancer/${user_id}`, {
        ...data,
        skills: userSkills,
        domain: userDomains,
        projectDomain: userProjectDomains,
        description: data.description,
      });

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('API Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile. Please try again later.',
      });
    }
  }

  return (
    <Card className="p-10">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-10 grid-cols-2"
        >
          {/* Form fields for user info */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} disabled />
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

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+91" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="personalWebsite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Personal Website URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your LinkedIn URL"
                    type="url"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="resume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resume URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your Resume URL"
                    type="url"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="col-span-2" />

          {/* Skills, Domains, and Project Domains Section */}
          <div className="flex flex-wrap gap-6 w-full">
            {['Skills', 'Domains', 'Project Domains'].map((label, idx) => {
              const list =
                idx === 0
                  ? userSkills
                  : idx === 1
                    ? userDomains
                    : userProjectDomains;
              const options =
                idx === 0
                  ? skillsOptions
                  : idx === 1
                    ? domainsOptions
                    : projectDomainsOptions;
              const setList =
                idx === 0
                  ? setUserSkills
                  : idx === 1
                    ? setUserDomains
                    : setUserProjectDomains;
              const type =
                idx === 0 ? 'skill' : idx === 1 ? 'domain' : 'projectDomain';
              return (
                <div key={label} className="flex-1 min-w-[150px] max-w-[300px]">
                  <FormLabel>{label}</FormLabel>
                  <div className="flex items-center mt-2">
                    <Select
                      onValueChange={(value) =>
                        setSelectedItems((prev) => ({
                          ...prev,
                          [type]: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue
                          placeholder={`Select a ${label.toLowerCase()}`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((option: any) => (
                          <SelectItem key={option.label} value={option.label}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      className="ml-2"
                      onClick={() =>
                        addItem(list, setList, selectedItems[type], type)
                      }
                    >
                      <Plus size={20} />
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {list?.map((item: any) => (
                      <Badge
                        className="uppercase text-xs font-normal bg-gray-300 flex items-center px-2 py-1"
                        key={item.name}
                      >
                        {item.name}

                        <button
                          type="button"
                          onClick={() => deleteItem(list, setList, item.name)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <Button type="submit" className="col-span-2">
            Save Changes
          </Button>
        </form>
      </Form>
    </Card>
  );
}
