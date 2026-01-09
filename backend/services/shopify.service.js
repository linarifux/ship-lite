import axios from 'axios';
import Shop from '../models/Shop.js';

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
    
    const cleanId = String(shopifyOrderId).replace('gid://shopify/Order/', '');

    const foResponse = await client.get(`/orders/${cleanId}/fulfillment_orders.json`);
    const fulfillmentOrders = foResponse.data.fulfillment_orders;

    if (!fulfillmentOrders || fulfillmentOrders.length === 0) {
      throw new Error(`Shopify returned zero fulfillment orders for ID ${cleanId}. The order might be archived or deleted.`);
    }

    // Find one that is OPEN
    const openOrder = fulfillmentOrders.find(fo => 
      fo.status === 'open' || fo.status === 'in_progress'
    );

    if (!openOrder) {
      // Collect all statuses found to show in the error
      const statuses = fulfillmentOrders.map(fo => `${fo.status} (${fo.delivery_method?.method_type || 'shipping'})`).join(', ');
      throw new Error(`Cannot fulfill. Current Statuses: [${statuses}]. Order must be 'open'.`);
    }

    // Fulfillment ---
    const payload = {
      fulfillment: {
        line_items_by_fulfillment_order: [
          {
            fulfillment_order_id: openOrder.id
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
    
    const response = await client.post('/fulfillments.json', payload);
    return response.data;

  } catch (error) {
    // Log the full error for debugging
    console.error("Shopify Fulfill Error:", error.response?.data || error.message);
    throw error; 
  }
};