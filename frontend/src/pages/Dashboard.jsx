import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { syncOrders, getRates, buyLabel, clearRates } from '../features/shipment/shipmentSlice';
import { RefreshCw, Store, Link as LinkIcon } from 'lucide-react';

import OrderList from '../components/dashboard/OrderList';
import RateModal from '../components/dashboard/RateModal';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { orders, activeRates, activeShipmentId, loading } = useSelector((state) => state.shipment);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // --- OAuth State ---
  const [shopUrl, setShopUrl] = useState('');
  // Check localStorage first to persist login across reloads
  const [isConnected, setIsConnected] = useState(!!localStorage.getItem('shop_connected'));

  // 1. Check for success callback from Shopify (URL params)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected')) {
      setIsConnected(true);
      localStorage.setItem('shop_connected', 'true');
      localStorage.setItem('shop_name', params.get('shop'));
      
      // Clean up the URL bar so the params don't stick around
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  // 2. Initial Data Load (Only if connected)
  useEffect(() => {
    if (isConnected) {
      dispatch(syncOrders());
    }
  }, [dispatch, isConnected]);

  // --- Handlers ---

  const handleConnect = () => {
    if (!shopUrl) return;
    
    // Normalize Input: remove https:// and trailing slash
    let cleanShop = shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    // Ensure .myshopify.com is present
    if (!cleanShop.includes('.myshopify.com')) {
      cleanShop += '.myshopify.com';
    }
    
    // Redirect to Backend Auth
    // NOTE: Ensure your Backend is running on port 5000
    window.location.href = `http://localhost:5000/api/shopify/auth?shop=${cleanShop}`;
  };

  const handleGetRates = (order) => {
    setSelectedOrder(order);
    // Hardcoded dimensions for MVP (In real app, add inputs)
    dispatch(getRates({ 
      orderId: order._id, 
      weight: 16, 
      length: 10, 
      width: 6, 
      height: 4 
    }));
  };

  const handleBuyLabel = (rateId) => {
    if (!selectedOrder) return;
    dispatch(buyLabel({ 
      orderId: selectedOrder._id, 
      shipmentId: activeShipmentId, 
      rateId 
    })).then((result) => {
        if (result.payload && result.payload.labelUrl) {
            window.open(result.payload.labelUrl, '_blank');
        }
    });
  };

  const closeModal = () => {
    dispatch(clearRates());
    setSelectedOrder(null);
  };

  // --- RENDER: CONNECT SCREEN (If not logged in) ---
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store size={32} className="text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Store</h2>
          <p className="text-gray-500 mb-8">Enter your Shopify store URL to sync orders and start shipping.</p>
          
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
            
            <p className="text-xs text-center text-gray-400 mt-4">
              You will be redirected to Shopify to approve access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: DASHBOARD (If logged in) ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-500">
              Connected to: <span className="font-semibold text-green-600">{localStorage.getItem('shop_name') || 'Shopify'}</span>
            </p>
          </div>
          
          <button 
            onClick={() => dispatch(syncOrders())}
            disabled={loading}
            className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-70"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Sync Orders
          </button>
        </div>

        {/* Content */}
        <OrderList 
          orders={orders} 
          onGetRates={handleGetRates} 
          loading={loading} 
        />

      </main>

      {/* Popups */}
      <RateModal 
        isOpen={!!selectedOrder && activeRates.length > 0}
        onClose={closeModal}
        rates={activeRates}
        onBuy={handleBuyLabel}
        loading={loading}
      />
    </div>
  );
};

export default Dashboard;