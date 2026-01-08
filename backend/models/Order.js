import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  shopifyId: { type: String, required: true, unique: true },
  orderNumber: { type: String, required: true },
  customer: {
    name: String,
    email: String,
    address: {
      street1: String,
      city: String,
      state: String,
      zip: String,
      country: String,
      phone: String
    }
  },
  items: [{
    title: String,
    quantity: Number,
    grams: Number,
    sku: String
  }],
  fulfillmentStatus: { 
    type: String, 
    enum: ['unfulfilled', 'fulfilled'],
    default: 'unfulfilled' 
  },
  trackingNumber: String,
  labelUrl: String,
  carrier: String,
  service: String,
  shippingCost: Number,
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);