/**
 * TikTok Events API - Server-Side Event Tracking
 *
 * Tracks conversion events server-side for better reliability and accuracy.
 * Complements the client-side TikTok Pixel tracking.
 *
 * https://business-api.tiktok.com/portal/docs?id=1741601162187777
 */

const crypto = require('crypto');

// TikTok Events API Configuration
const PIXEL_CODE = 'D468VMBC77U8B5BDQ5L0';
const ACCESS_TOKEN = '1a886c7e48a06e43e9497da4a96d59c229eaadc2';
const API_VERSION = 'v1.3';
const API_URL = `https://business-api.tiktok.com/open_api/${API_VERSION}/event/track/`;

/**
 * Hash data for privacy compliance (SHA256)
 */
function hashData(data) {
  if (!data) return null;
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

/**
 * Send event to TikTok Events API
 */
async function sendEvent(eventName, eventData, userData, customData = {}, providedEventId = null) {
  try {
    const eventTime = Math.floor(Date.now() / 1000);
    // Use provided event ID for deduplication, or generate a new one
    const eventId = providedEventId || `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Build context object with user data
    const context = {
      user_agent: userData.userAgent || '',
      ip: userData.ip || '',
    };

    // Add page info if available
    if (eventData.sourceUrl) {
      context.page = {
        url: eventData.sourceUrl,
      };
    }

    // Build user object with hashed PII
    const user = {};

    if (userData.email) {
      user.email = hashData(userData.email);
    }

    if (userData.phone) {
      user.phone = hashData(userData.phone);
    }

    // Build properties object for the event
    const properties = {
      ...customData,
    };

    // Build the complete event object
    const event = {
      pixel_code: PIXEL_CODE,
      event: eventName,
      event_id: eventId,
      timestamp: new Date().toISOString(),
      context: context,
      properties: properties,
    };

    // Add user data if available
    if (Object.keys(user).length > 0) {
      event.context.user = user;
    }

    // Add test_event_code for testing (remove in production)
    // event.test_event_code = 'TEST12345';

    console.log(`📊 Sending TikTok event: ${eventName} (Event ID: ${eventId})`);

    // Send to TikTok Events API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': ACCESS_TOKEN,
      },
      body: JSON.stringify({
        event_source: 'web',
        event_source_id: PIXEL_CODE,
        data: [event],
      }),
    });

    const result = await response.json();

    if (response.ok && result.code === 0) {
      console.log(`✅ TikTok Events API: ${eventName} tracked successfully (Event ID: ${eventId})`, result);
      return { success: true, eventId, result };
    } else {
      console.error(`❌ TikTok Events API error:`, result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error(`❌ TikTok Events API exception:`, error);
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

    console.log(`📊 Tracking TikTok event: ${eventName} from IP: ${clientIP}${eventId ? ` (Event ID: ${eventId})` : ''}`);

    // Send event to TikTok Events API with event ID for deduplication
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
    console.error('TikTok tracking error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to track event',
    });
  }
};
