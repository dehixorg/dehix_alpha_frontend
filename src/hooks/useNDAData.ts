'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useAccount } from 'wagmi';

import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';

export interface NDAItem {
  _id: string;
  ndaId: string;
  content: string;
  businessOwnerId: string;
  businessOwnerAddress: string;
  freelancerId: string;
  freelancerAddress: string;
  businessSignature: string;
  freelancerSignature: string;
  durationDays: number;
  expirationDate: string;
  status: string;
  sbtTokenId: string | null;
  sbtTransactionHash: string | null;
  sbtContractAddress: string | null;
  burnTransactionHash: string | null;
  previousNdaId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UseNDADataReturn {
  ndaItems: NDAItem[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => Promise<void>;
}

export const useNDAData = (): UseNDADataReturn => {
  const user = useSelector((state: RootState) => state.user);
  const { address } = useAccount();
  const [ndaItems, setNDAItems] = useState<NDAItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNDAs = useCallback(async () => {
    if (!user?.uid && !address) return;

    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {};
      if (address) {
        params.walletAddress = address;
      }

      const response = await axiosInstance.get('/nda/my-ndas', { params });

      if (response.data?.success && Array.isArray(response.data.data)) {
        setNDAItems(response.data.data);
      } else {
        setNDAItems([]);
      }
    } catch (err: any) {
      console.error('Error fetching NDAs:', err);
      setError(err?.response?.data?.message || 'Failed to load NDA data');
      setNDAItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, address]);

  useEffect(() => {
    fetchNDAs();
  }, [fetchNDAs]);

  return {
    ndaItems,
    isLoading,
    error,
    totalCount: ndaItems.length,
    refetch: fetchNDAs,
  };
};
