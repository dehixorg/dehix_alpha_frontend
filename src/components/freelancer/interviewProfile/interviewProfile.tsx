import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';

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

interface Skill {
  label: string;
}

interface Domain {
  label: string;
}

interface SkillData {
  name: string;
  experience: number;
  level: string;
  interviewStatus: string;
}

interface DomainData {
  name: string;
  experience: number;
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

interface SkillFormData {
  skill: string;
  experience: number;
  level: string;
}

interface DomainFormData {
  domain: string;
  experience: number;
  level: string;
}

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

  useEffect(() => {
    async function fetchData() {
      setLoading(true); // Set loading to true when fetching data
      try {
        const skillsResponse = await axiosInstance.get('/skills/all');
        setSkills(skillsResponse.data.data);

        const domainsResponse = await axiosInstance.get('/domain/all');
        setDomains(domainsResponse.data.data);

        // Fetch freelancer-specific skill and domain data
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
        setLoading(false); // Set loading to false after fetching
      }
    }
    fetchData();
  }, [freelancerId]);

  const {
    handleSubmit: handleSubmitSkill,
    formState: { errors: skillErrors },
    control: controlSkill, // Control for skills form
    reset: resetSkill,
  } = useForm<SkillFormData>({
    resolver: zodResolver(SkillSchema),
  });

  const {
    handleSubmit: handleSubmitDomain,
    formState: { errors: domainErrors },
    control: controlDomain, // Control for domain form
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
      console.log('Skill data:', data);
      setSkillData([
        ...skillData,
        {
          name: data.skill,
          experience: data.experience,
          level: data.level,
          interviewStatus: defaultStatus,
        },
      ]);
      resetSkill();
      setOpenSkillDialog(false);
      toast({
        title: 'Skill Added',
        description: `${data.skill} skill added successfully.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitDomain = (data: DomainFormData) => {
    setLoading(true);
    try {
      console.log('Domain data:', data);
      setDomainData([
        ...domainData,
        {
          name: data.domain,
          experience: data.experience,
          level: data.level,
          interviewStatus: defaultStatus,
        },
      ]);
      resetDomain();
      setOpenDomainDialog(false);
      toast({
        title: 'Domain Added',
        description: `${data.domain} domain added successfully.`,
      });
    } finally {
      setLoading(false);
    }
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
                  <DialogTitle>Add Skill</DialogTitle>
                  <DialogDescription>
                    Select a skill, level, and enter your experience.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitSkill(onSubmitSkill)}>
                  <Controller
                    name="skill"
                    control={controlSkill} // Correctly use `control` for `skill`
                    render={({ field }) => (
                      <Select
                        {...field}
                        onValueChange={(value) => field.onChange(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a skill" />
                        </SelectTrigger>
                        <SelectContent>
                          {skills.map((skill) => (
                            <SelectItem key={skill.label} value={skill.label}>
                              {skill.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {skillErrors.skill && (
                    <p className="text-red-500">{skillErrors.skill.message}</p>
                  )}
                  <div className="mt-2">
                    <Controller
                      name="level"
                      control={controlSkill} // Correctly use `control` for `level`
                      render={({ field }) => (
                        <Select
                          {...field}
                          onValueChange={(value) => field.onChange(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {levels.map((lvl) => (
                              <SelectItem key={lvl} value={lvl}>
                                {lvl}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {skillErrors.level && (
                      <p className="text-red-500">
                        {skillErrors.level.message}
                      </p>
                    )}
                  </div>
                  <div className="mt-2">
                    <Controller
                      name="experience"
                      control={controlSkill} // Correctly use `control` for `experience`
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          placeholder="Experience"
                        />
                      )}
                    />
                    {skillErrors.experience && (
                      <p className="text-red-500">
                        {skillErrors.experience.message}
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit">Add Skill</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Skill</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Level</TableHead>
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
                  : skillData.map((item, index) => (
                      <TableRow key={index}>
                        {/* Ensure you're rendering specific fields from the object */}
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <Badge
                            className={getBadgeColor(item.interviewStatus)}
                          >
                            {item.interviewStatus.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {typeof item.experience === 'number' &&
                          !isNaN(item.experience)
                            ? `${item.experience} years`
                            : null}
                        </TableCell>
                        <TableCell>{item.level}</TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </Card>
        </div>

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
                  <DialogTitle>Add Domain</DialogTitle>
                  <DialogDescription>
                    Select a domain, level, and enter your experience.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitDomain(onSubmitDomain)}>
                  <Controller
                    name="domain"
                    control={controlDomain} // Correctly use `control` for `domain`
                    render={({ field }) => (
                      <Select
                        {...field}
                        onValueChange={(value) => field.onChange(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {domains.map((domain) => (
                            <SelectItem key={domain.label} value={domain.label}>
                              {domain.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {domainErrors.domain && (
                    <p className="text-red-500">
                      {domainErrors.domain.message}
                    </p>
                  )}
                  <div className="mt-2">
                    <Controller
                      name="level"
                      control={controlDomain} // Correctly use `control` for `level`
                      render={({ field }) => (
                        <Select
                          {...field}
                          onValueChange={(value) => field.onChange(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {levels.map((lvl) => (
                              <SelectItem key={lvl} value={lvl}>
                                {lvl}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {domainErrors.level && (
                      <p className="text-red-500">
                        {domainErrors.level.message}
                      </p>
                    )}
                  </div>
                  <div className="mt-2">
                    <Controller
                      name="experience"
                      control={controlDomain} // Correctly use `control` for `experience`
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          placeholder="Experience"
                        />
                      )}
                    />
                    {domainErrors.experience && (
                      <p className="text-red-500">
                        {domainErrors.experience.message}
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit">Add Domain</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Level</TableHead>
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
                  : domainData.map((item, index) => (
                      <TableRow key={index}>
                        {/* Ensure you're rendering specific fields from the object */}
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <Badge
                            className={getBadgeColor(item.interviewStatus)}
                          >
                            {item.interviewStatus.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {typeof item.experience === 'number' &&
                          !isNaN(item.experience)
                            ? `${item.experience} years`
                            : null}{' '}
                        </TableCell>
                        <TableCell>{item.level}</TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewProfile;
