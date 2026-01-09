import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  // ADDED: Shop Domain (for Multi-tenancy)
  shop: { type: String, required: true, index: true }, 
  
  // ADDED: Shopify Order ID (Unique identifier from Shopify)
  orderId: { type: Number, required: true, unique: true }, 
  
  orderNumber: { type: String, required: true },
  email: { type: String },
  financialStatus: { type: String },
  fulfillmentStatus: { type: String, default: 'unfulfilled' },
  totalPrice: { type: String },
  currency: { type: String },
  
  customer: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    address: {
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      state: { type: String },
      zip: { type: String },
      country: { type: String }
    }
  },
  
  lineItems: [{
    name: { type: String },
    quantity: { type: Number },
    grams: { type: Number },
    sku: { type: String },
    price: { type: String }
  }],

  totalWeight: { type: Number, default: 0 },
  
  // Tracking info (for when we fulfill it)
  trackingNumber: { type: String },
  carrier: { type: String },
  labelUrl: { type: String },

}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);