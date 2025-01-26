import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { axiosInstance } from '@/lib/axiosinstance';
import InfiniteScroll from '@/components/ui/infinite-scroll';
import { toast } from '@/components/ui/use-toast';
import {
  Dehix_Talent_Card_Pagination,
  HireDehixTalentStatusEnum,
} from '@/utils/enum';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';

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

interface Projects {
  projects?: {
    [key: string]: {
      _id: string;
      projectName: string;
      role: string;
    };
  };
}

interface Talent {
  freelancer_id: string;
  Name: string;
  userName: string;
  profilePic: string;
  dehixTalent: DehixTalent;
}

interface TalentCardProps {
  skillFilter: string | null;
  domainFilter: string | null;
}

const TalentCard: React.FC<TalentCardProps> = ({
  skillFilter,
  domainFilter,
}) => {
  const [filteredTalents, setFilteredTalents] = useState<Talent[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isRequestInProgress = useRef(false);
  const [projects, setProjects] = useState<Projects['projects'] | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const resetAndFetchData = useCallback(() => {
    setTalents([]);
    setSkip(0);
    setHasMore(true);
    fetchTalentData(0, true);
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
          setHasMore(false);
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

  useEffect(() => {
    resetAndFetchData();
  }, [skillFilter, domainFilter, resetAndFetchData]);

  const fetchProjects = useCallback(async (freelancerId: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/freelancer/${freelancerId}/profile-info`,
      );
      console.log('Fetched projects:', response.data);
      setProjects(response.data.projects || []);
      setOpenDialog(true);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch projects. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInviteClick = (freelancerId: string) => {
    fetchProjects(freelancerId);
  };

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
                <AvatarFallback>NA</AvatarFallback>
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
                <div className="flex gap-3 mt-3 mb-3">
                  <Button className="flex-1">Hire</Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleInviteClick(talent.freelancer_id)}
                  >
                    Invite
                  </Button>
                </div>
                <div>
                  <Link
                    href={`/business/freelancerProfile/${talent.freelancer_id}`}
                    passHref
                  >
                    <Button className="w-full">View</Button>
                  </Link>
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
        {hasMore && <Loader2 className="my-4 h-8 w-8 animate-spin" />}
      </InfiniteScroll>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Projects</DialogTitle>
          </DialogHeader>
          <div>
            {projects && Object.values(projects).length > 0 ? (
              Object.values(projects).map((project) => (
                <div
                  key={project._id}
                  className="flex items-center justify-between mb-2"
                >
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="selectedProject"
                      value={project._id}
                      checked={selectedProject === project._id}
                      onChange={() => setSelectedProject(project._id)}
                      className="radio"
                    />
                    <span>{project.projectName}</span>
                  </label>
                  <span className="text-muted">{project.role}</span>
                </div>
              ))
            ) : (
              <p>No projects available.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
            <Button
              onClick={() => {
                if (selectedProject) {
                  console.log('Invitation sent for project:', selectedProject);
                  setOpenDialog(false);
                } else {
                  toast({
                    variant: 'destructive',
                    title: 'Error',
                    description:
                      'Please select a project before sending the invitation.',
                  });
                }
              }}
            >
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TalentCard;
