import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus } from 'lucide-react';

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
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm({ user_id }: { user_id: string }) {
  const [user, setUser] = useState<any>({});
  const [skills, setSkills] = useState<any>([]);
  const [currSkills, setCurrSkills] = useState<any>([]);
  const [tmpSkill, setTmpSkill] = useState<any>('');
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
    if (tmpSkill && !currSkills.includes(tmpSkill)) {
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
      ]); // Add tmpSkill to currSkills array if not already present
      setTmpSkill(''); // Reset tmpSkill to an empty string to clear the input/select
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/freelancer/${user_id}`); // Example API endpoint, replace with your actual endpoint
        console.log('API Response get:', response.data);
        setUser(response.data); // Store response data in state
        setCurrSkills(response.data.skills);
        const skills = await axiosInstance.get('/skills/all');
        console.log('API Response get:', skills.data.data);
        setSkills(skills.data.data);
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    fetchData(); // Call fetch data function on component mount
  }, [user_id]);

  useEffect(() => {
    // Reset form values when user state changes
    form.reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.userName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || '',
    });
  }, [user, form]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      console.log('API body', {
        ...data,
        skills: currSkills,
      });
      const response = await axiosInstance.put(`/freelancer/${user_id}`, {
        ...data,
        // skills: currSkills,
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
        skills: currSkills,
        // Update other fields as needed
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
          className="gap-10 lg:grid lg:grid-cols-2 xl:grid-cols-2"
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
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormDescription>Enter your email</FormDescription>
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
                  <Input placeholder="+91" {...field} />
                </FormControl>
                <FormMessage />
                <FormDescription>Enter your phone number</FormDescription>
              </FormItem>
            )}
          />
          {/* <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth{'\t'} </FormLabel>
                <FormControl>
                  <DatePicker {...field} />
                </FormControl>
                <FormDescription>
                  Your date of birth is used to calculate your age.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          {/* <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Role or Position</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Developer">Developer</SelectItem>
                      <SelectItem value="Designer">Designer</SelectItem>
                      <SelectItem value="Product Manager">
                        Product Manager
                      </SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Enter your current role or position
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <Separator className="lg:col-span-2 xl:col-span-2" />
          <div className="col-span-2">
            <FormLabel>Skills</FormLabel>
            <div className="flex items-center mt-2">
              <Select onValueChange={(value) => setTmpSkill(value)}>
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
          </div>

          <div className="lg:col-span-2 xl:col-span-2">
            {currSkills.map((skill: any, index: number) => (
              <Badge
                className="uppercase mx-1 text-xs font-normal bg-gray-300"
                key={index}
              >
                {skill.name}
              </Badge>
            ))}
          </div>
          <Button type="submit" className="lg:col-span-2 xl:col-span-2">
            Update profile
          </Button>
        </form>
      </Form>
    </Card>
  );
}
