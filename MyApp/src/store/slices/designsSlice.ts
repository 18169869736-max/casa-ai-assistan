import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DesignResult } from '../../types';

interface DesignsState {
  saved: DesignResult[];
  recent: DesignResult[];
  loading: boolean;
  error?: string;
}

const initialState: DesignsState = {
  saved: [],
  recent: [],
  loading: false,
  error: undefined,
};

const designsSlice = createSlice({
  name: 'designs',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = undefined;
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = undefined;
    },
    addRecentDesign: (state, action: PayloadAction<DesignResult>) => {
      const existingIndex = state.recent.findIndex(
        (design) => design.id === action.payload.id
      );
      if (existingIndex >= 0) {
        state.recent[existingIndex] = action.payload;
      } else {
        state.recent.unshift(action.payload);
        if (state.recent.length > 20) {
          state.recent = state.recent.slice(0, 20);
        }
      }
    },
    addSavedDesign: (state, action: PayloadAction<DesignResult>) => {
      const existingIndex = state.saved.findIndex(
        (design) => design.id === action.payload.id
      );
      if (existingIndex >= 0) {
        state.saved[existingIndex] = action.payload;
      } else {
        state.saved.unshift(action.payload);
      }
    },
    removeSavedDesign: (state, action: PayloadAction<string>) => {
      state.saved = state.saved.filter((design) => design.id !== action.payload);
    },
    removeRecentDesign: (state, action: PayloadAction<string>) => {
      state.recent = state.recent.filter((design) => design.id !== action.payload);
    },
    setSavedDesigns: (state, action: PayloadAction<DesignResult[]>) => {
      state.saved = action.payload;
    },
    setRecentDesigns: (state, action: PayloadAction<DesignResult[]>) => {
      state.recent = action.payload;
    },
    clearRecentDesigns: (state) => {
      state.recent = [];
    },
    clearAllDesigns: (state) => {
      state.saved = [];
      state.recent = [];
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  addRecentDesign,
  addSavedDesign,
  removeSavedDesign,
  removeRecentDesign,
  setSavedDesigns,
  setRecentDesigns,
  clearRecentDesigns,
  clearAllDesigns,
} = designsSlice.actions;

export default designsSlice.reducer;