import React, { useState, useEffect, useCallback } from 'react';
import { PackageOpen, Plus } from 'lucide-react';
import { useSelector } from 'react-redux';

import TalentDialog from './talentDialog';

import { Card } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import { RootState } from '@/lib/store';
import { notifyError } from '@/utils/toastMessage';
import { Badge } from '@/components/ui/badge';
import { getBadgeColor } from '@/utils/common/getBadgeStatus';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [isLoading, setIsLoading] = useState(true);

  // Get the user data from Redux store
  const user = useSelector((state: RootState) => state.user);

  // Fetch user's skill/domain data
  const fetchUserData = useCallback(async () => {
    try {
      // Fetch all skills and domains from API
      const [skillsResponse, domainsResponse, hireTalentResponse] =
        await Promise.all([
          axiosInstance.get('/skills'),
          axiosInstance.get('/domain'),
          user?.uid
            ? axiosInstance.get(`/business/hire-dehixtalent`)
            : Promise.resolve({ data: { data: [] } }),
        ]);

      const allSkills = skillsResponse?.data?.data || [];
      const allDomains = domainsResponse?.data?.data || [];
      const hireTalentData = hireTalentResponse.data?.data || [];

      // Filter and map user data
      const fetchedFilterSkills = hireTalentData
        .filter((item: any) => item.type === 'SKILL' && item.visible)
        .map((item: any) => ({
          _id: item._id,
          label: item.talentName,
        }));

      const fetchedFilterDomains = hireTalentData
        .filter((item: any) => item.type === 'DOMAIN' && item.visible)
        .map((item: any) => ({
          _id: item._id,
          label: item.talentName,
        }));

      // Send the filtered skills and domains back to the parent
      setFilterSkill(fetchedFilterSkills);
      setFilterDomain(fetchedFilterDomains);

      // Convert the talent data into formatted array
      const formattedHireTalentData = hireTalentData.map((item: any) => ({
        uid: item._id,
        label: item.talentName || 'N/A',
        experience: item.experience || 'N/A',
        description: item.description || 'N/A',
        status: item.status,
        visible: item.visible,
        type: item.type, // Keep track of type for filtering
      }));

      setSkillDomainData(formattedHireTalentData);
      setStatusVisibility(
        formattedHireTalentData.map((item: any) => item.visible),
      );

      // Extract all added skills and domains (both visible and non-visible)
      // Use talentName since that's what's stored in the formatted data
      const addedSkillLabels = hireTalentData
        .filter((item: any) => item.type === 'SKILL')
        .map((item: any) => item.talentName);

      const addedDomainLabels = hireTalentData
        .filter((item: any) => item.type === 'DOMAIN')
        .map((item: any) => item.talentName);

      // Filter out already added skills and domains from the options
      const uniqueSkills = allSkills.filter(
        (skill: any) => !addedSkillLabels.includes(skill.label),
      );

      const uniqueDomains = allDomains.filter(
        (domain: any) => !addedDomainLabels.includes(domain.label),
      );

      setSkills(uniqueSkills);
      setDomains(uniqueDomains);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      notifyError('Something went wrong. Please try again.', 'Error');
    }
  }, [user?.uid, setFilterSkill, setFilterDomain]);

  // Fetch user data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await fetchUserData();
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [fetchUserData]);

  // Handle skill/domain submission
  const onSubmitSkill = async (data: SkillDomainData) => {
    // Immediately remove the added skill from options for instant feedback
    setSkills((prevSkills) =>
      prevSkills.filter((skill) => skill.label !== data.label),
    );
    // Refetch to sync with backend
    await fetchUserData();
  };

  const onSubmitDomain = async (data: SkillDomainData) => {
    // Immediately remove the added domain from options for instant feedback
    setDomains((prevDomains) =>
      prevDomains.filter((domain) => domain.label !== data.label),
    );
    // Refetch to sync with backend
    await fetchUserData();
  };

  // Function to handle visibility toggle and API call
  const handleToggleVisibility = async (
    index: number,
    value: boolean,
    hireDehixTalentId: string,
  ) => {
    try {
      const response = await axiosInstance.patch(
        `/business/hire-dehixtalent/${hireDehixTalentId}`,
        { visible: value },
      );

      if (response.status === 200) {
        const updatedVisibility = [...statusVisibility];
        updatedVisibility[index] = value;
        setStatusVisibility(updatedVisibility);

        // Update the skillDomainData to reflect visibility change
        const updatedSkillDomainData = [...skillDomainData];
        updatedSkillDomainData[index] = {
          ...updatedSkillDomainData[index],
          visible: value,
        };
        setSkillDomainData(updatedSkillDomainData);

        // Refetch to sync with backend and update parent filters
        await fetchUserData();
      }
    } catch (error) {
      console.error('Error updating visibility:', error);
      notifyError('Something went wrong. Please try again.', 'Error');
    }
  };

  return (
    <div className="ml-4">
      <div className="mb-8 ">
        <h1 className="text-3xl font-bold"> Hire Talent </h1>
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
              <TalentDialog
                type="skill"
                options={skills}
                onSubmit={onSubmitSkill}
              >
                <Button className="w-full sm:w-auto">
                  <Plus className="h-2 w-2" />
                  Add Skill
                </Button>
              </TalentDialog>
              <TalentDialog
                type="domain"
                options={domains}
                onSubmit={onSubmitDomain}
              >
                <Button className="w-full sm:w-auto">
                  <Plus className="h-2 w-2" />
                  Add Domain
                </Button>
              </TalentDialog>
            </div>
          </div>
          <Card className="h-[65.4vh] overflow-auto">
            <ScrollArea className="h-full">
              <Table className="w-full">
                <TableHeader className="sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Skeleton loader
                    [...Array(5)].map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-6 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : skillDomainData.length > 0 ? (
                    skillDomainData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.label}</TableCell>
                        <TableCell>{item.experience} years</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>
                          <Badge className={getBadgeColor(item.status)}>
                            {item.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={statusVisibility[index]}
                            onCheckedChange={
                              (value) =>
                                item.uid
                                  ? handleToggleVisibility(
                                      index,
                                      value,
                                      item.uid,
                                    )
                                  : console.error('UID missing for item', item) // Fallback check for missing UID
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-10">
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
                      </td>
                    </tr>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SkillDomainForm;
