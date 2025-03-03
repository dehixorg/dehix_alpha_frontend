import React, { useRef, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';

import { toast } from '../ui/use-toast';
import DraftDialog from '../shared/DraftDialog';

import { Input } from '@/components/ui/input';
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
    degree: z.string().optional(),
    universityName: z.string().optional(),
    fieldOfStudy: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
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
      path: ['endDate'], // Show error on endDate field
    },
  );

interface AddEducationProps {
  onFormSubmit: () => void;
}

export const AddEducation: React.FC<AddEducationProps> = ({ onFormSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    formSection: 'education',
    isDialogOpen,
    setIsDialogOpen,
    onSave: (values) => {
      restoredDraft.current = { ...values };
    },
    onDiscard: () => {
      restoredDraft.current = null;
    },
  });

  async function onSubmit(data: any) {
    setLoading(true);
    try {
      const formattedData = {
        ...data,
        startDate: data.startDate
          ? new Date(data.startDate).toISOString()
          : null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        oracleAssigned: data.oracleAssigned || '',
        verificationStatus: data.verificationStatus || 'ADDED',
        verificationUpdateTime: data.verificationUpdateTime || new Date(),
        comments: '',
      };
      await axiosInstance.post(`/freelancer/education`, formattedData);
      onFormSubmit();
      setIsDialogOpen(false);
      toast({
        title: 'Education Added',
        description: 'The education has been successfully added.',
        duration: 1500,
      });
    } catch (error) {
      console.error('API Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add education. Please try again later.',
        duration: 1500,
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
          <DialogTitle>Add Education</DialogTitle>
          <DialogDescription>Add your relevant Education.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="degree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter Degree</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your degree title" {...field} />
                  </FormControl>
                  <FormDescription>Enter your degree title</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="universityName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>University Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your university name"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter your university name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fieldOfStudy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter Field of Study</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your field of study" {...field} />
                  </FormControl>
                  <FormDescription>Enter Field of Study</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
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
              name="endDate"
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
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your grade" {...field} />
                  </FormControl>
                  <FormDescription>Enter your grade</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Loading...' : 'Create'}
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
