import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Users, Plus, Search, ChevronDown } from 'lucide-react';
import { useSelector } from 'react-redux';

import { Badge } from '../ui/badge';

import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
import { cn } from '@/lib/utils';
import FreelancerListItem from '@/components/freelancer/FreelancerListItem';
import { CreateProjectTeamGroupDialog } from '@/components/shared/CreateProjectTeamGroupDialog';
import { subscribeToUserConversations } from '@/utils/common/firestoreUtils';

// Types
interface Freelancer {
  _id: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  profilePic?: string;
  skills?: string[];
  domain?: string[];
  workExperience?: number;
  perHourPrice?: number;
  bid_status?: 'ACCEPTED';
  role?: string;
  description?: string;
}

interface FreelancerGroup {
  id: string;
  project_name: string;
  participants: string[];
  type: 'private' | 'group';
  timestamp: string;
  project_id?: string;
}

interface FreelancerListProps {
  projectId: string;
  className?: string;
  onChatClick?: (freelancerId: string, freelancerName: string) => void;
  onGroupCreated?: () => void; // Callback for when a group is created
}

const FreelancerList: React.FC<FreelancerListProps> = ({
  projectId,
  className,
  onChatClick,
  onGroupCreated,
}) => {
  const user = useSelector((state: RootState) => state.user);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [groups, setGroups] = useState<FreelancerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);

  // Check if user is business
  const isBusinessUser = user?.type === 'business';

  // Handle group creation completion - integrates with CreateProjectTeamGroupDialog
  const handleGroupCreated = useCallback(() => {
    if (onGroupCreated) {
      onGroupCreated();
    }

    notifySuccess(
      'Your team group has been created and will appear in the list.',
      'Group Created',
    );
  }, [onGroupCreated]);

  // Fetch freelancers with accepted bids for this project
  const fetchFreelancers = useCallback(async () => {
    try {
      setLoading(true);

      // Get project details first to understand the structure
      const projectResponse = await axiosInstance.get(`/project/${projectId}`);
      const projectData =
        projectResponse.data?.data?.data || projectResponse.data?.data;

      if (!projectData || !projectData.profiles) {
        setFreelancers([]);
        return;
      }

      const acceptedFreelancers: Freelancer[] = [];

      // Loop through each profile in the project
      for (const profile of projectData.profiles) {
        try {
          // Fetch bids for this specific profile
          const bidsResponse = await axiosInstance.get(
            `/bid/project/${projectId}/profile/${profile._id}/bid`,
          );

          const bidsData = bidsResponse.data?.data || [];

          // Filter for accepted bids
          const acceptedBids = bidsData.filter(
            (bid: any) => bid.bid_status === 'ACCEPTED',
          );

          // Get unique bidder IDs from accepted bids
          const uniqueBidderIds: string[] = Array.from(
            new Set(acceptedBids.map((bid: any) => bid.bidder_id)),
          ).filter(
            (id): id is string => typeof id === 'string' && id.trim() !== '',
          );

          // Fetch freelancer details for each accepted bidder
          for (const bidderId of uniqueBidderIds) {
            try {
              const freelancerResponse = await axiosInstance.get(
                `/public/freelancer/${bidderId}`,
              );
              const freelancerData =
                freelancerResponse.data?.data || freelancerResponse.data;

              // Find the bid for this freelancer to get bid-specific info
              const freelancerBid = acceptedBids.find(
                (bid: any) => bid.bidder_id === bidderId,
              );

              const freelancer: Freelancer = {
                _id: freelancerData._id || bidderId,
                userName: freelancerData.userName || 'Unknown User',
                firstName: freelancerData.firstName,
                lastName: freelancerData.lastName,
                email: freelancerData.email,
                profilePic: freelancerData.profilePic,
                skills:
                  freelancerData.skills?.map((skill: any) =>
                    typeof skill === 'string'
                      ? skill
                      : skill.name || skill.label,
                  ) || [],
                domain:
                  freelancerData.domain?.map((domain: any) =>
                    typeof domain === 'string'
                      ? domain
                      : domain.name || domain.label,
                  ) || [],
                workExperience: freelancerData.workExperience || 0,
                perHourPrice:
                  freelancerBid?.current_price ||
                  freelancerData.perHourPrice ||
                  0,
                bid_status: 'ACCEPTED',
                role: freelancerData.role,
                description: freelancerData.description,
              };
              const existingFreelancer = acceptedFreelancers.find(
                (f) => f._id === freelancer._id,
              );
              const isCurrentUser =
                freelancer._id === user?.uid ||
                freelancer.email === user?.email;

              if (!existingFreelancer && !isCurrentUser) {
                acceptedFreelancers.push(freelancer);
              }
            } catch (freelancerError) {
              console.error(
                `Failed to fetch freelancer ${bidderId}:`,
                freelancerError,
              );
            }
          }
        } catch (bidError) {
          console.error(
            `Failed to fetch bids for profile ${profile._id}:`,
            bidError,
          );
          // Continue with next profile
        }
      }
      setFreelancers(acceptedFreelancers);
    } catch (error) {
      console.error('Error fetching freelancers:', error);
      notifyError('Failed to fetch freelancers. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Fetch groups for this project using Firestore
  const fetchGroups = useCallback(() => {
    if (!user?.uid) {
      return;
    }

    // Subscribe to conversations where the user is a participant
    const unsubscribe = subscribeToUserConversations(
      'conversations',
      user.uid,
      (conversations) => {
        const groupConversations = conversations.filter((conv: any) => {
          // Must be a group conversation
          if (conv.type !== 'group') {
            return false;
          }

          const conversationProjectId = conv.project_id;
          const isParticipant =
            conv.participants && conv.participants.includes(user.uid);

          // User must be a participant in the group
          if (!isParticipant) {
            return false;
          }

          // Project-specific filtering
          if (conversationProjectId) {
            // Group has project_id - must match current project
            const projectMatches = conversationProjectId === projectId;
            return projectMatches;
          } else {
            return isBusinessUser;
          }
        });

        // Transform conversations to match FreelancerGroup interface
        const transformedGroups = groupConversations.map((conv: any) => {
          const transformedGroup = {
            id: conv.id,
            project_name:
              conv.groupName || conv.project_name || 'Unnamed Group',
            participants: conv.participants || [],
            type: conv.type,
            timestamp: conv.timestamp || conv.updatedAt || conv.createdAt,
            project_id: conv.project_id, // Keep project_id for reference
          };
          return transformedGroup;
        });
        setGroups(transformedGroups);
      },
    );

    // Return cleanup function
    return unsubscribe;
  }, [user?.uid, isBusinessUser, projectId]);

  // Handle chat click
  const handleChatClick = (freelancer: Freelancer) => {
    if (onChatClick) {
      onChatClick(
        freelancer._id,
        freelancer.firstName && freelancer.lastName
          ? `${freelancer.firstName} ${freelancer.lastName}`
          : freelancer.userName,
      );
    } else {
      // Default behavior - could integrate with existing chat system
      notifySuccess(`Opening chat with ${freelancer.userName}...`, 'Chat');
    }
  };

  // Handle group click
  const handleGroupClick = (group: FreelancerGroup) => {
    // If there's an onChatClick handler, use it for the group chat
    if (onChatClick) {
      onChatClick(group.id, group.project_name);
    } else {
      // Default behavior for group click
      notifySuccess(
        `Opening group chat: ${group.project_name}...`,
        'Group Chat',
      );
    }
  };

  // Filter freelancers based on search term
  const filteredFreelancers = freelancers.filter((freelancer) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName =
      `${freelancer.firstName || ''} ${freelancer.lastName || ''}`.trim();
    return (
      freelancer.userName.toLowerCase().includes(searchLower) ||
      fullName.toLowerCase().includes(searchLower) ||
      freelancer.email.toLowerCase().includes(searchLower) ||
      freelancer.skills?.some((skill) =>
        skill.toLowerCase().includes(searchLower),
      ) ||
      freelancer.domain?.some((domain) =>
        domain.toLowerCase().includes(searchLower),
      )
    );
  });

  useEffect(() => {
    fetchFreelancers();

    // Set up Firestore subscription for groups
    let unsubscribeGroups: (() => void) | undefined;

    if (user?.uid) {
      unsubscribeGroups = fetchGroups();
    }

    // Cleanup function
    return () => {
      if (unsubscribeGroups) {
        unsubscribeGroups();
      }
    };
  }, [fetchFreelancers, fetchGroups, user?.uid, isBusinessUser, projectId]);

  return (
    <Card
      className={cn(
        'w-full h-full flex flex-col rounded-xl border border-border/60 bg-[hsl(var(--card))] shadow-lg',
        className,
      )}
    >
      <CardHeader className="flex-shrink-0 sticky top-0 z-10 bg-gradient border-b relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Team Members</CardTitle>
          {isBusinessUser && (
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setShowCreateGroupDialog(true)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Create Team Group
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search freelancers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 pb-3">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {loading ? (
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            </div>
          ) : filteredFreelancers.length === 0 && groups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchTerm
                  ? 'No freelancers match your search'
                  : isBusinessUser
                    ? 'No freelancers found for this project'
                    : 'No other freelancers found for this project'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Groups Section */}
              {groups.length > 0 && (
                <>
                  <div className="text-sm font-medium text-muted-foreground mt-4">
                    {isBusinessUser ? 'Project Groups' : 'Team Groups'}
                    <Badge className="ml-1">{groups.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {group.project_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {group.participants.length} members
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGroupClick(group)}
                          className="flex-shrink-0"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {filteredFreelancers.length > 0 && (
                    <Separator className="my-4" />
                  )}
                </>
              )}

              {/* Freelancers Section */}
              {filteredFreelancers.length > 0 && (
                <>
                  <div className="text-sm font-medium text-muted-foreground mt-4">
                    Freelancers <Badge>{filteredFreelancers.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {filteredFreelancers.map((freelancer) => (
                      <FreelancerListItem
                        key={freelancer._id}
                        freelancer={freelancer}
                        onChatClick={() => handleChatClick(freelancer)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        {/* Create Project Team Group Dialog */}
        <CreateProjectTeamGroupDialog
          isOpen={showCreateGroupDialog}
          onClose={() => setShowCreateGroupDialog(false)}
          projectId={projectId}
          currentUserUid={user?.uid || ''}
          onGroupCreated={handleGroupCreated}
        />
      </CardContent>
    </Card>
  );
};

export default FreelancerList;
