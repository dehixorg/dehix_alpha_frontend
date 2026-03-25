'use client';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Users, Mail, Check } from 'lucide-react';
import { useSelector } from 'react-redux';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import TalentMarketCard from '@/components/shared/TalentMarketCard';
import FilterComponent from '@/components/marketComponents/FilterComponent';
import { FilterSheet } from '@/components/market/FilterSheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { RootState } from '@/lib/store';

// Project type aligned with JobCard's expected shape
interface Project {
  _id: string;
  projectName: string;
  projectDomain?: string[];
  projectDomainId?: string;
  description?: string;
  status?: string;
  position?: string;
  skillsRequired?: string[];
  companyName?: string;
  email?: string;
  url?: string[];
  bookmarked?: boolean;
  profiles?: Array<{
    domain?: string;
    domain_id?: string;
    profileType?: string;
    freelancersRequired?: string;
    skills?: string[];
    experience?: number;
    minConnect?: number;
    rate?: number;
    selectedFreelancer?: any[];
    budget?: {
      type: string;
      fixedAmount?: number;
      hourlyRate?: number;
      min?: number;
      max?: number;
    };
    totalBid?: any[];
    freelancers?: any[];
    team?: any[];
    positions?: number;
    years?: number | string;
    connectsRequired?: number;
  }>;
  createdAt?: string | Date;
  location?: string;
  budget?: number | string;
  duration?: string;
  progress?: number;
  deadline?: string;
  proposals?: number;
  updatedAt?: string | Date;
}

interface FilterState {
  projects: string[];
  jobType: string[];
  domain: string[];
  skills: string[];
  projectDomain: string[];
  sorting: string[];
  minRate: string;
  maxRate: string;
  favourites: boolean;
  consultant: boolean;
}

const getActiveFilterCount = (filters: FilterState) => {
  // For Talent Market, only domain and skills filters are relevant
  return (
    (filters.domain?.length || 0) +
    (filters.skills?.length || 0) +
    (filters.projectDomain?.length || 0) +
    (filters.favourites ? 1 : 0)
  );
};

// API types
interface TalentMarketItem {
  _id: string;
  businessId: string;
  skillId?: string;
  skillName?: string;
  talentId?: string;
  talentName?: string;
  domainId?: string;
  domainName?: string;
  type?: 'SKILL' | 'DOMAIN';
  description?: string;
  experience?: string;
  status?: string;
  visible?: boolean;
  bookmarked?: boolean;
  freelancerRequired?: number;
  freelancerInLobby?: Array<any>;
  freelancerInvited?: Array<any>;
  freelancerSelected?: Array<any>;
  freelancerRejected?: Array<any>;
  createdAt?: string;
  updatedAt?: string;
  freelancers?: Array<{
    _id: string;
    freelancerId: string;
    freelancer_professional_profile_id?: string;
    status: string;
    cover_letter?: string;
    interview_ids?: string[];
    updatedAt?: string;
  }>;
}

const TalentMarketTab: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);

  const [isLargeScreen, setIsLargeScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [domainSearchQuery, setDomainSearchQuery] = useState('');
  const [projectDomainSearchQuery, setProjectDomainSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    jobType: [],
    domain: [],
    skills: [],
    projects: [],
    projectDomain: [],
    sorting: [],
    minRate: '',
    maxRate: '',
    favourites: false,
    consultant: false,
  });

  const [items, setItems] = useState<TalentMarketItem[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [projectDomains, setProjectDomains] = useState<string[]>([]);
  const [isFiltersLoading, setIsFiltersLoading] = useState(false);
  const [isListingsLoading, setIsListingsLoading] = useState(false);

  // Apply dialog state
  const [applyOpen, setApplyOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TalentMarketItem | null>(
    null,
  );
  const [coverLetter, setCoverLetter] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const MIN_COVER_LETTER = 200;
  const MAX_COVER_LETTER = 500;

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setIsFiltersLoading(true);
        const skillsRes = await axiosInstance.get('/skills/all');
        setSkills(skillsRes.data.data.map((s: any) => s.label));
        const domainsRes = await axiosInstance.get('/domain/all');
        setDomains(domainsRes.data.data.map((d: any) => d.label));
        const projDomRes = await axiosInstance.get('/projectdomain/all');
        setProjectDomains(projDomRes.data.data.map((pd: any) => pd.label));
      } catch (err) {
        console.error('Error loading filters', err);
        notifyError('Failed to load filter options.');
      } finally {
        setIsFiltersLoading(false);
      }
    };
    fetchFilterOptions();
  }, []);

  // Load freelancer profiles when dialog opens
  useEffect(() => {
    const loadProfiles = async () => {
      if (!applyOpen || !user?.uid) return;
      try {
        const res = await axiosInstance.get('/freelancer/profiles');
        const list = res.data?.data || [];
        setProfiles(list);
      } catch (e) {
        console.error('Error loading profiles', e);
      }
    };
    loadProfiles();
  }, [applyOpen, user?.uid]);

  const fetchTalentItems = useCallback(async () => {
    try {
      setIsListingsLoading(true);
      const res = await axiosInstance.get('/freelancer/dehix-talent/market');
      const data: TalentMarketItem[] = res.data?.data || [];
    } catch (err) {
      console.error('Fetch talent market error:', err);
      notifyError('Failed to load talent market listings.');
    } finally {
      setIsListingsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTalentItems();
  }, [fetchTalentItems]);

  const handleReset = useCallback(() => {
    setFilters({
      jobType: [],
      domain: [],
      skills: [],
      projects: [],
      projectDomain: [],
      sorting: [],
      minRate: '',
      maxRate: '',
      favourites: false,
      consultant: false,
    });
    setSearchQuery('');
  }, []);

  // Map to JobCard-compatible Project and filter
  const jobs: Project[] = useMemo(() => {
    const mapped: Project[] = (items || []).map((it) => {
      const name =
        it.skillName || it.domainName || it.talentName || 'Opportunity';
      const nameId = it.skillId || it.domainId || it.talentId || '';

      // Talent market items use talentName and type field
      // type can be 'SKILL' or 'DOMAIN'
      const skills: string[] = [];
      const pdomains: string[] = [];

      if (it.talentName) {
        // Check the type field to determine if it's a skill or domain
        if (it.type === 'SKILL' || it.skillName) {
          skills.push(it.talentName);
        } else if (it.type === 'DOMAIN' || it.domainName) {
          pdomains.push(it.talentName);
        } else {
          // If no type specified, add to skills as fallback
          skills.push(it.talentName);
        }
      }

      return {
        _id: it._id,
        projectName: name,
        projectDomainId: nameId,
        description: it.description || '',
        skillsRequired: skills,
        projectDomain: pdomains,
        companyName: undefined,
        createdAt: it.createdAt,
        updatedAt: it.updatedAt,
        status: it.status,
        bookmarked: it.bookmarked,
        profiles: [
          {
            experience: it.experience ? Number(it.experience) : undefined,
            freelancersRequired:
              typeof it.freelancerRequired === 'number'
                ? String(it.freelancerRequired)
                : it.freelancerRequired !== undefined
                  ? String(it.freelancerRequired)
                  : undefined,
          },
        ],
      };
    });

    const f = filters;

    const filtered = mapped.filter((job) => {
      // Domain filter - case insensitive
      if (f.domain?.length > 0) {
        if (!job.projectDomain || job.projectDomain.length === 0) return false;
        const ok = f.domain.some((d) =>
          job.projectDomain!.some(
            (pd) =>
              pd.toLowerCase().includes(d.toLowerCase()) ||
              d.toLowerCase().includes(pd.toLowerCase()),
          ),
        );
        if (!ok) return false;
      }
      // Project Domain filter - case insensitive
      if (f.projectDomain?.length > 0) {
        if (!job.projectDomain || job.projectDomain.length === 0) return false;
        const ok = f.projectDomain.some((d) =>
          job.projectDomain!.some(
            (pd) =>
              pd.toLowerCase().includes(d.toLowerCase()) ||
              d.toLowerCase().includes(pd.toLowerCase()),
          ),
        );
        if (!ok) return false;
      }
      // Skills filter - case insensitive
      if (f.skills?.length > 0) {
        if (!job.skillsRequired || job.skillsRequired.length === 0)
          return false;
        const ok = f.skills.some((s) =>
          job.skillsRequired!.some(
            (js) =>
              js.toLowerCase().includes(s.toLowerCase()) ||
              s.toLowerCase().includes(js.toLowerCase()),
          ),
        );
        if (!ok) return false;
      }
      // Favourites Data
      if (f.favourites) {
        if (!job.bookmarked) return false;
      }

      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const hay = `${job.projectName} ${job.description || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return filtered;
  }, [items, filters, searchQuery]);

  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const handleRemoveJob = (id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const visibleJobs = useMemo(
    () => jobs.filter((j) => !hiddenIds.has(j._id)),
    [jobs, hiddenIds],
  );

  const activeFilterCount = getActiveFilterCount(filters);

  const isAnyLoading = isFiltersLoading || isListingsLoading;

  const handleResize = () => {
    setIsLargeScreen(window.innerWidth >= 1024);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hasUserApplied = (item: TalentMarketItem): boolean => {
    if (!user?.uid) return false;
    return !!item.freelancers?.some((f) => f.freelancerId === user.uid);
  };

  const openApplyDialog = (job: Project) => {
    const item = items.find((i) => i._id === job._id) || null;
    if (!item) return;

    if (hasUserApplied(item)) {
      notifyError('You have already applied to this opportunity.');
      return;
    }

    setSelectedItem(item);
    setApplyOpen(true);
    setCoverLetter('');
    setSelectedProfileId('');
  };

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = { APPLIED: 0, INVITED: 0, SELECTED: 0 } as Record<
      string,
      number
    >;
    const list = selectedItem?.freelancers || [];
    for (const f of list) {
      if (f.status) counts[f.status] = (counts[f.status] || 0) + 1;
    }
    return counts;
  }, [selectedItem]);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-2">
          <h2 className="hidden md:block text-2xl sm:text-3xl font-bold tracking-tight">
            Explore Talent Market Opportunities
          </h2>
          <p className="hidden md:block text-muted-foreground">
            Browse open skill/domain opportunities and apply directly
          </p>
        </div>
        <div className="flex items-center justify-between px-1">
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground ml-auto">
            {visibleJobs.length}{' '}
            {visibleJobs.length === 1 ? 'result' : 'results'}
          </span>
        </div>
        {!isLargeScreen && (
          <div
            className="ml-auto flex items-center gap-2"
            data-tour="tm-filters-mobile"
          >
            <FilterSheet
              filters={filters}
              setFilters={setFilters}
              handleReset={handleReset}
              activeFilterCount={activeFilterCount}
              skills={skills}
              domains={domains}
              projectDomains={projectDomains}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              domainSearchQuery={domainSearchQuery}
              setDomainSearchQuery={setDomainSearchQuery}
              projectDomainSearchQuery={projectDomainSearchQuery}
              setProjectDomainSearchQuery={setProjectDomainSearchQuery}
            />
          </div>
        )}
      </div>

      <div className="flex flex-1">
        {isLargeScreen && (
          <aside
            className="w-80 flex-shrink-0 pr-6 sticky top-20"
            data-tour="tm-filters-desktop"
          >
            <FilterComponent
              filters={filters}
              setFilters={setFilters}
              handleReset={handleReset}
              activeFilterCount={activeFilterCount}
              skills={skills}
              domains={domains}
              projectDomains={projectDomains}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              domainSearchQuery={domainSearchQuery}
              setDomainSearchQuery={setDomainSearchQuery}
              projectDomainSearchQuery={projectDomainSearchQuery}
              setProjectDomainSearchQuery={setProjectDomainSearchQuery}
            />
          </aside>
        )}

        <div className="flex-1" data-tour="tm-job-cards">
          {isAnyLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card
                  key={i}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex flex-wrap gap-2">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-6 w-20 rounded-full" />
                        ))}
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <div className="flex justify-between items-center pt-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-9 w-28" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : visibleJobs.length > 0 ? (
            <div className="grid gap-4">
              {visibleJobs.map((job) => {
                const item = items.find((i) => i._id === job._id);
                if (!item) return null;
                const hasApplied = hasUserApplied(item);
                return (
                  <TalentMarketCard
                    key={item._id}
                    item={item}
                    hasApplied={hasApplied}
                    onNotInterested={() => handleRemoveJob(item._id)}
                    onToggleBookmark={(it, next) =>
                      setItems((prev) =>
                        prev.map((p) =>
                          p._id === it._id ? { ...p, bookmarked: next } : p,
                        ),
                      )
                    }
                    onApply={(it) =>
                      openApplyDialog({
                        _id: it._id,
                        projectName: job.projectName,
                        projectDomain: job.projectDomain,
                        description: job.description,
                        profiles: job.profiles,
                        createdAt: it.createdAt,
                        updatedAt: it.updatedAt,
                        status: it.status,
                      } as any)
                    }
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-muted/30">
              <div className="w-48 h-48 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                <Search className="h-16 w-16 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                No opportunities found
              </h3>
              <p className="text-muted-foreground max-w-md mb-6">
                {items.length > 0 &&
                (activeFilterCount > 0 || searchQuery.trim().length > 0)
                  ? "We couldn't find any items matching your current filters."
                  : 'There are currently no items available. Check back later!'}
              </p>
              {items.length > 0 &&
              (activeFilterCount > 0 || searchQuery.trim().length > 0) ? (
                <Button variant="outline" onClick={handleReset}>
                  Clear all filters
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Apply Dialog */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.skillName || selectedItem?.domainName || 'Apply'}
            </DialogTitle>
            <DialogDescription>
              Provide a cover letter (min 200 – max 500 characters) and select a
              professional profile to apply.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-sm">
              {selectedItem?.experience && (
                <Badge variant="secondary">
                  Exp: {selectedItem.experience}+ yrs
                </Badge>
              )}
              {typeof selectedItem?.freelancerRequired === 'number' && (
                <Badge variant="secondary">
                  Required: {selectedItem.freelancerRequired}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <Badge
                variant="outline"
                className="rounded-full border-sky-300 text-sky-700 bg-sky-50 px-2.5 py-1 flex items-center gap-1"
              >
                <Users className="h-3.5 w-3.5" />
                Applied: {statusCounts['APPLIED'] || 0}
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full border-purple-300 text-purple-700 bg-purple-50 px-2.5 py-1 flex items-center gap-1"
              >
                <Mail className="h-3.5 w-3.5" />
                Invited: {statusCounts['INVITED'] || 0}
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full border-emerald-300 text-emerald-700 bg-emerald-50 px-2.5 py-1 flex items-center gap-1"
              >
                <Check className="h-3.5 w-3.5" />
                Selected: {statusCounts['SELECTED'] || 0}
              </Badge>
            </div>

            <div className="space-y-2 pt-2">
              <Label>Select Professional Profile</Label>
              <Select
                value={selectedProfileId}
                onValueChange={setSelectedProfileId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose one of your profiles" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((p: any) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.profileName || p.name || p._id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 pt-2">
              <Label>Cover Letter</Label>
              <Textarea
                rows={6}
                placeholder="Describe why you're a great fit... (min 200 characters)"
                value={coverLetter}
                onChange={(e) => {
                  const raw = e.target.value;
                  const cleaned = raw
                    .replace(/^\s+/, '')
                    .replace(/ {10,}/g, ' ');
                  if (cleaned.length <= MAX_COVER_LETTER) {
                    setCoverLetter(cleaned);
                  }
                }}
              />
              <div className="flex items-center justify-between text-xs">
                <span
                  className={
                    coverLetter.trim().length < MIN_COVER_LETTER
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                  }
                >
                  {coverLetter.trim().length} / {MIN_COVER_LETTER} min –{' '}
                  {MAX_COVER_LETTER} max
                </span>
                {MAX_COVER_LETTER - coverLetter.trim().length < 200 && (
                  <span className="text-muted-foreground">
                    {MAX_COVER_LETTER - coverLetter.trim().length} remaining
                  </span>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={async () => {
                if (!selectedItem) return;
                if (!user?.uid) {
                  notifyError('Please login to apply.');
                  return;
                }
                if (!selectedProfileId) {
                  notifyError('Please select a professional profile.');
                  return;
                }
                if (coverLetter.trim().length < 200) {
                  notifyError('Cover letter must be at least 200 characters.');
                  return;
                }
                try {
                  setSubmitting(true);
                  const payload = {
                    hireId: selectedItem._id,
                    businessId: selectedItem.businessId,
                    freelancerId: user.uid,
                    freelancer_professional_profile_id: selectedProfileId,
                    cover_letter: coverLetter.trim(),
                  };
                  await axiosInstance.post(
                    '/freelancer/dehix-talent/apply',
                    payload,
                  );

                  setItems((prev) =>
                    prev.map((item) =>
                      item._id === selectedItem._id
                        ? {
                            ...item,
                            freelancers: [
                              ...(item.freelancers || []),
                              {
                                _id: '',
                                freelancerId: user.uid,
                                freelancer_professional_profile_id:
                                  selectedProfileId,
                                status: 'APPLIED',
                                cover_letter: coverLetter.trim(),
                                updatedAt: new Date().toISOString(),
                              },
                            ],
                          }
                        : item,
                    ),
                  );

                  notifySuccess('Applied successfully', 'Success');
                  setApplyOpen(false);
                } catch (e) {
                  console.error('Apply error', e);
                  notifyError('Failed to submit application.');
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={
                submitting ||
                !selectedProfileId ||
                coverLetter.trim().length < MIN_COVER_LETTER ||
                coverLetter.trim().length > MAX_COVER_LETTER
              }
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TalentMarketTab;
