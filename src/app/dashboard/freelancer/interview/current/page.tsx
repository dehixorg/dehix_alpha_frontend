'use client';
import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { MessageSquare, UserIcon, Search, ListFilter } from 'lucide-react';
import { useSelector } from 'react-redux';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import Breadcrumb from '@/components/shared/breadcrumbList';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/interviewMenuItems';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RootState } from '@/lib/store';
import { Spinner } from '@/components/ui/spinner';

interface Interview {
  reference: string;
  skill?: string;
  domain?: string;
  interviewDate: string;
  rating: number;
  comments: string;
  status: 'Pending' | 'Complete';
  description: string;
  contact: string;
}

const CommentSchema = z.object({
  comment: z.string().min(1, 'Comment is required'),
});

interface CommentFormData {
  comment: string;
}

interface InterviewCardProps {
  index: number;
  interview: Interview;
  handleCommentSubmit: (index: number, comment: string) => void;
}

const InterviewCard: React.FC<InterviewCardProps> = ({
  index,
  interview,
  handleCommentSubmit,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CommentFormData>({
    resolver: zodResolver(CommentSchema),
  });

  const onSubmit = (data: CommentFormData) => {
    handleCommentSubmit(index, data.comment);
    reset();
  };

  return (
    <Card className="max-w-full mx-auto md:max-w-lg">
      <CardHeader>
        <CardTitle className="flex text-2xl">{interview.reference}</CardTitle>
        <CardDescription className="block mt-1 uppercase tracking-wide leading-tight font-medium text-gray-700 text-sm">
          {interview.skill || interview.domain}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Badge
          className={`bg-${interview.status === 'Pending' ? 'warning' : 'success'} hover:bg-${
            interview.status === 'Pending' ? 'warning' : 'success'
          } text-xs`}
        >
          {interview.status.toUpperCase()}
        </Badge>
        <p className="text-gray-300 pt-4 text-sm">{interview.description}</p>
        {interview.status === 'Pending' && (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
            <Input
              type="text"
              placeholder="Enter comment..."
              className="p-2 border rounded"
              {...register('comment')}
            />
            {errors.comment && (
              <p className="text-red-500 text-xs mt-1">
                {errors.comment.message}
              </p>
            )}
            <Button type="submit" className="mt-2">
              Submit Comment
            </Button>
          </form>
        )}
        {interview.status === 'Complete' && (
          <p className="mt-4 flex text-gray-500 border p-3 rounded text-sm">
            <MessageSquare className="pr-1 mr-1 h-5 w-5" />
            {interview.comments}
          </p>
        )}
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Reference: {interview.reference}
          </p>
          <p className="text-sm text-gray-600">Contact: {interview.contact}</p>
        </div>
      </CardContent>
      <CardFooter className="flex">
        <p className="text-sm font-semibold text-black bg-white px-3 py-1 rounded">
          {new Date(interview.interviewDate).toLocaleDateString()}
        </p>
      </CardFooter>
    </Card>
  );
};

export default function CurrentPage() {
  const user = useSelector((state: RootState) => state.user);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Adjust the delay

    return () => clearTimeout(timer);
  }, []);

  const [sampleInterviews, setSampleInterviews] = React.useState<Interview[]>([
    {
      reference: 'Jane Smith',
      skill: 'HTML/CSS',
      interviewDate: '2023-11-23T10:30:00Z',
      rating: 9,
      comments: '',
      status: 'Pending',
      description:
        'This interview focused on assessing proficiency in HTML/CSS and evaluating communication skills.',
      contact: 'jane.smith@example.com',
    },
    {
      reference: 'Chirag Vaviya',
      domain: 'DevOps',
      interviewDate: '2023-11-23T10:30:00Z',
      rating: 9,
      comments: '',
      status: 'Pending',
      description:
        "This interview was scheduled to discuss the candidate's experience and skills in DevOps.",
      contact: 'jane.smith@example.com',
    },
  ]);

  const [filter, setFilter] = React.useState<'All' | 'Skills' | 'Domain'>(
    'All',
  );

  const handleCommentSubmit = (index: number, comment: string) => {
    const updatedInterviews = [...sampleInterviews];

    console.log('Before update:', updatedInterviews[index]);

    updatedInterviews[index] = {
      ...updatedInterviews[index],
      comments: comment,
      status: 'Complete',
    };

    console.log('After update:', updatedInterviews[index]);

    setSampleInterviews(updatedInterviews);
  };

  const filteredInterviews = sampleInterviews.filter((interview) => {
    if (interview.status === 'Complete') return false;
    if (filter === 'All') return true;
    if (filter === 'Skills' && interview.skill) return true;
    if (filter === 'Domain' && interview.domain) return true;
    return false;
  });

  return (
    <div className="flex min-h-screen w-full">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Current"
      />
      <div className="flex flex-col sm:py-2 sm:pl-14 w-full">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background px-4 py-2 sm:static sm:border-0 sm:bg-transparent sm:px-6">
          <div className="flex items-center ml-2 gap-4">
            <CollapsibleSidebarMenu
              menuItems={menuItemsTop}
              active="Dashboard"
            />
            <Breadcrumb
              items={[
                { label: 'Freelancer', link: '/dashboard/freelancer' },
                {
                  label: 'Interview',
                  link: '/dashboard/freelancer/interview/profile',
                },
                { label: 'Current Interviews', link: '#' },
              ]}
            />
          </div>
          <div className="relative flex items-center gap-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 sm:w-[200px] lg:w-[336px]"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="overflow-hidden rounded-full"
                >
                  <UserIcon size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {loading ? (
          <div className="flex items-center justify-center min-h-screen bg-muted/40">
            <Spinner size="large" className="-mt-32">
              Loading...
            </Spinner>
          </div>
        ) : (
          <div className="flex flex-1 items-start gap-4 p-2 sm:px-6 sm:py-0 md:gap-8 lg:flex-col xl:flex-col pt-2 pl-4 sm:pt-4 sm:pl-6 md:pt-6 md:pl-8">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-sm"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInterviews.map((interview, index) => (
                <InterviewCard
                  key={index}
                  index={index}
                  interview={interview}
                  handleCommentSubmit={handleCommentSubmit}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
