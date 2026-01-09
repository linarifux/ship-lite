import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHistory } from '../features/shipment/shipmentSlice';
import { PackageCheck, Printer, Store, Link as LinkIcon } from 'lucide-react';

const Shipments = () => {
  const dispatch = useDispatch();
  const { history, loading } = useSelector((state) => state.shipment);
  
  // --- Auth State ---
  const [shopUrl, setShopUrl] = useState('');
  const [isConnected, setIsConnected] = useState(!!localStorage.getItem('shop_connected'));

  useEffect(() => {
    // Only fetch history if we are actually connected
    if (isConnected) {
      dispatch(fetchHistory());
    }
  }, [dispatch, isConnected]);

  const handleReprint = (url) => {
    if (url) window.open(url, '_blank');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleConnect = () => {
    if (!shopUrl) return;
    let cleanShop = shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!cleanShop.includes('.myshopify.com')) {
      cleanShop += '.myshopify.com';
    }
    window.location.href = `http://localhost:5000/api/shopify/auth?shop=${cleanShop}`;
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
          <p className="text-gray-500 mb-8">Enter your Shopify store URL to view your shipment history.</p>
          
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
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: SHIPMENT HISTORY (If logged in) ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <main className="max-w-6xl mx-auto px-6 py-8">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <PackageCheck size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Shipment History</h2>
            <p className="text-gray-500 text-sm">View past shipments and reprint labels</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <PackageCheck className="text-gray-300" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No shipments yet</h3>
            <p className="text-gray-500">Orders you fulfill will appear here.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Order</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Date Shipped</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Carrier</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Tracking</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="py-4 px-6 text-gray-500 text-sm">{formatDate(order.updatedAt)}</td>
                    <td className="py-4 px-6 text-gray-900 font-medium">
                        {order.customer.name}
                        <div className="text-xs text-gray-400 font-normal">{order.customer.address.city}, {order.customer.address.state}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {order.carrier}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-sm text-gray-600">{order.trackingNumber}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleReprint(order.labelUrl)}
                          className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                        >
                          <Printer size={16} />
                          Reprint
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Shipments;