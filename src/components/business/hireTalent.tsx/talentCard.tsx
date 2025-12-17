'use client';

import type React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Expand, Github, Linkedin, Dot, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import InfiniteScroll from '@/components/ui/infinite-scroll';
import {
  Dehix_Talent_Card_Pagination,
  type HireDehixTalentStatusEnum,
} from '@/utils/enum';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { StatusEnum } from '@/utils/freelancer/enum';
import type { RootState } from '@/lib/store';
import AddToLobbyDialog from '@/components/shared/AddToLobbyDialog';

interface Education {
  _id: string;
  degree: string;
  universityName: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  grade: string;
}
interface Projects {
  _id: string;
  projectName: string;
  githubLink: string;
  techUsed: string[];
  role: string;
}

interface Education {
  _id: string;
  degree: string;
  universityName: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  grade: string;
}
interface Projects {
  _id: string;
  projectName: string;
  githubLink: string;
  techUsed: string[];
  role: string;
}

interface DehixTalent {
  freelancer_id: any;
  _id: string;
  type: string;
  skillName?: string;
  talentName?: string;
  domainName?: string;
  experience: string;
  talentMonthlyPay: string;
  status: HireDehixTalentStatusEnum;
  activeStatus: boolean;
}

interface Talent {
  freelancer_id: string;
  Name: string;
  userName: string;
  profilePic: string;
  talent: DehixTalent;
  Github: any;
  LinkedIn: any;
  education?: Record<string, Education>;
  projects?: Record<string, Projects>;
}

interface SkillOption {
  _id: string;
  label: string;
}

interface DomainOption {
  _id: string;
  label: string;
}

interface TalentCardProps {
  skillFilter: string | null;
  domainFilter: string | null;
  setFilterSkill?: (skills: SkillOption[]) => void;
  setFilterDomain?: (domains: DomainOption[]) => void;
}
interface SkillDomainData {
  uid: string;
  label: string;
  experience: string;
  description: string;
  status: string;
  visible: boolean;
}

const SHEET_SIDES = ['left'] as const;

// type SheetSide = (typeof SHEET_SIDES)[number];

const TalentCard: React.FC<TalentCardProps> = ({
  skillFilter,
  domainFilter,
  setFilterSkill,
  setFilterDomain,
}) => {
  const [talents, setTalents] = useState<Talent[]>([]);
  const skipRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isRequestInProgress = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [skills, setSkills] = useState<SkillOption[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [domains, setDomains] = useState<DomainOption[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const user = useSelector((state: RootState) => state.user);
  const [skillDomainData, setSkillDomainData] = useState<SkillDomainData[]>([]);
  const [, setStatusVisibility] = useState<boolean[]>([]);
  const [invitedTalents] = useState<Set<string>>(new Set());
  const [selectedTalent, setSelectedTalent] = useState<any>();
  const [currSkills, setCurrSkills] = useState<any>([]);
  const [tmpSkill, setTmpSkill] = useState<any>('');
  const [isDialogOpen, setIsDialogOpen] = useState<any>(false);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [openSheetId, setOpenSheetId] = useState<string | null>(null);
  const isSheetClosingRef = useRef(false);

  const handleAddSkill = () => {
    if (tmpSkill && !currSkills.some((skill: any) => skill.name === tmpSkill)) {
      setCurrSkills([
        ...currSkills,
        {
          name: tmpSkill,
          level: '',
          experience: '',
          interviewStatus: StatusEnum.PENDING,
          interviewInfo: '',
          interviewerRating: 0,
        },
      ]);
      setTmpSkill('');
    }
  };
  const handleDeleteSkill = (skillToDelete: string) => {
    setCurrSkills(
      currSkills.filter((skill: any) => skill.name !== skillToDelete),
    );
  };
  useEffect(() => {
    const fetchSkillsAndDomains = async () => {
      try {
        const [skillsResponse, domainsResponse] = await Promise.all([
          axiosInstance.get('/skills'),
          axiosInstance.get('/domain'),
        ]);

        setSkills(skillsResponse.data?.data || []);
        setDomains(domainsResponse.data?.data || []);
      } catch (error) {
        console.error('Error fetching skills and domains:', error);
        notifyError(
          'Failed to load skills and domains. Please try again.',
          'Error',
        );
      }
    };

    fetchSkillsAndDomains();
  }, []);
  const fetchUserData = useCallback(async () => {
    try {
      const skillsResponse = await axiosInstance.get('/skills');
      if (skillsResponse?.data?.data) {
        setSkills(skillsResponse.data.data);
      } else {
        throw new Error('Skills response is null or invalid');
      }
      const domainsResponse = await axiosInstance.get('/domain');
      if (domainsResponse?.data?.data) {
        setDomains(domainsResponse.data.data);
      } else {
        throw new Error('Domains response is null or invalid');
      }

      // Fetch the skill/domain data for the specific freelancer
      if (user?.uid) {
        const hireTalentResponse = await axiosInstance.get(
          `/business/hire-dehixtalent`,
        );
        const hireTalentData = hireTalentResponse.data?.data || {};

        // Filter and map user data
        const fetchedFilterSkills = hireTalentData
          .filter((item: any) => item.skillName && item.visible)
          .map((item: any) => ({
            _id: item.skillId,
            label: item.skillName,
          }));

        const fetchedFilterDomains = hireTalentData
          .filter((item: any) => item.domainName && item.visible)
          .map((item: any) => ({
            _id: item.domainId,
            label: item.domainName,
          }));
        // Send the filtered skills and domains back to the parent via setters
        setFilterSkill?.(fetchedFilterSkills);
        setFilterDomain?.(fetchedFilterDomains);

        // Convert the talent object into an array
        const formattedHireTalentData = Object.values(hireTalentData).map(
          (item: any) => ({
            uid: item._id,
            label: item.skillName || item.domainName || 'N/A',
            experience: item.experience || 'N/A',
            description: item.description || 'N/A',
            status: item.status,
            visible: item.visible,
            talentId: item.skillId || item.domainId,
          }),
        );

        setSkillDomainData(formattedHireTalentData);
        setStatusVisibility(
          formattedHireTalentData.map((item) => item.visible),
        );

        const filterSkills = hireTalentData
          .filter((item: any) => item.skillName)
          .map((item: any) => ({
            _id: item.skillId,
            label: item.skillName,
          }));

        const filterDomains = hireTalentData
          .filter((item: any) => item.domainName)
          .map((item: any) => ({
            _id: item.domainId,
            label: item.domainName,
          }));

        // fetch skills and domains data
        const skillsResponse = await axiosInstance.get('/skills');
        if (skillsResponse?.data?.data) {
          const uniqueSkills = skillsResponse.data.data.filter(
            (skill: any) =>
              !filterSkills.some(
                (filterSkill: any) => filterSkill._id === skill._id,
              ),
          );
          setSkills(uniqueSkills);
        } else {
          throw new Error('Skills response is null or invalid');
        }
        const domainsResponse = await axiosInstance.get('/domain');
        if (domainsResponse?.data?.data) {
          const uniqueDomain = domainsResponse.data.data.filter(
            (domain: any) =>
              !filterDomains.some(
                (filterDomain: any) => filterDomain._id === domain._id,
              ),
          );
          setDomains(uniqueDomain);
        } else {
          throw new Error('Domains response is null or invalid');
        }
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      if (error.response && error.response.status === 404) {
        // Do Nothing
      } else {
        notifyError('Something went wrong. Please try again.', 'Error');
      }
    }
  }, [user?.uid, setFilterSkill, setFilterDomain]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const fetchTalentData = useCallback(
    async (newSkip = skipRef.current, reset = false) => {
      if (isRequestInProgress.current) return;

      try {
        isRequestInProgress.current = true;
        setLoading(true);
        const params: any = {
          limit: Dehix_Talent_Card_Pagination.BATCH,
          skip: newSkip,
        };

        // If a skill is selected, set the type to SKILL and pass the name
        if (skillFilter && skillFilter !== 'all') {
          params.talentType = 'SKILL';
          params.talentName = skillFilter;
        }
        // Otherwise, if a domain is selected, set the type to DOMAIN and pass the name
        else if (domainFilter && domainFilter !== 'all') {
          params.talentType = 'DOMAIN';
          params.talentName = domainFilter;
        }

        const response = await axiosInstance.get('freelancer/dehixtalent', {
          params, // Pass the dynamic params object
        });

        const fetchedData = response?.data?.data || [];

        if (fetchedData.length < Dehix_Talent_Card_Pagination.BATCH) {
          setHasMore(false);
        }

        if (response?.data?.data) {
          setTalents((prev) =>
            reset ? fetchedData : [...prev, ...fetchedData],
          );
          skipRef.current = reset
            ? Dehix_Talent_Card_Pagination.BATCH
            : skipRef.current + Dehix_Talent_Card_Pagination.BATCH;
        } else {
          throw new Error('Fail to fetch data');
        }
      } catch (error: any) {
        console.error('Error fetching talent data', error);
        if (error.response && error.response.status === 404) {
          setHasMore(false); // No more data to fetch
        } else {
          notifyError('Something went wrong. Please try again.', 'Error');
        }
      } finally {
        setLoading(false);
        isRequestInProgress.current = false;
      }
    },
    [skillFilter, domainFilter], // Add filters to dependency array
  );

  const resetAndFetchData = useCallback(() => {
    setTalents([]);
    skipRef.current = 0;
    setHasMore(true);
    fetchTalentData(0, true); // Pass 0 as the skip value to start from the beginning
  }, [fetchTalentData]);

  // This useEffect now triggers a new API call when filters change.
  useEffect(() => {
    resetAndFetchData();
  }, [skillFilter, domainFilter]); // Trigger reset when filters change

  const handleAddToLobby = async (freelancerId: string): Promise<boolean> => {
    const matchedTalentIds: string[] = [];
    const matchedTalentUids: string[] = [];

    currSkills.forEach((skill: any) => {
      const matched: any = skillDomainData.find(
        (item: any) => item.label === skill.name,
      );
      if (matched?.talentId && matched?.uid) {
        matchedTalentIds.push(matched.talentId);
        matchedTalentUids.push(matched.uid);
      }
    });

    if (matchedTalentIds.length === 0 || matchedTalentUids.length === 0) {
      notifyError(
        'Please add some skills before adding to lobby.',
        'No Skills Selected',
      );
      return false;
    }
    setIsLoading(true);
    try {
      const response = await axiosInstance.put(
        `business/hire-dehixtalent/add_into_lobby`,
        {
          freelancerId,
          dehixTalentId: matchedTalentIds,
          hireDehixTalent_id: matchedTalentUids,
        },
      );

      if (response.status === 200) {
        notifySuccess('Freelancer added to lobby', 'Success');
        setCurrSkills([]);
        return true;
      }
    } catch (error: any) {
      notifyError('Something went wrong. Please try again.', 'Error');
      return false;
    } finally {
      setIsLoading(false);
    }
    return false;
  };
  return (
    <TooltipProvider>
      <div className="flex flex-wrap mt-4 justify-center gap-4">
        {/* Map directly over 'talents' instead of 'filteredTalents' */}
        {talents.map((talent) => {
          const talentEntry = talent.talent;
          const education = talent.education;
          const projects = talent.projects;
          // const label = talentEntry.skillName ? 'Skill' : 'Domain';
          const label = talentEntry.type === 'SKILL' ? 'Skill' : 'Domain';
          // const value = talentEntry.skillName || talentEntry.domainName || 'N/A';
          const value = talentEntry.talentName || 'N/A';
          const isInvited = invitedTalents.has(talentEntry._id);

          return (
            <Card
              key={talentEntry._id}
              className="group relative w-full sm:w-[350px] lg:w-[450px] overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 bg-muted-foreground/20 dark:bg-muted/20"
              onClick={() => {
                if (isSheetClosingRef.current) return;
                if (isDialogOpen) return; // prevent opening while dialog is active
                setOpenSheetId(talentEntry._id);
              }}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-3 pt-5 px-6">
                <Link
                  href={`/business/freelancerProfile/${talent.freelancer_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-4 max-w-full"
                >
                  <Avatar className="h-14 w-14 rounded-xl border border-gray-200 dark:border-gray-700">
                    <AvatarImage
                      src={talent.profilePic || '/default-avatar.png'}
                    />
                    <AvatarFallback className="rounded-xl">
                      {talent.Name?.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <CardTitle className="text-lg font-bold truncate group-hover:text-primary transition-colors">
                      {talent.Name || 'Unknown'}
                    </CardTitle>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span className="truncate">{talent.userName}</span>
                      <Dot />
                      <span className="truncate">{value}</span>
                    </div>
                  </div>
                </Link>
              </CardHeader>
              <CardContent className="px-6 py-3">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50/80 dark:bg-gray-800/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/50">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Experience
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {talentEntry.experience} years
                      </p>
                    </div>
                    <div className="bg-gray-50/80 dark:bg-gray-800/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/50">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Monthly Pay
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ${talentEntry.talentMonthlyPay}
                      </p>
                    </div>
                  </div>

                  {isInvited && (
                    <Badge
                      variant="outline"
                      className="rounded-full text-xs font-medium px-3 py-1 border-blue-300 text-blue-700 dark:text-blue-300"
                    >
                      Invited
                    </Badge>
                  )}

                  <div className="pt-1">
                    {SHEET_SIDES.map((View) => (
                      <Sheet
                        key={View}
                        open={openSheetId === talentEntry._id}
                        onOpenChange={(open) => {
                          if (open) {
                            setOpenSheetId(talentEntry._id);
                          } else {
                            // Suppress the immediate next card click caused by backdrop/close click
                            isSheetClosingRef.current = true;
                            setOpenSheetId(null);
                            // Give a short window so the closing click doesn't reopen the card
                            setTimeout(() => {
                              isSheetClosingRef.current = false;
                            }, 200);
                          }
                        }}
                      >
                        <SheetContent
                          side={View}
                          className="overflow-y-auto no-scrollbar max-h-[100vh] p-0"
                        >
                          {/* Header section with avatar + illustration */}
                          <div className="px-6 pb-4 mt-5">
                            <div className="flex items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-4">
                                  <Avatar className="h-16 w-16 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <AvatarImage
                                      src={
                                        talent.profilePic ||
                                        '/default-avatar.png'
                                      }
                                    />
                                    <AvatarFallback className="rounded-xl">
                                      TL
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <div className="text-base font-semibold truncate">
                                      {talent.Name}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {talent.userName || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 mt-3">
                                  <a
                                    href={talent.Github || '#'}
                                    target={talent.Github ? '_blank' : '_self'}
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 transition-all ${
                                      talent.Github
                                        ? 'text-primary hover:text-primary/80'
                                        : 'text-gray-500 cursor-default'
                                    }`}
                                    aria-label="GitHub profile"
                                  >
                                    <Github className="w-4 h-4" />
                                  </a>
                                  <a
                                    href={talent.LinkedIn || '#'}
                                    target={
                                      talent.LinkedIn ? '_blank' : '_self'
                                    }
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 transition-all ${
                                      talent.LinkedIn
                                        ? 'text-primary hover:text-primary/80'
                                        : 'text-gray-500 cursor-default'
                                    }`}
                                    aria-label="LinkedIn profile"
                                  >
                                    <Linkedin className="w-4 h-4" />
                                  </a>
                                </div>
                              </div>
                            </div>

                            {/* Meta grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                              <div className="bg-gray-50/80 dark:bg-gray-800/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/50">
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                  {label}
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {value}
                                </p>
                              </div>
                              <div className="bg-gray-50/80 dark:bg-gray-800/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/50">
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                  Experience
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {talentEntry.experience} years
                                </p>
                              </div>
                              <div className="bg-gray-50/80 dark:bg-gray-800/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/50">
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                  Monthly Pay
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  ${talentEntry.talentMonthlyPay}
                                </p>
                              </div>
                            </div>
                          </div>

                          <Separator className="my-2" />
                          <Accordion type="multiple" className="w-full">
                            <AccordionItem value="education">
                              <AccordionTrigger className="w-full flex justify-between px-4 py-2 !no-underline focus:ring-0 focus:outline-none">
                                Education
                              </AccordionTrigger>
                              <AccordionContent className="p-4 transition-all duration-300">
                                {education &&
                                Object.values(education).length > 0 ? (
                                  Object.values(education).map((edu: any) => (
                                    <div
                                      key={edu._id}
                                      className="mb-3 p-3 rounded-lg border border-border/60 bg-muted/30"
                                    >
                                      <p className="text-sm font-semibold">
                                        {edu.degree}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {edu.universityName}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {edu.fieldOfStudy}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(
                                          edu.startDate,
                                        ).toLocaleDateString()}{' '}
                                        -{' '}
                                        {new Date(
                                          edu.endDate,
                                        ).toLocaleDateString()}
                                      </p>
                                      {edu.grade && (
                                        <p className="text-xs text-muted-foreground">
                                          Grade: {edu.grade}
                                        </p>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    No education details available.
                                  </p>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="projects">
                              <AccordionTrigger className="w-full flex justify-between px-4 py-2 !no-underline focus:ring-0 focus:outline-none">
                                Projects
                              </AccordionTrigger>
                              <AccordionContent className="p-4 transition-all duration-300">
                                {projects &&
                                Object.values(projects).length > 0 ? (
                                  Object.values(projects).map(
                                    (project: any) => (
                                      <div
                                        key={project._id}
                                        className="mb-3 p-3 rounded-lg border border-border/60 bg-muted/30"
                                      >
                                        <p className="text-sm font-semibold">
                                          {project.projectName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          Role: {project.role}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          Tech Used:{' '}
                                          {project.techUsed.length > 0
                                            ? project.techUsed.join(', ')
                                            : 'N/A'}
                                        </p>
                                        {project.githubLink && (
                                          <a
                                            href={project.githubLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                                          >
                                            <Github className="w-4 h-4" />
                                            View on GitHub
                                          </a>
                                        )}
                                      </div>
                                    ),
                                  )
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    No projects available.
                                  </p>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="skills">
                              <AccordionTrigger className="w-full flex justify-between px-4 py-2 !no-underline focus:ring-0 focus:outline-none">
                                Skills
                              </AccordionTrigger>
                              <AccordionContent className="p-4 transition-all duration-300">
                                <div className="p-3 rounded-lg border border-border/60 bg-muted/30 text-sm">
                                  {talentEntry.type === 'SKILL'
                                    ? talentEntry.talentName
                                    : 'N/A'}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="domain">
                              <AccordionTrigger className="w-full flex justify-between px-4 py-2 !no-underline focus:ring-0 focus:outline-none">
                                Domain
                              </AccordionTrigger>
                              <AccordionContent className="p-4 transition-all duration-300">
                                <div className="p-3 rounded-lg border border-border/60 bg-muted/30 text-sm">
                                  {talentEntry.type === 'DOMAIN'
                                    ? talentEntry.talentName
                                    : 'N/A'}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="experience">
                              <AccordionTrigger className="w-full flex justify-between px-4 py-2 !no-underline focus:ring-0 focus:outline-none">
                                Experience
                              </AccordionTrigger>
                              <AccordionContent className="p-4 transition-all duration-300">
                                <div className="p-3 rounded-lg border border-border/60 bg-muted/30 text-sm">
                                  {talentEntry.experience
                                    ? `${talentEntry.experience} years`
                                    : 'N/A'}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          <div className="px-6 pb-6 pt-2">
                            <div className="flex flex-col sm:flex-row gap-3 justify-center space-between">
                              <Button
                                className={`w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-md hover:shadow-lg ${isInvited ? 'from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700' : ''}`}
                                onClick={() => {
                                  setOpenSheetId(null);
                                  setIsDialogOpen(true);
                                  setSelectedTalent(talent);
                                }}
                              >
                                <span>
                                  {isInvited ? 'Invited' : 'Add to Lobby'}
                                </span>
                                <ChevronRight className="ml-1.5 h-4 w-4" />
                              </Button>
                              <Link
                                href={`/business/freelancerProfile/${talent.freelancer_id}`}
                              >
                                <Button
                                  variant="outline"
                                  className="w-full sm:w-auto"
                                >
                                  View Full Profile
                                  <Expand />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-6 py-4 bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    className={`w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-md hover:shadow-lg ${isInvited ? 'from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenSheetId(null);
                      setIsDialogOpen(true);
                      setSelectedTalent(talent);
                    }}
                  >
                    <span>{isInvited ? 'Invited' : 'Add to Lobby'}</span>
                    <ChevronRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
              {selectedTalent && (
                <AddToLobbyDialog
                  skillDomainData={skillDomainData}
                  currSkills={currSkills}
                  handleAddSkill={handleAddSkill}
                  handleDeleteSkill={handleDeleteSkill}
                  handleAddToLobby={handleAddToLobby}
                  talent={selectedTalent}
                  setTmpSkill={setTmpSkill}
                  open={isDialogOpen}
                  setOpen={(v: boolean) => {
                    setIsDialogOpen(v);
                    if (v) setOpenSheetId(null);
                  }}
                  isLoading={isLoading}
                  setLoading={setIsLoading}
                />
              )}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 dark:group-hover:border-primary/30 rounded-xl pointer-events-none transition-all duration-300"></div>
            </Card>
          );
        })}
        {/* ... (InfiniteScroll and loading skeleton) */}
        <InfiniteScroll
          hasMore={hasMore}
          isLoading={loading}
          next={fetchTalentData}
          threshold={1}
        >
          {loading && (
            <div className="flex flex-wrap justify-center gap-4 w-full mt-4">
              {[...Array(3)].map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="w-full sm:w-[350px] lg:w-[450px]"
                >
                  <div className="animate-pulse space-y-4 p-6 border rounded-lg shadow">
                    <div className="flex items-center space-x-4">
                      <div className="h-14 w-14 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/6"></div>
                    </div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </InfiniteScroll>
      </div>
    </TooltipProvider>
  );
};

export default TalentCard;
