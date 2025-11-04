'use client';
import React, { useEffect, useRef, useState } from 'react';
import { ListFilter, Search, Table, Users2, Briefcase } from 'lucide-react';
import { BoxModelIcon } from '@radix-ui/react-icons';
import { useSelector } from 'react-redux';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import DehixInterviews from '@/components/freelancer/dehix-talent-interview/DehixInterviews';
import { Input } from '@/components/ui/input';
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
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Current Interviews
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your current interviews, and update skills for better
          matches.
        </p>
      </div>
      <div className="flex flex-col flex-1 items-start gap-4 p-6">
        {/* Filter and Search Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 border-2 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <ListFilter className="h-4 w-4" />
                <span className="font-medium">Filter: {filter}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-semibold">
                Filter by
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filter === 'All'}
                onSelect={() => setFilter('All')}
              >
                All Interviews
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filter === 'Skills'}
                onSelect={() => setFilter('Skills')}
              >
                Skills Only
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filter === 'Domain'}
                onSelect={() => setFilter('Domain')}
              >
                Domain Only
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex justify-center gap-3 items-center w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              {!isFocused && (
                <Search
                  size="sm"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 sm:block md:hidden cursor-pointer"
                  onClick={() => setIsFocused(true)}
                />
              )}

              <Search
                size="sm"
                className={`absolute h-5 w-5 left-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer 
        ${isFocused ? 'sm:flex' : 'hidden md:flex'}`}
              />

              <Input
                placeholder="Search interviews..."
                value={searchQuery}
                ref={inputRef}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`pl-10 pr-4 h-9 border-2 transition-all duration-300 ease-in-out
          ${isFocused ? 'w-full sm:w-72' : 'w-0 sm:w-0 md:w-full'} sm:hidden`}
              />
              <Input
                placeholder="Search interviews by type, skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="pl-10 pr-4 h-9 hidden md:flex border-2 focus-visible:ring-2 focus:ring-0 min-w-[320px]"
              />
            </div>

            {!isFocused && (
              <div className="gap-2 md:hidden flex">
                <Button
                  onClick={() => setIsTableView(true)}
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 border-2"
                >
                  <Table className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setIsTableView(false)}
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 border-2"
                >
                  <BoxModelIcon className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="gap-2 md:flex hidden">
              <Button
                onClick={() => setIsTableView(true)}
                variant="outline"
                size="sm"
                className="h-9 px-3 border-2 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <Table className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setIsTableView(false)}
                variant="outline"
                size="sm"
                className="h-9 px-3 border-2 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <BoxModelIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full flex justify-center items-center flex-col">
          <div className="w-full space-y-8">
            <div className="w-full">
              <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                    <Users2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Dehix Talent Interviews
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Skill and domain verification interviews
                    </p>
                  </div>
                </div>
              </div>
              <DehixInterviews />
            </div>

            <div className="w-full">
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Project Interviews
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Project-specific interview opportunities
                    </p>
                  </div>
                </div>
              </div>
              <Projects />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
