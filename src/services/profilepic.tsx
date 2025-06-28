// src/services/profile.ts

import { apiService } from "./apiService";
import { Api_Methods } from "../utils/common/enum";

export const apiHelperService = {
  // ✅ 1. Upload profile picture
  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append("profilePicture", file);

    return apiService({
  method: Api_Methods.POST,
  endpoint: "/register/upload-image",
  body: formData,
});
  },

  // ✅ 2. Update user profile with new image URL
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
