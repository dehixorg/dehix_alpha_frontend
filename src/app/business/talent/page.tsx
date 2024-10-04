'use client';
import { useState } from 'react';

import { Search } from '@/components/search';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
interface Skill {
  _id: string;
  label: string;
}

interface Domain {
  _id: string;
  label: string;
}

export default function Talent() {
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');

  const [filterSkill, setFilterSkill] = useState<Skill[]>([]);
  const [filterDomain, setFilterDomain] = useState<Domain[]>([]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 overflow-auto">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Dehix Talent"
      />

      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 py-6 items-center gap-4 border-b bg-background px-4  sm:border-0  sm:px-6">
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
            <Search className="w-full md:w-[200px] lg:w-[336px]" />
          </div>
          <DropdownProfile />
        </header>

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <SkillDomainForm
              setFilterSkill={setFilterSkill}
              setFilterDomain={setFilterDomain}
            />
          </div>

          {/* Right side: Talent Filter and Cards */}
          <div className="space-y-6">
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
            <div className="h-[73vh] overflow-y-scroll no-scrollbar">
              <TalentCard
                skillFilter={skillFilter}
                domainFilter={domainFilter}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
