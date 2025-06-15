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
      // Get the current project data first
      const projectResponse = await axiosInstance.get(`/project/${projectId}`);
      const currentProject =
        projectResponse?.data?.data?.data || projectResponse?.data?.data;

      if (!currentProject) {
        throw new Error('Project not found');
      }

      // Create new profile object with a unique ID
      const newProfile = {
        _id: crypto.randomUUID(), // Generate unique ID for the profile
        domain: data.domain,
        freelancersRequired: data.freelancersRequired,
        skills: selectedSkills,
        experience: parseInt(data.experience),
        minConnect: parseInt(data.minConnect),
        rate: parseInt(data.rate),
        description: data.description,
        domain_id: data.domain_id,
        selectedFreelancer: [],
        freelancers: [],
        totalBid: [],
      };

      // Add the new profile to the existing profiles array
      const updatedProfiles = [...(currentProject.profiles || []), newProfile];

      // Use the existing project update endpoint but send only required fields
      const updatePayload = {
        projectName: currentProject.projectName,
        description: currentProject.description,
        email: currentProject.email,
        companyName: currentProject.companyName,
        skillsRequired: currentProject.skillsRequired,
        role: currentProject.role || '',
        projectType: currentProject.projectType,
        // Add profiles to the payload (even though it's not in the schema, MongoDB will accept it)
        profiles: updatedProfiles,
      };

      await axiosInstance.put(`/project/${projectId}/update`, updatePayload);

      toast({
        title: 'Profile Added',
        description: 'The profile has been successfully added to the project.',
      });

      // Reset form and close dialog
      form.reset();
      setSelectedSkills([]);
      setSkillInput('');
      setDialogOpen(false);
      onProfileAdded();
    } catch (error: any) {
      console.error('API Error:', error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to add profile. Please try again.';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Profile</DialogTitle>
          <DialogDescription>
            Add a new profile to this project with specific requirements.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Domain Selection */}
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
                  <FormLabel>Number of Freelancers Required</FormLabel>
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
