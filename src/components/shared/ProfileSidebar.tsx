import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, VolumeX, ShieldX, Trash2, UserPlus, Edit3, Link2, LogOut, Users, MinusCircle } from "lucide-react";
import { cn } from '@/lib/utils';
import { db } from '@/config/firebaseConfig';
import { doc, getDoc, DocumentData, updateDoc, arrayUnion, arrayRemove, deleteField } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

import { AddMembersDialog } from './AddMembersDialog';
import { ChangeGroupInfoDialog } from './ChangeGroupInfoDialog';
import { InviteLinkDialog } from './InviteLinkDialog';
import { ConfirmActionDialog } from './ConfirmActionDialog';

export type ProfileUser = {
  id: string;
  userName?: string;
  name?: string;
  displayName: string;
  email: string;
  profilePic?: string;
  status?: string;
  lastSeen?: string;
  bio?: string;
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
  name?: string;
  project_name?: string;
  description?: string;
  groupAvatar?: string;
  createdAtFirebase?: any;
  admins?: string[];
  participants?: string[];
  participantDetails?: { [uid: string]: { userName: string; profilePic?: string; email?: string } };
  inviteLink?: string;
  displayName?: string;
  avatar?: string;
  createdAtFormatted?: string;
  members: ProfileGroupMember[];
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

  const internalFetchProfileData = async () => {
    if (!isOpen || !profileId || !profileType) {
      setProfileData(null);
      return;
    }
    setLoading(true);
    setProfileData(null);
    try {
      if (profileType === 'user') {
        const userDocRef = doc(db, 'users', profileId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const fetchedUser: ProfileUser = {
            id: userDocSnap.id,
            userName: userData.userName,
            name: userData.name,
            displayName: userData.userName || userData.name || 'Unknown User',
            email: userData.email || 'No email provided',
            profilePic: userData.profilePic,
            bio: userData.bio,
            status: 'Online',
            lastSeen: 'Just now',
          };
          setProfileData(fetchedUser);
        } else {
          console.warn(`User document not found: ${profileId}`);
        }
      } else if (profileType === 'group') {
        const groupDocRef = doc(db, 'conversations', profileId);
        const groupDocSnap = await getDoc(groupDocRef);
        if (groupDocSnap.exists()) {
          const groupData = groupDocSnap.data();
          const participantUIDs: string[] = groupData.participants || [];
          let processedMembers: ProfileGroupMember[] = [];
          if (groupData.participantDetails) {
            processedMembers = participantUIDs.map(uid => ({
              id: uid,
              userName: groupData.participantDetails[uid]?.userName || 'Unknown Member',
              profilePic: groupData.participantDetails[uid]?.profilePic,
              status: Math.random() > 0.5 ? 'online' : 'offline',
            }));
          } else {
            const memberPromises = participantUIDs.map(uid => getDoc(doc(db, 'users', uid)));
            const memberDocsSnap = await Promise.all(memberPromises);
            processedMembers = memberDocsSnap.map(memberSnap => {
              const memberData = memberSnap.exists() ? memberSnap.data() : null;
              return {
                id: memberSnap.id,
                userName: memberData?.userName || memberData?.name || 'Unknown Member',
                profilePic: memberData?.profilePic,
                status: Math.random() > 0.5 ? 'online' : 'offline',
              };
            }).filter(Boolean) as ProfileGroupMember[];
          }
          let formattedCreatedAt = 'N/A';
          if (groupData.createdAtFirebase && typeof groupData.createdAtFirebase.toDate === 'function') {
            formattedCreatedAt = groupData.createdAtFirebase.toDate().toLocaleDateString();
          } else if (typeof groupData.createdAt === 'string') {
            formattedCreatedAt = new Date(groupData.createdAt).toLocaleDateString();
          }
          const displayName = groupData.groupName || groupData.name || groupData.project_name || 'Unnamed Group';
          const finalAvatar = groupData.groupAvatar || `https://api.adorable.io/avatars/285/group-${profileId}.png`;
          const fetchedGroup: ProfileGroup = {
            id: groupDocSnap.id,
            groupName: groupData.groupName,
            name: groupData.name,
            project_name: groupData.project_name,
            displayName: displayName,
            description: groupData.description,
            groupAvatar: groupData.groupAvatar,
            avatar: finalAvatar,
            createdAtFirebase: groupData.createdAtFirebase,
            createdAtFormatted: formattedCreatedAt,
            admins: Array.isArray(groupData.admins) ? groupData.admins : [], // Refined admin handling
            participants: participantUIDs,
            participantDetails: groupData.participantDetails,
            inviteLink: groupData.inviteLink,
            members: processedMembers,
          };
          setProfileData(fetchedGroup);
        } else {
          console.warn(`Group (conversation) document not found: ${profileId}`);
        }
      }
    } catch (error) {
      console.error("Error fetching profile data: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    internalFetchProfileData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, profileId, profileType, refreshDataKey]);

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
      const groupSnap = await getDoc(groupDocRef);
      if (!groupSnap.exists()) {
        toast({ variant: "destructive", title: "Error", description: "Group not found." });
        return;
      }
      const newParticipantDetailsUpdates: { [key: string]: any } = {};
      const userFetchPromises = selectedUserIds.map(async (uid) => {
        const userDoc = await getDoc(doc(db, 'users', uid));
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
        ...newParticipantDetailsUpdates,
        updatedAt: new Date().toISOString()
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

  if (!isOpen) return null;

  const getFallbackName = (data: ProfileUser | ProfileGroup | null): string => {
    if (!data || !data.displayName || !data.displayName.trim()) return 'P';
    return data.displayName.charAt(0).toUpperCase();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
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
                                  e.stopPropagation(); // Important to prevent parent list item click if any
                                  setConfirmDialogProps({
                                    title: "Confirm Removal",
                                    description: `Are you sure you want to remove ${member.userName} from the group?`,
                                    onConfirm: () => handleConfirmRemoveMember(member.id),
                                    confirmButtonVariant: 'destructive'
                                  });
                                  setIsConfirmDialogOpen(true);
                                }}
                                aria-label={`Remove ${member.userName} from group`} // Accessibility
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
                      <div className="text-center text-sm text-[hsl(var(--muted-foreground))] p-4 border border-dashed border-[hsl(var(--border))] rounded-md">
                        <p>Group media previews will appear here.</p>
                        <span className="text-xs">(Feature coming soon)</span>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-[hsl(var(--border))] space-y-2">
                      <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-1">Actions</h3>
                      {currentUser && (profileData as ProfileGroup).admins?.includes(currentUser.uid) && (
                        <>
                          <Button variant="outline" className="w-full justify-start text-[hsl(var(--muted-foreground))]" onClick={() => setIsAddMembersDialogOpen(true)}>
                            <Users className="h-4 w-4 mr-2" /> Add Members
                          </Button>
                          {/* General "Remove Members" button removed. Per-member removal is available in the list. */}
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
                      {currentUser && (profileData as ProfileGroup).admins?.includes(currentUser.uid) && (
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
            currentMemberIds={(profileData as ProfileGroup).participants || (profileData as ProfileGroup).members?.map(m => m.id) || []}
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
