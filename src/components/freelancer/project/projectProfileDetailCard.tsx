import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import {
  Mail,
  CalendarDays,
  Award,
  Link2,
  Code2,
  AlertCircle,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatItem from '@/components/shared/StatItem';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
import { notifyError } from '@/utils/toastMessage';
import { StatusEnum } from '@/utils/freelancer/enum';

interface ProjectProfileDetailCardProps {
  _id: string;
  domain: string;
  freelancersRequired: string;
  skills: string[];
  experience: number;
  minConnect: number;
  rate: number;
  description?: string;
  email?: string;
  status?: StatusEnum;
  startDate?: string;
  endDate?: string;
  className?: string;
  domain_id?: string;
  // business_id: string;
}

type CardProps = React.ComponentProps<typeof Card> &
  ProjectProfileDetailCardProps;

export function ProjectProfileDetailCard({
  _id,
  domain,
  freelancersRequired,
  skills,
  experience,
  minConnect,
  email,
  status,
  startDate,
  endDate,
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  description: _description,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  domain_id: _domain_id,
  ...props
}: CardProps) {
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const params = useParams();

  const [exist, setExist] = useState(false);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  const handleBidClick = () => {
    if (hasReachedLimit || exist) {
      return;
    }
    // Redirect to the apply page
    router.push(`/freelancer/market/project/${params.project_id}/apply`);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axiosInstance.get(`/bid/${user.uid}/bid`);
        const allBids = response.data.data;

        // Filter bids for the current project
        const projectBids = allBids.filter(
          (bid: any) => bid.project_id === params.project_id,
        );
        const profileIds = projectBids.map((bid: any) => bid.profile_id);
        const uniqueProfileIds = profileIds.filter(
          (id: string, index: number) => profileIds.indexOf(id) === index,
        );

        // Check if current profile is already bid on
        setExist(uniqueProfileIds.includes(_id));

        // Check if user has reached the limit of 3 unique profiles
        setHasReachedLimit(
          uniqueProfileIds.length >= 3 && !uniqueProfileIds.includes(_id),
        );
      } catch (error) {
        console.error('API Error:', error);
        notifyError('Something went wrong. Please try again.', 'Error');
      }
    }
    fetchData();
  }, [user.uid, params.project_id, _id]);

  return (
    <Card
      className={cn(
        'w-full border shadow-sm hover:shadow-md transition-all duration-200',
        className,
      )}
      {...props}
    >
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg">
          {domain}{' '}
          {freelancersRequired && (
            <Badge className="text-muted">{freelancersRequired}</Badge>
          )}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Requirement is of {freelancersRequired} freelancer(s) for{' '}
          {domain.toLowerCase()} profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {email && (
              <StatItem
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={email}
                color="blue"
              />
            )}
            {status && (
              <StatItem
                icon={<Badge className="uppercase">{status}</Badge>}
                label="Status"
                value={status}
                color="green"
              />
            )}
            {startDate && (
              <StatItem
                icon={<CalendarDays className="h-4 w-4" />}
                label="Start Date"
                value={startDate}
                color="default"
              />
            )}
            {endDate && (
              <StatItem
                icon={<CalendarDays className="h-4 w-4" />}
                label="End Date"
                value={endDate}
                color="default"
              />
            )}
            <StatItem
              icon={<Award className="h-4 w-4" />}
              label="Experience"
              value={`${experience} years`}
              color="amber"
            />
            <StatItem
              icon={<Link2 className="h-4 w-4" />}
              label="Min Connect"
              value={String(minConnect)}
              color="amber"
            />
          </div>
          {skills.length > 0 && (
            <div className="flex flex-col gap-2 px-3 py-2 text-xs md:text-sm rounded-lg border bg-muted/30 w-full mt-3">
              <div className="flex items-center gap-2 text-foreground">
                <Code2 className="w-4 h-4 block md:hidden" />
                <p className="font-medium">Skills</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs md:text-sm px-2.5 py-0.5 rounded-full"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        {hasReachedLimit && (
          <Alert variant="destructive" className="w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have already reached the limit of bidding on profiles for this
              project.
            </AlertDescription>
          </Alert>
        )}
        <div className="w-full flex justify-end">
          <Button
            variant="outline"
            type="button"
            disabled={exist || hasReachedLimit}
            onClick={handleBidClick}
          >
            {exist ? 'Applied' : 'Bid'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
