// src/components/marketComponents/TalentContent.tsx
'use client';
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

import InvitedProfileCards from './sidebar-projectComponents/profileCards.tsx/invitedProfileCards';
import AcceptedProfileCards from './sidebar-projectComponents/profileCards.tsx/acceptedProfileCards';
import RejectedProfileCards from './sidebar-projectComponents/profileCards.tsx/rejectedProfileCards';

import { calculateExperience } from '@/components/marketComponents/TalentLayout'; //
import { CardTitle } from '@/components/ui/card';
import SkillDomainForm from '@/components/business/hireTalent/skillDomainForm';
import TalentCard from '@/components/business/hireTalent/talentCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SkillOption {
  _id: string;
  label: string;
}

interface DomainOption {
  _id: string;
  label: string;
}

interface TalentContentProps {
  activeTab: 'invited' | 'accepted' | 'rejected' | 'applications' | 'overview';
  talents: any[];
  loading: boolean;
}

const TalentContent: React.FC<TalentContentProps> = ({
  activeTab,
  talents,
  loading,
}) => {
  // State for overview tab filters
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [filterSkill, setFilterSkill] = useState<SkillOption[]>([]);
  const [filterDomain, setFilterDomain] = useState<DomainOption[]>([]);

  const renderCards = () => {
    if (activeTab === 'applications' || activeTab === 'invited') {
      return (
        <InvitedProfileCards
          talents={talents}
          loading={loading}
          calculateExperience={calculateExperience}
        />
      );
    } else if (activeTab === 'overview') {
      if (loading) {
        return (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            <span>Loading</span>
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side: Skill Domain Form (2/3 width) */}
          <div className="lg:col-span-2">
            <SkillDomainForm
              setFilterSkill={setFilterSkill}
              setFilterDomain={setFilterDomain}
            />
          </div>

          {/* Right side: Talent Filter and Cards (1/3 width) */}
          <div className="space-y-6">
            <CardTitle className="group flex items-center gap-2 text-2xl">
              Talent
            </CardTitle>

            {/* Skill and Domain Filter */}
            <div className="flex flex-col space-y-4">
              <Select onValueChange={setSkillFilter} value={skillFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {filterSkill?.map((skill) => (
                    <SelectItem
                      key={skill._id || skill.label}
                      value={skill.label}
                    >
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
                    <SelectItem
                      key={domain._id || domain.label}
                      value={domain.label}
                    >
                      {domain.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Talent Cards */}
            <div className="h-[75vh] rounded-lg overflow-y-scroll no-scrollbar">
              <TalentCard
                skillFilter={skillFilter}
                domainFilter={domainFilter}
                setFilterSkill={setFilterSkill}
                setFilterDomain={setFilterDomain}
              />
            </div>
          </div>
        </div>
      );
    } else if (activeTab === 'accepted') {
      return (
        <AcceptedProfileCards
          talents={talents}
          loading={loading}
          calculateExperience={calculateExperience}
        />
      );
    } else if (activeTab === 'rejected') {
      return (
        <RejectedProfileCards
          talents={talents}
          loading={loading}
          calculateExperience={calculateExperience}
        />
      );
    }
    return null;
  };

  return (
    <>
      {activeTab === 'overview' ? (
        // Overview tab has its own layout structure
        renderCards()
      ) : (
        // Other tabs use the standard header + content layout
        <>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Talents
            </h2>
            <span className="text-muted-foreground">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading</span>
                </span>
              ) : (
                `Showing ${talents.length} results`
              )}
            </span>
          </div>
          {renderCards()}
        </>
      )}
    </>
  );
};

export default TalentContent;
