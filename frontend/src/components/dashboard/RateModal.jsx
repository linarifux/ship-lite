import React, { useState, useEffect } from 'react';
import { X, Truck, AlertCircle, Loader2, Package } from 'lucide-react';

const RateModal = ({ isOpen, onClose, rates, onBuy, loading, error }) => {
  // Local state to track WHICH rate is being bought so we don't change text on all buttons
  const [buyingRateId, setBuyingRateId] = useState(null);

  // Reset local state when loading finishes or modal closes
  useEffect(() => {
    if (!loading) setBuyingRateId(null);
  }, [loading, isOpen]);

  if (!isOpen) return null;

  const handleBuyClick = (rateId) => {
    setBuyingRateId(rateId);
    onBuy(rateId);
  };

  // Helper to stylize carriers
  const getCarrierStyle = (carrier) => {
    const c = carrier.toLowerCase();
    if (c.includes('usps')) return 'bg-blue-100 text-blue-600';
    if (c.includes('ups')) return 'bg-amber-100 text-amber-700';
    if (c.includes('fedex')) return 'bg-orange-100 text-orange-600';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Container: Added max-h for mobile landscape/small screens */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
               <Package size={18} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Select Shipping Rate</h2>
          </div>
          <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 shrink-0">
            <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Rate List - Scrollable Area */}
        <div className="overflow-y-auto p-2">
          {rates.map((rate) => {
            const isBuyingThis = loading && buyingRateId === rate.id;
            
            return (
              <div 
                key={rate.id}
                className={`flex items-center justify-between p-4 rounded-xl transition-all border-b border-gray-50 last:border-0 
                  ${loading ? 'opacity-60 grayscale-[0.5]' : 'hover:bg-slate-50'} 
                  ${isBuyingThis ? 'opacity-100! !grayscale-0 bg-blue-50 ring-1 ring-blue-100' : ''}
                `}
              >
                {/* Left: Carrier Info */}
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-full transition-colors ${getCarrierStyle(rate.carrier)}`}>
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{rate.carrier}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{rate.service}</p>
                  </div>
                </div>
                
                {/* Right: Price & Button */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${rate.rate}</p>
                    <p className="text-xs text-gray-500">{rate.delivery_days} days</p>
                  </div>
                  
                  <button
                    onClick={() => handleBuyClick(rate.id)}
                    disabled={loading}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 whitespace-nowrap flex items-center gap-2
                      ${isBuyingThis 
                        ? 'bg-blue-600 text-white cursor-wait' 
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
                      }
                    `}
                  >
                    {isBuyingThis && <Loader2 size={16} className="animate-spin" />}
                    {isBuyingThis ? 'Buying...' : 'Buy Label'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 text-right shrink-0 border-t border-gray-100">
          <span className="text-xs text-gray-400 font-medium">Rates provided via EasyPost Mock</span>
        </div>
      </div>
    </div>
  );
};

export default RateModal;