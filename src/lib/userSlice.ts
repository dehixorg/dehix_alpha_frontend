// lib/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  uid?: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
  emailVerified?: boolean;
  type?: string;
  // Add other user properties as needed
  [key: string]: any; // For backward compatibility
}

const initialState: UserState = {};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState | null>) => {
      if (!action.payload) {
        return {};
      }
      // Only include serializable properties
      const {
        uid,
        email,
        displayName,
        photoURL,
        phoneNumber,
        emailVerified,
        type,
        ...rest
      } = action.payload;

      return {
        uid,
        email,
        displayName,
        photoURL,
        phoneNumber,
        emailVerified,
        type,
        ...(type === 'freelancer' ? { connects: rest.connects } : {}),
      };
    },
    clearUser: () => {
      return {};
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
