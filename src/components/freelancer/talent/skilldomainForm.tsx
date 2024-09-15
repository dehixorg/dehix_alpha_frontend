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
import { useSelector } from 'react-redux'; // To get the user data
import { RootState } from '@/lib/store';

// Define the types for skill and domain data
interface Skill {
  label: string;
}

interface Domain {
  label: string;
}

interface SkillDomainData {
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

  // Get the user data from Redux store
  const user = useSelector((state: RootState) => state.user);

  // Fetch skills, domains, and user's skill/domain data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const skillsResponse = await axiosInstance.get('/skills/all');
        setSkills(skillsResponse.data.data);
        const domainsResponse = await axiosInstance.get('/domain/all');
        setDomains(domainsResponse.data.data);

        // Fetch the skill/domain data for the specific freelancer
        if (user?.uid) {
          const talentResponse = await axiosInstance.get(
            `/freelancer/${user.uid}/dehix-talent`,
          );
          const talentData = talentResponse.data?.data[0]?.dehixTalent || {};

          // Convert the talent object into an array
          const formattedTalentData = Object.values(talentData).map(
            (item: any) => ({
              label: item.skillName || item.domainName || 'N/A',
              experience: item.experience || 'N/A',
              monthlyPay: item.monthlyPay || 'N/A',
              status: item.status,
              activeStatus: item.activeStatus,
            }),
          );

          setSkillDomainData(formattedTalentData);
          setStatusVisibility(
            formattedTalentData.map((item) => item.activeStatus),
          );
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, [user?.uid]);

  // Handle skill/domain submission
  const onSubmitSkill = (data: {
    label: string;
    experience: string;
    monthlyPay: string;
  }) => {
    setSkillDomainData([...skillDomainData, { ...data, status: 'pending' }]);
    setStatusVisibility([...statusVisibility, false]);
  };

  const onSubmitDomain = (data: {
    label: string;
    experience: string;
    monthlyPay: string;
  }) => {
    setSkillDomainData([...skillDomainData, { ...data, status: 'pending' }]);
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
              {skillDomainData.length > 0 ? (
                skillDomainData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.label}</TableCell>
                    <TableCell>{item.experience}</TableCell>
                    <TableCell>{item.monthlyPay}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>
                      <Switch
                        checked={statusVisibility[index]}
                        onCheckedChange={(value) => {
                          const updatedVisibility = [...statusVisibility];
                          updatedVisibility[index] = value;
                          setStatusVisibility(updatedVisibility);
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <div className="text-center py-10 w-[90vw] h-[30vw] mt-10">
                      <PackageOpen
                        className="mx-auto text-gray-500"
                        size="100"
                      />
                      <p className="text-gray-500">
                        No data available.
                        <br /> This feature will be available soon.
                        <br />
                        Here you can get directly hired for different roles.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default SkillDomainForm;
