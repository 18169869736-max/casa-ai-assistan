import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

import workflowReducer from './slices/workflowSlice';
import userReducer from './slices/userSlice';
import designsReducer from './slices/designsSlice';
import appReducer from './slices/appSlice';
import onboardingReducer from './slices/onboardingSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user', 'designs', 'app', 'onboarding'],
  migrate: (state: any) => {
    // Remove old keys that are no longer in the reducer
    if (state) {
      const { scans, subscription, ...validState } = state;
      return Promise.resolve(validState);
    }
    return Promise.resolve(state);
  },
};

const rootReducer = combineReducers({
  workflow: workflowReducer,
  user: persistReducer({ ...persistConfig, key: 'user' }, userReducer),
  designs: persistReducer({ ...persistConfig, key: 'designs' }, designsReducer),
  app: persistReducer({ ...persistConfig, key: 'app' }, appReducer),
  onboarding: persistReducer({ ...persistConfig, key: 'onboarding' }, onboardingReducer),
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;