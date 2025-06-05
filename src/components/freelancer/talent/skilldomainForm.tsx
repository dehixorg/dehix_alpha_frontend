'use client';
import type React from 'react';
import { useState, useEffect } from 'react';
import { PackageOpen } from 'lucide-react';
import { useSelector } from 'react-redux';

import SkillDialog from './skillDiag';
import DomainDialog from './domainDiag';
import VerifyDialog from './verifyDialog';

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
import type { RootState } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getBadgeColor } from '@/utils/common/getBadgeStatus';
import { StatusEnum } from '@/utils/freelancer/enum';
import { toast } from '@/components/ui/use-toast';

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
  type: string;
  status: StatusEnum;
  activeStatus: boolean;
  domainId?: string;
}

const SkillDomainForm: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [skillDomainData, setSkillDomainData] = useState<SkillDomainData[]>([]);
  const [statusVisibility, setStatusVisibility] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);

  // Counter states for skills and domains (by label)
  const [skillCounts, setSkillCounts] = useState<{ [label: string]: number }>(
    {},
  );
  const [domainCounts, setDomainCounts] = useState<{ [label: string]: number }>(
    {},
  );

  // Function to remove duplicate entries
  const removeDuplicates = (data: SkillDomainData[]) => {
    const seen = new Set<string>();
    return data.filter((item) => {
      const key = `${item.label.trim().toLowerCase()}-${item.type}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };

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
          type: item.type,
        }));

        const deduplicatedData = removeDuplicates(formattedTalentData);
        setSkillDomainData(deduplicatedData);
        setStatusVisibility(deduplicatedData.map((item) => item.activeStatus));

        setSkills(filteredSkills);
        setDomains(filteredDomains);

        // Initialize skill and domain counters (by label) - improved logic
        const skillCounter: { [label: string]: number } = {};
        const domainCounter: { [label: string]: number } = {};

        deduplicatedData.forEach((item) => {
          const label = item.label.trim().toLowerCase();
          if (item.type === 'SKILL') {
            skillCounter[label] = (skillCounter[label] || 0) + 1;
          }
          if (item.type === 'DOMAIN') {
            domainCounter[label] = (domainCounter[label] || 0) + 1;
          }
        });

        setSkillCounts(skillCounter);
        setDomainCounts(domainCounter);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong.Please try again.',
        }); // Error toast
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user?.uid]);

  // Updated: Return boolean for success/duplicate
  const onSubmitSkill = (data: SkillDomainData) => {
    const label = data.label.trim().toLowerCase();

    // Check if skill already exists in current data or counters
    const existsInData = skillDomainData.some(
      (item) =>
        item.label.trim().toLowerCase() === label && item.type === 'SKILL',
    );

    if (existsInData || (skillCounts[label] || 0) > 0) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Skill',
        description: 'This skill has already been added.',
      });
      return false;
    }

    const newData = {
      ...data,
      status: StatusEnum.PENDING,
      activeStatus: false,
      type: 'SKILL',
    };
    setSkillDomainData([...skillDomainData, newData]);
    setStatusVisibility([...statusVisibility, false]);
    setSkillCounts({ ...skillCounts, [label]: 1 });
    return true;
  };

  // Updated: Return boolean for success/duplicate
  const onSubmitDomain = (data: SkillDomainData) => {
    const label = data.label.trim().toLowerCase();

    // Check if domain already exists in current data or counters
    const existsInData = skillDomainData.some(
      (item) =>
        item.label.trim().toLowerCase() === label && item.type === 'DOMAIN',
    );

    if (existsInData || (domainCounts[label] || 0) > 0) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Domain',
        description: 'This domain has already been added.',
      });
      return false;
    }

    const newData = {
      ...data,
      status: StatusEnum.PENDING,
      activeStatus: false,
      type: 'DOMAIN',
    };
    setSkillDomainData([...skillDomainData, newData]);
    setStatusVisibility([...statusVisibility, false]);
    setDomainCounts({ ...domainCounts, [label]: 1 });
    return true;
  };

  const handleToggleVisibility = async (
    index: number,
    value: boolean,
    dehixTalentId: string,
  ) => {
    try {
      const response = await axiosInstance.put(
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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong.Please try again.',
      }); // Error toast
    }
  };

  // Handler for SkillDialog and DomainDialog to show success toast only on success
  const handleSkillSubmit = (data: SkillDomainData) => {
    const success = onSubmitSkill(data);
    if (success) {
      toast({
        variant: 'default',
        title: 'Talent Added',
        description: 'The skill has been successfully added.',
      });
    }
    return success;
  };

  const handleDomainSubmit = (data: SkillDomainData) => {
    const success = onSubmitDomain(data);
    if (success) {
      toast({
        variant: 'default',
        title: 'Talent Added',
        description: 'The domain has been successfully added.',
      });
    }
    return success;
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
                onSubmitSkill={handleSkillSubmit}
              />
              <DomainDialog
                setDomains={setDomains}
                domains={domains}
                onSubmitDomain={handleDomainSubmit}
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
                        {item.status.toUpperCase() === StatusEnum.PENDING ? (
                          <VerifyDialog
                            talentType={item.type}
                            talentId={item.uid}
                            userId={user.uid}
                          />
                        ) : (
                          <Badge className={getBadgeColor(item.status)}>
                            {item?.status?.toUpperCase()}
                          </Badge>
                        )}
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
