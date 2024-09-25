// ProfileComponent.tsx

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, PackageOpen } from 'lucide-react';

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

interface Skill {
  label: string;
}

interface Domain {
  label: string;
}

interface SkillData {
  skill: string;
  experience: number;
  level: string;
  status: string;
}

interface DomainData {
  domain: string;
  experience: number;
  level: string;
  status: string;
}

const levels = ['Mastery', 'Proficient', 'Beginner'];
const defaultStatus = 'Pending';

const SkillSchema = z.object({
  skill: z.string().min(1, 'Skill is required'),
  experience: z.number().min(0, 'Experience must be a non-negative number'),
  level: z.string().min(1, 'Level is required'),
});

const DomainSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  experience: z.number().min(0, 'Experience must be a non-negative number'),
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

const InterviewProfile: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [skillData, setSkillData] = useState<SkillData[]>([]);
  const [domainData, setDomainData] = useState<DomainData[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const [openSkillDialog, setOpenSkillDialog] = useState(false);
  const [openDomainDialog, setOpenDomainDialog] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const skillsResponse = await axiosInstance.get('/skills/all');
        setSkills(skillsResponse.data.data);

        const domainsResponse = await axiosInstance.get('/domain/all');
        setDomains(domainsResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch data. Please try again later.',
        });
      }
    }
    fetchData();
  }, []);

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

  const onSubmitSkill = (data: SkillFormData) => {
    setLoading(true);
    try {
      console.log('Skill data:', data);
      setSkillData([
        ...skillData,
        {
          skill: data.skill,
          experience: data.experience,
          level: data.level,
          status: defaultStatus,
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
          domain: data.domain,
          experience: data.experience,
          level: data.level,
          status: defaultStatus,
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
    <div className="flex flex-col sm:flex-row gap-4 p-2 sm:px-6 sm:py-0 md:gap-8 lg:flex-row xl:flex-row pt-2 pl-4 sm:pt-4 sm:pl-6 md:pt-6 md:pl-8">
      <div className="mb-8 w-full sm:w-1/2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Skills</h2>
          <Dialog open={openSkillDialog} onOpenChange={setOpenSkillDialog}>
            <DialogTrigger asChild>
              <Button disabled>
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
                  control={controlSkill}
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
                    control={controlSkill}
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
                    <p className="text-red-500">{skillErrors.level.message}</p>
                  )}
                </div>
                <div className="mt-2">
                  <Controller
                    name="experience"
                    control={controlSkill}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        placeholder="Experience (years)"
                        className="w-full"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10))
                        }
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
                  <Button
                    variant="ghost"
                    onClick={() => setOpenSkillDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <Card className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skillData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.skill}</TableCell>
                  <TableCell>{item.experience}</TableCell>
                  <TableCell>{item.level}</TableCell>
                  <TableCell>{item.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="text-center py-10 w-[100%] mt-10">
            <PackageOpen className="mx-auto text-gray-500" size="100" />
            <p className="text-gray-500">
              No data available
              <br /> You can earn reward and help community by being
              interviewer.
              <br />
            </p>
          </div>
        </Card>
      </div>
      <div className="mb-8 w-full sm:w-1/2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Domains</h2>
          <Dialog open={openDomainDialog} onOpenChange={setOpenDomainDialog}>
            <DialogTrigger asChild>
              <Button disabled>
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
                  control={controlDomain}
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
                  <p className="text-red-500">{domainErrors.domain.message}</p>
                )}
                <div className="mt-2">
                  <Controller
                    name="level"
                    control={controlDomain}
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
                    <p className="text-red-500">{domainErrors.level.message}</p>
                  )}
                </div>
                <div className="mt-2">
                  <Controller
                    name="experience"
                    control={controlDomain}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        placeholder="Experience (years)"
                        className="w-full"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10))
                        }
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
                  <Button
                    variant="ghost"
                    onClick={() => setOpenDomainDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <Card className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domainData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.domain}</TableCell>
                  <TableCell>{item.experience}</TableCell>
                  <TableCell>{item.level}</TableCell>
                  <TableCell>{item.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="text-center py-10 w-[100%] mt-10">
            <PackageOpen className="mx-auto text-gray-500" size="100" />
            <p className="text-gray-500">
              No data available
              <br /> You can earn reward and help community by being
              interviewer.
              <br />
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InterviewProfile;
