import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from '../ui/use-toast';

import { axiosInstance } from '@/lib/axiosinstance';

// Profile form schema
const profileFormSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  freelancersRequired: z.string().min(1, 'Number of freelancers is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  experience: z.string().min(1, 'Experience is required'),
  minConnect: z.string().min(1, 'Minimum connects is required'),
  rate: z.string().min(1, 'Rate is required'),
  description: z.string().min(1, 'Description is required'),
  domain_id: z.string().min(1, 'Domain ID is required'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface AddProfileDialogProps {
  projectId: string;
  onProfileAdded: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AddProfileDialog: React.FC<AddProfileDialogProps> = ({
  projectId,
  onProfileAdded,
  trigger,
  open,
  onOpenChange,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Use external open state if provided, otherwise use internal state
  const dialogOpen = open !== undefined ? open : isDialogOpen;
  const setDialogOpen = onOpenChange || setIsDialogOpen;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [domains, setDomains] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [profileType, setProfileType] = useState<'Freelancer' | 'Consultant'>(
    'Freelancer',
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      domain: '',
      freelancersRequired: '',
      skills: [],
      experience: '',
      minConnect: '',
      rate: '',
      description: '',
      domain_id: '',
    },
    mode: 'onChange',
  });

  // Fetch domains and skills on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [domainsResponse, skillsResponse] = await Promise.all([
          axiosInstance.get('/domain'),
          axiosInstance.get('/skills'),
        ]);

        const domainsData = domainsResponse.data.data || [];
        const skillsData = skillsResponse.data.data || [];

        setDomains(domainsData);
        setSkills(skillsData);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to load domains and skills.';
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        });
      } finally {
        setLoadingData(false);
      }
    };

    if (dialogOpen) {
      fetchData();
    }
  }, [dialogOpen]);

  // Handle skill addition
  const handleAddSkill = () => {
    if (skillInput.trim() && !selectedSkills.includes(skillInput.trim())) {
      const newSkills = [...selectedSkills, skillInput.trim()];
      setSelectedSkills(newSkills);
      form.setValue('skills', newSkills);
      setSkillInput('');
    }
  };

  // Handle skill removal
  const handleRemoveSkill = (skillToRemove: string) => {
    const newSkills = selectedSkills.filter((skill) => skill !== skillToRemove);
    setSelectedSkills(newSkills);
    form.setValue('skills', newSkills);
  };

  // Handle domain selection
  const handleDomainChange = (domainLabel: string) => {
    const selectedDomain = domains.find((d) => d.label === domainLabel);
    if (selectedDomain) {
      form.setValue('domain', selectedDomain.label);
      form.setValue('domain_id', selectedDomain._id);
    }
  };

  // Submit handler
  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true);
    try {
      const projectResponse = await axiosInstance.get(`/project/${projectId}`);
      const currentProject =
        projectResponse?.data?.data?.data || projectResponse?.data?.data;

      if (!currentProject) throw new Error('Project not found');

      const newProfile: any = {
        _id: crypto.randomUUID(),
        domain: data.domain,
        domain_id: data.domain_id,
        description: data.description,
        skills: selectedSkills,
        experience: parseInt(data.experience),
        profileType: profileType.toUpperCase(),
        selectedFreelancer: [],
        freelancers: [],
        totalBid: [],
      };

      if (profileType === 'Freelancer') {
        newProfile.freelancersRequired = data.freelancersRequired
          ? parseInt(data.freelancersRequired)
          : 0;
        newProfile.minConnect = data.minConnect ? parseInt(data.minConnect) : 0;
        newProfile.rate = data.rate ? parseInt(data.rate) : 0;
      } else {
        newProfile.consultantRequired = data.freelancersRequired
          ? parseInt(data.freelancersRequired)
          : 0;
        newProfile.rate = data.rate ? parseInt(data.rate) : 0;
        newProfile.selectedConsultant = [];
        newProfile.consultants = [];
      }
      const updatedProfiles = [...(currentProject.profiles || []), newProfile];

      const updatePayload: any = {
        projectName: currentProject.projectName,
        description: currentProject.description,
        email: currentProject.email,
        companyName: currentProject.companyName,
        skillsRequired: currentProject.skillsRequired,
        role: currentProject.role || '',
        projectType: currentProject.projectType,
        profiles: updatedProfiles,
      };
      if (currentProject.end) updatePayload.end = currentProject.end;

      await axiosInstance.put(`/project/${projectId}/update`, updatePayload);

      toast({
        title: 'Profile Added',
        description: 'The profile has been successfully added.',
      });

      form.reset();
      setSelectedSkills([]);
      setSkillInput('');
      setDialogOpen(false);
      onProfileAdded();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message ||
          error.message ||
          'Failed to add profile.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-col gap-4">
          {/* Title and Description (left-aligned) */}
          <div>
            <DialogTitle className="text-lg font-semibold">
              Add New Profile
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Add a new profile to this project with specific requirements.
            </DialogDescription>
          </div>

          {/* Profile Type Toggle (centered with gap from top) */}
          <div className="flex justify-center items-center gap-3 mt-2">
            <span
              className={
                profileType === 'Freelancer' ? 'font-semibold' : 'text-gray-400'
              }
            >
              Freelancer
            </span>

            <button
              type="button"
              onClick={() =>
                setProfileType((prev) =>
                  prev === 'Freelancer' ? 'Consultant' : 'Freelancer',
                )
              }
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${
                profileType === 'Freelancer' ? 'bg-green-500' : 'bg-blue-500'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                  profileType === 'Consultant'
                    ? 'translate-x-7'
                    : 'translate-x-1'
                }`}
              />
            </button>

            <span
              className={
                profileType === 'Consultant' ? 'font-semibold' : 'text-gray-400'
              }
            >
              Consultant
            </span>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Domain */}
            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Domain</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={handleDomainChange}
                      value={field.value}
                      disabled={loadingData}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingData
                              ? 'Loading domains...'
                              : 'Select a domain'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {domains.map((domain) => (
                          <SelectItem key={domain._id} value={domain.label}>
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

            {/* Freelancers Required */}
            <FormField
              control={form.control}
              name="freelancersRequired"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{`Number of ${profileType}s Required`}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter number of freelancers"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Skills */}
            <div className="space-y-2">
              <FormLabel>Skills Required</FormLabel>
              <div className="flex gap-2">
                <Select
                  onValueChange={setSkillInput}
                  value={skillInput}
                  disabled={loadingData}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue
                      placeholder={
                        loadingData ? 'Loading skills...' : 'Select a skill'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {skills.map((skill) => (
                      <SelectItem
                        key={skill._id}
                        value={skill.talentName || skill.label}
                      >
                        {skill.talentName || skill.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={!skillInput}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {skill}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => handleRemoveSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
              {form.formState.isSubmitted && selectedSkills.length === 0 && (
                <p className="text-sm text-red-500">
                  At least one skill is required
                </p>
              )}
            </div>

            {/* Experience */}
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Required (years)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter years of experience"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Minimum Connects */}
            <FormField
              control={form.control}
              name="minConnect"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Connects Required</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter minimum connects"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rate */}
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate (per hour/project)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter rate" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the requirements for this profile..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || selectedSkills.length === 0}
              >
                {loading ? 'Adding...' : 'Add Profile'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProfileDialog;
