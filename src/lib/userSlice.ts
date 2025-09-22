// lib/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserType = 'freelancer' | 'business';

export interface UserState {
  uid: string; // uid is now required and will never be null/undefined
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
  emailVerified?: boolean;
  type?: UserType;
  // Add other user properties as needed
  [key: string]: any; // For backward compatibility
}

const initialState: UserState = {
  uid: '', // Default to empty string instead of undefined
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState> | null>) => {
      if (!action.payload) {
        return { uid: '' }; // Return default state with empty uid
      }

      // Ensure uid is always a string, defaulting to empty string
      const uid = action.payload.uid || '';

      // Only include serializable properties
      const {
        email,
        displayName,
        photoURL,
        phoneNumber,
        emailVerified,
        type,
        ...rest
      } = action.payload;

      return {
        uid, // This will always be a string, at least empty string
        ...(email !== undefined && { email }),
        ...(displayName !== undefined && { displayName }),
        ...(photoURL !== undefined && { photoURL }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(emailVerified !== undefined && { emailVerified }),
        ...(type !== undefined && { type }),
        ...(type === 'freelancer' && rest.connects !== undefined
          ? { connects: rest.connects }
          : {}),
      };
    },
    clearUser: () => {
      return { uid: '' }; // Return default state with empty uid
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
