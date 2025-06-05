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
      const response = await axiosInstance.get('/freelancer'); // Only fetch freelancers

      let processedUsers: CombinedUser[] = [];

      if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
        const freelancerData = response.data.data as ApiUser[];
        processedUsers = freelancerData.map(user => ({
          id: user._id,
          displayName: (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || user.userName || 'Unnamed User').trim(),
          email: user.email,
          profilePic: user.profilePic,
          userType: 'freelancer', // Explicitly set userType
          rawUserName: user.userName,
          rawName: user.name,
          rawFirstName: user.firstName,
          rawLastName: user.lastName,
        }));
        setUsers(processedUsers);
      } else {
        // Handle cases where freelancer data is not as expected, or status is not 'success'
        const errorMessage = `Failed to fetch freelancer data or data format incorrect. Status: ${response.data?.status}, Message: ${response.data?.message}`;
        console.error('Error or unexpected format fetching freelancers:', response.data);
        setError(errorMessage);
        setUsers([]); // Ensure users are cleared on error
      }
    } catch (e: any) {
      console.error('Error fetching freelancer users:', e);
      setError(e.message || 'An unexpected error occurred while fetching freelancers.');
      setUsers([]); // Clear users on error
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
