'use client';
import type React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { ArrowUpRight } from 'lucide-react';

import { TableSelect } from '../../custom-table/TableSelect';

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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { axiosInstance, cancelAllRequests } from '@/lib/axiosinstance';
import type { RootState } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getBadgeColor } from '@/utils/common/getBadgeStatus';
import { StatusEnum } from '@/utils/freelancer/enum';
import { notifyError } from '@/utils/toastMessage';
import { formatCurrency } from '@/utils/format';
import { Switch } from '@/components/ui/switch';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(10);

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
        // fetch skills
        const skillsResponse = await axiosInstance.get('/skills');
        const skillsArray = skillsResponse.data?.data || [];

        // fetch domains
        const domainsResponse = await axiosInstance.get('/domain');
        const domainsArray = domainsResponse.data?.data || [];

        // fetch talent data
        let talentResponse = {
          data: { data: {}, pagination: { totalPages: 0 } },
        };
        if (user?.uid) {
          talentResponse = await axiosInstance.get(
            `/freelancer/${user.uid}/dehix-talent?page=${currentPage}&limit=${limit}`,
          );
        }

        const talentData = Array.isArray(talentResponse.data?.data)
          ? talentResponse.data.data
          : Object.values(talentResponse.data?.data || {});
        const flattenedTalentData = talentData.flat();

        const formattedTalentData = flattenedTalentData.map((item: any) => ({
          uid: item._id,
          label: item.talentName || 'N/A',
          experience: item.experience || 'N/A',
          monthlyPay: item.monthlyPay || 'N/A',
          status: item.status,
          activeStatus: item.activeStatus,
          type: item.type,
          originalTalentId: item.talentId,
        }));

        // deduplicate and filter
        const deduplicatedData = removeDuplicates(formattedTalentData);
        setSkillDomainData(deduplicatedData);
        setStatusVisibility(deduplicatedData.map((item) => item.activeStatus));
        setTotalPages(talentResponse.data.pagination.totalPages);

        // filter global skills/domains
        const usedTalentIds = new Set(
          formattedTalentData
            .map((item) => item.originalTalentId)
            .filter(Boolean),
        );

        setSkills(
          skillsArray
            .filter((s: any) => !usedTalentIds.has(s._id))
            .map((s: any) => ({ _id: s._id, label: s.label })),
        );

        setDomains(
          domainsArray
            .filter((d: any) => !usedTalentIds.has(d._id))
            .map((d: any) => ({ _id: d._id, label: d.label })),
        );
      } catch (error: any) {
        if (error?.code === 'ERR_CANCELED') return;
        console.error('Error fetching data:', error);
        notifyError('Something went wrong. Please try again.', 'Error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    return () => cancelAllRequests();
  }, [user?.uid, refreshTrigger, currentPage, limit]);

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

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setCurrentPage(1);
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

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <SkillDialog
                skills={skills}
                onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
              />

              <DomainDialog
                domains={domains}
                onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
              />
            </div>
            <TableSelect
              currValue={limit}
              label="Items Per Page"
              values={[10, 15, 20, 25]}
              setCurrValue={handleLimitChange}
            />
          </div>

          <Card>
            <div className="w-full overflow-x-auto">
              <Table className="table-auto">
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead scope="col">Type</TableHead>
                    <TableHead scope="col" className="text-center">
                      Label
                    </TableHead>
                    <TableHead scope="col" className="text-center">
                      Experience
                    </TableHead>
                    <TableHead scope="col" className="text-center">
                      Monthly Pay
                    </TableHead>
                    <TableHead scope="col" className="text-center">
                      Status
                    </TableHead>
                    <TableHead scope="col" className="text-center">
                      Visibility
                    </TableHead>
                    <TableHead scope="col" className="text-center">
                      Manage
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
                        <TableCell className="text-center">
                          {item.type && item.originalTalentId ? (
                            <Link
                              href={{
                                pathname: `/freelancer/talent/manage/${item.type.toLowerCase()}/${item.originalTalentId}`,
                                query: { label: item.label },
                              }}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Manage jobs for ${item.label}`}
                              >
                                <ArrowUpRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled
                              aria-label={`Manage jobs for ${item.label}`}
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
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
                              skills={skills}
                              onSuccess={() =>
                                setRefreshTrigger((prev) => prev + 1)
                              }
                            />

                            <DomainDialog
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
            <div className="flex items-center justify-end">
              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    {currentPage > 1 && (
                      <>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(currentPage - 1);
                            }}
                            className="cursor-pointer"
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(currentPage - 1);
                            }}
                            className="cursor-pointer"
                          >
                            {currentPage - 1}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

                    <PaginationItem>
                      <PaginationLink href="#" isActive>
                        {currentPage}
                      </PaginationLink>
                    </PaginationItem>

                    {currentPage < totalPages && (
                      <>
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(currentPage + 1);
                            }}
                            className="cursor-pointer"
                          >
                            {currentPage + 1}
                          </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(currentPage + 1);
                            }}
                            className="cursor-pointer"
                          />
                        </PaginationItem>
                      </>
                    )}
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillDomainForm;
