import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector } from 'react-redux';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import ConnectsDialog from '@/components/shared/ConnectsDialog';

interface TalentOption {
  _id: string;
  label: string;
}

interface TalentFormData {
  uid: string;
  talentId: string;
  label: string;
  experience: string;
  description: string;
  visible: boolean;
  status: string;
}

interface TalentSubmitData {
  uid: string;
  label: string;
  experience: string;
  description: string;
  visible: boolean;
  status: string;
}

interface TalentDialogProps {
  type: 'skill' | 'domain';
  options: TalentOption[];
  onSubmit: (data: TalentSubmitData) => void;
  children: React.ReactNode;
}

const createTalentSchema = (type: 'skill' | 'domain') =>
  z.object({
    label: z.string().nonempty(`Please select a ${type}`),
    talentId: z
      .string()
      .nonempty(
        `${type.charAt(0).toUpperCase() + type.slice(1)} ID is required`,
      ),
    experience: z
      .string()
      .nonempty('Please enter your experience')
      .regex(/^\d+$/, 'Experience must be a number')
      .refine(
        (val) => parseInt(val) <= 40,
        'Maximum 40 years of experience allowed',
      ),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must not exceed 500 characters'),
    visible: z.boolean(),
    status: z.string(),
  });

const TalentDialog: React.FC<TalentDialogProps> = ({
  type,
  options,
  onSubmit,
  children,
}) => {
  const user = useSelector((state: RootState) => state.user);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const talentSchema = createTalentSchema(type);

  const form = useForm<TalentFormData>({
    resolver: zodResolver(talentSchema),
    defaultValues: {
      talentId: '',
      label: '',
      experience: '',
      description: '',
      visible: false,
      status: 'ADDED',
    },
  });

  const { control, handleSubmit, reset, setValue, getValues, trigger } = form;

  const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);

  const onSubmitHandler = async (data: TalentFormData) => {
    setLoading(true);
    try {
      const payload =
        type === 'skill'
          ? {
              skillId: data.talentId,
              skillName: data.label,
              businessId: user.uid,
              experience: data.experience,
              description: data.description,
              status: data.status,
              visible: data.visible,
            }
          : {
              domainId: data.talentId,
              domainName: data.label,
              businessId: user.uid,
              experience: data.experience,
              description: data.description,
              status: data.status,
              visible: data.visible,
            };

      const response = await axiosInstance.post(
        `/business/hire-dehixtalent`,
        payload,
      );

      if (response.status === 200 && response.data?.data) {
        const newTalent = response.data.data;
        const { ...submitData } = data;
        onSubmit({ ...submitData, uid: newTalent._id });
        reset();
        setOpen(false);
        notifySuccess(
          'The Hire Talent has been successfully added.',
          'Talent Added',
        );
      } else {
        throw new Error('Failed to add hire talent');
      }
    } catch (error) {
      console.error('Error submitting talent data', error);
      reset();
      notifyError('Failed to add hire talent. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          reset();
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl">
            Add New {capitalizedType}
          </DialogTitle>
          <DialogDescription>
            Select a {type} and provide details about your experience
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
            <CardContent className="p-0 space-y-4">
              {/* Selection Field */}
              <FormField
                control={control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          const selectedOption = options.find(
                            (option) => option.label === value,
                          );
                          setValue('talentId', selectedOption?._id || '');
                        }}
                      >
                        <SelectTrigger className="w-full bg-muted/20 dark:bg-muted/20 border border-border">
                          <SelectValue placeholder={`Select a ${type}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((option) => (
                            <SelectItem key={option._id} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Experience Field */}
              <FormField
                control={control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience (Years)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="e.g. 5"
                          min={0}
                          max={40}
                          step={0.1}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (
                              value === '' ||
                              (parseInt(value) <= 40 && parseInt(value) >= 0)
                            ) {
                              field.onChange(value);
                            }
                          }}
                          className="pl-3 pr-16 bg-muted/20 dark:bg-muted/20 border border-border"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-muted-foreground text-sm">
                            {field.value ? 'years' : ''}
                          </span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description Field */}
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`Describe your experience with this ${type}...`}
                        className="min-h-[100px] bg-muted/20 dark:bg-muted/20 border border-border"
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between">
                      <FormMessage />
                      <span
                        className={`text-xs ${
                          field.value?.length > 500
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {field.value?.length || 0}/500
                      </span>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <ConnectsDialog
                loading={loading}
                setLoading={setLoading}
                onSubmit={onSubmitHandler}
                isValidCheck={trigger}
                userId={user.uid}
                buttonText={`Add ${capitalizedType}`}
                userType="BUSINESS"
                requiredConnects={parseInt(
                  process.env.NEXT_PUBLIC__APP_HIRE_TALENT_COST || '20',
                  10,
                )}
                data={getValues()}
                skipRedirect={true}
              />
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TalentDialog;
