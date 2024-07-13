'use client';
import * as React from 'react';
import { useState, ChangeEvent } from 'react';
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
import { Switch } from '@/components/ui/switch';

interface Skill {
  skill: string;
  experience: string;
  available: boolean;
}

interface Domain {
  domain: string;
  experience: string;
  available: boolean;
}

export default function InterviewProfile() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [isDomainDialogOpen, setIsDomainDialogOpen] = useState(false);
  const [skillInput, setSkillInput] = useState<Skill>({
    skill: '',
    experience: '',
    available: false,
  });
  const [domainInput, setDomainInput] = useState<Domain>({
    domain: '',
    experience: '',
    available: false,
  });

  const handleSkillInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSkillInput({ ...skillInput, [e.target.name]: e.target.value });
  };

  const handleDomainInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDomainInput({ ...domainInput, [e.target.name]: e.target.value });
  };

  const handleSkillAvailabilityChange = (index: number) => {
    const newSkills = [...skills];
    newSkills[index].available = !newSkills[index].available;
    setSkills(newSkills);
  };

  const handleDomainAvailabilityChange = (index: number) => {
    const newDomains = [...domains];
    newDomains[index].available = !newDomains[index].available;
    setDomains(newDomains);
  };

  const addSkill = () => {
    setSkills([...skills, skillInput]);
    setSkillInput({ skill: '', experience: '', available: false });
    setIsSkillDialogOpen(false);
  };

  const addDomain = () => {
    setDomains([...domains, domainInput]);
    setDomainInput({ domain: '', experience: '', available: false });
    setIsDomainDialogOpen(false);
  };

  return (
    <div className="p-4">
      <section className="flex flex-col items-center">
        <header className="flex items-center justify-between w-full max-w-3xl">
          <h2 className="text-xl font-bold">Skills</h2>
          <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center ml-6 w-[9rem]">
                <Plus className="mr-2" />
                Add Skill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Skill</DialogTitle>
                <DialogDescription>
                  Enter the skill and years of experience.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col space-y-4">
                <input
                  name="skill"
                  placeholder="Enter Skill"
                  value={skillInput.skill}
                  onChange={handleSkillInputChange}
                  className="border p-2 rounded"
                />
                <input
                  name="experience"
                  placeholder="Experience Years"
                  value={skillInput.experience}
                  onChange={handleSkillInputChange}
                  className="border p-2 rounded"
                />
              </div>
              <DialogFooter>
                <Button onClick={addSkill}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>
        <Table className="min-w-full mt-4 mx-auto max-w-3xl">
          <TableHeader>
            <TableRow>
              <TableHead>Skill</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Available</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skills.map((skill, index) => (
              <TableRow key={index}>
                <TableCell>{skill.skill}</TableCell>
                <TableCell>{skill.experience}</TableCell>
                <TableCell>
                  <Switch
                    checked={skill.available}
                    onCheckedChange={() => handleSkillAvailabilityChange(index)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="mt-8 flex flex-col items-center">
        <header className="flex items-center justify-between w-full max-w-3xl">
          <h2 className="text-xl font-bold">Domain</h2>
          <Dialog
            open={isDomainDialogOpen}
            onOpenChange={setIsDomainDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="flex items-center ml-5 w-[9rem]">
                <Plus className="mr-2" />
                Add Domain
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Domain</DialogTitle>
                <DialogDescription>
                  Enter the domain and years of experience.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col space-y-4">
                <input
                  name="domain"
                  placeholder="Enter Domain"
                  value={domainInput.domain}
                  onChange={handleDomainInputChange}
                  className="border p-2 rounded"
                />
                <input
                  name="experience"
                  placeholder="Experience Years"
                  value={domainInput.experience}
                  onChange={handleDomainInputChange}
                  className="border p-2 rounded"
                />
              </div>
              <DialogFooter>
                <Button onClick={addDomain}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>
        <Table className="min-w-full mt-4 mx-auto max-w-3xl">
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Available</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {domains.map((domain, index) => (
              <TableRow key={index}>
                <TableCell>{domain.domain}</TableCell>
                <TableCell>{domain.experience}</TableCell>
                <TableCell>
                  <Switch
                    checked={domain.available}
                    onCheckedChange={() =>
                      handleDomainAvailabilityChange(index)
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
