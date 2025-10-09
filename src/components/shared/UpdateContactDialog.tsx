'use client';

import React, { useState } from 'react';
import { Mail, Phone, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';

import { setUser } from '@/lib/userSlice';
import { RootState } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifySuccess, notifyError } from '@/utils/toastMessage';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9+\-\s()]+$/, 'Please enter a valid phone number'),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type PhoneFormValues = z.infer<typeof phoneSchema>;

interface UpdateContactDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'email' | 'phone';
  currentValue: string;
  userId: string;
  userType: string;
  onSuccess?: (newValue: string) => void;
}

export function UpdateContactDialog({
  isOpen,
  onOpenChange,
  type,
  currentValue,
  userType,
  onSuccess,
}: UpdateContactDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user);

  const schema = type === 'email' ? emailSchema : phoneSchema;
  const form = useForm<EmailFormValues | PhoneFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      [type]: currentValue,
    },
  });

  const handleSubmit = async (data: EmailFormValues | PhoneFormValues) => {
    setIsSubmitting(true);
    try {
      const apiUri =
        userType === 'freelancer'
          ? '/freelancer/contact-details'
          : '/business/contact-details';

      const updateData = {
        contactType: type === 'email' ? 'email' : 'phone',
        ...(type === 'email'
          ? { email: (data as EmailFormValues).email }
          : { phone: (data as PhoneFormValues).phone }),
      };

      // Send the complete profile with the updated field
      const response = await axiosInstance.put(apiUri, updateData);

      if (response.status === 200) {
        notifySuccess(
          `${type === 'email' ? 'Email' : 'Phone number'} updated successfully`,
          'Success',
        );
        const newValue =
          type === 'email'
            ? (data as EmailFormValues).email
            : (data as PhoneFormValues).phone;

        // Update Redux store with new contact information
        dispatch(
          setUser({
            ...currentUser,
            ...(type === 'email'
              ? { email: newValue }
              : { phoneNumber: newValue }),
          }),
        );

        onSuccess?.(newValue);
        onOpenChange(false);
        form.reset();
      }
    } catch (error: any) {
      console.error('Update error:', error);
      notifyError(
        error?.response?.data?.message ||
          `Failed to update ${type === 'email' ? 'email' : 'phone number'}. Please try again.`,
        'Error',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const Icon = type === 'email' ? Mail : Phone;
  const label = type === 'email' ? 'Email Address' : 'Phone Number';
  const placeholder =
    type === 'email' ? 'Enter your new email' : 'Enter your new phone number';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            Update {label}
          </DialogTitle>
          <DialogDescription>
            Update your {type === 'email' ? 'email address' : 'phone number'}.
            Click submit when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name={type}
              render={() => (
                <FormItem>
                  <FormLabel>Current {label}</FormLabel>
                  <FormControl>
                    <Input
                      value={currentValue}
                      disabled
                      className="bg-muted text-muted-foreground"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={type}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New {label}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type={type === 'email' ? 'email' : 'tel'}
                      placeholder={placeholder}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
