'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

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
import { axiosInstance } from '@/lib/axiosinstance';
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from '@/components/ui/select';
import Breadcrumb from '@/components/shared/breadcrumbList';

interface Skill {
  label: string;
}

interface Domain {
  label: string;
}

interface SkillData {
  skill: string;
  experience: string;
  level: string;
  status: string;
}

interface DomainData {
  domain: string;
  experience: string;
  level: string;
  status: string;
}

const levels = ['Mastery', 'Proficient', 'Beginner'];
const defaultStatus = 'Pending';

export default function ProfilePage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [experience, setExperience] = useState<string>('');
  const [level, setLevel] = useState<string>('');
  const [skillData, setSkillData] = useState<SkillData[]>([]);
  const [domainData, setDomainData] = useState<DomainData[]>([]);

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

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExperience(e.target.value);
  };

  const handleSubmitSkill = () => {
    setSkillData([
      ...skillData,
      { skill: selectedSkill, experience, level, status: defaultStatus },
    ]);
    setSelectedSkill('');
    setExperience('');
    setLevel('');
  };

  const handleSubmitDomain = () => {
    setDomainData([
      ...domainData,
      { domain: selectedDomain, experience, level, status: defaultStatus },
    ]);
    setSelectedDomain('');
    setExperience('');
    setLevel('');
  };

  return (
    <div className="px-4">
      <Breadcrumb
        items={[
          { label: 'Interview', link: '#' },
          { label: 'Profile', link: '#' },
        ]}
      />
      <div className="mb-8 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Skills</h2>
          <Dialog>
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
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
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
              <div className="mt-2">
                <Select value={level} onValueChange={setLevel}>
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
              </div>
              <input
                type="number"
                placeholder="Experience (years)"
                value={experience}
                onChange={handleExperienceChange}
                className="border p-2 rounded mt-2 w-full"
              />
              <DialogFooter>
                <Button onClick={handleSubmitSkill}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

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
            {skillData.map((data, index) => (
              <TableRow key={index}>
                <TableCell>{data.skill}</TableCell>
                <TableCell>{data.experience}</TableCell>
                <TableCell>{data.level}</TableCell>
                <TableCell>{data.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Domains</h2>
          <Dialog>
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
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
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
              <div className="mt-2">
                <Select value={level} onValueChange={setLevel}>
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
              </div>
              <input
                type="number"
                placeholder="Experience (years)"
                value={experience}
                onChange={handleExperienceChange}
                className="border p-2 rounded mt-2 w-full"
              />
              <DialogFooter>
                <Button onClick={handleSubmitDomain}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

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
            {domainData.map((data, index) => (
              <TableRow key={index}>
                <TableCell>{data.domain}</TableCell>
                <TableCell>{data.experience}</TableCell>
                <TableCell>{data.level}</TableCell>
                <TableCell>{data.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
