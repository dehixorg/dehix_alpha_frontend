import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import { Mail, CalendarDays, Award, Link2, Code2 } from 'lucide-react';

import { updateConnectsBalance } from '@/lib/updateConnects';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { StatusEnum } from '@/utils/freelancer/enum';
// import Link from 'next/link';

interface ProjectProfileDetailCardProps {
  _id: string;
  domain: string;
  freelancersRequired: string;
  skills: string[];
  experience: number;
  minConnect: number;
  rate: number;
  description: string;
  email?: string;
  status?: StatusEnum;
  startDate?: string;
  endDate?: string;
  className?: string;
  domain_id: string;
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
  description,
  email,
  status,
  startDate,
  endDate,
  className,
  domain_id,
  ...props
}: CardProps) {
  const user = useSelector((state: RootState) => state.user);
  const [amount, setAmount] = useState('');
  const [descriptionValue, setDescription] = useState(description);
  const [dialogOpen, setDialogOpen] = useState(false);
  const params = useParams();
  const [bidProfiles, setBidProfiles] = React.useState<string[]>([]); // Store profile IDs from API
  const [exist, setExist] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post(`/bid`, {
        current_price: amount,
        description: descriptionValue,
        bidder_id: user.uid,
        project_id: params.project_id,
        domain_id: domain_id,
        profile_id: _id,
      });

      const remaining = response?.data?.remainingConnects;
      if (typeof remaining === 'number') {
        updateConnectsBalance(remaining);
      } else {
        console.error('remainingConnects not returned or invalid from API');
        notifyError('Failed to update connects balance.', 'Warning');
      }

      setAmount('');
      setDescription('');
      setDialogOpen(false);
      notifySuccess('The Bid has been successfully added.', 'Bid Added');
      // window.location.reload();
    } catch (error) {
      console.error('Error submitting bid:', error);
      notifyError('Something went wrong. Please try again.', 'Error');
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axiosInstance.get(`/bid/${user.uid}/bid`);
        const profileIds = response.data.data.map((bid: any) => bid.profile_id); // Extract profile_ids
        setBidProfiles(profileIds);
      } catch (error) {
        console.error('API Error:', error);
        notifyError('Something went wrong. Please try again.', 'Error');
      }
    }
    fetchData();
  }, [user.uid]);

  useEffect(() => {
    setExist(bidProfiles.includes(_id));
  }, [bidProfiles, _id]);

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
      <CardFooter className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" type="button" disabled={exist}>
              {!exist ? 'Bid' : 'Applied'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Bid</DialogTitle>
              <DialogDescription>
                Click on bid if you want to bid for this profile
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-center">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right block">
                    Description
                  </Label>
                  <Input
                    id="description"
                    type="text"
                    value={descriptionValue}
                    onChange={(e) => setDescription(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={exist}>
                  {!exist ? 'Bid' : 'Applied'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
