'use client';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users2,
  BookMarked,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
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
import Header from '@/components/header/header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');

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
    const path = value ? `/business/talent/${value}` : '/business/talent';
    router.push(path);
  };

  // Derive current tab value from the pathname to keep Tabs in sync with routing
  const currentTab = (() => {
    const path = pathname?.replace(/\/+$/, '') || '/business/talent';
    if (path === '/business/talent') return 'overview';
    const parts = path.split('/');
    const last = parts[parts.length - 1];
    return ['applications', 'invited', 'accepted', 'rejected'].includes(last)
      ? last
      : 'overview';
  })();

  return (
    <div className="flex min-h-screen w-full flex-col overflow-auto">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Dehix Talent"
      />

      <div className="flex flex-col sm:py-0 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Dehix Talent"
          breadcrumbItems={[
            { label: 'Business', link: '/dashboard/business' },
            { label: 'Hire Talent', link: '/business/talent' },
            { label: 'Overview', link: '#' },
          ]}
        />

        {/* Tabs Header */}
        <div className="container px-4 py-4">
          <Tabs value={currentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" onClick={() => handleTabChange('')}>
                <Users2 className="h-4 w-4 mr-1" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="applications"
                onClick={() => handleTabChange('applications')}
              >
                <FileText className="h-4 w-4 mr-1" />
                Applications
              </TabsTrigger>
              <TabsTrigger
                value="invited"
                onClick={() => handleTabChange('invited')}
              >
                <BookMarked className="h-4 w-4 mr-1" />
                Invites
              </TabsTrigger>
              <TabsTrigger
                value="accepted"
                onClick={() => handleTabChange('accepted')}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Accepted
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                onClick={() => handleTabChange('rejected')}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Rejected
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <main className="flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid lg:grid-cols-3 lg:items-start xl:grid-cols-3">
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
            <div className="flex space-x-4">
              <Select onValueChange={setSkillFilter} value={skillFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {filterSkill?.map((skill) => (
                    <SelectItem key={skill._id} value={skill.label}>
                      {skill.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={setDomainFilter} value={domainFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {filterDomain?.map((domain) => (
                    <SelectItem key={domain._id} value={domain.label}>
                      {domain.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="lg:h-[75vh] h-[59vh] rounded-lg  overflow-y-scroll no-scrollbar">
              <TalentCard
                skillFilter={skillFilter}
                domainFilter={domainFilter}
                skillDomainData={skillDomainData}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
