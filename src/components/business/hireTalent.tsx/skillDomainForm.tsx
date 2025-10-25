import React, { FC, useEffect, useState, useCallback } from 'react';
import { PackageOpen, Plus, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import SkillDialog from './skillDiag';
import DomainDialog from './domainDiag';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { axiosInstance } from '@/lib/axiosinstance';

interface Skill {
  _id: string;
  label: string;
}
interface Domain {
  _id: string;
  label: string;
}

interface FilterItem {
  _id: string;
  label: string;
}

interface SkillDomainFormProps {
  setFilterSkill: (
    skills: FilterItem[] | ((prev: FilterItem[]) => FilterItem[]),
  ) => void;
  setFilterDomain: (
    domains: FilterItem[] | ((prev: FilterItem[]) => FilterItem[]),
  ) => void;
}

interface SkillDomainData {
  _id: string;
  businessId: string;
  talentId: string;
  talentName: string;
  type: 'SKILL' | 'DOMAIN';
  description: string;
  experience: string;
  status: string;
  visible: boolean;
  bookmarked?: boolean;
  freelancerRequired?: number;
  freelancers: any[];
  createdAt: string;
  updatedAt: string;
  // For backward compatibility
  uid?: string;
  label?: string;
  [key: string]: any;
}

interface Freelancer {
  _id: string;
  name: string;
  email: string;
}

const getBadgeColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

const SkillDomainForm: FC<SkillDomainFormProps> = ({
  setFilterSkill,
  setFilterDomain,
}) => {
  const [skillDomainData, setSkillDomainData] = useState<SkillDomainData[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SkillDomainData | null>(
    null,
  );
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [statusVisibility, setStatusVisibility] = useState<boolean[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);

  // Get the user data from Redux store
  const user = { uid: 'current-user-id' }; // Replace with actual user from your auth context

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

  // Separate skills and domains based on type (uppercase)
  const skillsData = React.useMemo<SkillDomainData[]>(
    () =>
      skillDomainData.filter((item: SkillDomainData) => item.type === 'SKILL'),
    [skillDomainData],
  );
  console.log('skillDomainData');
  console.log(skillDomainData);
  console.log('skillsData');
  console.log(skillsData);

  const domainsData = React.useMemo<SkillDomainData[]>(
    () =>
      skillDomainData.filter((item: SkillDomainData) => item.type === 'DOMAIN'),
    [skillDomainData],
  );
  console.log('domainsData');
  console.log(domainsData);

  // Skeleton loader component
  const renderSkeletonLoader = () => {
    return [...Array(5)].map((_, index) => (
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
        <TableCell>
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </TableCell>
      </TableRow>
    ));
  };

  // Helper function to render the table for either skills or domains
  const renderTable = (data: SkillDomainData[], type: 'skill' | 'domain') => {
    if (isLoading) {
      return (
        <Card className="h-[65.4vh] overflow-auto no-scrollbar">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((_, index) => (
                <TableRow key={index}>
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
                  <TableCell>
                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      );
    }

    return (
      <Card className="h-[65.4vh] overflow-auto no-scrollbar">
        <Table className="w-full">
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <PackageOpen className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500">
                      No {type}s found. Add your first {type} to get started.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => {
                const itemKey = item.uid || item._id || index;
                return (
                  <TableRow key={itemKey}>
                    <TableCell>
                      {item.label ||
                        (type === 'skill' ? item.skillName : item.domainName) ||
                        'N/A'}
                    </TableCell>
                    <TableCell>{item.experience || '0'} years</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.description || 'No description'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getBadgeColor(item.status || 'active')}>
                        {(item.status || 'ACTIVE').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={item.visible ?? false}
                        onCheckedChange={(value) =>
                          item.uid
                            ? handleToggleVisibility(index, value, item.uid)
                            : console.error('UID missing for item', item)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => item && handleManageTalents(item)}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    );
  };

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
        console.log('hireTalentData');
        console.log(hireTalentData);
        // Filter and map user data
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

        // Send the filtered skills and domains back to the parent
        setFilterSkill(fetchedFilterSkills);
        setFilterDomain(fetchedFilterDomains);

        // Convert the talent object into an array with all fields
        const formattedHireTalentData = Object.values(hireTalentData).map(
          (item: any) => ({
            ...item, // Spread all existing properties
            uid: item._id,
            label: item.talentName || item.domainName || 'N/A',
            // Keep the existing mappings but don't override the spread
            experience: item.experience || 'N/A',
            description: item.description || 'N/A',
            status: item.status,
            visible: item.visible,
          }),
        );
        console.log('formattedHireTalentData');
        console.log(formattedHireTalentData);

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

  const notifyError = (message: string, title = 'Error') => {
    toast({
      title,
      description: message,
      variant: 'destructive',
    });
  };

  // Handle adding a new skill
  const onSubmitSkill = (skill: any) => {
    const newSkill: SkillDomainData = {
      ...skill,
      _id: `temp-${Date.now()}`,
      businessId: user?.uid || '',
      talentId: skill._id || skill.talentId,
      talentName: skill.label || skill.talentName,
      type: 'SKILL',
      description: skill.description || '',
      experience: skill.experience || '0',
      status: 'ADDED',
      visible: true,
      freelancers: [],
      freelancerRequired: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSkillDomainData((prev: SkillDomainData[]) => [...prev, newSkill]);
    setFilterSkill((prev: FilterItem[]) => [
      ...prev,
      { _id: newSkill.talentId, label: newSkill.talentName },
    ]);
  };

  // Handle adding a new domain
  const onSubmitDomain = (domain: any) => {
    const newDomain: SkillDomainData = {
      ...domain,
      _id: `temp-${Date.now()}`,
      businessId: user?.uid || '',
      talentId: domain._id || domain.talentId,
      talentName: domain.label || domain.talentName,
      type: 'DOMAIN',
      description: domain.description || '',
      experience: domain.experience || '0',
      status: 'ADDED',
      visible: true,
      freelancers: [],
      freelancerRequired: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSkillDomainData((prev: SkillDomainData[]) => [...prev, newDomain]);
    setFilterDomain((prev: FilterItem[]) => [
      ...prev,
      { _id: newDomain.talentId, label: newDomain.talentName },
    ]);
  };

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
  // const onSubmitSkill = (data: SkillDomainData) => {
  //   setSkillDomainData([
  //     ...skillDomainData,
  //     { ...data, status: 'ADDED', visible: false },
  //   ]);
  //   setStatusVisibility([...statusVisibility, false]);
  // };

  // const onSubmitDomain = (data: SkillDomainData) => {
  //   setSkillDomainData([
  //     ...skillDomainData,
  //     { ...data, status: 'ADDED', visible: false },
  //   ]);
  //   setStatusVisibility([...statusVisibility, false]);
  // };

  // Function to handle visibility toggle and API call
  // const handleToggleVisibility = async (
  //   index: number,
  //   value: boolean,
  //   hireDehixTalentId: string,
  // ) => {
  //   try {
  //     // Optimistically update the UI
  //     const updatedData = [...skillDomainData];
  //     updatedData[index] = { ...item, visible: newValue };
  //     setSkillDomainData(updatedData);

  //     // Update the filtered data as well
  //     if (item.type === 'SKILL') {
  //       setFilterSkill(prev => {
  //         const updated = [...prev];
  //         const itemIndex = updated.findIndex(i => i._id === item._id);
  //         if (itemIndex !== -1) {
  //           updated[itemIndex] = { ...updated[itemIndex], visible: newValue };
  //         }
  //         return updated;
  //       });
  //     } else {
  //       setFilterDomain(prev => {
  //         const updated = [...prev];
  //         const itemIndex = updated.findIndex(i => i._id === item._id);
  //         if (itemIndex !== -1) {
  //           updated[itemIndex] = { ...updated[itemIndex], visible: newValue };
  //         }
  //         return updated;
  //       });
  //     }

  //     // Make the API call
  //     const response = await axiosInstance.patch(
  //       `/business/hire-dehixtalent/${item._id}`,
  //       {
  //         visible: newValue,
  //         type: item.type
  //       },
  //     );

  //     if (response.status !== 200) {
  //       throw new Error('Failed to update visibility');
  //     }
  //   } catch (error) {
  //     console.error('Error updating visibility:', error);
  //     // Revert the UI on error
  //     const revertedData = [...skillDomainData];
  //     revertedData[index] = { ...item, visible: !newValue };
  //     setSkillDomainData(revertedData);

  //     notifyError('Failed to update visibility. Please try again.', 'Error');
  //   }
  // };
  const handleToggleVisibility = async (
    index: number,
    value: boolean,
    hireDehixTalentId: string,
  ) => {
    // Use functional update to get the latest state
    setSkillDomainData(prevData => {
      const item = prevData[index];
      if (!item) return prevData;

      // Create new array with the updated item
      const newData = [...prevData];
      newData[index] = { ...item, visible: value };

      // Update filter with the latest data
      const updateFilter = item.type === 'SKILL' ? setFilterSkill : setFilterDomain;
      updateFilter(prevFilter => {
        if (value) {
          return prevFilter.some(f => f._id === item.talentId)
            ? prevFilter
            : [...prevFilter, { _id: item.talentId, label: item.talentName }];
        }
        return prevFilter.filter(f => f._id !== item.talentId);
      });

      // Make the API call
      (async () => {
        try {
          await axiosInstance.patch(
            `/business/hire-dehixtalent/${hireDehixTalentId}`,
            { visible: value },
          );
          
          // Refresh data after successful update
          await fetchUserData();
        } catch (error) {
          console.error('Error updating visibility:', error);
          notifyError('Something went wrong. Please try again.', 'Error');
          
          // Revert changes on error
          setSkillDomainData(prev => {
            const revertedData = [...prev];
            revertedData[index] = { ...item, visible: !value };
            return revertedData;
          });
          
          // Revert filter
          updateFilter(prevFilter => {
            if (!value) {
              return [...prevFilter, { _id: item.talentId, label: item.talentName }];
            }
            return prevFilter.filter(f => f._id !== item.talentId);
          });
        }
      })();

      return newData;
    });
  };

  // Handle managing talents for a specific item
  const handleManageTalents = (item: SkillDomainData) => {
    console.log('item from Form', item);
    const talentData = encodeURIComponent(
      JSON.stringify({
        ...item,
        freelancers: item.freelancers || [],
      }),
    );
    router.push(
      `/business/talent/manage?talentId=${item.uid}&data=${talentData}`,
    );
  };

  // Handle closing the dialog
  const handleCloseDialog = () => {
    setIsManageDialogOpen(false);
    setSelectedItem(null);
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

      <Tabs defaultValue="skills" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="domains">Domains</TabsTrigger>
          </TabsList>
          <div className="space-x-2">
            <TabsContent value="skills" className="m-0">
              <SkillDialog skills={skills} onSubmitSkill={onSubmitSkill} />
            </TabsContent>
            <TabsContent value="domains" className="m-0">
              <DomainDialog domains={domains} onSubmitDomain={onSubmitDomain} />
            </TabsContent>
          </div>
        </div>

        <TabsContent value="skills">
          <Card className="h-[65.4vh] overflow-auto no-scrollbar">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead>Skill</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  renderSkeletonLoader()
                ) : skillsData.length > 0 ? (
                  skillsData.map((item, index) => (
                    <TableRow key={item.uid || index}>
                      <TableCell>
                        {item.talentName || item.label || 'N/A'}
                      </TableCell>
                      <TableCell>{item.experience} years</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.description}
                      </TableCell>
                      <TableCell>
                        <Badge className={getBadgeColor(item.status)}>
                          {item.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={item.visible ?? false}
                          onCheckedChange={(value) =>
                            item.uid
                              ? handleToggleVisibility(index, value, item.uid)
                              : console.error('UID missing for item', item)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageTalents(item)}
                        >
                          Manage Talents
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center">
                        <PackageOpen
                          className="mx-auto text-gray-500"
                          size={100}
                        />
                        <p className="text-gray-500 mt-4">
                          No skills added yet.
                          <br />
                          Add your first skill to get started.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="domains">
          <Card className="h-[65.4vh] overflow-auto no-scrollbar">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  renderSkeletonLoader()
                ) : domainsData.length > 0 ? (
                  domainsData.map((item, index) => (
                    <TableRow key={item.uid || index}>
                      <TableCell>{item.talentName}</TableCell>
                      <TableCell>{item.experience} years</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.description}
                      </TableCell>
                      <TableCell>
                        <Badge className={getBadgeColor(item.status)}>
                          {item.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={statusVisibility[index]}
                          onCheckedChange={
                            (value) => {
                              console.log(value);
                              item.uid
                                ? handleToggleVisibility(index, value, item.uid)
                                : console.error('UID missing for item', item);
                            } // Fallback check for missing UID
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageTalents(item)}
                        >
                          Manage Talents
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center">
                        <PackageOpen
                          className="mx-auto text-gray-500"
                          size={100}
                        />
                        <p className="text-gray-500 mt-4">
                          No domains added yet.
                          <br />
                          Add your first domain to get started.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Manage Talents Dialog */}
      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Manage Talents - {selectedItem?.label || ''}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className="text-sm">{selectedItem.type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Experience
                  </p>
                  <p className="text-sm">
                    {selectedItem?.experience || 'N/A'} years
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">
                    Description
                  </p>
                  <p className="text-sm">
                    {selectedItem?.description || 'No description provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge
                    className={
                      selectedItem?.status
                        ? getBadgeColor(selectedItem.status)
                        : ''
                    }
                  >
                    {selectedItem?.status?.toUpperCase() || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Visibility
                  </p>
                  <p className="text-sm">
                    {selectedItem?.visible ? 'Visible' : 'Hidden'}
                  </p>
                </div>
                {selectedItem?.createdAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="text-sm">
                      {new Date(
                        selectedItem?.createdAt || '',
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <p className="text-sm text-gray-500 mb-2">
                  Talent matching this {selectedItem?.type || 'requirement'}:
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-center text-gray-500">
                    Talent list will be shown here
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SkillDomainForm;
