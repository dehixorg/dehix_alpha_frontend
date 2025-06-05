import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, VolumeX, ShieldX, Trash2, UserPlus, Edit3, Link2, LogOut, Users, MinusCircle } from "lucide-react"; // Added MinusCircle for remove
import { cn } from '@/lib/utils';
import { db } from '@/config/firebaseConfig';
import { doc, getDoc, DocumentData, updateDoc, arrayUnion, arrayRemove, deleteField } from 'firebase/firestore'; // Import arrayRemove, deleteField
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

// Import Dialog Components
import { AddMembersDialog } from './AddMembersDialog';
import { ChangeGroupInfoDialog } from './ChangeGroupInfoDialog';
import { InviteLinkDialog } from './InviteLinkDialog';
import { ConfirmActionDialog } from './ConfirmActionDialog'; // Import ConfirmActionDialog
// Assuming a generic ConfirmationDialog might be created later for other actions
// import { ConfirmationDialog } from './ConfirmationDialog';

// Updated types to better reflect potential Firestore data
export type ProfileUser = {
  id: string;
  userName: string;
  email: string;
  profilePic?: string;
  status?: string;
  lastSeen?: string;
  bio?: string; // Added bio field
};

export type ProfileGroupMember = {
  id: string;
  userName: string;
  profilePic?: string;
  status?: 'online' | 'offline';
};

export type ProfileGroup = {
  id: string;
  groupName?: string;
  avatar?: string;
  description?: string;
  createdAt?: string;
  members: ProfileGroupMember[];
  admins?: string[];
  participantDetails?: { [uid: string]: { userName: string; profilePic?: string; email?: string } };
  inviteLink?: string; // Added for invite link functionality
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
  const { toast } = useToast(); // Initialize useToast

  // State for dialog visibility
  const [isAddMembersDialogOpen, setIsAddMembersDialogOpen] = useState(false);
  const [isChangeGroupInfoDialogOpen, setIsChangeGroupInfoDialogOpen] = useState(false);
  const [isInviteLinkDialogOpen, setIsInviteLinkDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false); // State for ConfirmActionDialog
  const [confirmDialogProps, setConfirmDialogProps] = useState({ // Props for ConfirmActionDialog
    title: '',
    description: '',
    onConfirm: () => {},
    confirmButtonVariant: 'destructive' as "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined,
  });
  // Removed memberToRemove state as ID is passed directly to handler

  // Refresh trigger state
  const [refreshDataKey, setRefreshDataKey] = useState(0);


  const internalFetchProfileData = async () => {
    if (!isOpen || !profileId || !profileType) {
      setProfileData(null);
      return;
    }
    setLoading(true);
    setProfileData(null);
    try {
      if (profileType === 'user') {
          // Assume 'users' collection stores public user profiles
          // This might need to be 'freelancers' or 'businesses' based on your Firestore structure
          const userDocRef = doc(db, 'users', profileId);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as DocumentData;
            setProfileData({
              id: userDocSnap.id,
              userName: userData.userName || userData.name || 'Unknown User',
              email: userData.email || 'No email provided',
              profilePic: userData.profilePic,
              bio: userData.bio, // Fetch bio field
              status: 'Online', // Mock status
              lastSeen: 'Just now', // Mock lastSeen
            } as ProfileUser);
          } else {
            console.warn(`User document not found: ${profileId}`);
            // Optionally set profileData to an error state or a default "not found" object
          }
        } else if (profileType === 'group') {
          const groupDocRef = doc(db, 'conversations', profileId);
          const groupDocSnap = await getDoc(groupDocRef);

          if (groupDocSnap.exists()) {
            const groupData = groupDocSnap.data() as DocumentData; // Cast to your Conversation type if available and imported
            const participantUIDs: string[] = groupData.participants || [];

            let members: ProfileGroupMember[] = [];
            if (groupData.participantDetails) { // Prefer pre-fetched details if available
                members = participantUIDs.map(uid => ({
                    id: uid,
                    userName: groupData.participantDetails[uid]?.userName || 'Unknown Member',
                    profilePic: groupData.participantDetails[uid]?.profilePic,
                }));
            } else { // Fallback to fetching each member - can be slow for large groups
                const memberPromises = participantUIDs.map(uid => getDoc(doc(db, 'users', uid)));
                const memberDocsSnap = await Promise.all(memberPromises);
                members = memberDocsSnap.map(memberSnap => {
                    if (memberSnap.exists()) {
                        const memberData = memberSnap.data() as DocumentData;
                        return {
                        id: memberSnap.id,
                        userName: memberData.userName || memberData.name || 'Unknown Member',
                        profilePic: memberData.profilePic,
                        };
                    }
                    return { id: memberSnap.id, userName: 'Unknown Member' }; // Handle non-existent member doc
                }).filter(member => member !== null) as ProfileGroupMember[];
            }

            const creationTimestamp = groupData.createdAt; // Assuming 'createdAt' is stored on the conversation document
            let formattedCreatedAt = 'N/A';
            if (creationTimestamp) {
              if (typeof creationTimestamp === 'string') {
                formattedCreatedAt = new Date(creationTimestamp).toLocaleDateString();
              } else if (typeof creationTimestamp === 'object' && 'toDate' in creationTimestamp) {
                // Assuming it's a Firebase Timestamp object
                formattedCreatedAt = creationTimestamp.toDate().toLocaleDateString();
              }
            }

            // Add placeholder status to members for UI demo
            const membersWithStatus: ProfileGroupMember[] = members.map(m => ({ ...m, status: Math.random() > 0.5 ? 'online' : 'offline' }));


            setProfileData({
              id: groupDocSnap.id,
              groupName: groupData.groupName || groupData.project_name || 'Unnamed Group',
              avatar: groupData.groupAvatar || `https://api.adorable.io/avatars/285/group-${profileId}.png`,
              description: groupData.description,
              createdAt: formattedCreatedAt,
              members: membersWithStatus,
              admins: groupData.admins || [],
              participantDetails: groupData.participantDetails,
              inviteLink: groupData.inviteLink, // Fetch inviteLink
            } as ProfileGroup);
          } else {
            console.warn(`Group (conversation) document not found: ${profileId}`);
          }
        }
      } catch (error) {
        console.error("Error fetching profile data: ", error);
        // Optionally set an error state in profileData
      } finally {
        setLoading(false);
      }
    };

    internalFetchProfileData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, profileId, profileType, refreshDataKey]); // Added refreshDataKey

  const handleAddMembersToGroup = async (selectedUserIds: string[], groupId: string) => {
    if (!selectedUserIds || selectedUserIds.length === 0) {
      toast({ variant: "destructive", title: "No users selected", description: "Please select users to add." });
      return;
    }
    if (!groupId) {
      toast({ variant: "destructive", title: "Error", description: "Group ID is missing." });
      return;
    }

    const groupDocRef = doc(db, 'conversations', groupId);

    try {
      // We need to update both participants and participantDetails
      // Fetch current participantDetails to merge
      const groupSnap = await getDoc(groupDocRef);
      if (!groupSnap.exists()) {
        toast({ variant: "destructive", title: "Error", description: "Group not found." });
        return;
      }
      const groupData = groupSnap.data();
      const existingParticipantDetails = groupData.participantDetails || {};

      // Prepare new participantDetails entries
      const newParticipantDetailsUpdates: { [key: string]: any } = {};
      const userFetchPromises = selectedUserIds.map(async (uid) => {
        const userDoc = await getDoc(doc(db, 'users', uid)); // Assuming 'users' collection
        if (userDoc.exists()) {
          const userData = userDoc.data();
          newParticipantDetailsUpdates[`participantDetails.${uid}`] = {
            email: userData.email || '',
            userName: userData.userName || userData.name || 'Unknown User',
            profilePic: userData.profilePic || '',
          };
        }
      });
      await Promise.all(userFetchPromises);

      await updateDoc(groupDocRef, {
        participants: arrayUnion(...selectedUserIds),
        ...newParticipantDetailsUpdates // Merge new participant details
        // Optionally update a 'groupUpdatedAt' timestamp here
      });

      toast({ title: "Success", description: `${selectedUserIds.length} member(s) added successfully.` });
      setRefreshDataKey(prev => prev + 1);
    } catch (error) {
      console.error("Error adding members:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to add members. Please try again." });
    }
  };

  const handleSaveGroupInfo = async (newName: string, newAvatarUrl: string, groupId: string) => {
    if (!newName.trim()) {
      toast({ variant: "destructive", title: "Validation Error", description: "Group name cannot be empty." });
      // Note: The dialog itself also has this validation, but good to have it here too.
      return;
    }
    if (!groupId) {
      toast({ variant: "destructive", title: "Error", description: "Group ID is missing." });
      return;
    }

    const groupDocRef = doc(db, 'conversations', groupId);
    const currentGroupData = profileData as ProfileGroup; // Assuming profileData is loaded and is a group

    const updateData: { groupName?: string; name?: string; project_name?: string; avatar?: string } = {};

    if (newName.trim() !== (currentGroupData?.groupName || currentGroupData?.name || currentGroupData?.project_name)) {
      updateData.groupName = newName.trim();
      updateData.name = newName.trim(); // For consistency if 'name' is used elsewhere
      updateData.project_name = newName.trim(); // For consistency if 'project_name' is used elsewhere
    }

    // Check if avatarUrl is defined and different from current, or if current is undefined and new is provided
    if (newAvatarUrl !== undefined && newAvatarUrl.trim() !== (currentGroupData?.avatar || '')) {
       updateData.avatar = newAvatarUrl.trim();
    } else if (newAvatarUrl !== undefined && newAvatarUrl.trim() === '' && currentGroupData?.avatar) {
      // If newAvatarUrl is explicitly empty, and there was an avatar, set it to empty to remove
      updateData.avatar = '';
    }


    if (Object.keys(updateData).length === 0) {
      toast({ title: "Info", description: "No changes were made." });
      return;
    }

    // Add updatedAt timestamp
    (updateData as any).updatedAt = new Date().toISOString();


    try {
      await updateDoc(groupDocRef, updateData);
      toast({ title: "Success", description: "Group information updated successfully." });
      setRefreshDataKey(prev => prev + 1); // Trigger data refresh
    } catch (error) {
      console.error("Error updating group info:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update group information." });
    }
  };

  const handleGenerateInviteLink = async (groupId: string): Promise<string | null> => {
    if (!groupId) {
      toast({ variant: "destructive", title: "Error", description: "Group ID is missing." });
      return null;
    }

    // Generate a more unique link part, e.g., using a portion of a new UUID or random string
    const randomComponent = Math.random().toString(36).substring(2, 10);
    // Using a placeholder domain. Replace with your actual app's domain/URL structure.
    // For a custom URI scheme like 'dehix://', ensure your app is set up to handle it.
    const newInviteLink = `https://your-app.com/join/${groupId}?inviteCode=${randomComponent}`;
    // Or for a custom URI: const newInviteLink = `dehix://group/${groupId}/join?code=${randomComponent}`;


    const groupDocRef = doc(db, 'conversations', groupId);
    try {
      await updateDoc(groupDocRef, {
        inviteLink: newInviteLink,
        updatedAt: new Date().toISOString(), // Also update timestamp
      });
      toast({ title: "Success", description: "New invite link generated and saved." });
      setRefreshDataKey(prev => prev + 1); // Trigger data refresh
      return newInviteLink;
    } catch (error) {
      console.error("Error generating and saving invite link:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to generate invite link." });
      return null;
    }
  };

  const handleConfirmRemoveMember = async (memberIdToRemove: string) => {
    if (!profileId) { // profileId is the groupId here
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
        [`participantDetails.${memberIdToRemove}`]: deleteField() // Remove member from participantDetails map
      });
      toast({ title: "Success", description: "Member removed successfully." });
      setRefreshDataKey(prev => prev + 1); // Trigger data refresh
    } catch (error) {
      console.error("Error removing member:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to remove member." });
    } finally {
      setIsConfirmDialogOpen(false); // Close confirmation dialog
    }
  };


  if (!isOpen) {
    return null;
  }

  // Helper to get name for fallback avatar
  const getFallbackName = (data: ProfileUser | ProfileGroup | null): string => {
    if (!data) return 'P';
    if ('userName' in data && data.userName) return data.userName.charAt(0).toUpperCase();
    if ('groupName' in data && data.groupName) return data.groupName.charAt(0).toUpperCase();
    // Removed 'name' fallback as types now use userName/groupName primarily
    return 'P';
  };

  const currentProfileData = profileData; // To use in JSX and avoid type narrowing issues in callbacks

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="w-[350px] sm:w-[400px] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-[hsl(var(--border))] p-0 flex flex-col shadow-xl">
        <SheetHeader className="p-4 border-b border-[hsl(var(--border))]">
          <div className="flex justify-between items-center">
            <SheetTitle className="text-[hsl(var(--card-foreground))]">{profileType === 'user' ? 'User Profile' : 'Group Details'}</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>
        <ScrollArea className="flex-1"> {/* Wrap content that might overflow in ScrollArea */}
          <div className="p-4 space-y-6"> {/* Increased main spacing slightly */}
            {loading && <div className="flex justify-center items-center h-32"><p className="text-[hsl(var(--muted-foreground))]">Loading profile...</p></div>}
            {!loading && !currentProfileData && <div className="flex justify-center items-center h-32"><p className="text-[hsl(var(--muted-foreground))]">No details to display.</p></div>}

            {!loading && currentProfileData && (
              <>
                <div className="flex flex-col items-center space-y-2 pt-4"> {/* Added some padding top */}
                  <Avatar className="w-24 h-24 border-2 border-[hsl(var(--border))]">
                    <AvatarImage src={(currentProfileData as any).profilePic || (currentProfileData as any).avatar} alt={(currentProfileData as any).userName || (currentProfileData as any).groupName} />
                    <AvatarFallback className="text-3xl">{getFallbackName(currentProfileData)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] pt-2">{(currentProfileData as any).userName || (currentProfileData as any).groupName}</h2>

                  {profileType === 'user' && (currentProfileData as ProfileUser).email && (
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{(currentProfileData as ProfileUser).email}</p>
                  )}

                  {profileType === 'group' && (currentProfileData as ProfileGroup).description && (
                     <p className="text-sm text-center text-[hsl(var(--muted-foreground))] whitespace-pre-wrap px-2">{(currentProfileData as ProfileGroup).description}</p>
                  )}
                  {profileType === 'group' && !(currentProfileData as ProfileGroup).description && (
                     <p className="text-sm text-center italic text-[hsl(var(--muted-foreground))]">No group description.</p>
                  )}
                </div>

                {profileType === 'user' && (
                  // User specific details (Status, Last Seen, Bio, Shared Media, Actions)
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Status</h3>
                      <p className="text-sm text-[hsl(var(--foreground))]">{(currentProfileData as ProfileUser).status || 'Unknown'}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Last Seen</h3>
                      <p className="text-sm text-[hsl(var(--foreground))]">{(currentProfileData as ProfileUser).lastSeen || 'Unknown'}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Bio</h3>
                      <p className="text-sm text-[hsl(var(--foreground))] whitespace-pre-wrap">{(currentProfileData as ProfileUser).bio || 'No bio available.'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mt-4 mb-2">Shared Media</h3>
                      <div className="text-center text-sm text-[hsl(var(--muted-foreground))] p-4 border border-dashed border-[hsl(var(--border))] rounded-md">
                        <p>Media previews will appear here.</p>
                        <span className="text-xs">(Feature coming soon)</span>
                      </div>
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

                {profileType === 'group' && (
                  <div className="space-y-4">
                     {/* Created Date */}
                    {(currentProfileData as ProfileGroup).createdAt && (
                      <div className="text-xs text-center text-[hsl(var(--muted-foreground))]">
                        <p>Created: {(currentProfileData as ProfileGroup).createdAt}</p>
                      </div>
                    )}

                    {/* Members List */}
                    <div>
                      <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-2">Members ({ (currentProfileData as ProfileGroup).members.length})</h3>
                      <ul className="space-y-2 max-h-60">
                        {(currentProfileData as ProfileGroup).members.map((member) => (
                          <li key={member.id} className="flex items-center space-x-3 p-1 rounded-md hover:bg-[hsl(var(--accent)_/_0.5)] group">
                            <Avatar className="w-9 h-9">
                              <AvatarImage src={member.profilePic} alt={member.userName} />
                              <AvatarFallback>{member.userName?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                                <span className="text-sm font-medium text-[hsl(var(--foreground))]">{member.userName}</span>
                                {(currentProfileData as ProfileGroup).admins?.includes(member.id) && (
                                  <span className="ml-1.5 text-xs text-[hsl(var(--primary))] bg-[hsl(var(--primary)_/_0.1)] px-1.5 py-0.5 rounded-full">Admin</span>
                                )}
                            </div>
                            {currentUser && (currentProfileData as ProfileGroup).admins?.includes(currentUser.uid) && member.id !== currentUser.uid && !((currentProfileData as ProfileGroup).admins?.includes(member.id)) && ( // Admin can remove non-admin members, not self
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

                    {/* Shared Media Placeholder for Groups */}
                    <div>
                      <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mt-4 mb-2">Shared Media</h3>
                      <div className="text-center text-sm text-[hsl(var(--muted-foreground))] p-4 border border-dashed border-[hsl(var(--border))] rounded-md">
                        <p>Group media previews will appear here.</p>
                        <span className="text-xs">(Feature coming soon)</span>
                      </div>
                    </div>

                    {/* Group Action Buttons */}
                    <div className="mt-6 pt-4 border-t border-[hsl(var(--border))] space-y-2">
                      <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-1">Actions</h3>

                      {currentUser && (currentProfileData as ProfileGroup).admins?.includes(currentUser.uid) && (
                        <>
                          <Button variant="outline" className="w-full justify-start text-[hsl(var(--muted-foreground))]" onClick={() => setIsAddMembersDialogOpen(true)}>
                            <Users className="h-4 w-4 mr-2" /> Add Members
                          </Button>
                          <Button variant="outline" className="w-full justify-start text-[hsl(var(--muted-foreground))] disabled:opacity-50" disabled>
                            <UserPlus className="h-4 w-4 mr-2" /> Remove Members {/* Logic TBD */}
                          </Button>
                          <Button variant="outline" className="w-full justify-start text-[hsl(var(--muted-foreground))]" onClick={() => setIsChangeGroupInfoDialogOpen(true)}>
                            <Edit3 className="h-4 w-4 mr-2" /> Change Group Name/Avatar
                          </Button>
                          <Button variant="outline" className="w-full justify-start text-[hsl(var(--muted-foreground))]" onClick={() => setIsInviteLinkDialogOpen(true)}>
                            <Link2 className="h-4 w-4 mr-2" /> Group Invite Link
                          </Button>
                        </>
                      )}

                      <Button variant="outline" className="w-full justify-start text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:border-[hsl(var(--destructive))] disabled:opacity-50" disabled>
                        <VolumeX className="h-4 w-4 mr-2" /> Mute Group
                      </Button>
                      <Button variant="destructive" className="w-full justify-start disabled:opacity-50" disabled>
                        <LogOut className="h-4 w-4 mr-2" /> Leave Group
                      </Button>

                      {currentUser && (currentProfileData as ProfileGroup).admins?.includes(currentUser.uid) && (
                        <Button variant="destructive" className="w-full justify-start disabled:opacity-50" disabled>
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
      {/* Render Dialogs - they will be positioned correctly by their own logic */}
      {currentProfileData && profileType === 'group' && (
        <>
          <AddMembersDialog
            isOpen={isAddMembersDialogOpen}
            onClose={() => setIsAddMembersDialogOpen(false)}
            onAddMembers={(selectedUserIds) => {
              if (currentProfileData && currentProfileData.id) {
                handleAddMembersToGroup(selectedUserIds, currentProfileData.id);
              }
              setIsAddMembersDialogOpen(false);
            }}
            currentMemberIds={(currentProfileData as ProfileGroup).participants || (currentProfileData as ProfileGroup).members?.map(m => m.id) || []}
            groupId={(currentProfileData as ProfileGroup).id}
          />
          <ChangeGroupInfoDialog
            isOpen={isChangeGroupInfoDialogOpen}
            onClose={() => setIsChangeGroupInfoDialogOpen(false)}
            onSave={(newName, newAvatarUrl) => {
              if (currentProfileData && currentProfileData.id) {
                handleSaveGroupInfo(newName, newAvatarUrl, currentProfileData.id);
              }
              // Dialog will close itself via its own onSave->onClose if successful,
              // or we can force it here: setIsChangeGroupInfoDialogOpen(false);
            }}
            currentName={(currentProfileData as ProfileGroup).groupName || (currentProfileData as any).name || (currentProfileData as any).project_name || ''}
            currentAvatarUrl={(currentProfileData as ProfileGroup).avatar}
            groupId={(currentProfileData as ProfileGroup).id}
          />
          <InviteLinkDialog
            isOpen={isInviteLinkDialogOpen}
            onClose={() => setIsInviteLinkDialogOpen(false)}
            onGenerateLink={async () => {
              if (currentProfileData && currentProfileData.id && profileType === 'group') {
                return handleGenerateInviteLink(currentProfileData.id);
              }
              return null;
            }}
            currentInviteLink={(currentProfileData as ProfileGroup)?.inviteLink}
            groupName={(currentProfileData as ProfileGroup)?.groupName || 'the group'}
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
      <SheetContent className="w-[350px] sm:w-[400px] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-[hsl(var(--border))] p-0 flex flex-col shadow-xl">
        <SheetHeader className="p-4 border-b border-[hsl(var(--border))]">
          <div className="flex justify-between items-center">
            <SheetTitle className="text-[hsl(var(--card-foreground))]">{profileType === 'user' ? 'User Profile' : 'Group Details'}</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>
        <ScrollArea className="flex-1"> {/* Wrap content that might overflow in ScrollArea */}
          <div className="p-4 space-y-6"> {/* Increased main spacing slightly */}
            {loading && <div className="flex justify-center items-center h-32"><p className="text-[hsl(var(--muted-foreground))]">Loading profile...</p></div>}
            {!loading && !profileData && <div className="flex justify-center items-center h-32"><p className="text-[hsl(var(--muted-foreground))]">No details to display.</p></div>}

            {!loading && profileData && (
              <>
                <div className="flex flex-col items-center space-y-2 pt-4"> {/* Added some padding top */}
                  <Avatar className="w-24 h-24 border-2 border-[hsl(var(--border))]"> {/* Added border to avatar */}
                    <AvatarImage src={(profileData as any).profilePic || (profileData as any).avatar} alt={profileData.name} />
                    <AvatarFallback className="text-3xl">{profileData.name?.charAt(0).toUpperCase() || 'P'}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] pt-2">{profileData.name}</h2>
                  {profileType === 'user' && (profileData as ProfileUser).email && (
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{(profileData as ProfileUser).email}</p>
                  )}
                </div>

                {profileType === 'user' && (
                  <div className="space-y-3"> {/* Adjusted spacing */}
                    <div>
                      <h3 className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Status</h3> {/* Styling for heading */}
                      <p className="text-sm text-[hsl(var(--foreground))]">{(profileData as ProfileUser).status}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Last Seen</h3>
                      <p className="text-sm text-[hsl(var(--foreground))]">{(profileData as ProfileUser).lastSeen}</p>
                    </div>
                    {/* Placeholder for more user details or actions */}
                  </div>
                )}

                {profileType === 'group' && (profileData as ProfileGroup).members && (
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Members ({ (profileData as ProfileGroup).members.length})</h3> {/* Styling for heading */}
                      <ul className="space-y-3 max-h-60"> {/* Max height for member list if very long, ScrollArea handles overall scroll */}
                        {(profileData as ProfileGroup).members.map((member) => (
                          <li key={member.id} className="flex items-center space-x-3 p-1 rounded-md hover:bg-[hsl(var(--accent)_/_0.5)]"> {/* Added hover effect and padding */}
                            <Avatar className="w-9 h-9"> {/* Slightly larger member avatar */}
                              <AvatarImage src={member.profilePic} alt={member.name} />
                              <AvatarFallback>{member.name?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                                <span className="text-sm font-medium text-[hsl(var(--foreground))]">{member.name}</span>
                                {(profileData as ProfileGroup).admins?.includes(member.id) && (
                                  <span className="ml-1.5 text-xs text-[hsl(var(--primary))] bg-[hsl(var(--primary)_/_0.1)] px-1.5 py-0.5 rounded-full">Admin</span>
                                )}
                            </div>
                            {/* Placeholder for member actions e.g. view profile, remove from group etc. */}
                          </li>
                        ))}
                      </ul>
                    </div>
                     {/* Placeholder for group actions like "Leave Group", "Edit Group" etc. */}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileSidebar;
