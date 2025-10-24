import React, { useState, useEffect, useCallback } from 'react';
import { PackageOpen, Users } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { axiosInstance } from '@/lib/axiosinstance';
import { Switch } from '@/components/ui/switch';
import { RootState } from '@/lib/store';
import { notifyError } from '@/utils/toastMessage';
import { Badge } from '@/components/ui/badge';
import { getBadgeColor } from '@/utils/common/getBadgeStatus';

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
  const router = useRouter();

  // Get the user data from Redux store
  const user = useSelector((state: RootState) => state.user);
  
  // Handle manage button click
  const handleManageClick = (item: SkillDomainData) => {
    const type = item.label.toLowerCase().includes('skill') ? 'skill' : 'domain';
    
    // Create a clean object with only the data we need
    const itemData = {
      id: item.uid,
      label: item.label,
      type: type,
      // Add any other properties you need from the item
      ...(item.description && { description: item.description }),
      ...(item.status && { status: item.status }),
      // Add other properties as needed
    };

    // Stringify the data and encode it for URL
    const itemDataString = encodeURIComponent(JSON.stringify(itemData));
    
    // Navigate to the skills page with the item data in the URL
    router.push(`/business/talent/skills/${item.uid}?type=${type}&data=${itemDataString}`);
  };

  // Fetch skills and domains once on component mount
  useEffect(() => {
    const fetchSkillsAndDomains = async () => {
      try {
        const [skillsResponse, domainsResponse] = await Promise.all([
          axiosInstance.get('/skills'),
          axiosInstance.get('/domain'),
        ]);

        setSkills(skillsResponse.data?.data || []);
        setDomains(domainsResponse.data?.data || []);
      } catch (error) {
        console.error('Error fetching skills and domains:', error);
        notifyError(
          'Failed to load skills and domains. Please try again.',
          'Error',
        );
      }
    };

    fetchSkillsAndDomains();
  }, []); // Empty dependency array ensures this runs only once

  // Fetch user's skill/domain data
  const fetchUserData = useCallback(async () => {
    try {
      const skillsResponse = await axiosInstance.get('/skills');
      if (skillsResponse?.data?.data) {
        setSkills(skillsResponse.data.data);
      } else {
        throw new Error('Skills response is null or invalid');
      }
      const domainsResponse = await axiosInstance.get('/domain');
      if (domainsResponse?.data?.data) {
        setDomains(domainsResponse.data.data);
      } else {
        throw new Error('Domains response is null or invalid');
      }

      // Fetch the skill/domain data for the specific freelancer
      if (user?.uid) {
        const hireTalentResponse = await axiosInstance.get(
          `/business/hire-dehixtalent`,
        );
        const hireTalentData = hireTalentResponse.data?.data || {};
        console.log(hireTalentData);

        // Filter and map user data using the new field names and type
        const fetchedFilterSkills = hireTalentData
          .filter((item: any) => item.talentName && item.visible && item.type === 'SKILL')
          .map((item: any) => ({
            _id: item.talentId,
            label: item.talentName,
          }));

        const fetchedFilterDomains = hireTalentData
          .filter((item: any) => item.talentName && item.visible && item.type === 'DOMAIN')
          .map((item: any) => ({
            _id: item.talentId,
            label: item.talentName,
          }));

        // Send the filtered skills and domains back to the parent
        setFilterSkill(fetchedFilterSkills);
        setFilterDomain(fetchedFilterDomains);

        // Convert the talent object into an array with unique keys
        const formattedHireTalentData = Object.values(hireTalentData).map(
          (item: any) => ({
            uid: `${item.talentId}_${item.type}`, // Combine talentId and type for unique key
            label: item.talentName || 'N/A',
            experience: item.experience || 'N/A',
            description: item.description || 'N/A',
            status: item.status,
            visible: item.visible,
            type: item.type, // Keep type for filtering
          }),
        );

        setSkillDomainData(formattedHireTalentData);
        setStatusVisibility(
          formattedHireTalentData.map((item) => item.visible),
        );

        const filterSkills = hireTalentData
          .filter((item: any) => item.skillName)
          .map((item: any) => ({
            _id: item.skillId,
            label: item.skillName,
          }));

        const filterDomains = hireTalentData
          .filter((item: any) => item.domainName)
          .map((item: any) => ({
            _id: item.domainId,
            label: item.domainName,
          }));

        // fetch skills and domains data
        const skillsResponse = await axiosInstance.get('/skills');
        if (skillsResponse?.data?.data) {
          const uniqueSkills = skillsResponse.data.data.filter(
            (skill: any) =>
              !filterSkills.some(
                (filterSkill: any) => filterSkill._id === skill._id,
              ),
          );
          setSkills(uniqueSkills);
        } else {
          throw new Error('Skills response is null or invalid');
        }
        const domainsResponse = await axiosInstance.get('/domain');
        if (domainsResponse?.data?.data) {
          const uniqueDomain = domainsResponse.data.data.filter(
            (domain: any) =>
              !filterDomains.some(
                (filterDomain: any) => filterDomain._id === domain._id,
              ),
          );
          setDomains(uniqueDomain);
        } else {
          throw new Error('Domains response is null or invalid');
        }
      }
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
        await fetchUserData();
      }
    } catch (error) {
    }
    
    return skillDomainData.map((item, index) => (
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
        <TableCell>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleManageClick(item)}
            className="flex items-center gap-1"
          >
            <Users className="h-4 w-4" />
            <span>Manage</span>
          </Button>
        </TableCell>
      </TableRow>
    ));
  }

  const [activeTab, setActiveTab] = useState<'skills' | 'domains'>('skills');

  // Separate skills and domains
  const skillsData = skillDomainData.filter(item => 
    skills.some(skill => skill.label === item.label)
  );
  
  const domainsData = skillDomainData.filter(item => 
    domains.some(domain => domain.label === item.label)
  );
  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Skills & Domains</h2>
        <div className="flex space-x-2">
          {activeTab === 'skills' ? (
            <SkillDialog skills={skills} onSubmitSkill={onSubmitSkill} />
          ) : (
            <DomainDialog onSave={onSubmitDomain} />
          )}
        </div>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as 'skills' | 'domains')}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="skills">
            Skills {skillsData.length > 0 && `(${skillsData.length})`}
          </TabsTrigger>
          <TabsTrigger value="domains">
            Domains {domainsData.length > 0 && `(${domainsData.length})`}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="skills">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="animate-pulse flex justify-center">
                      <div className="h-2 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : skillsData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                      <PackageOpen className="h-10 w-10" />
                      <p>No skills added yet</p>
                      <p className="text-sm">Add your first skill to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                skillsData.map((item, index) => (
                  <TableRow key={item.uid}>
                    <TableCell>{item.label}</TableCell>
                    <TableCell>{item.experience} years</TableCell>
                    <TableCell>
                      <Badge className={getBadgeColor(item.status)}>
                        {item.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        <Switch
                          checked={statusVisibility[index]}
                          onCheckedChange={(value) =>
                            item.uid && handleToggleVisibility(index, value, item.uid)
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell className="py-4 pr-4">
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleManageClick(item)}
                          className="flex items-center gap-1.5 px-3"
                        >
                          <Users className="h-4 w-4" />
                          <span>Manage</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="domains">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="animate-pulse flex justify-center">
                      <div className="h-2 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : domainsData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                      <PackageOpen className="h-10 w-10" />
                      <p>No domains added yet</p>
                      <p className="text-sm">Add your first domain to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                domainsData.map((item, index) => (
                  <TableRow key={item.uid}>
                    <TableCell>{item.label}</TableCell>
                    <TableCell>{item.experience} years</TableCell>
                    <TableCell>
                      <Badge className={getBadgeColor(item.status)}>
                        {item.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        <Switch
                          checked={statusVisibility[index]}
                          onCheckedChange={(value) =>
                            item.uid && handleToggleVisibility(index, value, item.uid)
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell className="py-4 pr-4">
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleManageClick(item)}
                          className="flex items-center gap-1.5 px-3"
                        >
                          <Users className="h-4 w-4" />
                          <span>Manage</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SkillDomainForm;
