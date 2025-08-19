'use client';
import React, { useEffect, useRef, useState } from 'react';
// import { z } from 'zod';
// import { useForm } from 'react-hook-form';
import { ListFilter, Search, Table } from 'lucide-react';
// import { zodResolver } from '@hookform/resolvers/zod';
import { BoxModelIcon } from '@radix-ui/react-icons';
import { useSelector } from 'react-redux';
// import CurrentInterviews from "@/components/freelancer/scheduleInterview/CurrentInterviews";

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
import SkeletonLoader from '@/components/shared/SkeletonLoader';
import Projects from '@/components/freelancer/projectInterview/ProjectInterviews';
import { toast } from '@/components/ui/use-toast';

export default function CurrentPage() {
  // const [sampleInterviews, setSampleInterviews] = React.useState<Interview[]>([
  //   {
  //     reference: 'Jane Smith',
  //     skill: 'HTML/CSS',
  //     interviewDate: '2023-11-23T10:30:00Z',
  //     rating: 9,
  //     comments: '',
  //     status: 'Pending',
  //     description:
  //       'This interview focused on assessing proficiency in HTML/CSS and evaluating communication skills.',
  //     contact: 'jane.smith@example.com',
  //   },
  //   {
  //     reference: 'Chirag Vaviya',
  //     domain: 'DevOps',
  //     interviewDate: '2023-11-23T10:30:00Z',
  //     rating: 9,
  //     comments: '',
  //     status: 'Pending',
  //     description:
  //       "This interview was scheduled to discuss the candidate's experience and skills in DevOps.",
  //     contact: 'jane.smith@example.com',
  //   },
  // ]);

  const [filter, setFilter] = React.useState<'All' | 'Skills' | 'Domain'>(
    'All',
  );
  const [isTableView, setIsTableView] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const user = useSelector((state: RootState) => state.user);
  const [, setSkillData] = useState<any>([]);
  const [, setDomainData] = useState<any>([]);
  const [, setProjectSkill] = useState<any>([]);
  const [, setProjectDomain] = useState<any>([]);

  const [isLoading, setIsloading] = useState(false);

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

        // Normalize both interviewData and projectData into arrays if not already
        const normalizedInterviewData = Array.isArray(interviewData)
          ? interviewData
          : [interviewData];

        const normalizedProjectData = Array.isArray(projectData)
          ? projectData
          : [projectData];

        // Split interviewData into SKILL and DOMAIN
        const skillArray = normalizedInterviewData.filter(
          (item: any) => item?.talentType === 'SKILL',
        );
        const domainArray = normalizedInterviewData.filter(
          (item: any) => item?.talentType === 'DOMAIN',
        );

        // Split projectData into SKILL and DOMAIN
        const projectSkillArray = normalizedProjectData.filter(
          (item: any) => item?.talentType === 'SKILL',
        );
        const projectDomainArray = normalizedProjectData.filter(
          (item: any) => item?.talentType === 'DOMAIN',
        );

        // Set state
        setSkillData(skillArray ?? []);
        setDomainData(domainArray ?? []);
        setProjectSkill(projectSkillArray ?? []);
        setProjectDomain(projectDomainArray ?? []);
      } catch (err: any) {
        // Check if this is the specific "no current interviews" case
        if (
          err.response?.status === 404 &&
          (err.response?.data?.message === 'Current Interview not found' ||
            err.response?.data?.code === 'NOT_FOUND')
        ) {
          // This is not an error - just no current interviews scheduled
          setSkillData([]);
          setDomainData([]);
          setProjectSkill([]);
          setProjectDomain([]);
        } else {
          // This is a real error - show error toast
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Something went wrong. Please try again.',
          });
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

  // const handleCommentSubmit = (index: number, comment: string) => {
  //   const updatedInterviews = [...sampleInterviews];

  //   console.log('Before update:', updatedInterviews[index]);

  //   updatedInterviews[index] = {
  //     ...updatedInterviews[index],
  //     comments: comment,
  //     status: 'Complete',
  //   };

  //   console.log('After update:', updatedInterviews[index]);

  //   setSampleInterviews(updatedInterviews);
  // };

  // const filteredInterviews = sampleInterviews.filter((interview) => {
  //   if (interview.status === 'Complete') return false;
  //   if (filter === 'All') return true;
  //   if (filter === 'Skills' && interview.skill) return true;
  //   if (filter === 'Domain' && interview.domain) return true;
  //   return false;
  // });

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex flex-col mb-8 sm:gap-4 sm:py-0 sm:pl-14 w-full">
        <div className="ml-10">
          <h1 className="text-3xl font-bold">Current Interviews</h1>
          <p className="text-gray-400 mt-2">
            View and manage your current interviews, and update skills for
            better matches.
          </p>
        </div>
        <div className="flex flex-col flex-1 items-start gap-4 p-2 sm:px-6 sm:py-0 md:gap-8 lg:flex-col xl:flex-col pt-2 pl-4 sm:pt-4 sm:pl-6 md:pt-6 md:pl-8">
          <div className="flex justify-between items-center w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1  text-sm"
                >
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filter === 'All'}
                  onSelect={() => setFilter('All')}
                >
                  All
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filter === 'Skills'}
                  onSelect={() => setFilter('Skills')}
                >
                  Skills
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filter === 'Domain'}
                  onSelect={() => setFilter('Domain')}
                >
                  Domain
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex justify-center gap-3 items-center">
              <div className="relative flex-1 mr-2">
                {!isFocused && (
                  <Search
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 sm:block md:hidden ml-0.5 cursor-pointer"
                    onClick={() => setIsFocused(true)}
                  />
                )}

                <Search
                  size="sm"
                  className={`absolute h-7 gap-1 text-sm left-2 top-1/2 transform -translate-y-1/2 w-5 text-gray-400 cursor-pointer 
        ${isFocused ? 'sm:flex' : 'hidden md:flex'}`}
                />

                <Input
                  placeholder="Search interview"
                  value={searchQuery}
                  ref={inputRef}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className={`pl-8 transition-all duration-300 ease-in-out
          ${isFocused ? 'w-full sm:w-72' : 'w-0 sm:w-0 md:w-full'} sm:hidden `}
                />
                <Input
                  placeholder="Search interview by..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="pl-8 hidden md:flex border focus-visible:ring-1  focus:ring-0 "
                />
              </div>

              {!isFocused && (
                <div className="gap-2 md:hidden flex">
                  <Button
                    onClick={() => setIsTableView(true)}
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-sm"
                  >
                    <Table className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => setIsTableView(false)}
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-sm"
                  >
                    <BoxModelIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {/* Always visible in md+ */}
              <div className="gap-2 md:flex hidden">
                <Button
                  onClick={() => setIsTableView(true)}
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-sm"
                >
                  <Table className="h-3.5 w-3.5" />
                </Button>
                <Button
                  onClick={() => setIsTableView(false)}
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-sm"
                >
                  <BoxModelIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInterviews.map((interview, index) => (
              <InterviewCard
                key={index}
                index={index}
                interview={interview}
                handleCommentSubmit={handleCommentSubmit}
              />
            ))}
          </div>  */}
          <div className="w-full flex justify-center items-center flex-col">
            {isLoading ? (
              <SkeletonLoader isTableView={isTableView} />
            ) : (
              <div className="w-full space-y-8">
                {/* Dehix Talent Interviews Section */}
                <div className="w-full">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold ">
                      Dehix Talent Interviews
                    </h2>
                  </div>
                  <DehixInterviews />

                  {/* {skillData.length === 0 && domainData.length === 0 ? (
                  {/* {skillData.length === 0 && domainData.length === 0 ? (
                    <div className="text-center py-8 w-full ">
                      <PackageOpen
                        className="mx-auto text-gray-400"
                        size="60"
                      />
                      <p className="text-gray-500 text-base font-medium mt-3">
                        No Dehix talent interviews scheduled.
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Browse available talent opportunities to schedule new
                        interviews.
                      </p>
                    </div>
                  ) : (
                    <DehixInterviews
                      skillData={skillData}
                      domainData={domainData}
                      searchQuery={searchQuery}
                      isTableView={isTableView}
                      filter={filter}
                    />
                  )} */}
                </div>

                {/* Project Interviews Section */}
                <div className="w-full">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold ">
                      Project Interviews
                    </h2>
                  </div>
                  <Projects />
                  <Projects />
                  {/* {projectSkill.length === 0 && projectDomain.length === 0 ? (
                    <div className="text-center py-8 w-full">
                      <PackageOpen
                        className="mx-auto text-gray-400"
                        size="60"
                      />
                      <p className="text-gray-500 text-base font-medium mt-3">
                        No project interviews scheduled.
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Check your project applications for upcoming interview
                        opportunities.
                      </p>
                    </div>
                  ) : (
                    <Projects
                      searchQuery={searchQuery}
                      isTableView={isTableView}
                      skillData={projectSkill}
                      domainData={projectDomain}
                      filter={filter}
                    />
                  )} */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
