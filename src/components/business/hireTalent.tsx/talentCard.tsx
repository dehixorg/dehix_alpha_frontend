'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Loader2, LoaderCircle, MessageCircle, MessageSquare, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import {CardsChat} from '@/components/shared/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { axiosInstance } from '@/lib/axiosinstance';
import InfiniteScroll from '@/components/ui/infinite-scroll';
import { toast } from '@/components/ui/use-toast';
import { ChatList } from '@/components/shared/chatList';
import { Separator } from '@/components/ui/separator';
import {
  Dehix_Talent_Card_Pagination,
  HireDehixTalentStatusEnum,
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
import { RootState } from '@/lib/store';
import { DocumentData } from 'firebase/firestore';
import { subscribeToUserConversations } from '@/utils/common/firestoreUtils';

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
interface Conversation extends DocumentData {
  id: string;
  participants: string[];
  timestamp?: string;
  lastMessage?: any;
}

const dummyConversations: Conversation[] = [
  {
    id: 'dummy1',
    participants: ['User A', 'User B'],
    timestamp: '2025-02-09T12:00:00Z',
    lastMessage: { text: 'Hello! This is a test conversation.' },
  },
];
interface Talent {
  freelancer_id: string;
  Name: string;
  userName: string;
  profilePic: string;
  dehixTalent: DehixTalent;
  Github: any;
  LinkedIn: any;
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
interface SkillDomainFormProps {
  skillFilter: (skills: Skill[]) => void;
  domainFilter: (domains: Domain[]) => void;
}

const SHEET_SIDES = ['left'] as const;

type SheetSide = (typeof SHEET_SIDES)[number];

const TalentCard: React.FC<TalentCardProps> = ({
  skillFilter,
  domainFilter,
  skillDomainFormProps,
}) => {
  const [filteredTalents, setFilteredTalents] = useState<Talent[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isRequestInProgress = useRef(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const user = useSelector((state: RootState) => state.user);
  const [skillDomainData, setSkillDomainData] = useState<SkillDomainData[]>([]);
  const [statusVisibility, setStatusVisibility] = useState<boolean[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
 const [activeConversation, setActiveConversation] = useState<Conversation>(
    conversations[0],
  );
  const [chatOpen, setChatOpen] = useState(false);
  const [currSkills, setCurrSkills] = useState<any>([]);
  const [tmpSkill, setTmpSkill] = useState<any>('');

  useEffect(() => {
      let unsubscribe: (() => void) | undefined;
  
      const fetchConversations = async () => {
        setLoading(true);
        unsubscribe = await subscribeToUserConversations(
          'conversations',
          user.uid,
          (data) => {
            setConversations(data as Conversation[]);
            setLoading(false);
          },
        );
      };
  
      fetchConversations();
  
      // Cleanup on component unmount
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }, [ user.uid]);

    useEffect(() => {
      if (!activeConversation && conversations.length > 0) {
        setActiveConversation(conversations[0]);
      }
    }, [conversations, activeConversation]);
    
    

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
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong. Please try again.',
        });
      }
    }
  }, [
    user?.uid,
    skillDomainFormProps?.skillFilter,
    skillDomainFormProps?.domainFilter,
  ]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleDeleteSkill = (skillToDelete: string) => {
    setCurrSkills(
      currSkills.filter((skill: any) => skill.name !== skillToDelete),
    );
  };

  // Function to reset state when filters change
  const resetAndFetchData = useCallback(() => {
    setTalents([]);
    setSkip(0);
    setHasMore(true);
    fetchTalentData(0, true); // Pass 0 as the skip value to start from the beginning
  }, [skillFilter, domainFilter]);

  const fetchTalentData = useCallback(
    async (newSkip = skip, reset = false) => {
      if (isRequestInProgress.current || loading || !hasMore) return;

      try {
        isRequestInProgress.current = true;
        setLoading(true);

        const response = await axiosInstance.get(
          `freelancer/dehixtalent?limit=${Dehix_Talent_Card_Pagination.BATCH}&skip=${newSkip}`,
        );

        if (response.data.data.length < Dehix_Talent_Card_Pagination.BATCH) {
          setHasMore(false);
          setTalents((prev) =>
            reset ? response.data.data : [...prev, ...response.data.data],
          );
          return;
        }

        if (response?.data?.data) {
          setTalents((prev) =>
            reset ? response.data.data : [...prev, ...response.data.data],
          );
          setSkip(newSkip + Dehix_Talent_Card_Pagination.BATCH);
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
    [skip, loading, hasMore],
  );

  // Reload cards when filter changes
  useEffect(() => {
    resetAndFetchData();
  }, [skillFilter, domainFilter, resetAndFetchData]);

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

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {filteredTalents.map((talent) => {
        const talentEntry = talent.dehixTalent;
        const label = talentEntry.skillName ? 'Skill' : 'Domain';
        const value = talentEntry.skillName || talentEntry.domainName || 'N/A';

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
                </div>

                <div className="py-4">
                  {SHEET_SIDES.map((View) => (
                    <Sheet key={View}>
                      <SheetTrigger asChild>
                        <Button className="w-full text-sm  text-black rounded-md">
                          View
                        </Button>
                      </SheetTrigger>
                      <SheetContent
                        side={View}
                        className="overflow-y-auto no-scrollbar max-h-[100vh]"
                      >
                        <SheetHeader>
                          <SheetTitle className="text-center text-lg font-bold py-4">
                            View Talent Details
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
                              <Button className="w-full text-sm text-black rounded-md" onClick={() => setChatOpen(true)}>
  <MessageCircle className="w-6 h-6 text-gray-600" />
</Button>
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
                            <tr>
                              <td className="border-b px-4 py-2 font-medium">
                                Skill
                              </td>
                              <td className="border-b px-4 py-2">
                                {talentEntry.skillName || 'N/A'}
                              </td>
                            </tr>
                            <tr>
                              <td className="border-b px-4 py-2 font-medium">
                                Domain
                              </td>
                              <td className="border-b px-4 py-2">
                                {talentEntry.domainName || 'N/A'}
                              </td>
                            </tr>
                            <tr>
                              <td className="border-b px-4 py-2 font-medium">
                                Experience
                              </td>
                              <td className="border-b px-4 py-2">
                                {talentEntry.experience} years
                              </td>
                            </tr>
                            <tr>
                              <td className="border-b px-4 py-2 font-medium">
                                Monthly Pay
                              </td>
                              <td className="border-b px-4 py-2">
                                ${talentEntry.monthlyPay}
                              </td>
                            </tr>
                            <tr>
                              <td className="border-b px-4 py-2 font-medium">
                                Github
                              </td>
                              <td className="border-b px-4 py-2">
                                {talent.Github || 'N/A'}
                              </td>
                            </tr>
                            <tr>
                              <td className="border-b px-4 py-2 font-medium">
                                LinkedIn
                              </td>
                              <td className="border-b px-4 py-2">
                                {talent.LinkedIn || 'N/A'}
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <div>
                          <div className="w-full text-center mt-2">
                            <Link
                              href={`/business/freelancerProfile/${talent.freelancer_id}`}
                              passHref
                            >
                              <Button className="w-full text-sm py-1 px-2  text-black rounded-md">
                                Expand
                              </Button>
                            </Link>
                          </div>
                        </div>

                        <Separator />
                        <div className="w-full mt-4 mb-6">
                          <div className="w-full">
                            <div className="flex items-center mt-2">
                              <Select
                                onValueChange={(value) => setTmpSkill(value)}
                                value={tmpSkill || ''}
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      tmpSkill ? tmpSkill : 'Select skill'
                                    }
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {skillDomainData
                                    .filter(
                                      (skill: any) =>
                                        !currSkills.some(
                                          (s: any) => s.name === skill.label,
                                        ),
                                    )
                                    .map((skill: any, index: number) => (
                                      <SelectItem
                                        key={index}
                                        value={skill.label}
                                      >
                                        {skill.label}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                type="button"
                                size="icon"
                                className="ml-2"
                                onClick={() => {
                                  handleAddSkill();
                                  setTmpSkill('');
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-5">
                              {currSkills.map((skill: any, index: number) => (
                                <Badge
                                  className="uppercase text-xs font-normal bg-gray-300 flex items-center px-2 py-1"
                                  key={index}
                                >
                                  {skill.name}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteSkill(skill.name)
                                    }
                                    className="ml-2 text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="mt-2">
                            <div className="w-full text-center">
                              <Button
                                className="w-full text-sm py-1 px-2  text-black rounded-md"
                                type="submit"
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2">
                          <div className="mt-2">
                          {/* <div
        className="flex w-full cursor-pointer justify-center p-2 border rounded-lg hover:bg-gray-100"
        onClick={() => setShowChat((prev) => !prev)}
      >
        <MessageCircle className="w-6 h-6 text-gray-600" />
      </div>
      
      {showChat && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white shadow-lg rounded-lg">
          {loading ? (
            <div className="flex justify-center p-4">
              <LoaderCircle className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : conversations.length > 0 ? (
            <>
              <ChatList
                conversations={conversations}
                active={activeConversation || undefined}
                setConversation={setActiveConversation}
              />
              {activeConversation && <CardsChat conversation={activeConversation} />}
            </>
          ) : (
            <div className="p-4 text-center text-gray-500">No conversations found</div>
          )}
        </div>
      )} */}
<Sheet open={chatOpen} onOpenChange={setChatOpen}>
  <SheetContent
    side="right"
    className="overflow-y-auto no-scrollbar max-h-[100vh]"
  >
    <SheetHeader>
      <SheetTitle className="text-center text-lg font-bold py-4">
        Chat
      </SheetTitle>
    </SheetHeader>

    <div className="grid gap-4 py-2">
      <div className="w-full text-center">
        <Avatar className="h-20 w-20 mx-auto mb-4 rounded-full border-4 border-white hover:border-white transition-all duration-300">
          <AvatarImage src={talent.profilePic || '/default-avatar.png'} />
          <AvatarFallback>Unable to load</AvatarFallback>
        </Avatar>
        <div className="text-lg font-bold">{talent.Name}</div>
      </div>
    </div>

    {/* Chat List */}
    {loading ? (
      <div className="flex justify-center p-4">
        <LoaderCircle className="w-6 h-6 animate-spin text-primary" />
      </div>
    ) : conversations.length > 0 ? (
      <>
        <ChatList
          conversations={conversations}
          active={activeConversation || undefined}
          setConversation={setActiveConversation}
        />
        {activeConversation && <CardsChat conversation={activeConversation} />}
      </>
    ) : (
      <div className="p-4 text-center text-gray-500">No conversations found </div>
    )}
  </SheetContent>
</Sheet>


</div>


                          </div>
              
                        </div>
                      </SheetContent>
                    </Sheet>
                  ))}
                </div>
              </div>
            </CardContent>
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
