'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

import { UserType, setUser, clearUser } from '@/lib/userSlice';
import { initializeAxiosWithToken } from '@/lib/axiosinstance';
import { auth } from '@/config/firebaseConfig';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
});

const getLocalStorageItem = (key: string) => localStorage.getItem(key);
const setLocalStorageItem = (key: string, value: string) =>
  localStorage.setItem(key, value);
const removeLocalStorageItem = (key: string) => localStorage.removeItem(key);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const storedUser = getLocalStorageItem('user');
    const storedToken = getLocalStorageItem('token');

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserState(parsedUser);
        initializeAxiosWithToken(storedToken);
        dispatch(setUser(parsedUser));
      } catch (error) {
        console.error('Failed to parse user:', error);
        removeLocalStorageItem('user');
        removeLocalStorageItem('token');
      }
    }

    const unsubscribe = auth.onIdTokenChanged(async (firebaseUser) => {
      if (firebaseUser && navigator.onLine) {
        try {
          const accessToken = await firebaseUser.getIdToken();
          if (accessToken) {
            const claims = await firebaseUser.getIdTokenResult();
            // Ensure type safety for the claims
            const userType =
              typeof claims.claims.type === 'string' &&
              (claims.claims.type === 'freelancer' ||
                claims.claims.type === 'business')
                ? (claims.claims.type as UserType)
                : undefined;

            const userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              phoneNumber: firebaseUser.phoneNumber,
              emailVerified: firebaseUser.emailVerified,
              type: userType, // This is now properly typed as UserType | undefined
              // Add any other serializable properties you need
            };

            setLocalStorageItem('user', JSON.stringify(userData));
            setLocalStorageItem('token', accessToken);
            // Sync cookies so middleware always has a fresh token
            Cookies.set('token', accessToken, {
              expires: 1,
              sameSite: 'Strict',
            });
            if (userType) {
              Cookies.set('userType', userType, {
                expires: 1,
                sameSite: 'Strict',
              });
            }
            setUserState(firebaseUser); // Keep the full user object in local state
            initializeAxiosWithToken(accessToken);
            dispatch(setUser(userData)); // Only pass serializable data to Redux
          }
        } catch (error) {
          console.error('Token Refresh Error:', error);
        }
      } else {
        // If there was a stored token/user, the session expired — flag it for the login page
        const hadSession =
          getLocalStorageItem('token') || getLocalStorageItem('user');
        removeLocalStorageItem('user');
        removeLocalStorageItem('token');
        // Clear cookies so middleware redirects correctly
        Cookies.remove('token');
        Cookies.remove('userType');
        setUserState(null);
        dispatch(clearUser());
        if (hadSession && typeof window !== 'undefined') {
          sessionStorage.setItem('sessionExpired', 'true');
        }
        router.replace('/auth/login');
      }
    });

    setLoading(false);
    return () => unsubscribe();
  }, [dispatch, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
