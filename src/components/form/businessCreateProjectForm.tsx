import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus, Save, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';

import { Card } from '../ui/card';
import ConnectsDialog from '../shared/ConnectsDialog';
import DraftDialog from '../shared/DraftDialog';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';
import { Badge } from '@/components/ui/badge';
import { RootState } from '@/lib/store';
import useDraft from '@/hooks/useDraft';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
        domain: z.string().min(1, { message: 'Domain is required.' }),
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
        domain_id: z.string().min(1, { message: 'Domain ID is required.' }),
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
}

export function CreateProjectBusinessForm() {
  const user = useSelector((state: RootState) => state.user);
  const [skills, setSkills] = useState<any[]>([]);
  const [currSkills, setCurrSkills] = useState<any[]>([]);
  const [tmpSkill, setTmpSkill] = useState('');
  const [domains, setDomains] = useState<any[]>([]);
  const [projectDomains, setProjectDomains] = useState<any[]>([]);
  const [currProjectDomains, setCurrProjectDomains] = useState<any[]>([]);
  const [tmpProjectDomains, setTmpProjectDomains] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileType, setProfileType] = useState<'Freelancer' | 'Consultant'>(
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

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  });
  const { fields: urlFields, append: appendUrl } = useFieldArray({
    name: 'urls',
    control: form.control,
  });
  const {
    fields: profileFields,
    append: appendProfile,
    remove: removeProfile,
  } = useFieldArray({ name: 'profiles', control: form.control });

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

  // Project domain handlers
  const handleAddProjectDomain = () => {
    if (tmpProjectDomains && !currProjectDomains.includes(tmpProjectDomains)) {
      const updatedDomains = [...currProjectDomains, tmpProjectDomains];
      setCurrProjectDomains(updatedDomains);
      setTmpProjectDomains('');
      form.setValue('projectDomain', updatedDomains);
    }
  };

  const handleDeleteProjectDomain = (domainToDelete: string) => {
    const updatedDomains = currProjectDomains.filter(
      (domain) => domain !== domainToDelete,
    );
    setCurrProjectDomains(updatedDomains);
    form.setValue('projectDomain', updatedDomains);
  };

  // Skills handlers
  const handleAddSkill = (profileIndex: number) => {
    if (tmpSkill.trim() !== '') {
      setCurrSkills((prevSkills) => {
        const updatedSkills = [...prevSkills];
        if (!updatedSkills[profileIndex]) updatedSkills[profileIndex] = [];
        if (!updatedSkills[profileIndex].includes(tmpSkill)) {
          updatedSkills[profileIndex].push(tmpSkill);
        }
        form.setValue(
          `profiles.${profileIndex}.skills`,
          updatedSkills[profileIndex],
        );
        return updatedSkills;
      });
      setTmpSkill('');
    }
  };

  const handleDeleteSkill = (profileIndex: number, skillToDelete: string) => {
    setCurrSkills((prevSkills) => {
      const updatedSkills = [...prevSkills];
      if (updatedSkills[profileIndex]) {
        updatedSkills[profileIndex] = updatedSkills[profileIndex].filter(
          (skill: string) => skill !== skillToDelete,
        );
        form.setValue(
          `profiles.${profileIndex}.skills`,
          updatedSkills[profileIndex],
        );
      }
      return updatedSkills;
    });
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
        new Set(currSkills.flat().filter(Boolean)),
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
        process.env.NEXT_PUBLIC__APP_PROJECT_CREATION_COST || '0',
        10,
      );
      const updatedConnects = (
        parseInt(localStorage.getItem('DHX_CONNECTS') || '0') - connectsCost
      ).toString();
      localStorage.setItem('DHX_CONNECTS', updatedConnects);
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
  }

  // Step navigation
  const nextStep = async () => {
    const isValid = await form.trigger([
      'urls',
      'projectDomain',
      'description',
      'email',
      'projectName',
    ]);
    if (!isValid) return;
    if (currentStep === FormSteps.ProjectInfo)
      setCurrentStep(FormSteps.ProfileInfo);
  };

  const prevStep = () => {
    if (currentStep === FormSteps.ProfileInfo)
      setCurrentStep(FormSteps.ProjectInfo);
  };

  // UI render helpers
  const ProfileTabs = () => (
    <ScrollArea>
      <div
        className={`flex gap-2 mb-2 ${mode === 'multiple' ? 'p-2 rounded-md' : ''}`}
      >
        {mode === 'multiple' &&
          profileFields.map((_, index) => (
            <Button
              key={index}
              type="button"
              size="sm"
              variant={activeProfile === index ? 'default' : 'outline'}
              onClick={() => setActiveProfile(index)}
              className={`px-4 py-2 ${
                activeProfile === index
                  ? 'bg-blue-600 text-white hover:text-black'
                  : ''
              }`}
            >
              Profile {index + 1}
            </Button>
          ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );

  const renderBudgetSection = () => {
    const budgetType = form.watch(`profiles.${activeProfile}.budget.type`);
    return (
      <div className="lg:col-span-2 xl:col-span-2 border p-4 rounded-md mb-4">
        <h3 className="text-lg font-medium mb-4">Project Budget</h3>
        <FormField
          control={form.control}
          name={`profiles.${activeProfile}.budget.type`}
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel>Budget Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex flex-row gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="FIXED" id="fixed" />
                      <label htmlFor="fixed" className="cursor-pointer">
                        Fixed Price
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="HOURLY" id="hourly" />
                      <label htmlFor="hourly" className="cursor-pointer">
                        Hourly Rate
                      </label>
                    </div>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {budgetType === 'FIXED' && (
          <FormField
            control={form.control}
            name={`profiles.${activeProfile}.budget.fixedAmount`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fixed Budget Amount ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter fixed amount"
                    min="1"
                    step="0.01"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter the total fixed price for the project
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {budgetType === 'HOURLY' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name={`profiles.${activeProfile}.budget.hourly.minRate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Rate ($/hour)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Min rate"
                        min="1"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`profiles.${activeProfile}.budget.hourly.maxRate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Rate ($/hour)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Max rate"
                        min="1"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`profiles.${activeProfile}.budget.hourly.estimatedHours`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Estimated number of hours"
                        min="1"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Estimated total hours required for project completion
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}
        {form.formState.errors.profiles &&
          form.formState.errors.profiles[activeProfile]?.budget && (
            <p className="text-sm text-red-600 mt-4">
              {Object.values(
                form.formState.errors.profiles[activeProfile]?.budget || {},
              )
                .map((err: any) => err?.message)
                .filter(Boolean)
                .join(', ')}
            </p>
          )}
      </div>
    );
  };

  const renderProjectInfoStep = () => (
    <>
      <FormField
        control={form.control}
        name="projectName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter your Project Name" {...field} />
            </FormControl>
            <FormDescription>Enter your Project name</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Email</FormLabel>
            <FormControl>
              <Input placeholder="Enter your email" {...field} />
            </FormControl>
            <FormDescription>Enter your email</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="projectDomain"
        render={() => (
          <FormItem className="col-span-2">
            <FormLabel>Project Domain</FormLabel>
            <FormControl>
              <div>
                <div className="flex items-center mt-2">
                  <Select
                    onValueChange={setTmpProjectDomains}
                    value={tmpProjectDomains || ''}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          tmpProjectDomains || 'Select project domain'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {projectDomains
                        .filter(
                          (d: any) => !currProjectDomains.includes(d.label),
                        )
                        .map((d: any, idx: number) => (
                          <SelectItem key={idx} value={d.label}>
                            {d.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    type="button"
                    size="icon"
                    className="ml-2"
                    onClick={handleAddProjectDomain}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap mt-5">
                  {currProjectDomains.map((domain, idx) => (
                    <Badge
                      className="uppercase mx-1 text-xs font-normal bg-gray-400 flex items-center"
                      key={idx}
                    >
                      {domain}
                      <button
                        type="button"
                        onClick={() => handleDeleteProjectDomain(domain)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>Profile Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter description" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
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
        <Button
          className="mt-2"
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendUrl({ value: '' })}
        >
          Add URL
        </Button>
      </div>
    </>
  );

  const renderProfileInfoStep = () => (
    <div className="lg:col-span-2 xl:col-span-2">
      <div className="my-4">
        <ProfileTabs />
      </div>
      {profileFields.map((field, index) => {
        if (mode === 'single' && index > 0) return null;

        return index === activeProfile || mode === 'single' ? (
          <div key={index} className="p-4 mb-4 rounded-md relative">
            {mode === 'multiple' && (
              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  variant={
                    form.watch(`profiles.${index}.profileType`) === 'FREELANCER'
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
                  variant={
                    form.watch(`profiles.${index}.profileType`) === 'CONSULTANT'
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FormField
                control={form.control}
                name={`profiles.${index}.domain`}
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Profile Domain</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          const selectedDomain = domains.find(
                            (d: any) => d.label === value,
                          );
                          form.setValue(
                            `profiles.${index}.domain`,
                            selectedDomain?.label || '',
                          );
                          form.setValue(
                            `profiles.${index}.domain_id`,
                            selectedDomain?.domain_id || '',
                          );
                        }}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {domains.map((domain: any, i: number) => (
                            <SelectItem key={i} value={domain.label}>
                              {domain.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    <FormLabel>{`Number of ${profileType} Required`}</FormLabel>
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
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <div>
                        <div className="flex items-center mt-2">
                          <Select
                            onValueChange={setTmpSkill}
                            value={tmpSkill || ''}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select skill" />
                            </SelectTrigger>
                            <SelectContent>
                              {skills.map((skill: any, i: number) => (
                                <SelectItem key={i} value={skill.label}>
                                  {skill.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            type="button"
                            size="icon"
                            className="ml-2"
                            onClick={() => handleAddSkill(index)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap mt-5">
                          {currSkills[index]?.map((skill: any, i: number) => (
                            <Badge
                              className="uppercase mx-1 text-xs font-normal bg-gray-400 flex items-center"
                              key={i}
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => handleDeleteSkill(index, skill)}
                                className="ml-2 text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
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
                  <FormItem className="mb-4">
                    <FormLabel>Experience</FormLabel>
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
                  <FormItem className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel>Min Connect</FormLabel>
                      <FormDescription>
                        Minimum number of connects for the project
                      </FormDescription>
                    </div>
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
            {renderBudgetSection()}
            {mode === 'multiple' && profileFields.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => removeProfile(index)}
              >
                Remove Profile
              </Button>
            )}
          </div>
        ) : null;
      })}
      {mode === 'multiple' && (
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
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
            Add Profile
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={saveDraft}>
            <Save />
          </Button>
        </div>
      )}
      <div className="lg:col-span-2 xl:col-span-2 mt-4">
        <ConnectsDialog
          form={form}
          loading={loading}
          isValidCheck={form.trigger}
          onSubmit={form.handleSubmit(onSubmit)}
          setLoading={setLoading}
          userId={user.uid}
          buttonText={'Create Project'}
          userType={'BUSINESS'}
          requiredConnects={parseInt(
            process.env.NEXT_PUBLIC__APP_PROJECT_CREATION_COST || '0',
            10,
          )}
        />
      </div>
    </div>
  );

  return (
    <Card className="p-10">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="gap-5 lg:grid lg:grid-cols-2 xl:grid-cols-2"
        >
          {currentStep === FormSteps.ProjectInfo && renderProjectInfoStep()}
          {currentStep === FormSteps.ProfileInfo && renderProfileInfoStep()}
          <div className="w-full mt-4 flex col-span-2 justify-end">
            {currentStep === FormSteps.ProjectInfo && (
              <Button type="button" variant="outline" onClick={nextStep}>
                Next
              </Button>
            )}
          </div>
          <div className="w-full mt-4 flex col-span-2 justify-start">
            {currentStep === FormSteps.ProfileInfo && (
              <Button type="button" variant="outline" onClick={prevStep}>
                Prev
              </Button>
            )}
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
    </Card>
  );
}
