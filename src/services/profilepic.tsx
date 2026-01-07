// src/services/profile.ts

import { Api_Methods } from '../utils/common/enum';

import { apiService } from './apiService';
import { uploadFileViaSignedUrl } from './imageSignedUpload';

export const apiHelperService = {
  uploadProfilePicture: async (file: File) => {
    const { url, key } = await uploadFileViaSignedUrl(file, {
      keyPrefix: 'profile',
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
