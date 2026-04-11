// src/lib/tourSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type TourMode = 'platform' | 'page';

export type TourTarget =
  // Freelancer main
  | 'dashboard'
  | 'market'
  | 'project-invitations'
  | 'current-projects'
  | 'interviewer-profile'
  | 'interviewee'
  | 'oracle-dashboard'
  | 'talent'
  | 'leaderboard'
  | 'chat'
  | 'notes'
  | 'navigation'

  // Freelancer settings
  | 'personal-info-form'
  | 'experience'
  | 'kyc'
  | 'level-badges'
  | 'streak'
  | 'transaction'
  | 'profiles-center'
  | 'resume'
  | 'feedback'
  | 'reports'
  | 'sidebar'

  // Business
  | 'business-dashboard'
  | 'business-market'
  | 'business-projects'
  | 'business-talent'
  | "business-interviews"

  // Business settings
  | 'business-transactions'
  | 'business-info'
  | 'business-kyc'
  | null;

export type TourState = {
  trigger: number;
  mode: TourMode | null;
  target: TourTarget;
};

const initialState: TourState = {
  trigger: 0,
  mode: null,
  target: null,
};

const tourSlice = createSlice({
  name: 'tour',
  initialState,
  reducers: {
    startTour(
      state,
      action: PayloadAction<{ mode: TourMode; target: TourTarget }>,
    ) {
      state.mode = action.payload.mode;
      state.target = action.payload.target;
      state.trigger += 1;
    },
    clearTour(state) {
      state.mode = null;
      state.target = null;
    },
  },
});

export const { startTour, clearTour } = tourSlice.actions;
export default tourSlice.reducer;
