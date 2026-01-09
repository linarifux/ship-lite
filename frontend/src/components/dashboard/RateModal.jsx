import React from 'react';
import { X, Truck, AlertCircle } from 'lucide-react';

const RateModal = ({ isOpen, onClose, rates, onBuy, loading, error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Select Shipping Rate</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* ERROR ALERT (For Purchase Failures) */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Rate List */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {rates.map((rate) => (
            <div 
              key={rate.id}
              className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors border-b border-gray-50 last:border-0 group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-2.5 rounded-full group-hover:bg-blue-100 transition-colors">
                  <Truck size={20} className="text-gray-500 group-hover:text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{rate.carrier}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{rate.service}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-gray-900">${rate.rate}</p>
                  <p className="text-xs text-gray-500">{rate.delivery_days} days</p>
                </div>
                
                {/* UPDATED BUTTON: Text instead of Icon */}
                <button
                  onClick={() => onBuy(rate.id)}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {loading ? 'Buying...' : 'Buy Label'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 text-right">
          <span className="text-xs text-gray-400">Rates provided via EasyPost Mock</span>
        </div>
      </div>
    </div>
  );
};

export default RateModal;