import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

const store = configureStore({
  reducer: rootReducer,
  // middleware יכול להיות מוגדר כאן אם צריך
});

export default store;