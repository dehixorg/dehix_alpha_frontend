'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Users2, FileText } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CardTitle } from '@/components/ui/card';
import SkillDomainForm from '@/components/business/hireTalent.tsx/skillDomainForm';
import TalentCard from '@/components/business/hireTalent.tsx/talentCard';
import { axiosInstance } from '@/lib/axiosinstance';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BusinessDashboardLayout from '@/components/layout/BusinessDashboardLayout';
interface Skill {
  _id: string;
  label: string;
}

interface Domain {
  _id: string;
  label: string;
}

interface HireTalentItem {
  _id: string;
  type?: string;
  visible?: boolean;
  talentId?: string;
  talentName?: string;
  description?: string;
  experience?: string;
  status?: string;
}

interface SkillDomainData {
  uid: string;
  label: string;
  experience: string;
  description: string;
  status: string;
  visible: boolean;
  talentId?: string;
}

let cachedBusinessTalentBootstrap: {
  skills: Skill[];
  domains: Domain[];
  hires: HireTalentItem[];
} | null = null;

export default function Talent() {
  const router = useRouter();
  const pathname = usePathname();
  const [talentFilter, setTalentFilter] = useState<string>('all');

  const [filterSkill, setFilterSkill] = useState<Skill[]>([]);
  const [filterDomain, setFilterDomain] = useState<Domain[]>([]);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [hireItems, setHireItems] = useState<HireTalentItem[]>([]);
  const [skillDomainData, setSkillDomainData] = useState<SkillDomainData[]>([]);
  const [statusVisibility, setStatusVisibility] = useState<boolean[]>([]);
  const [bootstrapLoading, setBootstrapLoading] = useState<boolean>(true);
  const bootstrapInFlightRef = useRef(false);

  const refreshBootstrap = useCallback(async () => {
    if (bootstrapInFlightRef.current) return;
    bootstrapInFlightRef.current = true;
    setBootstrapLoading(true);
    try {
      const [skillsRes, domainsRes, hiresRes] = await Promise.all([
        axiosInstance.get('/skills'),
        axiosInstance.get('/domain'),
        axiosInstance.get('/business/hire-dehixtalent'),
      ]);

      const nextSkills: Skill[] = skillsRes?.data?.data || [];
      const nextDomains: Domain[] = domainsRes?.data?.data || [];
      const nextHires: HireTalentItem[] = hiresRes?.data?.data || [];

      cachedBusinessTalentBootstrap = {
        skills: nextSkills,
        domains: nextDomains,
        hires: nextHires,
      };

      setSkills(nextSkills);
      setDomains(nextDomains);
      setHireItems(nextHires);

      const fetchedFilterSkills: Skill[] = (nextHires || [])
        .filter((item) => item?.type === 'SKILL' && item?.visible)
        .map((item) => ({
          _id: item?.talentId || item?._id,
          label: item?.talentName || '',
        }))
        .filter((s) => Boolean(s._id) && Boolean(s.label));

      const fetchedFilterDomains: Domain[] = (nextHires || [])
        .filter((item) => item?.type === 'DOMAIN' && item?.visible)
        .map((item) => ({
          _id: item?.talentId || item?._id,
          label: item?.talentName || '',
        }))
        .filter((d) => Boolean(d._id) && Boolean(d.label));

      setFilterSkill(fetchedFilterSkills);
      setFilterDomain(fetchedFilterDomains);

      const formatted: SkillDomainData[] = (nextHires || [])
        .map((item) => ({
          uid: item?._id,
          label: item?.talentName || 'N/A',
          experience: item?.experience || 'N/A',
          description: item?.description || 'N/A',
          status: item?.status || 'N/A',
          visible: Boolean(item?.visible),
          talentId: item?.talentId,
        }))
        .filter((i) => Boolean(i.uid) && i.label !== 'N/A');

      setSkillDomainData(formatted);
      setStatusVisibility(formatted.map((i) => i.visible));
    } finally {
      setBootstrapLoading(false);
      bootstrapInFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Avoid double-fetching in React 18 dev StrictMode by using a module cache.
    if (cachedBusinessTalentBootstrap) {
      setSkills(cachedBusinessTalentBootstrap.skills);
      setDomains(cachedBusinessTalentBootstrap.domains);
      setHireItems(cachedBusinessTalentBootstrap.hires);

      const hires = cachedBusinessTalentBootstrap.hires || [];
      const fetchedFilterSkills: Skill[] = hires
        .filter((item) => item?.type === 'SKILL' && item?.visible)
        .map((item) => ({
          _id: item?.talentId || item?._id,
          label: item?.talentName || '',
        }))
        .filter((s) => Boolean(s._id) && Boolean(s.label));
      const fetchedFilterDomains: Domain[] = hires
        .filter((item) => item?.type === 'DOMAIN' && item?.visible)
        .map((item) => ({
          _id: item?.talentId || item?._id,
          label: item?.talentName || '',
        }))
        .filter((d) => Boolean(d._id) && Boolean(d.label));
      setFilterSkill(fetchedFilterSkills);
      setFilterDomain(fetchedFilterDomains);

      const formatted: SkillDomainData[] = hires
        .map((item) => ({
          uid: item?._id,
          label: item?.talentName || 'N/A',
          experience: item?.experience || 'N/A',
          description: item?.description || 'N/A',
          status: item?.status || 'N/A',
          visible: Boolean(item?.visible),
          talentId: item?.talentId,
        }))
        .filter((i) => Boolean(i.uid) && i.label !== 'N/A');
      setSkillDomainData(formatted);
      setStatusVisibility(formatted.map((i) => i.visible));
      setBootstrapLoading(false);
      return;
    }

    void refreshBootstrap();
  }, [refreshBootstrap]);

  const handleTabChange = (value: string) => {
    if (value === 'overview') {
      router.push('/business/talent');
    } else {
      router.push('/business/talent/applications');
    }
  };

  // Derive current tab value from the pathname to keep Tabs in sync with routing
  const currentTab = (() => {
    const path = pathname?.replace(/\/+$/, '') || '/business/talent';
    if (path === '/business/talent') return 'overview';
    const parts = path.split('/');
    const last = parts[parts.length - 1];
    return last === 'applications' ? 'applications' : 'overview';
  })();

  return (
    <BusinessDashboardLayout
      active="Talent"
      activeMenu="Talent"
      breadcrumbItems={[
        { label: 'Business', link: '/dashboard/business' },
        { label: 'Hire Talent', link: '#' },
        { label: 'Overview', link: '#' },
      ]}
      contentClassName="flex flex-col sm:py-0 sm:pl-14"
      mainClassName="p-0"
    >
      {/* Tabs Header */}
      <div className="container px-4 py-4 ">
        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">
              <Users2 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="applications">
              <FileText className="h-4 w-4 mr-2" />
              Applications
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid lg:grid-cols-3 lg:items-start xl:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SkillDomainForm
            setFilterSkill={setFilterSkill}
            setFilterDomain={setFilterDomain}
            skills={skills}
            domains={domains}
            hireItems={hireItems}
            skillDomainData={skillDomainData}
            setSkillDomainData={setSkillDomainData}
            statusVisibility={statusVisibility}
            setStatusVisibility={setStatusVisibility}
            isLoading={bootstrapLoading}
            refreshData={refreshBootstrap}
          />
        </div>

        {/* Right side: Talent Filter and Cards */}
        <div className="space-y-6 lg:mt-0 mt-6">
          <CardTitle className="group flex items-center gap-2 text-2xl">
            Talent
          </CardTitle>

          {/* Skill and Domain Filter */}
          <div className="flex">
            <Select onValueChange={setTalentFilter} value={talentFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Skill or Domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Talent</SelectItem>
                {filterSkill?.map((skill) => (
                  <SelectItem
                    key={`skill-${skill._id}`}
                    value={`SKILL|${skill.label}`}
                  >
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="truncate">{skill.label}</span>
                      <Badge
                        variant="secondary"
                        className="shrink-0 rounded-full px-2 py-0 text-[10px] font-medium"
                      >
                        Skill
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
                {filterDomain?.map((domain) => (
                  <SelectItem
                    key={`domain-${domain._id}`}
                    value={`DOMAIN|${domain.label}`}
                  >
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="truncate">{domain.label}</span>
                      <Badge
                        variant="secondary"
                        className="shrink-0 rounded-full px-2 py-0 text-[10px] font-medium"
                      >
                        Domain
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="lg:h-[75vh] h-[59vh] rounded-lg  overflow-y-scroll no-scrollbar">
            <TalentCard
              talentFilter={talentFilter}
              skillDomainData={skillDomainData}
            />
          </div>
        </div>
      </div>
    </BusinessDashboardLayout>
  );
}
