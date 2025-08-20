import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import ThumbnailUpload from '@/components/fileUpload/thumbnailUpload';

// Schema for form validation using zod
const editProjectFormSchema = z
  .object({
    projectName: z.string().min(1, { message: 'Project name is required.' }),
    description: z.string().min(1, { message: 'Description is required.' }),
    githubLink: z
      .string()
      .url({ message: 'GitHub Repository link must be a valid URL.' })
      .optional()
      .refine((url) => (url ? url.startsWith('https://github.com/') : true), {
        message: 'GitHub repository URL must start with https://github.com/',
      }),
    liveDemoLink: z
      .string()
      .url({ message: 'Live demo link must be a valid URL.' })
      .optional(),
    start: z.string().min(1, { message: 'Start date is required.' }),
    end: z.string().min(1, { message: 'End date is required.' }),
    refer: z.string().min(1, { message: 'Reference is required.' }),
    techUsed: z
      .array(z.string())
      .min(1, { message: 'At least one technology is required.' }),
    role: z.string().min(1, { message: 'Role is required.' }),
    projectType: z.string().optional(),
    comments: z.string().optional(),
    thumbnail: z.string().min(1, { message: 'Project thumbnail is required.' }),
  })
  .refine(
    (data) => {
      if (data.start && data.end) {
        const start = new Date(data.start);
        const end = new Date(data.end);
        return start < end;
      }
      return true;
    },
    {
      message: 'Start Date must be before End Date',
      path: ['end'],
    },
  );

type EditProjectFormValues = z.infer<typeof editProjectFormSchema>;

interface EditProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project: {
    _id: string;
    projectName: string;
    description: string;
    githubLink: string;
    liveDemoLink?: string;
    thumbnail?: string;
    start: string;
    end: string;
    refer: string;
    techUsed: string[];
    role: string;
    projectType: string;
    comments: string;
  };
}

interface Skill {
  _id: string;
  label: string;
}

const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  project,
}) => {
  const [skills, setSkills] = useState<any>([]);
  const [currSkills, setCurrSkills] = useState<string[]>(
    project.techUsed || [],
  );
  const [tmpSkill, setTmpSkill] = useState<any>('');
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<EditProjectFormValues>({
    resolver: zodResolver(editProjectFormSchema),
    defaultValues: {
      projectName: project.projectName || '',
      description: project.description || '',
      githubLink: project.githubLink || '',
      liveDemoLink: project.liveDemoLink || '',
      start: project.start
        ? new Date(project.start).toISOString().split('T')[0]
        : '',
      end: project.end ? new Date(project.end).toISOString().split('T')[0] : '',
      refer: project.refer || '',
      techUsed: project.techUsed || [],
      role: project.role || '',
      projectType: project.projectType || '',
      comments: project.comments || '',
      thumbnail: project.thumbnail || '',
    },
    mode: 'all',
  });

  const handleAddSkill = (field: { onChange: (value: any) => void }) => {
    if (tmpSkill.trim() && !currSkills.includes(tmpSkill)) {
      const newSkills = [...currSkills, tmpSkill];
      setCurrSkills(newSkills);
      field.onChange(newSkills);
      setTmpSkill('');
    }
  };

  const handleDeleteSkill = (
    skillToDelete: string,
    field: { onChange: (value: any) => void },
  ) => {
    const newSkills = currSkills.filter(
      (skill: any) => skill !== skillToDelete,
    );
    setCurrSkills(newSkills);
    field.onChange(newSkills);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsResponse = await axiosInstance.get('/skills');
        const transformedSkills =
          skillsResponse?.data?.data?.map((skill: Skill) => ({
            value: skill.label,
            label: skill.label,
          })) || [];
        setSkills(transformedSkills);
      } catch (error) {
        console.error('API Error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong. Please try again.',
        });
      }
    };
    fetchData();
  }, []);

  // Submit handler for the form
  async function onSubmit(data: EditProjectFormValues) {
    setLoading(true);
    try {
      await axiosInstance.put(`/freelancer/project/${project._id}`, {
        ...data,
        techUsed: currSkills,
        start: data.start ? new Date(data.start).toISOString() : null,
        end: data.end ? new Date(data.end).toISOString() : null,
        verificationUpdateTime: new Date().toISOString(),
      });

      onSuccess();
      onClose();
      toast({
        title: 'Project Updated',
        description: 'The project has been successfully updated.',
      });
    } catch (error) {
      console.error('API Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update project. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="lg:max-w-screen-lg overflow-y-scroll max-h-screen no-scrollbar">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
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
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter role" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter project description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="githubLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Repo Link</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter GitHub repository link"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Optional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="liveDemoLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Live Demo Link</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter live demo link" {...field} />
                    </FormControl>
                    <FormDescription>Optional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Thumbnail</FormLabel>
                  <FormControl>
                    <ThumbnailUpload
                      onThumbnailUpdate={(url) => field.onChange(url)}
                      existingThumbnailUrl={field.value}
                    />
                  </FormControl>
                  <FormDescription>
                    Required - Upload a project thumbnail image
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="techUsed"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <div>
                      <div className="flex items-center mt-2">
                        <Select
                          onValueChange={(selectedValue) => {
                            setTmpSkill(selectedValue);
                          }}
                          value={tmpSkill}
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
                          onClick={() => handleAddSkill(field)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap mt-5">
                        {currSkills.map((skill: any, index: number) => (
                          <Badge
                            className="uppercase mx-1 text-xs font-normal bg-gray-400 flex items-center my-2"
                            key={index}
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleDeleteSkill(skill, field)}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="refer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project reference" {...field} />
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
                    <FormLabel>Project Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project type" {...field} />
                    </FormControl>
                    <FormDescription>Optional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any comments"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Project'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog;
