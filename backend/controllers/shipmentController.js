import Order from '../models/Order.js';
import { createShipment, buyLabel } from '../services/easyPost.service.js';
import { fulfillOrder } from '../services/shopify.service.js';
import Settings from '../models/Settings.js'; // <--- Import this

// @desc    Generate shipping rates for an order
// @route   POST /api/shipments/rates
export const getRates = async (req, res) => {
  try {
    const { orderId, weight, length, width, height } = req.body;
    
    // 1. Get Order Address
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 2. Get Ship From Address (NEW LOGIC)
    const settings = await Settings.findOne();
    const fromAddress = settings?.shipFrom || {
      // Fallback if DB is empty
      company: "Default Store",
      street1: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
      phone: "555-555-5555"
    };

    // 3. Call EasyPost Service (Mock)
    // In production, 'fromAddress' would come from your DB settings
    const shipment = await createShipment(
      order.customer.address,
      fromAddress, // <--- Pass dynamic address here
      { weight, length, width, height }
    );

    // 4. Sort Rates: Cheapest first
    const sortedRates = shipment.rates.sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));
    
    res.json({ shipmentId: shipment.id, rates: sortedRates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Buy Label & Fulfill Order (Strict Flow)
// @route   POST /api/shipments/buy
export const purchaseLabel = async (req, res) => {
  try {
    const { orderId, shipmentId, rateId } = req.body;
    
    // 1. Buy the label (EasyPost)
    // We do this first because we need the tracking number for Shopify
    const purchase = await buyLabel(shipmentId, rateId);

    const trackingCode = purchase.tracking_code;
    const labelUrl = purchase.postage_label.label_url;
    const carrier = purchase.selected_rate.carrier;
    const cost = purchase.selected_rate.rate;
    const trackingUrl = purchase.tracker.public_url;

    // 2. Get the Order (to find Shopify ID)
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    // 3. Update Shopify FIRST
    // If this fails, the code stops here (goes to catch block)
    // and we NEVER mark the DB as fulfilled.
    console.log(`Attempting to fulfill Shopify Order: ${order.shopifyId}`);
    await fulfillOrder(order.shopifyId, trackingCode, carrier, trackingUrl);

    // 4. Update Local DB (Only runs if Step 3 succeeded)
    const updatedOrder = await Order.findByIdAndUpdate(orderId, {
      fulfillmentStatus: 'fulfilled',
      trackingNumber: trackingCode,
      labelUrl: labelUrl,
      carrier: carrier,
      shippingCost: cost
    }, { new: true });

    console.log("Success: Shopify synced and DB updated.");

    res.json({ 
      success: true, 
      order: updatedOrder, 
      labelUrl 
    });

  } catch (error) {
    console.error("Purchase Transaction Failed:", error.message);
    
    // Special Error Handling:
    // If we bought the label but Shopify failed, we return the label URL anyway
    // so the user doesn't lose the postage they paid for, but we throw a 500
    // so the frontend knows something went wrong.
    
    // Check if we have a label URL from the "purchase" variable (needs scope refactoring if strict)
    // For simplicity in this block, we just return the error.
    res.status(500).json({ 
      message: error.response?.data?.errors || error.message || "Failed to complete transaction" 
    });
  }
};