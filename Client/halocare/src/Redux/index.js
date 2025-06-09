import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import errorMiddleware from './middleware/errorMiddleware';

const store = configureStore({
  reducer: rootReducer,
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({serializableCheck: {
      // Ignore these action types
      ignoredActions: ['onboarding/fetchOnboardingStatus/fulfilled',
          'kids/fetchKidsWithOnboarding/fulfilled',
           'forms/setFormData'],
      // Ignore these field paths in all actions
      ignoredPaths: ['forms.formData'],
    },}).concat(errorMiddleware)
});

export default store;