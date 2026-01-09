import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHistory } from '../features/shipment/shipmentSlice';
import { PackageCheck, Printer, Store, Link as LinkIcon, Calendar, MapPin, Hash, Truck } from 'lucide-react';

const Shipments = () => {
  const dispatch = useDispatch();
  const { history, loading } = useSelector((state) => state.shipment);
  
  // --- Auth State ---
  const [shopUrl, setShopUrl] = useState('');
  const [isConnected, setIsConnected] = useState(!!localStorage.getItem('shop_connected'));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected')) {
      setIsConnected(true);
      localStorage.setItem('shop_connected', 'true');
      localStorage.setItem('shop_name', params.get('shop'));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
      dispatch(fetchHistory());
    }
  }, [dispatch, isConnected]);

  const handleReprint = (url) => {
    if (url) window.open(url, '_blank');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
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

  // --- RENDER: CONNECT SCREEN ---
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

  // --- RENDER: SHIPMENT HISTORY ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header */}
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
          <>
            {/* --- DESKTOP VIEW (Table) - Hidden on Mobile --- */}
            <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
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
                        <button 
                          onClick={() => handleReprint(order.labelUrl)}
                          className="inline-flex items-center gap-1.5 text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                        >
                          <Printer size={16} /> Reprint
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- MOBILE VIEW (Cards) - Hidden on Desktop --- */}
            <div className="md:hidden space-y-4">
              {history.map((order) => (
                <div key={order._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
                  
                  {/* Top Row: Order ID & Date */}
                  <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-semibold">Order</span>
                      <p className="text-lg font-bold text-gray-900">{order.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                        <Calendar size={14} />
                        {formatDate(order.updatedAt)}
                      </div>
                    </div>
                  </div>

                  {/* Middle Info Block */}
                  <div className="space-y-3">
                    {/* Customer */}
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-gray-400">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{order.customer.name}</p>
                        <p className="text-sm text-gray-500">{order.customer.address.city}, {order.customer.address.state}</p>
                      </div>
                    </div>

                    {/* Carrier & Tracking */}
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-gray-400">
                        <Truck size={18} />
                      </div>
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-900">Carrier</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {order.carrier}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                          <Hash size={14} className="text-gray-400" />
                          <p className="font-mono text-sm text-gray-600 break-all">{order.trackingNumber}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={() => handleReprint(order.labelUrl)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-lg font-medium active:scale-95 transition-all shadow-md shadow-gray-200"
                  >
                    <Printer size={18} />
                    Reprint Label
                  </button>

                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Shipments;