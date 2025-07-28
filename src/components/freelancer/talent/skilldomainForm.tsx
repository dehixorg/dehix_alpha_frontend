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
  label: string;
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
  type: string;
  status: StatusEnum;
  activeStatus: boolean;
  domainId?: string;
  originalTalentId: string;
}

const SkillDomainForm: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [skillDomainData, setSkillDomainData] = useState<SkillDomainData[]>([]);
  const [statusVisibility, setStatusVisibility] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
        const skillsResponse = await axiosInstance.get('/skills');
        const skillsArray = skillsResponse.data?.data || [];

        const domainsResponse = await axiosInstance.get('/domain');
        const domainsArray = domainsResponse.data?.data || [];

        let talentResponse = { data: { data: {} } };

        if (user?.uid) {
          talentResponse = await axiosInstance.get(
            `/freelancer/${user.uid}/dehix-talent`,
          );
        }

        const talentData = Array.isArray(talentResponse.data?.data)
          ? talentResponse.data?.data
          : Object.values(talentResponse.data?.data || {});

        // Get all existing talent data for comprehensive filtering
        const flattenedTalentData = talentData.flat();
        const formattedTalentData = flattenedTalentData.map((item: any) => ({
          uid: item._id,
          label: item.talentName || 'N/A',
          experience: item.experience || 'N/A',
          monthlyPay: item.monthlyPay || 'N/A',
          status: item.status,
          activeStatus: item.activeStatus,
          type: item.type,
          originalTalentId: item.talentId, // Keep track of original talent ID
        }));

        // Create sets of already added talent names by type
        const addedSkillNames = new Set(
          formattedTalentData
            .filter((item) => item.type === 'SKILL')
            .map((item) =>
              item.label?.toLowerCase().trim().replace(/\s+/g, ' '),
            )
            .filter(Boolean),
        );

        const addedDomainNames = new Set(
          formattedTalentData
            .filter((item) => item.type === 'DOMAIN')
            .map((item) =>
              item.label?.toLowerCase().trim().replace(/\s+/g, ' '),
            )
            .filter(Boolean),
        );

        // Also get talent IDs that are already used
        const usedTalentIds = new Set(
          formattedTalentData
            .map((item) => item.originalTalentId)
            .filter(Boolean),
        );

        // Filter skills - exclude if name matches added skills OR if ID is already used
        const filteredSkills = Array.isArray(skillsArray)
          ? skillsArray.filter((skill: any) => {
              const normalizedSkillName = skill.label
                ?.toLowerCase()
                .trim()
                .replace(/\s+/g, ' ');
              const isNameAlreadyAdded =
                addedSkillNames.has(normalizedSkillName);
              const isIdAlreadyUsed = usedTalentIds.has(skill._id);

              return !isNameAlreadyAdded && !isIdAlreadyUsed;
            })
          : [];

        // Filter domains - exclude if name matches added domains OR if ID is already used
        const filteredDomains = Array.isArray(domainsArray)
          ? domainsArray.filter((domain: any) => {
              const normalizedDomainName = domain.label
                ?.toLowerCase()
                .trim()
                .replace(/\s+/g, ' ');
              const isNameAlreadyAdded =
                addedDomainNames.has(normalizedDomainName);
              const isIdAlreadyUsed = usedTalentIds.has(domain._id);

              return !isNameAlreadyAdded && !isIdAlreadyUsed;
            })
          : [];

        const deduplicatedData = removeDuplicates(formattedTalentData);
        setSkillDomainData(deduplicatedData);
        setStatusVisibility(deduplicatedData.map((item) => item.activeStatus));

        // Map global skills to use _id and label for compatibility
        setSkills(
          filteredSkills.map((skill: any) => ({
            _id: skill._id,
            label: skill.label,
          }))
        );
        setDomains(
          filteredDomains.map((domain: any) => ({
            _id: domain._id,
            label: domain.label,
          }))
        );

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

  const onSubmitSkill = (data: SkillDomainData) => {
    const normalizedLabel = data.label
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');

    // Check if skill already exists in current data
    const existsInData = skillDomainData.some((item) => {
      const normalizedItemLabel = item.label
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
      return normalizedItemLabel === normalizedLabel && item.type === 'SKILL';
    });

    if (existsInData) {
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

    // Remove the skill from available skills list using normalized comparison
    setSkills((prevSkills) =>
      prevSkills.filter((skill) => {
        const normalizedSkillName = skill.label
          .toLowerCase()
          .trim()
          .replace(/\s+/g, ' ');
        return normalizedSkillName !== normalizedLabel;
      }),
    );

    return true;
  };

  const onSubmitDomain = (data: SkillDomainData) => {
    const normalizedLabel = data.label
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');

    // Check if domain already exists in current data
    const existsInData = skillDomainData.some((item) => {
      const normalizedItemLabel = item.label
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
      return normalizedItemLabel === normalizedLabel && item.type === 'DOMAIN';
    });

    if (existsInData) {
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

    // Remove the domain from available domains list using normalized comparison
    setDomains((prevDomains) =>
      prevDomains.filter((domain) => {
        const normalizedDomainName = domain.label
          .toLowerCase()
          .trim()
          .replace(/\s+/g, ' ');
        return normalizedDomainName !== normalizedLabel;
      }),
    );

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
                onSuccess={() => setRefreshTrigger(prev => prev + 1)}
              />
              <DomainDialog
                setDomains={setDomains}
                domains={domains}
                onSuccess={() => setRefreshTrigger(prev => prev + 1)}
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
                        {item.status.toUpperCase() === StatusEnum.PENDING && item.uid ? (
                          <VerifyDialog
                            talentType={item.type}
                            _id={item.uid}
                            userId={user.uid}
                            originalTalentId={item.originalTalentId}
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
