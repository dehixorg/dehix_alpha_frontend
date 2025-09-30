'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users2, BookMarked, CheckCircle2, XCircle } from 'lucide-react';

import SidebarMenu from '@/components/menu/sidebarMenu';
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

export default function Talent() {
  const router = useRouter();
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [skillDomainFormProps] = useState<any>();

  const [filterSkill, setFilterSkill] = useState<Skill[]>([]);
  const [filterDomain, setFilterDomain] = useState<Domain[]>([]);

  const handleTabChange = (value: string) => {
    router.push(`/business/talent/${value}`);
  };

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
            { label: 'HireTalent', link: '#' },
            { label: 'Overview', link: '#' },
          ]}
        />

        {/* Tabs Header */}
        <div className="container px-4 py-4">
          <Tabs value="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" asChild>
                <a href="/business/talent">
                  <Users2 className="h-4 w-4 mr-1" />
                  Overview
                </a>
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
                skillDomainFormProps={skillDomainFormProps}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
