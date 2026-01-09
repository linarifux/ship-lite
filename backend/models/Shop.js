import mongoose from 'mongoose';

const ShopSchema = new mongoose.Schema({
  shop: { type: String, required: true, unique: true }, // e.g. "my-store.myshopify.com"
  accessToken: { type: String, required: true },
  scope: { type: String },
  isActive: { type: Boolean, default: true },

  // --- ADDED: Store Settings (Ship From Address) ---
  shipFrom: {
    company: { type: String, default: '' },
    street1: { type: String, default: '' },
    street2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zip: { type: String, default: '' },
    phone: { type: String, default: '' }
  }
}, { timestamps: true });

export default mongoose.model('Shop', ShopSchema);