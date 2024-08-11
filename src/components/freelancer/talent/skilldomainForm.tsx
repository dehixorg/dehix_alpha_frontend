'use client';
import React, { useState, useEffect } from 'react';
import { PackageOpen } from 'lucide-react';

import SkillDialog from './skillDiag';
import DomainDialog from './domainDiag';

import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { axiosInstance } from '@/lib/axiosinstance';
import { Switch } from '@/components/ui/switch';

// Define the types for skill and domain data
interface Skill {
  label: string;
  // Add other fields if necessary
}

interface Domain {
  label: string;
  // Add other fields if necessary
}

interface SkillDomainData {
  type: 'skill' | 'domain';
  label: string;
  experience: string;
  monthlyPay: string;
  status: string;
}

const SkillDomainForm: React.FC = () => {
  // Use the defined types for state variables
  const [skills, setSkills] = useState<Skill[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [skillDomainData, setSkillDomainData] = useState<SkillDomainData[]>([]);
  const [statusVisibility, setStatusVisibility] = useState<boolean[]>([]);

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

  // Type the data parameter for onSubmitSkill and onSubmitDomain functions
  const onSubmitSkill = (data: {
    label: string;
    experience: string;
    monthlyPay: string;
  }) => {
    setSkillDomainData([
      ...skillDomainData,
      { type: 'skill', ...data, status: 'Pending' },
    ]);
    setStatusVisibility([...statusVisibility, false]);
  };

  const onSubmitDomain = (data: {
    label: string;
    experience: string;
    monthlyPay: string;
  }) => {
    setSkillDomainData([
      ...skillDomainData,
      { type: 'domain', ...data, status: 'Pending' },
    ]);
    setStatusVisibility([...statusVisibility, false]);
  };

  return (
    <div className="px-4">
      <div className="mb-8 mt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-4">
            <SkillDialog skills={skills} onSubmitSkill={onSubmitSkill} />
            <DomainDialog domains={domains} onSubmitDomain={onSubmitDomain} />
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
              {skillDomainData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.label}</TableCell>
                  <TableCell>{item.experience}</TableCell>
                  <TableCell>{item.monthlyPay}</TableCell>
                  <TableCell>{item.status}</TableCell>
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
