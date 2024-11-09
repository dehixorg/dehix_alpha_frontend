import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Edit2 } from 'lucide-react';

import { toast } from '../../ui/use-toast';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { axiosInstance } from '@/lib/axiosinstance';
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ButtonIcon } from '@/components/shared/buttonIcon';

interface Skill {
  label: string;
}

interface Domain {
  label: string;
}
interface SkillFormData {
  name: string;
  experience: string;
  level: string;
}

interface DomainFormData {
  name: string;
  experience: string;
  level: string;
}

interface SkillData {
  _id?: string;
  name: string;
  experience: string;
  level: string;
  interviewStatus: string;
}

interface DomainData {
  _id?: string;
  name: string;
  experience: string;
  level: string;
  interviewStatus: string;
}

const levels = ['Mastery', 'Proficient', 'Beginner'];
const defaultStatus = 'Pending';

const SkillSchema = z.object({
  skill: z.string().min(1, 'Skill is required'),
  experience: z
    .number()
    .min(0, 'Experience must be a non-negative number')
    .max(50, "Experience can't exceed 50"),
  level: z.string().min(1, 'Level is required'),
});

const DomainSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  experience: z
    .number()
    .min(0, 'Experience must be a non-negative number')
    .max(50, "Experience can't exceeds 50"),
  level: z.string().min(1, 'Level is required'),
});

const InterviewProfile: React.FC<{ freelancerId: string }> = ({
  freelancerId,
}) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [skillData, setSkillData] = useState<SkillData[]>([]);
  const [domainData, setDomainData] = useState<DomainData[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const [openSkillDialog, setOpenSkillDialog] = useState(false);
  const [openDomainDialog, setOpenDomainDialog] = useState(false);

  const [editingSkill, setEditingSkill] = useState<SkillData | null>(null);
  const [editingDomain, setEditingDomain] = useState<DomainData | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const skillsResponse = await axiosInstance.get('/skills/all');
        setSkills(skillsResponse.data.data);

        const domainsResponse = await axiosInstance.get('/domain/all');
        setDomains(domainsResponse.data.data);

        const freelancerSkillsResponse = await axiosInstance.get(
          `/freelancer/${freelancerId}/skill`,
        );
        setSkillData(freelancerSkillsResponse.data.data[0].skills);

        const freelancerDomainsResponse = await axiosInstance.get(
          `/freelancer/${freelancerId}/domain`,
        );
        setDomainData(freelancerDomainsResponse.data.data[0].domain);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch data. Please try again later.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [freelancerId]);

  const {
    handleSubmit: handleSubmitSkill,
    formState: { errors: skillErrors },
    control: controlSkill,
    reset: resetSkill,
  } = useForm<SkillFormData>({
    resolver: zodResolver(SkillSchema),
  });

  const {
    handleSubmit: handleSubmitDomain,
    formState: { errors: domainErrors },
    control: controlDomain,
    reset: resetDomain,
  } = useForm<DomainFormData>({
    resolver: zodResolver(DomainSchema),
  });

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const onSubmitSkill = (data: SkillFormData) => {
    setLoading(true);
    try {
      if (editingSkill) {
        // Update existing skill
        const updatedSkills = skillData.map((item) =>
          item._id === editingSkill._id
            ? { ...item, ...data, interviewStatus: defaultStatus }
            : item,
        );
        setSkillData(updatedSkills);
        toast({
          title: 'Skill Updated',
          description: `${data.name} skill updated successfully.`,
        });
      } else {
        // Add new skill
        setSkillData([
          ...skillData,
          {
            name: data.name,
            experience: data.experience,
            level: data.level,
            interviewStatus: defaultStatus,
          },
        ]);
        toast({
          title: 'Skill Added',
          description: `${data.name} skill added successfully.`,
        });
      }
      resetSkill();
      setOpenSkillDialog(false);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitDomain = (data: DomainFormData) => {
    setLoading(true);
    try {
      if (editingDomain) {
        // Update existing domain
        const updatedDomains = domainData.map((item) =>
          item._id === editingDomain._id
            ? { ...item, ...data, interviewStatus: defaultStatus }
            : item,
        );
        setDomainData(updatedDomains);
        toast({
          title: 'Domain Updated',
          description: `${data.name} domain updated successfully.`,
        });
      } else {
        // Add new domain
        setDomainData([
          ...domainData,
          {
            name: data.name,
            experience: data.experience,
            level: data.level,
            interviewStatus: defaultStatus,
          },
        ]);
        toast({
          title: 'Domain Added',
          description: `${data.name} domain added successfully.`,
        });
      }
      resetDomain();
      setOpenDomainDialog(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSkill = (skill: SkillData) => {
    setEditingSkill(skill);
    setOpenSkillDialog(true);
  };

  const handleEditDomain = (domain: DomainData) => {
    setEditingDomain(domain);
    setOpenDomainDialog(true);
  };

  return (
    <div className="p-6">
      <div className="mb-8 ml-5">
        <h1 className="text-3xl font-bold">Interview Profile</h1>
        <p className="text-gray-400 mt-2">
          Manage and track your skills and domains. Add new skills or domains
          and provide your experience levels.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 p-2 sm:px-6 sm:py-0 md:gap-8 lg:flex-row xl:flex-row pt-2 pl-4 sm:pt-4 sm:pl-6 md:pt-6 md:pl-8">
        {/* Skills Table */}
        <div className="mb-8 w-full sm:w-1/2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Skills</h2>
            <Dialog open={openSkillDialog} onOpenChange={setOpenSkillDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Skill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingSkill ? 'Edit Skill' : 'Add Skill'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingSkill
                      ? 'Update your skill information.'
                      : 'Select a skill and provide your experience and level.'}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmitSkill(onSubmitSkill)}>
                  <div className="space-y-4">
                    <div>
                      <Controller
                        control={controlSkill}
                        name="name"
                        render={({ field }) => (
                          <Select {...field}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a skill" />
                            </SelectTrigger>
                            <SelectContent>
                              {skills.map((skill, idx) => (
                                <SelectItem key={idx} value={skill.label}>
                                  {skill.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div>
                      <Controller
                        control={controlSkill}
                        name="experience"
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            placeholder="Years of experience"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <Controller
                        control={controlSkill}
                        name="level"
                        render={({ field }) => (
                          <Select {...field}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              {levels.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto"
                    >
                      {editingSkill ? 'Update' : 'Add'} Skill
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? [...Array(4)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : skillData.map((skill) => (
                    <TableRow key={skill._id}>
                      <TableCell>{skill.name}</TableCell>
                      <TableCell>{skill.level}</TableCell>
                      <TableCell>{skill.experience} years</TableCell>
                      <TableCell>
                        <Badge className={getBadgeColor(skill.interviewStatus)}>
                          {skill.interviewStatus.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ButtonIcon
                          icon={<Edit2 className="w-4 h-4" />}
                          onClick={() => handleEditSkill(skill)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>

        {/* Domain Table */}
        <div className="mb-8 w-full sm:w-1/2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Domains</h2>
            <Dialog open={openDomainDialog} onOpenChange={setOpenDomainDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Domain
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingDomain ? 'Edit Domain' : 'Add Domain'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingDomain
                      ? 'Update your domain information.'
                      : 'Select a domain and provide your experience and level.'}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmitDomain(onSubmitDomain)}>
                  <div className="space-y-4">
                    <div>
                      <Controller
                        control={controlDomain}
                        name="name"
                        render={({ field }) => (
                          <Select {...field}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a domain" />
                            </SelectTrigger>
                            <SelectContent>
                              {domains.map((domain, idx) => (
                                <SelectItem key={idx} value={domain.label}>
                                  {domain.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div>
                      <Controller
                        control={controlDomain}
                        name="experience"
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            placeholder="Years of experience"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <Controller
                        control={controlDomain}
                        name="level"
                        render={({ field }) => (
                          <Select {...field}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              {levels.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto"
                    >
                      {editingDomain ? 'Update' : 'Add'} Domain
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? [...Array(4)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : domainData.map((domain) => (
                    <TableRow key={domain._id}>
                      <TableCell>{domain.name}</TableCell>
                      <TableCell>{domain.level}</TableCell>
                      <TableCell>{domain.experience} years</TableCell>
                      <TableCell>
                        <Badge
                          className={getBadgeColor(domain.interviewStatus)}
                        >
                          {domain.interviewStatus.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ButtonIcon
                          icon={<Edit2 className="w-4 h-4" />}
                          onClick={() => handleEditDomain(domain)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default InterviewProfile;
