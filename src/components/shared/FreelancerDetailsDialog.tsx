import React, { useEffect, useState } from 'react';
import {
  Mail,
  Phone,
  DollarSign,
  Globe,
  Github,
  Linkedin,
  User as UserIcon,
  Briefcase,
} from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Skeleton } from '../ui/skeleton';

import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError } from '@/utils/toastMessage';

interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const SocialLink = ({ href, icon, label }: SocialLinkProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-border hover:bg-accent transition-colors"
          aria-label={label}
        >
          {icon}
        </a>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="flex flex-col items-center space-y-4">
      <Skeleton className="h-24 w-24 rounded-full" />
      <div className="space-y-2 text-center">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <div className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

interface FreelancerDetailsDialogProps {
  freelancerId: string;
  onClose: () => void;
}

const FreelancerDetailsDialog: React.FC<FreelancerDetailsDialogProps> = ({
  freelancerId,
  onClose,
}) => {
  const [freelancerDetails, setFreelancerDetails] = useState<{
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    perHourPrice: number;
    profilePic?: string;
    githubLink?: string;
    linkedin?: string;
    personalWebsite?: string;
    bio?: string;
    skills?: string[];
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFreelancerDetails = async () => {
      if (freelancerId) {
        setLoading(true);
        try {
          const response = await axiosInstance.get(
            `/public/freelancer/${freelancerId}`,
          );
          setFreelancerDetails(response.data);
        } catch (error) {
          console.error('Error fetching freelancer details:', error);
          notifyError('Something went wrong. Please try again.', 'Error');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFreelancerDetails();
  }, [freelancerId]);

  const fullName =
    `${freelancerDetails?.firstName || ''} ${freelancerDetails?.lastName || ''}`.trim();
  const initials = fullName
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-semibold">
                {freelancerDetails?.userName || 'Freelancer Profile'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Professional details and contact information
              </p>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="p-6">
            <LoadingSkeleton />
          </div>
        ) : (
          <div className="space-y-6 p-6">
            {/* Profile Header */}
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                {freelancerDetails?.profilePic ? (
                  <AvatarImage
                    src={freelancerDetails.profilePic}
                    alt={fullName}
                  />
                ) : (
                  <AvatarFallback className="text-xl">
                    {initials || <UserIcon className="h-8 w-8" />}
                  </AvatarFallback>
                )}
              </Avatar>

              <div>
                <h2 className="text-xl font-semibold">
                  {fullName || 'Freelancer'}
                </h2>
                {freelancerDetails?.role && (
                  <p className="text-muted-foreground flex items-center justify-center gap-1.5 mt-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {freelancerDetails.role}
                  </p>
                )}
                {freelancerDetails?.perHourPrice && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-sm font-medium">
                      <DollarSign className="h-3.5 w-3.5 mr-1.5" />$
                      {freelancerDetails.perHourPrice}/hr
                    </Badge>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {(freelancerDetails?.githubLink ||
                freelancerDetails?.linkedin ||
                freelancerDetails?.personalWebsite) && (
                <div className="flex items-center gap-3 pt-2">
                  {freelancerDetails?.githubLink && (
                    <SocialLink
                      href={freelancerDetails.githubLink}
                      icon={<Github className="h-4 w-4" />}
                      label="GitHub Profile"
                    />
                  )}
                  {freelancerDetails?.linkedin && (
                    <SocialLink
                      href={freelancerDetails.linkedin}
                      icon={<Linkedin className="h-4 w-4" />}
                      label="LinkedIn Profile"
                    />
                  )}
                  {freelancerDetails?.personalWebsite && (
                    <SocialLink
                      href={freelancerDetails.personalWebsite}
                      icon={<Globe className="h-4 w-4" />}
                      label="Personal Website"
                    />
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Contact Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <a
                      href={`mailto:${freelancerDetails?.email}`}
                      className="text-sm hover:text-primary hover:underline"
                    >
                      {freelancerDetails?.email}
                    </a>
                  </CardContent>
                </Card>

                {freelancerDetails?.phone && (
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <a
                        href={`tel:${freelancerDetails.phone}`}
                        className="text-sm hover:text-primary hover:underline"
                      >
                        {freelancerDetails.phone}
                      </a>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Skills */}
            {Array.isArray(freelancerDetails?.skills) &&
              freelancerDetails.skills.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {freelancerDetails.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {/* Bio */}
            {freelancerDetails?.bio && (
              <div className="space-y-2">
                <h3 className="font-medium">About</h3>
                <p className="text-sm text-muted-foreground">
                  {freelancerDetails.bio}
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FreelancerDetailsDialog;
