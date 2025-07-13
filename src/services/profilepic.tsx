// src/services/profile.ts

import { Api_Methods } from '../utils/common/enum';

import { apiService } from './apiService';

export const apiHelperService = {
  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    return apiService({
      method: Api_Methods.POST,
      endpoint: '/register/upload-image',
      body: formData,
    });
  },

  updateUserProfilePicture: async (userId: string, imageUrl: string) => {
    return apiService({
      method: Api_Methods.PUT,
      endpoint: `/admin/${userId}`,
      body: {
        profilePic: imageUrl,
      },
    });
  },
};
