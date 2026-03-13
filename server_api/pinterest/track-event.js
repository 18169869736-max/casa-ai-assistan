/**
 * Pinterest Conversions API - Server-Side Event Tracking
 *
 * Tracks conversion events server-side for better reliability and accuracy.
 * Complements the client-side Pinterest Pixel tracking.
 *
 * https://developers.pinterest.com/docs/conversions/conversions/
 */

const crypto = require('crypto');

// Pinterest Conversions API Configuration
const AD_ACCOUNT_ID = process.env.PINTEREST_AD_ACCOUNT_ID; // Extract from tag ID 2612840749742
const ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN;
const API_VERSION = 'v5';
const API_URL = `https://api.pinterest.com/${API_VERSION}/ad_accounts/${AD_ACCOUNT_ID}/events`;

/**
 * Hash data for privacy compliance (SHA256)
 */
function hashData(data) {
  if (!data) return null;
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

/**
 * Send event to Pinterest Conversions API
 */
async function sendEvent(eventName, eventData, userData, customData = {}, providedEventId = null) {
  try {
    const eventTime = Math.floor(Date.now() / 1000);
    // Use provided event ID for deduplication, or generate a new one
    const eventId = providedEventId || `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Build user data object with hashed PII
    const user_data = {};

    // Add hashed email if available
    if (userData.email) {
      user_data.em = [hashData(userData.email)];
    }

    // Add hashed phone if available
    if (userData.phone) {
      user_data.ph = [hashData(userData.phone)];
    }

    // Add client IP address (hashed for privacy)
    if (userData.ip) {
      user_data.client_ip_address = userData.ip;
    }

    // Add user agent
    if (userData.userAgent) {
      user_data.client_user_agent = userData.userAgent;
    }

    // Add click ID if available
    if (userData.clickId) {
      user_data.click_id = userData.clickId;
    }

    // Build event data
    const event = {
      event_name: eventName,
      event_time: eventTime,
      event_id: eventId,
      event_source_url: eventData.sourceUrl || 'https://casa-ai-assistant.vercel.app',
      action_source: 'web',
      user_data: user_data,
    };

    // Add custom data if provided (for checkout events)
    if (Object.keys(customData).length > 0) {
      event.custom_data = {
        ...customData,
      };
    }

    // Pinterest requires data array
    const requestBody = {
      data: [event],
    };

    console.log(`📊 Sending Pinterest event: ${eventName} (Event ID: ${eventId})`);

    // Send to Pinterest Conversions API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ Pinterest Conversions API: ${eventName} tracked successfully (Event ID: ${eventId})`, result);
      return { success: true, eventId, result };
    } else {
      console.error(`❌ Pinterest Conversions API error:`, result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error(`❌ Pinterest Conversions API exception:`, error);
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

    console.log(`📊 Tracking Pinterest event: ${eventName} from IP: ${clientIP}${eventId ? ` (Event ID: ${eventId})` : ''}`);

    // Send event to Pinterest Conversions API with event ID for deduplication
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
    console.error('Pinterest tracking error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to track event',
    });
  }
};
