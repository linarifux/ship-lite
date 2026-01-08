import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings, saveSettings, resetStatus } from '../features/settings/settingsSlice';
import { Save, MapPin } from 'lucide-react';

const Settings = () => {
  const dispatch = useDispatch();
  const { shipFrom, loading, success } = useSelector((state) => state.settings);
  
  // Local state for form input
  const [formData, setFormData] = useState({
    company: '', street1: '', street2: '', city: '', state: '', zip: '', phone: ''
  });

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Sync Redux state to Local state when data loads
  useEffect(() => {
    if (shipFrom) setFormData(shipFrom);
  }, [shipFrom]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => dispatch(resetStatus()), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(saveSettings({ shipFrom: formData }));
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <MapPin size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Warehouse Settings</h2>
            <p className="text-gray-500 text-sm">Where are you shipping from?</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company / Name</label>
                <input name="company" value={formData.company} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="My Store LLC" />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input name="street1" value={formData.street1} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="123 Warehouse Blvd" />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Apt, Suite, Unit (Optional)</label>
                <input name="street2" value={formData.street2} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Suite 100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input name="city" value={formData.city} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="New York" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input name="state" value={formData.state} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="NY" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <input name="zip" value={formData.zip} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="10001" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="555-000-0000" />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              {success && (
                <span className="text-green-600 text-sm font-medium animate-pulse">
                  Settings saved successfully!
                </span>
              )}
              {!success && <span></span>} {/* Spacer */}

              <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50"
              >
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
};

export default Settings;