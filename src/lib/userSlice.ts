// lib/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  [key: string]: any; // You can define specific fields here as per your requirements
}

const initialState: UserState = {};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      return { ...state, ...action.payload }; // Spread the new object into the state
    },
    clearUser: () => {
      return {}; // Clear the user state by returning an empty object
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
