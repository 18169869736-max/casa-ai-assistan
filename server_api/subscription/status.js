// Vercel serverless function for checking user subscription status

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }

  return createClient(supabaseUrl, supabaseKey);
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Check if environment variables are configured
    if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_ANON_KEY)) {
      console.error('Missing Supabase environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Missing database credentials',
        error: 'SUPABASE_URL or SUPABASE_ANON_KEY not configured'
      });
    }
    // Get email from request body or query params
    const email = req.body?.email || req.query?.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    console.log('Checking subscription status for:', email);

    const supabase = getSupabaseClient();

    // Get active subscription for this email
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('email', email)
      .in('status', ['active', 'trial', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to query subscription status');
    }

    // If no active subscription found
    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({
        success: true,
        subscription: {
          isActive: false,
          planType: 'free',
          status: 'none',
          trialDaysRemaining: 0,
          nextBillingDate: null,
        },
      });
    }

    const subscription = subscriptions[0];

    // Calculate trial days remaining
    let trialDaysRemaining = 0;
    if (subscription.status === 'trial' && subscription.trial_end_date) {
      const trialEnd = new Date(subscription.trial_end_date);
      const now = new Date();
      const diffTime = trialEnd - now;
      trialDaysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    // Return subscription status
    return res.status(200).json({
      success: true,
      subscription: {
        isActive: subscription.status === 'active' || subscription.status === 'trial',
        planType: subscription.plan_type,
        status: subscription.status,
        trialDaysRemaining,
        trialEndDate: subscription.trial_end_date,
        nextBillingDate: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        stripeSubscriptionId: subscription.stripe_subscription_id, // Using new column name after migration
      },
    });

  } catch (error) {
    console.error('Subscription check failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check subscription status',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
    });
  }
};