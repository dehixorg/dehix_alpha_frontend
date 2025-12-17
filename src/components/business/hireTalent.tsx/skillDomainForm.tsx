import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { notifyError } from '@/utils/toastMessage';
import { Badge } from '@/components/ui/badge';
import { getBadgeColor } from '@/utils/common/getBadgeStatus';
import { RootState } from '@/lib/store';

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
  skills?: Skill[];
  domains?: Domain[];
  hireItems?: any[];
  skillDomainData?: SkillDomainData[];
  setSkillDomainData?: (next: SkillDomainData[]) => void;
  statusVisibility?: boolean[];
  setStatusVisibility?: (next: boolean[]) => void;
  isLoading?: boolean;
  refreshData?: () => Promise<void>;
}

const SkillDomainForm: React.FC<SkillDomainFormProps> = ({
  setFilterSkill,
  setFilterDomain,
  skills: skillsProp,
  domains: domainsProp,
  skillDomainData: skillDomainDataProp,
  setSkillDomainData: setSkillDomainDataProp,
  statusVisibility: statusVisibilityProp,
  setStatusVisibility: setStatusVisibilityProp,
  isLoading: isLoadingProp,
  refreshData: refreshDataProp,
}) => {
  const user = useSelector((state: RootState) => state.user);

  const isControlled = useMemo(() => {
    return (
      Array.isArray(skillsProp) &&
      Array.isArray(domainsProp) &&
      Array.isArray(skillDomainDataProp) &&
      Array.isArray(statusVisibilityProp) &&
      typeof setSkillDomainDataProp === 'function' &&
      typeof setStatusVisibilityProp === 'function' &&
      typeof refreshDataProp === 'function'
    );
  }, [
    skillsProp,
    domainsProp,
    skillDomainDataProp,
    statusVisibilityProp,
    setSkillDomainDataProp,
    setStatusVisibilityProp,
    refreshDataProp,
  ]);

  // Backward-compatible internal state (used only when parent doesn't control data)
  const [skillsState, setSkillsState] = useState<Skill[]>([]);
  const [domainsState, setDomainsState] = useState<Domain[]>([]);
  const [skillDomainDataState, setSkillDomainDataState] = useState<
    SkillDomainData[]
  >([]);
  const [statusVisibilityState, setStatusVisibilityState] = useState<boolean[]>(
    [],
  );
  const [isLoadingState, setIsLoadingState] = useState(true);

  const skills = isControlled ? (skillsProp as Skill[]) : skillsState;
  const domains = isControlled ? (domainsProp as Domain[]) : domainsState;
  const skillDomainData = isControlled
    ? (skillDomainDataProp as SkillDomainData[])
    : skillDomainDataState;
  const statusVisibility = isControlled
    ? (statusVisibilityProp as boolean[])
    : statusVisibilityState;
  const setSkillDomainData = isControlled
    ? (setSkillDomainDataProp as (next: SkillDomainData[]) => void)
    : setSkillDomainDataState;
  const setStatusVisibility = isControlled
    ? (setStatusVisibilityProp as (next: boolean[]) => void)
    : setStatusVisibilityState;
  const isLoading = isControlled ? Boolean(isLoadingProp) : isLoadingState;
  const refreshData = isControlled
    ? (refreshDataProp as () => Promise<void>)
    : async () => {
        // legacy refresh = refetch
        await fetchUserData();
      };

  const fetchUserData = useCallback(async () => {
    try {
      // fetch skills/domains for dialogs
      const [skillsResponse, domainsResponse] = await Promise.all([
        axiosInstance.get('/skills'),
        axiosInstance.get('/domain'),
      ]);
      setSkillsState(skillsResponse.data?.data || []);
      setDomainsState(domainsResponse.data?.data || []);

      if (user?.uid) {
        const hireTalentResponse = await axiosInstance.get(
          `/business/hire-dehixtalent`,
        );
        const hireTalentData = hireTalentResponse.data?.data || [];

        const fetchedFilterSkills = (hireTalentData || [])
          .filter((item: any) => item.type === 'SKILL' && item.visible)
          .map((item: any) => ({
            _id: item.talentId || item._id,
            label: item.talentName,
          }));

        const fetchedFilterDomains = (hireTalentData || [])
          .filter((item: any) => item.type === 'DOMAIN' && item.visible)
          .map((item: any) => ({
            _id: item.talentId || item._id,
            label: item.talentName,
          }));

        setFilterSkill(fetchedFilterSkills);
        setFilterDomain(fetchedFilterDomains);

        const formattedHireTalentData = (hireTalentData || []).map(
          (item: any) => ({
            uid: item._id,
            label: item.talentName || 'N/A',
            experience: item.experience || 'N/A',
            description: item.description || 'N/A',
            status: item.status,
            visible: item.visible,
          }),
        );

        setSkillDomainDataState(formattedHireTalentData);
        setStatusVisibilityState(
          formattedHireTalentData.map((item: any) => Boolean(item.visible)),
        );
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      notifyError('Something went wrong. Please try again.', 'Error');
    }
  }, [setFilterSkill, setFilterDomain, user?.uid]);

  useEffect(() => {
    if (isControlled) return;
    const run = async () => {
      setIsLoadingState(true);
      try {
        await fetchUserData();
      } finally {
        setIsLoadingState(false);
      }
    };
    void run();
  }, [fetchUserData, isControlled]);

  // Handle skill/domain submission
  const onSubmitSkill = (data: SkillDomainData) => {
    setSkillDomainData([
      ...skillDomainData,
      { ...data, status: 'ADDED', visible: false },
    ]);
    setStatusVisibility([...statusVisibility, false]);
  };

  const onSubmitDomain = (data: SkillDomainData) => {
    setSkillDomainData([
      ...skillDomainData,
      { ...data, status: 'ADDED', visible: false },
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
        `/business/hire-dehixtalent/${hireDehixTalentId}`,
        { visible: value },
      );

      if (response.status === 200) {
        const updatedVisibility = [...statusVisibility];
        updatedVisibility[index] = value;
        setStatusVisibility(updatedVisibility);

        // Callback to refetch data after visibility update
        await refreshData();
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
              <SkillDialog skills={skills} onSubmitSkill={onSubmitSkill} />
              <DomainDialog domains={domains} onSubmitDomain={onSubmitDomain} />
            </div>
          </div>
          <Card className="h-[65.4vh] overflow-auto no-scrollbar">
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
                                ? handleToggleVisibility(index, value, item.uid)
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
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SkillDomainForm;
