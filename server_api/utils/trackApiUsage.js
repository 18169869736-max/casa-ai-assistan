const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not configured for API tracking');
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Track API usage for analytics and monitoring
 * @param {Object} params - Tracking parameters
 * @param {string} params.userId - User ID (optional)
 * @param {string} params.email - User email (optional)
 * @param {string} params.endpoint - API endpoint path
 * @param {string} params.method - HTTP method
 * @param {number} params.statusCode - Response status code
 * @param {number} params.responseTimeMs - Response time in milliseconds
 */
async function trackApiUsage({
  userId = null,
  email = null,
  endpoint,
  method,
  statusCode,
  responseTimeMs
}) {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      console.error('Cannot track API usage: Supabase client not initialized');
      return;
    }

    console.log('Tracking API usage:', {
      userId,
      email,
      endpoint,
      method,
      statusCode,
      responseTimeMs
    });

    // Don't block the main request if tracking fails
    const { data, error } = await supabase
      .from('api_usage_logs')
      .insert({
        user_id: userId,
        email,
        endpoint,
        method,
        status_code: statusCode,
        response_time_ms: responseTimeMs,
      })
      .select();

    if (error) {
      console.error('Error tracking API usage:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ API usage tracked successfully:', data);
    }
  } catch (err) {
    console.error('Failed to track API usage:', err);
    console.error('Exception details:', err.message, err.stack);
  }
}

/**
 * Middleware wrapper to automatically track API usage
 * Usage: module.exports = trackApiMiddleware(handler, '/api/endpoint-name');
 */
function trackApiMiddleware(handler, endpointName) {
  return async (req, res) => {
    const startTime = Date.now();
    const originalJson = res.json.bind(res);
    const originalStatus = res.status.bind(res);

    let statusCode = 200;

    // Intercept status code
    res.status = (code) => {
      statusCode = code;
      return originalStatus(code);
    };

    // Intercept json response to track after sending
    res.json = (data) => {
      const responseTime = Date.now() - startTime;

      // Extract user info from request body if available
      const userId = req.body?.userId || null;
      const email = req.body?.email || null;

      // Track usage asynchronously (don't await)
      trackApiUsage({
        userId,
        email,
        endpoint: endpointName,
        method: req.method,
        statusCode,
        responseTimeMs: responseTime,
      });

      return originalJson(data);
    };

    return handler(req, res);
  };
}

module.exports = {
  trackApiUsage,
  trackApiMiddleware
};
