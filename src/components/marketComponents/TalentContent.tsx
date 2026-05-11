'use client';
import React, { useEffect, useState } from 'react';
import { Loader2, Search, Sliders, X } from 'lucide-react';
import dynamic from 'next/dynamic';

// ✅ Lazy load better candidates
const InvitedProfileCards = dynamic(
  () =>
    import('./sidebar-projectComponents/profileCards.tsx/invitedProfileCards'),
  { loading: () => <></> },
);

const RejectedProfileCards = dynamic(
  () =>
    import('./sidebar-projectComponents/profileCards.tsx/rejectedProfileCards'),
  { loading: () => <></> },
);

// ❌ Removed lazy loading (core UI → normal import)
import SkillDomainForm from '@/components/business/hireTalent.tsx/skillDomainForm';
import TalentCard from '@/components/business/hireTalent.tsx/talentCard';
import { calculateExperience } from '@/components/marketComponents/TalentLayout';
import { CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface SkillOption {
  _id: string;
  label: string;
}

interface DomainOption {
  _id: string;
  label: string;
}

interface TalentContentProps {
  activeTab: 'applications' | 'overview';
  talents: any[];
  loading: boolean;
  statusFilter?: 'invited' | 'accepted' | 'rejected' | 'applications';
  onStatusFilterChange?: (
    value: 'invited' | 'accepted' | 'rejected' | 'applications' | undefined,
  ) => void;
  talentFilter?: string;
  onTalentFilterChange?: (value: string | undefined) => void;
  talentOptions?: { label: string; value: string }[];
  onUpdateApplicationStatus?: (
    freelancerId: string,
    status: 'SELECTED' | 'REJECTED',
  ) => Promise<void>;
}

const TalentContent: React.FC<TalentContentProps> = ({
  activeTab,
  talents,
  loading,
  statusFilter,
  onStatusFilterChange,
  talentFilter,
  onTalentFilterChange,
  talentOptions,
  onUpdateApplicationStatus,
}) => {
  const [isLargeScreen, setIsLargeScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [filterSkill, setFilterSkill] = useState<SkillOption[]>([]);
  const [filterDomain, setFilterDomain] = useState<DomainOption[]>([]);
  const [talentSearchQuery, setTalentSearchQuery] = useState('');

  const SearchInput = ({
    placeholder,
    value,
    onChange,
    onClear,
  }: {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
  }) => (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-8 h-9 text-sm pr-8"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-8 w-8"
          onClick={onClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  const renderCards = () => {
    if (activeTab === 'overview') {
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
          <div className="lg:col-span-2">
            <SkillDomainForm
              setFilterSkill={setFilterSkill}
              setFilterDomain={setFilterDomain}
            />
          </div>

          <div className="space-y-6">
            <CardTitle className="text-2xl">Talent</CardTitle>

            <div className="flex flex-col space-y-4">
              <Select onValueChange={setSkillFilter} value={skillFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {filterSkill.map((skill) => (
                    <SelectItem key={skill._id} value={skill.label}>
                      {skill.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={setDomainFilter} value={domainFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {filterDomain.map((domain) => (
                    <SelectItem key={domain._id} value={domain.label}>
                      {domain.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="h-[75vh] overflow-y-scroll">
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
    }

    if (activeTab === 'applications') {
      const selected = statusFilter ?? 'all';

      const cards =
        selected === 'rejected' ? (
          <RejectedProfileCards
            talents={talents}
            loading={loading}
            calculateExperience={calculateExperience}
          />
        ) : (
          <InvitedProfileCards
            talents={talents}
            loading={loading}
            calculateExperience={calculateExperience}
            showDecisionActions={selected === 'applications'}
            onDecision={onUpdateApplicationStatus}
          />
        );

      return <div>{cards}</div>;
    }

    return null;
  };

  return <>{renderCards()}</>;
};

export default TalentContent;
