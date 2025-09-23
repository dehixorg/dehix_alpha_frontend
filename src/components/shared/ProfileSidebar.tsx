import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  VolumeX,
  ShieldX,
  Trash2,
  UserPlus,
  Edit3,
  Link2,
  LogOut,
  MinusCircle,
  LoaderCircle,
} from 'lucide-react';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteField,
  deleteDoc,
  collection,
  query,
  orderBy,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

import { useToast } from '../ui/use-toast';

import { AddMembersDialog } from './AddMembersDialog';
import { InviteLinkDialog } from './InviteLinkDialog';
import { ConfirmActionDialog } from './ConfirmActionDialog';
import { ChangeGroupInfoDialog } from './ChangeGroupInfoDialog';
import SharedMediaDisplay, { type MediaItem } from './SharedMediaDisplay';

export type FileItem = {
  id: string;
  name: string;
  type: string;
  size?: number | string;
  url: string;
};

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { db } from '@/config/firebaseConfig';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance'; // Import axiosInstance
import type { CombinedUser } from '@/hooks/useAllUsers';

export type ProfileUser = {
  _id: string;
  id: string;
  userName: string;
  name: string;
  email: string;
  profilePic?: string;
  bio?: string;
  displayName: string;
  status?: string;
  lastSeen?: string;
};

export type ProfileGroupMember = {
  id: string; // User's _id from API's members array
  userName: string;
  profilePic?: string;
  status?: 'online' | 'offline'; // Retain for mock display if needed
};

export type ProfileGroup = {
  _id: string; // From API
  id: string; // To be populated from _id
  groupName: string; // From API
  avatar?: string; // From API (S3 URL)
  description?: string; // From API
  createdAt: string; // ISO String from API
  members: ProfileGroupMember[]; // From API
  admins: string[]; // Array of user IDs from API
  participantDetails?: {
    [uid: string]: { userName: string; profilePic?: string; email?: string };
  }; // From API
  inviteLink?: string; // From API
  // Derived/processed fields
  displayName: string;
  createdAtFormatted?: string;
  // Placeholder for admin details if needed directly in ProfileGroup
  adminDetails?: ProfileUser[]; // Could be populated if FE needs more admin info than just IDs
};

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string | null;
  profileType: 'user' | 'group' | null;
  // currentUser prop as requested by the subtask, though it's also available via Redux store
  // We will primarily use the Redux store version for consistency within this component,
  // but including it in props if direct passing is ever preferred.
  currentUser?: CombinedUser | null;
  initialData?: { userName?: string; email?: string; profilePic?: string };
}

export function ProfileSidebar({
  isOpen,
  onClose,
  profileId,
  profileType,
  // currentUser prop is available via Redux store
  initialData,
}: ProfileSidebarProps) {
  // State management
  const [profileData, setProfileData] = useState<
    ProfileUser | ProfileGroup | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [sharedMedia, setSharedMedia] = useState<MediaItem[]>([]);
  const [, setSharedFiles] = useState<FileItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isAddMembersDialogOpen, setIsAddMembersDialogOpen] = useState(false);
  const [isChangeGroupInfoDialogOpen, setIsChangeGroupInfoDialogOpen] =
    useState(false);
  const [isInviteLinkDialogOpen, setIsInviteLinkDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [refreshDataKey, setRefreshDataKey] = useState(0);

  // Hooks
  const user = useSelector((state: RootState) => state.user);
  const { toast } = useToast();

  const [confirmDialogProps, setConfirmDialogProps] = useState({
    title: '',
    description: '',
    onConfirm: () => {},
    confirmButtonText: '', // Add missing property
    confirmButtonVariant: 'destructive' as
      | 'default'
      | 'destructive'
      | 'outline'
      | 'secondary'
      | 'ghost'
      | 'link'
      | null
      | undefined,
  });

  const internalFetchProfileData = async () => {
    setLoading(true);
    setError(null);
    // Initial population from initialData if available for users
    if (profileType === 'user' && initialData && profileId) {
      setProfileData({
        // Explicitly map to ProfileUser, ensure all required fields are present or defaulted
        _id: profileId, // Assuming profileId is the _id for users from initialData context
        id: profileId,
        userName: initialData.userName || '',
        name: initialData.userName || '', // Often name and userName are similar or name is preferred
        email: initialData.email || '',
        profilePic: initialData.profilePic,
        displayName: initialData.userName || '', // Ensure displayName is set
        // Initialize other fields as undefined or default if not in initialData
        bio: undefined,
        status: undefined,
        lastSeen: undefined,
      });
      // We might still want to set loading to true if an API call will follow to supplement data
      // setLoading(false); // Or set to false if this is considered enough initial data
    } else {
      setProfileData(null);
    }

    try {
      if (profileType === 'user' && profileId) {
        // Fetch user profile data
        const response = await axiosInstance.get(`/freelancer/${profileId}`);
        if (response.data && response.data.data) {
          const apiData = response.data.data as ProfileUser;
          setProfileData({
            ...apiData, // API data as base
            // Prioritize initialData for specific fields if initialData was provided
            userName: initialData?.userName || apiData.userName,
            email: initialData?.email || apiData.email,
            profilePic: initialData?.profilePic || apiData.profilePic,
            displayName:
              initialData?.userName || apiData.userName || apiData.displayName,
            // Ensure critical identifiers like id are correctly maintained
            id: profileId,
            _id: apiData._id || profileId, // Prefer API's _id if available, else fallback to profileId
            // name might need specific handling depending on your data structure
            name: initialData?.userName || apiData.name || apiData.userName,
          });
        } else {
          // If API call fails or returns no data, but we had initialData, retain it.
          // This part depends on whether an error should clear initialData or not.
          // For now, if initialData was set and API fails, it remains. If no initialData, then error.
          if (!initialData) {
            throw new Error('User not found and no initial data provided');
          }
        }
      } else if (profileType === 'group' && profileId) {
        // Fetch group data from Firestore
        const conversationDoc = await getDoc(
          doc(db, 'conversations', profileId),
        );
        if (conversationDoc.exists()) {
          const groupData = conversationDoc.data();
          const members = Object.entries(
            groupData.participantDetails || {},
          ).map(([id, details]: [string, any]) => ({
            id,
            userName: details.userName || 'Unknown Member',
            profilePic: details.profilePic,
            status: (Math.random() > 0.5 ? 'online' : 'offline') as
              | 'online'
              | 'offline', // Type assertion to fix the error
          }));

          // Use the avatar from initialData if available, otherwise fall back to groupData.avatar
          const avatarUrl = initialData?.profilePic || groupData.avatar;

          setProfileData({
            _id: conversationDoc.id,
            id: conversationDoc.id,
            groupName: groupData.groupName || 'Unnamed Group',
            displayName: groupData.groupName || 'Unnamed Group',
            description: groupData.description || '',
            avatar: avatarUrl, // Set the avatar URL here
            createdAt: groupData.createdAt || new Date().toISOString(),
            members,
            admins: groupData.admins || [],
            participantDetails: groupData.participantDetails,
          });
        } else {
          throw new Error('Group not found');
        }
      }
    } catch (error: any) {
      console.error('Error fetching profile data:', error);
      setError(error.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSharedMedia = async (conversationId: string) => {
    setIsLoadingMedia(true);
    setSharedMedia([]);

    try {
      // Get messages from Firestore
      const messagesQuery = query(
        collection(db, `conversations/${conversationId}/messages`),
        orderBy('timestamp', 'desc'),
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const extractedMedia: MediaItem[] = [];

      messagesSnapshot.forEach((doc) => {
        const message = doc.data();
        if (
          Array.isArray(message.attachments) &&
          message.attachments.length > 0
        ) {
          for (const attachment of message.attachments) {
            if (attachment.url && attachment.type && attachment.fileName) {
              extractedMedia.push({
                id: `${doc.id}-${attachment.fileName}`,
                url: attachment.url,
                type: attachment.type,
                fileName: attachment.fileName,
              });
            }
          }
        }
      });

      setSharedMedia(extractedMedia);
    } catch (error) {
      console.error('Error fetching shared media:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load shared media',
      });
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const fetchSharedFiles = async (conversationId: string) => {
    setIsLoadingFiles(true);
    setSharedFiles([]);

    try {
      // Get messages from Firestore
      const messagesQuery = query(
        collection(db, `conversations/${conversationId}/messages`),
        orderBy('timestamp', 'desc'),
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const extractedFiles: FileItem[] = [];

      messagesSnapshot.forEach((doc) => {
        const message = doc.data();
        if (
          Array.isArray(message.attachments) &&
          message.attachments.length > 0
        ) {
          for (const attachment of message.attachments) {
            if (attachment.url && attachment.type && attachment.fileName) {
              extractedFiles.push({
                id: `${doc.id}-${attachment.fileName}`,
                name: attachment.fileName,
                type: attachment.type,
                size: attachment.size || 'Unknown',
                url: attachment.url,
              });
            }
          }
        }
      });

      setSharedFiles(extractedFiles);
    } catch (error) {
      console.error('Error fetching shared files:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load shared files',
      });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    const executeFetches = async () => {
      if (isOpen && profileId && profileType) {
        // Initial resets for this effect run
        setProfileData(null);
        setSharedMedia([]);
        setLoading(true); // For profile data loading
        setIsLoadingMedia(true); // For media data loading

        // Run fetches in parallel
        await Promise.allSettled([
          internalFetchProfileData(), // This function will set its own setLoading(false)
          fetchSharedMedia(profileId), // This function will set its own setLoadingMedia(false)
          fetchSharedFiles(profileId), // This function will set its own setLoadingFiles(false)
        ]);

        // If one of the above functions didn't manage its loading state properly in case of an early return
        // or error, ensure they are false here. However, they should manage their own state.
        // For example, if internalFetchProfileData returns early without error but also without setting setLoading(false)
        if (loading) {
          setLoading(false);
        } // Only if still true
        if (isLoadingMedia) {
          setIsLoadingMedia(false);
        } // Only if still true
        if (isLoadingFiles) {
          setIsLoadingFiles(false);
        } // Only if still true
      } else {
        // Clear data and stop loading if sidebar is closed or essential props are missing
        setProfileData(null);
        setSharedMedia([]);
        setLoading(false);
        setIsLoadingMedia(false);
        setIsLoadingFiles(false);
      }
    };

    executeFetches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, profileId, profileType, refreshDataKey, initialData]); // Added initialData to dependency array

  const handleAddMembersToGroup = async (
    selectedUsers: CombinedUser[],
    groupId: string,
  ) => {
    if (!selectedUsers || selectedUsers.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No users selected',
        description: 'Please select users to add.',
      });
      return;
    }

    if (!groupId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Group ID is missing.',
      });
      return;
    }

    const groupDocRef = doc(db, 'conversations', groupId);

    try {
      const batch = writeBatch(db);
      const updates: any = {};
      const memberUpdates: string[] = [];

      // Prepare participant details updates
      selectedUsers.forEach((user) => {
        if (!user.id) return; // Skip if no user ID

        updates[`participantDetails.${user.id}`] = {
          userName: user.displayName || 'User',
          email: user.email || '',
          profilePic: user.profilePic || null, // Ensure profilePic is never undefined
          userType: user.userType || 'user', // Default to 'user' if not specified
        };

        memberUpdates.push(user.id);
      });

      if (Object.keys(updates).length === 0) {
        throw new Error('No valid users to add');
      }

      // Add members to the group
      updates.members = arrayUnion(...memberUpdates);
      updates.updatedAt = new Date().toISOString();

      // Update the document with all changes
      batch.update(groupDocRef, updates);
      await batch.commit();

      // Refresh the profile data to show the new members
      if (profileData && 'refreshData' in profileData) {
        await (profileData as any).refreshData();
      }

      // Update local state to reflect the changes
      setRefreshDataKey((prev) => prev + 1);

      toast({
        title: 'Success',
        description: `${selectedUsers.length} member(s) added successfully.`,
      });
    } catch (error) {
      console.error('Error adding members:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add members. Please try again.',
      });
      throw error; // Re-throw to allow caller to handle if needed
    }
  };

  const handleSaveGroupInfo = async (
    newName: string,
    newAvatarUrl: string,
    groupId: string,
  ) => {
    // ... (existing implementation)
    if (!newName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Group name cannot be empty.',
      });
      return;
    }
    if (!groupId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Group ID is missing.',
      });
      return;
    }
    const groupDocRef = doc(db, 'conversations', groupId);
    const currentGroupData = profileData as ProfileGroup;
    const updateData: {
      groupName?: string;
      name?: string;
      project_name?: string;
      avatar?: string;
      updatedAt?: string;
    } = {};
    if (newName.trim() !== currentGroupData?.displayName) {
      updateData.groupName = newName.trim();
      updateData.name = newName.trim();
      updateData.project_name = newName.trim();
    }
    if (
      newAvatarUrl !== undefined &&
      newAvatarUrl.trim() !== (currentGroupData?.avatar || '')
    ) {
      updateData.avatar = newAvatarUrl.trim();
    } else if (
      newAvatarUrl !== undefined &&
      newAvatarUrl.trim() === '' &&
      currentGroupData?.avatar
    ) {
      updateData.avatar = '';
    }
    if (Object.keys(updateData).length === 0) {
      toast({ title: 'Info', description: 'No changes were made.' });
      return;
    }
    updateData.updatedAt = new Date().toISOString();
    try {
      await updateDoc(groupDocRef, updateData);
      toast({
        title: 'Success',
        description: 'Group information updated successfully.',
      });
      setRefreshDataKey((prev) => prev + 1);
    } catch (error) {
      console.error('Error updating group info:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update group information.',
      });
    }
  };

  const handleGenerateInviteLink = async (
    groupId: string,
  ): Promise<string | null> => {
    // ... (existing implementation)
    if (!groupId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Group ID is missing.',
      });
      return null;
    }
    const randomComponent = Math.random().toString(36).substring(2, 10);
    const newInviteLink = `https://your-app.com/join/${groupId}?inviteCode=${randomComponent}`;
    const groupDocRef = doc(db, 'conversations', groupId);
    try {
      await updateDoc(groupDocRef, {
        inviteLink: newInviteLink,
        updatedAt: new Date().toISOString(),
      });
      toast({
        title: 'Success',
        description: 'New invite link generated and saved.',
      });
      setRefreshDataKey((prev) => prev + 1);
      return newInviteLink;
    } catch (error) {
      console.error('Error generating and saving invite link:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate invite link.',
      });
      return null;
    }
  };

  const handleConfirmRemoveMember = async (memberIdToRemove: string) => {
    // ... (existing implementation)
    if (!profileId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Group ID is missing.',
      });
      return;
    }
    if (!memberIdToRemove) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Member ID is missing.',
      });
      return;
    }
    const groupDocRef = doc(db, 'conversations', profileId);
    try {
      await updateDoc(groupDocRef, {
        participants: arrayRemove(memberIdToRemove),
        [`participantDetails.${memberIdToRemove}`]: deleteField(),
        updatedAt: new Date().toISOString(),
      });
      toast({ title: 'Success', description: 'Member removed successfully.' });
      setRefreshDataKey((prev) => prev + 1);
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove member.',
      });
    } finally {
      setIsConfirmDialogOpen(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    // ... (existing implementation)
    if (!groupId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Group ID is missing for deletion.',
      });
      setIsConfirmDialogOpen(false);
      return;
    }
    if (!user || !(profileData as ProfileGroup)?.admins?.includes(user.uid)) {
      toast({
        variant: 'destructive',
        title: 'Unauthorized',
        description: 'Only admins can delete groups.',
      });
      setIsConfirmDialogOpen(false);
      return;
    }
    const groupDocRef = doc(db, 'conversations', groupId);
    try {
      await deleteDoc(groupDocRef);
      toast({
        title: 'Success',
        description: 'Group has been permanently deleted.',
      });
      onClose();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete group. Please try again.',
      });
    } finally {
      setIsConfirmDialogOpen(false);
    }
  };

  if (!isOpen) return null;

  const getFallbackName = (data: ProfileUser | ProfileGroup | null): string => {
    if (!data || !data.displayName || !data.displayName.trim()) return 'P';
    return data.displayName.charAt(0).toUpperCase();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        className="w-[350px] sm:w-[400px] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-[hsl(var(--border))] p-0 flex flex-col shadow-xl"
        aria-labelledby="profile-sidebar-title"
        aria-describedby="profile-sidebar-description"
      >
        <SheetHeader className="p-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center">
            <SheetTitle
              id="profile-sidebar-title"
              className="text-[hsl(var(--card-foreground))]"
            >
              {profileType === 'user' ? 'User Profile' : 'Group Details'}
            </SheetTitle>
            <p id="profile-sidebar-description" className="sr-only">
              Displays details and actions for the selected user or group.
            </p>
          </div>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {loading && (
              <Card>
                <CardHeader className="items-center gap-2">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="h-5 w-40 mt-2" />
                  <Skeleton className="h-4 w-56 mt-1" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            )}
            {!loading && !profileData && (
              <div className="flex justify-center items-center h-32">
                <p className="text-[hsl(var(--muted-foreground))]">
                  No details to display.
                </p>
              </div>
            )}

            {!loading && profileData && (
              <>
                <Card>
                  <CardHeader className="items-center text-center">
                    <Avatar className="w-24 h-24 border-2 border-[hsl(var(--border))]">
                      {profileType === 'group' ? (
                        <AvatarImage
                          src={(profileData as ProfileGroup).avatar || ''}
                          alt={profileData.displayName}
                          onError={(e) => {
                            console.error('Error loading group avatar:', e);
                            console.log(
                              'Failed to load group avatar with src:',
                              e.currentTarget.src,
                            );
                          }}
                        />
                      ) : (
                        <AvatarImage
                          src={(profileData as ProfileUser).profilePic || ''}
                          alt={profileData.displayName}
                          onError={(e) => {
                            console.error('Error loading user avatar:', e);
                            console.log(
                              'Failed to load user avatar with src:',
                              e.currentTarget.src,
                            );
                          }}
                        />
                      )}
                      <AvatarFallback className="text-3xl">
                        {getFallbackName(profileData)}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl mt-2">
                      {profileData.displayName}
                    </CardTitle>
                    {profileType === 'user' &&
                      (profileData as ProfileUser).email && (
                        <CardDescription>
                          {(profileData as ProfileUser).email}
                        </CardDescription>
                      )}
                    {profileType === 'group' && (
                      <CardDescription>
                        {(profileData as ProfileGroup).description || (
                          <span className="italic">No group description.</span>
                        )}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>

                {profileType === 'user' && (profileData as ProfileUser) && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          User Details
                        </CardTitle>
                        <CardDescription>
                          Presence and profile info
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Status
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {(profileData as ProfileUser).status || 'Unknown'}
                          </Badge>
                        </div>
                        <Separator />
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Last Seen
                          </span>
                          <p className="text-sm">
                            {(profileData as ProfileUser).lastSeen || 'Unknown'}
                          </p>
                        </div>
                        <Separator />
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Bio
                          </span>
                          <p className="text-sm whitespace-pre-wrap">
                            {(profileData as ProfileUser).bio ||
                              'No bio available.'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Shared Media
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoadingMedia ? (
                          <div className="flex justify-center items-center h-20">
                            <LoaderCircle className="animate-spin h-6 w-6 text-[hsl(var(--primary))]" />
                          </div>
                        ) : sharedMedia.length > 0 ? (
                          <SharedMediaDisplay mediaItems={sharedMedia} />
                        ) : (
                          <div className="text-center text-sm text-[hsl(var(--muted-foreground))] p-4 border border-dashed border-[hsl(var(--border))] rounded-md">
                            <p>No media has been shared yet.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          disabled
                        >
                          <VolumeX className="h-4 w-4 mr-2" /> Mute Conversation
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          disabled
                        >
                          <ShieldX className="h-4 w-4 mr-2" /> Block User
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          disabled
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Clear Chat
                        </Button>
                        <Button
                          variant="destructive"
                          className="w-full justify-start"
                          disabled
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Chat
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {profileType === 'group' && (profileData as ProfileGroup) && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Group Info</CardTitle>
                        {(profileData as ProfileGroup).createdAtFormatted && (
                          <CardDescription>
                            Created:{' '}
                            {(profileData as ProfileGroup).createdAtFormatted}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        {(profileData as ProfileGroup).admins && (
                          <div className="text-xs text-muted-foreground">
                            Admins:{' '}
                            {(profileData as ProfileGroup).admins.length}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Members (
                          {(profileData as ProfileGroup).members.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="max-h-60 px-4">
                          <ul className="space-y-1 py-2">
                            {(profileData as ProfileGroup).members.map(
                              (member) => (
                                <li
                                  key={member.id}
                                  className="flex items-center gap-3 p-1 rounded-md hover:bg-[hsl(var(--accent)_/_0.5)] group"
                                >
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage
                                      src={member.profilePic}
                                      alt={member.userName}
                                    />
                                    <AvatarFallback>
                                      {member.userName?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium truncate">
                                      {member.userName}
                                    </span>
                                    {(
                                      profileData as ProfileGroup
                                    ).admins?.includes(member.id) && (
                                      <Badge
                                        variant="outline"
                                        className="ml-2 text-[10px]"
                                      >
                                        Admin
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-400 ml-1 mr-2 group-hover:text-[hsl(var(--foreground))]">
                                    {member.status === 'online'
                                      ? 'Online'
                                      : 'Offline'}
                                  </span>
                                  {user &&
                                    (
                                      profileData as ProfileGroup
                                    ).admins?.includes(user.uid) &&
                                    member.id !== user.uid &&
                                    !(
                                      profileData as ProfileGroup
                                    ).admins?.includes(member.id) && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="ml-auto h-7 w-7 text-gray-400 hover:text-red-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setConfirmDialogProps({
                                            title: 'Confirm Removal',
                                            description: `Are you sure you want to remove ${member.userName} from the group?`,
                                            onConfirm: () =>
                                              handleConfirmRemoveMember(
                                                member.id,
                                              ),
                                            confirmButtonText: 'Remove Member',
                                            confirmButtonVariant: 'destructive',
                                          });
                                          setIsConfirmDialogOpen(true);
                                        }}
                                        aria-label={`Remove ${member.userName} from group`}
                                      >
                                        <MinusCircle className="h-4 w-4" />
                                      </Button>
                                    )}
                                </li>
                              ),
                            )}
                          </ul>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Shared Media
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoadingMedia ? (
                          <div className="flex justify-center items-center h-20">
                            <LoaderCircle className="animate-spin h-6 w-6 text-[hsl(var(--primary))]" />
                          </div>
                        ) : sharedMedia.length > 0 ? (
                          <SharedMediaDisplay mediaItems={sharedMedia} />
                        ) : (
                          <div className="text-center text-sm text-[hsl(var(--muted-foreground))] p-4 border border-dashed border-[hsl(var(--border))] rounded-md">
                            <p>No media or files have been shared yet.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {user &&
                          (profileData as ProfileGroup).admins?.includes(
                            user.uid,
                          ) && (
                            <>
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => setIsAddMembersDialogOpen(true)}
                              >
                                <UserPlus className="h-4 w-4 mr-2" /> Add/Remove
                                Members
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() =>
                                  setIsChangeGroupInfoDialogOpen(true)
                                }
                              >
                                <Edit3 className="h-4 w-4 mr-2" /> Change Group
                                Name or Avatar
                              </Button>
                              {(profileData as ProfileGroup).inviteLink !==
                                undefined && (
                                <Button
                                  variant="outline"
                                  className="w-full justify-start"
                                  onClick={() =>
                                    setIsInviteLinkDialogOpen(true)
                                  }
                                >
                                  <Link2 className="h-4 w-4 mr-2" /> Invite Link
                                </Button>
                              )}
                            </>
                          )}
                        <Button
                          variant="destructive"
                          className="w-full justify-start"
                          onClick={() => {
                            setConfirmDialogProps({
                              title: 'Leave Group',
                              description:
                                'Are you sure you want to leave this group?',
                              onConfirm: async () => {
                                try {
                                  if (
                                    profileType === 'group' &&
                                    profileId &&
                                    user?.uid
                                  ) {
                                    // Remove user from the group
                                    const groupRef = doc(
                                      db,
                                      'conversations',
                                      profileId,
                                    );
                                    await updateDoc(groupRef, {
                                      [`participantDetails.${user.uid}`]:
                                        deleteField(),
                                      members: arrayRemove(user.uid),
                                      admins: arrayRemove(user.uid),
                                    });

                                    // Close the profile sidebar
                                    onClose();

                                    toast({
                                      title: 'Left group',
                                      description:
                                        'You have left the group successfully.',
                                    });
                                  }
                                } catch (error) {
                                  console.error('Error leaving group:', error);
                                  toast({
                                    title: 'Error',
                                    description:
                                      'Failed to leave the group. Please try again.',
                                    variant: 'destructive',
                                  });
                                }
                              },
                              confirmButtonText: 'Leave',
                              confirmButtonVariant: 'destructive',
                            });
                            setIsConfirmDialogOpen(true);
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" /> Leave Group
                        </Button>
                        {user &&
                          (profileData as ProfileGroup).admins?.includes(
                            user.uid,
                          ) && (
                            <Button
                              variant="destructive"
                              className="w-full justify-start"
                              onClick={() => {
                                if (profileData && profileType === 'group') {
                                  setConfirmDialogProps({
                                    title: 'Delete Group Permanently?',
                                    description:
                                      'This action cannot be undone. All messages, members, and group information will be permanently lost. Are you absolutely sure you want to delete this group?',
                                    onConfirm: () =>
                                      handleDeleteGroup(
                                        (profileData as ProfileGroup).id,
                                      ),
                                    confirmButtonText: 'Yes, Delete This Group',
                                    confirmButtonVariant: 'destructive',
                                  });
                                  setIsConfirmDialogOpen(true);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete Group
                            </Button>
                          )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
      {profileData && profileType === 'group' && (
        <>
          <AddMembersDialog
            isOpen={isAddMembersDialogOpen}
            onClose={() => setIsAddMembersDialogOpen(false)}
            onAddMembers={(selectedUserIds) => {
              if (profileData && profileData.id && profileType === 'group') {
                handleAddMembersToGroup(
                  selectedUserIds,
                  (profileData as ProfileGroup).id,
                );
              }
              setIsAddMembersDialogOpen(false);
            }}
            currentMemberIds={
              (profileData as ProfileGroup).members?.map((m) => m.id) || []
            }
            groupId={(profileData as ProfileGroup).id}
          />
          <ChangeGroupInfoDialog
            isOpen={isChangeGroupInfoDialogOpen}
            onClose={() => setIsChangeGroupInfoDialogOpen(false)}
            onSave={(newName, newAvatarUrl) => {
              if (profileData && profileData.id && profileType === 'group') {
                handleSaveGroupInfo(
                  newName,
                  newAvatarUrl,
                  (profileData as ProfileGroup).id,
                );
              }
            }}
            currentName={(profileData as ProfileGroup).displayName || ''}
            currentAvatarUrl={(profileData as ProfileGroup).avatar}
            groupId={(profileData as ProfileGroup).id}
          />
          <InviteLinkDialog
            isOpen={isInviteLinkDialogOpen}
            onClose={() => setIsInviteLinkDialogOpen(false)}
            onGenerateLink={async () => {
              if (profileData && profileData.id && profileType === 'group') {
                return handleGenerateInviteLink(
                  (profileData as ProfileGroup).id,
                );
              }
              return null;
            }}
            currentInviteLink={(profileData as ProfileGroup).inviteLink}
            groupName={(profileData as ProfileGroup).displayName || 'the group'}
          />
          <ConfirmActionDialog
            isOpen={isConfirmDialogOpen}
            onClose={() => setIsConfirmDialogOpen(false)}
            {...confirmDialogProps}
          />
        </>
      )}
    </Sheet>
  );
}

export default ProfileSidebar;
