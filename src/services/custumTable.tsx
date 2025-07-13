import { apiService } from './apiService';

import { Api_Methods } from '@/utils/common/enum';

export const apiHelperService = {
  fetchData: async (endpoint: string, params: Record<string, any>) => {
    return apiService({
      method: Api_Methods.GET,
      endpoint,
      params,
    });
  },
};
