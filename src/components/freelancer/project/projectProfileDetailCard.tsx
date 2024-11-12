import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import { toast } from '@/components/ui/use-toast';

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
  status?: string;
  startDate?: string;
  endDate?: string;
  className?: string;
  domain_id: string;
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
  const [descriptionValue, setDescription] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const params = useParams();
  const [bidProfiles, setBidProfiles] = React.useState<string[]>([]); // Store profile IDs from API
  const [exist, setExist] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await axiosInstance.post(`/bid`, {
        current_price: amount,
        description: descriptionValue,
        bidder_id: user.uid,
        project_id: params.project_id,
        domain_id: domain_id,
        profile_id: _id,
      });

      setAmount('');
      setDescription('');
      setDialogOpen(false);
      toast({
        title: 'Bid Added',
        description: 'The Bid has been successfully added.',
      });
      // window.location.reload();
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast({
        title: 'some thing went',
        description: 'Something went wrong try after some time.',
      });
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
      }
    }
    fetchData();
  }, [user.uid]);

  useEffect(() => {
    setExist(bidProfiles.includes(_id));
  }, [bidProfiles, _id]);

  return (
    <Card className={cn('w-[350px]', className)} {...props}>
      <CardHeader>
        <CardTitle>
          {domain} ({freelancersRequired})
        </CardTitle>
        <CardDescription className="text-gray-600">
          Requirement is of {freelancersRequired} freelancer(s) for{' '}
          {domain.toLowerCase()} profile.
          <br />
          <p className="break-words text-white">{description}</p>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <ul className="flex flex-wrap gap-2">
            {email && (
              <li className="min-w-[45%]">
                <span className="text-gray-700 font-semibold">Email: </span>
                {email}
              </li>
            )}
            {status && (
              <li className="min-w-[45%]">
                <span className="text-gray-700 font-semibold">Status: </span>
                {status}
              </li>
            )}
            {startDate && (
              <li className="min-w-[45%]">
                <span className="text-gray-700 font-semibold">
                  Start Date:{' '}
                </span>
                {startDate}
              </li>
            )}
            {endDate && (
              <li className="min-w-[45%]">
                <span className="text-gray-400 font-semibold">End Date: </span>
                {endDate}
              </li>
            )}
            <li className="min-w-[45%]">
              <span className="text-gray-400 font-semibold">Experience: </span>
              {experience} years
            </li>
            <li className="min-w-[45%]">
              <span className="text-gray-400 font-semibold">Min Connect: </span>
              {minConnect}
            </li>
          </ul>
          {skills.length > 0 && (
            <div className="mt-2">
              <span className="text-gray-700 font-semibold">Skills: </span>
              <ul className="flex flex-wrap gap-1 mt-1">
                {skills.map((skill, index) => (
                  <li
                    key={index}
                    className="bg-gray-200 rounded px-2 py-1 text-sm"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
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
