import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings, saveSettings, resetStatus } from '../features/settings/settingsSlice';
import { Save, MapPin, Store, Link as LinkIcon, Loader2, AlertTriangle, Building2, Phone, Navigation } from 'lucide-react';

const Settings = () => {
  const dispatch = useDispatch();
  
  const { shipFrom, loading, success, error } = useSelector((state) => state.settings);
  
  // --- Auth State ---
  const [shopUrl, setShopUrl] = useState('');
  const [isConnected, setIsConnected] = useState(!!localStorage.getItem('shop_connected'));

  // Local state for form input
  const [formData, setFormData] = useState({
    company: '', street1: '', street2: '', city: '', state: '', zip: '', phone: ''
  });

  // 1. Check for success callback from Shopify
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected')) {
      setIsConnected(true);
      localStorage.setItem('shop_connected', 'true');
      localStorage.setItem('shop_name', params.get('shop'));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // 2. Load Settings
  useEffect(() => {
    if (isConnected) {
      dispatch(fetchSettings());
    }
  }, [dispatch, isConnected]);

  // Sync Redux -> Local State
  useEffect(() => {
    if (shipFrom) setFormData(shipFrom);
  }, [shipFrom]);

  // Clear success message
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

  const handleConnect = () => {
    if (!shopUrl) return;
    let cleanShop = shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!cleanShop.includes('.myshopify.com')) {
      cleanShop += '.myshopify.com';
    }
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/shopify/auth?shop=${cleanShop}`;
  };

  // --- RENDER: CONNECT SCREEN ---
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Store</h2>
          <p className="text-gray-500 mb-8">Enter your Shopify store URL to manage your warehouse settings.</p>
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store URL</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="my-brand.myshopify.com"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  value={shopUrl}
                  onChange={(e) => setShopUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                />
                <LinkIcon size={18} className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>
            <button 
              onClick={handleConnect}
              className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-bold transition-all active:scale-95 shadow-lg shadow-green-200"
            >
              Connect Shopify
            </button>
            <p className="text-xs text-center text-gray-400 mt-4">You will be redirected to Shopify to approve access.</p>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: SETTINGS FORM ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <main className="max-w-3xl mx-auto px-6 py-12">
        
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg shadow-blue-200">
            <MapPin size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Warehouse Settings</h2>
            <p className="text-gray-500">Manage the address used as the "Ship From" location for labels.</p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertTriangle className="text-red-600" size={20} />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Card Header */}
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-800">Origin Address</h3>
            <p className="text-sm text-gray-500 mt-1">This address will appear on your shipping labels.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">
              
              {/* Row 1: Company */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Company / Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="text-gray-400" size={18} />
                  </div>
                  <input 
                    name="company" 
                    value={formData.company} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    placeholder="e.g. Acme Corp" 
                  />
                </div>
              </div>

              {/* Row 2: Address Lines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="text-gray-400" size={18} />
                    </div>
                    <input 
                      name="street1" 
                      value={formData.street1} 
                      onChange={handleChange} 
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                      placeholder="123 Logistics Way" 
                    />
                  </div>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Apt, Suite, Unit <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <input 
                    name="street2" 
                    value={formData.street2} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    placeholder="Suite 100" 
                  />
                </div>
              </div>

              {/* Row 3: City / State / Zip (The key to looking professional) */}
              <div className="grid grid-cols-12 gap-4">
                {/* City: 6 columns */}
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                  <input 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    placeholder="New York" 
                  />
                </div>

                {/* State: 3 columns */}
                <div className="col-span-6 md:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                  <input 
                    name="state" 
                    value={formData.state} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    placeholder="NY" 
                  />
                </div>

                {/* Zip: 3 columns */}
                <div className="col-span-6 md:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Zip Code</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Navigation className="text-gray-400" size={16} />
                    </div>
                    <input 
                      name="zip" 
                      value={formData.zip} 
                      onChange={handleChange} 
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                      placeholder="10001" 
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="text-gray-400" size={18} />
                  </div>
                  <input 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    placeholder="(555) 000-0000" 
                  />
                </div>
              </div>
            </div>

            {/* Footer / Actions */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
              <div>
                {success && (
                  <span className="inline-flex items-center gap-2 text-green-600 text-sm font-medium animate-in fade-in slide-in-from-left-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Settings saved successfully
                  </span>
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-gray-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Settings;