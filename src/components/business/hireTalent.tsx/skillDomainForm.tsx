import React, { useState, useEffect } from 'react';
import { PackageOpen } from 'lucide-react';
import { useSelector } from 'react-redux'; // To get the user data

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
import { RootState } from '@/lib/store';
import { toast } from '@/components/ui/use-toast';

interface Skill {
  _id: string;
  label: string;
}

interface Domain {
  _id: string;
  label: string;
}

interface SkillDomainData {
  uid: string;
  label: string;
  experience: string;
  description: string;
  status: string;
  visible: boolean;
}

const SkillDomainForm: React.FC = () => {
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
        if (skillsResponse?.data?.data) {
          setSkills(skillsResponse.data.data);
        } else {
          throw new Error('Skills response is null or invalid');
        }
        const domainsResponse = await axiosInstance.get('/domain/all');
        if (domainsResponse?.data?.data) {
          setDomains(domainsResponse.data.data);
        } else {
          throw new Error('Domains response is null or invalid');
        }

        // Fetch the skill/domain data for the specific freelancer
        if (user?.uid) {
          const hireTalentResponse = await axiosInstance.get(
            `/business/${user.uid}/hireDehixTalent`,
          );
          const hireTalentData = hireTalentResponse.data?.data || {};

          // Convert the talent object into an array
          const formattedHireTalentData = Object.values(hireTalentData).map(
            (item: any) => ({
              uid: item._id, // Ensure that the UID is present here
              label: item.skillName || item.domainName || 'N/A',
              experience: item.experience || 'N/A',
              description: item.description || 'N/A',
              status: item.status,
              visible: item.visible,
            }),
          );

          setSkillDomainData(formattedHireTalentData);
          setStatusVisibility(
            formattedHireTalentData.map((item) => item.visible),
          );
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong. Please try again.',
        });
      }
    }
    fetchData();
  }, [user?.uid]);

  // Handle skill/domain submission
  const onSubmitSkill = (data: SkillDomainData) => {
    setSkillDomainData([
      ...skillDomainData,
      { ...data, status: 'added', visible: false },
    ]);
    setStatusVisibility([...statusVisibility, false]);
  };

  const onSubmitDomain = (data: SkillDomainData) => {
    setSkillDomainData([
      ...skillDomainData,
      { ...data, status: 'added', visible: false },
    ]);
    setStatusVisibility([...statusVisibility, false]);
  };

  // Function to handle visibility toggle and API call
  const handleToggleVisibility = async (
    index: number,
    value: boolean,
    hireDehixTalentId: string,
  ) => {
    try {
      const response = await axiosInstance.patch(
        `/business/${user.uid}/hireDehixTalent/${hireDehixTalentId}`,
        { visible: value },
      );

      if (response.status === 200) {
        const updatedVisibility = [...statusVisibility];
        updatedVisibility[index] = value;
        setStatusVisibility(updatedVisibility);
      }
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
    }
  };

  return (
    <div>
      <div className="mb-8 ">
        <h1 className="text-3xl font-bold"> Business Marketplace Overview</h1>
        <p className="text-gray-400 mt-2">
          Help us understand the skills and domain you are looking for in
          potential hires.Enter the required experience and a short description
          to refine your talent search.
        </p>
      </div>

      <div className="">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-4">
              <SkillDialog skills={skills} onSubmitSkill={onSubmitSkill} />
              <DomainDialog domains={domains} onSubmitDomain={onSubmitDomain} />
            </div>
          </div>
          <Card className="overflow-hidden">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skillDomainData.length > 0 ? (
                  skillDomainData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.label}</TableCell>
                      <TableCell>{item.experience} years</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>
                        <Switch
                          checked={statusVisibility[index]}
                          onCheckedChange={
                            (value) =>
                              item.uid
                                ? handleToggleVisibility(index, value, item.uid)
                                : console.error('UID missing for item', item) // Fallback check for missing UID
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      <div className="text-center py-10 w-full mt-10">
                        <PackageOpen
                          className="mx-auto text-gray-500"
                          size="100"
                        />
                        <p className="text-gray-500">
                          No data available.
                          <br /> This feature will be available soon.
                          <br />
                          Here you can directly hire freelancer for different
                          roles.
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
    </div>
  );
};

export default SkillDomainForm;
