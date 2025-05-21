'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';

import { setUser, clearUser } from '@/lib/userSlice';
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

// Helper function to extract serializable user data
const getSerializableUserData = (user: User, type?: string) => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  type: type,
});

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
        // Only dispatch serializable user data
        dispatch(setUser(getSerializableUserData(parsedUser, parsedUser.type)));
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
            const userData = { ...firebaseUser, type: claims.claims.type };
            setLocalStorageItem('user', JSON.stringify(userData));
            setLocalStorageItem('token', accessToken);
            setUserState(userData);
            initializeAxiosWithToken(accessToken);
            // Only dispatch serializable user data
            dispatch(setUser(getSerializableUserData(firebaseUser, claims.claims.type as string)));
          }
        } catch (error) {
          console.error('Token Refresh Error:', error);
        }
      } else {
        removeLocalStorageItem('user');
        removeLocalStorageItem('token');
        setUserState(null);
        dispatch(clearUser());
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