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
import Header from '@/components/header/header';
import TalentMarketCard from '@/components/shared/TalentMarketCard';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
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
  return Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) return count + (value?.length || 0);
    if (typeof value === 'string' && value) return count + 1;
    if (typeof value === 'boolean' && value) return count + 1;
    return count;
  }, 0);
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

const TalentMarketPage: React.FC = () => {
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

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setIsFiltersLoading(true);
        const skillsRes = await axiosInstance.get('/skills');
        setSkills(skillsRes.data.data.map((s: any) => s.label));
        const domainsRes = await axiosInstance.get('/domain');
        setDomains(domainsRes.data.data.map((d: any) => d.label));
        const projDomRes = await axiosInstance.get('/projectdomain');
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
      setItems(data);
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
  }, []);

  // Map to JobCard-compatible Project and filter
  const jobs: Project[] = useMemo(() => {
    const mapped: Project[] = (items || []).map((it) => {
      const name =
        it.skillName || it.domainName || it.talentName || 'Opportunity';
      const nameId = it.skillId || it.domainId || it.talentId || '';
      const skills = it.skillName ? [it.skillName] : [];
      const pdomains = it.domainName ? [it.domainName] : [];
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
      if (f.domain?.length > 0 && job.projectDomain?.length) {
        const ok = f.domain.some((d) => job.projectDomain!.includes(d));
        if (!ok) return false;
      }
      if (f.skills?.length > 0 && job.skillsRequired?.length) {
        const ok = f.skills.some((s) => job.skillsRequired!.includes(s));
        if (!ok) return false;
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

  const openApplyDialog = (job: Project) => {
    const item = items.find((i) => i._id === job._id) || null;
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
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Talent Market"
      />
      <div className="flex flex-col sm:gap-4 sm:pb-4 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Talent Market"
          breadcrumbItems={[
            { label: 'Dashboard', link: '/dashboard/freelancer' },
            { label: 'Talent Market', link: '#' },
          ]}
        />
        <div className="p-4 sm:px-8">
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
                <div className="ml-auto flex items-center gap-2">
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
          </div>
        </div>

        <div className="flex flex-1 px-4 sm:px-8 pb-8">
          {isLargeScreen && (
            <aside className="w-80 flex-shrink-0 pr-6 sticky top-20">
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

          <div className="flex-1">
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
                            <Skeleton
                              key={i}
                              className="h-6 w-20 rounded-full"
                            />
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
                  return (
                    <TalentMarketCard
                      key={item._id}
                      item={item}
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
                  {activeFilterCount > 0
                    ? "We couldn't find any items matching your current filters."
                    : 'There are currently no items available. Check back later!'}
                </p>
                {activeFilterCount > 0 ? (
                  <Button variant="outline" onClick={handleReset}>
                    Clear all filters
                  </Button>
                ) : (
                  <Button onClick={() => window.location.reload()}>
                    Refresh page
                  </Button>
                )}
              </div>
            )}
          </div>
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
              Provide a cover letter (min 200 characters) and select a
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
                onChange={(e) => setCoverLetter(e.target.value)}
              />
              <div className="flex items-center justify-between text-xs">
                <span
                  className={
                    coverLetter.trim().length < 200
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                  }
                >
                  {coverLetter.trim().length} / 200 min
                </span>
                {coverLetter.trim().length < 200 && (
                  <span className="text-red-500">
                    Minimum 200 characters required
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
                    business_req_talent_id: selectedItem._id,
                    businessId: selectedItem.businessId,
                    freelancerId: user.uid,
                    freelancer_professional_profile_id: selectedProfileId,
                    cover_letter: coverLetter.trim(),
                  };
                  await axiosInstance.post(
                    '/freelancer/dehix-talent/apply',
                    payload,
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
                coverLetter.trim().length < 200
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

export default TalentMarketPage;
