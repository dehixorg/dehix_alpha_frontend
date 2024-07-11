import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { DatePicker } from '../shared/datePicker';
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
import { MultiSelect } from '@/components/customFormComponents/multiselect'; // Import the custom MultiSelect component

const profileFormSchema = z.object({
  projectName: z.string().min(2, {
    message: 'First Name must be at least 2 characters.',
  }),
  email: z
    .string({
      required_error: 'Please select an email to display.',
    })
    .email(),
  phone: z.string().min(10, {
    message: 'Phone number must be at least 10 digits.',
  }),
  startDate: z.date(),
  role: z.string(),
  bio: z.string().max(160).min(4),
  urls: z
    .array(
      z.object({
        value: z.string().url({ message: 'Please enter a valid URL.' }),
      }),
    )
    .optional(),
  profiles: z
    .array(
      z.object({
        domain: z.string(),
        freelancersRequired: z.string(),
        skills: z.array(z.string()),
        experience: z.string(),
        rate: z.string(),
        description: z.string().max(160).min(4),
      }),
    )
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const defaultValues: Partial<ProfileFormValues> = {
  projectName: '',
  bio: 'I own a computer.',
  urls: [
    { value: 'https://shadcn.com' },
    { value: 'http://twitter.com/shadcn' },
  ],
  profiles: [
    {
      domain: '',
      freelancersRequired: '',
      skills: [],
      experience: '',
      rate: '',
      description: '',
    },
  ],
};

export function CreateProjectBusinessForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { fields: urlFields, append: appendUrl } = useFieldArray({
    name: 'urls',
    control: form.control,
  });

  const { fields: profileFields, append: appendProfile, remove: removeProfile } = useFieldArray({
    name: 'profiles',
    control: form.control,
  });

  function onSubmit(data: ProfileFormValues) {
    console.log("here we re showing the data",data);
    toast({
      title: 'You submitted the following values:',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
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
          {/* <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date </FormLabel>
                <FormControl>
                  <DatePicker />
                </FormControl>
                <FormDescription>
                  Enter Project start date
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          
          <div className="lg:col-span-2 xl:col-span-2">
            {urlFields.map((field, index) => (
              <FormField
                control={form.control}
                key={field.id}
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
              className="mt-2"
              onClick={() => appendUrl({ value: '' })}
            >
              Add URL
            </Button>
          </div>
          <div className="lg:col-span-2 xl:col-span-2">
            {profileFields.map((field, index) => (
              <div key={field.id} className="border p-4 mb-4 rounded-md">
                <FormField
                  control={form.control}
                  name={`profiles.${index}.domain`}
                  render={({ field }) => (
                    <FormItem>
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
                            <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                            <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                            <SelectItem value="Content Writer">Content Writer</SelectItem>
                            <SelectItem value="Project Manager">Project Manager</SelectItem>
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
                    <FormItem>
                      <FormLabel>Number of Freelancers Required</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`profiles.${index}.skills`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={[
                            { value: 'React', label: 'React' },
                            { value: 'Node.js', label: 'Node.js' },
                            { value: 'Python', label: 'Python' },
                            { value: 'AWS', label: 'AWS' },
                          ]}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`profiles.${index}.experience`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter experience" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`profiles.${index}.rate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Per Hour Rate</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter rate" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`profiles.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
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
                  freelancersRequired: "",
                  skills: [],
                  experience: '',
                  rate: "",
                  description: '',
                })
              }
            >
              Add Profile
            </Button>
          </div>
          <Button type="submit" className="lg:col-span-2 xl:col-span-2">
            Create Project
          </Button>
        </form>
      </Form>
    </Card>
  );
}