// src/redux/rootReducer.js
import { combineReducers } from '@reduxjs/toolkit';
import citiesReducer from './features/citiesSlice';

const rootReducer = combineReducers({
  cities: citiesReducer,
  // כאן נוסיף עוד reducers בעתיד
});

export default rootReducer;