// src/Redux/features/intakeProcessSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { intakeProcessService } from '../../services/intakeProcessService';

// Async thunks
export const fetchIntakeProcesses = createAsyncThunk(
  'intakeProcess/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await intakeProcessService.getAllProcesses();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchKidIntakeProcess = createAsyncThunk(
  'intakeProcess/fetchByKid',
  async (kidId, { rejectWithValue }) => {
    try {
      return await intakeProcessService.getKidProcess(kidId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const startIntakeProcess = createAsyncThunk(
  'intakeProcess/start',
  async (kidId, { rejectWithValue }) => {
    try {
      return await intakeProcessService.startProcess(kidId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateProcessStatus = createAsyncThunk(
  'intakeProcess/updateStatus',
  async ({ kidId, status }, { rejectWithValue }) => {
    try {
      await intakeProcessService.updateStatus(kidId, status);
      return { kidId, status };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const intakeProcessSlice = createSlice({
  name: 'intakeProcess',
  initialState: {
    processes: [],
    selectedProcess: null,
    status: 'idle',
    error: null
  },
  reducers: {
    clearSelectedProcess: (state) => {
      state.selectedProcess = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all processes
      .addCase(fetchIntakeProcesses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchIntakeProcesses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.processes = action.payload;
      })
      .addCase(fetchIntakeProcesses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch kid process
      .addCase(fetchKidIntakeProcess.fulfilled, (state, action) => {
        state.selectedProcess = action.payload;
      })
      // Start process
      .addCase(startIntakeProcess.fulfilled, (state, action) => {
        // Refresh processes list
        state.status = 'idle';
      })
      // Update status
      .addCase(updateProcessStatus.fulfilled, (state, action) => {
        const { kidId, status } = action.payload;
        const processIndex = state.processes.findIndex(p => p.kidId === kidId);
        if (processIndex !== -1) {
          state.processes[processIndex].status = status;
        }
      });
  }
});

export const { clearSelectedProcess, clearError } = intakeProcessSlice.actions;
export default intakeProcessSlice.reducer;