'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { ArrowUpRight, Briefcase, Eye, Zap } from 'lucide-react';

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
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { axiosInstance, cancelAllRequests } from '@/lib/axiosinstance';
import type { RootState } from '@/lib/store';
import { getBadgeColor } from '@/utils/common/getBadgeStatus';
import { StatusEnum } from '@/utils/freelancer/enum';
import { notifyError } from '@/utils/toastMessage';
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
  type: 'SKILL' | 'DOMAIN';
  status: StatusEnum;
  activeStatus: boolean;
  originalTalentId: string;
}

const SkillDomainForm: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [rows, setRows] = useState<SkillDomainData[]>([]);
  const [visibility, setVisibility] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      try {
        const [skRes, domRes, talRes] = await Promise.all([
          axiosInstance.get('/skills'),
          axiosInstance.get('/domain'),
          user?.uid
            ? axiosInstance.get(`/freelancer/${user.uid}/dehix-talent`)
            : Promise.resolve({ data: { data: [] } }),
        ]);

        if (cancelled) return;

        const skillArr: Skill[] = (skRes.data?.data ?? []).map((s: any) => ({
          _id: s._id,
          label: s.label,
        }));
        const domainArr: Domain[] = (domRes.data?.data ?? []).map((d: any) => ({
          _id: d._id,
          label: d.label,
        }));

        const rawTalent = Array.isArray(talRes.data?.data)
          ? talRes.data.data
          : Object.values(talRes.data?.data ?? {});
        const talentFlat = rawTalent.flat();

        const formatted: SkillDomainData[] = talentFlat.map((t: any) => ({
          uid: t._id,
          label: t.talentName ?? '—',
          experience: t.experience ?? '—',
          monthlyPay: t.monthlyPay ?? '—',
          type: t.type,
          status: t.status,
          activeStatus: t.activeStatus ?? false,
          originalTalentId: t.talentId,
        }));

        setRows(formatted);
        setVisibility(formatted.map((r) => r.activeStatus));

        const used = new Set(
          formatted.map((i) => i.originalTalentId).filter(Boolean),
        );
        setSkills(skillArr.filter((s) => !used.has(s._id)));
        setDomains(domainArr.filter((d) => !used.has(d._id)));
      } catch (err: any) {
        if (err?.code !== 'ERR_CANCELED') {
          console.error(err);
          notifyError('Failed to load data. Please try again.', 'Error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => {
      cancelled = true;
      cancelAllRequests();
    };
  }, [user?.uid, refresh]);

  const toggleVisibility = useCallback(
    async (idx: number, checked: boolean, id: string) => {
      try {
        const { status } = await axiosInstance.put(
          `/freelancer/dehix-talent/${id}`,
          { activeStatus: checked },
        );
        if (status === 200) {
          setVisibility((v) => {
            const copy = [...v];
            copy[idx] = checked;
            return copy;
          });
        }
      } catch (e) {
        console.error(e);
        notifyError('Could not update visibility.', 'Error');
      }
    },
    [],
  );

  const triggerRefresh = () => setRefresh((r) => r + 1);

  const AddSkillBtn = () => (
    <SkillDialog skills={skills} onSuccess={triggerRefresh}>
      <Button
        size="sm"
        className="bg-white text-black hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300"
      >
        <Briefcase className="h-4 w-4 mr-1" />
        Add Skill
      </Button>
    </SkillDialog>
  );

  const AddDomainBtn = () => (
    <DomainDialog domains={domains} onSuccess={triggerRefresh}>
      <Button size="sm" variant="outline">
        <Briefcase className="h-4 w-4 mr-1" />
        Add Domain
      </Button>
    </DomainDialog>
  );

  return (
    <section className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <Card className="w-full shadow-lg">
        <CardHeader className="border-b bg-card/50">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Dehix Talent
              </CardTitle>
              <CardDescription className="mt-1">
                Showcase your skills & domains to get hired directly.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <AddSkillBtn />
              <AddDomainBtn />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300 border border-muted/40 bg-gradient-to-br from-blue-50/70 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 h-36">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-200/30 dark:bg-blue-900/20 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
              <CardHeader className="pb-1 px-4 pt-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                    <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                  </div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-200 bg-clip-text text-transparent">
                    {rows.filter((r) => r.type === 'SKILL').length}
                  </p>
                </div>
                <CardTitle className="text-xl font-semibold text-foreground/90">
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 px-4 py-1">
                <p className="text-sm text-muted-foreground">
                  {skills.length} available to add
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300 border border-muted/40 bg-gradient-to-br from-purple-50/70 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 h-36">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-200/30 dark:bg-purple-900/20 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
              <CardHeader className="pb-1 px-4 pt-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/50">
                    <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                  </div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-200 bg-clip-text text-transparent">
                    {rows.filter((r) => r.type === 'DOMAIN').length}
                  </p>
                </div>
                <CardTitle className="text-xl font-semibold text-foreground/90">
                  Domains
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 px-4 py-1">
                <p className="text-sm text-muted-foreground">
                  {domains.length} available to add
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300 border border-muted/40 bg-gradient-to-br from-green-50/70 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 h-36">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-green-200/30 dark:bg-green-900/20 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
              <CardHeader className="pb-1 px-4 pt-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50">
                    <Eye className="w-4 h-4 text-green-600 dark:text-green-300" />
                  </div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 dark:from-green-400 dark:to-green-200 bg-clip-text text-transparent">
                    {visibility.filter(Boolean).length}
                  </p>
                </div>
                <CardTitle className="text-xl font-semibold text-foreground/90">
                  Active Listings
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 px-4 py-1">
                <p className="text-sm text-muted-foreground">
                  Visible to clients
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300 border border-muted/40 bg-gradient-to-br from-amber-50/70 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 h-36">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-200/30 dark:bg-amber-900/20 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
              <CardHeader className="pb-1 px-4 pt-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
                    <Zap className="w-4 h-4 text-amber-600 dark:text-amber-300" />
                  </div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-200 bg-clip-text text-transparent">
                    {
                      rows.filter(
                        (r) =>
                          (r.type === 'SKILL' || r.type === 'DOMAIN') &&
                          r.status === StatusEnum.ACTIVE,
                      ).length
                    }
                    /{rows.length}
                  </p>
                </div>
                <CardTitle className="text-xl font-semibold text-foreground/90">
                  Verified
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 px-4 py-1">
                <p className="text-sm text-muted-foreground">
                  {
                    rows.filter(
                      (r) =>
                        r.type === 'SKILL' && r.status === StatusEnum.ACTIVE,
                    ).length
                  }
                  /{rows.filter((r) => r.type === 'SKILL').length} Skills
                  <br />
                  {
                    rows.filter(
                      (r) =>
                        r.type === 'DOMAIN' && r.status === StatusEnum.ACTIVE,
                    ).length
                  }
                  /{rows.filter((r) => r.type === 'DOMAIN').length} Domains
                </p>
              </CardContent>
            </Card>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-20">Type</TableHead>
                  <TableHead className="min-w-[140px]">Label</TableHead>
                  <TableHead className="w-28 text-center">Exp.</TableHead>
                  <TableHead className="w-32 text-center">Pay</TableHead>
                  <TableHead className="w-28 text-center">Status</TableHead>
                  <TableHead className="w-28 text-center">Visible</TableHead>
                  <TableHead className="w-28 text-center">Manage</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-6 w-14" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-32" />
                        </TableCell>
                        <TableCell className="text-center">
                          <Skeleton className="mx-auto h-6 w-12" />
                        </TableCell>
                        <TableCell className="text-center">
                          <Skeleton className="mx-auto h-6 w-20" />
                        </TableCell>
                        <TableCell className="text-center">
                          <Skeleton className="mx-auto h-6 w-16" />
                        </TableCell>
                        <TableCell className="text-center">
                          <Skeleton className="mx-auto h-8 w-12 rounded-full" />
                        </TableCell>
                        <TableCell className="text-center">
                          <Skeleton className="mx-auto h-8 w-12 rounded-full" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <svg
                          width="120"
                          height="120"
                          viewBox="0 0 120 120"
                          className="text-muted-foreground/40"
                          aria-hidden="true"
                        >
                          <path
                            fill="currentColor"
                            d="M30 20h60a10 10 0 0 1 10 10v60a10 10 0 0 1-10 10H30a10 10 0 0 1-10-10V30a10 10 0 0 1 10-10z"
                            opacity=".2"
                          />
                          <circle
                            cx="40"
                            cy="45"
                            r="8"
                            fill="currentColor"
                            opacity=".4"
                          />
                          <circle
                            cx="60"
                            cy="45"
                            r="8"
                            fill="currentColor"
                            opacity=".4"
                          />
                          <circle
                            cx="80"
                            cy="45"
                            r="8"
                            fill="currentColor"
                            opacity=".4"
                          />
                          <rect
                            x="30"
                            y="65"
                            width="60"
                            height="6"
                            rx="3"
                            fill="currentColor"
                            opacity=".3"
                          />
                          <rect
                            x="30"
                            y="78"
                            width="45"
                            height="6"
                            rx="3"
                            fill="currentColor"
                            opacity=".3"
                          />
                        </svg>
                        <p className="text-lg font-medium text-muted-foreground">
                          No talents added yet.
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Start by adding a skill or domain – it will appear
                          here instantly.
                        </p>
                        <div className="flex gap-2 mt-2">
                          <AddSkillBtn />
                          <AddDomainBtn />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r, idx) => (
                    <TableRow
                      key={r.uid}
                      className="transition-colors hover:bg-muted/50"
                    >
                      <TableCell>
                        {r.type === 'SKILL' ? (
                          <Badge className="font-medium text-xs px-2.5 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-300">
                            Skill
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="font-medium text-xs px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-300"
                          >
                            Domain
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="font-medium">{r.label}</TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Badge className={getBadgeColor(r.status)}>
                            {r.status?.toUpperCase()}
                          </Badge>
                          {r.status === StatusEnum.PENDING && r.uid && (
                            <VerifyDialog
                              talentType={r.type}
                              _id={r.uid}
                              userId={user.uid}
                              originalTalentId={r.originalTalentId}
                            />
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <Switch
                          checked={visibility[idx]}
                          onCheckedChange={(v) =>
                            toggleVisibility(idx, v, r.uid)
                          }
                          aria-label={`Toggle visibility for ${r.label}`}
                        />
                      </TableCell>

                      <TableCell className="text-center">
                        {r.originalTalentId ? (
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            aria-label={`Manage jobs for ${r.label}`}
                          >
                            <Link
                              href={{
                                pathname: `/freelancer/talent/manage/${r.type.toLowerCase()}/${r.originalTalentId}`,
                                query: { label: r.label },
                              }}
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Badge className={getBadgeColor(r.status)}>
                              {r.status?.toUpperCase()}
                            </Badge>
                            {r.status === StatusEnum.PENDING && r.uid && (
                              <VerifyDialog
                                talentType={r.type}
                                _id={r.uid}
                                userId={user.uid}
                                originalTalentId={r.originalTalentId}
                              />
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 p-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-5 w-32 mb-3" />
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </Card>
              ))
            ) : rows.length === 0 ? (
              <Card className="p-6 text-center">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 120 120"
                  className="mx-auto text-muted-foreground/40 mb-4"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M30 20h60a10 10 0 0 1 10 10v60a10 10 0 0 1-10 10H30a10 10 0 0 1-10-10V30a10 10 0 0 1 10-10z"
                    opacity=".2"
                  />
                  <circle
                    cx="40"
                    cy="45"
                    r="8"
                    fill="currentColor"
                    opacity=".4"
                  />
                  <circle
                    cx="60"
                    cy="45"
                    r="8"
                    fill="currentColor"
                    opacity=".4"
                  />
                  <circle
                    cx="80"
                    cy="45"
                    r="8"
                    fill="currentColor"
                    opacity=".4"
                  />
                </svg>
                <p className="font-medium">No talents yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a skill or domain to get started.
                </p>
                <div className="flex gap-2 justify-center mt-4">
                  <AddSkillBtn />
                  <AddDomainBtn />
                </div>
              </Card>
            ) : (
              rows.map((r, idx) => (
                <Card key={r.uid} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    {/* Mobile Badge - Skill: NO HOVER */}
                    {r.type === 'SKILL' ? (
                      <Badge
                        variant="default"
                        className="font-medium text-xs px-2.5 py-0.5 rounded-full border bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                      >
                        Skill
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="font-medium text-xs px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-300"
                      >
                        Domain
                      </Badge>
                    )}
                    <Switch
                      checked={visibility[idx]}
                      onCheckedChange={(v) => toggleVisibility(idx, v, r.uid)}
                      aria-label={`Toggle visibility for ${r.label}`}
                    />
                  </div>

                  <h3 className="font-semibold text-lg">{r.label}</h3>

                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Exp:</span>{' '}
                      {r.experience} yrs
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pay:</span>{' '}
                      {formatCurrency(r.monthlyPay)}
                    </div>
                  </div>

                  <div className="mt-3 flex justify-center items-center gap-2">
                    <Badge className={getBadgeColor(r.status)}>
                      {r.status?.toUpperCase()}
                    </Badge>
                    {r.status === StatusEnum.PENDING && r.uid && (
                      <VerifyDialog
                        talentType={r.type}
                        _id={r.uid}
                        userId={user.uid}
                        originalTalentId={r.originalTalentId}
                      />
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default SkillDomainForm;
