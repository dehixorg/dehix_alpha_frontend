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
import { getBadgeColor } from '@/utils/common/getBadgeStatus';
import { StatusEnum } from '@/utils/freelancer/enum';

interface Skill {
  _id: string;
  name: string;
}

interface Domain {
  _id: string;
  name: string;
}

interface SkillDomainData {
  uid: string;
  label: string;
  experience: string;
  monthlyPay: string;
  status: StatusEnum;
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
        const skillsResponse = await axiosInstance.get(
          `/freelancer/${user.uid}/skill`,
        );

        const skillsArray = skillsResponse.data?.data?.[0]?.skills || [];

        const domainsResponse = await axiosInstance.get(
          `/freelancer/${user.uid}/domain`,
        );
        const domainsArray = domainsResponse.data?.data?.[0]?.domain || [];

        let talentResponse = { data: { data: {} } };

        if (user?.uid) {
          talentResponse = await axiosInstance.get(
            `/freelancer/${user.uid}/dehix-talent`,
          );
        }

        const talentData = Array.isArray(talentResponse.data?.data)
          ? talentResponse.data?.data
          : Object.values(talentResponse.data?.data || {});

        const existingIds = talentData.map((item: any) => item.talentId) || [];

        const filteredSkills = Array.isArray(skillsArray)
          ? skillsArray.filter((skill: any) => !existingIds.includes(skill._id))
          : [];

        const filteredDomains = Array.isArray(domainsArray)
          ? domainsArray.filter(
              (domain: any) => !existingIds.includes(domain._id),
            )
          : [];

        const flattenedTalentData = talentData.flat();

        const formattedTalentData = flattenedTalentData.map((item: any) => ({
          uid: item._id,
          label: item.talentName || 'N/A',
          experience: item.experience || 'N/A',
          monthlyPay: item.monthlyPay || 'N/A',
          status: item.status,
          activeStatus: item.activeStatus,
        }));

        setSkills(filteredSkills);
        setDomains(filteredDomains);
        setSkillDomainData(formattedTalentData);
        setStatusVisibility(
          formattedTalentData.map((item) => item.activeStatus),
        );
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
      { ...data, status: StatusEnum.PENDING, activeStatus: false },
    ]);
    setStatusVisibility([...statusVisibility, false]);
  };

  const onSubmitDomain = (data: SkillDomainData) => {
    setSkillDomainData([
      ...skillDomainData,
      { ...data, status: StatusEnum.PENDING, activeStatus: false },
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
        `/freelancer/dehix-talent/${dehixTalentId}`,
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

  return (
    <div className="p-6 mt-2">
      <div className="mb-8 mt-1 ml-2">
        <h1 className="text-3xl font-bold">Dehix Talent</h1>
        <p className="text-gray-400 mt-2">
          Here you can add relevant skills and domains to get directly hired
          from dehix talent.
        </p>
      </div>
      <div className="px-4">
        <div className="mb-8 mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-4">
              <SkillDialog
                setSkills={setSkills}
                skills={skills}
                onSubmitSkill={onSubmitSkill}
              />
              <DomainDialog
                setDomains={setDomains}
                domains={domains}
                onSubmitDomain={onSubmitDomain}
              />
            </div>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead className="text-center">Monthly Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
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
                      <TableCell className="text-center">
                        <Skeleton className="mx-auto h-6 w-12" />
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
                      <TableCell className="text-center">
                        ${item.monthlyPay}
                      </TableCell>
                      <TableCell>
                        <Badge className={getBadgeColor(item.status)}>
                          {item?.status?.toUpperCase()}
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
