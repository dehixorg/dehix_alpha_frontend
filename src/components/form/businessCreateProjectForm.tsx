import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  Save,
  X,
  Users,
  Tag,
  Target,
  DollarSign,
  Plus,
  Award,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';

import { Card } from '../ui/card';
import ConnectsDialog from '../shared/ConnectsDialog';
import DraftDialog from '../shared/DraftDialog';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

import ProjectFormIllustration from './ProjectFormIllustration';
import ProjectFormStepper from './ProjectFormStepper';
import BudgetSection from './BudgetSection';

import { cn } from '@/lib/utils';
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
import { Textarea } from '@/components/ui/textarea';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
import useDraft from '@/hooks/useDraft';
import SelectTagPicker from '@/components/shared/SelectTagPicker';

const profileFormSchema = z.object({
  projectName: z
    .string()
    .min(2, { message: 'Project Name must be at least 2 characters.' }),
  email: z
    .string({ required_error: 'Email is required.' })
    .email({ message: 'Please enter a valid email address.' }),
  projectDomain: z
    .array(z.string().min(1, { message: 'Project domain cannot be empty.' }))
    .min(1, { message: 'At least one project domain is required.' }),
  urls: z
    .array(
      z.object({
        value: z.string().url({ message: 'Please enter a valid URL.' }),
      }),
    )
    .optional(),
  description: z
    .string()
    .min(4, { message: 'Description must be at least 4 characters long.' })
    .max(160, { message: 'Description cannot exceed 160 characters.' })
    .optional(),
  profiles: z
    .array(
      z.object({
        profileType: z.enum(['FREELANCER', 'CONSULTANT']),
        domain: z
          .array(z.string().min(1, { message: 'Domain cannot be empty.' }))
          .min(1, { message: 'At least one domain is required.' }),
        description: z.string().optional(),
        freelancersRequired: z
          .string()
          .refine((val) => /^\d+$/.test(val) && parseInt(val, 10) > 0, {
            message:
              'Number of freelancers required should be a positive number.',
          }),
        skills: z
          .array(z.string().min(1, { message: 'Skill name cannot be empty.' }))
          .min(1, { message: 'At least one skill is required.' }),
        experience: z
          .string()
          .refine(
            (val) =>
              /^\d+$/.test(val) &&
              parseInt(val, 10) >= 0 &&
              parseInt(val, 10) <= 40,
            { message: 'Experience must be a number between 0 and 40.' },
          ),
        domain_id: z.string().optional(),
        minConnect: z
          .string()
          .refine((val) => /^\d+$/.test(val) && parseInt(val, 10) > 0, {
            message: 'Minimum connect must be at least 1.',
          }),
        budget: z
          .object({
            type: z.enum(['FIXED', 'HOURLY']),
            fixedAmount: z.string().optional(),
            hourly: z
              .object({
                minRate: z.string().optional(),
                maxRate: z.string().optional(),
                estimatedHours: z.string().optional(),
              })
              .optional(),
          })
          .superRefine((data, ctx) => {
            if (data.type === 'FIXED') {
              if (!data.fixedAmount) {
                ctx.addIssue({
                  path: ['fixedAmount'],
                  code: z.ZodIssueCode.custom,
                  message: 'Fixed amount is required',
                });
              } else if (
                !/^\d+(\.\d{1,2})?$/.test(data.fixedAmount) ||
                parseFloat(data.fixedAmount) <= 0
              ) {
                ctx.addIssue({
                  path: ['fixedAmount'],
                  code: z.ZodIssueCode.custom,
                  message: 'Enter a valid amount greater than 0',
                });
              }
            }
            if (data.type === 'HOURLY') {
              if (!data.hourly) {
                ctx.addIssue({
                  path: ['hourly'],
                  code: z.ZodIssueCode.custom,
                  message: 'Hourly details are required',
                });
                return;
              }
              const { minRate, maxRate, estimatedHours } = data.hourly;
              if (!minRate) {
                ctx.addIssue({
                  path: ['hourly', 'minRate'],
                  code: z.ZodIssueCode.custom,
                  message: 'Minimum rate is required',
                });
              } else if (
                !/^\d+(\.\d{1,2})?$/.test(minRate) ||
                parseFloat(minRate) <= 0
              ) {
                ctx.addIssue({
                  path: ['hourly', 'minRate'],
                  code: z.ZodIssueCode.custom,
                  message: 'Enter a valid minimum rate > 0',
                });
              }
              if (!maxRate) {
                ctx.addIssue({
                  path: ['hourly', 'maxRate'],
                  code: z.ZodIssueCode.custom,
                  message: 'Maximum rate is required',
                });
              } else if (
                !/^\d+(\.\d{1,2})?$/.test(maxRate) ||
                parseFloat(maxRate) <= 0
              ) {
                ctx.addIssue({
                  path: ['hourly', 'maxRate'],
                  code: z.ZodIssueCode.custom,
                  message: 'Enter a valid maximum rate > 0',
                });
              }
              if (!estimatedHours) {
                ctx.addIssue({
                  path: ['hourly', 'estimatedHours'],
                  code: z.ZodIssueCode.custom,
                  message: 'Estimated hours are required',
                });
              } else if (
                !/^\d+$/.test(estimatedHours) ||
                parseInt(estimatedHours) <= 0
              ) {
                ctx.addIssue({
                  path: ['hourly', 'estimatedHours'],
                  code: z.ZodIssueCode.custom,
                  message: 'Enter a valid number of hours > 0',
                });
              }
              if (
                minRate &&
                maxRate &&
                /^\d+(\.\d{1,2})?$/.test(minRate) &&
                /^\d+(\.\d{1,2})?$/.test(maxRate)
              ) {
                const min = parseFloat(minRate);
                const max = parseFloat(maxRate);
                if (max < min) {
                  ctx.addIssue({
                    path: ['hourly', 'maxRate'],
                    code: z.ZodIssueCode.custom,
                    message: 'Maximum rate must be ≥ minimum rate',
                  });
                }
              }
            }
          }),
      }),
    )
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const defaultValues: Partial<ProfileFormValues> = {
  projectName: '',
  email: '',
  projectDomain: [],
  urls: [],
  description: '',
  profiles: [
    {
      domain: [],
      freelancersRequired: '',
      skills: [],
      experience: '',
      minConnect: '',
      budget: {
        type: 'FIXED',
        fixedAmount: '',
        hourly: { minRate: '', maxRate: '', estimatedHours: '' },
      },
      domain_id: '',
      profileType: 'FREELANCER',
    },
  ],
};

const FORM_DRAFT_KEY = 'DEHIX-BUSINESS-DRAFT';

enum FormSteps {
  ProjectInfo = 'ProjectInfo',
  ProfileInfo = 'ProfileInfo',
}

export function CreateProjectBusinessForm() {
  const user = useSelector((state: RootState) => state.user);
  const [skills, setSkills] = useState<any[]>([]);
  const [currSkills, setCurrSkills] = useState<{ [key: number]: string[] }>({});
  const [domains, setDomains] = useState<any[]>([]);
  const [projectDomains, setProjectDomains] = useState<any[]>([]);
  const [currProjectDomains, setCurrProjectDomains] = useState<string[]>([]);
  const [currDomains, setCurrDomains] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [, setProfileType] = useState<'Freelancer' | 'Consultant'>(
    'Freelancer',
  );
  const [showLoadDraftDialog, setShowLoadDraftDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormSteps>(
    FormSteps.ProjectInfo,
  );
  const [activeProfile, setActiveProfile] = useState(0);
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') as 'single' | 'multiple';
  const { hasOtherValues, hasProfiles } = useDraft({});

  // Initialize form with default values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      ...defaultValues,
      projectDomain: [],
    },
    mode: 'onChange',
  });

  // Watch all form values to maintain state
  const formValues = form.watch();

  // Rebuild in-memory skills and domains when profiles count changes
  React.useEffect(() => {
    if (!formValues.profiles) return;

    const profileCount = formValues.profiles.length;

    // Build fresh skills map keyed by current indices
    const rebuiltSkills: { [key: number]: string[] } = {};
    for (let i = 0; i < profileCount; i += 1) {
      const s = form.getValues(`profiles.${i}.skills` as const);
      rebuiltSkills[i] = Array.isArray(s) ? [...s] : [];
    }
    setCurrSkills(rebuiltSkills);

    // Build fresh domains array aligned with current indices
    const rebuiltDomains: string[][] = [];
    for (let i = 0; i < profileCount; i += 1) {
      const d = form.getValues(`profiles.${i}.domain` as const);
      rebuiltDomains[i] = Array.isArray(d) ? [...d] : [];
    }
    setCurrDomains(rebuiltDomains);
  }, [form, formValues.profiles?.length]);

  // Update the current profile's data when it changes
  React.useEffect(() => {
    if (formValues.profiles && formValues.profiles[activeProfile]) {
      const currentProfile = formValues.profiles[activeProfile];

      // Update the form with current profile data
      const profileUpdates = {
        domain: currentProfile.domain,
        description: currentProfile.description || '',
        freelancersRequired: currentProfile.freelancersRequired,
        experience: currentProfile.experience,
        minConnect: currentProfile.minConnect,
        budget: currentProfile.budget,
        domain_id: currentProfile.domain_id,
        profileType: currentProfile.profileType || 'FREELANCER',
        skills: Array.isArray(currentProfile.skills)
          ? [...currentProfile.skills]
          : [],
      };

      // Only update if the values have changed to prevent infinite loops
      Object.entries(profileUpdates).forEach(([key, value]) => {
        const currentValue = form.getValues(
          `profiles.${activeProfile}.${key as keyof typeof profileUpdates}`,
        );
        if (JSON.stringify(currentValue) !== JSON.stringify(value)) {
          form.setValue(
            `profiles.${activeProfile}.${key as keyof typeof profileUpdates}` as any,
            value,
            { shouldValidate: true },
          );
        }
      });
    }
  }, [activeProfile, form, formValues.profiles]);

  const { fields: urlFields, append: appendUrl } = useFieldArray({
    name: 'urls',
    control: form.control,
  });

  const {
    fields: profileFields,
    append: appendProfile,
    remove: removeProfile,
  } = useFieldArray({
    name: 'profiles',
    control: form.control,
    keyName: 'formId', // Add a unique key to help with re-renders
  });

  // Draft logic
  useEffect(() => {
    const savedDraft = localStorage.getItem(FORM_DRAFT_KEY);
    if (savedDraft) {
      const parsedDraft = JSON.parse(savedDraft);
      if (hasOtherValues(parsedDraft) || hasProfiles(parsedDraft.profiles)) {
        setShowLoadDraftDialog(true);
      }
    }
  }, [hasProfiles, hasOtherValues]);

  // Fetch domains and skills
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectDomainRes, domainRes, skillsRes] = await Promise.all([
          axiosInstance.get('/projectdomain'),
          axiosInstance.get('/domain'),
          axiosInstance.get('/skills'),
        ]);
        setProjectDomains(
          projectDomainRes.data.data.map((d: any) => ({
            value: d.label,
            label: d.label,
          })),
        );
        setDomains(
          domainRes.data.data.map((d: any) => ({
            value: d.label,
            label: d.label,
            domain_id: d._id,
          })),
        );
        setSkills(
          skillsRes.data.data.map((s: any) => ({
            value: s.label,
            label: s.label,
          })),
        );
      } catch {
        notifyError('Something went wrong. Please try again.', 'Error');
      }
    };
    fetchData();
  }, []);

  const handleRemoveProjectDomain = (val: string) => {
    const updatedDomains = currProjectDomains.filter(
      (domain) => domain !== val,
    );
    setCurrProjectDomains(updatedDomains);
    form.setValue('projectDomain', updatedDomains, { shouldValidate: true });
  };

  // Draft save/load/discard
  const saveDraft = () => {
    const formValues = form.getValues();
    const isOtherValid = hasOtherValues(formValues);
    const isProfileValid = hasProfiles(formValues.profiles);
    if (!isOtherValid && !isProfileValid) {
      notifyError('Cannot save an empty draft.', 'Empty Draft');
      return;
    }
    const DraftProfile = formValues.profiles?.map(
      (profile: any, index: number) => ({
        ...profile,
        skills: Array.isArray(currSkills[index]) ? currSkills[index] : [],
        domain: Array.isArray(currDomains[index]) ? currDomains[index] : [],
      }),
    );
    const DraftData = { ...formValues, profiles: DraftProfile };
    localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(DraftData));
    notifySuccess('Your form data has been saved as a draft.', 'Draft Saved');
  };

  const loadDraft = () => {
    const savedDraft = localStorage.getItem(FORM_DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        form.reset(parsedDraft);
        setCurrProjectDomains(parsedDraft.projectDomain || []);
        setCurrSkills(
          parsedDraft.profiles?.map((profile: any) =>
            Array.isArray(profile.skills) ? profile.skills : [],
          ) || [],
        );
        setCurrDomains(
          parsedDraft.profiles?.map((profile: any) =>
            Array.isArray(profile.domain) ? profile.domain : [],
          ) || [],
        );
        notifySuccess('Your saved draft has been loaded.', 'Draft loaded');
      } catch {
        notifyError(
          'There was a problem loading your draft.',
          'Error loading draft',
        );
      }
    }
    setShowLoadDraftDialog(false);
  };

  const discardDraft = () => {
    localStorage.removeItem(FORM_DRAFT_KEY);
    setShowLoadDraftDialog(false);
    notifySuccess('Your saved draft has been discarded.', 'Draft discarded');
  };

  // Budget formatting for API
  const getBudgetForAPI = (budgetData: any) => {
    if (budgetData.type === 'FIXED') {
      return { type: 'FIXED', fixedAmount: parseFloat(budgetData.fixedAmount) };
    }
    return {
      type: 'HOURLY',
      hourly: {
        minRate: parseFloat(budgetData.hourly.minRate),
        maxRate: parseFloat(budgetData.hourly.maxRate),
        estimatedHours: parseInt(budgetData.hourly.estimatedHours),
      },
    };
  };

  // Form submit
  async function onSubmit(data: ProfileFormValues) {
    setLoading(true);
    try {
      const uniqueSkills = Array.from(
        new Set(Object.values(currSkills).flat().filter(Boolean)),
      );
      const profilesWithFormattedBudget = (data.profiles || []).map(
        (profile, idx) => ({
          ...profile,
          budget: getBudgetForAPI(profile.budget),
          domain: currDomains[idx] || [],
        }),
      );
      const payload = {
        projectName: data.projectName,
        description: data.description,
        email: data.email,
        companyId: user.uid,
        companyName: user.displayName,
        skillsRequired: uniqueSkills,
        projectDomain: currProjectDomains,
        role: '',
        projectType: 'FREELANCE',
        url: data.urls,
        profiles: profilesWithFormattedBudget,
      };
      await axiosInstance.post(`/project/business`, payload);
      notifySuccess(
        'Your project has been successfully added.',
        'Project Added',
      );

      const connectsCost = parseInt(
        process.env.NEXT_PUBLIC__APP_PROJECT_CREATION_COST || '150',
        10,
      );
      const prevConnects = parseInt(
        localStorage.getItem('DHX_CONNECTS') || '0',
      );
      const updatedConnects = prevConnects - connectsCost;
      // Update connects in DB as well
      try {
        await axiosInstance.put('/business', { connects: updatedConnects });
      } catch (err) {
        // Optionally handle error, but don't block UI
        console.error('Failed to update connects in DB:', err);
      }
      localStorage.setItem('DHX_CONNECTS', updatedConnects.toString());
      localStorage.removeItem(FORM_DRAFT_KEY);
      window.dispatchEvent(new Event('connectsUpdated'));
    } catch {
      notifyError('Failed to add project. Please try again later.', 'Error');
    } finally {
      setLoading(false);
    }
    form.reset(defaultValues);
    setCurrProjectDomains([]);
    setCurrSkills([]);
    setCurrDomains([]);
  }

  const prevStep = () => {
    if (currentStep === FormSteps.ProfileInfo)
      setCurrentStep(FormSteps.ProjectInfo);
  };

  // UI render helpers
  const ProfileTabs = () => (
    <div className="flex items-center justify-between gap-3 mb-3">
      <div className="min-w-0 flex-1">
        <ScrollArea>
          <div className={`flex items-center gap-2 whitespace-nowrap`}>
            {mode === 'multiple' &&
              profileFields.map((_, idx) => {
                const profileType = form.watch(`profiles.${idx}.profileType`);
                const profileTypeLabel =
                  profileType === 'FREELANCER' ? 'Freelancer' : 'Consultant';
                return (
                  <div
                    key={idx}
                    className={`shrink-0 inline-flex items-center gap-2 rounded-md border ${activeProfile === idx ? 'bg-primary/10 border-primary' : 'border-border'} px-3 py-1.5`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveProfile(idx)}
                      className="text-sm font-medium"
                    >
                      {profileTypeLabel} {idx + 1}
                    </button>
                    {profileFields.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeProfile(idx);
                          if (activeProfile >= idx) {
                            setActiveProfile(Math.max(idx - 1, 0));
                          }
                        }}
                        className="ml-1 text-red-500 hover:text-red-600"
                        aria-label={`Remove Profile ${idx + 1}`}
                        title="Remove profile"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      {mode === 'multiple' && (
        <Button
          type="button"
          variant="ghost"
          className="size-8 rounded-full"
          size="icon"
          onClick={() =>
            appendProfile({
              domain: [],
              freelancersRequired: '',
              skills: [],
              experience: '',
              minConnect: '',
              budget: {
                type: 'FIXED',
                fixedAmount: '',
                hourly: { minRate: '', maxRate: '', estimatedHours: '' },
              },
              description: '',
              domain_id: '',
              profileType: 'FREELANCER',
            })
          }
        >
          <Plus />
        </Button>
      )}
    </div>
  );

  const renderProjectInfoStep = () => (
    <div className="lg:col-span-2 xl:col-span-2 border border-border rounded-xl mb-4 overflow-hidden">
      {/* Header with icon and title */}
      <div className="bg-muted/50 p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
              <path d="M10 9H8" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold leading-tight">
              Project Information
            </h3>
            <p className="text-xs text-muted-foreground">
              Provide the basic details about your project
            </p>
          </div>
        </div>
      </div>

      {/* Form fields with internal borders */}
      <div className="bg-card">
        {/* Project Name */}
        <div className="p-4 border-b border-border">
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground text-sm font-medium">
                  Project Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your Project Name"
                    {...field}
                    className="bg-background border-border mt-1"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Contact Email */}
        <div className="p-4 border-b border-border">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground text-sm font-medium">
                  Contact Email
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email"
                    {...field}
                    className="bg-background border-border mt-1"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Project Domain */}
        <div className="p-4 border-b border-border">
          <FormField
            control={form.control}
            name="projectDomain"
            render={() => (
              <FormItem>
                <FormLabel className="text-foreground text-sm font-medium">
                  Project Domain
                </FormLabel>
                <FormControl>
                  <div className="mt-1">
                    <SelectTagPicker
                      label=""
                      options={projectDomains.map((d) => ({
                        label: d.label,
                        value: d.value,
                        _id: d._id,
                      }))}
                      selected={currProjectDomains.map((domain) => ({
                        name: domain,
                      }))}
                      onAdd={(value: string) => {
                        if (value && !currProjectDomains.includes(value)) {
                          const updatedDomains = [...currProjectDomains, value];
                          setCurrProjectDomains(updatedDomains);
                          form.setValue('projectDomain', updatedDomains, {
                            shouldValidate: true,
                          });
                        }
                      }}
                      onRemove={(name: string) =>
                        handleRemoveProjectDomain(name)
                      }
                      selectPlaceholder="Select project domain"
                      searchPlaceholder="Search domains..."
                      className="w-full bg-background border-border"
                      optionLabelKey="label"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Project Description */}
        <div className="p-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground text-sm font-medium">
                  Project Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter a detailed description of your project"
                    {...field}
                    className="min-h-[120px] bg-background border-border mt-1"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className="lg:col-span-2 xl:col-span-2">
        {urlFields.map((field, index) => (
          <FormField
            control={form.control}
            key={field.id}
            name={`urls.${index}.value`}
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <div className="flex-1">
                  <FormLabel className={cn(index !== 0 && 'sr-only')}>
                    URLs
                  </FormLabel>
                  <FormDescription
                    className={`${index !== 0 ? 'sr-only' : ''} mb-2`}
                  >
                    Enter URL of your account
                  </FormDescription>
                  <FormControl>
                    <div className="flex justify-center items-center  gap-3 mb-2">
                      <Input {...field} />
                      <Button
                        variant="outline"
                        type="button"
                        size="icon"
                        className="ml-2"
                        onClick={() =>
                          form.setValue(
                            'urls',
                            (form.getValues('urls') || []).filter(
                              (_, i) => i !== index,
                            ),
                          )
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="my-2.5" />
                </div>
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  );

  const renderProfileInfoStep = () => (
    <div className="lg:col-span-2 xl:col-span-2">
      {/* Tabs moved inside card header; no standalone bar here */}
      {profileFields.map((field, index) => {
        if (mode === 'single' && index > 0) return null;

        return index === activeProfile || mode === 'single' ? (
          <div
            key={index}
            className="rounded-xl border bg-card shadow-sm p-5 mb-6"
          >
            {mode === 'multiple' && (
              <div className="mb-3">
                <ProfileTabs />
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Profile {index + 1}</h4>
                  <p className="text-xs text-muted-foreground">
                    Define role, skills and requirements
                  </p>
                </div>
              </div>
              {mode === 'multiple' && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      form.watch(`profiles.${index}.profileType`) ===
                      'FREELANCER'
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() => {
                      setProfileType('Freelancer');
                      form.setValue(
                        `profiles.${index}.profileType`,
                        'FREELANCER',
                      );
                    }}
                  >
                    Freelancer
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      form.watch(`profiles.${index}.profileType`) ===
                      'CONSULTANT'
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() => {
                      setProfileType('Consultant');
                      form.setValue(
                        `profiles.${index}.profileType`,
                        'CONSULTANT',
                      );
                    }}
                  >
                    Consultant
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <FormField
                control={form.control}
                name={`profiles.${index}.domain`}
                render={() => (
                  <FormItem className="mb-4">
                    <FormLabel className="flex items-center gap-2">
                      <Tag className="h-4 w-4" /> Profile Domain
                    </FormLabel>
                    <FormControl>
                      <SelectTagPicker
                        label=""
                        options={domains.map((d: any) => ({
                          label: d.label,
                          _id: d.value,
                        }))}
                        selected={(currDomains[index] || [])
                          .slice(0, 1)
                          .map((d: string) => ({ name: d }))}
                        onAdd={(val: string) => {
                          if (!val) return;
                          const updated = [val];
                          setCurrDomains((prev) => ({
                            ...prev,
                            [index]: updated,
                          }));
                          form.setValue(`profiles.${index}.domain`, updated, {
                            shouldValidate: true,
                          });
                          // Also persist the selected domain's id alongside the label in the profile
                          const selected = domains.find(
                            (d: any) => d.label === val,
                          );
                          form.setValue(
                            `profiles.${index}.domain_id`,
                            selected?.domain_id || '',
                            { shouldValidate: true },
                          );
                        }}
                        onRemove={() => {
                          const updated: string[] = [];
                          setCurrDomains((prev) => ({
                            ...prev,
                            [index]: updated,
                          }));
                          form.setValue(`profiles.${index}.domain`, updated, {
                            shouldValidate: true,
                          });
                          form.setValue(`profiles.${index}.domain_id`, '', {
                            shouldValidate: true,
                          });
                        }}
                        className="w-full"
                        optionLabelKey="label"
                        selectedNameKey="name"
                        selectPlaceholder="Select domain"
                        searchPlaceholder="Search domains..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`profiles.${index}.freelancersRequired`}
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Positions
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter number"
                        min={1}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`profiles.${index}.skills`}
                render={() => (
                  <FormItem className="mb-4">
                    <FormLabel className="flex items-center gap-2">
                      <Award className="h-4 w-4" /> Skills
                    </FormLabel>
                    <FormControl>
                      <SelectTagPicker
                        label=""
                        options={skills.map((skill) => ({
                          value: skill.label,
                          label: skill.label,
                        }))}
                        selected={(currSkills[index] || []).map((skill) => ({
                          name: skill,
                        }))}
                        onAdd={(value: string) => {
                          if (
                            value &&
                            !(currSkills[index] || []).includes(value)
                          ) {
                            const updatedSkills = [
                              ...(currSkills[index] || []),
                              value,
                            ];
                            setCurrSkills((prev) => ({
                              ...prev,
                              [index]: updatedSkills,
                            }));
                            form.setValue(
                              `profiles.${index}.skills`,
                              updatedSkills,
                              { shouldValidate: true },
                            );
                          }
                        }}
                        onRemove={(skillToRemove: string) => {
                          const updatedSkills = (
                            currSkills[index] || []
                          ).filter((skill) => skill !== skillToRemove);
                          setCurrSkills((prev) => ({
                            ...prev,
                            [index]: updatedSkills,
                          }));
                          form.setValue(
                            `profiles.${index}.skills`,
                            updatedSkills,
                            { shouldValidate: true },
                          );
                        }}
                        selectPlaceholder="Select skills"
                        searchPlaceholder="Search skills..."
                        className="w-full"
                        optionLabelKey="label"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField
                control={form.control}
                name={`profiles.${index}.experience`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Target className="h-4 w-4" /> Experience
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter experience"
                        min={0}
                        max={60}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`profiles.${index}.minConnect`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> Min Connect
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Min Connects (Recommended: 10)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Section divider before budget */}
            <div className="border-t mt-2 mb-4" />
            <BudgetSection
              form={form}
              activeProfile={activeProfile}
              className="w-full"
            />
          </div>
        ) : null;
      })}
    </div>
  );

  return (
    <Card className="p-6 md:p-8 lg:p-10">
      <div className="grid gap-8 lg:grid-cols-3">
        <ProjectFormIllustration />

        <div className="lg:col-span-2">
          {/* Stepper */}
          <ProjectFormStepper
            currentStep={currentStep === FormSteps.ProjectInfo ? 0 : 1}
            onProjectClick={() => setCurrentStep(FormSteps.ProjectInfo)}
            onProfileClick={async () => {
              const ok = await form.trigger([
                'projectName',
                'email',
                'projectDomain',
              ]);
              if (!ok) {
                notifyError(
                  'Please complete required fields before continuing',
                );
                return;
              }
              setCurrentStep(FormSteps.ProfileInfo);
            }}
            className="mb-6"
          />

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="gap-6 grid grid-cols-1 lg:grid-cols-2"
            >
              {currentStep === FormSteps.ProjectInfo && renderProjectInfoStep()}
              {currentStep === FormSteps.ProfileInfo && renderProfileInfoStep()}

              <div className="w-full flex col-span-1 lg:col-span-2 items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendUrl({ value: '' })}
                  disabled={currentStep === FormSteps.ProfileInfo}
                  className={
                    currentStep === FormSteps.ProfileInfo
                      ? 'invisible pointer-events-none'
                      : ''
                  }
                >
                  Add URL
                </Button>
                <div className="flex items-center gap-2">
                  {currentStep === FormSteps.ProjectInfo && (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={async () => {
                        const ok = await form.trigger([
                          'projectName',
                          'email',
                          'projectDomain',
                        ]);
                        if (!ok) {
                          notifyError(
                            'Please complete required fields before continuing',
                          );
                          return;
                        }
                        setCurrentStep(FormSteps.ProfileInfo);
                      }}
                    >
                      Next
                    </Button>
                  )}
                  {currentStep === FormSteps.ProfileInfo && (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={prevStep}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={saveDraft}
                        title="Save Draft"
                      >
                        <Save className="h-4 w-4 mr-1" /> Save Draft
                      </Button>
                      <ConnectsDialog
                        loading={loading}
                        isValidCheck={async () => {
                          // Validate all required fields
                          const fieldsToValidate = [
                            'projectName',
                            'email',
                            'description',
                            'urls',
                            'profiles',
                          ];

                          try {
                            const isValid = await form.trigger(
                              fieldsToValidate as any,
                              {
                                shouldFocus: true,
                              },
                            );
                            if (!isValid) {
                              // If validation fails, show error for the first invalid field
                              const { errors } = form.formState;
                              const firstError = Object.keys(errors)[0];

                              if (firstError) {
                                // Handle nested errors (like array items)
                                const getNestedError = (
                                  obj: any,
                                  path: string,
                                ) => {
                                  return path
                                    .split('.')
                                    .reduce(
                                      (o, p) =>
                                        o && o[p] !== undefined
                                          ? o[p]
                                          : undefined,
                                      obj,
                                    );
                                };

                                const error = getNestedError(
                                  errors,
                                  firstError,
                                );
                                const errorMessage =
                                  error?.message ||
                                  'Please fill in all required fields';

                                notifyError(
                                  typeof errorMessage === 'string'
                                    ? errorMessage
                                    : 'Please fill in all required fields',
                                  'Validation Error',
                                );
                              } else {
                                notifyError(
                                  'Please fill in all required fields',
                                  'Validation Error',
                                );
                              }
                            }
                            return isValid;
                          } catch (error) {
                            console.error('Validation error:', error);
                            return false;
                          }
                        }}
                        onSubmit={async () => {
                          try {
                            // First validate all fields
                            const fieldsToValidate = [
                              'projectName',
                              'email',
                              'description',
                              'urls',
                              'profiles',
                            ];

                            const isValid = await form.trigger(
                              fieldsToValidate as any,
                              {
                                shouldFocus: true,
                              },
                            );
                            if (!isValid) return;

                            // If validation passes, submit the form
                            await form.handleSubmit(onSubmit)();
                          } catch (error) {
                            console.error('Submission error:', error);
                          }
                        }}
                        setLoading={setLoading}
                        userId={user?.uid || ''}
                        buttonText={'Create Project'}
                        userType={'BUSINESS'}
                        requiredConnects={parseInt(
                          process.env.NEXT_PUBLIC__APP_PROJECT_CREATION_COST ||
                            '150',
                          10,
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
            </form>
          </Form>

          {showLoadDraftDialog && (
            <DraftDialog
              dialogChange={showLoadDraftDialog}
              setDialogChange={setShowLoadDraftDialog}
              heading="Load Draft?"
              desc="A saved draft was found. Do you want to load it?"
              handleClose={discardDraft}
              handleSave={loadDraft}
              btn1Txt=" Discard"
              btn2Txt="Load Draft"
            />
          )}
        </div>
      </div>
    </Card>
  );
}
