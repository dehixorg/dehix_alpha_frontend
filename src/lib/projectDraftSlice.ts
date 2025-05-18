import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProjectDraftState {
  draftedProjects: string[];
}

const initialState: ProjectDraftState = {
  draftedProjects: [],
};

const projectDraftSlice = createSlice({
  name: 'projectDraft',
  initialState,
  reducers: {
    addDraftedProject: (state, action: PayloadAction<string>) => {
      if (!state.draftedProjects.includes(action.payload)) {
        state.draftedProjects.push(action.payload);
      }
    },
    removeDraftedProject: (state, action: PayloadAction<string>) => {
      state.draftedProjects = state.draftedProjects.filter(
        (id) => id !== action.payload,
      );
    },
    clearDraftedProjects: (state) => {
      state.draftedProjects = [];
    },
    setDraftedProjects: (state, action: PayloadAction<string[]>) => {
      state.draftedProjects = action.payload;
    },
  },
});

export const {
  addDraftedProject,
  removeDraftedProject,
  clearDraftedProjects,
  setDraftedProjects,
} = projectDraftSlice.actions;

export default projectDraftSlice.reducer;
