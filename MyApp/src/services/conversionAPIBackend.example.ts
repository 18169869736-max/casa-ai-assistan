/**
 * Backend API Example for Facebook Conversions API (CAPI)
 *
 * This is an example of how your backend should handle Conversions API requests.
 * You should implement this on your server (Node.js, Python, etc.)
 *
 * Why use a backend?
 * 1. Keep your Facebook Pixel Access Token secure (never expose it in the app)
 * 2. Add server-side data enrichment (IP address, user agent, etc.)
 * 3. Implement request validation and rate limiting
 * 4. Handle retries and error logging
 *
 * Requirements:
 * - Facebook Pixel ID (from your Facebook Events Manager)
 * - Conversions API Access Token (from Facebook Business Settings)
 * - Server with HTTPS endpoint
 */

import crypto from 'crypto';

// Configuration - Store these in environment variables
const CONFIG = {
  FACEBOOK_PIXEL_ID: process.env.FACEBOOK_PIXEL_ID || 'YOUR_PIXEL_ID',
  FACEBOOK_ACCESS_TOKEN: process.env.FACEBOOK_CAPI_TOKEN || 'YOUR_ACCESS_TOKEN',
  FACEBOOK_API_VERSION: 'v18.0',
};

// Type definitions
interface ConversionAPIEvent {
  event_name: string;
  event_time: number;
  event_source_url?: string;
  action_source: 'app' | 'website';
  user_data: {
    client_ip_address?: string;
    client_user_agent?: string;
    em?: string;
    ph?: string;
    external_id?: string;
    fbp?: string;
    fbc?: string;
  };
  custom_data?: Record<string, any>;
  app_data?: {
    advertiser_tracking_enabled: number;
    application_tracking_enabled: number;
    extinfo?: string[];
  };
}

interface ConversionAPIRequest {
  events: ConversionAPIEvent[];
  test_event_code?: string; // For testing in Events Manager
}

/**
 * Hash user data using SHA-256
 * Facebook requires specific normalization before hashing
 */
function hashData(data: string): string {
  return crypto
    .createHash('sha256')
    .update(data.toLowerCase().trim())
    .digest('hex');
}

/**
 * Enrich event data with server-side information
 * This improves attribution and is not affected by ATT
 */
function enrichEventData(
  event: ConversionAPIEvent,
  req: any // Express request object or similar
): ConversionAPIEvent {
  // Add server-side data that can't be collected client-side
  return {
    ...event,
    user_data: {
      ...event.user_data,
      // Get real IP address (handle proxies/load balancers)
      client_ip_address:
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress,
      // Get user agent
      client_user_agent: req.headers['user-agent'],
    },
  };
}

/**
 * Send events to Facebook Conversions API
 * This is the main function your backend should expose
 */
export async function sendToFacebookConversionsAPI(
  req: any, // Express request object
  res: any  // Express response object
) {
  try {
    const requestBody: ConversionAPIRequest = req.body;

    // Validate request
    if (!requestBody.events || !Array.isArray(requestBody.events)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: events array required',
      });
    }

    // Enrich each event with server-side data
    const enrichedEvents = requestBody.events.map((event) =>
      enrichEventData(event, req)
    );

    // Prepare Conversions API payload
    const payload = {
      data: enrichedEvents,
      // Optional: Add test_event_code for testing in Events Manager
      ...(requestBody.test_event_code && {
        test_event_code: requestBody.test_event_code,
      }),
    };

    // Send to Facebook Conversions API
    const facebookUrl = `https://graph.facebook.com/${CONFIG.FACEBOOK_API_VERSION}/${CONFIG.FACEBOOK_PIXEL_ID}/events`;

    const response = await fetch(facebookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        access_token: CONFIG.FACEBOOK_ACCESS_TOKEN,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Facebook Conversions API error:', responseData);
      return res.status(response.status).json({
        success: false,
        error: 'Facebook API error',
        details: responseData,
      });
    }

    // Log successful events (for monitoring)
    console.log('Successfully sent events to Facebook:', {
      events_received: responseData.events_received,
      messages: responseData.messages,
    });

    return res.json({
      success: true,
      events_received: responseData.events_received,
      fbtrace_id: responseData.fbtrace_id, // For debugging with Facebook
    });
  } catch (error) {
    console.error('Error sending to Conversions API:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * Express.js example route setup
 *
 * Example usage:
 *
 * import express from 'express';
 * import { sendToFacebookConversionsAPI } from './conversionAPIBackend';
 *
 * const app = express();
 * app.use(express.json());
 *
 * // Facebook Conversions API endpoint
 * app.post('/api/facebook/conversions', sendToFacebookConversionsAPI);
 *
 * app.listen(3000, () => {
 *   console.log('Server running on port 3000');
 * });
 */

/**
 * Next.js API Route example
 *
 * Create file: pages/api/facebook/conversions.ts
 *
 * import type { NextApiRequest, NextApiResponse } from 'next';
 * import { sendToFacebookConversionsAPI } from '@/lib/conversionAPIBackend';
 *
 * export default async function handler(
 *   req: NextApiRequest,
 *   res: NextApiResponse
 * ) {
 *   if (req.method !== 'POST') {
 *     return res.status(405).json({ error: 'Method not allowed' });
 *   }
 *
 *   return sendToFacebookConversionsAPI(req, res);
 * }
 */

/**
 * Python Flask example
 *
 * from flask import Flask, request, jsonify
 * import hashlib
 * import requests
 * import os
 *
 * app = Flask(__name__)
 *
 * FACEBOOK_PIXEL_ID = os.getenv('FACEBOOK_PIXEL_ID')
 * FACEBOOK_ACCESS_TOKEN = os.getenv('FACEBOOK_CAPI_TOKEN')
 *
 * @app.route('/api/facebook/conversions', methods=['POST'])
 * def facebook_conversions():
 *     try:
 *         data = request.get_json()
 *         events = data.get('events', [])
 *
 *         # Enrich events with server-side data
 *         for event in events:
 *             if 'user_data' not in event:
 *                 event['user_data'] = {}
 *
 *             event['user_data']['client_ip_address'] = request.remote_addr
 *             event['user_data']['client_user_agent'] = request.headers.get('User-Agent')
 *
 *         # Send to Facebook
 *         fb_url = f'https://graph.facebook.com/v18.0/{FACEBOOK_PIXEL_ID}/events'
 *         payload = {
 *             'data': events,
 *             'access_token': FACEBOOK_ACCESS_TOKEN
 *         }
 *
 *         response = requests.post(fb_url, json=payload)
 *         return jsonify(response.json()), response.status_code
 *
 *     except Exception as e:
 *         return jsonify({'error': str(e)}), 500
 *
 * if __name__ == '__main__':
 *     app.run(port=3000)
 */

// Export for use in other modules
export { CONFIG, hashData, enrichEventData };
