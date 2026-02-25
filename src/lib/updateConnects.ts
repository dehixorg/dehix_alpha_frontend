import { axiosInstance } from './axiosinstance';

/**
 * Updates the connects balance in localStorage and dispatches event
 * to notify other components of the change.
 */
export const updateConnectsBalance = (newBalance: number): void => {
  try {
    // Ensure the balance is a valid number
    const num = Number(newBalance);
    const validBalance = Number.isFinite(num) ? Math.max(0, num) : 0;
    const prevRaw = localStorage.getItem('DHX_CONNECTS');
    const prevNum = prevRaw != null ? Number(prevRaw) : NaN;
    const prevValidBalance = Number.isFinite(prevNum)
      ? Math.max(0, prevNum)
      : 0;
    const hasChanged = validBalance !== prevValidBalance;

    // Update localStorage
    localStorage.setItem('DHX_CONNECTS', validBalance.toString());

    // Dispatch event only when the balance value actually changes.
    if (hasChanged) {
      window.dispatchEvent(new Event('connectsUpdated'));
    }
  } catch (error) {
    console.error('Failed to update connects balance:', error);
  }
};

/**
 * Fetches the latest connects balance from the server and updates it locally.
 * Returns the new balance so callers can update UI immediately.
 */
export const fetchAndUpdateConnects = async (
  userType?: 'freelancer' | 'business',
): Promise<number | null> => {
  const endpoints: Array<'/freelancer/me' | '/business/me'> =
    userType === 'business'
      ? ['/business/me']
      : userType === 'freelancer'
        ? ['/freelancer/me']
        : ['/freelancer/me', '/business/me'];

  for (const endpoint of endpoints) {
    try {
      const response = await axiosInstance.get(endpoint);
      const raw = response.data?.data?.connects;
      const connects = raw != null ? Number(raw) : NaN;
      if (!Number.isNaN(connects) && connects >= 0) {
        updateConnectsBalance(connects);
        return connects;
      }
    } catch {
      // Per-endpoint failure: continue to next endpoint. Never throw.
    }
  }

  // Total failure: all endpoints attempted, none succeeded.
  return null;
};
