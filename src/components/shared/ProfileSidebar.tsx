import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from "lucide-react";
import { cn } from '@/lib/utils';
import { db } from '@/config/firebaseConfig'; // Import db
import { doc, getDoc, DocumentData } from 'firebase/firestore'; // Import Firestore functions

// Updated types to better reflect potential Firestore data
export type ProfileUser = {
  id: string;
  userName: string; // Assuming userName from Firestore
  email: string;
  profilePic?: string; // Optional
  status?: string; // Likely not in DB, can be mocked or derived
  lastSeen?: string; // Likely not in DB, can be mocked or derived
  // Add other fields as they exist in your Firestore 'users' collection
};

export type ProfileGroupMember = {
  id: string;
  userName: string; // Assuming userName from Firestore
  profilePic?: string; // Optional
};

export type ProfileGroup = {
  id: string; // Conversation ID
  groupName?: string; // Assuming groupName from conversation document
  avatar?: string; // Group avatar, if available
  members: ProfileGroupMember[];
  admins?: string[]; // Array of user IDs
  participantDetails?: { [uid: string]: { userName: string; profilePic?: string; email?: string } }; // From Conversation doc
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

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!isOpen || !profileId || !profileType) {
        setProfileData(null);
        return;
      }

      setLoading(true);
      setProfileData(null); // Clear previous data

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
              userName: userData.userName || userData.name || 'Unknown User', // Adjust field names
              email: userData.email || 'No email provided',
              profilePic: userData.profilePic,
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

            setProfileData({
              id: groupDocSnap.id,
              groupName: groupData.groupName || groupData.project_name || 'Unnamed Group',
              avatar: groupData.groupAvatar || `https://api.adorable.io/avatars/285/group-${profileId}.png`, // Use a specific group avatar field or default
              members,
              admins: groupData.admins || [], // Assuming 'admins' field exists
              participantDetails: groupData.participantDetails, // Keep this if useful for rendering
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

    fetchProfileData();
  }, [isOpen, profileId, profileType]);

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
                  <Avatar className="w-24 h-24 border-2 border-[hsl(var(--border))]"> {/* Added border to avatar */}
                    <AvatarImage src={(currentProfileData as any).profilePic || (currentProfileData as any).avatar} alt={(currentProfileData as any).userName || (currentProfileData as any).groupName} />
                    <AvatarFallback className="text-3xl">{getFallbackName(currentProfileData)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] pt-2">{(currentProfileData as any).userName || (currentProfileData as any).groupName}</h2>
                  {profileType === 'user' && (currentProfileData as ProfileUser).email && (
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{(currentProfileData as ProfileUser).email}</p>
                  )}
                </div>

                {profileType === 'user' && (currentProfileData as ProfileUser).status && ( // Check for status field before rendering
                  <div className="space-y-3"> {/* Adjusted spacing */}
                    <div>
                      <h3 className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Status</h3> {/* Styling for heading */}
                      <p className="text-sm text-[hsl(var(--foreground))]">{(currentProfileData as ProfileUser).status}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Last Seen</h3>
                      <p className="text-sm text-[hsl(var(--foreground))]">{(currentProfileData as ProfileUser).lastSeen}</p>
                    </div>
                    {/* Placeholder for more user details or actions */}
                  </div>
                )}

                {profileType === 'group' && (currentProfileData as ProfileGroup).members && (
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Members ({ (currentProfileData as ProfileGroup).members.length})</h3> {/* Styling for heading */}
                      <ul className="space-y-3 max-h-60"> {/* Max height for member list if very long, ScrollArea handles overall scroll */}
                        {(currentProfileData as ProfileGroup).members.map((member) => (
                          <li key={member.id} className="flex items-center space-x-3 p-1 rounded-md hover:bg-[hsl(var(--accent)_/_0.5)]"> {/* Added hover effect and padding */}
                            <Avatar className="w-9 h-9"> {/* Slightly larger member avatar */}
                              <AvatarImage src={member.profilePic} alt={member.userName} />
                              <AvatarFallback>{member.userName?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                                <span className="text-sm font-medium text-[hsl(var(--foreground))]">{member.userName}</span>
                                {(currentProfileData as ProfileGroup).admins?.includes(member.id) && (
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
