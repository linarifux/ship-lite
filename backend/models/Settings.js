import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  shipFrom: {
    company: { type: String, default: '' },
    street1: { type: String, default: '' },
    street2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zip: { type: String, default: '' },
    phone: { type: String, default: '' },
    country: { type: String, default: 'US' }
  }
}, { timestamps: true });

export default mongoose.model('Settings', SettingsSchema);