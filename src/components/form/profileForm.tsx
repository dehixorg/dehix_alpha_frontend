import React, { useEffect, useState } from 'react';
import { User, FileText, Tags, Layers, FolderKanban, Upload, Save } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dialog, DialogContent, DialogOverlay } from '@radix-ui/react-dialog';

import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import ProfilePictureUpload from '../fileUpload/profilePicture';
import ResumeUpload from '../fileUpload/resume';

import CoverLetterTextarea from './CoverLetterTextarea';

import { axiosInstance } from '@/lib/axiosinstance';
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
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Type } from '@/utils/enum';
import { StatusEnum } from '@/utils/freelancer/enum';
import { addSkill } from '@/utils/skillUtils';
import { addDomain } from '@/utils/DomainUtils';
import { addProjectDomain } from '@/utils/ProjectDomainUtils';
import SelectTagPicker from '@/components/shared/SelectTagPicker';

const profileFormSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First Name must be at least 2 characters.',
  }),
  lastName: z.string().min(2, {
    message: 'Last Name must be at least 2 characters.',
  }),
  username: z
    .string()
    .min(2, {
      message: 'Username must be at least 2 characters.',
    })
    .max(30, {
      message: 'Username must not be longer than 30 characters.',
    }),
  email: z.string().email(),
  phone: z.string().min(10, {
    message: 'Phone number must be at least 10 digits.',
  }),
  role: z.string(),
  personalWebsite: z.string().url().optional(),
  coverLetter: z
    .string()
    .optional()
    .refine(
      (val) => {
        // If no value provided, it's valid (optional field)
        if (!val || val.trim() === '') return true;

        // If value is provided, check minimum word requirements
        const wordCount = val
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length;
        return wordCount >= 500;
      },
      {
        message: 'Cover letter must contain at least 500 words when provided.',
      },
    ),
  description: z.string().max(500, {
    message: 'Description cannot exceed 500 characters.',
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm({ user_id }: { user_id: string }) {
  const [user, setUser] = useState<any>({});
  const [skills, setSkills] = useState<any>([]);
  const [currSkills, setCurrSkills] = useState<any>([]);
  const [domains, setDomains] = useState<any>([]);
  const [currDomains, setCurrDomains] = useState<any>([]);
  const [projectDomains, setProjectDomains] = useState<any>([]);
  const [currProjectDomains, setCurrProjectDomains] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [, setResumeRefreshTrigger] = useState(0);
  const [, setLastAddedItems] = useState<{
    skills: { name: string }[];
    projectsDomains: { name: string }[];
    domains: { name: string }[];
  }>({
    skills: [],
    projectsDomains: [],
    domains: [],
  });
  const [customSkill, setCustomSkill] = useState({
    label: '',
    description: '',
  });
  const [customDomain, setCustomDomain] = useState({
    label: '',
    description: '',
  });
  const [customProjectDomain, setCustomProjectDomain] = useState({
    label: '',
    description: '',
  });
  const [dialogType] = useState<'skill' | 'domain' | 'projectDomain' | null>(
    null,
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phone: '',
      role: '',
      personalWebsite: '',
      coverLetter: '',
      description: '',
    },
    mode: 'all',
  });

  const handleAddCustomSkill = async () => {
    if (!customSkill.label.trim()) {
      console.warn('Field is required.');
      return;
    }
    const customSkillData = {
      label: customSkill.label,
      interviewInfo: customSkill.description,
      createdBy: Type.FREELANCER,
      createdById: user_id,
      status: StatusEnum.ACTIVE,
    };

    try {
      await axiosInstance.post('/skills', customSkillData);

      const updatedSkills = [...skills, { label: customSkill.label }];
      setDomains(updatedSkills);

      setCurrSkills([
        ...currSkills,
        {
          name: customSkill.label,
          level: '',
          experience: '',
          interviewStatus: 'PENDING',
          interviewInfo: customSkill.description,
          interviewerRating: 0,
        },
      ]);

      setCustomSkill({ label: '', description: '' });
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error(
        'Failed to add skill:',
        error.response?.data || error.message,
      );
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add skill. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomDomain = async () => {
    if (!customDomain.label.trim()) {
      console.warn('Field is required.');
      return;
    }
    const customDomainData = {
      label: customDomain.label,
      interviewInfo: customSkill.description,
      createdBy: Type.FREELANCER,
      createdById: user_id,
      status: StatusEnum.ACTIVE,
    };

    try {
      await axiosInstance.post('/domain', customDomainData);

      const updatedDomains = [...domains, { label: customDomain.label }];
      setDomains(updatedDomains);

      setCurrDomains([
        ...currDomains,
        {
          name: customDomain.label,
          level: '',
          experience: '',
          interviewStatus: 'PENDING',
          interviewInfo: customDomain.description,
          interviewerRating: 0,
        },
      ]);

      setCustomDomain({ label: '', description: '' });
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error(
        'Failed to add domain:',
        error.response?.data || error.message,
      );
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add domain. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomProjectDomain = async () => {
    if (!customProjectDomain.label.trim()) {
      console.warn('Field is required.');
      return;
    }
    const customProjectDomainData = {
      label: customProjectDomain.label,
      createdBy: Type.FREELANCER,
      createdById: user_id,
      status: StatusEnum.ACTIVE,
    };

    try {
      await axiosInstance.post('/projectdomain', customProjectDomainData);

      const updatedProjectDomains = [
        ...projectDomains,
        { label: customProjectDomain.label },
      ];
      setProjectDomains(updatedProjectDomains);

      setCurrProjectDomains([
        ...currProjectDomains,
        {
          name: customProjectDomain.label,
          level: '',
          experience: '',
          interviewStatus: 'PENDING',
          interviewInfo: customProjectDomain.description,
          interviewerRating: 0,
        },
      ]);

      setCustomProjectDomain({ label: '', description: '' });
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error(
        'Failed to add project domain:',
        error.response?.data || error.message,
      );
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add project domain. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // New: add-by-value helpers for reusable component
  const handleAddSkillByValue = (value: string) => {
    addSkill(value, skills, setSkills);
    if (value && !currSkills.some((skill: any) => skill.name === value)) {
      setCurrSkills([
        ...currSkills,
        {
          name: value,
          level: '',
          experience: '',
          interviewStatus: StatusEnum.PENDING,
          interviewInfo: '',
          interviewerRating: 0,
        },
      ]);
      setLastAddedItems((prev) => ({
        ...prev,
        skills: [...prev.skills, { name: value }],
      }));
    }
  };

  const handleAddDomainByValue = (value: string) => {
    addDomain(value, domains, setDomains);
    if (value && !currDomains.some((domain: any) => domain.name === value)) {
      setCurrDomains([
        ...currDomains,
        {
          name: value,
          level: '',
          experience: '',
          interviewStatus: StatusEnum.PENDING,
          interviewInfo: '',
          interviewerRating: 0,
        },
      ]);
      setLastAddedItems((prev) => ({
        ...prev,
        domains: [...prev.domains, { name: value }],
      }));
    }
  };

  const handleAddProjectDomainByValue = (value: string) => {
    addProjectDomain(value, projectDomains, setProjectDomains);
    if (
      value &&
      !currProjectDomains.some(
        (projectDomain: any) => projectDomain.name === value,
      )
    ) {
      setCurrProjectDomains([
        ...currProjectDomains,
        {
          name: value,
          level: '',
          experience: '',
          interviewStatus: StatusEnum.PENDING,
          interviewInfo: '',
          interviewerRating: 0,
        },
      ]);
      setLastAddedItems((prev) => ({
        ...prev,
        projectsDomains: [...prev.projectsDomains, { name: value }],
      }));
    }
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    setCurrSkills(
      currSkills.filter((skill: any) => skill.name !== skillToDelete),
    );
  };

  const handleDeleteDomain = (domainToDelete: string) => {
    setCurrDomains(
      currDomains.filter((domain: any) => domain.name !== domainToDelete),
    );
  };
  const handleDeleteProjDomain = (projectDomainToDelete: string) => {
    setCurrProjectDomains(
      currProjectDomains.filter(
        (projectDomain: any) => projectDomain.name !== projectDomainToDelete,
      ),
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axiosInstance.get(`/freelancer/${user_id}`);
        setUser(userResponse.data.data);

        const skillsResponse = await axiosInstance.get('/skills');
        const domainsResponse = await axiosInstance.get('/domain');
        const projectDomainResponse = await axiosInstance.get('/projectdomain');

        // Set options for dropdowns
        setSkills(skillsResponse.data.data);
        setDomains(domainsResponse.data.data);
        setProjectDomains(projectDomainResponse.data.data);

        setCurrSkills(userResponse.data.data.skills);
        setCurrDomains(userResponse.data.data.domain);
        setCurrProjectDomains(userResponse.data.data.projectDomain);

        // Ensure cover letter is treated as text, not URL
        const coverLetterValue = userResponse.data.data.coverLetter;
        const cleanCoverLetter =
          coverLetterValue &&
          typeof coverLetterValue === 'string' &&
          !coverLetterValue.startsWith('http')
            ? coverLetterValue
            : '';

        form.reset({
          firstName: userResponse.data.data.firstName || '',
          lastName: userResponse.data.data.lastName || '',
          username: userResponse.data.data.userName || '',
          email: userResponse.data.data.email || '',
          phone: userResponse.data.data.phone || '',
          role: userResponse.data.data.role || '',
          personalWebsite: userResponse.data.data.personalWebsite || '',
          coverLetter: cleanCoverLetter,
          description: userResponse.data.data.description || '',
        });
      } catch (error) {
        console.error('API Error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong.Please try again.',
        });
      }
    };

    fetchData();
  }, [user_id, form]);

  useEffect(() => {
    form.reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.userName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || '',
      personalWebsite: user?.personalWebsite || '',
      coverLetter: user?.coverLetter || '',
      description: user?.description || '',
    });
  }, [user, form]);

  async function onSubmit(data: ProfileFormValues) {
    setLoading(true);
    try {
      const { ...restData } = data;

      const updatedSkills = currSkills.map((skill: any) => ({
        ...skill,
        interviewInfo: skill.interviewInfo || '',
        interviewerRating: skill.interviewerRating || 0,
        interviewStatus: skill.interviewStatus || 'PENDING',
      }));

      await axiosInstance.put(`/freelancer`, {
        ...restData,
        coverLetter: data.coverLetter,
        skills: updatedSkills,
        domain: currDomains,
        projectDomain: currProjectDomains,
        description: data.description,
      });

      setUser({
        ...user,
        firstName: data.firstName,
        lastName: data.lastName,
        userName: data.username,
        email: data.email,
        phone: data.phone,
        role: data.role,
        personalWebsite: data.personalWebsite,
        coverLetter: data.coverLetter,
        description: data.description,
        skills: updatedSkills,
        domain: currDomains,
        projectDomains: currProjectDomains,
      });
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });

      // Trigger resume component refresh with a small delay to ensure backend processing
      setTimeout(() => {
        setResumeRefreshTrigger((prev) => prev + 1);
      }, 500);
    } catch (error) {
      console.error('API Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 bg-muted-foreground/20 dark:bg-muted/20">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
          <User className="h-5 w-5" /> Personal Information
        </h1>
        <p className="text-sm text-muted-foreground">
          Keep your profile up to date. Your details help businesses find you faster.
        </p>
      </div>
      <Form {...form}>
        <ProfilePictureUpload
          profile={user.profilePic}
          entityType={Type.FREELANCER}
        />
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {/* Basic Info */}
            <div className="md:col-span-2 -mb-2">
              <h3 className="text-xs font-semibold mb-1 uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" /> Basic Details
              </h3>
            </div>
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your username"
                      {...field}
                      readOnly
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>Non editable field</FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} readOnly />
                  </FormControl>
                  <FormDescription>Non editable field</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="flex items-center gap-2">
                    About You
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+91" {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>Non editable field</FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="personalWebsite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Website URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your LinkedIn URL"
                      type="url"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your Personal Website URL
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator className="my-6" />
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Tags className="h-4 w-4" /> Skills & Domains
            </h3>
            <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3">
              <div className="col-span-1">
                <SelectTagPicker
                  label="Skills"
                  options={skills}
                  selected={currSkills}
                  onAdd={handleAddSkillByValue}
                  onRemove={handleDeleteSkill}
                  selectPlaceholder="Select skill"
                  searchPlaceholder="Search skills"
                />
              </div>
              <div className="col-span-1">
                <SelectTagPicker
                  label="Domains"
                  options={domains}
                  selected={currDomains}
                  onAdd={handleAddDomainByValue}
                  onRemove={handleDeleteDomain}
                  selectPlaceholder="Select domain"
                  searchPlaceholder="Search domains"
                />
              </div>
              <div className="col-span-1">
                <SelectTagPicker
                  label="Project Domains"
                  options={projectDomains}
                  selected={currProjectDomains}
                  onAdd={handleAddProjectDomainByValue}
                  onRemove={handleDeleteProjDomain}
                  selectPlaceholder="Select project domain"
                  searchPlaceholder="Search project domains"
                />
              </div>
            </div>
          </div>
          <Separator className="col-span-1 md:col-span-2 my-6" />
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Upload className="h-4 w-4" /> Resume & Cover Letter
            </h3>
            <div className="grid gap-6 md:gap-10 grid-cols-1 md:grid-cols-2">
              <div className="flex flex-col items-start">
                <FormLabel className="ml-2">Upload Resume</FormLabel>
                <div className="w-full">
                  <ResumeUpload
                    onResumeUpdate={() =>
                      setResumeRefreshTrigger((prev) => prev + 1)
                    }
                    userId={user_id}
                  />
                </div>
              </div>
              <FormField
                control={form.control}
                name="coverLetter"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col items-start">
                    <FormLabel className="ml-2">
                      Cover Letter (Optional)
                    </FormLabel>
                    <div className="w-full">
                      <CoverLetterTextarea
                        value={field.value || ''}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                      />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="col-span-1 md:col-span-2 mt-6">
            <Button type="submit" className="w-full" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {isDialogOpen && (
            <Dialog
              open={isDialogOpen}
              onOpenChange={(isOpen) => setIsDialogOpen(isOpen)}
            >
              <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" />
              <DialogContent className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-black rounded-md shadow-xl p-6 w-[90%] max-w-md">
                  {dialogType === 'skill' && (
                    <>
                      <h2 className="text-lg font-semibold text-white mb-4">
                        Add New Skill
                      </h2>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAddCustomSkill(); // Add custom skill logic
                        }}
                      >
                        <div className="mb-4">
                          <label
                            htmlFor="skillLabel"
                            className="block text-sm font-medium text-white mb-1"
                          >
                            Skill Label
                          </label>
                          <input
                            type="text"
                            value={customSkill.label}
                            onChange={(e) =>
                              setCustomSkill({
                                ...customSkill,
                                label: e.target.value,
                              })
                            }
                            placeholder="Enter skill label"
                            className="w-full px-3 py-2 rounded-md text-white bg-black placeholder-gray-400 border border-white"
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-3">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsDialogOpen(false)}
                            className="mt-3"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            className="mt-3"
                            onClick={() => {
                              handleAddCustomSkill();
                              setCustomSkill({ label: '', description: '' });
                            }}
                          >
                            Add Skill
                          </Button>
                        </div>
                      </form>
                    </>
                  )}
                  {dialogType === 'domain' && (
                    <>
                      <h2 className="text-lg font-semibold text-white mb-4">
                        Add New Domain
                      </h2>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAddCustomDomain(); // Add custom domain logic
                        }}
                      >
                        <div className="mb-4">
                          <label
                            htmlFor="domainLabel"
                            className="block text-sm font-medium text-white mb-1"
                          >
                            Domain Label
                          </label>
                          <input
                            type="text"
                            value={customDomain.label}
                            onChange={(e) =>
                              setCustomDomain({
                                ...customDomain,
                                label: e.target.value,
                              })
                            }
                            placeholder="Enter Domain label"
                            className="w-full px-3 py-2 rounded-md text-white bg-black placeholder-gray-400 border border-white"
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-3">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsDialogOpen(false)}
                            className="mt-3"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            className="mt-3"
                            onClick={() => {
                              handleAddCustomDomain();
                              setCustomDomain({ label: '', description: '' });
                            }}
                          >
                            Add Domain
                          </Button>
                        </div>
                      </form>
                    </>
                  )}
                  {dialogType === 'projectDomain' && (
                    <>
                      <h2 className="text-lg font-semibold text-white mb-4">
                        Add New Project Domain
                      </h2>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAddCustomProjectDomain(); // Add custom project domain logic
                        }}
                      >
                        <div className="mb-4">
                          <label
                            htmlFor="projectDomainLabel"
                            className="block text-sm font-medium text-white mb-1"
                          >
                            Project Domain Label
                          </label>
                          <input
                            type="text"
                            value={customProjectDomain.label}
                            onChange={(e) =>
                              setCustomProjectDomain({
                                ...customProjectDomain,
                                label: e.target.value,
                              })
                            }
                            placeholder="Enter Project Domain label"
                            className="w-full px-3 py-2 rounded-md text-white bg-black placeholder-gray-400 border border-white"
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-3">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsDialogOpen(false)}
                            className="mt-3"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            className="mt-3"
                            onClick={() => {
                              handleAddCustomProjectDomain();
                              setCustomProjectDomain({
                                label: '',
                                description: '',
                              });
                            }}
                          >
                            Add Project Domain
                          </Button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </form>
      </Form>
    </Card>
  );
}
