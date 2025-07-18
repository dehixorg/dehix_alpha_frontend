import React, { useState, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
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
import ThumbnailUpload from '../fileUpload/thumbnailUpload';

// Schema for form validation using zod
const projectFormSchema = z
  .object({
    projectName: z.string().min(1, { message: 'Project name is required.' }),
    description: z.string().min(1, { message: 'Description is required.' }),
    githubLink: z
      .string()
      .url({ message: 'GitHub Repositry link must be a valid URL.' })
      .optional()
      .refine((url) => (url ? url.startsWith('https://github.com/') : true), {
        message: 'GitHub repository URL must start with https://github.com/',
      }),
    start: z.string().min(1, { message: 'Start date is required.' }),
    end: z.string().min(1, { message: 'End date is required.' }),
    refer: z.string().min(1, { message: 'Reference is required.' }),
    techUsed: z
      .array(z.string())
      .min(1, { message: 'At least one technology is required.' }),
    role: z.string().min(1, { message: 'Role is required.' }),
    projectType: z.string().optional(),
    verificationStatus: z.string().optional(),
    comments: z.string().optional(),
    thumbnail: z.string().optional(),
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

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  mode: 'add' | 'edit';
  projectData?: ProjectFormValues;
  onFormSubmit: () => void;
  children?: React.ReactNode;
}

interface Skill {
  _id: string;
  label: string;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  mode,
  projectData,
  onFormSubmit,
  children,
}) => {
  const [step, setStep] = useState<number>(1);
  const [skills, setSkills] = useState<any>([]);
  const [currSkills, setCurrSkills] = useState<string[]>([]);
  const [tmpSkill, setTmpSkill] = useState<any>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const currentDate = new Date().toISOString().split('T')[0];
  const { freelancer_id } = useParams<{ freelancer_id: string }>();
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  // Initialize form with default values or existing project data
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: projectData || {
      projectName: '',
      description: '',
      githubLink: '',
      start: '',
      end: '',
      refer: '',
      techUsed: [],
      role: '',
      projectType: '',
      verificationStatus: 'ADDED',
      comments: '',
    },
    mode: 'all',
  });

  // Set initial skills when project data is provided
  useEffect(() => {
    if (projectData && projectData.techUsed) {
      setCurrSkills(projectData.techUsed);
    }
  }, [projectData]);

  // Extract thumbnail URL from comments if in edit mode
  useEffect(() => {
    if (mode === 'edit' && projectData?.comments) {
      const url = projectData.comments.match(/THUMBNAIL:(.+?)(\s|\|)/)?.[1] || 
                  projectData.comments.match(/THUMBNAIL:(.+)/)?.[1];
      if (url) {
        setThumbnailUrl(url);
      }
    }
  }, [mode, projectData]);

  // Field validation for Step 1
  const validateStep1 = () => {
    const { projectName, description, start, end } = form.getValues();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (!projectName || !description || !start || !end) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill all required fields in Step 1.',
      });
      return false;
    }

    if (startDate >= endDate) {
      form.setError('end', {
        type: 'manual',
        message: 'Start Date must be before End Date',
      });
      return false;
    }

    if (currSkills.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Skills required',
        description: 'Please add at least one skill.',
      });
      return false;
    }

    return true;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const prevStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleAddSkill = (field: { onChange: (value: any) => void }) => {
    if (tmpSkill.trim() && !currSkills.includes(tmpSkill)) {
      setCurrSkills([...currSkills, tmpSkill]);
      field.onChange([...currSkills, tmpSkill]);
      setTmpSkill('');
    }
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    const updatedSkills = currSkills.filter((skill) => skill !== skillToDelete);
    setCurrSkills(updatedSkills);
    form.setValue('techUsed', updatedSkills);
  };

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skillsResponse = await axiosInstance.get('/skills');
        const transformedSkills =
          skillsResponse?.data?.data?.map((skill: Skill) => ({
            value: skill.label,
            label: skill.label,
          })) || [];
        setSkills(transformedSkills);
      } catch (error) {
        console.error('Error fetching skills:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load skills. Please try again later.',
        });
      }
    };
    fetchSkills();
  }, []);

  const onSubmit = async (data: ProjectFormValues) => {
    setLoading(true);
    try {
      // Prepare comments with thumbnail URL if exists
      let finalComments = data.comments || '';
      if (thumbnailUrl) {
        finalComments = `THUMBNAIL:${thumbnailUrl}` + 
                       (finalComments ? ` | ${finalComments}` : '');
      }

      const projectPayload = {
        ...data,
        comments: finalComments,
        techUsed: currSkills,
        verified: false,
        oracleAssigned: '',
        start: data.start ? new Date(data.start).toISOString() : null,
        end: data.end ? new Date(data.end).toISOString() : null,
        verificationUpdateTime: new Date().toISOString(),
      };

      if (mode === 'add') {
        await axiosInstance.post(`/freelancer/${freelancer_id}/project`, projectPayload);
        toast({
          title: 'Project Added',
          description: 'The project has been successfully added.',
        });
      } else if (mode === 'edit' && projectData) {
        await axiosInstance.put(`/freelancer/${freelancer_id}/project/${projectData._id}`, projectPayload);
        toast({
          title: 'Project Updated',
          description: 'The project has been successfully updated.',
        });
      }

      onFormSubmit();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to ${mode === 'add' ? 'add' : 'update'} project. Please try again later.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="icon" className="my-auto">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="lg:max-w-screen-lg overflow-y-scroll max-h-screen no-scrollbar">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add' : 'Edit'} Project - Step {step} of 2
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Fill in the basic details of your project.'
              : 'Fill in the additional project details.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="thumbnail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Thumbnail</FormLabel>
                      <FormControl>
                        <ThumbnailUpload
                          projectId={mode === 'edit' ? projectData?._id || 'new' : 'new'}
                          existingThumbnail={thumbnailUrl || ''}
                          onUploadSuccess={(url) => {
                            setThumbnailUrl(url);
                          }}
                          onRemoveSuccess={() => {
                            setThumbnailUrl(null);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload a thumbnail image for your project (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" max={currentDate} {...field} />
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

                <FormField
                  control={form.control}
                  name="techUsed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills</FormLabel>
                      <FormControl>
                        <div>
                          <div className="flex items-center mt-2">
                            <Select
                              onValueChange={setTmpSkill}
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
                            {currSkills.map((skill, index) => (
                              <Badge
                                className="uppercase mx-1 text-xs font-normal bg-gray-400 flex items-center my-2"
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
              </>
            )}

            {step === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="githubLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub Repo Link</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter GitHub repository link" {...field} />
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

                <FormField
                  control={form.control}
                  name="projectType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project type" {...field} />
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
                      <FormLabel>Comments</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter any comments" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter className="flex justify-between">
              {step === 2 ? (
                <>
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Loading...' : mode === 'add' ? 'Add Project' : 'Update Project'}
                  </Button>
                </>
              ) : (
                <>
                  <div></div>
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};