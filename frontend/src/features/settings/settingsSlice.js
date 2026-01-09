import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api'; // <--- UPDATED: Import the new API utility

// 1. Fetch Settings
export const fetchSettings = createAsyncThunk('settings/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/api/settings');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch settings');
  }
});

// 2. Save Settings
export const saveSettings = createAsyncThunk('settings/save', async (data, { rejectWithValue }) => {
  try {
    const response = await api.put('/api/settings', data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to save settings');
  }
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    shipFrom: {
      company: '', street1: '', street2: '', city: '', state: '', zip: '', phone: ''
    },
    loading: false,
    success: false,
    error: null, // Added error state
  },
  reducers: {
    resetStatus: (state) => {
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH HANDLERS ---
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        // Merge incoming data with defaults to prevent null crashes
        state.shipFrom = { ...state.shipFrom, ...(action.payload.shipFrom || {}) };
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- SAVE HANDLERS ---
      .addCase(saveSettings.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.shipFrom = action.payload.shipFrom;
      })
      .addCase(saveSettings.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  }
});

export const { resetStatus } = settingsSlice.actions;
export default settingsSlice.reducer;