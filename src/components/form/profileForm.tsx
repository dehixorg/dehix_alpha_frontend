import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';

import { Card } from '../ui/card';

import { axiosInstance } from '@/lib/axiosinstance';
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
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
//import { Badge } from '@/components/ui/badge';
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
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const dummySkills = [
  { label: 'JavaScript' },
  { label: 'IOT (Internet of Things)' },
  { label: 'Node.js' },
  { label: 'Machine Learning' },
  { label: 'HTML' },
];

export function ProfileForm({ user_id }: { user_id: string }) {
  const [user, setUser] = useState<any>({});
  const [skills, setSkills] = useState<any>([]);
  const [currSkills, setCurrSkills] = useState<any>([]);
  const [tmpSkill, setTmpSkill] = useState<string>('');
  const [domains, setDomains] = useState<any>([]);
  const [currDomains, setCurrDomains] = useState<any>([]);
  const [tmpDomain, setTmpDomain] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

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

  const handleAddSkill = () => {
    if (tmpSkill && !selectedSkills.includes(tmpSkill)) {
      setSelectedSkills([...selectedSkills, tmpSkill]);
      setCurrSkills([
        ...currSkills,
        {
          name: tmpSkill,
          level: '',
          experience: '',
          interviewStatus: 'pending',
          interviewInfo: '',
          interviewerRating: 0,
        },
      ]);
      setTmpSkill(''); // Clear the temporary skill input
    }
  };

  const handleAddDomain = () => {
    if (
      tmpDomain &&
      !currDomains.some((domain: any) => domain.name === tmpDomain)
    ) {
      setCurrDomains([
        ...currDomains,
        {
          name: tmpDomain,
          level: '',
          experience: '',
          interviewStatus: 'pending',
          interviewInfo: '',
          interviewerRating: 0,
        },
      ]);
      setTmpDomain('');
    }
  };

  useEffect(() => {
    console.log('domain selected', currDomains);
  }, [currDomains]);

  const handleDeleteSkill = (skillToDelete: string) => {
    setCurrSkills(
      currSkills.filter((skill: any) => skill.name !== skillToDelete),
    );
    setSelectedSkills(
      selectedSkills.filter((skill) => skill !== skillToDelete),
    );
  };

  const handleDeleteDomain = (domainToDelete: string) => {
    setCurrDomains(
      currDomains.filter((domain: any) => domain.name !== domainToDelete),
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/freelancer/${user_id}`);
        console.log('API Response get:', response.data);
        setUser(response.data);
        setCurrSkills(response.data.skills);
        setCurrDomains(response.data.domain);

        const skillsResponse = await axiosInstance.get('/skills/all');
        console.log('API Response get:', skillsResponse.data.data);
        setSkills(skillsResponse.data.data);

        const domainsResponse = await axiosInstance.get('/domain/all');
        console.log('API Response get:', domainsResponse.data.data);
        setDomains(domainsResponse.data.data);
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    fetchData();
  }, [user_id]);

  useEffect(() => {
    form.reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.userName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || '',
      personalWebsite: user?.personalWebsite || '',
      resume: user?.resume || '',
    });
  }, [user, form]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      console.log('API body', {
        ...data,
        skills: currSkills,
        domain: currDomains,
      });
      const response = await axiosInstance.put(`/freelancer/${user_id}`, {
        ...data,
        skills: currSkills,
        domain: currDomains,
      });
      console.log('API Response:', response.data);

      setUser({
        ...user,
        firstName: data.firstName,
        lastName: data.lastName,
        userName: data.username,
        email: data.email,
        phone: data.phone,
        role: data.role,
        personalWebsite: data.personalWebsite,
        resume: data.resume,
        skills: currSkills,
        domain: currDomains,
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
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your first name" {...field} />
                </FormControl>
                <FormDescription>Enter your first name</FormDescription>
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
                <FormDescription>Enter your last name</FormDescription>
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
                <FormDescription>Enter your username</FormDescription>
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
                <FormDescription>Non editable field</FormDescription>
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
                <FormDescription>Non editable field</FormDescription>
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
                <FormDescription>
                  Enter your Personal Website URL
                </FormDescription>
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
                    placeholder="Enter the URL to your resume"
                    type="url"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Enter the URL to your resume</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your role" {...field} />
                </FormControl>
                <FormDescription>Enter your role</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem>
            <FormLabel>Skills</FormLabel>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 items-center">
                <Select value={tmpSkill} onValueChange={setTmpSkill}>
                  <SelectTrigger className="bg-light-gray border border-gray-400 rounded-md">
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {dummySkills.map((skill) => (
                      <SelectItem key={skill.label} value={skill.label}>
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
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedSkills.map((skill) => (
                  <div
                    key={skill}
                    className="bg-dark-gray text-white px-2 py-1 rounded-lg text-sm flex items-center border border-gray-300"
                    style={{ minWidth: '90px', minHeight: '25px' }}
                  >
                    {skill}
                    <Button
                      variant="outline"
                      type="button"
                      size="icon"
                      className="ml-2 p-1 bg-dark-gray text-white border-none hover:bg-gray-700"
                      onClick={() => handleDeleteSkill(skill)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </FormItem>

          <FormItem>
            <FormLabel>Domains</FormLabel>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 items-center">
                <Select value={tmpDomain} onValueChange={setTmpDomain}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.map((domain: any) => (
                      <SelectItem key={domain.name} value={domain.name}>
                        {domain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  type="button"
                  size="icon"
                  className="ml-2"
                  onClick={handleAddDomain}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {currDomains.map((domain: any) => (
                  <div
                    key={domain.name}
                    className="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg"
                    style={{ minWidth: '100px', minHeight: '30px' }}
                  >
                    {domain.name}
                    <Button
                      variant="outline"
                      type="button"
                      size="icon"
                      className="ml-2"
                      onClick={() => handleDeleteDomain(domain.name)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </FormItem>
        </form>
        <Separator className="my-5" />
        <div className="flex justify-center mt-6">
          <Button type="submit">Update Profile</Button>
        </div>
      </Form>
    </Card>
  );
}
