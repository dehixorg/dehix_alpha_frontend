'use client';

import { useEffect, useState } from 'react';
import { Clock, User, ExternalLink, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

interface InvitedTalent {
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
  projectDomain: {
    _id: string;
    name: string;
    level: string;
    experience: string;
  }[];
  education: {
    _id: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    grade: string;
  }[];
  role: string;
  projects: Record<
    string,
    {
      _id: string;
      projectName: string;
      description: string;
      verified: boolean;
      githubLink: string;
      start: string;
      end: string;
      techUsed: string[];
      role: string;
      projectType: string;
    }
  >;
  referral: {
    referralCode: string;
  };
  onboardingStatus: boolean;
  kyc: {
    _id: string;
    aadharOrGovId: string;
    frontImageUrl: string;
    backImageUrl: string;
    liveCapture: string;
    status: string;
    createdAt: string;
    updateAt: string;
  };
}

const InvitedTalentsPage = () => {
  const router = useRouter();
  const [invitedTalents, setInvitedTalents] = useState<InvitedTalent[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState<Record<string, boolean>>(
    {},
  );

  // Fetch invited talents using the GET API
  const fetchInvitedTalents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/business/hire-dehixtalent/{hireDehixTalent_id}/invited`,
      );

      if (response?.data?.data) {
        setInvitedTalents(response.data.data);
      } else {
        throw new Error('No data returned from API');
      }
    } catch (error: any) {
      console.error('Error fetching invited talents:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message ||
          'Failed to load invited talents. Please try again.',
      });
      setInvitedTalents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitedTalents();
  }, []);

  const handleCancelInvitation = async (talentId: string) => {
    try {
      setCancelLoading((prev) => ({ ...prev, [talentId]: true }));

      // Call API to cancel invitation using DELETE
      await axiosInstance.delete(
        `/business/hire-dehixtalent/${talentId}/invite`,
      );

      // Remove talent from the list
      setInvitedTalents((prev) =>
        prev.filter((talent) => talent._id !== talentId),
      );

      toast({
        title: 'Success',
        description: 'Invitation cancelled successfully.',
      });
    } catch (error: any) {
      console.error('Error cancelling invitation:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message ||
          'Failed to cancel invitation. Please try again.',
      });
    } finally {
      setCancelLoading((prev) => ({ ...prev, [talentId]: false }));
    }
  };

  const navigateBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <TalentLayout activeTab="invited">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </TalentLayout>
    );
  }

  return (
    <TalentLayout activeTab="invited">
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
          <h2 className="text-2xl font-bold tracking-tight">Invited Talents</h2>
        </div>
        <span className="text-muted-foreground">
          Showing {invitedTalents.length} results
        </span>
      </div>

      {invitedTalents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No talents have been invited yet.
          </p>
          <Button onClick={navigateBack} className="mt-4">
            Browse Talents
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {invitedTalents.map((talent) => (
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
                      <CardDescription>{talent.userName}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {talent.invitedStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {talent.role ||
                        (talent.professionalInfo?.[0]?.jobTitle
                          ? `${talent.professionalInfo[0].jobTitle} at ${talent.professionalInfo[0].company}`
                          : 'Role not specified')}
                    </span>
                  </div>

                  {talent.skills && talent.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {talent.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill._id} variant="secondary">
                          {skill.name} ({skill.experience})
                        </Badge>
                      ))}
                      {talent.skills.length > 3 && (
                        <Badge variant="outline">
                          +{talent.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {talent.domain && talent.domain.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {talent.domain.slice(0, 2).map((domain) => (
                        <Badge
                          key={domain._id}
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 border-blue-300"
                        >
                          {domain.name}
                        </Badge>
                      ))}
                      {talent.domain.length > 2 && (
                        <Badge variant="outline">
                          +{talent.domain.length - 2} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="text-sm text-muted-foreground">
                  {/* You might want to add the invited date here if available */}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCancelInvitation(talent._id)}
                    disabled={cancelLoading[talent._id]}
                  >
                    {cancelLoading[talent._id] ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : null}
                    Cancel
                  </Button>
                  <Link
                    href={`/business/freelancerProfile/${talent._id}`}
                    passHref
                  >
                    <Button
                      size="sm"
                      variant="outline"
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

export default InvitedTalentsPage;
