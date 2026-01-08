import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchSettings = createAsyncThunk('settings/fetch', async () => {
  const response = await axios.get('/api/settings');
  return response.data;
});

export const saveSettings = createAsyncThunk('settings/save', async (data) => {
  const response = await axios.put('/api/settings', data);
  return response.data;
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    shipFrom: {
      company: '', street1: '', street2: '', city: '', state: '', zip: '', phone: ''
    },
    loading: false,
    success: false,
  },
  reducers: {
    resetStatus: (state) => {
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.shipFrom = action.payload.shipFrom || state.shipFrom;
      })
      .addCase(saveSettings.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.shipFrom = action.payload.shipFrom;
      });
  }
});

export const { resetStatus } = settingsSlice.actions;
export default settingsSlice.reducer;