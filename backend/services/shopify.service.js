import axios from 'axios';

// UPDATED: Now pure utility, accepts credentials directly
const getShopifyClient = (shopDomain, accessToken) => {
  return axios.create({
    baseURL: `https://${shopDomain}/admin/api/2024-01`,
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json'
    }
  });
};

// UPDATED: Accepts credentials from the controller
export const fetchUnfulfilledOrders = async (shopDomain, accessToken) => {
  try {
    const client = getShopifyClient(shopDomain, accessToken);
    
    // Get orders that are paid but unfulfilled
    const response = await client.get('/orders.json?status=unfulfilled&financial_status=paid');
    
    return response.data.orders;
  } catch (error) {
    console.error(`Shopify Fetch Error (${shopDomain}):`, error.response?.data || error.message);
    return []; 
  }
};

// UPDATED: Accepts credentials from the controller
export const fulfillOrder = async (shopDomain, accessToken, shopifyOrderId, trackingNumber, carrier, trackingUrl) => {
  try {
    const client = getShopifyClient(shopDomain, accessToken);
    
    const cleanId = String(shopifyOrderId).replace('gid://shopify/Order/', '');

    // 1. Get Fulfillment Orders
    const foResponse = await client.get(`/orders/${cleanId}/fulfillment_orders.json`);
    const fulfillmentOrders = foResponse.data.fulfillment_orders;

    if (!fulfillmentOrders || fulfillmentOrders.length === 0) {
      throw new Error(`Shopify returned zero fulfillment orders for ID ${cleanId}. The order might be archived or deleted.`);
    }

    // 2. Find one that is OPEN
    const openOrder = fulfillmentOrders.find(fo => 
      fo.status === 'open' || fo.status === 'in_progress'
    );

    if (!openOrder) {
      const statuses = fulfillmentOrders.map(fo => `${fo.status} (${fo.delivery_method?.method_type || 'shipping'})`).join(', ');
      throw new Error(`Cannot fulfill. Current Statuses: [${statuses}]. Order must be 'open'.`);
    }

    // 3. Create Fulfillment
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
    console.error(`Shopify Fulfill Error (${shopDomain}):`, error.response?.data || error.message);
    throw error; 
  }
};