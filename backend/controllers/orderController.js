import Order from '../models/Order.js';
import Shop from '../models/Shop.js';
import { fetchUnfulfilledOrders } from '../services/shopify.service.js';

// @desc    Sync orders from Shopify
// @route   POST /api/orders/sync
export const syncOrders = async (req, res) => {
  try {
    // 1. Get the shop name from the header (sent by Frontend api.js)
    const shopDomain = req.headers['x-shop-domain'];

    if (!shopDomain) {
      return res.status(400).json({ message: "No shop domain provided in headers" });
    }

    // 2. Find the SPECIFIC shop in the DB to get its Access Token
    const shop = await Shop.findOne({ shop: shopDomain });

    if (!shop) {
      return res.status(401).json({ message: `Shop ${shopDomain} not found. Please reconnect.` });
    }

    console.log(`Syncing orders for: ${shop.shop}`);

    // 3. Fetch from Shopify using THAT shop's credentials
    const shopifyOrders = await fetchUnfulfilledOrders(shop.shop, shop.accessToken);

    // 4. Save Orders (Associate them with this specific shop)
    let syncCount = 0;

    for (const orderData of shopifyOrders) {
      
      // Map Line Items
      const items = orderData.line_items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        grams: item.grams,
        sku: item.sku,
        price: item.price
      }));

      // Calculate safe total weight if missing
      const calculatedWeight = items.reduce((sum, item) => sum + (item.grams || 0), 0);

      // UPSERT: Update if exists, Insert if new
      await Order.findOneAndUpdate(
        { orderId: orderData.id }, // Find by Shopify Order ID
        {
          shop: shop.shop, // <--- CRITICAL: Save the Shop Domain!
          orderId: orderData.id,
          orderNumber: orderData.name,
          email: orderData.email,
          financialStatus: orderData.financial_status,
          fulfillmentStatus: orderData.fulfillment_status || 'unfulfilled',
          totalPrice: orderData.total_price,
          currency: orderData.currency,
          
          // Map Customer & Shipping Address
          customer: {
            name: orderData.shipping_address 
              ? orderData.shipping_address.name 
              : (orderData.customer ? `${orderData.customer.first_name} ${orderData.customer.last_name}` : 'Guest'),
            email: orderData.email,
            phone: orderData.shipping_address?.phone,
            address: {
              line1: orderData.shipping_address?.address1 || '',
              line2: orderData.shipping_address?.address2 || '',
              city: orderData.shipping_address?.city || '',
              state: orderData.shipping_address?.province_code || '',
              zip: orderData.shipping_address?.zip || '',
              country: orderData.shipping_address?.country_code || ''
            }
          },
          
          lineItems: items,
          totalWeight: orderData.total_weight || calculatedWeight,
          createdAt: orderData.created_at
        },
        { upsert: true, new: true }
      );
      syncCount++;
    }

    res.json({ success: true, count: syncCount, message: `Synced ${syncCount} orders for ${shop.shop}` });

  } catch (error) {
    console.error("Sync Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Filtered by Shop & Status)
// @route   GET /api/orders
export const getOrders = async (req, res) => {
  try {
    // 1. Get the shop domain from the header
    const shopDomain = req.headers['x-shop-domain'];

    if (!shopDomain) {
      return res.status(400).json({ message: "Shop domain missing" });
    }

    // 2. Build Query
    // We filter by 'shop' AND 'fulfillmentStatus' (from query param)
    const { status } = req.query; // e.g. 'unfulfilled' or 'fulfilled'
    
    let query = { 
      shop: shopDomain // <--- CRITICAL FIX: Only find orders for THIS shop
    };

    if (status) {
      query.fulfillmentStatus = status;
    }

    // 3. Execute Query
    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};