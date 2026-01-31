// src/lib/tourSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type TourMode = 'platform' | 'page';

export type TourTarget =
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
  | 'business-dashboard'
  | 'business-market'
  | 'business-projects'
  | 'business-talent'
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
      state.target = null;
    },
  },
});

export const { startTour, clearTour } = tourSlice.actions;
export default tourSlice.reducer;
