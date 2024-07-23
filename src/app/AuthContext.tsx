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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUserState(parsedUser);
      initializeAxiosWithToken(storedToken);
      dispatch(setUser(parsedUser));
      setLoading(false);
    }

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const accessToken = await firebaseUser.getIdToken();
        const claims = await firebaseUser.getIdTokenResult();
        const userData = { ...firebaseUser, type: claims.claims.type };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', accessToken);
        setUserState(userData);
        initializeAxiosWithToken(accessToken);
        dispatch(setUser(userData));
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUserState(null);
        dispatch(clearUser());
        router.replace('/auth/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
