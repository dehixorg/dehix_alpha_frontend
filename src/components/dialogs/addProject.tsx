import React, { useState, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  FolderKanban,
  Github,
  Globe,
  Link,
  MessageSquare,
  User,
} from 'lucide-react';

import { DatePicker } from '../shared/datePicker';
import DraftDialog from '../shared/DraftDialog';
import { MultiSelect } from '../customFormComponents/multiselect';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import ThumbnailUpload from '@/components/fileUpload/thumbnailUpload';
import useDraft from '@/hooks/useDraft';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
// Schema for form validation using zod
const projectFormSchema = z
  .object({
    projectName: z
      .string()
      .min(1, { message: 'Project name is required.' })
      .min(3, { message: 'Project name must be at least 3 characters.' })
      .max(100, { message: 'Project name cannot exceed 100 characters.' })
      .regex(/^[a-zA-Z0-9\s&.,/'-]+$/, {
        message: 'Project name contains invalid characters.',
      }),
    description: z
      .string()
      .min(1, { message: 'Description is required.' })
      .min(50, { message: 'Description must be at least 50 characters.' })
      .max(2000, { message: 'Description cannot exceed 2000 characters.' }),
    githubLink: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine(
        (val) => {
          if (!val || val === '') return true;
          return (
            z.string().url().safeParse(val).success &&
            val.startsWith('https://github.com/')
          );
        },
        {
          message:
            'GitHub repository link must be a valid URL starting with https://github.com/',
        },
      ),
    liveDemoLink: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine(
        (val) => {
          if (!val || val === '') return true;
          return z.string().url().safeParse(val).success;
        },
        {
          message: 'Live demo link must be a valid URL.',
        },
      ),
    thumbnail: z.string().min(1, { message: 'Project thumbnail is required.' }),
    start: z
      .string()
      .min(1, { message: 'Start date is required.' })
      .datetime()
      .refine(
        (date) => {
          try {
            const startDate = new Date(date);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            return startDate <= today;
          } catch {
            return false;
          }
        },
        {
          message: 'Start date cannot be in the future.',
        },
      ),
    end: z
      .string()
      .min(1, { message: 'End date is required.' })
      .datetime()
      .refine(
        (date) => {
          try {
            const endDate = new Date(date);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            return endDate <= today;
          } catch {
            return false;
          }
        },
        {
          message: 'End date cannot be in the future.',
        },
      ),
    refer: z
      .string()
      .min(1, { message: 'Reference is required.' })
      .min(3, { message: 'Reference must be at least 3 characters.' })
      .max(200, { message: 'Reference cannot exceed 200 characters.' }),
    techUsed: z
      .array(z.string())
      .min(1, { message: 'At least one technology is required.' })
      .max(20, { message: 'Cannot add more than 20 technologies.' }),
    role: z
      .string()
      .min(1, { message: 'Role is required.' })
      .min(3, { message: 'Role must be at least 3 characters.' })
      .max(100, { message: 'Role cannot exceed 100 characters.' })
      .regex(/^[a-zA-Z0-9\s&.,/'-]+$/, {
        message: 'Role contains invalid characters.',
      }),
    projectType: z.string().optional(),
    verificationStatus: z.string().optional(),
    comments: z
      .string()
      .max(1000, { message: 'Comments cannot exceed 1000 characters.' })
      .optional(),
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
  const [step, setStep] = useState<number>(1);
  const [skills, setSkills] = useState<any>([]);
  const [currSkills, setCurrSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const currentDate = new Date().toISOString().split('T')[0];
  const restoredDraft = useRef<any>(null);
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      projectName: '',
      description: '',
      githubLink: '',
      liveDemoLink: '',
      thumbnail: '',
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

  // Field validation for Step 1
  const nextStep = async () => {
    if (step === 1) {
      // Trigger validation for step 1 fields to show inline errors
      const isValid = await form.trigger([
        'projectName',
        'description',
        'start',
        'end',
      ]);

      // Check if at least one skill is added (not a form field, so needs separate check)
      if (!isValid) {
        return; // Form validation failed, inline errors are already shown
      }

      // Cross-field validation: start date must be before end date
      const formValues = form.getValues();
      const { start, end } = formValues;
      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (startDate >= endDate) {
          form.setError('end', {
            type: 'manual',
            message: 'End date must be after start date.',
          });
          notifyError(
            'End date must be after start date.',
            'Invalid Date Range',
          );
          return;
        }
      }

      if (currSkills.length === 0) {
        notifyError('Please add at least one skill.', 'Skills required');
        return;
      }

      setStep(2);
    }
  };

  const prevStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsResponse = await axiosInstance.get('/skills/all');
        const transformedSkills =
          skillsResponse?.data?.data?.map((skill: Skill) => ({
            value: skill.label,
            label: skill.label,
          })) || [];
        setSkills(transformedSkills);
      } catch (error) {
        console.error('API Error:', error);
        notifyError('Something went wrong. Please try again.', 'Error');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isDialogOpen) {
      setStep(1);
    }
  }, [isDialogOpen, form]);
  const {
    handleSaveAndClose: saveDraftAndClose,
    showDraftDialog,
    setShowDraftDialog,
    confirmExitDialog,
    setConfirmExitDialog,
    handleDiscardAndClose: discardAndClose,
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
      resetForm(); // Reset the form when discarding
      restoredDraft.current = null;
    },
    setCurrSkills,
  });

  const handleSaveAndClose = () => {
    saveDraftAndClose();
  };

  const handleDiscardAndClose = () => {
    discardAndClose();
  };

  // Reset form function
  const resetForm = () => {
    form.reset({
      projectName: '',
      description: '',
      githubLink: '',
      liveDemoLink: '',
      thumbnail: '',
      start: '',
      end: '',
      refer: '',
      techUsed: [],
      role: '',
      projectType: '',
      verificationStatus: 'ADDED',
      comments: '',
    });
    setCurrSkills([]);
    setStep(1);
  };

  // Submit handler for the form
  async function onSubmit(data: ProjectFormValues) {
    setLoading(true);
    try {
      // Join currSkills array into comma-separated string for form submission

      // Prepare the payload
      const payload = {
        projectName: data.projectName,
        description: data.description,
        githubLink: data.githubLink,
        liveDemoLink: data.liveDemoLink,
        thumbnail: data.thumbnail, // Now required
        techUsed: currSkills,
        verified: false,
        oracleAssigned: '',
        start: data.start ? new Date(data.start).toISOString() : null,
        end: data.end ? new Date(data.end).toISOString() : null,
        refer: data.refer,
        role: data.role,
        projectType: data.projectType,
        comments: data.comments || '',
        verificationUpdateTime: new Date().toISOString(),
      };

      // Submit with the skills from our state
      await axiosInstance.post(`/freelancer/project`, payload);

      onFormSubmit();
      resetForm(); // Reset form after successful submission
      setIsDialogOpen(false);
      notifySuccess(
        'The project has been successfully added.',
        'Project Added',
      );
    } catch (error) {
      console.error('API Error:', error);
      notifyError('Failed to add project. Please try again later.', 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        if (!open) {
          // Only close the dialog, don't reset the form here
          // The form will be reset when either saving or discarding
          handleDialogClose();
        } else {
          setIsDialogOpen(open);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="my-auto bg-muted/20">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="lg:max-w-screen-lg overflow-y-auto max-h-[90vh] no-scrollbar">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Add Project</DialogTitle>
              <DialogDescription>
                {step === 1
                  ? 'Start with core details, timeline, and skills.'
                  : 'Add links, media, and more context.'}
              </DialogDescription>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div
              className={`h-1 rounded-full transition-all w-1/2 ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}
            ></div>
            <div
              className={`h-1 rounded-full transition-all w-1/2 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}
            ></div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Step 1: Basic Project Information */}
            {step === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <FolderKanban className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="Enter project name"
                            {...field}
                          />
                        </InputGroup>
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
                        <Textarea
                          placeholder="Enter project description"
                          className="min-h-[110px]"
                          {...field}
                        />
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
                        <DatePicker {...field} max={currentDate} />
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
                        <DatePicker {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="techUsed"
                    render={({ field }) => {
                      return (
                        <FormItem className="mb-4">
                          <FormLabel>Skills</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={skills}
                              value={currSkills}
                              onChange={(selectedValues) => {
                                setCurrSkills(selectedValues);
                                field.onChange(selectedValues);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </>
            )}

            {/* Step 2: Additional Project Information */}
            {step === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="githubLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub Repo Link</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <Github className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="Enter GitHub repository link (optional)"
                            {...field}
                          />
                        </InputGroup>
                      </FormControl>
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
                        <InputGroup>
                          <InputGroupText>
                            <Globe className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="Enter live demo link (optional)"
                            {...field}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />{' '}
                <FormField
                  control={form.control}
                  name="thumbnail"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ThumbnailUpload
                          onThumbnailUpdate={(url) => field.onChange(url)}
                          existingThumbnailUrl={field.value}
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
                      <FormLabel>Reference</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <Link className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="Enter project reference"
                            {...field}
                          />
                        </InputGroup>
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
                        <InputGroup>
                          <InputGroupText>
                            <User className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="Enter role"
                            {...field}
                          />
                        </InputGroup>
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
                        <InputGroup>
                          <InputGroupText>
                            <FolderKanban className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="Enter project type (optional)"
                            {...field}
                          />
                        </InputGroup>
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
                        <InputGroup>
                          <InputGroupText>
                            <MessageSquare className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="Enter any comments (optional)"
                            {...field}
                          />
                        </InputGroup>
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
                    {loading ? 'Loading...' : 'Add Project'}
                  </Button>
                </>
              ) : (
                <>
                  <div></div> {/* Empty div to create space */}
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
