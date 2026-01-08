import mongoose from 'mongoose';

const ShopSchema = new mongoose.Schema({
  shop: { type: String, required: true, unique: true }, // e.g. "my-store.myshopify.com"
  accessToken: { type: String, required: true },
  scope: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Shop', ShopSchema);