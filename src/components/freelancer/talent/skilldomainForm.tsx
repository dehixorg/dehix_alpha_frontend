'use client';
import React, { useState, useEffect } from 'react';
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
import { axiosInstance } from '@/lib/axiosinstance';
import { Switch } from '@/components/ui/switch';
import { RootState } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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
  monthlyPay: string;
  status: string;
  activeStatus: boolean;
}

const SkillDomainForm: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [skillDomainData, setSkillDomainData] = useState<SkillDomainData[]>([]);
  const [statusVisibility, setStatusVisibility] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);

  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const skillsResponse = await axiosInstance.get('/skills/all');
        setSkills(skillsResponse.data.data);
        const domainsResponse = await axiosInstance.get('/domain/all');
        setDomains(domainsResponse.data.data);

        if (user?.uid) {
          const talentResponse = await axiosInstance.get(
            `/freelancer/${user.uid}/dehix-talent`,
          );
          const talentData = talentResponse.data?.data[0]?.dehixTalent || {};

          const formattedTalentData = Object.values(talentData).map(
            (item: any) => ({
              uid: item._id,
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
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user?.uid]);

  const onSubmitSkill = (data: SkillDomainData) => {
    setSkillDomainData([
      ...skillDomainData,
      { ...data, status: 'pending', activeStatus: false },
    ]);
    setStatusVisibility([...statusVisibility, false]);
  };

  const onSubmitDomain = (data: SkillDomainData) => {
    setSkillDomainData([
      ...skillDomainData,
      { ...data, status: 'pending', activeStatus: false },
    ]);
    setStatusVisibility([...statusVisibility, false]);
  };

  const handleToggleVisibility = async (
    index: number,
    value: boolean,
    dehixTalentId: string,
  ) => {
    try {
      const response = await axiosInstance.patch(
        `/freelancer/${user.uid}/dehix-talent/${dehixTalentId}`,
        { activeStatus: value },
      );

      if (response.status === 200) {
        const updatedVisibility = [...statusVisibility];
        updatedVisibility[index] = value;
        setStatusVisibility(updatedVisibility);
      }
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

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

  return (
    <div className="p-6 mt-2">
      <div className="mb-8 mt-1 ml-2">
        <h1 className="text-3xl font-bold">Dehix Talent </h1>
        <p className="text-gray-400 mt-2">
          Here you can Add relevant skills and domains to get directly hired
          from dehix talent.
        </p>
      </div>
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
                {loading ? (
                  Array.from({ length: 9 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-12 rounded-xl" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : skillDomainData.length > 0 ? (
                  skillDomainData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.label}</TableCell>
                      <TableCell>{item.experience} Years</TableCell>
                      <TableCell>${item.monthlyPay}</TableCell>
                      <TableCell>
                        <Badge className={getBadgeColor(item.status)}>
                          {item.status.replace(/\b\w/g, (char) =>
                            char.toUpperCase(),
                          )}
                        </Badge>
                      </TableCell>
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
    </div>
  );
};

export default SkillDomainForm;
