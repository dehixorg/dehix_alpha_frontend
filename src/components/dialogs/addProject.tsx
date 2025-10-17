import React, { useState, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronsUpDown,
} from 'lucide-react';

import { DatePicker } from '../shared/datePicker';
import DraftDialog from '../shared/DraftDialog';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
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
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import ThumbnailUpload from '@/components/fileUpload/thumbnailUpload';
import useDraft from '@/hooks/useDraft';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
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
    liveDemoLink: z
      .string()
      .url({ message: 'Live demo link must be a valid URL.' })
      .optional()
      .or(z.literal('')),
    thumbnail: z.string().min(1, { message: 'Project thumbnail is required.' }),
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
  const [step, setStep] = useState<number>(1);
  const [skills, setSkills] = useState<any>([]);
  const [currSkills, setCurrSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const currentDate = new Date().toISOString().split('T')[0];
  const restoredDraft = useRef<any>(null);
  const [open, setOpen] = useState(false);
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
  const validateStep1 = () => {
    const { projectName, description, start, end } = form.getValues();
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Check if required fields are filled
    if (!projectName || !description || !start || !end) {
      notifyError(
        'Please fill all required fields in Step 1.',
        'Missing fields',
      );
      return false;
    }

    // Validate date relationship
    if (startDate >= endDate) {
      form.setError('end', {
        type: 'manual',
        message: 'Start Date must be before End Date',
      });
      return false;
    }

    // Check if at least one skill is added
    if (currSkills.length === 0) {
      notifyError('Please add at least one skill.', 'Skills required');
      return false;
    }

    return true;
  };

  const nextStep = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
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
        const skillsResponse = await axiosInstance.get('/skills');
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

  const handleSaveAndClose = async () => {
    // First save the draft
    const formValues = form.getValues();
    restoredDraft.current = { ...formValues, techUsed: currSkills };
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
        liveDemoLink: data.liveDemoLink || '', // Now supported by backend CREATE schema
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

      <DialogContent className="lg:max-w-screen-lg overflow-y-scroll max-h-screen no-scrollbar">
        <DialogHeader>
          <DialogTitle>Add Project - Step {step} of 2</DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Fill in the basic details of your project.'
              : 'Fill in the additional project details.'}
          </DialogDescription>
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
                        <Input
                          placeholder="Enter project description"
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
                <FormField
                  control={form.control}
                  name="techUsed"
                  render={({ field }) => {
                    const toggleSkill = (skillLabel: string) => {
                      let updatedSkills: string[] = [];
                      if (currSkills.includes(skillLabel)) {
                        updatedSkills = currSkills.filter(
                          (s) => s !== skillLabel,
                        );
                      } else {
                        updatedSkills = [...currSkills, skillLabel];
                      }
                      setCurrSkills(updatedSkills);
                      field.onChange(updatedSkills);
                    };

                    return (
                      <FormItem className="mb-4">
                        <FormLabel>Skills</FormLabel>
                        <FormControl>
                          <div>
                            {/* Multi-select Dropdown with proper accessibility */}
                            <Popover open={open} onOpenChange={setOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={open}
                                  className="w-full justify-between"
                                >
                                  {currSkills.length > 0
                                    ? `${currSkills.length} selected`
                                    : 'Select skills'}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search skills..." />
                                  <CommandEmpty>No skills found.</CommandEmpty>
                                  <CommandGroup>
                                    {skills.map((skill: any) => (
                                      <CommandItem
                                        key={skill.label}
                                        value={skill.label}
                                        onSelect={() =>
                                          toggleSkill(skill.label)
                                        }
                                      >
                                        <Check
                                          className={`mr-2 h-4 w-4 ${
                                            currSkills.includes(skill.label)
                                              ? 'opacity-100'
                                              : 'opacity-0'
                                          }`}
                                        />
                                        {skill.label}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>

                            {/* Selected Skills Tags */}
                            <div className="flex flex-wrap mt-3 gap-2">
                              {currSkills.map((skill: any, index: number) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs flex items-center gap-1"
                                >
                                  {skill}
                                  <button
                                    type="button"
                                    onClick={() => toggleSkill(skill)}
                                    className="ml-1 text-red-500 hover:text-red-700"
                                    aria-label={`Remove ${skill}`}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
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
                      <FormLabel>GitHub Repo Link </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter GitHub repository link (optional)"
                          {...field}
                        />
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
                        <Input
                          placeholder="Enter live demo link (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                        <Input
                          placeholder="Enter project reference"
                          {...field}
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
                        <Input
                          placeholder="Enter project type (optional)"
                          {...field}
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
                      <FormLabel>Comments</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter any comments (optional)"
                          {...field}
                        />
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
