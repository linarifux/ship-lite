import React from 'react';
import { Package, MapPin, Scale } from 'lucide-react';

const OrderList = ({ orders, onGetRates, loading }) => {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
        <Package size={48} className="mb-4 opacity-20" />
        <p>No unfulfilled orders found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {orders.map((order) => {
        // Safe check for items array
        const totalWeight = order.items?.reduce((acc, item) => acc + (item.grams || 0), 0) || 0;
        
        return (
          <div key={order._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Order Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-bold text-gray-900">{order.orderNumber}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 uppercase tracking-wide">
                  {order.fulfillmentStatus}
                </span>
              </div>
              
              <div className="flex items-start gap-2 text-gray-600 text-sm mb-1">
                <MapPin size={16} className="mt-0.5 text-gray-400 shrink-0" />
                <p>
                  <span className="font-medium text-gray-900">{order.customer?.name}</span>
                  <span className="mx-2 text-gray-300">|</span>
                  {order.customer?.address?.city}, {order.customer?.address?.state}
                </p>
              </div>

              <div className="flex items-center gap-2 text-gray-400 text-xs ml-6">
                <Scale size={14} />
                <span>Est. Weight: {(totalWeight / 28.35).toFixed(1)} oz</span>
                <span className="mx-1">•</span>
                <span>{order.items?.length || 0} items</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => onGetRates(order)}
                disabled={loading}
                className="bg-white border border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                Get Rates
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderList;