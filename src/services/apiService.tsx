// apiService.tsx
import { Api_Methods } from '../utils/common/enum'; // Importing Api_Methods

import { axiosInstance } from '@/lib/axiosinstance';

interface ApiRequest {
  method: Api_Methods; // Use the Api_Methods enum directly
  endpoint: string;
  body?: any;
  params?: Record<string, any>;
  authToken?: string;
}

export const apiService = async ({
  method,
  endpoint,
  body = null,
  params = {},
}: ApiRequest): Promise<{ success: boolean; data: any }> => {
  try {
    let response;
    switch (method) {
      case Api_Methods.GET:
        response = await axiosInstance.get(endpoint, { params });
        break;
      case Api_Methods.POST:
        response = await axiosInstance.post(endpoint, body, { params });
        break;
      case Api_Methods.PUT:
        response = await axiosInstance.put(endpoint, body, { params });
        break;
      case Api_Methods.DELETE:
        response = await axiosInstance.delete(endpoint, { params });
        break;
      case Api_Methods.PATCH:
        response = await axiosInstance.patch(endpoint, body, { params });
        break;
      default:
        throw new Error(`Unsupported request method: ${method}`);
    }

    return {
      success: response.status >= 200 && response.status < 400,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      data: error.response ? error.response.data : error.message,
    };
  }
};

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  transactionType?: 'credit' | 'debit' | 'all';
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}

export const fetchTransactions = async (
  userId: string,
  userType: 'freelancer' | 'business',
  page: number,
  limit: number,
  filters?: TransactionFilters,
) => {
  const params: any = {
    userType,
    page: page.toString(),
    limit: limit.toString(),
  };

  if (filters) {
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.transactionType)
      params.transactionType = filters.transactionType;
    if (filters.minAmount !== undefined) params.minAmount = filters.minAmount;
    if (filters.maxAmount !== undefined) params.maxAmount = filters.maxAmount;
    if (filters.searchQuery) params.searchQuery = filters.searchQuery;
  }

  return apiService({
    method: Api_Methods.GET,
    endpoint: `/transaction/user/${userId}`,
    params,
  });
};
