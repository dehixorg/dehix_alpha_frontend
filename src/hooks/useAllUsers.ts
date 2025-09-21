import { useState, useEffect, useCallback } from 'react';

import { axiosInstance } from '@/lib/axiosinstance'; // Adjust path if necessary

// Represents the structure from individual API endpoints like /freelancer or /business
export interface ApiUser {
  _id: string;
  userName: string; // Login/unique username
  name?: string; // Could be a full name string if provided
  firstName?: string;
  lastName?: string;
  email: string;
  profilePic?: string;
  role?: 'freelancer' | 'business'; // 'role' field from user sample
  // Add any other common fields that might be useful
}

// Represents the processed user data ready for UI
export interface CombinedUser {
  id: string; // Maps to _id
  displayName: string;
  email: string;
  profilePic?: string;
  userType: 'freelancer' | 'business'; // Discriminator based on origin endpoint
  rawUserName?: string; // Original userName if displayName is constructed
  rawName?: string; // Original name field if displayName is constructed
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
    setUsers([]);

    try {
      // Add pagination parameters to get all users
      const response = await axiosInstance.get('/freelancer');

      // The API returns the array inside a `data` property. Check for its existence.
      if (response.data && Array.isArray(response.data.data)) {
        const freelancerData = response.data.data as ApiUser[];
        // Debug log
        const processedUsers = freelancerData.map((user) => ({
          id: user._id,
          displayName: (user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.name || user.userName || 'Unnamed User'
          ).trim(),
          email: user.email,
          profilePic: user.profilePic,
          userType: 'freelancer' as const,
          rawUserName: user.userName,
          rawName: user.name,
          rawFirstName: user.firstName,
          rawLastName: user.lastName,
        }));
        // Debug log
        setUsers(processedUsers);
      } else {
        // Handle cases where response.data.data is not an array
        const errorMessage = `Failed to process freelancer data. Unexpected format received from server.`;
        console.error('Unexpected response format:', response.data);
        setError(errorMessage);
        setUsers([]);
      }
    } catch (e: any) {
      console.error('Error fetching freelancer users:', e);
      setError(
        e.response?.data?.message ||
          e.message ||
          'An unexpected error occurred while fetching freelancers.',
      );
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // fetchUsers is stable

  return { users, isLoading, error, refetchUsers: fetchUsers };
};

export default useAllUsers; // Default export for the hook
