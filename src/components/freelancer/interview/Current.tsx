'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Briefcase, GraduationCap, Search, Table } from 'lucide-react';
import { BoxModelIcon } from '@radix-ui/react-icons';
import { useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import DehixInterviews from '@/components/freelancer/dehix-talent-interview/DehixInterviews';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { axiosInstance } from '@/lib/axiosinstance';
import type { RootState } from '@/lib/store';
import Projects from '@/components/freelancer/projectInterview/ProjectInterviews';
import { notifyError } from '@/utils/toastMessage';

export default function CurrentComponent() {
  const [filter, setFilter] = React.useState<'All' | 'Skills' | 'Domain'>(
    'All',
  );
  const [, setIsTableView] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const user = useSelector((state: RootState) => state.user);
  const [, setSkillData] = useState<any>([]);
  const [, setDomainData] = useState<any>([]);
  const [, setProjectSkill] = useState<any>([]);
  const [, setProjectDomain] = useState<any>([]);

  const [, setIsloading] = useState(false);

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setIsloading(true);
        const response = await axiosInstance.get(
          '/interview/current-interview',
          {
            params: {
              intervieweeId: user.uid,
            },
          },
        );

        const interviewData = response.data?.data.dehixTalent ?? [];
        const projectData = response.data?.data.projects ?? [];

        const normalizedInterviewData = Array.isArray(interviewData)
          ? interviewData
          : [interviewData];

        const normalizedProjectData = Array.isArray(projectData)
          ? projectData
          : [projectData];

        const skillArray = normalizedInterviewData.filter(
          (item: any) => item?.talentType === 'SKILL',
        );
        const domainArray = normalizedInterviewData.filter(
          (item: any) => item?.talentType === 'DOMAIN',
        );

        const projectSkillArray = normalizedProjectData.filter(
          (item: any) => item?.talentType === 'SKILL',
        );
        const projectDomainArray = normalizedProjectData.filter(
          (item: any) => item?.talentType === 'DOMAIN',
        );

        setSkillData(skillArray ?? []);
        setDomainData(domainArray ?? []);
        setProjectSkill(projectSkillArray ?? []);
        setProjectDomain(projectDomainArray ?? []);
      } catch (err: any) {
        if (
          err.response?.status === 404 &&
          (err.response?.data?.message === 'Current Interview not found' ||
            err.response?.data?.code === 'NOT_FOUND')
        ) {
          setSkillData([]);
          setDomainData([]);
          setProjectSkill([]);
          setProjectDomain([]);
        } else {
          notifyError('Something went wrong. Please try again.', 'Error');
          console.error('Failed to load data. Please try again.', err);
          setSkillData([]);
          setDomainData([]);
          setProjectSkill([]);
          setProjectDomain([]);
        }
      } finally {
        setIsloading(false);
      }
    };

    fetchInterviews();
  }, [user?.uid]);

  return (
    <>
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:w-48">
              <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Skills">Skills</SelectItem>
                  <SelectItem value="Domain">Domain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search interviews..."
                value={searchQuery}
                ref={inputRef}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsTableView(true)}
              variant="outline"
              size="sm"
              className="h-9"
            >
              <Table className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setIsTableView(false)}
              variant="outline"
              size="sm"
              className="h-9"
            >
              <BoxModelIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Accordion type="single" collapsible defaultValue="dehix-talent">
          <AccordionItem value="dehix-talent" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-md bg-blue-500/10 text-blue-600">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div className="text-left leading-tight">
                    <div className="text-sm font-semibold">Dehix Talent</div>
                    <div className="text-xs text-muted-foreground">
                      Interviews from your Dehix Talent profile
                    </div>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <DehixInterviews />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="projects" className="border rounded-lg mt-4">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-md bg-emerald-500/10 text-emerald-600">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="text-left leading-tight">
                    <div className="text-sm font-semibold">Projects</div>
                    <div className="text-xs text-muted-foreground">
                      Interviews scheduled for your projects
                    </div>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <Projects />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
