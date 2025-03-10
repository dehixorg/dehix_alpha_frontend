'use client';

import { useEffect, useState } from 'react';
import {
  User,
  MapPin,
  Phone,
  Calendar,
  ExternalLink,
  CheckCircle,
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

interface AcceptedTalent {
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
  contactInfo: {
    phone?: string;
    email?: string;
    availableFrom?: string;
  };
  acceptedDate?: string;
}

const AcceptedTalentsPage = () => {
  const router = useRouter();
  const [acceptedTalents, setAcceptedTalents] = useState<AcceptedTalent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAcceptedTalents = async () => {
      try {
        setLoading(true);
        // Using the GET API endpoint directly in this component
        const response = await axiosInstance.get(
          `/business/hire-dehixtalent/{hireDehixTalent_id}/selected`,
        );

        if (response?.data?.data) {
          // Filter only accepted talents from the response
          const accepted = response.data.data.filter(
            (talent: any) => talent.invitedStatus === 'ACCEPTED',
          );
          setAcceptedTalents(accepted);
        } else {
          throw new Error('No data returned from API');
        }
      } catch (error: any) {
        console.error('Error fetching accepted talents:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            error.response?.data?.message ||
            'Failed to load accepted talents. Please try again.',
        });
        setAcceptedTalents([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedTalents();
  }, []);

  const navigateBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <TalentLayout activeTab="accepted">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </TalentLayout>
    );
  }

  return (
    <TalentLayout activeTab="accepted">
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
            Accepted Talents
          </h2>
        </div>
        <span className="text-muted-foreground">
          Showing {acceptedTalents.length} results
        </span>
      </div>

      {acceptedTalents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No talents have accepted invitations yet.
          </p>
          <Button onClick={navigateBack} className="mt-4">
            Browse Talents
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {acceptedTalents.map((talent) => (
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
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Accepted
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

                  {talent.contactInfo?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{talent.contactInfo.phone}</span>
                    </div>
                  )}

                  {talent.contactInfo?.availableFrom && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Available from {talent.contactInfo.availableFrom}
                      </span>
                    </div>
                  )}

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
                  Accepted on {talent.acceptedDate || 'Unknown date'}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Send Message
                  </Button>
                  <Link
                    href={`/business/freelancerProfile/${talent._id}`}
                    passHref
                  >
                    <Button size="sm" className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Contact
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

export default AcceptedTalentsPage;
