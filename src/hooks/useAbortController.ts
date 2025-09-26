import { useMemo } from 'react';

// Provides a per-call AbortController and its signal.
// Usage inside a useEffect:
// const { controller, signal } = useAbortController();
// ... axios.get(url, { signal })
// return () => controller.abort();
export const useAbortController = () => {
  const controller = useMemo(() => new AbortController(), []);
  return { controller, signal: controller.signal } as const;
};
