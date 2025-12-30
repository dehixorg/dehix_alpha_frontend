import React, { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Sparkles } from 'lucide-react';

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
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import SelectTagPicker from '../shared/SelectTagPicker';

import { notifyError, notifySuccess } from '@/utils/toastMessage';
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
  const [profileType, setProfileType] = useState<'Freelancer' | 'Consultant'>(
    'Freelancer',
  );

  const skillOptions = useMemo(
    () =>
      (skills || []).map((s) => ({
        ...s,
        label: s?.talentName || s?.label || s?.name,
      })),
    [skills],
  );

  const selectedSkillItems = useMemo(
    () => selectedSkills.map((name) => ({ name })),
    [selectedSkills],
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
        notifyError(errorMessage, 'Error');
      } finally {
        setLoadingData(false);
      }
    };

    if (dialogOpen) {
      fetchData();
    }
  }, [dialogOpen]);

  // Handle skill removal
  const handleRemoveSkill = (skillToRemove: string) => {
    const newSkills = selectedSkills.filter((skill) => skill !== skillToRemove);
    setSelectedSkills(newSkills);
    form.setValue('skills', newSkills);
  };

  // Handle skill addition
  const handleAddSkill = (skillToAdd: string) => {
    const next = skillToAdd?.trim();
    if (!next) return;
    if (selectedSkills.includes(next)) return;
    const newSkills = [...selectedSkills, next];
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

      notifySuccess(
        'The profile has been successfully added.',
        'Profile Added',
      );

      form.reset();
      setSelectedSkills([]);
      setDialogOpen(false);
      onProfileAdded();
    } catch (error: any) {
      notifyError(
        error.response?.data?.message ||
          error.message ||
          'Failed to add profile.',
        'Error',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex h-full max-h-[90vh] flex-col"
          >
            <div className="sticky top-0 border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:p-5">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-base sm:text-lg font-semibold">
                  Add New Profile
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Add a new profile to this project with specific requirements.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4">
                <Tabs
                  value={profileType}
                  onValueChange={(val) =>
                    setProfileType(val as 'Freelancer' | 'Consultant')
                  }
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="Freelancer">Freelancer</TabsTrigger>
                    <TabsTrigger value="Consultant">Consultant</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="grid gap-6 p-4 sm:p-5 md:grid-cols-[1fr_240px]">
                <div className="space-y-5">
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
                                <SelectItem
                                  key={domain._id}
                                  value={domain.label}
                                >
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

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="freelancersRequired"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`Number of ${profileType}s`}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g. 2"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience (years)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g. 3"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Skills Required</FormLabel>
                    <SelectTagPicker
                      label=""
                      options={skillOptions}
                      selected={selectedSkillItems}
                      onAdd={handleAddSkill}
                      onRemove={handleRemoveSkill}
                      optionLabelKey="label"
                      selectedNameKey="name"
                      selectPlaceholder={
                        loadingData ? 'Loading skills...' : 'Select skills'
                      }
                      searchPlaceholder="Search skills"
                      className="[&>label]:sr-only"
                    />

                    {form.formState.isSubmitted &&
                      selectedSkills.length === 0 && (
                        <p className="text-sm text-destructive">
                          At least one skill is required
                        </p>
                      )}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="minConnect"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Connects</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g. 10"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rate</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g. 25"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the requirements for this profile..."
                            className="min-h-[110px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="hidden md:block">
                  <Card className="sticky top-5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                          <Sparkles className="h-4 w-4 text-muted-foreground" />
                        </span>
                        Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-3">
                      <p>
                        Keep this profile short and specific to get better
                        matches.
                      </p>
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">
                          Good profile includes
                        </p>
                        <div className="space-y-1">
                          <p>Domain + role</p>
                          <p>3–6 core skills</p>
                          <p>Experience + rate expectations</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>

            <div className="sticky bottom-0 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:p-5">
              <div className="flex items-center justify-end gap-2">
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
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProfileDialog;
