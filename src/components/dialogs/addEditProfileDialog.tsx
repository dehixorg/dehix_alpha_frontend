import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, X, RefreshCw } from 'lucide-react';
import {
  FreelancerProfile,
  Skill,
  Domain,
  Project,
  ProfessionalExperience,
  Education,
} from '@/types/freelancer';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';

const profileFormSchema = z.object({
  profileName: z
    .string()
    .min(1, 'Profile name is required')
    .max(100, 'Profile name must be less than 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  githubLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedinLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  personalWebsite: z.string().url('Invalid URL').optional().or(z.literal('')),
  hourlyRate: z.string().optional(),
  availability: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE']),
});

interface AddEditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: FreelancerProfile | null;
  onProfileSaved: () => void;
  freelancerId: string;
}

interface SkillOption {
  _id: string;
  name: string;
}

interface DomainOption {
  _id: string;
  name: string;
}

interface ProjectOption {
  _id: string;
  projectName: string;
}

interface ExperienceOption {
  _id: string;
  company: string;
  jobTitle: string;
}

interface EducationOption {
  _id: string;
  degree: string;
  universityName: string;
}

const AddEditProfileDialog: React.FC<AddEditProfileDialogProps> = ({
  open,
  onOpenChange,
  profile,
  onProfileSaved,
  freelancerId,
}) => {
  const [loading, setLoading] = useState(false);
  const [skillOptions, setSkillOptions] = useState<SkillOption[]>([]);
  const [domainOptions, setDomainOptions] = useState<DomainOption[]>([]);
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const [experienceOptions, setExperienceOptions] = useState<
    ExperienceOption[]
  >([]);
  const [educationOptions, setEducationOptions] = useState<EducationOption[]>(
    [],
  );

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [selectedEducation, setSelectedEducation] = useState<string[]>([]);
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(['']);

  // Temporary selections for dropdowns
  const [tmpSkill, setTmpSkill] = useState<string>('');
  const [tmpDomain, setTmpDomain] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New experience and education forms
  const [newExperience, setNewExperience] = useState({
    jobTitle: '',
    companyName: '',
    startDate: '',
    endDate: '',
    description: '',
  });
  const [newEducation, setNewEducation] = useState({
    degree: '',
    universityName: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    grade: '',
  });
  const [newProject, setNewProject] = useState({
    projectName: '',
    description: '',
    startDate: '',
    endDate: '',
    githubLink: '',
    liveDemoLink: '',
  });

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      profileName: '',
      description: '',
      githubLink: '',
      linkedinLink: '',
      personalWebsite: '',
      hourlyRate: '',
      availability: 'FREELANCE',
    },
  });

  // Fetch available options
  useEffect(() => {
    if (open) {
      fetchOptions();
    }
  }, [open, freelancerId]);

  // Populate form when editing
  useEffect(() => {
    if (profile && open) {
      form.reset({
        profileName: profile.profileName,
        description: profile.description,
        githubLink: profile.githubLink || '',
        linkedinLink: profile.linkedinLink || '',
        personalWebsite: profile.personalWebsite || '',
        hourlyRate: profile.hourlyRate?.toString() || '',
        availability: profile.availability || 'FREELANCE',
      });

      setSelectedSkills(
        profile.skills?.map((s) => s._id!).filter(Boolean) || [],
      );
      setSelectedDomains(
        profile.domains?.map((d) => d._id!).filter(Boolean) || [],
      );
      setSelectedProjects(
        profile.projects?.map((p) => p._id!).filter(Boolean) || [],
      );
      setSelectedExperiences(
        profile.experiences?.map((e) => e._id!).filter(Boolean) || [],
      );
      setSelectedEducation(
        profile.education?.map((e) => e._id!).filter(Boolean) || [],
      );
      setPortfolioLinks(
        profile.portfolioLinks && profile.portfolioLinks.length > 0
          ? profile.portfolioLinks
          : [''],
      );
    } else if (open) {
      // Reset form for new profile
      form.reset();
      setSelectedSkills([]);
      setSelectedDomains([]);
      setSelectedProjects([]);
      setSelectedExperiences([]);
      setSelectedEducation([]);
      setPortfolioLinks(['']);
    }
  }, [profile, open, form]);

  const fetchOptions = async () => {
    try {
      const [freelancerRes, projectsRes, experiencesRes, educationRes] =
        await Promise.all([
          axiosInstance.get(`/freelancer/${freelancerId}`),
          axiosInstance.get(`/freelancer/${freelancerId}/myproject`),
          axiosInstance.get(`/freelancer/${freelancerId}/experience`),
          axiosInstance.get(`/freelancer/${freelancerId}/education`),
        ]);

      // Handle freelancer data for personal website, skills, and domains
      const freelancerData = freelancerRes.data.data || {};
      if (freelancerData.personalWebsite && !profile) {
        form.setValue('personalWebsite', freelancerData.personalWebsite);
      }

      // Handle skills data - get from freelancer.skills array
      const skillsData = freelancerData.skills || [];
      const skillsArray = Array.isArray(skillsData) ? skillsData : [];
      setSkillOptions(skillsArray);

      // Handle domains data - get from freelancer.domain array
      const domainsData = freelancerData.domain || [];
      const domainsArray = Array.isArray(domainsData) ? domainsData : [];
      setDomainOptions(domainsArray);

      // Handle projects data
      const projectsData = projectsRes.data.data || [];
      const projectsArray = Array.isArray(projectsData)
        ? projectsData
        : Object.values(projectsData);
      setProjectOptions(projectsArray);

      // Handle experience data - convert to array if it's an object
      const experienceData = experiencesRes.data.data || [];
      const experienceArray = Array.isArray(experienceData)
        ? experienceData
        : Object.values(experienceData);
      setExperienceOptions(experienceArray);

      // Handle education data
      const educationData = educationRes.data.data || [];
      const educationArray = Array.isArray(educationData)
        ? educationData
        : Object.values(educationData);
      setEducationOptions(educationArray);

      // If editing a profile, pre-select the profile's items
      if (profile) {
        setSelectedSkills(
          profile.skills?.map((skill) => skill._id!).filter(Boolean) || [],
        );
        setSelectedDomains(
          profile.domains?.map((domain) => domain._id!).filter(Boolean) || [],
        );
        setSelectedProjects(
          profile.projects?.map((project) => project._id!).filter(Boolean) ||
            [],
        );
        setSelectedExperiences(
          profile.experiences
            ?.map((experience) => experience._id!)
            .filter(Boolean) || [],
        );
        setSelectedEducation(
          profile.education
            ?.map((education) => education._id!)
            .filter(Boolean) || [],
        );
      }
    } catch (error) {
      console.error('Error fetching options:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile options',
        variant: 'destructive',
      });
    }
  };

  const addPortfolioLink = () => {
    setPortfolioLinks([...portfolioLinks, '']);
  };

  // Helper functions for adding skills and domains
  const handleAddSkill = () => {
    if (tmpSkill && !selectedSkills.includes(tmpSkill)) {
      setSelectedSkills([...selectedSkills, tmpSkill]);
      setTmpSkill('');
      setSearchQuery('');
    }
  };

  const handleAddDomain = () => {
    if (tmpDomain && !selectedDomains.includes(tmpDomain)) {
      setSelectedDomains([...selectedDomains, tmpDomain]);
      setTmpDomain('');
      setSearchQuery('');
    }
  };

  const handleDeleteSkill = (skillIdToDelete: string) => {
    setSelectedSkills(selectedSkills.filter((id) => id !== skillIdToDelete));
  };

  const handleDeleteDomain = (domainIdToDelete: string) => {
    setSelectedDomains(selectedDomains.filter((id) => id !== domainIdToDelete));
  };

  // Helper function to add custom skill
  const handleAddCustomSkill = async (skillName: string) => {
    try {
      // First create the skill in global skills collection
      const skillResponse = await axiosInstance.post('/skills', {
        label: skillName,
        createdBy: 'FREELANCER',
        createdById: freelancerId,
        status: 'ACTIVE',
      });

      // Then add it to the freelancer's skills array
      await axiosInstance.put('/freelancer/skill', {
        skills: [
          {
            name: skillName,
            level: '',
            experience: '',
            interviewStatus: 'PENDING',
            interviewInfo: '',
            interviewerRating: 0,
            interviewPermission: true,
          },
        ],
      });

      // Refresh skill options
      await fetchOptions();

      toast({
        title: 'Success',
        description: 'Skill added successfully',
      });
    } catch (error) {
      console.error('Error adding skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to add skill',
        variant: 'destructive',
      });
    }
  };

  // Helper function to add custom domain
  const handleAddCustomDomain = async (domainName: string) => {
    try {
      // First create the domain in global domains collection
      const domainResponse = await axiosInstance.post('/domain', {
        label: domainName,
        createdBy: 'FREELANCER',
        createdById: freelancerId,
        status: 'ACTIVE',
      });

      // Then add it to the freelancer's domains array
      await axiosInstance.put('/freelancer/domain', {
        domain: [
          {
            name: domainName,
            level: '',
            experience: '',
            interviewStatus: 'PENDING',
          },
        ],
      });

      // Refresh domain options
      await fetchOptions();

      toast({
        title: 'Success',
        description: 'Domain added successfully',
      });
    } catch (error) {
      console.error('Error adding domain:', error);
      toast({
        title: 'Error',
        description: 'Failed to add domain',
        variant: 'destructive',
      });
    }
  };

  const handleAddProject = async () => {
    if (!newProject.projectName || !newProject.description) {
      toast({
        title: 'Error',
        description: 'Project name and description are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await axiosInstance.post(`/freelancer/project`, {
        projectName: newProject.projectName,
        description: newProject.description,
        startDate: newProject.startDate
          ? new Date(newProject.startDate).toISOString()
          : null,
        endDate: newProject.endDate
          ? new Date(newProject.endDate).toISOString()
          : null,
        githubLink: newProject.githubLink || '',
        liveDemoLink: newProject.liveDemoLink || '',
        status: 'ACTIVE',
      });

      // Add to selected projects
      const newProjectId = response.data.data._id;
      if (newProjectId && !selectedProjects.includes(newProjectId)) {
        setSelectedProjects([...selectedProjects, newProjectId]);
      }

      // Reset form
      setNewProject({
        projectName: '',
        description: '',
        startDate: '',
        endDate: '',
        githubLink: '',
        liveDemoLink: '',
      });

      // Refresh options
      await fetchOptions();

      toast({
        title: 'Success',
        description: 'Project added successfully',
      });
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: 'Error',
        description: 'Failed to add project',
        variant: 'destructive',
      });
    }
  };

  const removePortfolioLink = (index: number) => {
    setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
  };

  // Helper functions for adding experiences and education
  const handleAddExperience = async () => {
    if (!newExperience.jobTitle || !newExperience.companyName) {
      toast({
        title: 'Error',
        description: 'Job title and company name are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await axiosInstance.post(`/freelancer/experience`, {
        jobTitle: newExperience.jobTitle,
        company: newExperience.companyName,
        workDescription: newExperience.description,
        workFrom: newExperience.startDate
          ? new Date(newExperience.startDate).toISOString()
          : null,
        workTo: newExperience.endDate
          ? new Date(newExperience.endDate).toISOString()
          : null,
        referencePersonName: '',
        referencePersonContact: '',
        githubRepoLink: '',
        oracleAssigned: null,
        verificationStatus: 'ADDED',
        verificationUpdateTime: new Date().toISOString(),
        comments: '',
      });

      // Add to selected experiences
      const newExperienceId = response.data.data._id;
      if (newExperienceId && !selectedExperiences.includes(newExperienceId)) {
        setSelectedExperiences([...selectedExperiences, newExperienceId]);
      }

      // Reset form
      setNewExperience({
        jobTitle: '',
        companyName: '',
        startDate: '',
        endDate: '',
        description: '',
      });

      // Refresh options
      await fetchOptions();

      toast({
        title: 'Success',
        description: 'Experience added successfully',
      });
    } catch (error) {
      console.error('Error adding experience:', error);
      toast({
        title: 'Error',
        description: 'Failed to add experience',
        variant: 'destructive',
      });
    }
  };

  const handleAddEducation = async () => {
    if (!newEducation.degree || !newEducation.universityName) {
      toast({
        title: 'Error',
        description: 'Degree and university name are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await axiosInstance.post(`/freelancer/education`, {
        degree: newEducation.degree,
        universityName: newEducation.universityName,
        fieldOfStudy: newEducation.fieldOfStudy,
        startDate: newEducation.startDate
          ? new Date(newEducation.startDate).toISOString()
          : null,
        endDate: newEducation.endDate
          ? new Date(newEducation.endDate).toISOString()
          : null,
        grade: newEducation.grade,
      });

      // Add to selected education
      const newEducationId = response.data.data._id;
      if (newEducationId && !selectedEducation.includes(newEducationId)) {
        setSelectedEducation([...selectedEducation, newEducationId]);
      }

      // Reset form
      setNewEducation({
        degree: '',
        universityName: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        grade: '',
      });

      // Refresh options
      await fetchOptions();

      toast({
        title: 'Success',
        description: 'Education added successfully',
      });
    } catch (error) {
      console.error('Error adding education:', error);
      toast({
        title: 'Error',
        description: 'Failed to add education',
        variant: 'destructive',
      });
    }
  };

  const updatePortfolioLink = (index: number, value: string) => {
    const updated = [...portfolioLinks];
    updated[index] = value;
    setPortfolioLinks(updated);
  };

  const toggleSelection = (
    id: string,
    selectedList: string[],
    setSelectedList: (list: string[]) => void,
  ) => {
    if (selectedList.includes(id)) {
      setSelectedList(selectedList.filter((item) => item !== id));
    } else {
      setSelectedList([...selectedList, id]);
    }
  };

  const onSubmit = async (data: z.infer<typeof profileFormSchema>) => {
    setLoading(true);
    try {
      const profileData = {
        ...data,
        hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : undefined,
        skills: selectedSkills,
        domains: selectedDomains,
        projects: selectedProjects,
        experiences: selectedExperiences,
        education: selectedEducation,
        portfolioLinks: portfolioLinks.filter((link) => link.trim() !== ''),
      };

      if (profile?._id) {
        await axiosInstance.put(
          `/freelancer/profile/${profile._id}`,
          profileData,
        );
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been successfully updated.',
        });
      } else {
        await axiosInstance.post(`/freelancer/profile`, profileData);
        toast({
          title: 'Profile Created',
          description: 'Your new profile has been successfully created.',
        });
      }

      onProfileSaved();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {profile ? 'Edit Profile' : 'Create New Profile'}
          </DialogTitle>
          <DialogDescription>
            {profile
              ? 'Update your professional profile information.'
              : 'Create a new professional profile to showcase your skills and experience.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="profileName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Frontend Developer, Backend Engineer"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Give your profile a descriptive name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FULL_TIME">Full Time</SelectItem>
                        <SelectItem value="PART_TIME">Part Time</SelectItem>
                        <SelectItem value="CONTRACT">Contract</SelectItem>
                        <SelectItem value="FREELANCE">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your expertise, experience, and what makes you unique..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a compelling description of your professional
                    background
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Links and Rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="50" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your preferred hourly rate
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="githubLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Profile</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://github.com/username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="linkedinLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Profile</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://linkedin.com/in/username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="personalWebsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourwebsite.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Portfolio Links */}
            <div>
              <FormLabel>Portfolio Links</FormLabel>
              <FormDescription className="mb-3">
                Add links to your portfolio projects or work samples
              </FormDescription>
              {portfolioLinks.map((link, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    placeholder="https://portfolio-project.com"
                    value={link}
                    onChange={(e) => updatePortfolioLink(index, e.target.value)}
                  />
                  {portfolioLinks.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePortfolioLink(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPortfolioLink}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Portfolio Link
              </Button>
            </div>

            <Separator />

            {/* Skills and Domains Selection - Side by Side */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              {/* Skills Selection */}
              <div>
                <FormLabel>Skills</FormLabel>
                <FormDescription className="mb-3">
                  Select skills relevant to this profile
                </FormDescription>
                <div className="flex items-center gap-2 mb-3">
                  <Select
                    onValueChange={(value) => {
                      setTmpSkill(value);
                      setSearchQuery('');
                    }}
                    value={tmpSkill || ''}
                    onOpenChange={(open) => {
                      if (!open) setSearchQuery('');
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Search skills or type new skill"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl transition-colors mr-2"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      {(skillOptions || [])
                        .filter((skill) => {
                          try {
                            return (
                              skill?.name &&
                              skill?._id &&
                              typeof skill.name === 'string' &&
                              skill.name
                                .toLowerCase()
                                .includes((searchQuery || '').toLowerCase()) &&
                              !(selectedSkills || []).includes(skill._id)
                            );
                          } catch (error) {
                            console.error(
                              'Error filtering skill:',
                              error,
                              skill,
                            );
                            return false;
                          }
                        })
                        .map((skill) => (
                          <SelectItem key={skill._id} value={skill._id}>
                            {skill.name}
                          </SelectItem>
                        ))}
                      {searchQuery &&
                        (skillOptions || []).filter((skill) => {
                          try {
                            return (
                              skill?.name &&
                              typeof skill.name === 'string' &&
                              skill.name
                                .toLowerCase()
                                .includes((searchQuery || '').toLowerCase())
                            );
                          } catch (error) {
                            console.error(
                              'Error filtering skill for add new:',
                              error,
                              skill,
                            );
                            return false;
                          }
                        }).length === 0 && (
                          <div className="p-2">
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => handleAddCustomSkill(searchQuery)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add "{searchQuery}" as new skill
                            </Button>
                          </div>
                        )}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={!tmpSkill}
                    onClick={handleAddSkill}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedSkills.map((skillId) => {
                    const skill = skillOptions.find((s) => s._id === skillId);
                    return skill ? (
                      <Badge
                        key={skillId}
                        className="uppercase text-xs font-normal bg-gray-300 flex items-center px-2 py-1"
                      >
                        {skill.name}
                        <button
                          type="button"
                          onClick={() => handleDeleteSkill(skillId)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Domains Selection */}
              <div>
                <FormLabel>Domains</FormLabel>
                <FormDescription className="mb-3">
                  Select domains you work in
                </FormDescription>
                <div className="flex items-center gap-2 mb-3">
                  <Select
                    onValueChange={(value) => {
                      setTmpDomain(value);
                      setSearchQuery('');
                    }}
                    value={tmpDomain || ''}
                    onOpenChange={(open) => {
                      if (!open) setSearchQuery('');
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Search domains or type new domain"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl transition-colors mr-2"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      {(domainOptions || [])
                        .filter((domain) => {
                          try {
                            return (
                              domain?.name &&
                              domain?._id &&
                              typeof domain.name === 'string' &&
                              domain.name
                                .toLowerCase()
                                .includes((searchQuery || '').toLowerCase()) &&
                              !(selectedDomains || []).includes(domain._id)
                            );
                          } catch (error) {
                            console.error(
                              'Error filtering domain:',
                              error,
                              domain,
                            );
                            return false;
                          }
                        })
                        .map((domain) => (
                          <SelectItem key={domain._id} value={domain._id}>
                            {domain.name}
                          </SelectItem>
                        ))}
                      {searchQuery &&
                        (domainOptions || []).filter((domain) => {
                          try {
                            return (
                              domain?.name &&
                              typeof domain.name === 'string' &&
                              domain.name
                                .toLowerCase()
                                .includes((searchQuery || '').toLowerCase())
                            );
                          } catch (error) {
                            console.error(
                              'Error filtering domain for add new:',
                              error,
                              domain,
                            );
                            return false;
                          }
                        }).length === 0 && (
                          <div className="p-2">
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => handleAddCustomDomain(searchQuery)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add "{searchQuery}" as new domain
                            </Button>
                          </div>
                        )}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={!tmpDomain}
                    onClick={handleAddDomain}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedDomains.map((domainId) => {
                    const domain = domainOptions.find(
                      (d) => d._id === domainId,
                    );
                    return domain ? (
                      <Badge
                        key={domainId}
                        className="uppercase text-xs font-normal bg-gray-300 flex items-center px-2 py-1"
                      >
                        {domain.name}
                        <button
                          type="button"
                          onClick={() => handleDeleteDomain(domainId)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            </div>

            <Separator />

            {/* Projects Selection */}
            <div>
              <FormLabel>Projects</FormLabel>
              <FormDescription className="mb-3">
                Add your projects or select from existing ones
              </FormDescription>

              {/* Add New Project Form */}
              <div className="border rounded-md p-4 mb-4 bg-muted/50">
                <h4 className="text-sm font-medium mb-3">Add New Project</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Project Name"
                    value={newProject.projectName}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        projectName: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="GitHub Link (optional)"
                    value={newProject.githubLink}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        githubLink: e.target.value,
                      })
                    }
                  />
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={newProject.startDate}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        startDate: e.target.value,
                      })
                    }
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={newProject.endDate}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        endDate: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Live Demo Link (optional)"
                    value={newProject.liveDemoLink}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        liveDemoLink: e.target.value,
                      })
                    }
                    className="md:col-span-2"
                  />
                </div>
                <Textarea
                  placeholder="Project Description"
                  className="mt-3"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                />
                <Button
                  type="button"
                  onClick={handleAddProject}
                  className="mt-3"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </div>

              {/* Selected Projects */}
              <div className="space-y-3">
                {selectedProjects.map((projectId) => {
                  const project = projectOptions.find(
                    (p) => p._id === projectId,
                  );
                  return project ? (
                    <div
                      key={projectId}
                      className="border rounded-lg p-4 bg-background"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {project.projectName}
                          </h4>
                          {project.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                          <div className="flex gap-4 mt-2">
                            {project.githubLink && (
                              <a
                                href={project.githubLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline"
                              >
                                GitHub
                              </a>
                            )}
                            {project.liveDemoLink && (
                              <a
                                href={project.liveDemoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline"
                              >
                                Live Demo
                              </a>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedProjects(
                              selectedProjects.filter((id) => id !== projectId),
                            )
                          }
                          className="ml-2 text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : null;
                })}
                {selectedProjects.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No projects selected. Add new projects above.
                  </p>
                )}
              </div>
            </div>

            {/* Work Experience */}
            <div>
              <FormLabel>Work Experience</FormLabel>
              <FormDescription className="mb-3">
                Add your work experience or select from existing ones
              </FormDescription>

              {/* Add New Experience Form */}
              <div className="border rounded-md p-4 mb-4 bg-muted/50">
                <h4 className="text-sm font-medium mb-3">Add New Experience</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Job Title"
                    value={newExperience.jobTitle}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        jobTitle: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Company Name"
                    value={newExperience.companyName}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        companyName: e.target.value,
                      })
                    }
                  />
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={newExperience.startDate}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        startDate: e.target.value,
                      })
                    }
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={newExperience.endDate}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
                <Textarea
                  placeholder="Job Description"
                  className="mt-3"
                  value={newExperience.description}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      description: e.target.value,
                    })
                  }
                />
                <Button
                  type="button"
                  onClick={handleAddExperience}
                  className="mt-3"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>

              {/* Selected Experiences */}
              <div className="space-y-3">
                {selectedExperiences.map((experienceId) => {
                  const experience = experienceOptions.find(
                    (e) => e._id === experienceId,
                  );
                  return experience ? (
                    <div
                      key={experienceId}
                      className="border rounded-lg p-4 bg-background"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {experience.jobTitle}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {experience.company}
                          </p>
                          {experience.workFrom && experience.workTo && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(
                                experience.workFrom,
                              ).toLocaleDateString()}{' '}
                              -{' '}
                              {new Date(experience.workTo).toLocaleDateString()}
                            </p>
                          )}
                          {experience.workDescription && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {experience.workDescription}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedExperiences(
                              selectedExperiences.filter(
                                (id) => id !== experienceId,
                              ),
                            )
                          }
                          className="ml-2 text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : null;
                })}
                {selectedExperiences.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No work experiences selected. Add new experiences above.
                  </p>
                )}
              </div>
            </div>

            {/* Education */}
            <div>
              <FormLabel>Education</FormLabel>
              <FormDescription className="mb-3">
                Add your education or select from existing ones
              </FormDescription>

              {/* Add New Education Form */}
              <div className="border rounded-md p-4 mb-4 bg-muted/50">
                <h4 className="text-sm font-medium mb-3">Add New Education</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Degree"
                    value={newEducation.degree}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        degree: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="University Name"
                    value={newEducation.universityName}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        universityName: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Field of Study"
                    value={newEducation.fieldOfStudy}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        fieldOfStudy: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Grade/GPA"
                    value={newEducation.grade}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        grade: e.target.value,
                      })
                    }
                  />
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={newEducation.startDate}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        startDate: e.target.value,
                      })
                    }
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={newEducation.endDate}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddEducation}
                  className="mt-3"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </div>

              {/* Selected Education */}
              <div className="flex flex-wrap gap-2">
                {selectedEducation.map((educationId) => {
                  const education = educationOptions.find(
                    (e) => e._id === educationId,
                  );
                  return education ? (
                    <Badge
                      key={educationId}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {education.degree} from {education.universityName}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedEducation(
                            selectedEducation.filter(
                              (id) => id !== educationId,
                            ),
                          )
                        }
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? 'Saving...'
                  : profile
                    ? 'Update Profile'
                    : 'Create Profile'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditProfileDialog;
