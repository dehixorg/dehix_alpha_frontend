import React, { useState, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';

import DraftDialog from '../shared/DraftDialog';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';
import useDraft from '@/hooks/useDraft';

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

interface AddProjectProps {
  onFormSubmit: () => void;
}

interface Skill {
  _id: string;
  label: string;
}

export const AddProject: React.FC<AddProjectProps> = ({ onFormSubmit }) => {
  const [skills, setSkills] = useState<any>([]);
  const [currSkills, setCurrSkills] = useState<string[]>([]);
  const [tmpSkill, setTmpSkill] = useState<any>('');
  const [loading, setLoading] = useState<boolean>(false);
  const restoredDraft = useRef<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const currentDate = new Date().toISOString().split('T')[0];

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
        const skillsResponse = await axiosInstance.get('/skills');
        const transformedSkills = skillsResponse.data.data.map(
          (skill: Skill) => ({
            value: skill.label,
            label: skill.label,
          }),
        );
        setSkills(transformedSkills);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong.Please try again.',
        });
      }
    };
    fetchData();
  }, []);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
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

  const {
    handleSaveAndClose,
    showDraftDialog,
    setShowDraftDialog,
    confirmExitDialog,
    setConfirmExitDialog,
    handleDiscardAndClose,
    handleDialogClose,
    discardDraft,
    loadDraft,
  } = useDraft({
    form,
    formSection: 'projects',
    isDialogOpen,
    setIsDialogOpen,
    onSave: (values) => {
      restoredDraft.current = { ...values, techUsed: currSkills };
    },
    onDiscard: () => {
      restoredDraft.current = null;
    },
    setCurrSkills,
  });

  async function onSubmit(data: ProjectFormValues) {
    setLoading(true);
    try {
      // Convert comma-separated techUsed string into an array
      // console.log('Form body:', {
      //   ...data,
      //   role: '',
      //   techUsed: currSkills,
      //   projectType: '',
      // });
      // const techUsedArray = data.techUsed
      //   .split(',')
      //   .map((tech) => tech.trim())
      //   .filter((tech) => tech !== '');

      await axiosInstance.post(`/freelancer/project`, {
        ...data,
        techUsed: currSkills,
        verified: false,
        oracleAssigned: '',
        start: data.start ? new Date(data.start).toISOString() : null,
        end: data.end ? new Date(data.end).toISOString() : null,
        verificationUpdateTime: new Date().toISOString(),
      });
      onFormSubmit();
      setIsDialogOpen(false);
      toast({
        title: 'Project Added',
        description: 'The project has been successfully added.',
      });
    } catch (error) {
      console.error('API Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add project. Please try again later.',
      });
    } finally {
      setLoading(false); // Reset loading state after submission completes
    }
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) handleDialogClose();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="my-auto">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="lg:max-w-screen-lg overflow-y-scroll max-h-screen">
        <DialogHeader>
          <DialogTitle>Add Project</DialogTitle>
          <DialogDescription>
            Fill in the details of your project below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormDescription>Enter the project name</FormDescription>
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
                  <FormDescription>
                    Enter the project description
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  <FormDescription>
                    Enter the GitHub repository link (optional)
                  </FormDescription>
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
                  <FormDescription>Select the start date</FormDescription>
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
                  <FormDescription>Select the end date</FormDescription>
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
                  <FormDescription>Enter the project reference</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="techUsed"
              render={({ field: { onChange, value } }) => (
                <FormItem className="mb-4">
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <div>
                      <div className="flex items-center mt-2">
                        <Select
                          onValueChange={(selectedValue) => {
                            onChange([...value, selectedValue]);
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
                          onClick={handleAddSkill}
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter role" {...field} />
                  </FormControl>
                  <FormDescription>Enter the role</FormDescription>
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
                  <FormDescription>
                    Enter the project type (optional)
                  </FormDescription>
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
                  <FormDescription>
                    Enter any comments (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Loading...' : 'Add Project'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      {confirmExitDialog && (
        <DraftDialog
          dialogChange={confirmExitDialog}
          setDialogChange={setConfirmExitDialog}
          heading="Save Draft?"
          desc="Do you want to save your draft before leaving?"
          handleClose={handleDiscardAndClose}
          handleSave={handleSaveAndClose}
          btn1Txt="Don't save"
          btn2Txt="Yes save"
        />
      )}
      {showDraftDialog && (
        <DraftDialog
          dialogChange={showDraftDialog}
          setDialogChange={setShowDraftDialog}
          heading="Load Draft?"
          desc="You have unsaved data. Would you like to restore it?"
          handleClose={discardDraft}
          handleSave={loadDraft}
          btn1Txt=" No, start fresh"
          btn2Txt="Yes, load draft"
        />
      )}
    </Dialog>
  );
};
