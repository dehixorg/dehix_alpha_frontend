import React, { useEffect, useState } from 'react';
import {
  User,
  Tags,
  Upload,
  Save,
  Mail,
  Phone,
  Globe,
  AtSign,
} from 'lucide-react';
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
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Separator } from '@/components/ui/separator';
import { Type } from '@/utils/enum';
import { InterviewPermission, StatusEnum } from '@/utils/freelancer/enum';
import { addSkill } from '@/utils/skillUtils';
import { addDomain } from '@/utils/DomainUtils';
import { addProjectDomain } from '@/utils/ProjectDomainUtils';
import SelectTagPicker from '@/components/shared/SelectTagPicker';
import { notifyError, notifySuccess } from '@/utils/toastMessage';

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
        if (!val || val.trim() === '') return true;
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
  const [dialogType, setDialogType] = useState<
    'skill' | 'domain' | 'projectDomain' | null
  >(null);

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

    // Check if skill already exists
    if (currSkills.some((skill: any) => skill.name === customSkill.label)) {
      notifySuccess('Skill already present!');
      return;
    }
    const customSkillData = {
      label: customSkill.label,
      description: customSkill.description,
      status: 'INACTIVE',
      createdBy: Type.FREELANCER,
      createdById: user_id,
    };

    try {
      // Create the new skill in master table
      await axiosInstance.post('/skills', customSkillData);

      setCustomSkill({ label: '', description: '' });
      setIsDialogOpen(false);
      notifySuccess(
        'Submitted for admin approval. It will appear in your profile after verification.',
      );
    } catch (error: any) {
      console.error(
        'Failed to add skill:',
        error.response?.data || error.message,
      );

      // Check for specific conflict error
      if (error.response?.data?.code === 'CONFLICT_ERROR') {
        notifySuccess('Skill already present!');
      } else {
        notifyError('Failed to add skill. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomDomain = async () => {
    if (!customDomain.label.trim()) {
      console.warn('Field is required.');
      return;
    }

    // Check if domain already exists
    if (currDomains.some((domain: any) => domain.name === customDomain.label)) {
      notifySuccess('Domain already present!');
      return;
    }
    const customDomainData = {
      label: customDomain.label,
      description: customDomain.description,
      status: 'INACTIVE',
      createdBy: Type.FREELANCER,
      createdById: user_id,
    };

    try {
      await axiosInstance.post('/domain', customDomainData);

      setCustomDomain({ label: '', description: '' });
      setIsDialogOpen(false);
      notifySuccess(
        'Submitted for admin approval. It will appear in your profile after verification.',
      );
    } catch (error: any) {
      console.error(
        'Failed to add domain:',
        error.response?.data || error.message,
      );

      // Check for specific conflict error
      if (error.response?.data?.code === 'CONFLICT_ERROR') {
        notifySuccess('Domain already present!');
      } else {
        notifyError('Failed to add domain. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomProjectDomain = async () => {
    if (!customProjectDomain.label.trim()) {
      console.warn('Field is required.');
      return;
    }

    // Check if project domain already exists
    if (
      currProjectDomains.some(
        (projectDomain: any) =>
          projectDomain.name === customProjectDomain.label,
      )
    ) {
      notifySuccess('Project domain already present!');
      return;
    }
    const customProjectDomainData = {
      name: customProjectDomain.label,
      type: 'PROJECT_DOMAIN',
      level: '',
      experience: '',
      interviewStatus: 'PENDING',
      interviewInfo: customProjectDomain.description,
      interviewerRating: 0,
    };

    try {
      const savedProjectDomainProfile = await saveProjectDomainsToProfile([
        customProjectDomainData,
      ]);

      setCustomProjectDomain({ label: '', description: '' });
      setIsDialogOpen(false);
      notifySuccess(
        'Submitted for admin approval. It will appear in your profile after verification.',
      );
    } catch (error: any) {
      console.error(
        'Failed to add project domain:',
        error.response?.data || error.message,
      );

      // Check for specific conflict error
      if (error.response?.data?.code === 'CONFLICT_ERROR') {
        notifySuccess('Project domain already present!');
      } else {
        notifyError('Failed to add project domain. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to save skills to backend
  const saveSkillsToProfile = async (skillsToSave: any[]) => {
    // ADD THIS MAPPING LOGIC
    const completeSkillsArray = skillsToSave.map((skill: any) => ({
      ...skill,
      level: skill.level || '',
      experience: skill.experience || '',
      interviewInfo: skill.interviewInfo || '',
      interviewerRating: skill.interviewerRating || 0,
      interviewStatus: skill.interviewStatus || StatusEnum.PENDING,
      interviewPermission:
        skill.interviewPermission ?? InterviewPermission.NOT_VERIFIED,
    }));
    // END OF NEW LOGIC

    try {
      // Send the 'completeSkillsArray' instead of 'skillsToSave'
      const response = await axiosInstance.put('/freelancer/skill', {
        skills: completeSkillsArray,
      });

      if (response.status === 200) {
        notifySuccess('Skills added successfully to your profile.');
        return response.data.data;
      }
    } catch (error: any) {
      console.error(
        'Failed to add skills to profile:',
        error.response?.data || error.message,
      );
      notifyError('Failed to add skills to profile. Please try again.');
      throw error;
    }
  };

  // Function to save domains to backend
  const saveDomainsToProfile = async (domainsToSave: any[]) => {
    const completeDomainsArray = domainsToSave.map((domain: any) => ({
      ...domain,
      level: domain.level || '',
      experience: domain.experience || '',
      interviewInfo: domain.interviewInfo || '',
      interviewerRating: domain.interviewerRating || 0,
      interviewStatus: domain.interviewStatus || StatusEnum.PENDING,
    }));

    try {
      const response = await axiosInstance.put('/freelancer/domain', {
        domain: completeDomainsArray,
      });

      if (response.status === 200) {
        notifySuccess('Domains added successfully to your profile.');
        return response.data.data;
      }
    } catch (error: any) {
      console.error(
        'Failed to add domains to profile:',
        error.response?.data || error.message,
      );
      notifyError('Failed to add domains to profile. Please try again.');
      throw error;
    }
  };

  // Function to save project domains to backend
  const saveProjectDomainsToProfile = async (projectDomainsToSave: any[]) => {
    const completeProjectDomainsArray = projectDomainsToSave.map(
      (projectDomain: any) => ({
        ...projectDomain,
        level: projectDomain.level || '',
        experience: projectDomain.experience || '',
        interviewInfo: projectDomain.interviewInfo || '',
        interviewerRating: projectDomain.interviewerRating || 0,
        interviewStatus: projectDomain.interviewStatus || StatusEnum.PENDING,
      }),
    );

    try {
      const response = await axiosInstance.put('/freelancer/project-domain', {
        projectDomain: completeProjectDomainsArray,
      });

      if (response.status === 200) {
        notifySuccess('Project domains added successfully to your profile.');
        return response.data.data;
      }
    } catch (error: any) {
      console.error(
        'Failed to add project domains to profile:',
        error.response?.data || error.message,
      );
      notifyError(
        'Failed to add project domains to profile. Please try again.',
      );
      throw error;
    }
  };

  // New: add-by-value helpers for reusable component
  const handleAddSkillByValue = async (value: string) => {
    addSkill(value, skills, setSkills);
    if (value && !currSkills.some((skill: any) => skill.name === value)) {
      const matchedSkill = skills.find(
        (s: any) => s.name === value || s.label === value,
      );
      const newSkill = {
        _id: matchedSkill?._id || `temp_${Date.now()}`,
        type_id: matchedSkill?._id || '',
        name: value,
        level: '',
        experience: '',
        interviewStatus: StatusEnum.PENDING,
        interviewInfo: '',
        interviewerRating: 0,
        interviewPermission: InterviewPermission.NOT_VERIFIED,
      };

      try {
        const savedProfile = await saveSkillsToProfile([newSkill]);
        if (savedProfile && savedProfile.skills) {
          const skillWithIds = savedProfile.skills;
          setCurrSkills((prev: any) => [...prev, ...skillWithIds]);
        }
      } catch (error) {
        setCurrSkills(currSkills);
      }
    }
  };

  const handleAddDomainByValue = async (value: string) => {
    addDomain(value, domains, setDomains);
    if (value && !currDomains.some((domain: any) => domain.name === value)) {
      const matchedDomain = domains.find(
        (d: any) => d.name === value || d.label === value,
      );
      const newDomain = {
        type_id: matchedDomain?._id || '',
        _id: '',
        name: value,
        level: '',
        experience: '',
        interviewStatus: StatusEnum.PENDING,
        interviewInfo: '',
        interviewerRating: 0,
      };

      // Save to backend
      try {
        const savedProfile = await saveDomainsToProfile([newDomain]);
        // Update state with the domains that include IDs from backend
        if (savedProfile && savedProfile.domain) {
          const domainWithIds = savedProfile.domain;
          setCurrDomains((prev: any) => [...prev, ...domainWithIds]);
        }
      } catch (error) {
        // Revert local state if API call fails
        setCurrDomains(currDomains);
      }
    }
  };

  const handleAddProjectDomainByValue = async (value: string) => {
    addProjectDomain(value, projectDomains, setProjectDomains);
    if (
      value &&
      !currProjectDomains.some(
        (projectDomain: any) => projectDomain.name === value,
      )
    ) {
      const newProjectDomain = {
        name: value,
        level: '',
        experience: '',
        interviewStatus: StatusEnum.PENDING,
        interviewInfo: '',
        interviewerRating: 0,
      };

      // Update local state immediately
      const updatedProjectDomains = [...currProjectDomains, newProjectDomain];
      setCurrProjectDomains(updatedProjectDomains);
      setLastAddedItems((prev) => ({
        ...prev,
        projectsDomains: [...prev.projectsDomains, { name: value }],
      }));

      // Save to backend
      try {
        const savedProfile = await saveProjectDomainsToProfile([
          newProjectDomain,
        ]);
        // Update state with the project domain that includes the ID from backend
        if (savedProfile && savedProfile.projectDomain) {
          const projectDomainWithId = savedProfile.projectDomain.find(
            (pd: any) => pd.name === value,
          );
          if (projectDomainWithId) {
            setCurrProjectDomains((prev: any) =>
              prev.map((pd: any) =>
                pd.name === value ? projectDomainWithId : pd,
              ),
            );
          }
        }
      } catch (error) {
        // Revert local state if API call fails
        setCurrProjectDomains(currProjectDomains);
        setLastAddedItems((prev) => ({
          ...prev,
          projectsDomains: prev.projectsDomains.filter(
            (pd) => pd.name !== value,
          ),
        }));
      }
    }
  };

  const handleDeleteSkill = async (skillToDeleteName: string) => {
    // 1. Find the full skill object from the state to get its ID
    const skillObject = currSkills.find(
      (skill: any) => skill.name === skillToDeleteName,
    );

    if (!skillObject) {
      console.error('Skill not found in local state. Cannot delete.');
      notifyError('Error: Skill not found.');
      return;
    }

    // 2. Get the ID (Change '_id' to 'id' if that's what your DB uses)
    const skillId = skillObject._id;

    if (!skillId) {
      console.error('Skill has no ID. Cannot delete.');
      notifyError('Error: Skill has no ID.');
      return;
    }

    // 3. Save original state for revert
    const originalSkills = [...currSkills];

    // 4. Update local state optimistically
    const updatedSkillsList = currSkills.filter(
      (skill: any) => skill.name !== skillToDeleteName,
    );
    setCurrSkills(updatedSkillsList);

    // 5. Call the new DELETE endpoint
    try {
      await axiosInstance.delete(`/freelancer/skill/${skillId}`);
      notifySuccess('Skill removed successfully.');
    } catch (error: any) {
      console.error(
        'Failed to remove skill:',
        error.response?.data || error.message,
      );
      notifyError('Failed to remove skill. Please try again.');
      // 6. Revert local state on failure
      setCurrSkills(originalSkills);
    }
  };

  const handleDeleteDomain = async (domainToDelete: string) => {
    const domainObject = currDomains.find(
      (domain: any) => domain.name === domainToDelete,
    );

    if (!domainObject) {
      console.error('Domain not found in local state. Cannot delete.');
      notifyError('Error: Domain not found.');
      return;
    }

    const domainId = domainObject._id;

    if (!domainId) {
      console.error('Domain has no ID. Cannot delete.');
      notifyError('Error: Domain has no ID.');
      return;
    }

    const originalDomains = [...currDomains];

    const updatedDomainsList = currDomains.filter(
      (domain: any) => domain.name !== domainToDelete,
    );
    setCurrDomains(updatedDomainsList);

    try {
      await axiosInstance.delete(`/freelancer/domain/${domainId}`);
      notifySuccess('Domain removed successfully.');
    } catch (error: any) {
      console.error(
        'Failed to remove domain:',
        error.response?.data || error.message,
      );
      notifyError('Failed to remove domain. Please try again.');
      setCurrDomains(originalDomains);
    }
  };
  const handleDeleteProjDomain = async (projectDomainToDelete: string) => {
    const projectDomainObject = currProjectDomains.find(
      (projectDomain: any) => projectDomain.name === projectDomainToDelete,
    );

    if (!projectDomainObject) {
      console.error('Project Domain not found in local state. Cannot delete.');
      notifyError('Error: Project Domain not found.');
      return;
    }

    const projectDomainId = projectDomainObject._id;

    if (!projectDomainId) {
      console.error('Project Domain has no ID. Cannot delete.');
      notifyError('Error: Project Domain has no ID.');
      return;
    }

    const originalProjectDomains = [...currProjectDomains];

    const updatedProjectDomainsList = currProjectDomains.filter(
      (projectDomain: any) => projectDomain.name !== projectDomainToDelete,
    );
    setCurrProjectDomains(updatedProjectDomainsList);

    try {
      await axiosInstance.delete(
        `/freelancer/project-domain/${projectDomainId}`,
      );
      notifySuccess('Project Domain removed successfully.');
    } catch (error: any) {
      console.error(
        'Failed to remove project domain:',
        error.response?.data || error.message,
      );
      notifyError('Failed to remove project domain. Please try again.');
      setCurrProjectDomains(originalProjectDomains);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axiosInstance.get(`/freelancer/${user_id}`);
        setUser(userResponse.data.data);

        const skillsResponse = await axiosInstance.get('/skills/all');
        const domainsResponse = await axiosInstance.get('/domain/all');
        const projectDomainResponse =
          await axiosInstance.get('/projectdomain/all');

        const tmpSkills: any[] = [],
          tmpDomains: any[] = [];
        userResponse.data.data.attributes.forEach((attr: any) => {
          if (attr.type === 'SKILL') {
            tmpSkills.push(attr);
          } else if (attr.type === 'DOMAIN') {
            tmpDomains.push(attr);
          }
        });
        setSkills(skillsResponse.data.data);
        setDomains(domainsResponse.data.data);
        setProjectDomains(projectDomainResponse.data.data);

        setCurrSkills(tmpSkills);
        const transformedDomains = tmpDomains.map((domain: any) => {
          const matchingDomain = domainsResponse.data.data.find(
            (d: any) => d._id === domain.type_id || d.label === domain.name,
          );
          return {
            ...domain,
            type_id: matchingDomain?._id ?? domain.type_id ?? domain.name,
            name: matchingDomain?.label ?? domain.name,
          };
        });
        setCurrDomains(transformedDomains);
        const transformedProjectDomains = (
          userResponse.data.data.projectDomain || []
        )
          .map((pd: any) => {
            const matchingProjectDomain = projectDomainResponse.data.data.find(
              (p: any) => p._id === pd.type_id || p.label === pd.name,
            );
            return {
              ...pd,
              name: matchingProjectDomain?.label ?? pd.name,
            };
          })
          // Remove duplicates by keeping only unique items
          .filter(
            (pd: any, index: number, self: any[]) =>
              self.findIndex((item: any) => item.name === pd.name) === index,
          );
        setCurrProjectDomains(transformedProjectDomains);
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
      } catch (error: any) {
        console.error('API Error:', error);
        notifyError('Something went wrong. Please try again.');
      }
    };

    fetchData();
    return () => {};
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
        interviewPermission:
          skill.interviewPermission ?? InterviewPermission.NOT_VERIFIED,
      }));

      await axiosInstance.put(`/freelancer`, {
        ...restData,
        coverLetter: data.coverLetter,
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
        projectDomain: currProjectDomains,
      });
      notifySuccess(
        'Your profile has been successfully updated.',
        'Profile Updated',
      );

      // Trigger resume component refresh with a small delay to ensure backend processing
      setTimeout(() => {
        setResumeRefreshTrigger((prev) => prev + 1);
      }, 500);
    } catch (error) {
      console.error('API Error:', error);
      notifyError('Failed to update profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
          <User className="h-5 w-5" /> Personal Information
        </h1>
        <p className="text-sm text-muted-foreground">
          Keep your profile up to date. Your details help businesses find you
          faster.
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
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupText>
                        <User className="h-4 w-4" />
                      </InputGroupText>
                      <InputGroupInput
                        placeholder="Enter your first name"
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
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupText>
                        <User className="h-4 w-4" />
                      </InputGroupText>
                      <InputGroupInput
                        placeholder="Enter your last name"
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
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupText>
                        <AtSign className="h-4 w-4" />
                      </InputGroupText>
                      <InputGroupInput
                        placeholder="Enter your username"
                        {...field}
                        readOnly
                      />
                    </InputGroup>
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
                    <InputGroup>
                      <InputGroupText>
                        <Mail className="h-4 w-4" />
                      </InputGroupText>
                      <InputGroupInput
                        placeholder="Enter your email"
                        {...field}
                        readOnly
                      />
                    </InputGroup>
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
                    <InputGroup>
                      <InputGroupText>
                        <Phone className="h-4 w-4" />
                      </InputGroupText>
                      <InputGroupInput placeholder="+91" {...field} readOnly />
                    </InputGroup>
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
                    <InputGroup>
                      <InputGroupText>
                        <Globe className="h-4 w-4" />
                      </InputGroupText>
                      <InputGroupInput
                        placeholder="Enter your Personal Website URL"
                        type="url"
                        {...field}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormDescription>
                    Enter your Personal Website URL
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator className="my-6 bg-muted-foreground/20" />
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
                  hideRemoveButton={true}
                  selectPlaceholder="Select skill"
                  searchPlaceholder="Search skills"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDialogType('skill');
                    setIsDialogOpen(true);
                  }}
                  className="mt-2 text-xs"
                >
                  + Not able to find your skill?
                </Button>
              </div>
              <div className="col-span-1">
                <SelectTagPicker
                  label="Domains"
                  options={domains}
                  selected={currDomains}
                  onAdd={handleAddDomainByValue}
                  onRemove={handleDeleteDomain}
                  optionLabelKey="label"
                  hideRemoveButton={true}
                  selectPlaceholder="Select domain"
                  searchPlaceholder="Search domains"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDialogType('domain');
                    setIsDialogOpen(true);
                  }}
                  className="mt-2 text-xs"
                >
                  + Not able to find your domain?
                </Button>
              </div>
              <div className="col-span-1">
                <SelectTagPicker
                  label="Project Domains"
                  options={projectDomains}
                  selected={currProjectDomains}
                  onAdd={handleAddProjectDomainByValue}
                  onRemove={handleDeleteProjDomain}
                  optionLabelKey="label"
                  hideRemoveButton={true}
                  selectPlaceholder="Select project domain"
                  searchPlaceholder="Search project domains"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDialogType('projectDomain');
                    setIsDialogOpen(true);
                  }}
                  className="mt-2 text-xs"
                >
                  + Not able to find your project domain?
                </Button>
              </div>
            </div>
          </div>
          <Separator className="col-span-1 md:col-span-2 my-6 bg-muted-foreground/20" />
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Upload className="h-4 w-4" /> Resume & Cover Letter
            </h3>
            <div className="grid gap-6 md:gap-10 grid-cols-1 md:grid-cols-2">
              <div className="flex flex-col items-start">
                <FormLabel className="ml-2 mb-2">Upload Resume</FormLabel>
                <div className="w-full">
                  <ResumeUpload
                    maxResumeSize={5 * 1024 * 1024}
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
                          handleAddCustomSkill();
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
                            className="w-full px-3 py-2 rounded-md text-white bg-black placeholder-gray-400 border border-white  focus:outline-none"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label
                            htmlFor="skillDescription"
                            className="block text-sm font-medium text-white mb-1"
                          >
                            Description
                          </label>
                          <textarea
                            id="skillDescription"
                            value={customSkill.description}
                            onChange={(e) =>
                              setCustomSkill({
                                ...customSkill,
                                description: e.target.value,
                              })
                            }
                            placeholder="Enter skill description"
                            className="w-full px-3 py-2 rounded-md text-white bg-black placeholder-gray-400 border border-white min-h-[80px]"
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-3">
                          <Button
                            type="button"
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
                          handleAddCustomDomain();
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
                            className="w-full px-3 py-2 rounded-md text-white bg-black placeholder-gray-400 border border-white  focus:outline-none"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label
                            htmlFor="domainDescription"
                            className="block text-sm font-medium text-white mb-1"
                          >
                            Description
                          </label>
                          <textarea
                            id="domainDescription"
                            value={customDomain.description}
                            onChange={(e) =>
                              setCustomDomain({
                                ...customDomain,
                                description: e.target.value,
                              })
                            }
                            placeholder="Enter domain description"
                            className="w-full px-3 py-2 rounded-md text-white bg-black placeholder-gray-400 border border-white min-h-[80px]"
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-3">
                          <Button
                            type="button"
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
                          handleAddCustomProjectDomain();
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
                            className="w-full px-3 py-2 rounded-md text-white bg-black placeholder-gray-400 border border-white  focus:outline-none"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label
                            htmlFor="projectDomainDescription"
                            className="block text-sm font-medium text-white mb-1"
                          >
                            Description
                          </label>
                          <textarea
                            id="projectDomainDescription"
                            value={customProjectDomain.description}
                            onChange={(e) =>
                              setCustomProjectDomain({
                                ...customProjectDomain,
                                description: e.target.value,
                              })
                            }
                            placeholder="Enter project domain description"
                            className="w-full px-3 py-2 rounded-md text-white bg-black placeholder-gray-400 border border-white min-h-[80px]"
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-3">
                          <Button
                            type="button"
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
