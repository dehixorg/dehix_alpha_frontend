'use client';
import type React from 'react';
import { useState, useEffect } from 'react';
//
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
import { axiosInstance, cancelAllRequests } from '@/lib/axiosinstance';
import { Switch } from '@/components/ui/switch';
import type { RootState } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getBadgeColor } from '@/utils/common/getBadgeStatus';
import { StatusEnum } from '@/utils/freelancer/enum';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/utils/format';

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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong.Please try again.',
      }); // Error toast
    }
  };

  return (
    <div className="p-4 sm:px-8">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2">
          <h2 className="hidden md:block text-2xl sm:text-3xl font-bold tracking-tight">
            Dehix Talent
          </h2>
          <p className="hidden md:block text-muted-foreground">
            Here you can add relevant skills and domains to get directly hired
            from dehix talent.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <SkillDialog
                setSkills={setSkills}
                skills={skills}
                onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
              />
              <DomainDialog
                setDomains={setDomains}
                domains={domains}
                onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
              />
            </div>
          </div>

          <Card>
            <div className="w-full overflow-x-auto">
              <Table className="table-auto">
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead scope="col">Type</TableHead>
                    <TableHead scope="col">Label</TableHead>
                    <TableHead scope="col">Experience</TableHead>
                    <TableHead scope="col" className="text-center">
                      Monthly Pay
                    </TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col" className="text-right">
                      Visibility
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 9 }).map((_, index) => (
                      <TableRow
                        key={index}
                        className="odd:bg-background even:bg-muted/10 hover:bg-muted/30"
                      >
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
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
                        <TableCell className="text-right">
                          <Skeleton className="h-6 w-12 rounded-xl" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : skillDomainData.length > 0 ? (
                    skillDomainData.map((item, index) => (
                      <TableRow
                        key={index}
                        className="odd:bg-background even:bg-muted/10 hover:bg-muted/30"
                      >
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {item.type === 'SKILL' ? 'SKILL' : 'DOMAIN'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.label}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.experience} yrs
                        </TableCell>
                        <TableCell className="text-center">
                          {formatCurrency(item.monthlyPay)}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.status.toUpperCase() === StatusEnum.PENDING &&
                          item.uid ? (
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
                        <TableCell className="text-center">
                          <Switch
                            checked={statusVisibility[index]}
                            onCheckedChange={(value) =>
                              item.uid
                                ? handleToggleVisibility(index, value, item.uid)
                                : console.error('UID missing for item', item)
                            }
                            aria-label={`Toggle visibility for ${item.label}`}
                          />
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
                            No entries yet. Add your first skill or domain to
                            appear here.
                          </p>
                          <div className="mt-4 flex items-center justify-center gap-2">
                            <SkillDialog
                              setSkills={setSkills}
                              skills={skills}
                              onSuccess={() =>
                                setRefreshTrigger((prev) => prev + 1)
                              }
                            />
                            <DomainDialog
                              setDomains={setDomains}
                              domains={domains}
                              onSuccess={() =>
                                setRefreshTrigger((prev) => prev + 1)
                              }
                            />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SkillDomainForm;
