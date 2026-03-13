import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile, UserPreferences, DesignResult } from '../../types';

const initialState: UserProfile = {
  id: '',
  savedDesigns: [],
  preferences: {
    favoriteStyles: [],
    defaultColorPalettes: [],
    notificationsEnabled: true,
  },
  freeGenerationsUsed: 0,
  isPremium: false,
  secretBypassEnabled: false,
  weeklyGenerationsUsed: 0,
  weeklyGenerationsResetDate: new Date().toISOString(),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
    updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    addSavedDesign: (state, action: PayloadAction<DesignResult>) => {
      const existingIndex = state.savedDesigns.findIndex(
        (design) => design.id === action.payload.id
      );
      if (existingIndex >= 0) {
        state.savedDesigns[existingIndex] = action.payload;
      } else {
        state.savedDesigns.unshift(action.payload);
      }
    },
    removeSavedDesign: (state, action: PayloadAction<string>) => {
      state.savedDesigns = state.savedDesigns.filter(
        (design) => design.id !== action.payload
      );
    },
    clearSavedDesigns: (state) => {
      state.savedDesigns = [];
    },
    incrementFreeGenerations: (state) => {
      state.freeGenerationsUsed += 1;
    },
    incrementWeeklyGenerations: (state) => {
      // Check if we need to reset the counter (1 week has passed)
      const resetDate = new Date(state.weeklyGenerationsResetDate);
      const now = new Date();
      const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

      if (now.getTime() - resetDate.getTime() >= oneWeekMs) {
        // Reset counter if a week has passed
        state.weeklyGenerationsUsed = 1;
        state.weeklyGenerationsResetDate = now.toISOString();
      } else {
        state.weeklyGenerationsUsed += 1;
      }
    },
    resetWeeklyGenerations: (state) => {
      state.weeklyGenerationsUsed = 0;
      state.weeklyGenerationsResetDate = new Date().toISOString();
    },
    setPremiumStatus: (state, action: PayloadAction<boolean>) => {
      state.isPremium = action.payload;
    },
    toggleSecretBypass: (state) => {
      state.secretBypassEnabled = !state.secretBypassEnabled;
    },
    resetUser: () => initialState,
  },
});

export const {
  setUserId,
  updatePreferences,
  addSavedDesign,
  removeSavedDesign,
  clearSavedDesigns,
  incrementFreeGenerations,
  incrementWeeklyGenerations,
  resetWeeklyGenerations,
  setPremiumStatus,
  toggleSecretBypass,
  resetUser,
} = userSlice.actions;

export default userSlice.reducer;