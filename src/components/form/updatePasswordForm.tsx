'use client';
import React, { useState } from 'react';
import { Lock, Save } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Card } from '../ui/card';

import PasswordStrength, { getPasswordStrength } from './PasswordStrength';

import { axiosInstance } from '@/lib/axiosinstance';
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
import { notifyError, notifySuccess } from '@/utils/toastMessage';

const updatePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, {
      message: 'Current password is required.',
    }),
    newPassword: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' })
      .regex(/[0-9]/, { message: 'Password must contain a number.' })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: 'Password must contain a special character.',
      })
      .regex(/[A-Z]/, { message: 'Password must contain an uppercase letter.' })
      .regex(/[a-z]/, { message: 'Password must contain a lowercase letter.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

type UpdatePasswordFormValues = z.infer<typeof updatePasswordFormSchema>;

export function UpdatePasswordForm({ user_id }: { user_id: string }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    label: string;
    color: string;
    level: number;
    rules: { label: string; passed: boolean }[];
  }>({ label: '', color: '', level: 0, rules: [] });

  const form = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'all',
  });

  async function onSubmit(data: UpdatePasswordFormValues) {
    setLoading(true);
    try {
      await axiosInstance.put(`/freelancer`, {
        id: user_id,
        password: data.newPassword,
        oldPassword: data.currentPassword,
      });

      notifySuccess(
        'Your password has been successfully updated.',
        'Password Updated',
      );
      form.reset();
    } catch (error: any) {
      console.error('API Error:', error);
      const errorMessage =
        error.response?.data?.message ||
        'Failed to update password. Please try again later.';
      notifyError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 bg-muted-foreground/20 dark:bg-muted/20 mt-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Lock className="h-5 w-5" /> Update Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Ensure your account is using a long, random password to stay secure.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your current password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 mt-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        type="password"
                        placeholder="Enter your new password"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setPasswordStrength(
                            getPasswordStrength(e.target.value),
                          );
                        }}
                      />
                      <PasswordStrength passwordStrength={passwordStrength} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm your new password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-1 md:col-span-2 mt-6">
            <Button type="submit" className="w-full" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
