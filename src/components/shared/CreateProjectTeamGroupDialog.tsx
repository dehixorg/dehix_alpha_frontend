'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X as LucideX, LoaderCircle, Check, Users, Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import { serverTimestamp, addDoc, collection } from 'firebase/firestore';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
import { db } from '@/config/firebaseConfig';
// Types for accepted freelancers
interface AcceptedFreelancer {
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
  bid_status: 'ACCEPTED';
}

interface CreateProjectTeamGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentUserUid: string;
  onGroupCreated?: () => void; // Callback for when group is successfully created
}

export function CreateProjectTeamGroupDialog({
  isOpen,
  onClose,
  projectId,
  currentUserUid,
  onGroupCreated,
}: CreateProjectTeamGroupDialogProps) {
  const user = useSelector((state: RootState) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<AcceptedFreelancer[]>(
    [],
  );
  const [acceptedFreelancers, setAcceptedFreelancers] = useState<
    AcceptedFreelancer[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch freelancers with accepted bids for this project
  const fetchAcceptedFreelancers = useCallback(async () => {
    if (!projectId) return;

    try {
      setIsLoading(true);

      // Get project details first to understand the structure
      const projectResponse = await axiosInstance.get(`/project/${projectId}`);
      const projectData =
        projectResponse.data?.data?.data || projectResponse.data?.data;

      if (!projectData || !projectData.profiles) {
        setAcceptedFreelancers([]);
        return;
      }

      const acceptedFreelancersList: AcceptedFreelancer[] = [];

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

              const freelancer: AcceptedFreelancer = {
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
              };

              // Check if freelancer is already in the list and exclude current user
              const existingFreelancer = acceptedFreelancersList.find(
                (f) => f._id === freelancer._id,
              );
              const isCurrentUser = freelancer._id === currentUserUid;

              if (!existingFreelancer && !isCurrentUser) {
                acceptedFreelancersList.push(freelancer);
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
        }
      }

      setAcceptedFreelancers(acceptedFreelancersList);
    } catch (error) {
      console.error('Error fetching accepted freelancers:', error);
      notifyError(
        'Failed to fetch project freelancers. Please try again.',
        'Error',
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId, currentUserUid]);

  // Filter freelancers based on search term
  const filteredFreelancers = acceptedFreelancers.filter((freelancer) => {
    if (!searchTerm) return true; // Show all if no search term

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

  const handleToggleMember = (freelancer: AcceptedFreelancer) => {
    setSelectedMembers((prev) =>
      prev.some((member) => member._id === freelancer._id)
        ? prev.filter((member) => member._id !== freelancer._id)
        : [...prev, freelancer],
    );
  };

  async function onCreateGroup(
    selectedUsers: AcceptedFreelancer[],
    groupName: string,
    description: string,
  ) {
    if (!user || !user.uid) {
      notifyError('You must be logged in.', 'Error');
      return;
    }
    if (!groupName.trim()) {
      notifyError('Group name cannot be empty.', 'Error');
      return;
    }
    if (selectedUsers.length < 1) {
      notifyError('You must select at least one other member.', 'Error');
      return;
    }

    const allParticipantIds = [user.uid, ...selectedUsers.map((u) => u._id)];
    const participantDetails: Record<
      string,
      {
        userName: string;
        profilePic: string | null;
        email: string | null;
        userType: string;
      }
    > = {
      [user.uid]: {
        userName: user.displayName || user.email || 'Unknown User',
        profilePic: user.photoURL || null,
        email: user.email || null,
        userType: (user as any).type || 'business',
      },
    };
    selectedUsers.forEach((selected: AcceptedFreelancer) => {
      // Use _id instead of id, and handle undefined values properly
      participantDetails[selected._id] = {
        userName:
          selected.userName ||
          `${selected.firstName || ''} ${selected.lastName || ''}`.trim() ||
          'Unknown User',
        profilePic: selected.profilePic || null,
        email: selected.email || null,
        userType: 'freelancer',
      };
    });

    // Filter out any undefined values from participantDetails
    const cleanParticipantDetails = Object.fromEntries(
      Object.entries(participantDetails).filter(([key, value]) => {
        return key && value && value.userName; // Ensure key exists and userName is defined
      }),
    );

    const currentTimestamp = new Date().toISOString();

    const newGroupData = {
      groupName: groupName.trim(),
      description: description.trim() || '',
      avatar: null,
      participants: allParticipantIds.filter((id) => id), // Filter out any undefined IDs
      participantDetails: cleanParticipantDetails,
      type: 'group' as const,
      admins: [user.uid],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      timestamp: currentTimestamp, // Add immediate timestamp for reliable querying
      lastMessage: null,
      project_id: projectId, // Add project_id to link the group to the project
    };

    try {
      await addDoc(collection(db, 'conversations'), newGroupData);

      notifySuccess(`Group "${groupName}" created successfully!`, 'Success');

      // Reset form
      setGroupName('');
      setGroupDescription('');
      setSelectedMembers([]);
      setSearchTerm('');
    } catch (error) {
      console.error('Error creating group chat: ', error);
      console.error('Data that failed:', {
        ...newGroupData,
        createdAt: '[ServerTimestamp]',
        updatedAt: '[ServerTimestamp]',
      });
      notifyError('Failed to create group. Please try again.', 'Error');
      // Re-throw the error so it can be caught by handleCreateGroup
      throw error;
    }
  }

  const handleCreateGroup = async () => {
    if (groupName.trim() === '') {
      notifyError('Please enter a group name.', 'Group Name Required');
      return;
    }

    if (selectedMembers.length === 0) {
      notifyError(
        'Please select at least one freelancer for the group.',
        'Members Required',
      );
      return;
    }

    setIsCreating(true);

    try {
      await onCreateGroup(selectedMembers, groupName, groupDescription);

      // Only call success callbacks if group creation succeeded
      if (onGroupCreated) {
        onGroupCreated();
      }

      // Close dialog after successful creation
      onClose();
    } catch (error) {
      console.error('Error in handleCreateGroup:', error);
    } finally {
      setIsCreating(false);
    }
  };
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setGroupName('');
      setGroupDescription('');
      setSelectedMembers([]);
      fetchAcceptedFreelancers();
    }
  }, [isOpen, fetchAcceptedFreelancers]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[hsl(var(--card))] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Create Project Team Group
          </DialogTitle>
          <DialogDescription>
            Create a group with freelancers who have accepted bids for this
            project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {/* Group Description */}
          <div className="space-y-2">
            <Label htmlFor="groupDescription">Description (Optional)</Label>
            <Textarea
              id="groupDescription"
              placeholder="What is this group about?"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Search Freelancers */}
          <div className="space-y-2">
            <Label htmlFor="freelancerSearch">Project Freelancers</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="freelancerSearch"
                placeholder="Search project freelancers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Selected Members Display */}
          {selectedMembers.length > 0 && (
            <div className="p-2 border-b">
              <p className="text-xs font-semibold mb-2 text-[hsl(var(--muted-foreground))]">
                SELECTED MEMBERS ({selectedMembers.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedMembers.map((member) => (
                  <span
                    key={member._id}
                    className="flex items-center gap-1.5 bg-[hsl(var(--accent))] text-xs font-medium px-2 py-1 rounded-full"
                  >
                    {member.firstName && member.lastName
                      ? `${member.firstName} ${member.lastName}`
                      : member.userName}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleMember(member);
                      }}
                    >
                      <LucideX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Freelancers List */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">
                Available Freelancers ({filteredFreelancers.length})
              </p>
            </div>
            <ScrollArea className="h-48 border rounded-md p-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <LoaderCircle className="w-8 h-8 animate-spin" />
                  <span className="ml-2 text-sm">
                    Loading project freelancers...
                  </span>
                </div>
              ) : filteredFreelancers.length === 0 ? (
                <div className="text-center text-sm text-[hsl(var(--muted-foreground))] p-4">
                  {acceptedFreelancers.length === 0
                    ? 'No freelancers with accepted bids found for this project.'
                    : 'No freelancers match your search criteria.'}
                </div>
              ) : (
                filteredFreelancers.map((freelancer) => {
                  const isSelected = selectedMembers.some(
                    (m) => m._id === freelancer._id,
                  );

                  return (
                    <div
                      key={freelancer._id}
                      onClick={() => handleToggleMember(freelancer)}
                      className="w-full flex items-center justify-start space-x-3 p-2 text-left h-auto rounded-md cursor-pointer hover:bg-[hsl(var(--accent))]"
                    >
                      <div
                        className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                          isSelected
                            ? 'bg-primary border-primary'
                            : 'border-gray-400'
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={freelancer.profilePic} />
                        <AvatarFallback>
                          {freelancer.firstName?.[0] ||
                            freelancer.userName[0]?.toUpperCase() ||
                            'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {freelancer.firstName && freelancer.lastName
                            ? `${freelancer.firstName} ${freelancer.lastName}`
                            : freelancer.userName}
                        </p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {freelancer.email}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleCreateGroup}
            disabled={
              isCreating || !groupName.trim() || selectedMembers.length === 0
            }
          >
            {isCreating ? (
              <>
                <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Project Group'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
