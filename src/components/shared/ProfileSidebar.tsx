import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, VolumeX, ShieldX, Trash2, UserPlus, Edit3, Link2, LogOut, Users, MinusCircle, Volume2, LoaderCircle } from "lucide-react"; // Added LoaderCircle
import { cn } from '@/lib/utils';
import { db } from '@/config/firebaseConfig';
import { doc, getDoc, DocumentData, updateDoc, arrayUnion, arrayRemove, deleteField, deleteDoc } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { axiosInstance } from '@/lib/axiosinstance'; // Import axiosInstance

import { AddMembersDialog } from './AddMembersDialog';
import { ChangeGroupInfoDialog } from './ChangeGroupInfoDialog';
import { InviteLinkDialog } from './InviteLinkDialog';
import { ConfirmActionDialog } from './ConfirmActionDialog';
import { SharedMediaDisplay, type MediaItem } from './SharedMediaDisplay';
import type { CombinedUser } from '@/hooks/useAllUsers'; // Import CombinedUser

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
  id: string;          // User's _id from API's members array
  userName: string;
  profilePic?: string;
  status?: 'online' | 'offline'; // Retain for mock display if needed
};

export type ProfileGroup = {
  _id: string;         // From API
  id: string;          // To be populated from _id
  groupName: string;   // From API
  avatar?: string;      // From API (S3 URL)
  description?: string; // From API
  createdAt: string;     // ISO String from API
  members: ProfileGroupMember[]; // From API
  admins: string[];      // Array of user IDs from API
  participantDetails?: { [uid: string]: { userName: string; profilePic?: string; email?: string } }; // From API
  inviteLink?: string;  // From API
  // Derived/processed fields
  displayName: string;
  createdAtFormatted?: string;
};

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string | null;
  profileType: 'user' | 'group' | null;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ isOpen, onClose, profileId, profileType }) => {
  const [profileData, setProfileData] = useState<ProfileUser | ProfileGroup | null>(null);
  const [loading, setLoading] = useState(false);
  const currentUser = useSelector((state: RootState) => state.user);
  const { toast } = useToast();

  const [isAddMembersDialogOpen, setIsAddMembersDialogOpen] = useState(false);
  const [isChangeGroupInfoDialogOpen, setIsChangeGroupInfoDialogOpen] = useState(false);
  const [isInviteLinkDialogOpen, setIsInviteLinkDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmDialogProps, setConfirmDialogProps] = useState({
    title: '',
    description: '',
    onConfirm: () => {},
    confirmButtonVariant: 'destructive' as "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined,
  });

  const [refreshDataKey, setRefreshDataKey] = useState(0);
  const [sharedMedia, setSharedMedia] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState<boolean>(false);

  const internalFetchProfileData = async () => {
    // This function will now only fetch profile data.
    // Media fetching and its state resets will be handled by fetchSharedMedia or useEffect.
    // Reset profile-specific states
    setProfileData(null);
    // setLoading(true) will be called by the useEffect orchestrator

    if (!profileId || !profileType) { // isOpen is checked by the caller (useEffect)
      // toast({ title: "Debug", description: "internalFetchProfileData: missing profileId or profileType" });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (profileType === 'user') {
        let apiResponse;
        let userDataFromApi: any = null;

        try {
          const response = await axiosInstance.get(`/freelancer/${profileId}`);
          if (response.data && response.data.status === 'success' && response.data.data) {
            userDataFromApi = response.data.data;
          } else {
            // Handle cases where API call succeeded but response.data.status is not 'success' or data is missing
            console.warn(`User data not found or in unexpected format for ID: ${profileId}`, response.data);
            toast({ title: "User Profile Not Found", description: `Could not load a profile for ID: ${profileId}. Data format issue.` });
            setProfileData(null); // Explicitly set to null
            // userDataFromApi remains null, so the 'else' block below will also be hit, which is fine.
          }
        } catch (error: any) {
          console.error(`Error fetching user from /freelancer/${profileId}:`, error.message);
          if (error.response && error.response.status === 404) {
            toast({ title: "User Profile Not Found", description: `No freelancer profile found for ID: ${profileId}.` });
          } else {
            toast({ variant: "destructive", title: "Error", description: "Failed to fetch user profile." });
          }
          setProfileData(null); // Explicitly set to null on error
          // userDataFromApi remains null
        }

        if (userDataFromApi) { // This block will only run if userDataFromApi was successfully populated
          const mappedUser: ProfileUser = {
            _id: userDataFromApi._id,
            id: userDataFromApi._id,
            userName: userDataFromApi.userName || '',
            name: userDataFromApi.name || '',
            email: userDataFromApi.email || 'No email provided',
            profilePic: userDataFromApi.profilePic,
            bio: userDataFromApi.bio,
            displayName: userDataFromApi.userName || userDataFromApi.name || 'Unknown User',
            status: 'Online',
            lastSeen: 'Just now',
          };
          setProfileData(mappedUser);
        } else {
          // console.warn(`User profile not found for ID: ${profileId} from any endpoint.`); // This console warn is less relevant now
          // The specific toasts for 404 or data format issues are handled in the try/catch/if-else above.
          // If userDataFromApi is still null here, it means an error occurred and was handled, or data was invalid.
          // setProfileData(null) was already called in those error/issue paths.
          if (!userDataFromApi && profileId) { // Redundant check now, but harmless. The toast for not found is in catch.
             // console.log("Final check: userDataFromApi is null"); // For debugging if needed
          }
          // setProfileData(null); // Already handled if errors occurred. If successful, it's set above.
        }
      } else if (profileType === 'group') {
        // setLoading(true); // Already set at the beginning of the function
        // setProfileData(null); // Already set at the beginning of the function
        try {
          const response = await axiosInstance.get(`/conversations/${profileId}`);
          if (response.data && response.data.data) { // Assuming data is nested under a 'data' key
            const groupDataFromApi = response.data.data;

            // Map API response to ProfileGroup type
            const membersFromApi = (groupDataFromApi.members || []).map((member: any) => ({
              id: member.id || member._id, // API might use 'id' or '_id' for members
              userName: member.userName || 'Unknown Member',
              profilePic: member.profilePic,
              status: Math.random() > 0.5 ? 'online' : 'offline', // Keep mock status for now
            }));

            let formattedCreatedAt = 'N/A';
            if (groupDataFromApi.createdAt) {
              // Assuming createdAt is an ISO string from API
              formattedCreatedAt = new Date(groupDataFromApi.createdAt).toLocaleDateString();
            }

            const mappedGroup: ProfileGroup = {
              _id: groupDataFromApi._id,
              id: groupDataFromApi._id, // Populate id from _id
              groupName: groupDataFromApi.groupName || 'Unnamed Group',
              avatar: groupDataFromApi.avatar, // Use avatar field directly
              description: groupDataFromApi.description,
              createdAt: groupDataFromApi.createdAt, // Store raw ISO string
              members: membersFromApi,
              admins: Array.isArray(groupDataFromApi.admins) ? groupDataFromApi.admins.map((admin: any) => String(admin.id || admin._id || admin)) : [],
              participantDetails: groupDataFromApi.participantDetails, // If API provides this directly
              inviteLink: groupDataFromApi.inviteLink,
              // Derived fields
              displayName: groupDataFromApi.groupName || 'Unnamed Group',
              createdAtFormatted: formattedCreatedAt,
            };
            setProfileData(mappedGroup);
          } else {
            console.warn(`Group data not found or in unexpected format for ID: ${profileId}`, response.data);
            toast({ title: "Not Found", description: "Group details could not be loaded." });
            setProfileData(null);
          }
        } catch (error: any) {
          console.error(`Error fetching group from /conversations/${profileId}:`, error.message);
          if (error.response && error.response.status === 404) {
            toast({ title: "Not Found", description: `Group with ID ${profileId} not found.` });
          } else {
            toast({ variant: "destructive", title: "Error", description: "Failed to fetch group details." });
          }
          setProfileData(null);
        }
      }
    } catch (error: any) { // Catch any other unexpected errors during the process
      console.error("Error in internalFetchProfileData (outer try-catch): ", error.message || error);
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred while loading profile information." });
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  };


  const fetchSharedMedia = async (conversationId: string) => {
    if (!conversationId) {
      // toast({ title: "Debug", description: "fetchSharedMedia: missing conversationId" });
      setSharedMedia([]);
      setLoadingMedia(false);
      return;
    }
    // toast({ title: "Debug", description: `fetchSharedMedia: Fetching for ${conversationId}`});
    setLoadingMedia(true);
    setSharedMedia([]); // Reset before fetching

    try {
      const response = await axiosInstance.get(`/conversations/${conversationId}/messages`);
      let extractedMedia: MediaItem[] = [];

      if (response.data && Array.isArray(response.data.data)) {
        const messages = response.data.data;
        for (const message of messages) {
          // Check for attachments array first
          if (Array.isArray(message.attachments) && message.attachments.length > 0) {
            for (const attachment of message.attachments) {
              if (attachment.url && attachment.type && attachment.fileName) {
                extractedMedia.push({
                  id: (message._id || `msgid-${Math.random()}`) + '-' + attachment.fileName, // Create a unique enough ID
                  url: attachment.url,
                  type: attachment.type,
                  fileName: attachment.fileName,
                });
              }
            }
          } else if (typeof message.content === 'string') {
            // Fallback: Simple S3 URL detection in message content
            const s3UrlPattern = /https:\/\/s3\.[a-zA-Z0-9-]+\.amazonaws\.com\/[a-zA-Z0-9-._~:/?#\[\]@!$&'()*+,;=]+(\.[a-zA-Z0-9]+)/gi;
            let match;
            while ((match = s3UrlPattern.exec(message.content)) !== null) {
              const url = match[0];
              const fileName = url.substring(url.lastIndexOf('/') + 1).split('?')[0]; // Remove query params for filename
              let type = 'application/octet-stream';
              if (/\.(jpe?g|png|gif)$/i.test(fileName)) type = 'image/' + fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
              else if (/\.pdf$/i.test(fileName)) type = 'application/pdf';
              else if (/\.txt$/i.test(fileName)) type = 'text/plain';
              else if (/\.(mp4|mov|avi|wmv)$/i.test(fileName)) type = 'video/' + fileName.substring(fileName.lastIndexOf('.')+1).toLowerCase();


              extractedMedia.push({
                id: (message._id || `msgid-${Math.random()}`) + '-' + fileName,
                url: url,
                type: type,
                fileName: fileName,
              });
            }
          }
        }
      }
      // toast({ title: "Debug", description: `fetchSharedMedia: Found ${extractedMedia.length} items.`});
      setSharedMedia(extractedMedia);
    } catch (error: any) {
      console.error("Error fetching shared media:", error.message || error);
      toast({ variant: "destructive", title: "Error", description: "Could not load shared media." });
      setSharedMedia([]);
    } finally {
      setLoadingMedia(false);
    }
  };

  useEffect(() => {
    const executeFetches = async () => {
      if (isOpen && profileId && profileType) {
        // Initial resets for this effect run
        setProfileData(null);
        setSharedMedia([]);
        setLoading(true); // For profile data loading
        setLoadingMedia(true); // For media data loading

        // Run fetches in parallel
        await Promise.allSettled([
          internalFetchProfileData(), // This function will set its own setLoading(false)
          fetchSharedMedia(profileId)    // This function will set its own setLoadingMedia(false)
        ]);

        // If one of the above functions didn't manage its loading state properly in case of an early return
        // or error, ensure they are false here. However, they should manage their own state.
        // For example, if internalFetchProfileData returns early without error but also without setting setLoading(false)
        if(loading){ setLoading(false);} // Only if still true
        if(loadingMedia){ setLoadingMedia(false);} // Only if still true


      } else {
        // Clear data and stop loading if sidebar is closed or essential props are missing
        setProfileData(null);
        setSharedMedia([]);
        setLoading(false);
        setLoadingMedia(false);
      }
    };

    executeFetches();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, profileId, profileType, refreshDataKey]);

  const handleAddMembersToGroup = async (selectedUsers: CombinedUser[], groupId: string) => {
    if (!selectedUsers || selectedUsers.length === 0) {
      toast({ variant: "destructive", title: "No users selected", description: "Please select users to add." });
      return;
    }
    if (!groupId) {
      toast({ variant: "destructive", title: "Error", description: "Group ID is missing." });
      return;
    }
    const groupDocRef = doc(db, 'conversations', groupId);
    try {
      // No need to fetch groupSnap if we are just updating, unless we need to validate something from it first.
      // For now, assuming direct update is fine.

      const newParticipantDetailsUpdates: { [key: string]: any } = {};
      const selectedUserIds = selectedUsers.map(user => user.id);

      for (const user of selectedUsers) {
        newParticipantDetailsUpdates[`participantDetails.${user.id}`] = {
          email: user.email,
          userName: user.displayName, // Using displayName from CombinedUser
          profilePic: user.profilePic,
          userType: user.userType, // Storing userType
        };
      }

      await updateDoc(groupDocRef, {
        participants: arrayUnion(...selectedUserIds),
        ...newParticipantDetailsUpdates,
        updatedAt: new Date().toISOString()
      });
      toast({ title: "Success", description: `${selectedUsers.length} member(s) added successfully.` });
      setRefreshDataKey(prev => prev + 1); // Trigger data refresh for the sidebar
    } catch (error) {
      console.error("Error adding members:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to add members. Please try again." });
    }
  };

  const handleSaveGroupInfo = async (newName: string, newAvatarUrl: string, groupId: string) => {
    // ... (existing implementation)
    if (!newName.trim()) {
      toast({ variant: "destructive", title: "Validation Error", description: "Group name cannot be empty." });
      return;
    }
    if (!groupId) {
      toast({ variant: "destructive", title: "Error", description: "Group ID is missing." });
      return;
    }
    const groupDocRef = doc(db, 'conversations', groupId);
    const currentGroupData = profileData as ProfileGroup;
    const updateData: { groupName?: string; name?: string; project_name?: string; avatar?: string, updatedAt?: string } = {};
    if (newName.trim() !== (currentGroupData?.displayName)) {
      updateData.groupName = newName.trim();
      updateData.name = newName.trim();
      updateData.project_name = newName.trim();
    }
    if (newAvatarUrl !== undefined && newAvatarUrl.trim() !== (currentGroupData?.avatar || '')) {
       updateData.avatar = newAvatarUrl.trim();
    } else if (newAvatarUrl !== undefined && newAvatarUrl.trim() === '' && currentGroupData?.avatar) {
      updateData.avatar = '';
    }
    if (Object.keys(updateData).length === 0) {
      toast({ title: "Info", description: "No changes were made." });
      return;
    }
    updateData.updatedAt = new Date().toISOString();
    try {
      await updateDoc(groupDocRef, updateData);
      toast({ title: "Success", description: "Group information updated successfully." });
      setRefreshDataKey(prev => prev + 1);
    } catch (error) {
      console.error("Error updating group info:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update group information." });
    }
  };

  const handleGenerateInviteLink = async (groupId: string): Promise<string | null> => {
    // ... (existing implementation)
     if (!groupId) {
      toast({ variant: "destructive", title: "Error", description: "Group ID is missing." });
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
      toast({ title: "Success", description: "New invite link generated and saved." });
      setRefreshDataKey(prev => prev + 1);
      return newInviteLink;
    } catch (error) {
      console.error("Error generating and saving invite link:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to generate invite link." });
      return null;
    }
  };

  const handleConfirmRemoveMember = async (memberIdToRemove: string) => {
    // ... (existing implementation)
    if (!profileId) {
      toast({ variant: "destructive", title: "Error", description: "Group ID is missing." });
      return;
    }
    if (!memberIdToRemove) {
      toast({ variant: "destructive", title: "Error", description: "Member ID is missing." });
      return;
    }
    const groupDocRef = doc(db, 'conversations', profileId);
    try {
      await updateDoc(groupDocRef, {
        participants: arrayRemove(memberIdToRemove),
        [`participantDetails.${memberIdToRemove}`]: deleteField(),
        updatedAt: new Date().toISOString()
      });
      toast({ title: "Success", description: "Member removed successfully." });
      setRefreshDataKey(prev => prev + 1);
    } catch (error) {
      console.error("Error removing member:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to remove member." });
    } finally {
      setIsConfirmDialogOpen(false);
    }
  };

  const handleToggleMuteGroup = async (groupId: string, isCurrentlyMuted: boolean) => {
    // ... (existing implementation)
    if (!currentUser || !currentUser.uid) {
      toast({ variant: "destructive", title: "Error", description: "User not found or not logged in." });
      return;
    }
    if (!groupId) {
      toast({ variant: "destructive", title: "Error", description: "Group ID is missing." });
      return;
    }
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      if (isCurrentlyMuted) {
        await updateDoc(userDocRef, {
          mutedGroups: arrayRemove(groupId)
        });
        toast({ title: "Success", description: "Group unmuted. You will now receive notifications." });
      } else {
        await updateDoc(userDocRef, {
          mutedGroups: arrayUnion(groupId)
        });
        toast({ title: "Success", description: "Group muted. You will no longer receive notifications." });
      }
      // TODO: IMPORTANT - Dispatch an action to update the Redux store for `currentUser.mutedGroups`.
    } catch (error) {
      console.error("Error updating mute status:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update mute status." });
    }
  };

  const handleLeaveGroup = async (groupId: string, userIdToLeave: string) => {
    // ... (existing implementation)
    if (!groupId || !userIdToLeave) {
      toast({ variant: "destructive", title: "Error", description: "Group or User ID is missing." });
      setIsConfirmDialogOpen(false);
      return;
    }
    const groupDocRef = doc(db, 'conversations', groupId);
    const updateData: any = {
      participants: arrayRemove(userIdToLeave),
      [`participantDetails.${userIdToLeave}`]: deleteField(),
      updatedAt: new Date().toISOString()
    };
    const groupData = profileData as ProfileGroup;
    if (groupData && groupData.admins?.includes(userIdToLeave)) {
      updateData.admins = arrayRemove(userIdToLeave);
      if (groupData.admins.length === 1 && groupData.admins[0] === userIdToLeave) {
        toast({
          variant: "default",
          title: "Last Admin Left",
          description: "The last admin has left the group. The group currently has no administrators.",
          duration: 7000,
         });
      }
    }
    try {
      await updateDoc(groupDocRef, updateData);
      toast({ title: "Success", description: "You have left the group." });
      onClose();
    } catch (error) {
      console.error("Error leaving group:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to leave group." });
    } finally {
      setIsConfirmDialogOpen(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    // ... (existing implementation)
    if (!groupId) {
      toast({ variant: "destructive", title: "Error", description: "Group ID is missing for deletion." });
      setIsConfirmDialogOpen(false);
      return;
    }
    if (!currentUser || !(profileData as ProfileGroup)?.admins?.includes(currentUser.uid)) {
        toast({ variant: "destructive", title: "Unauthorized", description: "Only admins can delete groups." });
        setIsConfirmDialogOpen(false);
        return;
    }
    const groupDocRef = doc(db, 'conversations', groupId);
    try {
      await deleteDoc(groupDocRef);
      toast({ title: "Success", description: "Group has been permanently deleted." });
      onClose();
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete group. Please try again." });
    } finally {
      setIsConfirmDialogOpen(false);
    }
  };

  if (!isOpen) return null;

  const getFallbackName = (data: ProfileUser | ProfileGroup | null): string => {
    if (!data || !data.displayName || !data.displayName.trim()) return 'P';
    return data.displayName.charAt(0).toUpperCase();
  };

  const isCurrentlyMuted =
    profileType === 'group' &&
    profileData &&
    currentUser?.mutedGroups?.includes((profileData as ProfileGroup).id);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        className="w-[350px] sm:w-[400px] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-[hsl(var(--border))] p-0 flex flex-col shadow-xl"
        aria-labelledby="profile-sidebar-title"
        aria-describedby="profile-sidebar-description"
      >
        <SheetHeader className="p-4 border-b border-[hsl(var(--border))]">
          <div className="flex justify-between items-center">
            <SheetTitle id="profile-sidebar-title" className="text-[hsl(var(--card-foreground))]">
              {profileType === 'user' ? 'User Profile' : 'Group Details'}
            </SheetTitle>
            <p id="profile-sidebar-description" className="sr-only">
              Displays details and actions for the selected user or group.
            </p>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {loading && <div className="flex justify-center items-center h-32"><p className="text-[hsl(var(--muted-foreground))]">Loading profile...</p></div>}
            {!loading && !profileData && <div className="flex justify-center items-center h-32"><p className="text-[hsl(var(--muted-foreground))]">No details to display.</p></div>}

            {!loading && profileData && (
              <>
                <div className="flex flex-col items-center space-y-2 pt-4">
                  <Avatar className="w-24 h-24 border-2 border-[hsl(var(--border))]">
                    <AvatarImage
                      src={profileType === 'user' ? (profileData as ProfileUser).profilePic : (profileData as ProfileGroup).avatar}
                      alt={profileData.displayName}
                    />
                    <AvatarFallback className="text-3xl">{getFallbackName(profileData)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] pt-2">
                    {profileData.displayName}
                  </h2>

                  {profileType === 'user' && (profileData as ProfileUser).email && (
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{(profileData as ProfileUser).email}</p>
                  )}

                  {profileType === 'group' && (
                    <>
                      {(profileData as ProfileGroup).description ? (
                        <p className="text-sm text-center text-[hsl(var(--muted-foreground))] whitespace-pre-wrap px-2">{(profileData as ProfileGroup).description}</p>
                      ) : (
                        <p className="text-sm text-center italic text-[hsl(var(--muted-foreground))]">No group description.</p>
                      )}
                    </>
                  )}
                </div>

                {profileType === 'user' && (profileData as ProfileUser) && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Status</h3>
                      <p className="text-sm text-[hsl(var(--foreground))]">{(profileData as ProfileUser).status || 'Unknown'}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Last Seen</h3>
                      <p className="text-sm text-[hsl(var(--foreground))]">{(profileData as ProfileUser).lastSeen || 'Unknown'}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Bio</h3>
                      <p className="text-sm text-[hsl(var(--foreground))] whitespace-pre-wrap">{(profileData as ProfileUser).bio || 'No bio available.'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mt-4 mb-2">Shared Media</h3>
                      {loadingMedia ? (
                        <div className="flex justify-center items-center h-20">
                          <LoaderCircle className="animate-spin h-6 w-6 text-[hsl(var(--primary))]" />
                        </div>
                      ) : sharedMedia.length > 0 ? (
                        <SharedMediaDisplay
                          mediaItems={sharedMedia}
                          // onMediaItemClick={(item) => console.log('Media item clicked:', item)} // Optional
                        />
                      ) : (
                        <div className="text-center text-sm text-[hsl(var(--muted-foreground))] p-4 border border-dashed border-[hsl(var(--border))] rounded-md">
                          <p>No media has been shared yet.</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 pt-4 border-t border-[hsl(var(--border))] space-y-2">
                      <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-1">Actions</h3>
                      <Button variant="outline" className="w-full justify-start text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:border-[hsl(var(--destructive))] disabled:opacity-50" disabled>
                        <VolumeX className="h-4 w-4 mr-2" /> Mute Conversation
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:border-[hsl(var(--destructive))] disabled:opacity-50" disabled>
                        <ShieldX className="h-4 w-4 mr-2" /> Block User
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:border-[hsl(var(--destructive))] disabled:opacity-50" disabled>
                        <Trash2 className="h-4 w-4 mr-2" /> Clear Chat
                      </Button>
                      <Button variant="destructive" className="w-full justify-start disabled:opacity-50" disabled>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete Chat
                      </Button>
                    </div>
                  </div>
                )}

                {profileType === 'group' && (profileData as ProfileGroup) && (
                  <div className="space-y-4">
                    {(profileData as ProfileGroup).createdAtFormatted && (
                      <div className="text-xs text-center text-[hsl(var(--muted-foreground))]">
                        <p>Created: {(profileData as ProfileGroup).createdAtFormatted}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-2">Members ({ (profileData as ProfileGroup).members.length})</h3>
                      <ul className="space-y-2 max-h-60">
                        {(profileData as ProfileGroup).members.map((member) => (
                          <li key={member.id} className="flex items-center space-x-3 p-1 rounded-md hover:bg-[hsl(var(--accent)_/_0.5)] group">
                            <Avatar className="w-9 h-9">
                              <AvatarImage src={member.profilePic} alt={member.userName} />
                              <AvatarFallback>{member.userName?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                                <span className="text-sm font-medium text-[hsl(var(--foreground))]">{member.userName}</span>
                                {(profileData as ProfileGroup).admins?.includes(member.id) && (
                                  <span className="ml-1.5 text-xs text-[hsl(var(--primary))] bg-[hsl(var(--primary)_/_0.1)] px-1.5 py-0.5 rounded-full">Admin</span>
                                )}
                            </div>
                            {currentUser && (profileData as ProfileGroup).admins?.includes(currentUser.uid) && member.id !== currentUser.uid && !((profileData as ProfileGroup).admins?.includes(member.id)) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto h-7 w-7 text-gray-400 hover:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDialogProps({
                                    title: "Confirm Removal",
                                    description: `Are you sure you want to remove ${member.userName} from the group?`,
                                    onConfirm: () => handleConfirmRemoveMember(member.id),
                                    confirmButtonVariant: 'destructive'
                                  });
                                  setIsConfirmDialogOpen(true);
                                }}
                                aria-label={`Remove ${member.userName} from group`}
                              >
                                <MinusCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <span className="text-xs text-gray-400 ml-1 mr-1 group-hover:text-[hsl(var(--foreground))]">
                              {member.status === 'online' ? 'Online' : 'Offline'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mt-4 mb-2">Shared Media</h3>
                      {loadingMedia ? (
                        <div className="flex justify-center items-center h-20">
                          <LoaderCircle className="animate-spin h-6 w-6 text-[hsl(var(--primary))]" />
                        </div>
                      ) : sharedMedia.length > 0 ? (
                        <SharedMediaDisplay
                          mediaItems={sharedMedia}
                          // onMediaItemClick={(item) => console.log('Media item clicked:', item)} // Optional
                        />
                      ) : (
                        <div className="text-center text-sm text-[hsl(var(--muted-foreground))] p-4 border border-dashed border-[hsl(var(--border))] rounded-md">
                          <p>No media has been shared yet.</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 pt-4 border-t border-[hsl(var(--border))] space-y-2">
                      <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-1">Actions</h3>
                      {currentUser && (profileData as ProfileGroup).admins?.includes(currentUser.uid) && (
                        <>
                          <Button variant="outline" className="w-full justify-start text-[hsl(var(--muted-foreground))]" onClick={() => setIsAddMembersDialogOpen(true)}>
                            <Users className="h-4 w-4 mr-2" /> Add Members
                          </Button>
                          <Button variant="outline" className="w-full justify-start text-[hsl(var(--muted-foreground))]" onClick={() => setIsChangeGroupInfoDialogOpen(true)}>
                            <Edit3 className="h-4 w-4 mr-2" /> Change Group Name/Avatar
                          </Button>
                          <Button variant="outline" className="w-full justify-start text-[hsl(var(--muted-foreground))]" onClick={() => setIsInviteLinkDialogOpen(true)}>
                            <Link2 className="h-4 w-4 mr-2" /> Group Invite Link
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        className="w-full justify-start text-[hsl(var(--muted-foreground))]"
                        onClick={() => {
                          if (profileData && profileType === 'group') {
                            handleToggleMuteGroup((profileData as ProfileGroup).id, !!isCurrentlyMuted);
                          }
                        }}
                      >
                        {isCurrentlyMuted ? (
                          <Volume2 className="h-4 w-4 mr-2" />
                        ) : (
                          <VolumeX className="h-4 w-4 mr-2" />
                        )}
                        {isCurrentlyMuted ? 'Unmute Group' : 'Mute Group'}
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full justify-start"
                        onClick={() => {
                          if (profileData && profileType === 'group' && currentUser?.uid) {
                            setConfirmDialogProps({
                              title: "Leave Group?",
                              description: "Are you sure you want to leave this group? You will need to be re-invited to join again.",
                              onConfirm: () => handleLeaveGroup((profileData as ProfileGroup).id, currentUser.uid),
                              confirmButtonText: "Leave Group",
                              confirmButtonVariant: "destructive"
                            });
                            setIsConfirmDialogOpen(true);
                          }
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" /> Leave Group
                      </Button>
                      {currentUser && (profileData as ProfileGroup).admins?.includes(currentUser.uid) && (
                        <Button
                          variant="destructive"
                          className="w-full justify-start"
                          onClick={() => {
                            if (profileData && profileType === 'group') {
                              setConfirmDialogProps({
                                title: "Delete Group Permanently?",
                                description: "This action cannot be undone. All messages, members, and group information will be permanently lost. Are you absolutely sure you want to delete this group?",
                                onConfirm: () => handleDeleteGroup((profileData as ProfileGroup).id),
                                confirmButtonText: "Yes, Delete This Group",
                                confirmButtonVariant: "destructive"
                              });
                              setIsConfirmDialogOpen(true);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Group
                        </Button>
                      )}
                    </div>
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
                handleAddMembersToGroup(selectedUserIds, (profileData as ProfileGroup).id);
              }
              setIsAddMembersDialogOpen(false);
            }}
            currentMemberIds={(profileData as ProfileGroup).members?.map(m => m.id) || []}
            groupId={(profileData as ProfileGroup).id}
          />
          <ChangeGroupInfoDialog
            isOpen={isChangeGroupInfoDialogOpen}
            onClose={() => setIsChangeGroupInfoDialogOpen(false)}
            onSave={(newName, newAvatarUrl) => {
              if (profileData && profileData.id && profileType === 'group') {
                handleSaveGroupInfo(newName, newAvatarUrl, (profileData as ProfileGroup).id);
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
                return handleGenerateInviteLink((profileData as ProfileGroup).id);
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
};

export default ProfileSidebar;


