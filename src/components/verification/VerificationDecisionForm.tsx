'use client';
import React, { useMemo, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, XCircle, MessageSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

export interface DecisionOption {
  value: string;
  label: string;
}

interface VerificationDecisionFormProps {
  radioOptions: DecisionOption[];
  onSubmit: (data: { type: string; comment?: string }) => void | Promise<void>;
  submitText?: string;
  className?: string;
}

const VerificationDecisionForm: React.FC<VerificationDecisionFormProps> = ({
  radioOptions,
  onSubmit,
  submitText = 'Submit',
  className,
}) => {
  const values = radioOptions.map((o) => o.value) as [string, ...string[]];
  const Schema = z.object({
    type: z.enum(values, { required_error: 'You need to select a type.' }),
    comment: z.string().optional(),
  });

  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
  });

  const [open, setOpen] = useState(false);
  const selectedType = form.watch('type');

  const selectedLabel = useMemo(
    () => radioOptions.find((o) => o.value === selectedType)?.label ?? '',
    [radioOptions, selectedType],
  );

  const handleChoose = (value: string) => {
    form.setValue('type', value, { shouldValidate: true });
    setOpen(true);
  };

  const submitHandler = form.handleSubmit(async (data) => {
    await onSubmit(data);
    setOpen(false);
  });

  const variantFor = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('approve') || l.includes('verify'))
      return 'default' as const;
    if (l.includes('deny') || l.includes('reject'))
      return 'destructive' as const;
    return 'secondary' as const;
  };

  return (
    <div className={className ?? 'w-full space-y-4'}>
      <div className="flex flex-col sm:flex-row gap-3">
        {radioOptions.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            variant={variantFor(opt.label)}
            className="flex-1"
            onClick={() => handleChoose(opt.value)}
          >
            {variantFor(opt.label) === 'default' ? (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            ) : variantFor(opt.label) === 'destructive' ? (
              <XCircle className="mr-2 h-4 w-4" />
            ) : (
              <MessageSquare className="mr-2 h-4 w-4" />
            )}
            {opt.label}
          </Button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedLabel || 'Add comments'}</DialogTitle>
            <DialogDescription>
              Provide an optional comment to accompany your decision.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={submitHandler} className="space-y-4">
              {/* Hidden type field maintained by form */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <input type="hidden" value={field.value} readOnly />
                )}
              />

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comments</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter comments (optional)"
                        {...field}
                        className="min-h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || !selectedType}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                >
                  {submitText}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VerificationDecisionForm;
