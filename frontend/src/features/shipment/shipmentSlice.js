import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 1. Sync Orders (UPDATED: Now handles errors to stop loading spinner)
export const syncOrders = createAsyncThunk('shipment/sync', async (_, { rejectWithValue }) => {
  try {
    // Step A: Trigger the sync on the backend
    await axios.post('/api/orders/sync');
    
    // Step B: Fetch the latest data from our DB
    const response = await axios.get('/api/orders?status=unfulfilled');
    return response.data;
  } catch (err) {
    console.error("Sync Failed:", err);
    return rejectWithValue(err.response?.data?.message || 'Sync failed');
  }
});

// NEW: Fetch Shipment History (Fulfilled Orders)
export const fetchHistory = createAsyncThunk('shipment/history', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/orders?status=fulfilled');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch history');
  }
});

// 2. Get Rates for an Order
export const getRates = createAsyncThunk('shipment/rates', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/shipments/rates', data);
    return response.data; // { shipmentId, rates }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch rates');
  }
});

// 3. Buy Label
export const buyLabel = createAsyncThunk('shipment/buy', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/shipments/buy', data);
    return response.data;
  } catch (err) {
    // Extract the error message sent from the backend
    return rejectWithValue(err.response?.data?.message || 'Failed to buy label');
  }
});

const shipmentSlice = createSlice({
  name: 'shipment',
  initialState: {
    orders: [],        // Unfulfilled orders
    history: [],       // NEW: Fulfilled orders
    activeRates: [],
    activeShipmentId: null,
    loading: false,
    error: null,         // General Error state (Sync/Rates)
    purchaseError: null  // Specific Purchase Error state (Modal)
  },
  reducers: {
    clearRates: (state) => {
      state.activeRates = [];
      state.activeShipmentId = null;
      state.purchaseError = null; // Clear error when closing modal
    },
    clearError: (state) => {
      state.error = null;
      state.purchaseError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- SYNC ORDERS HANDLERS ---
      .addCase(syncOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(syncOrders.rejected, (state, action) => {
        state.loading = false; // Stop spinner
        state.error = action.payload; // Show error toast/message
      })

      // --- FETCH HISTORY HANDLERS (NEW) ---
      .addCase(fetchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- GET RATES HANDLERS ---
      .addCase(getRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRates.fulfilled, (state, action) => {
        state.loading = false;
        state.activeRates = action.payload.rates;
        state.activeShipmentId = action.payload.shipmentId;
      })
      .addCase(getRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- BUY LABEL HANDLERS ---
      .addCase(buyLabel.pending, (state) => { 
        state.loading = true; 
        state.purchaseError = null; 
      })
      .addCase(buyLabel.fulfilled, (state, action) => {
        state.loading = false;
        
        // Handle the "Warning" case (Label bought, Shopify failed)
        if (action.payload.warning) {
          state.error = action.payload.warning; 
        }

        // Remove order from list
        state.orders = state.orders.filter(o => o._id !== action.payload.order._id);
        
        // Reset modal state
        state.activeRates = [];
        state.activeShipmentId = null;
      })
      .addCase(buyLabel.rejected, (state, action) => {
        state.loading = false;
        state.purchaseError = action.payload; // Store the specific error message
      });
  }
});

export const { clearRates, clearError } = shipmentSlice.actions;
export default shipmentSlice.reducer;