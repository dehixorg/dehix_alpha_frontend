'use client';
import React, { useEffect, useRef, useState } from 'react';
// import { z } from 'zod';
// import { useForm } from 'react-hook-form';
import { ListFilter, Search, Table } from 'lucide-react';
// import { zodResolver } from '@hookform/resolvers/zod';
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
import Header from '@/components/header/header';
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardFooter,
// } from '@/components/ui/card';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/interviewMenuItems';
// import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DehixInterviews from '@/components/freelancer/dehix-talent-interview/DehixInterviews';
// import DropdownProfile from '@/components/shared/DropdownProfile';
import { Input } from '@/components/ui/input';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
import SkeletonLoader from '@/components/shared/SkeletonLoader';
import Projects from '@/components/freelancer/projectInterview/ProjectInterviews';
import { toast } from '@/components/ui/use-toast';

// interface Interview {
//   reference: string;
//   skill?: string;
//   domain?: string;
//   interviewDate: string;
//   rating: number;
//   comments: string;
//   status: 'Pending' | 'Complete';
//   description: string;
//   contact: string;
// }

// const CommentSchema = z.object({
//   comment: z.string().min(1, 'Comment is required'),
// });

// interface CommentFormData {
//   comment: string;
// }

// interface InterviewCardProps {
//   index: number;
//   interview: Interview;
//   handleCommentSubmit: (index: number, comment: string) => void;
// }

// const InterviewCard: React.FC<InterviewCardProps> = ({
//   index,
//   interview,
//   handleCommentSubmit,
// }) => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//   } = useForm<CommentFormData>({
//     resolver: zodResolver(CommentSchema),
//   });

//   const onSubmit = (data: CommentFormData) => {
//     handleCommentSubmit(index, data.comment);
//     reset();
//   };

//   return (
//     <Card className="max-w-full mx-auto md:max-w-lg">
//       <CardHeader>
//         <CardTitle className="flex text-2xl">{interview.reference}</CardTitle>
//         <CardDescription className="block mt-1 uppercase tracking-wide leading-tight font-medium text-gray-700 text-sm">
//           {interview.skill || interview.domain}
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <Badge
//           className={`bg-${interview.status === 'Pending' ? 'warning' : 'success'} hover:bg-${
//             interview.status === 'Pending' ? 'warning' : 'success'
//           } text-xs`}
//         >
//           {interview.status.toUpperCase()}
//         </Badge>
//         <p className="text-gray-300 pt-4 text-sm">{interview.description}</p>
//         {interview.status === 'Pending' && (
//           <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
//             <Input
//               type="text"
//               placeholder="Enter comment..."
//               className="p-2 border rounded"
//               {...register('comment')}
//             />
//             {errors.comment && (
//               <p className="text-red-500 text-xs mt-1">
//                 {errors.comment.message}
//               </p>
//             )}
//             <Button type="submit" className="mt-2">
//               Submit Comment
//             </Button>
//           </form>
//         )}
//         {interview.status === 'Complete' && (
//           <p className="mt-4 flex text-gray-500 border p-3 rounded text-sm">
//             <MessageSquare className="pr-1 mr-1 h-5 w-5" />
//             {interview.comments}
//           </p>
//         )}
//         <div className="mt-4">
//           <p className="text-sm text-gray-600">
//             Reference: {interview.reference}
//           </p>
//           <p className="text-sm text-gray-600">Contact: {interview.contact}</p>
//         </div>
//       </CardContent>
//       <CardFooter className="flex">
//         <p className="text-sm font-semibold text-black bg-white px-3 py-1 rounded">
//           {new Date(interview.interviewDate).toLocaleDateString()}
//         </p>
//       </CardFooter>
//     </Card>
//   );
// };

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
  const [isTableView, setIsTableView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const user = useSelector((state: RootState) => state.user);
  const [skillData, setSkillData] = useState([]);
  const [domainData, setDomainData] = useState([]);
  const [projectData, setProjectData] = useState([]);
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
              intervieweeId: user?.uid,
            },
          },
        );
        let interviewData = response.data?.data.dehixTalent ?? [];

        if (!Array.isArray(interviewData)) {
          interviewData = [interviewData];
        }

        const skillArray = interviewData.filter(
          (item: any) => item?.talentType === 'SKILL',
        );
        const domainArray = interviewData.filter(
          (item: any) => item?.talentType === 'DOMAIN',
        );

        setSkillData(skillArray ?? []);
        setDomainData(domainArray ?? []);
        setProjectData(response.data?.data.projects);
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong.Please try again.',
        }); // Error toast
        console.error('Failed to load data. Please try again.', err);
        setSkillData([]);
        setDomainData([]);
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

  const breadcrumbItems = [
    { label: 'Freelancer', link: '/dashboard/freelancer' },
    {
      label: 'Interview',
      link: '/freelancer/interview/profile',
    },
    { label: 'Current Interviews', link: '#' },
  ];

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Current"
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 w-full">
        <Header
          breadcrumbItems={breadcrumbItems}
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Current"
        />
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
          {/* <div className="text-center py-10 w-[90vw] mt-10">
            <PackageOpen className="mx-auto text-gray-500" size="100" />
            <p className="text-gray-500">No Inverview Scheduled for you.</p>
          </div> */}
          <div className="w-full flex justify-center items-center flex-col">
            {isLoading ? (
              <SkeletonLoader isTableView={isTableView} />
            ) : (
              <>
                <DehixInterviews
                  skillData={skillData}
                  setSkillData={setSkillData}
                  domainData={domainData}
                  setDomainData={setDomainData}
                  searchQuery={searchQuery}
                  isTableView={isTableView}
                  filter={filter}
                />
                <Projects
                  searchQuery={searchQuery}
                  isTableView={isTableView}
                  projectData={projectData}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
