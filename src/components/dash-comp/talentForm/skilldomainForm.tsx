'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Plus, PackageOpen } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { axiosInstance } from '@/lib/axiosinstance';
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from '@/components/ui/select';

interface Skill {
  label: string;
}

interface Domain {
  label: string;
}

interface SkillDomainData {
  type: 'skill' | 'domain';
  label: string;
  experience: string;
  monthlyPay: string;
  show: boolean;
  status: string;
}

const defaultStatus = 'Pending';

const skillSchema = z.object({
  label: z.string().nonempty('Please select a skill'),
  experience: z
    .string()
    .nonempty('Please enter your experience')
    .regex(/^\d+$/, 'Experience must be a number'),
  monthlyPay: z
    .string()
    .nonempty('Please enter your monthly pay')
    .regex(/^\d+$/, 'Monthly pay must be a number'),
});

const domainSchema = z.object({
  label: z.string().nonempty('Please select a domain'),
  experience: z
    .string()
    .nonempty('Please enter your experience')
    .regex(/^\d+$/, 'Experience must be a number'),
  monthlyPay: z
    .string()
    .nonempty('Please enter your monthly pay')
    .regex(/^\d+$/, 'Monthly pay must be a number'),
});

const SkillDomainForm: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([
    { label: 'JavaScript' },
    { label: 'React' },
    { label: 'Node.js' },
  ]);
  const [domains, setDomains] = useState<Domain[]>([
    { label: 'Frontend' },
    { label: 'Backend' },
    { label: 'DevOps' },
  ]);
  const [skillDomainData, setSkillDomainData] = useState<SkillDomainData[]>([]);
  const [statusVisibility, setStatusVisibility] = useState<boolean[]>([]);

  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [isDomainDialogOpen, setIsDomainDialogOpen] = useState(false);

  const {
    control: skillControl,
    handleSubmit: handleSkillSubmit,
    formState: { errors: skillErrors },
    reset: resetSkillForm,
  } = useForm({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      label: '',
      experience: '',
      monthlyPay: '',
    },
  });

  const {
    control: domainControl,
    handleSubmit: handleDomainSubmit,
    formState: { errors: domainErrors },
    reset: resetDomainForm,
  } = useForm({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      label: '',
      experience: '',
      monthlyPay: '',
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const skillsResponse = await axiosInstance.get('/skills/all');
        setSkills(skillsResponse.data.data);

        const domainsResponse = await axiosInstance.get('/domain/all');
        setDomains(domainsResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  const onSubmitSkill = (data: any) => {
    setSkillDomainData([
      ...skillDomainData,
      { type: 'skill', ...data, status: defaultStatus },
    ]);
    setStatusVisibility([...statusVisibility, false]);
    resetSkillForm();
    setIsSkillDialogOpen(false);
  };

  const onSubmitDomain = (data: any) => {
    setSkillDomainData([
      ...skillDomainData,
      { type: 'domain', ...data, status: defaultStatus },
    ]);
    setStatusVisibility([...statusVisibility, false]);
    resetDomainForm();
    setIsDomainDialogOpen(false);
  };

  return (
    <div className="px-4">
      <div className="mb-8 mt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-4">
            <Dialog
              open={isSkillDialogOpen}
              onOpenChange={setIsSkillDialogOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={() => setIsSkillDialogOpen(true)} disabled>
                  <Plus className="mr-2 h-4 w-4" /> Add Skill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Skill</DialogTitle>
                  <DialogDescription>
                    Select a skill, enter your experience and monthly pay.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSkillSubmit(onSubmitSkill)}>
                  <div className="mb-3">
                    <Controller
                      control={skillControl}
                      name="label"
                      render={({ field }) => (
                        <Select {...field} onValueChange={field.onChange}>
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
                  </div>
                  {skillErrors.label && (
                    <p className="text-red-600">{skillErrors.label.message}</p>
                  )}
                  <div className="mb-3">
                    <Controller
                      control={skillControl}
                      name="experience"
                      render={({ field }) => (
                        <input
                          type="number"
                          placeholder="Experience (years)"
                          {...field}
                          className="border p-2 rounded mt-2 w-full"
                        />
                      )}
                    />
                  </div>
                  {skillErrors.experience && (
                    <p className="text-red-600">
                      {skillErrors.experience.message}
                    </p>
                  )}
                  <Controller
                    control={skillControl}
                    name="monthlyPay"
                    render={({ field }) => (
                      <input
                        type="number"
                        placeholder="Monthly Pay"
                        {...field}
                        className="border p-2 rounded mt-2 w-full"
                      />
                    )}
                  />
                  {skillErrors.monthlyPay && (
                    <p className="text-red-600">
                      {skillErrors.monthlyPay.message}
                    </p>
                  )}
                  <DialogFooter className="mt-3">
                    <Button className="w-full" type="submit">
                      Submit
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog
              open={isDomainDialogOpen}
              onOpenChange={setIsDomainDialogOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={() => setIsDomainDialogOpen(true)} disabled>
                  <Plus className="mr-2 h-4 w-4" /> Add Domain
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Domain</DialogTitle>
                  <DialogDescription>
                    Select a domain, enter your experience and monthly pay.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleDomainSubmit(onSubmitDomain)}>
                  <div className="mb-3">
                    <Controller
                      control={domainControl}
                      name="label"
                      render={({ field }) => (
                        <Select {...field} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a domain" />
                          </SelectTrigger>
                          <SelectContent>
                            {domains.map((domain) => (
                              <SelectItem
                                key={domain.label}
                                value={domain.label}
                              >
                                {domain.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  {domainErrors.label && (
                    <p className="text-red-600">{domainErrors.label.message}</p>
                  )}
                  <div className="mb-3">
                    <Controller
                      control={domainControl}
                      name="experience"
                      render={({ field }) => (
                        <input
                          type="number"
                          placeholder="Experience (years)"
                          {...field}
                          className="border p-2 rounded mt-2 w-full"
                        />
                      )}
                    />
                  </div>
                  {domainErrors.experience && (
                    <p className="text-red-600">
                      {domainErrors.experience.message}
                    </p>
                  )}
                  <Controller
                    control={domainControl}
                    name="monthlyPay"
                    render={({ field }) => (
                      <input
                        type="number"
                        placeholder="Monthly Pay"
                        {...field}
                        className="border p-2 rounded mt-2 w-full"
                      />
                    )}
                  />
                  {domainErrors.monthlyPay && (
                    <p className="text-red-600">
                      {domainErrors.monthlyPay.message}
                    </p>
                  )}
                  <DialogFooter className="mt-3">
                    <Button className="w-full" type="submit">
                      Submit
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Monthly Pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skillDomainData.map((data, index) => (
                <TableRow key={index}>
                  <TableCell>{data.label}</TableCell>
                  <TableCell>{data.experience}</TableCell>
                  <TableCell>{data.monthlyPay}</TableCell>
                  <TableCell>{data.status}</TableCell>
                  <TableCell>
                    <Switch />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <div className="text-center py-10 w-[90vw] mt-10">
          <PackageOpen className="mx-auto text-gray-500" size="100" />
          <p className="text-gray-500">
            No data available.
            <br /> This feature will be available soon.
            <br />
            Here you can get directly hired for different roles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SkillDomainForm;
