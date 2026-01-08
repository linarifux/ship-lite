import { configureStore } from '@reduxjs/toolkit';
import shipmentReducer from '../features/shipment/shipmentSlice';
import settingsReducer from '../features/settings/settingsSlice';

export const store = configureStore({
  reducer: {
    shipment: shipmentReducer,
    settings: settingsReducer,
  },
});