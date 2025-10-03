'use client';
import React, { useState } from 'react';
import { Check, Lock, Save, X } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Card } from '../ui/card';

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

function getPasswordStrength(password: string) {
  const rules = [
    { label: 'At least 8 characters', test: (pw: string) => pw.length >= 8 },
    { label: 'Contains a number', test: (pw: string) => /[0-9]/.test(pw) },
    {
      label: 'Contains a special character',
      test: (pw: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
    },
    {
      label: 'Contains an uppercase letter',
      test: (pw: string) => /[A-Z]/.test(pw),
    },
    {
      label: 'Contains a lowercase letter',
      test: (pw: string) => /[a-z]/.test(pw),
    },
  ];
  const passed = rules.map((rule) => rule.test(password));
  const level = passed.filter(Boolean).length;
  let color = 'bg-red-500';
  let label = 'Weak';
  if (level >= 2) {
    color = 'bg-yellow-400';
    label = 'Medium';
  }
  if (level >= 3) {
    color = 'bg-blue-400';
    label = 'Good';
  }
  if (level >= 4) {
    color = 'bg-green-500';
    label = 'Strong';
  }
  return {
    label,
    color,
    level,
    rules: rules.map((r, i) => ({ label: r.label, passed: passed[i] })),
  };
}

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
                      <div className="flex flex-col gap-2 mt-2">
                        {/* Progress Bar */}
                        <div className="flex w-40 h-2 rounded overflow-hidden">
                          <div
                            className={`flex-1 ${
                              passwordStrength.level >= 1
                                ? passwordStrength.color
                                : 'bg-gray-200'
                            } transition-all`}
                          ></div>
                          <div
                            className={`flex-1 ${
                              passwordStrength.level >= 2
                                ? passwordStrength.color
                                : 'bg-gray-200'
                            } transition-all`}
                          ></div>
                          <div
                            className={`flex-1 ${
                              passwordStrength.level >= 3
                                ? passwordStrength.color
                                : 'bg-gray-200'
                            } transition-all`}
                          ></div>
                          <div
                            className={`flex-1 ${
                              passwordStrength.level >= 4
                                ? passwordStrength.color
                                : 'bg-gray-200'
                            } transition-all`}
                          ></div>
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            passwordStrength.label === 'Weak'
                              ? 'text-red-500'
                              : passwordStrength.label === 'Medium'
                                ? 'text-yellow-500'
                                : passwordStrength.label === 'Good'
                                  ? 'text-blue-500'
                                  : 'text-green-600'
                          }`}
                        >
                          {passwordStrength.label}
                        </span>
                        {/* Checklist */}
                        <ul className="mt-1 space-y-1">
                          {passwordStrength.rules.map((rule, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2 text-xs"
                            >
                              {rule.passed ? (
                                <Check className="text-green-500 w-4 h-4" />
                              ) : (
                                <X className="text-red-500 w-4 h-4" />
                              )}
                              <span
                                className={
                                  rule.passed
                                    ? 'text-green-600'
                                    : 'text-red-500'
                                }
                              >
                                {rule.label}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
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
