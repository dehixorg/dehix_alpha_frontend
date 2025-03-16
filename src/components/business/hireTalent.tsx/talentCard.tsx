'use client';

import type React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Loader2, Plus, X, SendIcon, Expand } from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { Github, Linkedin } from 'lucide-react'; // Import icons

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { axiosInstance } from '@/lib/axiosinstance';
import InfiniteScroll from '@/components/ui/infinite-scroll';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import {
  Dehix_Talent_Card_Pagination,
  type HireDehixTalentStatusEnum,
} from '@/utils/enum';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  skillName?: string;
  domainName?: string;
  experience: string;
  monthlyPay: string;
  status: HireDehixTalentStatusEnum;
  activeStatus: boolean;
}

interface Talent {
  freelancer_id: string;
  Name: string;
  userName: string;
  profilePic: string;
  dehixTalent: DehixTalent;
  Github: any;
  LinkedIn: any;
  education?: Record<string, Education>;
  projects?: Record<string, Projects>;
}
interface Skill {
  _id: string;
  label: string;
}

interface Domain {
  _id: string;
  label: string;
}

interface TalentCardProps {
  skillFilter: string | null;
  domainFilter: string | null;
  skillDomainFormProps: any;
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
  skillDomainFormProps,
}) => {
  const [filteredTalents, setFilteredTalents] = useState<Talent[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const skipRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isRequestInProgress = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [skills, setSkills] = useState<Skill[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [domains, setDomains] = useState<Domain[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const user = useSelector((state: RootState) => state.user);
  const [skillDomainData, setSkillDomainData] = useState<SkillDomainData[]>([]);
  const [statusVisibility, setStatusVisibility] = useState<boolean[]>([]);
  const [invitedTalents, setInvitedTalents] = useState<Set<string>>(new Set());
  const [selectedTalent, setSelectedTalent] = useState<any>();
  const [currSkills, setCurrSkills] = useState<any>([]);
  const [tmpSkill, setTmpSkill] = useState<any>('');
  const [isDialogOpen, setIsDialogOpen] = useState<any>(false);
  const [isLoading, setIsLoading] = useState<any>(false);

  const handleAddSkill = () => {
    console.log(tmpSkill);
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
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load skills and domains. Please try again.',
        });
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
        // Send the filtered skills and domains back to the parent
        skillDomainFormProps?.skillFilter(fetchedFilterSkills);
        skillDomainFormProps?.domainFilter(fetchedFilterDomains);

        // Convert the talent object into an array
        const formattedHireTalentData = Object.values(hireTalentData).map(
          (item: any) => ({
            uid: item._id,
            label: item.skillName || item.domainName || 'N/A',
            experience: item.experience || 'N/A',
            description: item.description || 'N/A',
            status: item.status,
            visible: item.visible,
            talentId: item.skillId || item.domainId
          }),
        );
        console.log(formattedHireTalentData);

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
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong. Please try again.',
        });
      }
    }
  }, [user?.uid, skillDomainFormProps]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleDeleteSkill = (skillToDelete: string) => {
    setCurrSkills(
      currSkills.filter((skill: any) => skill.name !== skillToDelete),
    );
  };

  const fetchTalentData = useCallback(
    async (newSkip = skipRef.current, reset = false) => {
      if (isRequestInProgress.current) return;

      try {
        isRequestInProgress.current = true;
        setLoading(true);

        const response = await axiosInstance.get('freelancer/dehixtalent', {
          params: {
            limit: Dehix_Talent_Card_Pagination.BATCH,
            skip: newSkip,
          },
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
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Something went wrong. Please try again.',
          });
        }
      } finally {
        setLoading(false);
        isRequestInProgress.current = false;
      }
    },
    [],
  );

  // Function to reset state when filters change
  const resetAndFetchData = useCallback(() => {
    setTalents([]);
    skipRef.current = 0;
    setHasMore(true);
    fetchTalentData(0, true); // Pass 0 as the skip value to start from the beginning
  }, [fetchTalentData]);

  // Reload cards when filter changes
  useEffect(() => {
    resetAndFetchData();
  }, [resetAndFetchData]);

  // Apply the filters to the talents
  useEffect(() => {
    const filtered = talents.filter((talent) => {
      if (skillFilter == 'all' && domainFilter == 'all') {
        return true;
      } else if (
        skillFilter == 'all' &&
        domainFilter == talent.dehixTalent.domainName
      ) {
        return true;
      } else if (
        skillFilter == talent.dehixTalent.skillName &&
        domainFilter == 'all'
      ) {
        return true;
      } else if (
        skillFilter == talent.dehixTalent.skillName ||
        domainFilter == talent.dehixTalent.domainName
      ) {
        return true;
      } else {
        return false;
      }
    });
    setFilteredTalents(filtered);
  }, [skillFilter, domainFilter, talents]);


  const handleAddToLobby = async (freelancerId: string) => {
    const matchedTalentIds: string[] = [];
    const matchedTalentUids: string[] = [];

    currSkills.forEach((skill: any) => {
      const matched: any = skillDomainData.find((item: any) => item.label === skill.name);
      if (matched?.talentId && matched?.uid) {
        matchedTalentIds.push(matched.talentId);
        matchedTalentUids.push(matched.uid);
      }
    });

    if (matchedTalentIds.length === 0 || matchedTalentUids.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Skills Selected',
        description: 'Please add some skills before adding to lobby.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await axiosInstance.put(
        `business/hire-dehixtalent/add_into_lobby`,
        {
          freelancerId,
          dehixTalentId: matchedTalentIds,
          hireDehixTalent_id: matchedTalentUids,
        }
      );

      if (response.status === 200) {
        toast({
          title: 'Success',
          description: 'Freelancer added to lobby',
        });
        setCurrSkills([]);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-wrap mt-4 justify-center gap-4">
      {filteredTalents.map((talent) => {
        const talentEntry = talent.dehixTalent;
        const education = talent.education;
        const projects = talent.projects;
        const label = talentEntry.skillName ? 'Skill' : 'Domain';
        const value = talentEntry.skillName || talentEntry.domainName || 'N/A';
        const isInvited = invitedTalents.has(talentEntry._id);
        console.log(talent.freelancer_id);

        return (
          <Card
            key={talentEntry._id}
            className="w-full sm:w-[350px] lg:w-[450px]"
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={talent.profilePic || '/default-avatar.png'} />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <CardTitle>{talent.Name || 'Unknown'}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {talent.userName}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{label}</span>
                    <Badge>{value}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Experience</span>
                    <Badge>{talentEntry.experience} years</Badge>
                  </div>
                </div>
                <div className="flex justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Monthly Pay</span>
                    <Badge>${talentEntry.monthlyPay}</Badge>
                  </div>
                  {isInvited && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">Status</span>
                      <Badge variant="default">Invited</Badge>
                    </div>
                  )}
                </div>

                <div className="py-4">
                  {SHEET_SIDES.map((View) => (
                    <Sheet key={View}>
                      <SheetTrigger asChild>
                        <Button className="w-full text-sm  rounded-md">
                          View
                        </Button>
                      </SheetTrigger>
                      <SheetContent
                        side={View}
                        className="overflow-y-auto no-scrollbar max-h-[100vh]"
                      >
                        <SheetHeader>
                          <SheetTitle className="flex items-center justify-between text-lg font-bold py-4">
                            <span className="text-center flex-1">
                              View Talent Details
                            </span>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  href={`/business/freelancerProfile/${talent.freelancer_id}`}
                                  passHref
                                >
                                  <Expand className="w-6 h-6 cursor-pointer text-gray-600 " />
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent side="top">Expand</TooltipContent>
                            </Tooltip>
                          </SheetTitle>
                          {/* <SheetDescription className="py-2">
                            Some description about the Talents
                          </SheetDescription> */}
                        </SheetHeader>

                        <div className="grid gap-4 py-2">
                          <div className="w-full text-center">
                            <div className="items-center">
                              <Avatar className="h-20 w-20 mx-auto mb-4 rounded-full border-4 border-white hover:border-white transition-all duration-300">
                                <AvatarImage
                                  src={
                                    talent.profilePic || '/default-avatar.png'
                                  }
                                />
                                <AvatarFallback>Unable to load</AvatarFallback>
                              </Avatar>
                              <div className="text-lg font-bold">
                                {' '}
                                {talent.Name}
                              </div>
                              <div className="flex items-center justify-center gap-4 mt-4">
                                {/* GitHub */}
                                <a
                                  href={talent.Github || '#'}
                                  target={talent.Github ? '_blank' : '_self'}
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 transition-all ${talent.Github
                                    ? 'text-blue-500 hover:text-blue-700'
                                    : 'text-gray-500 cursor-default'
                                    }`}
                                >
                                  <Github
                                    className={`w-5 h-5 ${talent.Github ? 'text-blue-500' : 'text-gray-500'}`}
                                  />
                                </a>

                                {/* LinkedIn */}
                                <a
                                  href={talent.LinkedIn || '#'}
                                  target={talent.LinkedIn ? '_blank' : '_self'}
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 transition-all ${talent.LinkedIn
                                    ? 'text-blue-500 hover:text-blue-700'
                                    : 'text-gray-500 cursor-default'
                                    }`}
                                >
                                  <Linkedin
                                    className={`w-5 h-5 ${talent.LinkedIn ? 'text-blue-500' : 'text-gray-500'}`}
                                  />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>

                        <table className="min-w-full table-auto border-collapse ">
                          <tbody>
                            <tr>
                              <td className="border-b px-4 py-2 font-medium">
                                Username
                              </td>
                              <td className="border-b px-4 py-2">
                                {talent.userName || 'N/A'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <Accordion type="multiple" className="w-full">
                          {/* Education Accordion */}
                          <AccordionItem value="education">
                            <AccordionTrigger className="w-full flex justify-between px-4 py-2 !no-underline focus:ring-0 focus:outline-none">
                              Education
                            </AccordionTrigger>
                            <AccordionContent className="p-4 transition-all duration-300">
                              {education && Object.values(education).length > 0
                                ? Object.values(education).map((edu: any) => (
                                  <div
                                    key={edu._id}
                                    className="mb-2 p-2 border border-gray-300 rounded-lg"
                                  >
                                    <p className="text-sm font-semibold">
                                      {edu.degree}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {edu.universityName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {edu.fieldOfStudy}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(
                                        edu.startDate,
                                      ).toLocaleDateString()}{' '}
                                      -{' '}
                                      {new Date(
                                        edu.endDate,
                                      ).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-gray-700">
                                      Grade: {edu.grade}
                                    </p>
                                  </div>
                                ))
                                : 'No education details available.'}
                            </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="projects">
                            <AccordionTrigger className="w-full flex justify-between px-4 py-2 !no-underline focus:ring-0 focus:outline-none">
                              Projects
                            </AccordionTrigger>
                            <AccordionContent className="p-4 transition-all duration-300">
                              {projects &&
                                Object.values(projects).length > 0 ? (
                                Object.values(projects).map((project: any) => (
                                  <div
                                    key={project._id}
                                    className="mb-2 p-2 border border-gray-300 rounded-lg"
                                  >
                                    <p className="text-sm font-semibold">
                                      {project.projectName}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      Role: {project.role}
                                    </p>
                                    <p className="text-xs text-gray-500">
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
                                        className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
                                      >
                                        <Github className="w-4 h-4" />
                                        View on GitHub
                                      </a>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-gray-500">
                                  No projects available.
                                </p>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                          {/* Skills Accordion */}
                          <AccordionItem value="skills">
                            <AccordionTrigger className="w-full flex justify-between px-4 py-2 !no-underline focus:ring-0 focus:outline-none">
                              Skills
                            </AccordionTrigger>
                            <AccordionContent className="p-4 transition-all duration-300">
                              {talentEntry.skillName
                                ? talentEntry.skillName
                                : 'N/A'}
                            </AccordionContent>
                          </AccordionItem>

                          {/* Domain Accordion */}
                          <AccordionItem value="domain">
                            <AccordionTrigger className="w-full flex justify-between px-4 py-2 !no-underline focus:ring-0 focus:outline-none">
                              Domain
                            </AccordionTrigger>
                            <AccordionContent className="p-4 transition-all duration-300">
                              {talentEntry.domainName
                                ? talentEntry.domainName
                                : 'N/A'}
                            </AccordionContent>
                          </AccordionItem>

                          {/* Experience Accordion */}
                          <AccordionItem value="experience">
                            <AccordionTrigger className="w-full flex justify-between px-4 py-2 !no-underline focus:ring-0 focus:outline-none">
                              Experience
                            </AccordionTrigger>
                            <AccordionContent className="p-4 transition-all duration-300">
                              {talentEntry.experience
                                ? `${talentEntry.experience} years`
                                : 'N/A'}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                        <Button
                          onClick={() => {
                            setIsDialogOpen(true)
                            setSelectedTalent(talent);
                          }}
                          className={`w-full mt-4 ${isInvited
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-primary hover:bg-primary/90'
                            }`}
                        >
                          <SendIcon className="mr-2 h-4 w-4" />
                          Add to Lobby
                        </Button>
                      </SheetContent>
                    </Sheet>
                  ))}
                </div>
                <Button
                  onClick={() => {
                    setIsDialogOpen(true)
                    setSelectedTalent(talent)
                  }}
                  className={`w-full ${isInvited
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-primary hover:bg-primary/90'
                    }`}
                >
                  <SendIcon className="mr-2 h-4 w-4" />
                  Add to Lobby
                </Button>
              </div>
            </CardContent>
            {selectedTalent && (
              <AddToLobbyDialog
                skillDomainData={skillDomainData}
                currSkills={currSkills}
                handleAddSkill={handleAddSkill}
                handleDeleteSkill={handleDeleteSkill}
                handleAddToLobby={handleAddToLobby}
                talent={selectedTalent}
                tmpSkill={tmpSkill}
                setTmpSkill={setTmpSkill}
                open={isDialogOpen}
                setOpen={setIsDialogOpen}
                isLoading={isLoading}
              />)}
          </Card>
        );
      })}
      <InfiniteScroll
        hasMore={hasMore}
        isLoading={loading}
        next={fetchTalentData}
        threshold={1}
      >
        {loading && <Loader2 className="my-4 h-8 w-8 animate-spin" />}
      </InfiniteScroll>
    </div>
  );
};

export default TalentCard;
