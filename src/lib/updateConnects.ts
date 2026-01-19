import { axiosInstance } from './axiosinstance';

/**
 * Updates the connects balance in localStorage and dispatches event
 * to notify other components of the change.
 */
export const updateConnectsBalance = (newBalance: number): void => {
  try {
    // Ensure the balance is a valid number
    const validBalance = Math.max(0, Number(newBalance));

    // Update localStorage
    localStorage.setItem('DHX_CONNECTS', validBalance.toString());

    // Dispatch event to notify other components
    window.dispatchEvent(new Event('connectsUpdated'));
  } catch (error) {
    console.error('Failed to update connects balance:', error);
  }
};

/**
 * Fetches the latest connects balance from the server and updates it locally
 */
export const fetchAndUpdateConnects = async (
  userId: string,
  userType: 'freelancer' | 'business',
): Promise<void> => {
  try {
    const endpoint =
      userType === 'freelancer' ? '/freelancer/me' : '/business/me';
    const response = await axiosInstance.get(endpoint);
    const connects = response.data?.data?.connects;

    if (typeof connects === 'number') {
      updateConnectsBalance(connects);
    }
  } catch (error) {
    console.error('Failed to fetch and update connects:', error);
    throw error;
  }
};
