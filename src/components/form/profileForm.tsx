import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogOverlay } from '@radix-ui/react-dialog';

import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import ProfilePictureUpload from '../fileUpload/profilePicture';
import ResumeUpload from '../fileUpload/resume';

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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from '@/components/ui/select';
import { Type } from '@/utils/enum';
import {  StatusEnum } from '@/utils/freelancer/enum';
import { addSkill } from '@/utils/skillUtils';
import { addDomain } from '@/utils/DomainUtils';
import { addProjectDomain } from '@/utils/ProjectDomainUtils';

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
  resume: z.string().url().optional(),
  description: z.string().max(500, {
    message: 'Description cannot exceed 500 characters.',
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm({ user_id }: { user_id: string }) {
  const [user, setUser] = useState<any>({});
  const [skills, setSkills] = useState<any>([]);
  const [currSkills, setCurrSkills] = useState<any>([]);
  const [tmpSkill, setTmpSkill] = useState<any>('');
  const [domains, setDomains] = useState<any>([]);
  const [currDomains, setCurrDomains] = useState<any>([]);
  const [tmpDomain, setTmpDomain] = useState<any>('');
  const [projectDomains, setProjectDomains] = useState<any>([]);
  const [currProjectDomains, setCurrProjectDomains] = useState<any>([]);
  const [tmpProjectDomains, setTmpProjectDomains] = useState<any>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    },
    mode: 'all',
  });

  const handleAddSkill = () => {
    addSkill(tmpSkill, skills, setSkills);
    if (tmpSkill && !currSkills.some((skill: any) => skill.name === tmpSkill)) {
      setCurrSkills([
        ...currSkills,
        {
          name: tmpSkill,
          level: '',
          experience: '',
          interviewStatus: StatusEnum.PENDING,
          interviewInfo: '',
          interviewerRating: 0,
        },
      ]);
      setLastAddedItems((prev) => ({
        ...prev,
        skills: [...prev.skills, { name: tmpSkill }],
      }));

      setTmpSkill('');
    }
  };

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

  const handleAddDomain = () => {
    addDomain(tmpDomain, domains, setDomains);
    if (
      tmpDomain &&
      !currDomains.some((domain: any) => domain.name === tmpDomain)
    ) {
      setCurrDomains([
        ...currDomains,
        {
          name: tmpDomain,
          level: '',
          experience: '',
          interviewStatus: StatusEnum.PENDING,
          interviewInfo: '',
          interviewerRating: 0,
        },
      ]);
      setLastAddedItems((prev) => ({
        ...prev,
        domains: [...prev.domains, { name: tmpDomain }],
      }));
      setTmpDomain('');
    }
  };
  const handleAddprojectDomain = () => {
    addProjectDomain(tmpProjectDomains, projectDomains, setProjectDomains);
    if (
      tmpProjectDomains &&
      !currProjectDomains.some(
        (projectDomains: any) => projectDomains.name === projectDomains,
      )
    ) {
      setCurrProjectDomains([
        ...currProjectDomains,
        {
          name: tmpProjectDomains,
          level: '',
          experience: '',
          interviewStatus: StatusEnum.PENDING,
          interviewInfo: '',
          interviewerRating: 0,
        },
      ]);
      setLastAddedItems((prev) => ({
        ...prev,
        projectsDomains: [...prev.projectsDomains, { name: tmpProjectDomains }],
      }));
      setTmpProjectDomains('');
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

  const [searchQuery, setSearchQuery] = useState('');
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

        form.reset({
          firstName: userResponse.data.data.firstName || '',
          lastName: userResponse.data.data.lastName || '',
          username: userResponse.data.data.userName || '',
          email: userResponse.data.data.email || '',
          phone: userResponse.data.data.phone || '',
          role: userResponse.data.data.role || '',
          personalWebsite: userResponse.data.data.personalWebsite || '',
          resume: userResponse.data.data.resume || '',
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
      resume: user?.resume || '',
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
        resume: data.resume,
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
        resume: data.resume,
        skills: updatedSkills,
        domain: currDomains,
        projectDomains: currProjectDomains,
      });
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
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
    <Card className="p-10">
      <Form {...form}>
        <ProfilePictureUpload
          profile={user.profilePic}
          entityType={Type.FREELANCER}
        />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-10 grid-cols-1 sm:grid-cols-2 mt-4"
        >
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
              <FormItem className="sm:col-span-2">
                <FormLabel>Description</FormLabel>
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

          <FormField
            control={form.control}
            name="resume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resume URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your Resume URL"
                    type="url"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Enter your Resume URL</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator className="col-span-2" />
          <div className="sm:col-span-2">
            <div className="grid gap-10 grid-cols-1 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <div className="flex-1 min-w-[350px] max-w-[500px] mt-5">
                  <FormLabel>Skills</FormLabel>
                  <div className="flex items-center mt-2">
                    <Select
                      onValueChange={(value) => {
                        setTmpSkill(value);
                        setSearchQuery(''); // Reset search query when a value is selected
                      }}
                      value={tmpSkill || ''}
                      onOpenChange={(open) => {
                        if (!open) setSearchQuery('');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={tmpSkill ? tmpSkill : 'Select skill'}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Add search input */}
                        <div className="p-2 relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Search skills"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white text-xl transition-colors mr-2"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        {/* Filtered skill list */}
                        {skills
                          .filter(
                            (skill: any) =>
                              skill.label
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()) &&
                              !currSkills.some(
                                (s: any) => s.name === skill.label,
                              ),
                          )
                          .map((skill: any, index: number) => (
                            <SelectItem key={index} value={skill.label}>
                              {skill.label}
                            </SelectItem>
                          ))}
                        {/* No matching skills */}
                        {skills.filter(
                          (skill: any) =>
                            skill.label
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) &&
                            !currSkills.some(
                              (s: any) => s.name === skill.label,
                            ),
                        ).length === 0 && (
                          <div className="p-2 text-gray-500 italic text-center">
                            No matching skills
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      type="button"
                      size="icon"
                      className="ml-2"
                      disabled={!tmpSkill}
                      onClick={() => {
                        handleAddSkill();
                        setTmpSkill('');
                        setSearchQuery(''); // Reset search query
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {currSkills.map((skill: any, index: number) => (
                      <Badge
                        className="uppercase text-xs font-normal bg-gray-300 flex items-center px-2 py-1"
                        key={index}
                      >
                        {skill.name}
                        <button
                          type="button"
                          onClick={() => handleDeleteSkill(skill.name)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="flex-1 min-w-[350px] max-w-[500px] mt-5">
                  <FormLabel>Domains</FormLabel>
                  <div className="flex items-center mt-2">
                    <Select
                      onValueChange={(value) => {
                        setTmpDomain(value);
                        setSearchQuery(''); // Reset search query when a value is selected
                      }}
                      value={tmpDomain || ''}
                      onOpenChange={(open) => {
                        if (!open) setSearchQuery('');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={tmpDomain ? tmpDomain : 'Select domain'}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Add search input */}
                        <div className="p-2 relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Search domains"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white text-xl transition-colors mr-2"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        {/* Filtered domain list */}
                        {domains
                          .filter(
                            (domain: any) =>
                              domain.label
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()) &&
                              !currDomains.some(
                                (s: any) => s.name === domain.label,
                              ),
                          )
                          .map((domain: any, index: number) => (
                            <SelectItem key={index} value={domain.label}>
                              {domain.label}
                            </SelectItem>
                          ))}
                        {/* No matching domains */}
                        {domains.filter(
                          (Domain: any) =>
                            Domain.label
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) &&
                            !currDomains.some(
                              (s: any) => s.name === domains.name,
                            ),
                        ).length === 0 && (
                          <div className="p-2 text-gray-500 italic text-center">
                            No matching domains
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      type="button"
                      size="icon"
                      className="ml-2"
                      disabled={!tmpDomain}
                      onClick={() => {
                        handleAddDomain();
                        setTmpDomain('');
                        setSearchQuery(''); // Reset search query
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {currDomains.map((Domain: any, index: number) => (
                      <Badge
                        className="uppercase text-xs font-normal bg-gray-300 flex items-center px-2 py-1"
                        key={index}
                      >
                        {Domain.name}
                        <button
                          type="button"
                          onClick={() => handleDeleteDomain(Domain.name)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="flex-1 min-w-[350px] max-w-[500px] mt-5">
                  <FormLabel>Project Domains</FormLabel>
                  <div className="flex items-center mt-2">
                    <Select
                      onValueChange={(value) => {
                        setTmpProjectDomains(value);
                        setSearchQuery(''); // Reset search query when a value is selected
                      }}
                      value={tmpProjectDomains || ''}
                      onOpenChange={(open) => {
                        if (!open) setSearchQuery('');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            tmpProjectDomains
                              ? tmpProjectDomains
                              : 'Select project domain'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Add search input */}
                        <div className="p-2 relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Search project domains"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white text-xl transition-colors mr-2"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        {/* Filtered domain list */}
                        {projectDomains
                          .filter(
                            (projectDomain: any) =>
                              projectDomain.label
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()) &&
                              !currProjectDomains.some(
                                (s: any) => s.name === projectDomain.label,
                              ),
                          )
                          .map((projectDomain: any, index: number) => (
                            <SelectItem key={index} value={projectDomain.label}>
                              {projectDomain.label}
                            </SelectItem>
                          ))}
                        {/* No matching domains */}
                        {projectDomains.filter(
                          (projectDomain: any) =>
                            projectDomain.label
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) &&
                            !currProjectDomains.some(
                              (s: any) => s.name === projectDomains.name,
                            ),
                        ).length === 0 && (
                          <div className="p-2 text-gray-500 italic text-center">
                            No matching domains
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      type="button"
                      size="icon"
                      className="ml-2"
                      disabled={!tmpProjectDomains}
                      onClick={() => {
                        handleAddprojectDomain();
                        setTmpProjectDomains('');
                        setSearchQuery(''); // Reset search query
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {currProjectDomains.map(
                      (projectDomain: any, index: number) => (
                        <Badge
                          className="uppercase text-xs font-normal bg-gray-300 flex items-center px-2 py-1"
                          key={index}
                        >
                          {projectDomain.name}
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteProjDomain(projectDomain.name)
                            }
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Separator className="col-span-2 mt-0" />
          <FormField
            control={form.control}
            name="resume"
            render={() => (
              <FormItem className="flex flex-col items-start ">
                <FormLabel className="ml-2">Upload Resume</FormLabel>
                <div className="w-full sm:w-auto sm:mr-26">
                  <ResumeUpload />
                </div>
              </FormItem>
            )}
          />
          <Separator className="sm:col-span-2 mt-0" />
          <Button type="submit" className="sm:col-span-2" disabled={loading}>
            {loading ? 'Loading...' : 'Update Profile'}
          </Button>

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
