// src/Redux/rootReducer.js
import { combineReducers } from '@reduxjs/toolkit';

// reducers
import citiesReducer from './features/citiesSlice';
import kidsReducer from './features/kidsSlice';
import employeesReducer from './features/employeesSlice';
import classesReducer from './features/classesSlice';
import eventTypesReducer from './features/eventTypesSlice';
import eventsReducer from './features/eventsSlice';
import rolesReducer from './features/rolesSlice';
import documentsReducer from './features/documentsSlice';
import treatmentsReducer from './features/treatmentsSlice';
import treatmentTypesReducer from './features/treatmentTypesSlice';
import attendanceReducer from './features/attendanceSlice';

// Combine all reducers into a single root reducer
const rootReducer = combineReducers({
  cities: citiesReducer,
  kids: kidsReducer,
  employees: employeesReducer,
  classes: classesReducer,
  eventTypes: eventTypesReducer,
  roles: rolesReducer,
  events: eventsReducer,
  documents: documentsReducer,
  treatments: treatmentsReducer,
  treatmentTypes: treatmentTypesReducer,
  attendance: attendanceReducer,
});

export default rootReducer;