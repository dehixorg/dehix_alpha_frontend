import React, { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  Save,
  ArrowLeft,
  ArrowRight,
  Rocket,
  X,
  Users,
  Tag,
  Target,
  DollarSign,
  Plus,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';

import ProjectFormIllustration from './ProjectFormIllustration';
import ProjectFormStepper from './ProjectFormStepper';
import BudgetSection from './BudgetSection';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import ConnectsDialog from '@/components/shared/ConnectsDialog';
import DraftDialog from '@/components/shared/DraftDialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
import useDraft from '@/hooks/useDraft';
import SelectTagPicker from '@/components/shared/SelectTagPicker';

const urlValueSchema = z.string().url({ message: 'Please enter a valid URL.' });

const profileFormSchema = z.object({
  projectName: z
    .string()
    .min(2, { message: 'Project Name must be at least 2 characters.' }),
  email: z
    .string({ required_error: 'Email is required.' })
    .email({ message: 'Please enter a valid email address.' }),
  projectDomain: z.string({ required_error: 'Project domain is required.' }),
  urls: z
    .array(
      z.object({
        value: z.string().optional(),
      }),
    )
    .optional(),
  description: z
    .string()
    .min(4, { message: 'Description must be at least 4 characters long.' })
    .max(160, { message: 'Description cannot exceed 160 characters.' }),
  profiles: z
    .array(
      z.object({
        profileType: z.enum(['FREELANCER', 'CONSULTANT']),
        domain: z
          .string({ required_error: 'Domain is required.' })
          .min(1, { message: 'Domain cannot be empty.' }),
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
  projectDomain: '',
  urls: [],
  description: '',
  profiles: [
    {
      domain: '',
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
  Budget = 'Budget',
}

export function CreateProjectBusinessForm() {
  const user = useSelector((state: RootState) => state.user);

  // State for skills and domains
  const [skills, setSkills] = useState<any[]>([]);
  const [currSkills, setCurrSkills] = useState<{ [key: number]: string[] }>({});
  const [currDomains, setCurrDomains] = useState<{ [key: number]: string[] }>(
    {},
  );
  const [domains, setDomains] = useState<any[]>([]);
  const [projectDomains, setProjectDomains] = useState<any[]>([]);

  // State for form and UI
  const [loading, setLoading] = useState(false);
  const [_isSaving, _setIsSaving] = useState(false);
  const [_profileType, setProfileType] = useState<'Freelancer' | 'Consultant'>(
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

  const schema = useMemo(() => {
    return profileFormSchema.superRefine((data, ctx) => {
      (data.urls || []).forEach((u, index) => {
        const v = String(u?.value || '').trim();
        if (!v) return;
        if (!urlValueSchema.safeParse(v).success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Please enter a valid URL.',
            path: ['urls', index, 'value'],
          });
        }
      });

      if (mode !== 'multiple') return;

      data.profiles?.forEach((profile, index) => {
        if (!profile.domain_id || profile.domain_id.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Domain ID is required.',
            path: ['profiles', index, 'domain_id'],
          });
        }
      });
    });
  }, [mode]);

  // Initialize form with default values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
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

    // Build fresh domains map keyed by current indices
    const rebuiltDomains: { [key: number]: string[] } = {};
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

  // State to store the current draft data
  const [currentDraft, setCurrentDraft] = useState<any>(null);

  // Draft logic
  useEffect(() => {
    const savedDraft = localStorage.getItem(FORM_DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        if (hasOtherValues(parsedDraft) || hasProfiles(parsedDraft.profiles)) {
          setCurrentDraft(parsedDraft);
          setShowLoadDraftDialog(true);
        }
      } catch (error) {
        console.error('Error parsing saved draft:', error);
        localStorage.removeItem(FORM_DRAFT_KEY);
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
            value: d._id,
            label: d.label,
          })),
        );
        setDomains(
          domainRes.data.data.map((d: any) => ({
            value: d._id,
            label: d.label,
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

  // Draft save/load/discard
  const saveDraft = () => {
    const formValues = form.getValues();
    const isOtherValid = hasOtherValues(formValues);
    const isProfileValid = hasProfiles(formValues.profiles);

    if (!isOtherValid && !isProfileValid) {
      notifyError('Cannot save an empty draft.', 'Empty Draft');
      return;
    }

    // Prepare profiles with current skills
    const draftProfiles = formValues.profiles?.map(
      (profile: any, index: number) => ({
        ...profile,
        skills: Array.isArray(currSkills[index]) ? [...currSkills[index]] : [],
      }),
    );

    // Save additional metadata with the draft
    const draftData = {
      ...formValues,
      profiles: draftProfiles,
      savedAt: new Date().toISOString(),
      currentStep,
      activeProfile,
      mode,
    };

    try {
      localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(draftData));
      setCurrentDraft(draftData); // Update the current draft state
      notifySuccess(
        'Your form data has been saved as a draft. Redirecting to dashboard...',
        'Draft Saved',
      );

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard/business';
      }, 1500);
    } catch (error) {
      console.error('Error saving draft:', error);
      notifyError('Failed to save draft. Please try again.', 'Error');
    }
  };

  const loadDraft = () => {
    if (!currentDraft) {
      notifyError('No draft data available to load.', 'No Draft Found');
      setShowLoadDraftDialog(false);
      return;
    }

    try {
      // Update form with draft data
      form.reset({
        ...currentDraft,
        // Ensure we don't include internal metadata in the form values
        savedAt: undefined,
        currentStep: undefined,
        activeProfile: undefined,
        mode: undefined,
      });

      // Update skills state
      if (currentDraft.profiles) {
        const skillsMap: { [key: number]: string[] } = {};
        currentDraft.profiles.forEach((profile: any, index: number) => {
          skillsMap[index] = Array.isArray(profile.skills)
            ? [...profile.skills]
            : [];
        });
        setCurrSkills(skillsMap);
      }

      // Update current step if available in draft
      if (currentDraft.currentStep) {
        setCurrentStep(currentDraft.currentStep);
      }

      // Update active profile if available
      if (currentDraft.activeProfile !== undefined) {
        setActiveProfile(currentDraft.activeProfile);
      }

      notifySuccess('Your saved draft has been loaded.', 'Draft loaded');
    } catch (error) {
      console.error('Error loading draft:', error);
      notifyError(
        'There was a problem loading your draft.',
        'Error loading draft',
      );
    }
    setShowLoadDraftDialog(false);
  };

  const discardDraft = () => {
    localStorage.removeItem(FORM_DRAFT_KEY);
    setCurrentDraft(null);
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
        (profile) => ({
          ...profile,
          budget: getBudgetForAPI(profile.budget),
        }),
      );
      const payload = {
        projectName: data.projectName,
        description: data.description,
        email: data.email,
        companyId: user.uid,
        companyName: user.displayName,
        skillsRequired: uniqueSkills,
        projectDomain:
          projectDomains.find((d) => d.value === data.projectDomain)?.label ||
          '',
        role: '',
        projectType: 'FREELANCE',
        url: (data.urls || []).map((u) => u.value).filter(Boolean),
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
    setCurrSkills([]);
  }

  const prevStep = () => {
    if (currentStep === FormSteps.ProfileInfo)
      setCurrentStep(FormSteps.ProjectInfo);
    if (currentStep === FormSteps.Budget) setCurrentStep(FormSteps.ProfileInfo);
  };

  const getProfileStepValidateFields = () => {
    const profiles = form.getValues('profiles') || [];
    const fields: string[] = [];

    for (let i = 0; i < profiles.length; i += 1) {
      fields.push(`profiles.${i}.freelancersRequired`);
      fields.push(`profiles.${i}.skills`);
      fields.push(`profiles.${i}.experience`);
      fields.push(`profiles.${i}.minConnect`);
      fields.push(`profiles.${i}.domain`);
      if (mode === 'multiple') {
        fields.push(`profiles.${i}.domain_id`);
      }
    }

    return fields;
  };

  const getBudgetStepValidateFields = () => {
    const profiles = form.getValues('profiles') || [];
    const fields: string[] = [];

    for (let i = 0; i < profiles.length; i += 1) {
      fields.push(`profiles.${i}.budget.type`);
      fields.push(`profiles.${i}.budget.fixedAmount`);
      fields.push(`profiles.${i}.budget.hourly.minRate`);
      fields.push(`profiles.${i}.budget.hourly.maxRate`);
      fields.push(`profiles.${i}.budget.hourly.estimatedHours`);
    }

    return fields;
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
              domain: '',
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
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        control={form.control}
        name="projectName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Project Name</FormLabel>
            <FormControl>
              <InputGroup>
                <InputGroupInput
                  placeholder="Enter your project name"
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
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Contact Email</FormLabel>
            <FormControl>
              <InputGroup>
                <InputGroupInput
                  type="email"
                  placeholder="you@company.com"
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
        name="projectDomain"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel className="text-foreground">Project Domain</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project domain" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {projectDomains.map((d: any) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel className="text-foreground">
              Project Description
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe what you need and what success looks like"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="sm:col-span-2">
        <div className="space-y-3">
          {urlFields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`urls.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(index !== 0 && 'sr-only')}>
                    URLs
                  </FormLabel>
                  <FormDescription className={index !== 0 ? 'sr-only' : ''}>
                    Add relevant links (website, docs, etc.).
                  </FormDescription>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <InputGroup>
                        <InputGroupInput {...field} placeholder="https://" />
                      </InputGroup>
                      <Button
                        variant="outline"
                        type="button"
                        size="icon"
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
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfileInfoStep = () => (
    <div className="lg:col-span-2 xl:col-span-2">
      {/* Tabs moved inside card header; no standalone bar here */}
      {profileFields.map((field, index) => {
        if (mode === 'single' && index > 0) return null;

        return index === activeProfile || mode === 'single' ? (
          <div key={index} className="space-y-4">
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
                  <h4 className="font-semibold">
                    Profile {mode === 'multiple' ? index + 1 : ''}
                  </h4>
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

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name={`profiles.${index}.freelancersRequired`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Positions
                    </FormLabel>
                    <FormDescription>
                      How many people you want for this role.
                    </FormDescription>
                    <FormControl>
                      <InputGroup>
                        <InputGroupInput
                          type="number"
                          inputMode="numeric"
                          placeholder="e.g. 2"
                          min={1}
                          {...field}
                        />
                        <InputGroupText>PEOPLE</InputGroupText>
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name={`profiles.${index}.domain_id`}
                render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Tag className="h-4 w-4" /> Profile Domain
                    </FormLabel>
                    <FormDescription>
                      Choose the closest domain for this profile.
                    </FormDescription>
                    <FormControl>
                      <SelectTagPicker
                        label=""
                        options={domains}
                        selected={(currDomains[index] || []).map(
                          (d: string) => ({ name: d }),
                        )}
                        onAdd={(val: string) => {
                          if (!val) return;

                          const selectedDomain = (domains || []).find(
                            (d: any) => d?.value === val || d?.label === val,
                          );
                          if (!selectedDomain?.value) return;

                          setCurrDomains((prev) => {
                            const updated = [
                              String(selectedDomain.label || val),
                            ];
                            const newDomains = { ...prev, [index]: updated };
                            form.setValue(
                              `profiles.${index}.domain_id`,
                              String(selectedDomain.value),
                              {
                                shouldValidate: true,
                              },
                            );
                            form.setValue(
                              `profiles.${index}.domain`,
                              String(selectedDomain.label || ''),
                              {
                                shouldValidate: true,
                              },
                            );
                            return newDomains;
                          });
                        }}
                        onRemove={() => {
                          setCurrDomains((prev) => {
                            const updated: string[] = [];
                            const newDomains = { ...prev, [index]: updated };
                            form.setValue(`profiles.${index}.domain_id`, '', {
                              shouldValidate: true,
                            });
                            form.setValue(`profiles.${index}.domain`, '', {
                              shouldValidate: true,
                            });
                            return newDomains;
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
                name={`profiles.${index}.skills`}
                render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Award className="h-4 w-4" /> Skills
                    </FormLabel>
                    <FormDescription>
                      Add the key skills you want for this role.
                    </FormDescription>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name={`profiles.${index}.experience`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Target className="h-4 w-4" /> Experience
                    </FormLabel>
                    <FormDescription>
                      Minimum years of experience required.
                    </FormDescription>
                    <FormControl>
                      <InputGroup>
                        <InputGroupInput
                          type="number"
                          inputMode="decimal"
                          placeholder="e.g. 3"
                          min={0}
                          max={60}
                          {...field}
                        />
                        <InputGroupText>YEARS</InputGroupText>
                      </InputGroup>
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
                    <FormDescription>
                      Minimum connects required to apply.
                    </FormDescription>
                    <FormControl>
                      <InputGroup>
                        <InputGroupInput
                          type="number"
                          inputMode="numeric"
                          placeholder="Recommended: 10"
                          min={1}
                          {...field}
                        />
                        <InputGroupText>CONNECTS</InputGroupText>
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-2">
              <FormField
                control={form.control}
                name={`profiles.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      Role Description (optional)
                    </FormLabel>
                    <FormDescription>
                      Add a short note about responsibilities, deliverables, or
                      expectations.
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Example: Build the frontend UI for the dashboard and integrate APIs."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ) : null;
      })}
    </div>
  );

  const renderBudgetStep = () => (
    <div className="lg:col-span-2 xl:col-span-2">
      {mode === 'multiple' && (
        <div className="mb-3">
          <ProfileTabs />
        </div>
      )}
      <BudgetSection
        form={form}
        activeProfile={activeProfile}
        className="w-full"
      />
    </div>
  );

  return (
    <>
      <div className="w-full px-4 sm:px-6">
        <div className="mx-auto w-full">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <section className="hidden lg:block">
              <div className="sticky top-10">
                <div className="rounded-2xl border bg-gradient p-8">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 border flex items-center justify-center px-3">
                      <Rocket className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-3xl font-bold tracking-tight">
                        Create a project
                      </h1>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Add project info, define one or more profiles, set your
                        budget, and publish.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border bg-background/60">
                    <ProjectFormIllustration className="p-6" />
                  </div>

                  <Separator className="my-6" />

                  <div className="grid gap-3 text-sm">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                      <p className="text-muted-foreground">
                        Clear three-step flow (Project Info → Profiles →
                        Budget).
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Tag className="mt-0.5 h-4 w-4 text-primary" />
                      <p className="text-muted-foreground">
                        Add domains and skills using quick tag pickers.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="mt-0.5 h-4 w-4 text-primary" />
                      <p className="text-muted-foreground">
                        Set a fixed or hourly budget with validation.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 rounded-xl bg-background/60 border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Estimated time</p>
                      <Badge variant="outline">3-5 minutes</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      You can save a draft before publishing.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="w-full">
              <Card className="w-full rounded-xl">
                <CardHeader>
                  <div className="lg:hidden mb-2">
                    <CardTitle>Create a project</CardTitle>
                    <CardDescription>
                      Add project info, define profiles, set budget, and
                      publish.
                    </CardDescription>
                  </div>

                  <ProjectFormStepper
                    currentStep={
                      currentStep === FormSteps.ProjectInfo
                        ? 0
                        : currentStep === FormSteps.ProfileInfo
                          ? 1
                          : 2
                    }
                    onProjectClick={() => setCurrentStep(FormSteps.ProjectInfo)}
                    onProfileClick={async () => {
                      const ok = await form.trigger([
                        'projectName',
                        'email',
                        'projectDomain',
                        'description',
                      ]);
                      if (!ok) {
                        notifyError(
                          'Please complete required fields before continuing',
                        );
                        return;
                      }
                      setCurrentStep(FormSteps.ProfileInfo);
                    }}
                    onBudgetClick={async () => {
                      const ok = await form.trigger([
                        'projectName',
                        'email',
                        'projectDomain',
                        'description',
                        ...getProfileStepValidateFields(),
                      ] as any);
                      if (!ok) {
                        notifyError(
                          'Please complete required fields before continuing',
                        );
                        return;
                      }
                      setCurrentStep(FormSteps.Budget);
                    }}
                    className="mt-2"
                  />
                </CardHeader>

                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      {currentStep === FormSteps.ProjectInfo &&
                        renderProjectInfoStep()}
                      {currentStep === FormSteps.ProfileInfo &&
                        renderProfileInfoStep()}
                      {currentStep === FormSteps.Budget && renderBudgetStep()}

                      <div className="w-full flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendUrl({ value: '' })}
                          disabled={
                            currentStep === FormSteps.ProfileInfo ||
                            currentStep === FormSteps.Budget
                          }
                          className={
                            currentStep === FormSteps.ProfileInfo ||
                            currentStep === FormSteps.Budget
                              ? 'invisible pointer-events-none'
                              : ''
                          }
                        >
                          Add URL
                        </Button>

                        <div className="flex items-center gap-2">
                          {currentStep === FormSteps.ProjectInfo && (
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={saveDraft}
                                title="Save Draft"
                                aria-label="Save Draft"
                              >
                                <Save className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">
                                  Save Draft
                                </span>
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                aria-label="Next"
                                onClick={async () => {
                                  const ok = await form.trigger([
                                    'projectName',
                                    'email',
                                    'projectDomain',
                                    'description',
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
                                <ArrowRight className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Next</span>
                              </Button>
                            </div>
                          )}

                          {currentStep === FormSteps.ProfileInfo && (
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                aria-label="Back"
                                onClick={prevStep}
                              >
                                <ArrowLeft className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Back</span>
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={saveDraft}
                                title="Save Draft"
                                aria-label="Save Draft"
                              >
                                <Save className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">
                                  Save Draft
                                </span>
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                aria-label="Next"
                                onClick={async () => {
                                  const ok = await form.trigger(
                                    getProfileStepValidateFields() as any,
                                  );
                                  if (!ok) {
                                    notifyError(
                                      'Please complete required fields before continuing',
                                    );
                                    return;
                                  }
                                  setCurrentStep(FormSteps.Budget);
                                }}
                              >
                                <ArrowRight className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Next</span>
                              </Button>
                            </div>
                          )}

                          {currentStep === FormSteps.Budget && (
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                aria-label="Back"
                                onClick={prevStep}
                              >
                                <ArrowLeft className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Back</span>
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={saveDraft}
                                title="Save Draft"
                                aria-label="Save Draft"
                              >
                                <Save className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">
                                  Save Draft
                                </span>
                              </Button>

                              <ConnectsDialog
                                loading={loading}
                                setLoading={setLoading}
                                isValidCheck={async () => {
                                  const fieldsToValidate = [
                                    'projectName',
                                    'email',
                                    'description',
                                    'urls',
                                    ...getProfileStepValidateFields(),
                                    ...getBudgetStepValidateFields(),
                                  ];

                                  try {
                                    const isValid = await form.trigger(
                                      fieldsToValidate as any,
                                      {
                                        shouldFocus: true,
                                      },
                                    );
                                    if (!isValid) {
                                      const { errors } = form.formState;
                                      const firstError = Object.keys(errors)[0];

                                      if (firstError) {
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
                                    const fieldsToValidate = [
                                      'projectName',
                                      'email',
                                      'description',
                                      'urls',
                                      ...getProfileStepValidateFields(),
                                      ...getBudgetStepValidateFields(),
                                    ];

                                    const isValid = await form.trigger(
                                      fieldsToValidate as any,
                                      {
                                        shouldFocus: true,
                                      },
                                    );
                                    if (!isValid) return;

                                    await onSubmit(form.getValues());
                                  } catch (error) {
                                    console.error('Submit error:', error);
                                  }
                                }}
                                userId={user.uid}
                                buttonText="Create Project"
                                userType="BUSINESS"
                                requiredConnects={parseInt(
                                  process.env
                                    .NEXT_PUBLIC__APP_PROJECT_CREATION_COST ||
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
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>

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
    </>
  );
}
