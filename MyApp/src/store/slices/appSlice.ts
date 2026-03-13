import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  theme: 'light' | 'dark';
  isOnline: boolean;
  lastSync: string;
}

const initialState: AppState = {
  theme: 'light',
  isOnline: true,
  lastSync: new Date().toISOString(),
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    updateLastSync: (state, action: PayloadAction<string>) => {
      state.lastSync = action.payload;
    },
    syncNow: (state) => {
      state.lastSync = new Date().toISOString();
    },
  },
});

export const {
  setTheme,
  setOnlineStatus,
  updateLastSync,
  syncNow,
} = appSlice.actions;

export default appSlice.reducer;