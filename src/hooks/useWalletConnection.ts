import { useState, useCallback } from 'react';
import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { signInWithCustomToken } from 'firebase/auth';

import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';
import { setUser } from '@/lib/userSlice';
import { auth } from '@/config/firebaseConfig';

export const useWalletConnection = () => {
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  const connectWallet = useCallback(
    async (connectorId?: string) => {
      try {
        setIsLoading(true);

        if (!address) {
          notifyError('Please connect your wallet first');
          return;
        }

        // Send wallet address to backend for authentication
        const response = await axiosInstance.post('/auth/wallet-login', {
          walletAddress: address,
          chainId: chainId,
        });

        if (response.data) {
          const { token, user } = response.data;

          // Sign in with the Firebase custom token to establish a real session.
          // AuthContext's onIdTokenChanged listener will handle storing
          // the ID token and initializing axios automatically.
          await signInWithCustomToken(auth, token);

          // Store wallet address for reference
          localStorage.setItem('walletAddress', address);

          // Update Redux store
          dispatch(setUser(user));

          setWalletConnected(true);
          notifySuccess('Wallet connected successfully!');

          // Redirect based on user type
          if (user.type === 'freelancer') {
            router.push('/freelancer/dashboard');
          } else if (user.type === 'business') {
            router.push('/business/dashboard');
          } else {
            router.push('/dashboard');
          }
        }
      } catch (error: any) {
        console.error('Wallet connection error:', error);
        notifyError(
          error.response?.data?.message || 'Failed to connect wallet',
        );
        setWalletConnected(false);
      } finally {
        setIsLoading(false);
      }
    },
    [address, chainId, router, dispatch],
  );

  const disconnectWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      disconnect();

      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('walletAddress');

      setWalletConnected(false);
      notifySuccess('Wallet disconnected');
      router.push('/auth/login');
    } catch (error) {
      console.error('Disconnect error:', error);
      notifyError('Failed to disconnect wallet');
    } finally {
      setIsLoading(false);
    }
  }, [disconnect, router]);

  return {
    address,
    isConnected,
    chainId,
    walletConnected,
    isLoading,
    connectWallet,
    disconnectWallet,
    connect,
    connectors,
  };
};
