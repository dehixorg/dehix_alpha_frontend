import React, { useState, useEffect, useCallback } from 'react';
import { PackageOpen } from 'lucide-react';
import { useSelector } from 'react-redux';

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
import { Skeleton } from '@/components/ui/skeleton';
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

interface SkillDomainFormProps {
  setFilterSkill: (skills: Skill[]) => void;
  setFilterDomain: (domains: Domain[]) => void;
}

const SkillDomainForm: React.FC<SkillDomainFormProps> = ({
  setFilterSkill,
  setFilterDomain,
}) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [skillDomainData, setSkillDomainData] = useState<SkillDomainData[]>([]);
  const [statusVisibility, setStatusVisibility] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true); // Loading state for fetching data

  const user = useSelector((state: RootState) => state.user);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); // Set loading to true before fetching
      const skillsResponse = await axiosInstance.get('/skills/all');
      setSkills(skillsResponse.data?.data || []);

      const domainsResponse = await axiosInstance.get('/domain/all');
      setDomains(domainsResponse.data?.data || []);

      if (user?.uid) {
        const hireTalentResponse = await axiosInstance.get(
          `/business/${user.uid}/hireDehixTalent`,
        );
        const hireTalentData = hireTalentResponse.data?.data || [];

        const fetchedFilterSkills = hireTalentData
          .filter((item: any) => item.skillName && item.visible)
          .map((item: any) => ({
            _id: item.skillId,
            label: item.skillName,
          }));

        const fetchedFilterDomains = hireTalentData
          .filter((item: any) => item.domainName && item.visible)
          .map((item: any) => ({
            _id: item.domainId,
            label: item.domainName,
          }));

        setFilterSkill(fetchedFilterSkills);
        setFilterDomain(fetchedFilterDomains);

        const formattedHireTalentData = Object.values(hireTalentData).map(
          (item: any) => ({
            uid: item._id,
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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  }, [user?.uid, setFilterSkill, setFilterDomain]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        await fetchData();
      }
    } catch (error) {
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
          Help us understand the skills and domain you are looking for in potential hires.
          Enter the required experience and a short description to refine your talent search.
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
          <Card className="h-[65.4vh] overflow-auto no-scrollbar">
            {loading ? (
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
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-3/6" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-4/6" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-3/6" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
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
                            onCheckedChange={(value) =>
                              item.uid
                                ? handleToggleVisibility(index, value, item.uid)
                                : console.error('UID missing for item', item)
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
                            Here you can directly hire freelancers for different roles.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SkillDomainForm;
