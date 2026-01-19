'use client';

import type React from 'react';
import { useState } from 'react';
import { Gauge, Wallet, Clock, Briefcase } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import {
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { StatusEnum } from '@/utils/freelancer/enum';

interface Domain {
  _id: string;
  type_id: string;
  name: string;
}

interface SkillDomainData {
  uid: string;
  domainId: string;
  label: string;
  level: string;
  experience: string;
  monthlyPay: string;
  activeStatus: boolean;
  status: StatusEnum;
  type: string;
}

interface DomainDialogProps {
  domains: Domain[];
  onSuccess: () => void;
  children: React.ReactNode;
}

const domainSchema = z.object({
  domainId: z.string(),
  label: z.string().nonempty('Please select a domain'),
  level: z.string().nonempty('Please select a level'),
  experience: z
    .string()
    .nonempty('Please enter your experience')
    .regex(/^\d+$/, 'Experience must be a number'),
  monthlyPay: z
    .string()
    .nonempty('Please enter your monthly pay')
    .regex(/^\d+$/, 'Monthly pay must be a number'),
  activeStatus: z.boolean(),
  status: z.string(),
});

const DomainDialog: React.FC<DomainDialogProps> = ({
  domains,
  onSuccess,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<SkillDomainData>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      domainId: '',
      label: '',
      level: '',
      experience: '',
      monthlyPay: '',
      activeStatus: false,
      status: StatusEnum.PENDING,
      type: 'DOMAIN',
    },
  });

  const onSubmit = async (data: SkillDomainData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(`/freelancer/dehix-talent`, {
        talentId: data.domainId,
        talentName: data.label,
        level: data.level,
        experience: data.experience,
        monthlyPay: data.monthlyPay,
        activeStatus: data.activeStatus,
        status: data.status,
        type: 'DOMAIN',
      });
      if (response.status >= 200 && response.status < 300) {
        reset();
        setOpen(false);
        notifySuccess(
          'The Talent has been successfully added.',
          'Talent Added',
        );
        onSuccess(); // Trigger parent to re-fetch
      }
    } catch (error) {
      console.error('Error submitting domain data', error);
      reset();
      notifyError('Failed to add talent. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div onClick={() => setOpen(true)}>{children}</div>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-950/40 px-2">
              <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <DialogTitle className="text-xl">Add Dehix Domain</DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                Select one of your profile domains, set your seniority level,
                and define your expected monthly pay for domain-based work.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Domain
            </p>
            <Controller
              control={control}
              name="label"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(selectedLabel) => {
                    const selectedDomain = domains.find(
                      (domain) => domain.name === selectedLabel,
                    );
                    field.onChange(selectedLabel);
                    setValue('domainId', selectedDomain?.type_id || '');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.length > 0 ? (
                      domains.map((domain) => (
                        <SelectItem key={domain._id} value={domain.name}>
                          {domain.name}
                        </SelectItem>
                      ))
                    ) : (
                      <Link href="/freelancer/settings/personal-info">
                        <p className="p-4 flex justify-center items-center">
                          No domains to add -{' '}
                          <span className="text-blue-500 ml-2">
                            Add some
                          </span>{' '}
                        </p>
                      </Link>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.label && (
              <p className="text-red-600 text-sm mt-1">
                {errors.label.message}
              </p>
            )}
          </div>
          <div>
            <Controller
              control={control}
              name="level"
              render={({ field }) => {
                const levels = [
                  'BEGINNER',
                  'INTERMEDIATE',
                  'ADVANCED',
                  'EXPERT',
                ];
                const currentIndex = (() => {
                  const idx = levels.indexOf(field.value || '');
                  return idx >= 0 ? idx : 0;
                })();

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        <Gauge className="h-3 w-3" />
                        <span>Seniority level</span>
                      </div>
                      {field.value && (
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {field.value}
                        </span>
                      )}
                    </div>
                    <Slider
                      min={0}
                      max={3}
                      step={1}
                      value={[currentIndex]}
                      onValueChange={([val]) => {
                        const next = levels[val] ?? levels[0];
                        field.onChange(next);
                      }}
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>Beginner</span>
                      <span>Intermediate</span>
                      <span>Advanced</span>
                      <span>Expert</span>
                    </div>
                  </div>
                );
              }}
            />
            {errors.level && (
              <p className="text-red-600 text-sm mt-1">
                {errors.level.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span>Experience</span>
              </div>
              <Controller
                control={control}
                name="experience"
                render={({ field }) => (
                  <InputGroup>
                    <InputGroupText>
                      <Clock className="h-4 w-4" />
                    </InputGroupText>
                    <InputGroupInput
                      type="number"
                      placeholder="Experience"
                      min={0}
                      max={50}
                      step={0.1}
                      {...field}
                    />
                    <InputGroupText>YEARS</InputGroupText>
                  </InputGroup>
                )}
              />
              {errors.experience && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.experience.message}
                </p>
              )}
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span>Monthly pay</span>
              </div>
              <Controller
                control={control}
                name="monthlyPay"
                render={({ field }) => (
                  <InputGroup>
                    <InputGroupText>
                      <Wallet className="h-4 w-4" />
                    </InputGroupText>
                    <InputGroupInput
                      type="number"
                      placeholder="Monthly Pay"
                      min={0}
                      {...field}
                    />
                    <InputGroupText>/MONTH</InputGroupText>
                  </InputGroup>
                )}
              />
              {errors.monthlyPay && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.monthlyPay.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-8">
            <Button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DomainDialog;
