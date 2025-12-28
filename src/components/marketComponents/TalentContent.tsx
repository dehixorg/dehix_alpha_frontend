// src/components/marketComponents/TalentContent.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { Loader2, Search, Sliders, X } from 'lucide-react';

import InvitedProfileCards from './sidebar-projectComponents/profileCards.tsx/invitedProfileCards';
import AcceptedProfileCards from './sidebar-projectComponents/profileCards.tsx/acceptedProfileCards';
import RejectedProfileCards from './sidebar-projectComponents/profileCards.tsx/rejectedProfileCards';

import { calculateExperience } from '@/components/marketComponents/TalentLayout'; //
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
    value: 'invited' | 'accepted' | 'rejected' | 'applications',
  ) => void;
  talentFilter?: string;
  onTalentFilterChange?: (value: string) => void;
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

  // State for overview tab filters
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
  }) => {
    return (
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
  };

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
                <SelectContent className="max-h-56 overflow-y-auto">
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
                <SelectContent className="max-h-56 overflow-y-auto">
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
    } else if (activeTab === 'applications') {
      const selected = statusFilter || 'invited';
      const defaultTalentId = (talentOptions || [])[0]?.value || '';
      const activeFilterCount =
        (defaultTalentId && talentFilter ? 1 : 0) +
        (selected !== 'invited' ? 1 : 0);

      const handleReset = () => {
        if (defaultTalentId) onTalentFilterChange?.(defaultTalentId);
        onStatusFilterChange?.('invited');
      };
      const cards =
        selected === 'accepted' ? (
          <AcceptedProfileCards
            talents={talents}
            loading={loading}
            calculateExperience={calculateExperience}
          />
        ) : selected === 'rejected' ? (
          <RejectedProfileCards
            talents={talents}
            loading={loading}
            calculateExperience={calculateExperience}
          />
        ) : (
          // invited + applications (applied) share the same card layout today
          <InvitedProfileCards
            talents={talents}
            loading={loading}
            calculateExperience={calculateExperience}
            showDecisionActions={selected === 'applications'}
            onDecision={onUpdateApplicationStatus}
          />
        );

      const FiltersPanel = ({ onReset }: { onReset: () => void }) => (
        <div className="border rounded-lg flex flex-col">
          <div className="bg-gradient border-b p-4 rounded-t-lg">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Filters</h2>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground self-center">
                {activeFilterCount} filter
                {activeFilterCount !== 1 ? 's' : ''} applied
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="flex items-center gap-1 text-red-500 hover:text-red-500/80 transition-colors bg-red-500/10 hover:bg-red-500/20"
              >
                Clear all
              </Button>
            </div>
          </div>

          <div className="flex-1 px-4 pb-2 pt-4 overflow-auto no-scrollbar">
            <Accordion
              type="multiple"
              defaultValue={['status', 'talent']}
              className="space-y-4 pb-2"
            >
              <AccordionItem
                value="status"
                className="border p-3 rounded-lg card"
              >
                <AccordionTrigger className="py-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Status</span>
                    {selected !== 'invited' && (
                      <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                        1
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="py-2 px-1">
                  <ScrollArea className="h-full w-full pr-2">
                    <RadioGroup
                      value={selected}
                      onValueChange={(v) =>
                        onStatusFilterChange?.(
                          v as
                            | 'invited'
                            | 'accepted'
                            | 'rejected'
                            | 'applications',
                        )
                      }
                      className="gap-2"
                    >
                      <Label
                        htmlFor="talent-status-invited"
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition-colors hover:bg-muted/40 ${
                          selected === 'invited'
                            ? 'bg-muted/50 border-primary/30'
                            : ''
                        }`}
                      >
                        <RadioGroupItem
                          value="invited"
                          id="talent-status-invited"
                        />
                        <span className="text-sm">Invited</span>
                      </Label>

                      <Label
                        htmlFor="talent-status-accepted"
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition-colors hover:bg-muted/40 ${
                          selected === 'accepted'
                            ? 'bg-muted/50 border-primary/30'
                            : ''
                        }`}
                      >
                        <RadioGroupItem
                          value="accepted"
                          id="talent-status-accepted"
                        />
                        <span className="text-sm">Accepted</span>
                      </Label>

                      <Label
                        htmlFor="talent-status-rejected"
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition-colors hover:bg-muted/40 ${
                          selected === 'rejected'
                            ? 'bg-muted/50 border-primary/30'
                            : ''
                        }`}
                      >
                        <RadioGroupItem
                          value="rejected"
                          id="talent-status-rejected"
                        />
                        <span className="text-sm">Rejected</span>
                      </Label>

                      <Label
                        htmlFor="talent-status-applied"
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition-colors hover:bg-muted/40 ${
                          selected === 'applications'
                            ? 'bg-muted/50 border-primary/30'
                            : ''
                        }`}
                      >
                        <RadioGroupItem
                          value="applications"
                          id="talent-status-applied"
                        />
                        <span className="text-sm">Applied</span>
                      </Label>
                    </RadioGroup>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="talent"
                className="border p-3 rounded-lg card"
              >
                <AccordionTrigger className="py-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Talent</span>
                    {talentFilter && (
                      <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                        1
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="py-2 px-1">
                  <div className="space-y-3">
                    <SearchInput
                      placeholder="Search talent..."
                      value={talentSearchQuery}
                      onChange={setTalentSearchQuery}
                      onClear={() => setTalentSearchQuery('')}
                    />
                    <div className="h-60 overflow-hidden">
                      <ScrollArea className="h-full w-full pr-2">
                        <div className="space-y-1 py-1">
                          {(talentOptions || [])
                            .filter((opt) =>
                              opt.label
                                .toLowerCase()
                                .includes(talentSearchQuery.toLowerCase()),
                            )
                            .map((opt) => {
                              const id = `talent-filter-${opt.value}`;
                              const checked = talentFilter === opt.value;
                              return (
                                <div
                                  key={opt.value}
                                  className="flex items-center space-x-2 hover:bg-muted/50 rounded p-1.5 transition-colors group"
                                >
                                  <Checkbox
                                    id={id}
                                    checked={checked}
                                    onCheckedChange={(next) => {
                                      if (next === true)
                                        onTalentFilterChange?.(opt.value);
                                      else if (defaultTalentId)
                                        onTalentFilterChange?.(defaultTalentId);
                                    }}
                                    className="h-4 w-4 rounded border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                  />
                                  <label
                                    htmlFor={id}
                                    className="text-sm font-medium leading-none cursor-pointer flex-1 group-hover:text-primary transition-colors"
                                  >
                                    {opt.label}
                                  </label>
                                </div>
                              );
                            })}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      );

      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight">Applications</h2>

            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground ml-auto">
              {loading
                ? 'Loading'
                : `${talents.length} ${talents.length === 1 ? 'result' : 'results'}`}
            </span>

            {!isLargeScreen && (
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Sliders className="h-4 w-4" />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="px-1.5 py-0.5">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md">
                  <ScrollArea className="h-full">
                    <FiltersPanel
                      onReset={() => {
                        handleReset();
                        setFiltersOpen(false);
                      }}
                    />
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            )}
          </div>

          <div className="flex flex-1 flex-col lg:flex-row">
            {isLargeScreen && (
              <aside className="w-full lg:w-80 flex-shrink-0 lg:pr-6">
                <div className="lg:sticky lg:top-20">
                  <FiltersPanel onReset={handleReset} />
                </div>
              </aside>
            )}

            <div className="flex-1 overflow-y-auto pr-1">{cards}</div>
          </div>
        </div>
      );
    }
    return null;
  };

  return <>{renderCards()}</>;
};

export default TalentContent;
