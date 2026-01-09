import React from 'react';
import { Package, MapPin, Box, Calendar, Truck } from 'lucide-react';

const OrderList = ({ orders, onGetRates, loading }) => {
  // Date Formatter Helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  // 1. Empty State
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="text-gray-300" size={32} />
        </div>
        <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
        <p className="text-gray-500">No unfulfilled orders found.</p>
      </div>
    );
  }

  return (
    <>
      {/* --- DESKTOP VIEW (Table) - Hidden on Mobile --- */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Order</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Customer</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Items</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-medium text-gray-900">{order.orderNumber}</td>
                <td className="py-4 px-6 text-gray-500 text-sm">{formatDate(order.createdAt)}</td>
                <td className="py-4 px-6 text-gray-900 font-medium">
                  {order.customer.name}
                  <div className="text-xs text-gray-400 font-normal">{order.customer.address.city}, {order.customer.address.state}</div>
                </td>
                <td className="py-4 px-6 text-gray-600 text-sm">
                   {order.lineItems?.length || 0} items
                </td>
                <td className="py-4 px-6 text-right">
                  <button 
                    onClick={() => onGetRates(order)}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
                  >
                    Get Rates
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MOBILE VIEW (Cards) - Hidden on Desktop --- */}
      <div className="md:hidden space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
            
            {/* Header: ID & Date */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold">Order</span>
                <p className="text-lg font-bold text-gray-900">{order.orderNumber}</p>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                <Calendar size={14} />
                {formatDate(order.createdAt)}
              </div>
            </div>

            {/* Info Block */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-gray-400"><MapPin size={18} /></div>
                <div>
                  <p className="font-medium text-gray-900">{order.customer.name}</p>
                  <p className="text-sm text-gray-500">{order.customer.address.city}, {order.customer.address.state}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-gray-400"><Box size={18} /></div>
                <p className="text-sm text-gray-700">{order.lineItems?.length || 0} Items to ship</p>
              </div>
            </div>

            {/* Action Button */}
            <button 
              onClick={() => onGetRates(order)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-bold active:scale-95 transition-all shadow-md shadow-blue-200 disabled:opacity-50"
            >
              <Truck size={18} />
              Get Shipping Rates
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default OrderList;