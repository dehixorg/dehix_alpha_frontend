import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2 } from 'lucide-react';

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
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ButtonIcon } from '@/components/shared/buttonIcon';
import DomainDialog from '@/components/dialogs/domainDialog';
import SkillDialog from '@/components/dialogs/skillDialog';

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
  experience: z.preprocess(
    (val) => parseFloat(val as string),
    z
      .number()
      .min(0, 'Experience must be a non-negative number')
      .max(50, "Experience can't exceed 50"),
  ),
  level: z.string().min(1, 'Level is required'),
});

const DomainSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  experience: z.preprocess(
    (val) => parseFloat(val as string),
    z
      .number()
      .min(0, 'Experience must be a non-negative number')
      .max(50, "Experience can't exceed 50"),
  ),
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

  const onSubmitSkill = async (data: SkillFormData) => {
    setLoading(true);
    try {
      if (editingSkill) {
        // Update existing skill using API
        const updatedSkill = {
          ...editingSkill,
          ...data,
          interviewStatus: defaultStatus,
        };

        const response = await axiosInstance.put(
          `/freelancer/${freelancerId}/skill`,
          updatedSkill,
        );

        if (response.status === 200) {
          // After a successful response (status 200), update local state
          const updatedSkills = skillData.map((item) =>
            item._id === editingSkill._id ? { ...item, ...updatedSkill } : item,
          );
          setSkillData(updatedSkills);

          toast({
            title: 'Skill Updated',
            description: `${data.name} skill updated successfully.`,
          });
        } else {
          // Handle non-200 responses (optional)
          throw new Error('Failed to update skill');
        }
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

  const onSubmitDomain = async (data: DomainFormData) => {
    setLoading(true);
    try {
      if (editingDomain) {
        // Update existing domain using API
        const updatedDomain = {
          ...editingDomain,
          ...data,
        };

        const response = await axiosInstance.put(
          `/freelancer/${freelancerId}/domain`,
          updatedDomain,
        );

        if (response.status === 200) {
          // After a successful response (status 200), update local state
          const updatedDomains = domainData.map((item) =>
            item._id === editingDomain._id
              ? { ...item, ...updatedDomain }
              : item,
          );
          setDomainData(updatedDomains);

          toast({
            title: 'Domain Updated',
            description: `${data.name} domain updated successfully.`,
          });
        } else {
          // Handle non-200 responses (optional)
          throw new Error('Failed to update domain');
        }
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
            <Button
              onClick={() => {
                setEditingSkill(null);
                setOpenSkillDialog(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Skill
            </Button>
            <SkillDialog
              open={openSkillDialog}
              onClose={() => setOpenSkillDialog(false)}
              onSubmit={onSubmitSkill}
              skillOptions={skills}
              levels={levels}
              defaultValues={editingSkill || undefined}
              loading={loading}
            />
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
                      <TableCell>
                        {skill.experience.length > 0
                          ? skill.experience + 'years'
                          : ''}
                      </TableCell>
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
            <Button
              onClick={() => {
                setEditingDomain(null);
                setOpenDomainDialog(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Domain
            </Button>
            <DomainDialog
              open={openDomainDialog}
              onClose={() => setOpenDomainDialog(false)}
              onSubmit={onSubmitDomain}
              domainOptions={domains}
              levels={levels}
              defaultValues={editingDomain || undefined}
              loading={loading}
            />
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
                      <TableCell>
                        {domain.experience.length > 0
                          ? domain.experience + 'years'
                          : ''}
                      </TableCell>
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
