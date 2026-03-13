import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OnboardingState {
  hasCompletedOnboarding: boolean;
  room: string | null;
  goal: string | null;
  feeling: string | null;
  frustration: string | null;
}

const initialState: OnboardingState = {
  hasCompletedOnboarding: false,
  room: null,
  goal: null,
  feeling: null,
  frustration: null,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setRoom: (state, action: PayloadAction<string>) => {
      state.room = action.payload;
    },
    setGoal: (state, action: PayloadAction<string>) => {
      state.goal = action.payload;
    },
    setFeeling: (state, action: PayloadAction<string>) => {
      state.feeling = action.payload;
    },
    setFrustration: (state, action: PayloadAction<string>) => {
      state.frustration = action.payload;
    },
    completeOnboarding: (state) => {
      state.hasCompletedOnboarding = true;
    },
    resetOnboarding: () => initialState,
  },
});

export const {
  setRoom,
  setGoal,
  setFeeling,
  setFrustration,
  completeOnboarding,
  resetOnboarding,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
