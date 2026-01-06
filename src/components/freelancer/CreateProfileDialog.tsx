'use client';

import React, { useEffect } from 'react';
import {
  Award,
  Briefcase,
  DollarSign,
  Github,
  Globe,
  Layers,
  Linkedin,
  Plus,
  User,
  UserCog,
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import SelectTagPicker from '@/components/shared/SelectTagPicker';
import ProjectSelectionDialog from '@/components/dialogs/ProjectSelectionDialog';
import ExperienceSelectionDialog from '@/components/dialogs/ExperienceSelectionDialog';

export type CreateProfileDialogProfileType = 'Freelancer' | 'Consultant';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  profileType: CreateProfileDialogProfileType;

  newProfileName: string;
  setNewProfileName: (value: string) => void;
  newProfileDescription: string;
  setNewProfileDescription: (value: string) => void;
  newProfileHourlyRate: number;
  setNewProfileHourlyRate: (value: number) => void;
  newProfileGithubLink: string;
  setNewProfileGithubLink: (value: string) => void;
  newProfileLinkedinLink: string;
  setNewProfileLinkedinLink: (value: string) => void;
  newProfilePersonalWebsite: string;
  setNewProfilePersonalWebsite: (value: string) => void;
  newProfileAvailability: string;
  setNewProfileAvailability: (value: string) => void;

  skillsOptions: any[];
  domainsOptions: any[];
  newProfileSkills: any[];
  setNewProfileSkills: (value: any[]) => void;
  newProfileDomains: any[];
  setNewProfileDomains: (value: any[]) => void;

  newProfileProjects: any[];
  newProfileExperiences: any[];
  setShowProjectDialog: (value: boolean) => void;
  setShowExperienceDialog: (value: boolean) => void;

  onCreate: () => void;
  onCancel: () => void;

  showProjectDialog: boolean;
  onProjectDialogOpenChange: (open: boolean) => void;
  freelancerId?: string;
  onProjectsSelected: (selected: any[]) => void;

  showExperienceDialog: boolean;
  onExperienceDialogOpenChange: (open: boolean) => void;
  onExperiencesSelected: (selected: any[]) => void;
};

const linkedInRegex =
  /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
const websiteRegex =
  /^https?:\/\/(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?(\/.*)?$/;

const createProfileSchema = z.object({
  profileName: z.string().trim().min(1, 'Profile name is required'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters long'),
  hourlyRate: z
    .number({ invalid_type_error: 'Hourly rate must be a number' })
    .min(0, 'Hourly rate must be 0 or greater'),
  githubLink: z.string().trim().optional(),
  linkedinLink: z
    .string()
    .trim()
    .min(1, 'LinkedIn profile URL is required')
    .regex(
      linkedInRegex,
      'Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)',
    ),
  personalWebsite: z
    .string()
    .trim()
    .min(1, 'Personal website URL is required')
    .regex(
      websiteRegex,
      'Please enter a valid website URL (e.g., https://example.com)',
    ),
  availability: z.string().min(1, 'Availability is required'),
});

type CreateProfileValues = z.infer<typeof createProfileSchema>;

export default function CreateProfileDialog({
  open,
  onOpenChange,
  profileType,
  newProfileName,
  setNewProfileName,
  newProfileDescription,
  setNewProfileDescription,
  newProfileHourlyRate,
  setNewProfileHourlyRate,
  newProfileGithubLink,
  setNewProfileGithubLink,
  newProfileLinkedinLink,
  setNewProfileLinkedinLink,
  newProfilePersonalWebsite,
  setNewProfilePersonalWebsite,
  newProfileAvailability,
  setNewProfileAvailability,
  skillsOptions,
  domainsOptions,
  newProfileSkills,
  setNewProfileSkills,
  newProfileDomains,
  setNewProfileDomains,
  newProfileProjects,
  newProfileExperiences,
  setShowProjectDialog,
  setShowExperienceDialog,
  onCreate,
  onCancel,
  showProjectDialog,
  onProjectDialogOpenChange,
  freelancerId,
  onProjectsSelected,
  showExperienceDialog,
  onExperienceDialogOpenChange,
  onExperiencesSelected,
}: Props) {
  const form = useForm<CreateProfileValues>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      profileName: newProfileName,
      description: newProfileDescription,
      hourlyRate: newProfileHourlyRate ?? 0,
      githubLink: newProfileGithubLink,
      linkedinLink: newProfileLinkedinLink,
      personalWebsite: newProfilePersonalWebsite,
      availability: newProfileAvailability,
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      profileName: newProfileName,
      description: newProfileDescription,
      hourlyRate: newProfileHourlyRate ?? 0,
      githubLink: newProfileGithubLink,
      linkedinLink: newProfileLinkedinLink,
      personalWebsite: newProfilePersonalWebsite,
      availability: newProfileAvailability,
    });
  }, [
    open,
    form,
    newProfileName,
    newProfileDescription,
    newProfileHourlyRate,
    newProfileGithubLink,
    newProfileLinkedinLink,
    newProfilePersonalWebsite,
    newProfileAvailability,
  ]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New {profileType} Profile</DialogTitle>
            <DialogDescription>
              Fill in all the details for your new professional profile.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(() => {
                onCreate();
              })}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="profileName"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="profile-name">Profile Name</Label>
                    <FormControl>
                      <InputGroup>
                        <InputGroupText>
                          <User className="h-4 w-4" />
                        </InputGroupText>
                        <InputGroupInput
                          id="profile-name"
                          placeholder="e.g., Frontend Developer, Backend Engineer"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            setNewProfileName(e.target.value);
                          }}
                        />
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="profile-description">Description</Label>
                    <FormControl>
                      <Textarea
                        id="profile-description"
                        placeholder="Describe your expertise and experience in this area... (minimum 10 characters)"
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e);
                          setNewProfileDescription(e.target.value);
                        }}
                        rows={4}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      {String(field.value || '').length}/500 characters
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <Label
                      htmlFor="hourly-rate"
                      className="flex items-center gap-2"
                    >
                      Hourly Rate
                    </Label>
                    <FormControl>
                      <InputGroup>
                        <InputGroupText>
                          <DollarSign className="h-4 w-4" />
                        </InputGroupText>
                        <InputGroupInput
                          id="hourly-rate"
                          type="number"
                          min={0}
                          step={1}
                          placeholder="50"
                          value={String(field.value ?? '')}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            field.onChange(value);
                            setNewProfileHourlyRate(value);
                          }}
                        />
                        <InputGroupText>/hr</InputGroupText>
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Award className="h-4 w-4" /> Skills
                  </Label>
                  <SelectTagPicker
                    label=""
                    options={skillsOptions}
                    selected={newProfileSkills.map((skill: any) => ({
                      name: skill?.label || skill?.name || '',
                      interviewerStatus:
                        skill?.interviewerStatus || 'NOT_APPLIED',
                    }))}
                    onAdd={(value: string) => {
                      const selectedSkill = skillsOptions.find(
                        (s: any) => (s.label || s.name) === value,
                      );
                      if (
                        selectedSkill &&
                        !newProfileSkills.some(
                          (s: any) => s._id === selectedSkill._id,
                        )
                      ) {
                        setNewProfileSkills([
                          ...newProfileSkills,
                          {
                            ...selectedSkill,
                            interviewerStatus: 'NOT_APPLIED',
                          },
                        ]);
                      }
                    }}
                    optionLabelKey="label"
                    selectedNameKey="name"
                    selectPlaceholder="Select skill"
                    searchPlaceholder="Search skills..."
                    hideRemoveButtonInSettings={true}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Layers className="h-4 w-4" /> Domains
                  </Label>
                  <SelectTagPicker
                    label=""
                    options={domainsOptions}
                    selected={newProfileDomains.map((domain: any) => ({
                      name: domain?.label || domain?.name || '',
                      interviewerStatus:
                        domain?.interviewerStatus || 'NOT_APPLIED',
                    }))}
                    onAdd={(value: string) => {
                      const selectedDomain = domainsOptions.find(
                        (d: any) => (d.label || d.name) === value,
                      );
                      if (
                        selectedDomain &&
                        !newProfileDomains.some(
                          (d: any) => d._id === selectedDomain._id,
                        )
                      ) {
                        setNewProfileDomains([
                          ...newProfileDomains,
                          {
                            ...selectedDomain,
                            interviewerStatus: 'NOT_APPLIED',
                          },
                        ]);
                      }
                    }}
                    optionLabelKey="label"
                    selectedNameKey="name"
                    selectPlaceholder="Select domain"
                    searchPlaceholder="Search domains..."
                    hideRemoveButtonInSettings={true}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Projects
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowProjectDialog(true)}
                    className="w-full justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {newProfileProjects.length > 0
                      ? `${newProfileProjects.length} project(s) selected`
                      : 'Add Projects'}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Experiences
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowExperienceDialog(true)}
                    className="w-full justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {newProfileExperiences.length > 0
                      ? `${newProfileExperiences.length} experience(s) selected`
                      : 'Add Experiences'}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="github-link"
                    className="flex items-center gap-2"
                  >
                    GitHub
                  </Label>
                  <FormField
                    control={form.control}
                    name="githubLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputGroup>
                            <InputGroupText>
                              <Github className="h-4 w-4" />
                            </InputGroupText>
                            <InputGroupInput
                              id="github-link"
                              placeholder="https://github.com/username"
                              value={field.value || ''}
                              onChange={(e) => {
                                field.onChange(e);
                                setNewProfileGithubLink(e.target.value);
                              }}
                            />
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="linkedin-link"
                    className="flex items-center gap-2"
                  >
                    LinkedIn
                  </Label>
                  <FormField
                    control={form.control}
                    name="linkedinLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputGroup>
                            <InputGroupText>
                              <Linkedin className="h-4 w-4" />
                            </InputGroupText>
                            <InputGroupInput
                              id="linkedin-link"
                              placeholder="https://linkedin.com/in/username"
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e);
                                setNewProfileLinkedinLink(e.target.value);
                              }}
                            />
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personal-website"> Website</Label>
                  <FormField
                    control={form.control}
                    name="personalWebsite"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputGroup>
                            <InputGroupText>
                              <Globe className="h-4 w-4" />
                            </InputGroupText>
                            <InputGroupInput
                              id="personal-website"
                              placeholder="https://yourwebsite.com"
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e);
                                setNewProfilePersonalWebsite(e.target.value);
                              }}
                            />
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2 mt-2">
                  <Label
                    htmlFor="availability"
                    className="flex items-center gap-2"
                  >
                    <UserCog className="h-4 w-4" /> Availability
                  </Label>
                  <FormField
                    control={form.control}
                    name="availability"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              setNewProfileAvailability(value);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select availability" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="FULL_TIME">
                                Full Time
                              </SelectItem>
                              <SelectItem value="PART_TIME">
                                Part Time
                              </SelectItem>
                              <SelectItem value="CONTRACT">Contract</SelectItem>
                              <SelectItem value="FREELANCE">
                                Freelance
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    form.reset();
                    onCancel();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Profile</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {showProjectDialog && freelancerId && (
        <ProjectSelectionDialog
          open={showProjectDialog}
          onOpenChange={onProjectDialogOpenChange}
          freelancerId={freelancerId!}
          currentProfileId="new"
          onSuccess={(selected) => {
            onProjectsSelected(selected);
            onProjectDialogOpenChange(false);
          }}
        />
      )}

      {showExperienceDialog && freelancerId && (
        <ExperienceSelectionDialog
          open={showExperienceDialog}
          onOpenChange={onExperienceDialogOpenChange}
          freelancerId={freelancerId!}
          currentProfileId="new"
          onSuccess={(selected) => {
            onExperiencesSelected(selected);
            onExperienceDialogOpenChange(false);
          }}
        />
      )}
    </>
  );
}
