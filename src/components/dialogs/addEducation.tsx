import React, { useRef, useState, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  GraduationCap,
  Plus,
  School,
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import DraftDialog from '../shared/DraftDialog';
import { DatePicker } from '../shared/datePicker';

import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { axiosInstance } from '@/lib/axiosinstance';
import useDraft from '@/hooks/useDraft';

const FormSchema = z
  .object({
    degree: z.string().min(1, { message: 'Degree is required' }),
    universityName: z
      .string()
      .min(1, { message: 'University name is required' }),
    fieldOfStudy: z.string().min(1, { message: 'Field of study is required' }),
    startDate: z.string().min(1, { message: 'Start date is required' }),
    endDate: z.string().min(1, { message: 'End date is required' }),
    grade: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return start < end;
      }
      return true;
    },
    {
      message: 'Start Date must be before End Date',
      path: ['endDate'],
    },
  )
  .refine(
    (data) => {
      if (data.startDate) {
        const start = new Date(data.startDate);
        const today = new Date();
        return start <= today;
      }
      return true;
    },
    {
      message: 'Start date cannot be in the future',
      path: ['startDate'],
    },
  );

interface AddEducationProps {
  onFormSubmit: () => void;
}

export const AddEducation: React.FC<AddEducationProps> = ({ onFormSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [step, setStep] = useState<number>(1);
  const currentDate = new Date().toISOString().split('T')[0];
  const restoredDraft = useRef<any>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      degree: '',
      universityName: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      grade: '',
    },
  });

  const resetForm = useCallback(() => {
    form.reset({
      degree: '',
      universityName: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      grade: '',
    });
    restoredDraft.current = null;
  }, [form]);

  const validateStep1 = () => {
    const { degree, universityName, fieldOfStudy } = form.getValues();
    if (!degree || !universityName || !fieldOfStudy) {
      notifyError(
        'Please fill degree, university and field of study.',
        'Missing fields',
      );
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    }
  };
  const prevStep = () => {
    if (step === 2) setStep(1);
  };

  const {
    showDraftDialog,
    setShowDraftDialog,
    confirmExitDialog,
    setConfirmExitDialog,
    loadDraft,
    discardDraft,
    handleSaveAndClose,
    handleDiscardAndClose: handleDiscardAndCloseDraft,
  } = useDraft({
    form,
    formSection: 'education',
    isDialogOpen,
    setIsDialogOpen,
    onSave: (values) => {
      restoredDraft.current = { ...values };
    },
    onDiscard: () => {
      resetForm();
    },
  });

  const handleDiscardAndClose = () => {
    resetForm();
    if (setIsDialogOpen) {
      setIsDialogOpen(false);
    }
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    // Check if required fields are filled
    const requiredFields = [
      'degree',
      'universityName',
      'fieldOfStudy',
      'startDate',
      'endDate',
    ];
    const missingFields = requiredFields.filter(
      (field) => !data[field as keyof typeof data],
    );
    if (missingFields.length > 0) {
      notifyError('Please fill in all required fields', 'Validation Error');
      return;
    }

    try {
      setLoading(true);
      const formattedData = {
        degree: data.degree, // This matches the backend field name
        universityName: data.universityName,
        fieldOfStudy: data.fieldOfStudy,
        startDate: data.startDate
          ? new Date(data.startDate).toISOString()
          : null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        grade: data.grade,
        oracleAssigned: '',
        verificationStatus: 'ADDED',
        verificationUpdateTime: new Date(),
        comments: '',
      };

      await axiosInstance.post('/freelancer/education', formattedData);
      notifySuccess(
        'The education has been successfully added.',
        'Education Added',
      );
      resetForm();
      onFormSubmit();

      if (setIsDialogOpen) {
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('API Error:', error);
      notifyError('Failed to add education. Please try again later.', 'Error');
    } finally {
      setLoading(false); // Reset loading state after submission completes
    }
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        if (!open) {
          const formValues = form.getValues();
          const hasValues = Object.values(formValues).some(
            (value) => value && value.toString().trim() !== '',
          );

          if (hasValues) {
            setConfirmExitDialog(true);
          } else {
            setIsDialogOpen(false);
            resetForm();
          }
        } else {
          // Reset form when dialog is opened
          resetForm();
          setStep(1);
          // Show draft dialog if there's a draft
          if (restoredDraft.current) {
            setShowDraftDialog(true);
          }
          setIsDialogOpen(true);
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
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Add Education</DialogTitle>
              <DialogDescription>
                {step === 1
                  ? 'Tell us about your degree and institute.'
                  : 'Add the timeline and optional grade.'}
              </DialogDescription>
            </div>
          </div>
          {/* Stepper */}
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
          <form
            onSubmit={form.handleSubmit(onSubmit, () => {
              notifyError(
                'Please fill in all required fields',
                'Validation Error',
              );
            })}
            className="space-y-4"
          >
            <button type="submit" style={{ display: 'none' }} />
            {step === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <GraduationCap className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="e.g., B.Tech in Computer Science"
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
                  name="universityName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>University / Institute</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <School className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="e.g., IIT Delhi"
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
                  name="fieldOfStudy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field of Study</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <BookOpen className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="e.g., Computer Science"
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

            {step === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="startDate"
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
                  name="endDate"
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
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade (optional)</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <Award className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="e.g., 8.5 CGPA / A"
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

            <DialogFooter className="flex justify-between pt-4">
              {step === 2 ? (
                <>
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                <>
                  <div />
                  <Button type="button" onClick={nextStep}>
                    Next <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </>
              )}
            </DialogFooter>

            {/* Confirmation Dialog for Discard */}
            <Dialog
              open={confirmExitDialog}
              onOpenChange={setConfirmExitDialog}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Discard Changes?</DialogTitle>
                  <DialogDescription>
                    You have unsaved changes. Are you sure you want to discard
                    them?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setConfirmExitDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDiscardAndCloseDraft();
                      setConfirmExitDialog(false);
                    }}
                  >
                    Discard
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
