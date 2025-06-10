// src/Redux/features/kidsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';
import { createParent, updateParent } from './parentSlice';
import { initializeKidOnboarding } from './onboardingSlice';


export const fetchKids = createAsyncThunk(
  'kids/fetchKids',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/Kids');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת רשימת הילדים');
    }
  }
);

export const fetchKidById = createAsyncThunk(
  'kids/fetchKidById',
  async (kidId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Kids/${kidId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת פרטי הילד');
    }
  }
);

export const fetchKidProfile = createAsyncThunk(
  'kids/fetchKidProfile',
  async (kidId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Kids/${kidId}/file`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת פרופיל הילד');
    }
  }
);

// This thunk will handle creating both parents and the kid
export const createKidWithParents = createAsyncThunk(
  'kids/createKidWithParents',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      // 1. Create or update parent 1
      const parent1Data = {
        parentId: formData.parent1Id || 0, // 0 for new parent
        firstName: formData.parent1FirstName,
        lastName: formData.parent1LastName,
        mobilePhone: formData.parent1Mobile,
        address: formData.parent1Address || formData.address, // Use kid's address if not specified
        cityName: formData.parent1CityName || formData.cityName, // Use kid's city if not specified
        homePhone: formData.homePhone,
        email: formData.parent1Email
      };

      let parent1Result;
      if (parent1Data.parentId === 0) {
        parent1Result = await dispatch(createParent(parent1Data)).unwrap();
      } else {
        parent1Result = await dispatch(updateParent(parent1Data)).unwrap();
      }

      // 2. Create or update parent 2 (if provided)
      let parent2Result = null;
      if (formData.parent2FirstName && formData.parent2LastName) {
        const parent2Data = {
          parentId: formData.parent2Id || 0, // 0 for new parent
          firstName: formData.parent2FirstName,
          lastName: formData.parent2LastName,
          mobilePhone: formData.parent2Mobile,
          address: formData.parent2Address || formData.address,
          cityName: formData.parent2CityName || formData.cityName,
          homePhone: formData.homePhone,
          email: formData.parent2Email
        };

        if (parent2Data.parentId === 0) {
          parent2Result = await dispatch(createParent(parent2Data)).unwrap();
        } else {
          parent2Result = await dispatch(updateParent(parent2Data)).unwrap();
        }
      }

      // 3. Create the kid with parent references
      const kidData = {
        id: formData.idNumber || 0, // 0 for new kid
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthDate: formData.birthDate,
        gender: formData.gender,
        cityName: formData.cityName,
        address: formData.address,
        isActive: true,
        parentId1: parent1Result.parentId,
        parentId2: parent2Result?.parentId || null,
        hName: formData.hName,
        pathToFolder: formData.pathToFolder,
        classId: formData.classId,
        photoPath: formData.photoPath || null
      };

      const kidResponse = await axios.post('/Kids', kidData);
      const newKid = kidResponse.data;

      // // 🔥 4. יצירת תהליך קליטה אוטומטית לילד החדש
      // try {
      //   await dispatch(initializeKidOnboarding(newKid.id)).unwrap();
      //   console.log(`תהליך קליטה נוצר בהצלחה לילד ${newKid.id}`);
      // } catch (onboardingError) {
      //   console.error('שגיאה ביצירת תהליך קליטה:', onboardingError);
      //   // לא נכשיל את כל התהליך בגלל זה - הילד נוצר בהצלחה
      // }

      return {
        kid: newKid,
        parent1: parent1Result,
        parent2: parent2Result
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בשמירת נתוני הילד וההורים');
    }
  }
);

export const updateKidWithParents = createAsyncThunk(
  'kids/updateKidWithParents',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      // 1. Update parent 1
      const parent1Data = {
        parentId: formData.parent1Id || 0,
        firstName: formData.parent1FirstName,
        lastName: formData.parent1LastName,
        mobilePhone: formData.parent1Mobile,
        address: formData.parent1Address || formData.address,
        cityName: formData.parent1CityName || formData.cityName,
        homePhone: formData.homePhone,
        email: formData.parent1Email
      };

      let parent1Result;
      if (parent1Data.parentId === 0) {
        // יצירת הורה חדש אם לא קיים
        parent1Result = await dispatch(createParent(parent1Data)).unwrap();
      } else {
        // עדכון הורה קיים
        parent1Result = await dispatch(updateParent(parent1Data)).unwrap();
      }

      // 2. Update parent 2 (if provided)
      let parent2Result = null;
      if (formData.parent2FirstName && formData.parent2LastName) {
        const parent2Data = {
          parentId: formData.parent2Id || 0,
          firstName: formData.parent2FirstName,
          lastName: formData.parent2LastName,
          mobilePhone: formData.parent2Mobile,
          address: formData.parent2Address || formData.address,
          cityName: formData.parent2CityName || formData.cityName,
          homePhone: formData.homePhone,
          email: formData.parent2Email
        };

        if (parent2Data.parentId === 0) {
          parent2Result = await dispatch(createParent(parent2Data)).unwrap();
        } else {
          parent2Result = await dispatch(updateParent(parent2Data)).unwrap();
        }
      }

      // 3. Update the kid with parent references
      const kidData = {
        id: formData.id, // יש ID קיים במצב עדכון
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthDate: formData.birthDate,
        gender: formData.gender,
        cityName: formData.cityName,
        address: formData.address,
        isActive: formData.isActive,
        parentId1: parent1Result.parentId,
        parentId2: parent2Result?.parentId || null,
        hName: formData.hName,
        pathToFolder: formData.pathToFolder,
        classId: formData.classId,
        photo: formData.photo || null
      };

      // עדכון הילד
      const response = await axios.put(`/Kids/${kidData.id}`, kidData);

      return {
        kid: response.data,
        parent1: parent1Result,
        parent2: parent2Result
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בעדכון נתוני הילד וההורים');
    }
  }
);


export const updateKid = createAsyncThunk(
  'kids/updateKid',
  async (kidData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/Kids/${kidData.id}`, kidData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בעדכון פרטי הילד');
    }
  }
);

const kidsSlice = createSlice({
  name: 'kids',
  initialState: {
    kids: [],
    selectedKid: null,
    selectedKidWithParents: null, // To store the full kid profile with parent data
    status: 'idle',
    error: null
  },
  reducers: {
    clearSelectedKid: (state) => {
      state.selectedKid = null;
      state.selectedKidWithParents = null;
      state.error = null;

    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch kids
      .addCase(fetchKids.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchKids.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.kids = action.payload;
      })
      .addCase(fetchKids.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בטעינת רשימת הילדים';
      })
      
      // Fetch kid by ID
      .addCase(fetchKidById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchKidById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedKid = action.payload;
      })
      .addCase(fetchKidById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בטעינת פרטי הילד';
      })
      
      // Fetch kid profile
      .addCase(fetchKidProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchKidProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedKid = action.payload;
      })
      .addCase(fetchKidProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בטעינת פרופיל הילד';
      })
      
      // Create kid with parents
      .addCase(createKidWithParents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createKidWithParents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.kids.push(action.payload.kid);
        state.selectedKid = action.payload.kid;
        state.selectedKidWithParents = action.payload;
      })
      .addCase(createKidWithParents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה ביצירת ילד וההורים שלו';
      })
      
      // Regular update kid
      .addCase(updateKid.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateKid.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // עדכון הילד ברשימה
        const index = state.kids.findIndex(kid => kid.id === action.payload.id);
        if (index !== -1) {
          state.kids[index] = action.payload;
        }
        state.selectedKid = action.payload;
      })
      .addCase(updateKid.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בעדכון פרטי הילד';
      })
       .addCase(updateKidWithParents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateKidWithParents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // עדכון הילד ברשימה
        const index = state.kids.findIndex(kid => kid.id === action.payload.kid.id);
        if (index !== -1) {
          state.kids[index] = action.payload.kid;
        }
        state.selectedKid = action.payload.kid;
        state.selectedKidWithParents = action.payload;
      })
      .addCase(updateKidWithParents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בעדכון ילד וההורים שלו';
      });
  }
});

export const { clearSelectedKid } = kidsSlice.actions;

export default kidsSlice.reducer;