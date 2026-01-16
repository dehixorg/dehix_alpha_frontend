import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import userSlice, { UserState } from './userSlice';
import projectDraftSlice, { ProjectDraftState } from './projectDraftSlice';

// Define the root state type
export interface RootState {
  user: UserState;
  projectDraft: ProjectDraftState;
}

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userSlice,
      projectDraft: projectDraftSlice,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['user/setUser'],
          ignoredActionPaths: ['payload.user'],
          ignoredPaths: ['user'],
        },
      }),
  });
};

// Create a singleton store instance
export const store = makeStore();

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppDispatch = AppStore['dispatch'];

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
