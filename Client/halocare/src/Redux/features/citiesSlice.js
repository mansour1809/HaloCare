import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// טעינת רשימת הערים
export const fetchCities = createAsyncThunk(
  'cities/fetchCities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/ReferenceData/cities");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת רשימת הערים');
    }
  }
);

// הוספת עיר חדשה
export const addCity = createAsyncThunk(
  'cities/addCity',
  async (cityData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/ReferenceData/cities", cityData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בהוספת העיר');
    }
  }
);

// עדכון עיר
export const updateCity = createAsyncThunk(
  'cities/updateCity',
  async ({ oldName, newData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/ReferenceData/cities/${encodeURIComponent(oldName)}`, newData);
      return { oldName, newData: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בעדכון העיר');
    }
  }
);

const citiesSlice = createSlice({
  name: 'cities',
  initialState: {
    cities: [],
    status: 'idle',
    error: null,
    actionStatus: 'idle' // עבור פעולות הוספה/עדכון
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetActionStatus: (state) => {
      state.actionStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cities
      .addCase(fetchCities.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.cities = action.payload;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Add City
      .addCase(addCity.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(addCity.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.cities.push(action.payload);
      })
      .addCase(addCity.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })
      
      // Update City
      .addCase(updateCity.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(updateCity.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const { oldName, newData } = action.payload;
        const index = state.cities.findIndex(city => city.cityName === oldName);
        if (index !== -1) {
          state.cities[index] = newData;
        }
      })
      .addCase(updateCity.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      });
  }
});

export const { clearError, resetActionStatus } = citiesSlice.actions;
export default citiesSlice.reducer;