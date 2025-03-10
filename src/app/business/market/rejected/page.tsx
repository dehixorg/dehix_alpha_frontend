'use client';

import { useEffect, useState } from 'react';
import {
  User,
  MapPin,
  ExternalLink,
  XCircle,
  RefreshCw,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import TalentLayout from '@/components/marketComponents/TalentLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';

interface RejectedTalent {
  _id: string;
  invitedStatus: string;
  firstName: string;
  lastName: string;
  userName: string;
  profilePic: string;
  description: string;
  professionalInfo: {
    _id: string;
    company: string;
    jobTitle: string;
    workDescription: string;
    workFrom: string;
    workTo: string;
    githubRepoLink: string;
  }[];
  skills: {
    _id: string;
    name: string;
    level: string;
    experience: string;
    interviewPermission: string;
  }[];
  domain: {
    _id: string;
    name: string;
    level: string;
    experience: string;
    interviewPermission: string;
  }[];
  rejectionReason?: string;
  rejectedDate?: string;
}

const RejectedTalentsPage = () => {
  const router = useRouter();
  const [rejectedTalents, setRejectedTalents] = useState<RejectedTalent[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconsiderLoading, setReconsiderLoading] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const fetchRejectedTalents = async () => {
      try {
        setLoading(true);
        // Using the GET API endpoint directly in this component
        const response = await axiosInstance.get(
          `/business/hire-dehixtalent/{hireDehixTalent_id}/rejected`,
        );

        if (response?.data?.data) {
          // Filter only rejected talents from the response
          const rejected = response.data.data.filter(
            (talent: any) => talent.invitedStatus === 'REJECTED',
          );
          setRejectedTalents(rejected);
        } else {
          throw new Error('No data returned from API');
        }
      } catch (error: any) {
        console.error('Error fetching rejected talents:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            error.response?.data?.message ||
            'Failed to load rejected talents. Please try again.',
        });
        setRejectedTalents([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchRejectedTalents();
  }, []);

  const handleReconsider = async (talentId: string) => {
    try {
      setReconsiderLoading((prev) => ({ ...prev, [talentId]: true }));

      // This would be the actual API call to reconsider a talent
      // For now, we'll just simulate it with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Remove talent from the rejected list
      setRejectedTalents((prev) =>
        prev.filter((talent) => talent._id !== talentId),
      );

      toast({
        title: 'Success',
        description: 'Talent has been reconsidered.',
      });
    } catch (error: any) {
      console.error('Error reconsidering talent:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message ||
          'Failed to reconsider talent. Please try again.',
      });
    } finally {
      setReconsiderLoading((prev) => ({ ...prev, [talentId]: false }));
    }
  };

  const navigateBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <TalentLayout activeTab="rejected">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </TalentLayout>
    );
  }

  return (
    <TalentLayout activeTab="rejected">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={navigateBack}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">
            Rejected Talents
          </h2>
        </div>
        <span className="text-muted-foreground">
          Showing {rejectedTalents.length} results
        </span>
      </div>

      {rejectedTalents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No rejected talents found.
          </p>
          <Button onClick={navigateBack} className="mt-4">
            Browse Talents
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rejectedTalents.map((talent) => (
            <Card key={talent._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={talent.profilePic}
                        alt={`${talent.firstName} ${talent.lastName}`}
                      />
                      <AvatarFallback>
                        {`${talent.firstName?.charAt(0) || ''}${talent.lastName?.charAt(0) || ''}`}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{`${talent.firstName} ${talent.lastName}`}</CardTitle>
                      <CardDescription>
                        {talent.professionalInfo?.[0]?.jobTitle ||
                          talent.userName}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <XCircle className="h-3 w-3" />
                    Rejected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  {talent.skills && talent.skills.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {talent.skills[0].experience || '0'} years experience
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {talent.description || 'Location not specified'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <XCircle className="h-4 w-4" />
                    <span>
                      Reason: {talent.rejectionReason || 'Not specified'}
                    </span>
                  </div>

                  {talent.skills && talent.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {talent.skills.map((skill) => (
                        <Badge key={skill._id} variant="secondary">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="text-sm text-muted-foreground">
                  Rejected on {talent.rejectedDate || 'Unknown date'}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => handleReconsider(talent._id)}
                    disabled={reconsiderLoading[talent._id]}
                  >
                    {reconsiderLoading[talent._id] ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-1" />
                    )}
                    Reconsider
                  </Button>
                  <Link
                    href={`/business/freelancerProfile/${talent._id}`}
                    passHref
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Profile
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </TalentLayout>
  );
};

export default RejectedTalentsPage;
