import { axiosInstance } from './axiosinstance';

let lastFetchTime = 0;
const MIN_INTERVAL = 5000;
let pendingFetch: Promise<number | null> | null = null;
let hasCalledMeApi = false;

export const updateConnectsBalance = (newBalance: number): void => {
  try {
    const num = Number(newBalance);
    const validBalance = Number.isFinite(num) ? Math.max(0, num) : 0;
    const prevRaw = localStorage.getItem('DHX_CONNECTS');
    const prevNum = prevRaw != null ? Number(prevRaw) : NaN;
    const prevValidBalance = Number.isFinite(prevNum)
      ? Math.max(0, prevNum)
      : 0;
    const hasChanged = validBalance !== prevValidBalance;

    localStorage.setItem('DHX_CONNECTS', validBalance.toString());

    if (hasChanged) {
      window.dispatchEvent(new Event('connectsUpdated'));
    }
  } catch (error) {
    console.error('Failed to update connects balance:', error);
  }
};

export const resetMeApiCallFlag = (): void => {
  hasCalledMeApi = false;
};

export const fetchAndUpdateConnects = async (
  userType?: 'freelancer' | 'business',
  force: boolean = false,
): Promise<number | null> => {
  if (userType === undefined) {
    return null;
  }

  if (!force && hasCalledMeApi) {
    const cached = localStorage.getItem('DHX_CONNECTS');
    return cached != null ? Number(cached) : null;
  }

  const now = Date.now();
  if (now - lastFetchTime < MIN_INTERVAL && !force) {
    const cached = localStorage.getItem('DHX_CONNECTS');
    return cached != null ? Number(cached) : null;
  }

  pendingFetch ??= (async () => {
    try {
      lastFetchTime = Date.now();

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
            hasCalledMeApi = true;
            return connects;
          }
        } catch {
          continue;
        }
      }

      return null;
    } finally {
      pendingFetch = null;
    }
  })();

  return pendingFetch;
};
