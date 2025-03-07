'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';

import { setUser, clearUser } from '@/lib/userSlice';
import { initializeAxiosWithToken, axiosInstance } from '@/lib/axiosinstance';
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
const setLocalStorageItem = (key: string, value: string) => localStorage.setItem(key, value);
const removeLocalStorageItem = (key: string) => localStorage.removeItem(key);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const refreshAccessTokenApi = async () => {
    const refreshToken = getLocalStorageItem('token');
    if (!refreshToken) return;

    try {
      const { data } = await axiosInstance.post('/public/refresh-token', {
        refreshToken,
      });
      console.log("API Refresh Token ");
      setLocalStorageItem('token', data.accessToken);
      initializeAxiosWithToken(data.accessToken);
      return data.accessToken;
    } catch (error) {
      console.error('Refresh Token Failed:', error);
      removeLocalStorageItem('user');
      removeLocalStorageItem('token');
      setUserState(null);
      dispatch(clearUser());
      router.push('/auth/login');
    }
  };

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
      }
    }

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const accessToken = await firebaseUser.getIdToken();
          const userData = { ...firebaseUser };
          setLocalStorageItem('user', JSON.stringify(userData));
          setLocalStorageItem('token', accessToken);
          setUserState(userData);
          initializeAxiosWithToken(accessToken);
          dispatch(setUser(userData));

          const interval = setInterval(refreshAccessTokenApi, 58 * 60 * 1000);
          return () => clearInterval(interval);
        } catch (error) {
          console.error('User Authentication Error:', error);
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
