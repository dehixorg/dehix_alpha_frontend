import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString().slice(0, 16); // Formats as YYYY-MM-DDTHH:MM
};

const formSchema = z.object({
  id: z.string().nonempty('ID is required'),
  projectName: z.string().nonempty('Project Name is required'),
  description: z.string().nonempty('Description is required'),
  verified: z.string().nonempty('Verified is required'),
  githubLink: z.string().url('Invalid URL'),
  startDate: z.string().nonempty('Start Date is required'),
  endDate: z.string().nonempty('End Date is required'),
  refer: z.string().nonempty('Refer is required'),
  techUsed: z.array(z.string()).nonempty('Tech Used is required'),
  role: z.string().nonempty('Role is required'),
  projectType: z.string().nonempty('Project Type is required'),
  oracleAssigned: z.string().nonempty('Oracle Assigned is required'),
  verificationStatus: z.string().nonempty('Verification Status is required'),
  verificationUpdateTime: z
    .string()
    .nonempty('Verification Update Time is required'),
  comments: z.string().nonempty('Comments are required'),
});

type FormSchema = z.infer<typeof formSchema>;

export default function ProjectForm() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      projectName: '',
      description: '',
      verified: '',
      githubLink: '',
      startDate: '',
      endDate: '',
      refer: '',
      techUsed: [''],
      role: '',
      projectType: '',
      oracleAssigned: '',
      verificationStatus: '',
      verificationUpdateTime: formatDateTime('2024-07-07T12:47:02.578+00:00'),
      comments: '',
    },
  });

  const handleSubmit = (values: FormSchema) => {
    // Convert the verificationUpdateTime back to the required format if needed
    values.verificationUpdateTime = new Date(
      values.verificationUpdateTime,
    ).toISOString();
    console.log({ values });
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-24">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="grid grid-cols-1 gap-6 max-w-md w-full md:grid-cols-2"
        >
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ID"
                    type="text"
                    {...field}
                    className="w-full "
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Project Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Project Name"
                    type="text"
                    {...field}
                    className="w-full"
                  />
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
                <FormLabel className="font-bold">Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Description"
                    type="text"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="verified"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Verified</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Verified"
                    type="text"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="githubLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">GitHub Link</FormLabel>
                <FormControl>
                  <Input
                    placeholder="GitHub Link"
                    type="url"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Start Date</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Start Date"
                    type="date"
                    {...field}
                    className="w-full "
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">End Date</FormLabel>
                <FormControl>
                  <Input
                    placeholder="End Date"
                    type="date"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="refer"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Refer</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Refer"
                    type="text"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="techUsed"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Tech Used</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Tech Used"
                    type="text"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Role</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Role"
                    type="text"
                    {...field}
                    className="w-full "
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="projectType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Project Type</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Project Type"
                    type="text"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="oracleAssigned"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Oracle Assigned</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Oracle Assigned"
                    type="text"
                    {...field}
                    className="w-full "
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="verificationStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Verification Status</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Verification Status"
                    type="text"
                    {...field}
                    className="w-full "
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="verificationUpdateTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">
                  Verification Update Time
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Verification Update Time"
                    type="datetime-local"
                    {...field}
                    className="w-full "
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Comments</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Comments"
                    type="text"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full col-span-2">
            Submit
          </Button>
        </form>
      </Form>
    </main>
  );
}
