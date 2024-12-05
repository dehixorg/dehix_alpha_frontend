import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus, X, Check } from 'lucide-react';

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
  SelectGroup,
} from '@/components/ui/select';
import { Type } from '@/utils/enum';
import { StatusEnum } from '@/utils/freelancer/enum';

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
  const [tmpSkills, setTmpSkills] = useState<string[]>([]);
  const [domains, setDomains] = useState<any>([]);
  const [currDomains, setCurrDomains] = useState<any>([]);
  const [tmpDomains, setTmpDomains] = useState<string[]>([]);
  const [projectDomains, setProjectDomains] = useState<any>([]);
  const [currProjectDomains, setCurrProjectDomains] = useState<any>([]);
  const [tmpProjectDomains, setTmpProjectDomains] = useState<string[]>([]);
  const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(true);
  const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(true);
  const [isProjectDomainDropdownOpen, setIsProjectDomianDropdownOpen] =
    useState(true);

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

  const handleAddSkills = () => {
    const newSkills = tmpSkills
      .filter((skill) => !currSkills.some((s: any) => s.name === skill))
      .map((skill) => ({
        name: skill,
        level: '',
        experience: '',
        interviewStatus: StatusEnum.PENDING,
        interviewInfo: '',
        interviewerRating: 0,
      }));

    setCurrSkills([...currSkills, ...newSkills]);
    setTmpSkills([]);
  };

  const handleAddDomains = () => {
    const newDomains = tmpDomains
      .filter((domain) => !currDomains.some((d: any) => d.name === domain))
      .map((domain) => ({
        name: domain,
        level: '',
        experience: '',
        interviewStatus: StatusEnum.PENDING,
        interviewInfo: '',
        interviewerRating: 0,
      }));

    setCurrDomains([...currDomains, ...newDomains]);
    setTmpDomains([]);
  };

  const handleAddProjectDomains = () => {
    const newProjectDomains = tmpProjectDomains
      .filter(
        (projectDomain) =>
          !currProjectDomains.some((d: any) => d.name === projectDomain),
      )
      .map((projectDomain) => ({
        name: projectDomain,
        level: '',
        experience: '',
        interviewStatus: StatusEnum.PENDING,
        interviewInfo: '',
        interviewerRating: 0,
      }));

    setCurrProjectDomains([...currProjectDomains, ...newProjectDomains]);
    setTmpProjectDomains([]);
  };

  useEffect(() => {
    console.log('domain selected', currDomains);
  }, [currDomains]);

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
        const skillsResponse = await axiosInstance.get('/skills');
        const domainsResponse = await axiosInstance.get('/domain');
        const projectDomainResponse = await axiosInstance.get('/projectdomain');

        // Set options for dropdowns
        setSkills(skillsResponse.data.data);
        setDomains(domainsResponse.data.data);
        setProjectDomains(projectDomainResponse.data.data);

        setCurrSkills(userResponse.data.skills);
        setCurrDomains(userResponse.data.domain);
        setCurrProjectDomains(userResponse.data.projectDomain);

        form.reset({
          firstName: userResponse.data.firstName || '',
          lastName: userResponse.data.lastName || '',
          username: userResponse.data.userName || '',
          email: userResponse.data.email || '',
          phone: userResponse.data.phone || '',
          role: userResponse.data.role || '',
          personalWebsite: userResponse.data.personalWebsite || '',
          resume: userResponse.data.resume || '',
          description: userResponse.data.description || '',
        });
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    fetchData();
  }, [user_id]);

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
    try {
      console.log('API body', {
        ...data,
        skills: currSkills,
        domain: currDomains,
      });
      await axiosInstance.put(`/freelancer/${user_id}`, {
        ...data,
        skills: currSkills,
        domain: currDomains,
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
        skills: currSkills,
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
    }
  }

  return (
    <Card className="p-10">
      <Form {...form}>
        <ProfilePictureUpload
          user_id={user._id}
          profile={user.profilePic}
          entityType={Type.FREELANCER}
        />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-10 grid-cols-2 mt-4"
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
                  <Input placeholder="Enter your username" {...field} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
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
              <FormItem className="col-span-2">
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
                  <Input placeholder="+91" {...field} />
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
          {/* <Separator className="col-span-2 mt-0" /> */}
          {/* <FormField
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
          /> */}

          <Separator className="col-span-2" />
          <div className="flex flex-wrap gap-6 w-full">
            <div className="flex-1 min-w-[150px] max-w-[300px]">
              <FormLabel>Skills</FormLabel>
              <div className="flex items-center mt-2">
                <Select
                  open={isSkillsDropdownOpen}
                  onOpenChange={(open) => {
                    if (!isSkillsDropdownOpen) {
                      setIsSkillsDropdownOpen(open);
                    }
                  }}
                  onValueChange={(value) => {
                    const updatedskills = tmpSkills.includes(value)
                      ? tmpSkills.filter((skill) => skill !== value)
                      : [...tmpSkills, value];
                    setTmpSkills(updatedskills);
                  }}
                  value=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select skills" />
                  </SelectTrigger>
                  <SelectContent
                    onPointerDownOutside={() => setIsSkillsDropdownOpen(false)}
                    onEscapeKeyDown={() => setIsSkillsDropdownOpen(false)}
                  >
                    <SelectGroup>
                      {skills
                        .filter(
                          (skill: any) =>
                            !currSkills.some(
                              (s: any) => s.name === skill.label,
                            ),
                        )
                        .map((skill: any, index: number) => (
                          <SelectItem
                            key={index}
                            value={skill.label}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{skill.label}</span>
                              {tmpSkills.includes(skill.label) && (
                                <Check className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  type="button"
                  size="icon"
                  className="ml-2"
                  onClick={() => {
                    handleAddSkills();
                    setIsSkillsDropdownOpen(false);
                  }}
                  disabled={tmpSkills.length === 0}
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

            <div className="flex-1 min-w-[150px] max-w-[300px]">
              <FormLabel>Domains</FormLabel>
              <div className="flex items-center mt-2">
                <Select
                  open={isDomainDropdownOpen}
                  onOpenChange={(open) => {
                    if (!isDomainDropdownOpen) {
                      setIsDomainDropdownOpen(open);
                    }
                  }}
                  onValueChange={(value) => {
                    const updatedDomains = tmpDomains.includes(value)
                      ? tmpDomains.filter((domain) => domain !== value)
                      : [...tmpDomains, value];
                    setTmpDomains(updatedDomains);
                  }}
                  value=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select domains" />
                  </SelectTrigger>
                  <SelectContent
                    onPointerDownOutside={() => setIsDomainDropdownOpen(false)}
                    onEscapeKeyDown={() => setIsDomainDropdownOpen(false)}
                  >
                    <SelectGroup>
                      {domains
                        .filter(
                          (domain: any) =>
                            !currDomains.some(
                              (d: any) => d.name === domain.label,
                            ),
                        )
                        .map((domain: any, index: number) => (
                          <SelectItem
                            key={index}
                            value={domain.label}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{domain.label}</span>
                              {tmpDomains.includes(domain.label) && (
                                <Check className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  type="button"
                  size="icon"
                  className="ml-2"
                  disabled={tmpDomains.length === 0}
                  onClick={() => {
                    handleAddDomains();
                    setIsDomainDropdownOpen(false);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-5">
                {currDomains.map((domain: any, index: number) => (
                  <Badge
                    className="uppercase text-xs font-normal bg-gray-300 flex items-center px-2 py-1"
                    key={index}
                  >
                    {domain.name}
                    <button
                      type="button"
                      onClick={() => handleDeleteDomain(domain.name)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex-1 min-w-[150px] max-w-[300px]">
              <FormLabel>Project Domains</FormLabel>
              <div className="flex items-center mt-2">
                <Select
                  open={isProjectDomainDropdownOpen}
                  onOpenChange={(open) => {
                    if (!isProjectDomainDropdownOpen) {
                      setIsProjectDomianDropdownOpen(open);
                    }
                  }}
                  onValueChange={(value) => {
                    const updatedProjectDomains = tmpProjectDomains.includes(
                      value,
                    )
                      ? tmpProjectDomains.filter(
                          (projectDomain) => projectDomain !== value,
                        )
                      : [...tmpProjectDomains, value];
                    setTmpProjectDomains(updatedProjectDomains);
                  }}
                  value=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project domains" />
                  </SelectTrigger>
                  <SelectContent
                    onPointerDownOutside={() =>
                      setIsProjectDomianDropdownOpen(false)
                    }
                    onEscapeKeyDown={() =>
                      setIsProjectDomianDropdownOpen(false)
                    }
                  >
                    {projectDomains
                      .filter(
                        (projectDomains: any) =>
                          !currProjectDomains.some(
                            (d: any) => d.name === projectDomains.label,
                          ),
                      )
                      .map((projectDomains: any, index: number) => (
                        <SelectItem
                          key={index}
                          value={projectDomains.label}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{projectDomains.label}</span>
                            {tmpProjectDomains.includes(
                              projectDomains.label,
                            ) && <Check className="h-4 w-4 text-green-500" />}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  type="button"
                  size="icon"
                  className="ml-2"
                  onClick={() => {
                    handleAddProjectDomains();
                    setIsProjectDomianDropdownOpen(false);
                  }}
                  disabled={tmpProjectDomains.length === 0}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-5">
                {currProjectDomains.map(
                  (projectDomains: any, index: number) => (
                    <Badge
                      className="uppercase text-xs font-normal bg-gray-300 flex items-center px-2 py-1"
                      key={index}
                    >
                      {projectDomains.name}
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteProjDomain(projectDomains.name)
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
          <Separator className="col-span-2 mt-0" />
          <FormField
            control={form.control}
            name="resume"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start ">
                <FormLabel className="ml-2">Upload Resume</FormLabel>
                <div className="w-full sm:w-auto sm:mr-26">
                  <ResumeUpload user_id={user._id} url={user.resume} />
                </div>
              </FormItem>
            )}
          />
          <Separator className="col-span-2 mt-0" />
          <Button type="submit" className="col-span-2">
            Update profile
          </Button>
        </form>
      </Form>
    </Card>
  );
}
