import { useEffect, useRef, useState } from 'react';

import type { CombinedUser } from '@/hooks/useAllUsers';
import { axiosInstance } from '@/lib/axiosinstance';

export const CHAT_USER_SEARCH_MIN_CHARS = 3;
export const CHAT_USER_SEARCH_DEBOUNCE_MS = 350;
export const CHAT_USER_SEARCH_LIMIT = 10;

interface SearchableApiUser {
  _id?: string;
  id?: string;
  userName?: string;
  name?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePic?: string;
  avatar?: string;
  role?: 'freelancer' | 'business';
  userType?: 'freelancer' | 'business';
  type?: 'freelancer' | 'business';
}

interface UseRemoteUserSearchOptions {
  limit?: number;
  minChars?: number;
  debounceMs?: number;
}

const SEARCH_ENDPOINTS = [
  '/freelancer/chat-search',
  '/chat/users/search',
  '/users/search',
  '/freelancer/search',
] as const;

const normalizeUser = (user: SearchableApiUser): CombinedUser | null => {
  const id = user._id || user.id;
  const email = user.email || '';

  if (!id || !email) return null;

  const displayName = (
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.companyName ||
        user.name ||
        user.userName ||
        email ||
        'Unnamed User'
  ).trim();

  return {
    id,
    displayName,
    email,
    profilePic: user.profilePic || user.avatar,
    userType:
      user.userType || user.role || user.type || ('freelancer' as const),
    rawUserName: user.userName,
    rawName: user.name,
    rawFirstName: user.firstName,
    rawLastName: user.lastName,
  };
};

const extractUsers = (payload: any): SearchableApiUser[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

export function useRemoteUserSearch(
  searchTerm: string,
  options: UseRemoteUserSearchOptions = {},
) {
  const minChars = options.minChars ?? CHAT_USER_SEARCH_MIN_CHARS;
  const debounceMs = options.debounceMs ?? CHAT_USER_SEARCH_DEBOUNCE_MS;
  const limit = options.limit ?? CHAT_USER_SEARCH_LIMIT;

  const [users, setUsers] = useState<CombinedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const requestSequence = useRef(0);

  useEffect(() => {
    const trimmedTerm = searchTerm.trim();

    if (trimmedTerm.length < minChars) {
      requestSequence.current += 1;
      setUsers([]);
      setIsLoading(false);
      setError(null);
      setHasSearched(false);
      return;
    }

    const currentRequest = ++requestSequence.current;
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        let lastError: unknown = null;
        let normalizedUsers: CombinedUser[] = [];

        for (const endpoint of SEARCH_ENDPOINTS) {
          try {
            const response = await axiosInstance.get(endpoint, {
              params: {
                query: trimmedTerm,
                search: trimmedTerm,
                q: trimmedTerm,
                'filter[search][value]': trimmedTerm,
                'filter[search][columns]': 'firstName,lastName,userName,email',
                limit,
                page: 1,
              },
            });

            normalizedUsers = extractUsers(response.data)
              .map(normalizeUser)
              .filter((user): user is CombinedUser => {
                if (!user) return false;
                const term = trimmedTerm.toLowerCase();
                return (
                  user.displayName.toLowerCase().includes(term) ||
                  user.email.toLowerCase().includes(term)
                );
              })
              .slice(0, limit);

            if (normalizedUsers.length > 0) {
              break;
            }
          } catch (endpointError: any) {
            lastError = endpointError;
            const statusCode = endpointError?.response?.status;

            if (
              statusCode &&
              statusCode !== 404 &&
              statusCode !== 405 &&
              statusCode !== 422
            ) {
              throw endpointError;
            }
          }
        }

        if (requestSequence.current !== currentRequest) return;

        setUsers(
          normalizedUsers.filter(
            (user, index, list) =>
              list.findIndex((candidate) => candidate.id === user.id) === index,
          ),
        );
        setHasSearched(true);

        if (!normalizedUsers.length && lastError) {
          setError(
            (lastError as any)?.response?.data?.message ||
              (lastError as any)?.message ||
              'Failed to search users.',
          );
        }
      } catch (error: any) {
        if (requestSequence.current !== currentRequest) return;

        setUsers([]);
        setHasSearched(true);
        setError(
          error?.response?.data?.message ||
            error?.message ||
            'Failed to search users.',
        );
      } finally {
        if (requestSequence.current === currentRequest) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [debounceMs, limit, minChars, searchTerm]);

  return { users, isLoading, error, hasSearched };
}

export default useRemoteUserSearch;
