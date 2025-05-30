import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, ListFilter, Info } from 'lucide-react';
import { useSelector } from 'react-redux';

import { toast } from '../../ui/use-toast';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { axiosInstance } from '@/lib/axiosinstance';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ButtonIcon } from '@/components/shared/buttonIcon';
import DomainDialog from '@/components/dialogs/domainDialog';
import { getBadgeColor } from '@/utils/common/getBadgeStatus';
import SkillDialog from '@/components/dialogs/skillDialog';
import SkillDomainMeetingDialog from '@/components/dialogs/skillDomailMeetingDialog';
import { RootState } from '@/lib/store';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Skill {
  talentName: string;
}

interface Domain {
  talentName: string;
}
interface SkillFormData {
  name: string;
  experience: number;
  level: string;
}

interface DomainFormData {
  name: string;
  experience: string;
  level: string;
}

interface SkillData {
  _id?: string;
  name: string;
  experience: number;
  level: string;
  interviewStatus: string;
}

interface DomainData {
  _id?: string;
  name: string;
  experience: string;
  level: string;
  interviewStatus: string;
}

const levels = ['Mastery', 'Proficient', 'Beginner'];
const defaultStatus = 'Pending';

const SkillSchema = z.object({
  skill: z.string().min(1, 'Skill is required'),
  experience: z.preprocess(
    (val) => parseFloat(val as string),
    z
      .number()
      .min(0, 'Experience must be a non-negative number')
      .max(50, "Experience can't exceed 50"),
  ),
  level: z.string().min(1, 'Level is required'),
});

const DomainSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  experience: z.preprocess(
    (val) => parseFloat(val as string),
    z
      .number()
      .min(0, 'Experience must be a non-negative number')
      .max(50, "Experience can't exceed 50"),
  ),
  level: z.string().min(1, 'Level is required'),
});

const InterviewProfile: React.FC<{ freelancerId: string }> = ({
  freelancerId,
}) => {
  const user = useSelector((state: RootState) => state.user);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [skillData, setSkillData] = useState<SkillData[]>([]);
  const [domainData, setDomainData] = useState<DomainData[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const [openSkillDialog, setOpenSkillDialog] = useState(false);
  const [openDomainDialog, setOpenDomainDialog] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editingSkill, setEditingSkill] = useState<SkillData | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editingDomain, setEditingDomain] = useState<DomainData | null>(null);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false); // State for showing dialog
  const [docId, setDocId] = useState<string>();
  const [docType, setDocType] = useState<string>();

  const [filter, setFilter] = React.useState<'All' | 'Skills' | 'Domain'>(
    'All',
  );

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const freelancerSkillsResponse = await axiosInstance.get(
          `/freelancer/${user.uid}/skill`,
        );
        const freelancerDomainsResponse = await axiosInstance.get(
          `/freelancer/${freelancerId}/domain`,
        );

        const skillData = freelancerSkillsResponse.data.data[0].skills;
        const domainData = freelancerDomainsResponse.data.data[0].domain;

        setSkillData(skillData);
        setDomainData(domainData);

        const skillsDomainResponse = await axiosInstance.get(
          `/freelancer/${user.uid}/dehix-talent`,
        );

        const updatedSkills = skillsDomainResponse.data.data.skills.filter(
          (skill: any) =>
            !skillData.some(
              (existingSkill: any) => existingSkill.name === skill.talentName,
            ),
        );
        setSkills(updatedSkills);

        const updatedDomains = skillsDomainResponse.data.data.domains.filter(
          (domain: any) =>
            !domainData.some(
              (existingDomain: any) =>
                existingDomain.name === domain.talentName,
            ),
        );
        setDomains(updatedDomains);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch data. Please try again later.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [freelancerId, user?.uid]);

  const { reset: resetSkill } = useForm<SkillFormData>({
    resolver: zodResolver(SkillSchema),
  });

  const { reset: resetDomain } = useForm<DomainFormData>({
    resolver: zodResolver(DomainSchema),
  });

  const onSubmitSkill = async (data: SkillFormData) => {
    setLoading(true);

    try {
      const skillToSubmit = {
        name: data.name,
        level: data.level,
        experience: data.experience,
        interviewPermission: 'NOT_VERIFIED', // Ensure interviewStatus is set
      };

      const payload = {
        skills: [skillToSubmit], // Wrap in an array
      };

      if (editingSkill) {
        // Update existing skill using API
        const updatedSkill = {
          ...editingSkill,
          ...data,
          interviewStatus: defaultStatus,
        };

        const response = await axiosInstance.put(`/freelancer/skill`, payload);

        if (response.status === 200) {
          // After a successful response (status 200), update local state
          const updatedSkills = skillData.map((item) =>
            item._id === editingSkill._id ? { ...item, ...updatedSkill } : item,
          );
          setSkillData(updatedSkills);

          toast({
            title: 'Skill Updated',
            description: `${data.name} skill updated successfully.`,
          });
        } else {
          // Handle non-200 responses (optional)
          throw new Error('Failed to update skill');
        }
      } else {
        // Add new skill
        const response = await axiosInstance.put(`/freelancer/skill`, payload);

        if (response.status === 200) {
          // After a successful response (status 200), update local state

          setSkillData([
            ...skillData,
            {
              name: data.name,
              experience: data.experience,
              level: data.level,
              interviewStatus: defaultStatus,
            },
          ]);

          toast({
            title: 'Skill Added',
            description: `${data.name} skill added successfully.`,
          });
        } else {
          // Handle non-200 responses (optional)
          throw new Error('Failed to add skill');
        }

        setSkillData([
          ...skillData,
          {
            name: data.name,
            experience: data.experience,
            level: data.level,
            interviewStatus: defaultStatus,
          },
        ]);
        toast({
          title: 'Skill Added',
          description: `${data.name} skill added successfully.`,
        });
      }
      resetSkill();
      setOpenSkillDialog(false);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitDomain = async (data: DomainFormData) => {
    setLoading(true);
    try {
      if (editingDomain) {
        // Update existing domain using API
        const updatedDomain = {
          ...editingDomain,
          ...data,
        };

        const response = await axiosInstance.put(
          `/freelancer/domain`,
          updatedDomain,
        );

        if (response.status === 200) {
          // After a successful response (status 200), update local state
          const updatedDomains = domainData.map((item) =>
            item._id === editingDomain._id
              ? { ...item, ...updatedDomain }
              : item,
          );
          setDomainData(updatedDomains);

          toast({
            title: 'Domain Updated',
            description: `${data.name} domain updated successfully.`,
          });
        } else {
          // Handle non-200 responses (optional)
          throw new Error('Failed to update domain');
        }
      } else {
        // Add new domain
        setDomainData([
          ...domainData,
          {
            name: data.name,
            experience: data.experience,
            level: data.level,
            interviewStatus: defaultStatus,
          },
        ]);
        toast({
          title: 'Domain Added',
          description: `${data.name} domain added successfully.`,
        });
      }
      resetDomain();
      setOpenDomainDialog(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillDomainDialog = (data: any, type: string) => {
    console.log('Opening dialog for', type, 'with ID:', data?._id);
    setShowMeetingDialog(true);
    setDocId(data?._id);
    setDocType(type);
  };

  const filteredData = () => {
    if (filter === 'All') {
      return [...skillData, ...domainData];
    } else if (filter === 'Skills') {
      return skillData;
    } else if (filter === 'Domain') {
      return domainData;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8 ml-5">
        <h1 className="text-3xl font-bold">Interview Profile</h1>
        <p className="text-gray-400 mt-2">
          Manage and track your skills and domains. Add new skills or domains
          and provide your experience levels.
        </p>
      </div>
      <div className="flex flex-col gap-4 p-2 sm:px-6 sm:py-0 md:gap-8  pt-2 pl-4 sm:pt-4 sm:pl-6 md:pt-6 md:pl-8 min-h-screen relative">
        <div className="w-1/5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 w-auto text-sm"
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
        </div>

        <div className="w-full relative border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs md:text-xl font-semibold w-1/2">
              Skills & Domains
            </h2>
            <div className="flex justify-end items-center  w-1/2">
              <Button
                onClick={() => setOpenSkillDialog(true)}
                className="mr-2 md:px-4 md:py-2 py-1 px-1.5 text-xs md:text-sm"
              >
                <Plus className=" mr-1 md:mr-2 h-4 w-4" />{' '}
                <span className="hidden  md:block mr-1">Add</span> Skill
              </Button>
              <Button
                onClick={() => setOpenDomainDialog(true)}
                className="mr-2 md:px-4 md:py-2 py-1 px-1.5 text-xs md:text-sm"
              >
                <Plus className=" mr-1 md:mr-2 h-4 w-4" />{' '}
                <span className="hidden md:block mr-1">Add</span> Domain
              </Button>
            </div>
            <SkillDialog
              open={openSkillDialog}
              onClose={() => setOpenSkillDialog(false)}
              onSubmit={onSubmitSkill}
              skillOptions={skills}
              levels={levels}
              defaultValues={editingSkill || undefined}
              loading={loading}
            />
            <DomainDialog
              open={openDomainDialog}
              onClose={() => setOpenDomainDialog(false)}
              onSubmit={onSubmitDomain}
              domainOptions={domains}
              levels={levels}
              defaultValues={editingDomain || undefined}
              loading={loading}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-[#09090B]">
                <TableHead className="">Item</TableHead>
                <TableHead className="">Level</TableHead>
                <TableHead className="">Experience</TableHead>
                <TableHead className="">Status</TableHead>
                <TableHead className="">
                  <div className="flex gap-2 items-center">
                    Actions
                    <Popover>
                      <PopoverTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground  cursor-pointer" />
                      </PopoverTrigger>
                      <PopoverContent className="text-sm w-fit  border rounded p-2 shadow">
                        This will be available in the next phase.
                      </PopoverContent>
                    </Popover>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? [...Array(4)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell className="">
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell className="">
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell className="">
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell className="">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell className="">
                        <Skeleton className="w-8 h-8 p-2 rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))
                : filteredData()!.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="">{item.name}</TableCell>
                      <TableCell className="">{item.level}</TableCell>
                      <TableCell className="">
                        {typeof item.experience === 'number' &&
                        item.experience > 0
                          ? item.experience + ' years'
                          : ''}
                      </TableCell>
                      <TableCell className="">
                        <Badge className={getBadgeColor(item.interviewStatus)}>
                          {item?.interviewStatus?.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <ButtonIcon
                          icon={
                            <Edit2 className="w-4 h-4 text-gray-400 cursor-not-allowed" />
                          }
                          disabled
                          onClick={() =>
                            handleSkillDomainDialog(
                              item,
                              item.experience ? 'SKILL' : 'DOMAIN',
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <SkillDomainMeetingDialog
        isOpen={showMeetingDialog}
        onClose={() => setShowMeetingDialog(false)}
        doc_id={docId || ''}
        doc_type={docType || ''}
      />
    </div>
  );
};

export default InterviewProfile;
