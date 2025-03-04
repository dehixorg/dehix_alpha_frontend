import React, { useRef, useState,useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus, ArrowRight, ArrowLeft } from 'lucide-react';

import DraftDialog from '../shared/DraftDialog';

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
import useDraft from '@/hooks/useDraft';

const validateWorkDates = (
  data: { workFrom?: string; workTo?: string },
  ctx: any,
) => {
  const workFromDate = data.workFrom ? new Date(data.workFrom) : null;
  const workToDate = data.workTo ? new Date(data.workTo) : null;

  if (workFromDate && workToDate) {
    if (workFromDate > workToDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'Work From date cannot be after Work To date.',
        path: ['workFrom'],
      });
    }

    const oneMonthLater = new Date(workFromDate);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    if (workToDate < oneMonthLater) {
      ctx.addIssue({
        code: 'custom',
        message: 'Work To date must be at least 1 month after Work From date.',
        path: ['workTo'],
      });
    }
  }
};

const experienceFormSchema = z
  .object({
    company: z.string().min(1, { message: 'Company name is required.' }),
    jobTitle: z.string().min(1, { message: 'Job Title is required.' }),
    workDescription: z
      .string()
      .min(1, { message: 'Work Description is required.' }),
    workFrom: z.string().min(1, { message: 'Work from is required.' }),
    workTo: z.string().min(1, { message: 'Work to is required.' }),
    referencePersonName: z
      .string()
      .min(1, { message: 'Reference Person Name is required.' }),
    referencePersonContact: z
      .string()
      .min(1, { message: 'Reference Person Contact is required.' }),
    githubRepoLink: z
      .string()
      .trim()
      .transform((val) => (val === '' ? undefined : val))
      .optional()
      .refine((url) => !url || url.startsWith('https://github.com/'), {
        message: 'GitHub URL must start with https://github.com/',
      }),
    comments: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    validateWorkDates(data, ctx);
  });

type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

interface AddExperienceProps {
  onFormSubmit: () => void;
}

export const AddExperience: React.FC<AddExperienceProps> = ({
  onFormSubmit,
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const currentDate = new Date().toISOString().split('T')[0];
  const restoredDraft = useRef<any>(null);

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      company: '',
      jobTitle: '',
      workDescription: '',
      workFrom: '',
      workTo: '',
    },
  });

  // Validate Step 1 fields before proceeding to Step 2
  const validateStep1 = () => {
    const { company, jobTitle, workDescription, workFrom, workTo } =
      form.getValues();

    // Check if required fields are filled
    if (!company || !jobTitle || !workDescription || !workFrom || !workTo) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill all required fields in Step 1.',
      });
      return false;
    }

    // Validate dates
    const workFromDate = new Date(workFrom);
    const workToDate = new Date(workTo);

    if (workFromDate > workToDate) {
      form.setError('workFrom', {
        type: 'manual',
        message: 'Work From date cannot be after Work To date.',
      });
      return false;
    }

    const oneMonthLater = new Date(workFromDate);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    if (workToDate < oneMonthLater) {
      form.setError('workTo', {
        type: 'manual',
        message: 'Work To date must be at least 1 month after Work From date.',
      });
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
    if (isDialogOpen) {
      setStep(1);
      form.reset({
        company: '',
        jobTitle: '',
        workDescription: '',
        workFrom: '',
        workTo: '',
        referencePersonName: '',
        referencePersonContact: '',
        githubRepoLink: '',
        comments: '',
      });
    }
  }, [isDialogOpen, form]);
  const {
    showDraftDialog,
    setShowDraftDialog,
    confirmExitDialog,
    setConfirmExitDialog,
    loadDraft,
    discardDraft,
    handleSaveAndClose,
    handleDiscardAndClose,
    handleDialogClose,
  } = useDraft({
    form,
    formSection: 'experience',
    isDialogOpen,
    setIsDialogOpen,
    onSave: (values) => {
      restoredDraft.current = { ...values };
    },
    onDiscard: () => {
      restoredDraft.current = null;
    },
  });

  async function onSubmit(data: ExperienceFormValues) {
    setIsSubmitting(true);
    try {
      await axiosInstance.post(`/freelancer/experience`, {
        company: data.company || '',
        jobTitle: data.jobTitle || '',
        workDescription: data.workDescription || '',
        workFrom: data.workFrom ? new Date(data.workFrom).toISOString() : null,
        workTo: data.workTo ? new Date(data.workTo).toISOString() : null,
        referencePersonName: data.referencePersonName || '',
        referencePersonContact: data.referencePersonContact || '',
        githubRepoLink: data.githubRepoLink || '',
        oracleAssigned: null, // Assuming no assignment
        verificationStatus: 'ADDED',
        verificationUpdateTime: new Date().toISOString(),
        comments: data.comments || '',
      });
      onFormSubmit();
      setIsDialogOpen(false);
      toast({
        title: 'Experience Added',
        description: 'The experience has been successfully added.',
      });
    } catch (error) {
      console.error('API Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add experience. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
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

      <DialogContent className="lg:max-w-screen-lg overflow-y-scroll max-h-screen no-scrollbar">
        <DialogHeader>
          <DialogTitle>Add Experience - Step {step} of 2</DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Fill in the basic details of your work experience.'
              : 'Fill in the reference and additional details.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Step 1: Basic Experience Information */}
            {step === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company name" {...field} />
                      </FormControl>
                      <FormDescription>Enter the company name</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter job title" {...field} />
                      </FormControl>
                      <FormDescription>Enter the job title</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter work description"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the work description
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work From</FormLabel>
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
                  name="workTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work To</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>Select the end date</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Step 2: Reference and Additional Information */}
            {step === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="referencePersonName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Person Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter reference person name"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the reference person&apos;s name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="referencePersonContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Person Contact</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter reference person contact"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the reference person&apos;s contact
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="githubRepoLink"
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
              </>
            )}

            <DialogFooter className="flex justify-between">
              {step === 2 ? (
                <>
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Loading...' : 'Add Experience'}
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
