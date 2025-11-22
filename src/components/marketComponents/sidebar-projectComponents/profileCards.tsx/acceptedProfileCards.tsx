// src/components/marketComponents/profileCards/acceptedProfileCards.tsx
'use client';
import { useRouter } from 'next/navigation';
import {
  User,
  MapPin,
  Phone,
  ExternalLink,
  CheckCircle,
  Mail,
  Github,
} from 'lucide-react';

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
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/EmptyState';

// Define the Skill interface as it exists in your project
interface Skill {
  _id: string;
  name: string;
}

interface AcceptedProfileCardsProps {
  talents: any[];
  loading: boolean;
  calculateExperience: (professionalInfo: any[]) => string;
}

const AcceptedProfileCards: React.FC<AcceptedProfileCardsProps> = ({
  talents,
  loading,
  calculateExperience,
}) => {
  const router = useRouter();

  const handleSendMessage = async (talent: any) => {
    try {
      // Validate required fields and build name parts
      const userId = talent.uid || talent._id;
      const fullName = [talent.firstName, talent.lastName]
        .filter(part => part && typeof part === 'string')
        .join(' ')
        .trim();

      // Ensure we have a valid user ID
      if (!userId) {
        console.error('Cannot start chat: Missing user ID for talent', talent);
        // Show error to user (you might want to use a toast notification here)
        return;
      }

      // Prepare chat data with proper validation
      const chatData = {
        newChat: true,
        userId,
        userName: fullName || talent.email || 'Unknown User',
        userEmail: talent.email || '',
        userPhoto: talent.profilePic || '',
        userType: talent.userType || 'freelancer',
      };
      
      // Generate a unique key for this chat session
      const chatSessionKey = `chat_${Date.now()}`;
      
      try {
        sessionStorage.setItem(chatSessionKey, JSON.stringify(chatData));
        // Navigate to chat with just the session key
        router.push(`/chat?session=${chatSessionKey}`);
      } catch (storageError) {
        console.error('Error storing chat session:', storageError);
        // Handle storage error (e.g., quota exceeded)
        // You might want to show an error message to the user
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      // Consider using a toast notification here for better UX
      // notifyError('Failed to start chat. Please try again.');
    }
  };

  const SkeletonCard = () => (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <div className="flex flex-wrap gap-2 pt-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {loading ? (
        Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))
      ) : talents.length > 0 ? (
        talents.map((talent, index) => (
          <Card key={`${talent._id}-${index}`} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={talent.profilePic}
                      alt={talent.firstName}
                    />
                    <AvatarFallback>
                      {talent.firstName?.slice(0, 1).toUpperCase() || ''}
                      {talent.lastName?.slice(0, 1).toUpperCase() || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>
                      {talent.firstName} {talent.lastName}
                    </CardTitle>
                    <CardDescription>{talent.role}</CardDescription>
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
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {calculateExperience(talent.professionalInfo)} of experience
                  </span>
                </div>
                {talent.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{talent.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{talent.email}</span>
                </div>
                {talent.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{talent.phone}</span>
                  </div>
                )}
                {talent.githubLink && (
                  <div className="flex items-center gap-2 text-sm">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={talent.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      GitHub Profile
                    </a>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-2">
                  {talent.skills?.map((skill: Skill, skillIndex: number) => (
                    <Badge
                      key={`${talent._id}-${skillIndex}`}
                      variant="secondary"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                Accepted on{' '}
                {talent.kyc?.createdAt
                  ? new Date(talent.kyc.createdAt).toLocaleDateString()
                  : 'N/A'}
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleSendMessage(talent)}
                >
                  Send Message
                </Button>
                <Button 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => {
                    if (talent.email) {
                      window.location.href = `mailto:${talent.email}`;
                    } else if (talent.phone) {
                      window.location.href = `tel:${talent.phone}`;
                    } else {
                      // Fallback to a message if no contact info is available
                      alert('No contact information available for this talent');
                    }
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                  Contact
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))
      ) : (
        <div className="col-span-full">
          <EmptyState
            icon={<User className="h-10 w-10 text-muted-foreground" />}
            title="No accepted talents found"
            className="border-0 bg-transparent py-8"
          />
        </div>
      )}
    </div>
  );
};

export default AcceptedProfileCards;
