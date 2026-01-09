import Order from '../models/Order.js';
import { fetchUnfulfilledOrders } from '../services/shopify.service.js';

// @desc    Sync orders from Shopify to Local DB
// @route   POST /api/orders/sync
// @access  Public (Protected by Auth Middleware in production)
export const syncOrders = async (req, res) => {
  try {
    // 1. Fetch from Shopify API
    // Note: If you have multi-tenant auth, pass req.user or shop url here
    const shopifyOrders = await fetchUnfulfilledOrders();
  
    if (!shopifyOrders || shopifyOrders.length === 0) {
      return res.status(200).json({ message: 'No new unfulfilled orders found.' });
    }
    
    let importedCount = 0;
    let errorCount = 0;

    // 2. Loop and Upsert
    for (const order of shopifyOrders) {
      try {
        // Defensive check: Ensure address exists before accessing properties
        const shippingAddress = order.shipping_address || {};

        await Order.findOneAndUpdate(
          { shopifyId: String(order.id) }, // Ensure ID is string
          {
            orderNumber: order.name,
            customer: {
              name: shippingAddress.first_name 
                ? `${shippingAddress.first_name} ${shippingAddress.last_name}` 
                : (order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'Unknown'),
              email: order.email || order.contact_email,
              address: {
                street1: shippingAddress.address1 || '',
                city: shippingAddress.city || '',
                state: shippingAddress.province_code || '',
                zip: shippingAddress.zip || '',
                country: shippingAddress.country_code || '',
                phone: shippingAddress.phone || ''
              }
            },
            items: order.line_items.map(item => ({
              title: item.title,
              quantity: item.quantity,
              grams: item.grams,
              sku: item.sku
            })),
            // Only set 'unfulfilled' if it's a NEW document. 
            // If we already fulfilled it locally, don't overwrite status back to unfulfilled!
            $setOnInsert: { fulfillmentStatus: 'unfulfilled' } 
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        importedCount++;
      } catch (err) {
        console.error(`Failed to import order ${order.name}:`, err.message);
        errorCount++;
      }
    }

    res.status(200).json({ 
      message: `Sync complete. Imported: ${importedCount}, Failed: ${errorCount}` 
    });

  } catch (error) {
    console.error("Sync Error:", error);
    res.status(500).json({ message: 'Failed to sync with Shopify', error: error.message });
  }
};

// @desc    Get all orders (optionally filter by status)
// @route   GET /api/orders
// @access  Public
export const getOrders = async (req, res) => {
  try {
    const status = req.query.status; // e.g. ?status=unfulfilled
    const query = status ? { fulfillmentStatus: status } : {};
    
    // Sort by newest first
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};