import axios from 'axios';
import Shop from '../models/Shop.js';

// Helper to get client for a specific shop
const getShopifyClient = async () => {
  // Get the most recent active shop connection
  const shopData = await Shop.findOne({ isActive: true }).sort({ updatedAt: -1 });
  
  if (!shopData) throw new Error('No active Shopify connection found. Please connect via Dashboard.');

  return axios.create({
    baseURL: `https://${shopData.shop}/admin/api/2024-01`,
    headers: {
      'X-Shopify-Access-Token': shopData.accessToken,
      'Content-Type': 'application/json'
    }
  });
};

export const fetchUnfulfilledOrders = async () => {
  try {
    const client = await getShopifyClient();
    // Get orders that are paid but unfulfilled
    const response = await client.get('/orders.json?status=unfulfilled&financial_status=paid');
    
    return response.data.orders;
  } catch (error) {
    console.error("Shopify Fetch Error:", error.response?.data || error.message);
    return []; 
  }
};

export const fulfillOrder = async (shopifyOrderId, trackingNumber, carrier, trackingUrl) => {
  try {
    const client = await getShopifyClient();
    
    // Clean ID: Ensure we just have the numeric ID
    const cleanId = String(shopifyOrderId).replace('gid://shopify/Order/', '');

    // --- STEP 1: Get Fulfillment Order ID (Required for new API) ---
    // We cannot just fulfill the "Order" directly anymore; we must fulfill the "FulfillmentOrder".
    const foResponse = await client.get(`/orders/${cleanId}/fulfillment_orders.json`);
    const fulfillmentOrders = foResponse.data.fulfillment_orders;

    // Find the first 'open' fulfillment order
    const openOrder = fulfillmentOrders.find(fo => fo.status === 'open' || fo.status === 'in_progress');

    if (!openOrder) {
      throw new Error('No open fulfillment orders found for this order.');
    }

    // --- STEP 2: Create Fulfillment ---
    const payload = {
      fulfillment: {
        line_items_by_fulfillment_order: [
          {
            fulfillment_order_id: openOrder.id
            // Note: If you want to fulfill specific items only, you'd list quantity here.
            // Omitted means "fulfill all available items in this group".
          }
        ],
        tracking_info: {
          number: trackingNumber,
          company: carrier,
          url: trackingUrl
        },
        notify_customer: true
      }
    };
    
    // Post to the general fulfillments endpoint (not the order-specific one)
    const response = await client.post('/fulfillments.json', payload);
    return response.data;

  } catch (error) {
    console.error("Shopify Fulfill Error:", error.response?.data || error.message);
    throw error;
  }
};