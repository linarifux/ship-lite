import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 1. Sync Orders from Shopify
export const syncOrders = createAsyncThunk('shipment/sync', async () => {
  await axios.post('/api/orders/sync');
  const response = await axios.get('/api/orders?status=unfulfilled');
  return response.data;
});

// 2. Get Rates for an Order
export const getRates = createAsyncThunk('shipment/rates', async (data) => {
  const response = await axios.post('/api/shipments/rates', data);
  return response.data; // { shipmentId, rates }
});

// 3. Buy Label
export const buyLabel = createAsyncThunk('shipment/buy', async (data) => {
  const response = await axios.post('/api/shipments/buy', data);
  console.log(response);
  
  return response.data;
});

const shipmentSlice = createSlice({
  name: 'shipment',
  initialState: {
    orders: [],
    activeRates: [],
    activeShipmentId: null,
    loading: false,
    error: null
  },
  reducers: {
    clearRates: (state) => {
      state.activeRates = [];
      state.activeShipmentId = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Sync
      .addCase(syncOrders.pending, (state) => { state.loading = true; })
      .addCase(syncOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      
      // Get Rates
      .addCase(getRates.pending, (state) => { state.loading = true; })
      .addCase(getRates.fulfilled, (state, action) => {
        state.loading = false;
        state.activeRates = action.payload.rates;
        state.activeShipmentId = action.payload.shipmentId;
      })

      // Buy Label
      .addCase(buyLabel.pending, (state) => { state.loading = true; })
      .addCase(buyLabel.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the fulfilled order from the list locally
        state.orders = state.orders.filter(o => o._id !== action.payload.order._id);
        state.activeRates = [];
        state.activeShipmentId = null;
        // In a real app, you might show a "Success" toast here
      });
  }
});

export const { clearRates } = shipmentSlice.actions;
export default shipmentSlice.reducer;