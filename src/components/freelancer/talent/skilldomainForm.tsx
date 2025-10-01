'use client';
import type React from 'react';
import { useState, useEffect } from 'react';
//
import { useSelector } from 'react-redux';
import { Eye, EyeOff } from 'lucide-react';

import SkillDialog from './skillDiag';
import DomainDialog from './domainDiag';
import VerifyDialog from './verifyDialog';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { axiosInstance, cancelAllRequests } from '@/lib/axiosinstance';
import type { RootState } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { statusOutlineClasses } from '@/utils/common/getBadgeStatus';
import { StatusEnum } from '@/utils/freelancer/enum';
import { notifyError } from '@/utils/toastMessage';
import { formatCurrency } from '@/utils/format';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [, setRefreshTrigger] = useState(0);
  const [currentTab, setCurrentTab] = useState<'SKILL' | 'DOMAIN'>('SKILL');

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
          })),
        );
        setDomains(
          filteredDomains.map((domain: any) => ({
            _id: domain._id,
            label: domain.label,
          })),
        );

        // Note: removed unused counters for cleaner code
      } catch (error: any) {
        if (error?.code === 'ERR_CANCELED') return;
        console.error('Error fetching data:', error);
        notifyError('Something went wrong. Please try again.', 'Error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelAllRequests();
    };
  }, [user?.uid]);

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
      notifyError('Something went wrong. Please try again.', 'Error');
    }
  };

  return (
    <div className="p-4 sm:px-8">
      <Card className="shadow-sm">
        <CardHeader className="px-4 sm:px-7">
          <CardTitle>Dehix Talent</CardTitle>
          <CardDescription>
            Here you can add relevant skills and domains to get directly hired
            from dehix talent.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs
            value={currentTab}
            onValueChange={(v) => setCurrentTab(v as 'SKILL' | 'DOMAIN')}
          >
            <div className="border-b px-2 sm:px-6 flex items-center justify-between gap-3 flex-wrap">
              <TabsList className="bg-transparent h-12 p-0">
                <TabsTrigger
                  value="SKILL"
                  className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Skills
                </TabsTrigger>
                <TabsTrigger
                  value="DOMAIN"
                  className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Domains
                </TabsTrigger>
              </TabsList>
              <div className="flex flex-wrap gap-2 py-2 sm:py-0">
                {currentTab === 'SKILL' ? (
                  <SkillDialog
                    setSkills={setSkills}
                    skills={skills}
                    onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
                  />
                ) : (
                  <DomainDialog
                    setDomains={setDomains}
                    domains={domains}
                    onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
                  />
                )}
              </div>
            </div>

            {(['SKILL', 'DOMAIN'] as const).map((tab) => {
              const rows = skillDomainData
                .map((item, originalIndex) => ({ item, originalIndex }))
                .filter(({ item }) => item.type === tab);

              return (
                <TabsContent key={tab} value={tab} className="m-0">
                  <div className="w-full overflow-x-auto">
                    <Table className="table-auto">
                      <TableHeader className="sticky top-0 z-10 bg-background">
                        <TableRow>
                          <TableHead scope="col" className="text-center">
                            Visibility
                          </TableHead>
                          <TableHead scope="col" className="text-center">
                            Label
                          </TableHead>
                          <TableHead scope="col" className="text-center">
                            Status
                          </TableHead>
                          <TableHead scope="col" className="text-center">
                            Experience
                          </TableHead>
                          <TableHead scope="col" className="text-center">
                            Monthly Pay
                          </TableHead>
                          <TableHead scope="col" className="text-center">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          Array.from({ length: 9 }).map((_, index) => (
                            <TableRow
                              key={index}
                              className="odd:bg-background even:bg-muted/10"
                            >
                              <TableCell className="text-center">
                                <Skeleton className="h-6 w-6 rounded-md mx-auto" />
                              </TableCell>
                              <TableCell className="text-center">
                                <Skeleton className="h-6 w-24 mx-auto" />
                              </TableCell>
                              <TableCell className="text-center">
                                <Skeleton className="h-6 w-20 mx-auto" />
                              </TableCell>
                              <TableCell className="text-center">
                                <Skeleton className="h-6 w-16 mx-auto" />
                              </TableCell>
                              <TableCell className="text-center">
                                <Skeleton className="h-6 w-20 mx-auto" />
                              </TableCell>
                              <TableCell className="text-center">
                                <Skeleton className="h-6 w-20 mx-auto" />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : rows.length > 0 ? (
                          rows.map(({ item, originalIndex }) => (
                            <TableRow
                              key={item.uid ?? `${item.label}-${originalIndex}`}
                              className="hover:bg-muted/30"
                            >
                              <TableCell className="text-center">
                                <TooltipProvider delayDuration={150}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        onClick={() =>
                                          item.uid
                                            ? handleToggleVisibility(
                                                originalIndex,
                                                !statusVisibility[
                                                  originalIndex
                                                ],
                                                item.uid,
                                              )
                                            : console.error(
                                                'UID missing for item',
                                                item,
                                              )
                                        }
                                        aria-label={`Toggle visibility for ${item.label}`}
                                      >
                                        {statusVisibility[originalIndex] ? (
                                          <Eye className="h-4 w-4 text-blue-500" />
                                        ) : (
                                          <EyeOff className="h-4 w-4 text-red-500" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" sideOffset={6}>
                                      {statusVisibility[originalIndex]
                                        ? 'Visible on profile'
                                        : 'Hidden from profile'}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                              <TableCell className="text-center">
                                {item.label}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  className={statusOutlineClasses(item.status)}
                                >
                                  {item?.status?.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                {item.experience} yrs
                              </TableCell>
                              <TableCell className="text-center">
                                {formatCurrency(item.monthlyPay)}
                              </TableCell>

                              <TableCell className="text-center">
                                {item.status.toUpperCase() ===
                                  StatusEnum.PENDING && item.uid ? (
                                  <VerifyDialog
                                    talentType={item.type}
                                    _id={item.uid}
                                    userId={user.uid}
                                    originalTalentId={item.originalTalentId}
                                  />
                                ) : (
                                  <span className="text-muted-foreground text-xs">
                                    —
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center">
                              <div className="py-10">
                                <svg
                                  width="140"
                                  height="90"
                                  viewBox="0 0 140 90"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="mx-auto mb-3 opacity-80"
                                >
                                  <defs>
                                    <linearGradient
                                      id="talentEmpty"
                                      x1="0"
                                      x2="1"
                                      y1="0"
                                      y2="1"
                                    >
                                      <stop
                                        offset="0%"
                                        stopColor="#cbd5e1"
                                        stopOpacity="0.6"
                                      />
                                      <stop
                                        offset="100%"
                                        stopColor="#a3a3a3"
                                        stopOpacity="0.3"
                                      />
                                    </linearGradient>
                                  </defs>
                                  <rect
                                    x="12"
                                    y="28"
                                    width="20"
                                    height="40"
                                    rx="4"
                                    fill="url(#talentEmpty)"
                                  />
                                  <rect
                                    x="40"
                                    y="20"
                                    width="20"
                                    height="48"
                                    rx="4"
                                    fill="url(#talentEmpty)"
                                  />
                                  <rect
                                    x="68"
                                    y="34"
                                    width="20"
                                    height="34"
                                    rx="4"
                                    fill="url(#talentEmpty)"
                                  />
                                  <rect
                                    x="96"
                                    y="26"
                                    width="20"
                                    height="42"
                                    rx="4"
                                    fill="url(#talentEmpty)"
                                  />
                                </svg>
                                <p className="text-sm text-muted-foreground">
                                  No entries yet. Add your first{' '}
                                  {tab === 'SKILL' ? 'skill' : 'domain'} to
                                  appear here.
                                </p>
                                <div className="mt-4 flex items-center justify-center gap-2">
                                  {tab === 'SKILL' ? (
                                    <SkillDialog
                                      setSkills={setSkills}
                                      skills={skills}
                                      onSuccess={() =>
                                        setRefreshTrigger((prev) => prev + 1)
                                      }
                                    />
                                  ) : (
                                    <DomainDialog
                                      setDomains={setDomains}
                                      domains={domains}
                                      onSuccess={() =>
                                        setRefreshTrigger((prev) => prev + 1)
                                      }
                                    />
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillDomainForm;
