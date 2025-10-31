import React, { useState, useEffect, useRef } from 'react';
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
  ChevronLeft,
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
  where,
  getFirestore,
  serverTimestamp,
  FieldValue,
} from 'firebase/firestore';

import { AddMembersDialog } from './AddMembersDialog';
import { InviteLinkDialog } from './InviteLinkDialog';
import { ConfirmActionDialog } from './ConfirmActionDialog';
import { ChangeGroupInfoDialog } from './ChangeGroupInfoDialog';
import SharedMediaDisplay, { type MediaItem } from './SharedMediaDisplay';
import { Conversation } from './chatList';

// Simple file item type for shared files list
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
import { useToast } from '@/hooks/use-toast';
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
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
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
  mutedUsers?: string[];
};

export type ProfileGroupMember = {
  id: string;
  userName: string;
  profilePic?: string;
  status?: 'online' | 'offline';
};

export type ProfileGroup = {
  _id: string;
  id: string;
  groupName: string;
  avatar?: string;
  description?: string;
  createdAt: string;
  members: ProfileGroupMember[];
  admins: string[];
  participantDetails?: {
    [uid: string]: { userName: string; profilePic?: string; email?: string };
  };
  inviteLink?: string;
  displayName: string;
  createdAtFormatted?: string;
  adminDetails?: ProfileUser[];
  mutedUsers?: string[];
};

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string | null;
  profileType: 'user' | 'group' | null;
  currentUser?: CombinedUser | null;
  initialData?: { userName?: string; email?: string; profilePic?: string };
  onConversationUpdate?: (conv: any) => void;
}

export function ProfileSidebar({
  isOpen,
  onClose,
  profileId,
  profileType,
  initialData,
  onConversationUpdate,
}: ProfileSidebarProps) {
  // State management
  const [profileData, setProfileData] = useState<
    ProfileUser | ProfileGroup | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [sharedMedia, setSharedMedia] = useState<MediaItem[]>([]);
  const [sharedFiles, setSharedFiles] = useState<FileItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [showAllMedia, setShowAllMedia] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAddMembersDialogOpen, setIsAddMembersDialogOpen] = useState(false);

  // State for inline editing
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState('');
  const [isChangeGroupInfoDialogOpen, setIsChangeGroupInfoDialogOpen] =
    useState(false);
  const [isInviteLinkDialogOpen, setIsInviteLinkDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [blockStatus, setBlockStatus] = useState<{
    isBlocked: boolean;
    blockedBy: string | null;
  }>({ isBlocked: false, blockedBy: null });

  // Guard to avoid duplicate saves from overlapping events
  const isSavingRef = useRef(false);

  // Handle field edit start
  const handleFieldClick = (field: string, currentValue: string = '') => {
    setEditingField(field);
    setEditedValue(currentValue);
  };

  // Handle saving the edited field
  const handleSaveField = async () => {
    if (!editingField || !profileData) return;

    // Only allow editing own profile
    if (profileType === 'user' && user?.uid !== profileData.id) {
      toast({
        title: 'Unauthorized',
        description: 'You can only edit your own profile.',
        variant: 'destructive',
      });
      setEditingField(null);
      return;
    }

    // Validate input
    const trimmedValue = editedValue.trim();
    if (!trimmedValue && editingField === 'displayName') {
      toast({
        title: 'Validation Error',
        description: 'Display name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    if (
      editingField === 'email' &&
      trimmedValue &&
      !trimmedValue.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    // Store original value for revert
    const originalValue = (profileData as any)[editingField];

    if (isSavingRef.current) return;
    isSavingRef.current = true;

    try {
      // Update the profile data in the state
      setProfileData({
        ...profileData,
        [editingField]: trimmedValue,
      });

      // Send update to the server
      await axiosInstance.patch(`/freelancer/${profileData.id}`, {
        [editingField]: trimmedValue,
      });

      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved successfully.',
      });

      setEditingField(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });

      // Revert the changes in the UI if the API call fails
      setProfileData({
        ...profileData,
        [editingField]: originalValue,
      });
    } finally {
      isSavingRef.current = false;
    }
  };

  // Handle key down events (Enter to save, Escape to cancel)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveField();
    } else if (e.key === 'Escape') {
      setEditingField(null);
    }
  };

  // Hooks
  const user = useSelector((state: RootState) => state.user);

  const [confirmDialogProps, setConfirmDialogProps] = useState({
    title: '',
    description: '',
    onConfirm: () => {},
    confirmButtonText: 'Confirm',
    confirmButtonVariant: 'destructive' as
      | 'default'
      | 'destructive'
      | 'outline'
      | 'secondary'
      | 'ghost'
      | 'link'
      | null
      | undefined,
    isLoading: false,
  });

  const { toast } = useToast();
  const db = getFirestore();

  const internalFetchProfileData = async () => {
    setLoading(true);
    setError(null);

    if (profileType === 'user' && initialData && profileId) {
      setProfileData({
        _id: profileId,
        id: profileId,
        userName: initialData.userName || '',
        name: initialData.userName || '',
        email: initialData.email || '',
        profilePic: initialData.profilePic,
        displayName: initialData.userName || '',
        bio: undefined,
        status: undefined,
        lastSeen: undefined,
      });
    } else {
      setProfileData(null);
    }

    try {
      if (profileType === 'user' && profileId) {
        const response = await axiosInstance.get(`/freelancer/${profileId}`);
        if (response.data && response.data.data) {
          const apiData = response.data.data as ProfileUser;
          setProfileData({
            ...apiData,
            userName: initialData?.userName || apiData.userName,
            email: initialData?.email || apiData.email,
            profilePic: initialData?.profilePic || apiData.profilePic,
            displayName:
              initialData?.userName || apiData.userName || apiData.displayName,
            id: profileId,
            _id: apiData._id || profileId,
            name: initialData?.userName || apiData.name || apiData.userName,
          });
        } else {
          if (!initialData) {
            throw new Error('User not found and no initial data provided');
          }
        }
      } else if (profileType === 'group' && profileId) {
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
              | 'offline',
          }));

          const avatarUrl = initialData?.profilePic || groupData.avatar;

          setProfileData({
            _id: conversationDoc.id,
            id: conversationDoc.id,
            groupName: groupData.groupName || 'Unnamed Group',
            displayName: groupData.groupName || 'Unnamed Group',
            description: groupData.description || '',
            avatar: avatarUrl,
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
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSharedMedia = async (conversationId: string) => {
    setIsLoadingMedia(true);
    setSharedMedia([]);

    try {
      const messagesRef = collection(
        db,
        `conversations/${conversationId}/messages`,
      );
      const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'));
      const messagesSnapshot = await getDocs(messagesQuery);
      const extractedMedia: MediaItem[] = [];

      const s3BucketUrl = process.env.NEXT_PUBLIC_S3_BUCKET_URL ?? '';

      messagesSnapshot.forEach((doc) => {
        const message = doc.data();
        let mediaUrl = '';

        if (
          message.voiceMessage &&
          typeof message.content === 'string' &&
          message.content.startsWith(s3BucketUrl)
        ) {
          mediaUrl = message.content;
        } else if (
          typeof message.content === 'string' &&
          s3BucketUrl &&
          message.content.startsWith(s3BucketUrl)
        ) {
          mediaUrl = message.content;
        }

        if (mediaUrl) {
          try {
            const url = new URL(mediaUrl);
            const fileName = decodeURIComponent(url.pathname.substring(1));
            const fileExtension =
              fileName.split('.').pop()?.toLowerCase() || '';
            let type = 'application/octet-stream';

            if (message.voiceMessage) {
              type = 'audio/webm';
            } else {
              const mimeTypes: { [key: string]: string } = {
                png: 'image/png',
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                gif: 'image/gif',
                mp4: 'video/mp4',
                webm: 'video/webm',
                mp3: 'audio/mpeg',
                wav: 'audio/wav',
                pdf: 'application/pdf',
                pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                ppt: 'application/vnd.ms-powerpoint',
                docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                doc: 'application/msword',
              };
              type = mimeTypes[fileExtension] || 'application/octet-stream';
            }

            extractedMedia.push({
              id: `${doc.id}-${fileName}`,
              url: mediaUrl,
              type: type,
              fileName: fileName,
            });
          } catch (e) {
            console.error('Could not parse media URL:', e);
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

  const fetchBlockStatus = async (targetUserId: string) => {
    if (!user?.uid) return;

    setBlockStatus({ isBlocked: false, blockedBy: null });
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('type', '==', 'individual'),
      where('participants', 'array-contains', user.uid),
    );

    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        if (doc.data().participants.includes(targetUserId)) {
          const conversationData = doc.data();
          if (conversationData.blocked?.status === true) {
            setBlockStatus({
              isBlocked: true,
              blockedBy: conversationData.blocked.by,
            });
          }
        }
      });
    } catch (error) {
      console.error('Error fetching block status:', error);
    }
  };

  useEffect(() => {
    const executeFetches = async () => {
      if (isOpen && profileId) {
        setProfileData(null);
        setSharedMedia([]);
        setSharedFiles([]);
        setLoading(true);
        setIsLoadingMedia(true);
        setIsLoadingFiles(true);

        await Promise.allSettled([
          internalFetchProfileData(),
          fetchSharedMedia(profileId),
          fetchSharedFiles(profileId),
          profileType === 'user'
            ? fetchBlockStatus(profileId)
            : Promise.resolve(),
        ]);

        if (loading) {
          setLoading(false);
        }
        if (isLoadingMedia) {
          setIsLoadingMedia(false);
        }
        if (isLoadingFiles) {
          setIsLoadingFiles(false);
        }
      }
    };

    executeFetches();
  }, [isOpen, profileId, profileType, refreshKey]);

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
      const updates: any = {
        participants: arrayUnion(...selectedUsers.map((user) => user.id)),
        updatedAt: serverTimestamp(),
      };

      selectedUsers.forEach((user) => {
        if (!user.id) return;

        updates[`participantDetails.${user.id}`] = {
          userName: user.displayName || 'User',
          email: user.email || '',
          profilePic: user.profilePic || null,
          userType: user.userType || 'user',
        };
      });

      await updateDoc(groupDocRef, updates);
      setRefreshKey((prev) => prev + 1);

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
    }
  };

  const handleSaveGroupInfo = async (
    newName: string,
    newAvatarUrl: string,
    groupId: string,
  ) => {
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
      updatedAt?: string | FieldValue;
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
    updateData.updatedAt = serverTimestamp();
    try {
      await updateDoc(groupDocRef, updateData);
      toast({
        title: 'Success',
        description: 'Group information updated successfully.',
      });
      setRefreshKey((prev) => prev + 1);
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
        updatedAt: serverTimestamp(),
      });
      toast({
        title: 'Success',
        description: 'New invite link generated and saved.',
      });
      setRefreshKey((prev) => prev + 1);
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
        updatedAt: serverTimestamp(),
      });
      toast({ title: 'Success', description: 'Member removed successfully.' });
      setRefreshKey((prev) => prev + 1);
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

  const handleToggleBlockChat = async (
    targetUserId: string,
    block: boolean,
  ) => {
    if (!user?.uid || !targetUserId || !onConversationUpdate) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User information is missing.',
      });
      return;
    }

    // Set loading state
    setConfirmDialogProps((prev) => ({ ...prev, isLoading: true }));

    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('type', '==', 'individual'),
      where('participants', 'array-contains', user.uid),
    );

    let conversationDocToUpdate: any;
    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        if (doc.data().participants.includes(targetUserId)) {
          conversationDocToUpdate = doc;
        }
      });

      if (!conversationDocToUpdate) {
        toast({
          variant: 'destructive',
          title: 'Cannot Block',
          description: 'A direct 1-on-1 chat must exist to block this user.',
        });
        setConfirmDialogProps((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      const conversationDocRef = doc(
        db,
        'conversations',
        conversationDocToUpdate.id,
      );

      if (block) {
        await updateDoc(conversationDocRef, {
          blocked: { status: true, by: user.uid },
        });
        setBlockStatus({ isBlocked: true, blockedBy: user.uid });
        toast({
          title: 'Chat Blocked',
          description: 'You will no longer receive messages in this chat.',
        });
      } else {
        await updateDoc(conversationDocRef, {
          blocked: deleteField(),
        });
        setBlockStatus({ isBlocked: false, blockedBy: null });
        toast({
          title: 'Chat Unblocked',
          description: 'You can now message in this chat.',
        });
      }

      const currentConvData = (
        await getDoc(conversationDocRef)
      ).data() as Conversation;
      onConversationUpdate({ ...currentConvData, id: conversationDocRef.id });
    } catch (error) {
      console.error('Error updating block status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update block status.',
      });
      setConfirmDialogProps((prev) => ({ ...prev, isLoading: false }));
    } finally {
      setConfirmDialogProps((prev) => ({ ...prev, isLoading: false }));
      setIsConfirmDialogOpen(false);
    }
  };

  const getFallbackName = (data: ProfileUser | ProfileGroup | null): string => {
    if (!data || !data.displayName || !data.displayName.trim()) return 'P';
    return data.displayName.charAt(0).toUpperCase();
  };

  if (showAllMedia) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent
          className="w-[350px] sm:w-[400px] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-[hsl(var(--border))] p-0 flex flex-col shadow-xl"
          aria-labelledby="profile-sidebar-title"
          aria-describedby="profile-sidebar-description"
        >
          <SheetHeader className="p-4 border-b border-[hsl(var(--border))] flex-row items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => setShowAllMedia(false)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <SheetTitle
              id="profile-sidebar-title"
              className="text-[hsl(var(--card-foreground))]"
            >
              Shared Media
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1">
            <div className="p-4">
              <SharedMediaDisplay mediaItems={sharedMedia} isExpanded />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

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
                          }}
                        />
                      ) : (
                        <AvatarImage
                          src={(profileData as ProfileUser).profilePic || ''}
                          alt={profileData.displayName}
                          onError={(e) => {
                            console.error('Error loading user avatar:', e);
                          }}
                        />
                      )}
                      <AvatarFallback className="text-3xl">
                        {getFallbackName(profileData)}
                      </AvatarFallback>
                    </Avatar>
                    {editingField === 'displayName' ? (
                      <input
                        type="text"
                        className="text-xl font-semibold bg-transparent border-b border-primary focus:outline-none focus:border-primary w-full text-center"
                        value={editedValue}
                        onChange={(e) => setEditedValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    ) : (
                      <CardTitle
                        className="text-xl mt-2 cursor-pointer hover:bg-accent/50 px-2 py-1 rounded"
                        onClick={() =>
                          handleFieldClick(
                            'displayName',
                            profileData.displayName,
                          )
                        }
                      >
                        {profileData.displayName}
                      </CardTitle>
                    )}
                    {profileType === 'user' &&
                      (profileData as ProfileUser).email &&
                      (editingField === 'email' ? (
                        <input
                          type="email"
                          className="text-sm text-muted-foreground bg-transparent border-b border-primary focus:outline-none focus:border-primary w-full text-center"
                          value={editedValue}
                          onChange={(e) => setEditedValue(e.target.value)}
                          onBlur={handleSaveField}
                          onKeyDown={handleKeyDown}
                        />
                      ) : (
                        <CardDescription
                          className="cursor-pointer hover:bg-accent/50 px-2 py-1 rounded inline-block"
                          onClick={() =>
                            handleFieldClick(
                              'email',
                              (profileData as ProfileUser).email || '',
                            )
                          }
                        >
                          {(profileData as ProfileUser).email}
                        </CardDescription>
                      ))}
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
                          {editingField === 'bio' ? (
                            <textarea
                              className="w-full p-2 text-sm text-foreground bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              value={editedValue}
                              onChange={(e) => setEditedValue(e.target.value)}
                              onBlur={() => {
                                if (isSavingRef.current) return;
                                handleSaveField();
                              }}
                              onKeyDown={(e) => {
                                if (isSavingRef.current) return;
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSaveField();
                                } else if (e.key === 'Escape') {
                                  setEditingField(null);
                                }
                              }}
                              rows={3}
                            />
                          ) : (
                            <p
                              className="text-sm text-[hsl(var(--foreground))] whitespace-pre-wrap cursor-pointer hover:bg-accent/50 p-2 rounded"
                              onClick={() =>
                                handleFieldClick(
                                  'bio',
                                  (profileData as ProfileUser).bio || '',
                                )
                              }
                            >
                              {(profileData as ProfileUser).bio ||
                                'Click to add a bio...'}
                            </p>
                          )}
                        </div>
                        <div>
                          <div className="flex justify-between items-center mt-4 mb-2">
                            <h3 className="text-sm font-medium text-[hsl(var(--foreground))]">
                              Shared Media
                            </h3>
                            {sharedMedia.length > 4 && (
                              <Button
                                variant="link"
                                className="h-auto p-0"
                                onClick={() => setShowAllMedia(true)}
                              >
                                View All
                              </Button>
                            )}
                          </div>
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
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Shared Files
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoadingFiles ? (
                          <div className="flex justify-center items-center h-20">
                            <LoaderCircle className="animate-spin h-6 w-6 text-[hsl(var(--primary))]" />
                          </div>
                        ) : sharedFiles.length > 0 ? (
                          <ul className="space-y-2">
                            {sharedFiles.map((file) => (
                              <li
                                key={file.id}
                                className="flex items-center justify-between border rounded-md p-2"
                              >
                                <div className="min-w-0 mr-2">
                                  <p className="text-sm font-medium truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {file.type}
                                    {file.size ? ` • ${file.size}` : ''}
                                  </p>
                                </div>
                                <div className="shrink-0 flex items-center gap-2">
                                  <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="hover:bg-accent hover:text-accent-foreground"
                                  >
                                    <a
                                      href={file.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Open
                                    </a>
                                  </Button>
                                  <Button asChild size="sm">
                                    <a href={file.url} download>
                                      Download
                                    </a>
                                  </Button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-center text-sm text-[hsl(var(--muted-foreground))] p-4 border border-dashed border-[hsl(var(--border))] rounded-md">
                            <p>No files have been shared yet.</p>
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
                          className="w-full justify-start hover:bg-accent hover:text-accent-foreground"
                          disabled
                        >
                          <VolumeX className="h-4 w-4 mr-2" /> Mute Conversation
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:border-[hsl(var(--destructive))]"
                          disabled={
                            blockStatus.isBlocked &&
                            blockStatus.blockedBy !== user?.uid
                          }
                          onClick={() => {
                            if (profileId && onConversationUpdate) {
                              const isCurrentlyBlocked =
                                blockStatus.isBlocked &&
                                blockStatus.blockedBy === user?.uid;
                              setConfirmDialogProps({
                                title: isCurrentlyBlocked
                                  ? 'Unblock this Chat?'
                                  : 'Block this Chat?',
                                description: isCurrentlyBlocked
                                  ? 'Unblocking will allow both of you to send messages in this chat again. Are you sure?'
                                  : 'Blocking will prevent both of you from sending messages in this 1-on-1 chat. Do you want to block it?',
                                onConfirm: () =>
                                  handleToggleBlockChat(
                                    profileId,
                                    !isCurrentlyBlocked,
                                  ),
                                confirmButtonText: isCurrentlyBlocked
                                  ? 'Unblock Chat'
                                  : 'Block Chat',
                                confirmButtonVariant: 'destructive',
                                isLoading: false,
                              });
                              setIsConfirmDialogOpen(true);
                            }
                          }}
                        >
                          <ShieldX className="h-4 w-4 mr-2" />
                          {blockStatus.isBlocked &&
                          blockStatus.blockedBy === user?.uid
                            ? 'Unblock User'
                            : blockStatus.isBlocked
                              ? 'Blocked by User'
                              : 'Block User'}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start hover:bg-accent hover:text-accent-foreground"
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
                          {(profileData as ProfileGroup).members?.length || 0})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="max-h-80 px-2 overflow-y-auto">
                          {(profileData as ProfileGroup).members?.length ? (
                            <ul className="divide-y divide-gray-200 bg-white dark:bg-gray-900 rounded-lg shadow-sm py-2">
                              {(profileData as ProfileGroup).members.map(
                                (member) => {
                                  const group = profileData as ProfileGroup;
                                  const isCurrentUserAdmin =
                                    user && group.admins?.includes(user.uid);
                                  const isMemberAdmin = group.admins?.includes(
                                    member.id,
                                  );
                                  const canPerformAction =
                                    isCurrentUserAdmin &&
                                    user.uid !== member.id;

                                  return (
                                    <li
                                      key={member.id}
                                      className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 group"
                                    >
                                      <Avatar className="w-8 h-8">
                                        <AvatarImage
                                          src={member.profilePic}
                                          alt={member.userName}
                                        />
                                        <AvatarFallback>
                                          {member.userName
                                            ?.charAt(0)
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span
                                        className={`h-2 w-2 rounded-full mr-1 mt-0.5 ${
                                          member.status === 'online'
                                            ? 'bg-green-500'
                                            : 'bg-gray-400'
                                        }`}
                                      ></span>
                                      <div className="flex-1 min-w-0">
                                        <span className="text-sm font-medium truncate">
                                          {member.userName}
                                        </span>
                                        {isMemberAdmin && (
                                          <Badge
                                            variant="outline"
                                            className="ml-2 text-[10px] border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-300 border"
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
                                      {canPerformAction && !isMemberAdmin && (
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
                                              confirmButtonText:
                                                'Remove Member',
                                              confirmButtonVariant:
                                                'destructive',
                                              isLoading: false,
                                            });
                                            setIsConfirmDialogOpen(true);
                                          }}
                                          aria-label={`Remove ${member.userName} from group`}
                                        >
                                          <MinusCircle className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </li>
                                  );
                                },
                              )}
                            </ul>
                          ) : (
                            <div className="text-center text-sm text-[hsl(var(--muted-foreground))] p-4">
                              No members found
                            </div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">
                          Shared Media
                        </CardTitle>
                        {sharedMedia.length > 4 && (
                          <Button
                            variant="link"
                            onClick={() => setShowAllMedia(true)}
                          >
                            View All
                          </Button>
                        )}
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
                                className="w-full justify-start hover:bg-accent hover:text-accent-foreground"
                                onClick={() => setIsAddMembersDialogOpen(true)}
                              >
                                <UserPlus className="h-4 w-4 mr-2" /> Add/Remove
                                Members
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full justify-start hover:bg-accent hover:text-accent-foreground"
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
                                  className="w-full justify-start hover:bg-accent hover:text-accent-foreground"
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
                                    const groupRef = doc(
                                      db,
                                      'conversations',
                                      profileId,
                                    );
                                    await updateDoc(groupRef, {
                                      [`participantDetails.${user.uid}`]:
                                        deleteField(),
                                      participants: arrayRemove(user.uid),
                                      admins: arrayRemove(user.uid),
                                      updatedAt: serverTimestamp(),
                                    });

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
                              isLoading: false,
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
                                    isLoading: false,
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
        </>
      )}
      <ConfirmActionDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        {...confirmDialogProps}
      />
    </Sheet>
  );
}

export default ProfileSidebar;
