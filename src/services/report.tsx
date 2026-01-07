import { Api_Methods } from '../utils/common/enum';

import { apiService } from './apiService';
import { uploadFileViaSignedUrl } from './imageSignedUpload';

export const apiHelperService = {
  getAllReports: async (params = {}) => {
    return apiService({
      method: Api_Methods.GET,
      endpoint: '/reports',
      params,
    });
  },
  updateReportStatus: async (Id: string, status: string) => {
    return apiService({
      method: Api_Methods.PUT,
      endpoint: `/report/${Id}`,
      body: {
        status,
      },
    });
  },

  uploadReportImage: async (file: File) => {
    const { key, url } = await uploadFileViaSignedUrl(file, {
      keyPrefix: 'reports',
    });
    return {
      success: true,
      data: {
        data: {
          Location: url,
          Key: key,
          Bucket: 's3',
        },
      },
    };
  },

  createReport: async (data: any) => {
    return apiService({
      method: Api_Methods.POST,
      endpoint: '/reports',
      body: data,
    });
  },
  sendMessageToReport: async (
    reportId: string,
    data: { sender: string; text: string },
  ) => {
    return apiService({
      method: Api_Methods.POST,
      endpoint: `/reports/${reportId}/messages`,
      body: data,
    });
  },
  getSingleReport: async (id: string) => {
    return apiService({
      method: Api_Methods.GET,
      endpoint: `/reports/${id}`,
    });
  },

  getReportsByUser: async (userId: string, params = {}) => {
    return apiService({
      method: Api_Methods.GET,
      endpoint: `/reports/user/${userId}`,
      params,
    });
  },
};
