import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import errorMiddleware from './middleware/errorMiddleware';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(errorMiddleware)
  // middleware יכול להיות מוגדר כאן אם צריך
});

export default store;