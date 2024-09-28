'use client';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Breadcrumb from '@/components/shared/breadcrumbList';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import DropdownProfile from '@/components/shared/DropdownProfile';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import { CardTitle } from '@/components/ui/card';
import SkillDomainForm from '@/components/business/hireTalent.tsx/skillDomainForm';
import TalentCard from '@/components/business/hireTalent.tsx/talentCard';
import { useEffect, useState } from 'react';
import { axiosInstance } from '@/lib/axiosinstance';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

interface Skill {
  _id: string;
  label: string;
}

interface Domain {
  _id: string;
  label: string;
}

export default function Talent() {
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const [domainFilter, setDomainFilter] = useState<string | null>(null);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);

  useEffect(() => {
    // Fetch skills and domains to populate the dropdowns
    async function fetchFilters() {
      try {
        const skillsResponse = await axiosInstance.get('/skills/all');
        const domainsResponse = await axiosInstance.get('/domain/all');
        setSkills(skillsResponse.data?.data || []);
        setDomains(domainsResponse.data?.data || []);
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    }
    fetchFilters();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Dehix Talent"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Dehix Talent"
          />
          <Breadcrumb
            items={[
              { label: 'Business', link: '/dashboard/business' },
              { label: 'HireTalent', link: '#' },
            ]}
          />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <DropdownProfile />
        </header>

        {/* Main content area */}
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          {/* Left side: SkillDomainForm */}
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <SkillDomainForm />
          </div>

          {/* Right side: Talent Filter and Cards */}
          <div className="space-y-6">
            <CardTitle className="group flex items-center gap-2 text-2xl">Talent</CardTitle>

            {/* Skill and Domain Filter */}
            <div className="flex space-x-4">
              <Select onValueChange={setSkillFilter} value={skillFilter || ''}>
                <SelectTrigger className="w-[180px]">
                  <span>{skillFilter || 'Select Skill'}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Skills</SelectItem>
                  {skills.map((skill) => (
                    <SelectItem key={skill._id} value={skill.label}>{skill.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={setDomainFilter} value={domainFilter || ''}>
                <SelectTrigger className="w-[180px]">
                  <span>{domainFilter || 'Select Domain'}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Domains</SelectItem>
                  {domains.map((domain) => (
                    <SelectItem key={domain._id} value={domain.label}>{domain.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TalentCard skillFilter={skillFilter} domainFilter={domainFilter} />
          </div>
        </main>
      </div>
    </div>
  );
}
