import crypto from 'crypto';
import querystring from 'querystring';
import axios from 'axios';
import Shop from '../models/Shop.js';

// @desc    Initiate OAuth - Redirect user to Shopify
// @route   GET /api/shopify/auth?shop=storename.myshopify.com
export const install = (req, res) => {
  const { shop } = req.query;

  if (!shop) {
    return res.status(400).send('Missing shop parameter');
  }

  // Generate a random nonce for security
  const state = crypto.randomBytes(16).toString('hex');
  const redirectUri = `${process.env.HOST}/api/shopify/callback`;
  
  // Build the authorization URL
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${process.env.SHOPIFY_SCOPES}&state=${state}&redirect_uri=${redirectUri}`;

  // Redirect the user's browser to Shopify
  res.redirect(installUrl);
};

// @desc    Handle Callback - Validate HMAC & Get Token
// @route   GET /api/shopify/callback
export const callback = async (req, res) => {
  const { shop, hmac, code, state } = req.query;

  if (!shop || !hmac || !code) {
    return res.status(400).send('Required parameters missing');
  }

  // 1. Validate HMAC (Security Check)
  // We must verify the request actually came from Shopify
  const map = Object.assign({}, req.query);
  delete map['hmac'];
  const message = querystring.stringify(map);
  const generatedHash = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
    .update(message)
    .digest('hex');

  if (generatedHash !== hmac) {
    return res.status(400).send('HMAC validation failed');
  }

  // 2. Exchange Code for Access Token
  try {
    const accessTokenRequestUrl = `https://${shop}/admin/oauth/access_token`;
    const accessTokenPayload = {
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    };

    const response = await axios.post(accessTokenRequestUrl, accessTokenPayload);
    const accessToken = response.data.access_token;

    // 3. Save to Database
    await Shop.findOneAndUpdate(
      { shop },
      { 
        shop, 
        accessToken, 
        scope: response.data.scope,
        isActive: true 
      },
      { upsert: true, new: true }
    );

    // 4. Redirect back to Frontend
    res.redirect(`${process.env.FRONTEND_URL}/?shop=${shop}&connected=true`);

  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    res.status(500).send('Error exchanging access token');
  }
};