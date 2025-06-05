import { useState, useEffect, useCallback } from 'react';
import { axiosInstance } from '@/lib/axiosinstance'; // Adjust path if necessary

// Represents the structure from individual API endpoints like /freelancer or /business
export interface ApiUser {
  _id: string;
  userName: string;      // Login/unique username
  name?: string;          // Could be a full name string if provided
  firstName?: string;
  lastName?: string;
  email: string;
  profilePic?: string;
  role?: 'freelancer' | 'business'; // 'role' field from user sample
  // Add any other common fields that might be useful
}

// Represents the processed user data ready for UI
export interface CombinedUser {
  id: string;             // Maps to _id
  displayName: string;
  email: string;
  profilePic?: string;
  userType: 'freelancer' | 'business'; // Discriminator based on origin endpoint
  rawUserName?: string;   // Original userName if displayName is constructed
  rawName?: string;       // Original name field if displayName is constructed
  rawFirstName?: string;
  rawLastName?: string;
}

export const useAllUsers = () => {
  const [users, setUsers] = useState<CombinedUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // Store error messages as strings

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setUsers([]); // Clear previous users before fetching

    try {
      const [freelancerResponse, businessResponse] = await Promise.allSettled([
        axiosInstance.get('/freelancer'), // Endpoint for all freelancers
        axiosInstance.get('/business')    // Endpoint for all businesses
      ]);

      let combinedUsersList: CombinedUser[] = [];
      let fetchErrors: string[] = [];

      if (freelancerResponse.status === 'fulfilled' && freelancerResponse.value.data && freelancerResponse.value.data.status === 'success') {
        const freelancerData = freelancerResponse.value.data.data as ApiUser[];
        if (Array.isArray(freelancerData)) {
          const mappedFreelancers = freelancerData.map(user => ({
            id: user._id,
            displayName: (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || user.userName || 'Unnamed User').trim(),
            email: user.email,
            profilePic: user.profilePic,
            userType: 'freelancer' as 'freelancer',
            rawUserName: user.userName,
            rawName: user.name,
            rawFirstName: user.firstName,
            rawLastName: user.lastName,
          }));
          combinedUsersList = combinedUsersList.concat(mappedFreelancers);
        } else {
            console.warn('Freelancer data is not an array:', freelancerResponse.value.data.data);
        }
      } else if (freelancerResponse.status === 'rejected') {
        console.error('Error fetching freelancers:', freelancerResponse.reason);
        fetchErrors.push(`Failed to fetch freelancers: ${freelancerResponse.reason?.message || 'Unknown error'}`);
      } else if (freelancerResponse.value?.data?.status !== 'success') {
        console.error('Error in freelancer response structure:', freelancerResponse.value.data);
        fetchErrors.push(`Failed to process freelancer data: Unexpected response structure.`);
      }


      if (businessResponse.status === 'fulfilled' && businessResponse.value.data && businessResponse.value.data.status === 'success') {
        const businessData = businessResponse.value.data.data as ApiUser[];
        if (Array.isArray(businessData)) {
          const mappedBusinesses = businessData.map(user => ({
            id: user._id,
            displayName: (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || user.userName || 'Unnamed Business').trim(),
            email: user.email,
            profilePic: user.profilePic,
            userType: 'business' as 'business',
            rawUserName: user.userName,
            rawName: user.name,
            rawFirstName: user.firstName,
            rawLastName: user.lastName,
          }));
          combinedUsersList = combinedUsersList.concat(mappedBusinesses);
        } else {
            console.warn('Business data is not an array:', businessResponse.value.data.data);
        }
      } else if (businessResponse.status === 'rejected') {
        console.error('Error fetching businesses:', businessResponse.reason);
        fetchErrors.push(`Failed to fetch businesses: ${businessResponse.reason?.message || 'Unknown error'}`);
      } else if (businessResponse.value?.data?.status !== 'success') {
        console.error('Error in business response structure:', businessResponse.value.data);
        fetchErrors.push(`Failed to process business data: Unexpected response structure.`);
      }

      // Simple de-duplication based on ID, in case a user is somehow both
      const uniqueUsers = Array.from(new Map(combinedUsersList.map(user => [user.id, user])).values());
      setUsers(uniqueUsers);

      if (fetchErrors.length > 0) {
        setError(fetchErrors.join('; '));
      }

    } catch (e: any) {
      // This catch is for truly unexpected errors during the setup of Promise.allSettled or other synchronous parts.
      console.error('Generic error fetching users:', e);
      setError(e.message || 'An unexpected error occurred');
      setUsers([]); // Clear users on generic error
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array means fetchUsers is created once and is stable

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // fetchUsers is stable

  return { users, isLoading, error, refetchUsers: fetchUsers };
};

export default useAllUsers; // Default export for the hook
