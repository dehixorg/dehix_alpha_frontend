'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';

export interface AuthUser {
  _id: string;
  email: string;
  name: string;
  role: 'talent' | 'business';
  avatarUrl?: string | null;
  walletAddress?: string | null;
  isOnline?: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function normalizeRole(
  value: unknown,
  pathname: string,
): 'talent' | 'business' {
  if (value === 'business') return 'business';
  if (value === 'talent' || value === 'freelancer') return 'talent';
  return pathname.startsWith('/business') ? 'business' : 'talent';
}

function readMainUser(pathname: string): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw =
    localStorage.getItem('user') || localStorage.getItem('dehix_user');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const role = normalizeRole(parsed.role || parsed.type, pathname);
    return {
      _id: parsed._id || parsed.uid || parsed.id || '',
      email: parsed.email || '',
      name:
        parsed.name ||
        parsed.displayName ||
        [parsed.firstName, parsed.lastName].filter(Boolean).join(' ') ||
        parsed.email ||
        'DEHIX User',
      role,
      avatarUrl:
        parsed.avatarUrl || parsed.photoURL || parsed.profilePic || null,
      walletAddress: parsed.walletAddress || null,
      isOnline: Boolean(parsed.isOnline),
      createdAt: parsed.createdAt,
    };
  } catch {
    return null;
  }
}

function readMainToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || localStorage.getItem('dehix_token');
}

function syncStandaloneKeys(token: string | null, user: AuthUser | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('dehix_token', token);
  if (user) localStorage.setItem('dehix_user', JSON.stringify(user));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(() => readMainToken());
  const [user, setUser] = useState<AuthUser | null>(() =>
    readMainUser(pathname),
  );

  const refreshAuth = useCallback(() => {
    const nextToken = readMainToken();
    const nextUser = readMainUser(pathname);
    setToken(nextToken);
    setUser(nextUser);
    syncStandaloneKeys(nextToken, nextUser);
  }, [pathname]);

  useEffect(() => {
    refreshAuth();
    window.addEventListener('storage', refreshAuth);
    window.addEventListener('focus', refreshAuth);
    return () => {
      window.removeEventListener('storage', refreshAuth);
      window.removeEventListener('focus', refreshAuth);
    };
  }, [refreshAuth]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      login: (newToken, newUser) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        syncStandaloneKeys(newToken, newUser);
        setToken(newToken);
        setUser(newUser);
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('dehix_token');
        localStorage.removeItem('dehix_user');
        setToken(null);
        setUser(null);
        router.push('/auth/login');
      },
      isAuthenticated: Boolean(token && user),
    }),
    [router, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
