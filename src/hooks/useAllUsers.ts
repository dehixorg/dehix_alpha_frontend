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
      // Fetch only from the working /freelancer endpoint
      const freelancerResponse = await axiosInstance.get('/freelancer');

      // The actual API response is wrapped in a 'data' object: { data: [...] }
      // We check for this structure directly, instead of a "status" field.
      if (freelancerResponse.data && Array.isArray(freelancerResponse.data.data)) {
        const freelancerData = freelancerResponse.data.data as ApiUser[];

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
        setUsers(mappedFreelancers);

      } else {
        // Handle cases where API responds 2xx but the structure is unexpected
        const errorMessage = 'Failed to fetch freelancers: Unexpected response structure.';
        console.error('Error in freelancer response structure:', freelancerResponse.data);
        setError(errorMessage);
      }
    } catch (e: any) {
      // This catch handles network errors, 4xx/5xx responses from axios
      const errorMessage = e.response?.data?.message || e.message || 'An unexpected error occurred while fetching users.';
      console.error('Error fetching freelancers:', e);
      setError(errorMessage);
      setUsers([]); // Ensure users list is empty on error
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
