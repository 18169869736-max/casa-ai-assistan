/**
 * Meta Conversion API - Server-Side Event Tracking
 *
 * Tracks conversion events server-side for better reliability and accuracy.
 * Complements the client-side Meta Pixel tracking.
 *
 * https://developers.facebook.com/docs/marketing-api/conversions-api
 */

const crypto = require('crypto');

// Meta Conversion API Configuration
const PIXEL_ID = '711877271388655';
const ACCESS_TOKEN = 'EAAKpDnAK1ZCwBPxn3BZAkNKCKBlf3ZCJYQwDSgecVhMdG53sWDfZA1Ned0PyVONFAWazVf6ZA9DKoDR8VM9qW9XZBagPZB3i2M3PdARzlgbjQa5BuWe1L1VtmvNFGNxiLj3es6GiYsmAd5NOyaw8ZC2iSZC9mYjoG6JZCM0QFCWnECIwjKe8MfkRC1lU5JwN0TMlUZAOwZDZD';
const API_VERSION = 'v21.0';
const API_URL = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;

/**
 * Hash data for privacy compliance
 */
function hashData(data) {
  if (!data) return null;
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

/**
 * Send event to Meta Conversion API
 */
async function sendEvent(eventName, eventData, userData, customData = {}, providedEventId = null) {
  try {
    const eventTime = Math.floor(Date.now() / 1000);
    // Use provided event ID for deduplication, or generate a new one
    const eventId = providedEventId || crypto.randomUUID();

    // Build user data object
    const user_data = {
      client_ip_address: userData.ip,
      client_user_agent: userData.userAgent,
    };

    // Add hashed PII if available
    if (userData.email) {
      user_data.em = hashData(userData.email);
    }
    if (userData.phone) {
      user_data.ph = hashData(userData.phone);
    }
    if (userData.firstName) {
      user_data.fn = hashData(userData.firstName);
    }
    if (userData.lastName) {
      user_data.ln = hashData(userData.lastName);
    }
    if (userData.city) {
      user_data.ct = hashData(userData.city);
    }
    if (userData.state) {
      user_data.st = hashData(userData.state);
    }
    if (userData.zip) {
      user_data.zp = hashData(userData.zip);
    }
    if (userData.country) {
      user_data.country = hashData(userData.country);
    }

    // Add Facebook click ID (fbc) and browser ID (fbp) if available
    if (userData.fbc) {
      user_data.fbc = userData.fbc;
    }
    if (userData.fbp) {
      user_data.fbp = userData.fbp;
    }

    // Build event data
    const event = {
      event_name: eventName,
      event_time: eventTime,
      event_id: eventId,
      event_source_url: eventData.sourceUrl || 'https://spacioai.co',
      action_source: 'website',
      user_data: user_data,
    };

    // Add custom data if provided
    if (Object.keys(customData).length > 0) {
      event.custom_data = customData;
    }

    // Send to Meta Conversion API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [event],
        access_token: ACCESS_TOKEN,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ Meta Conversion API: ${eventName} tracked successfully (Event ID: ${eventId})`, result);
      return { success: true, eventId, result };
    } else {
      console.error(`❌ Meta Conversion API error:`, result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error(`❌ Meta Conversion API exception:`, error);
    return { success: false, error: error.message };
  }
}

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const { eventName, eventData, userData, customData, eventId } = req.body;

    if (!eventName) {
      return res.status(400).json({
        success: false,
        message: 'eventName is required',
      });
    }

    // Extract IP from request headers (works with Vercel/serverless)
    const clientIP =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      '0.0.0.0';

    // Get user agent from request
    const userAgent = req.headers['user-agent'] || '';

    // Merge IP and user agent with provided userData
    const completeUserData = {
      ...userData,
      ip: clientIP,
      userAgent: userAgent,
    };

    if (!completeUserData.userAgent) {
      console.warn('⚠️ No user agent available');
    }

    console.log(`📊 Tracking Meta event: ${eventName} from IP: ${clientIP}${eventId ? ` (Event ID: ${eventId})` : ''}`);

    // Send event to Meta Conversion API with event ID for deduplication
    const result = await sendEvent(eventName, eventData || {}, completeUserData, customData || {}, eventId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: `Event ${eventName} tracked successfully`,
        eventId: result.eventId,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to track event',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Meta tracking error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to track event',
    });
  }
};
