// Vercel serverless function for canceling Stripe subscriptions

const { createClient } = require('@supabase/supabase-js');

// Initialize Stripe client
function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('Stripe secret key not configured');
  }

  const stripe = require('stripe')(secretKey);
  return stripe;
}

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { email, subscriptionId } = req.body;

    // Validate required fields
    if (!email && !subscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'Either email or subscriptionId is required',
      });
    }

    console.log('Canceling subscription for:', email || subscriptionId);

    const stripe = getStripeClient();
    const supabase = getSupabaseClient();

    // Step 1: Find subscription in database
    let query = supabase
      .from('subscriptions')
      .select('*')
      .in('status', ['active', 'trial']);

    if (subscriptionId) {
      query = query.eq('stripe_subscription_id', subscriptionId); // Using new column name after migration
    } else if (email) {
      query = query.eq('email', email);
    }

    const { data: subscriptions, error: fetchError } = await query.limit(1);

    console.log('Query result:', { subscriptions, fetchError });

    if (fetchError) {
      console.error('Database fetch error:', fetchError);
      throw new Error('Database error: ' + fetchError.message);
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No active subscription found for email:', email);
      // Also check all subscriptions for this email to help debug
      const { data: allSubs } = await supabase
        .from('subscriptions')
        .select('id, status, email')
        .eq('email', email);
      console.log('All subscriptions for this email:', allSubs);

      return res.status(404).json({
        success: false,
        message: 'No active subscription found',
        debug: allSubs ? `Found ${allSubs.length} subscription(s) with status: ${allSubs.map(s => s.status).join(', ')}` : 'No subscriptions found'
      });
    }

    const subscription = subscriptions[0];
    console.log('Database subscription row:', JSON.stringify(subscription, null, 2));

    const stripeSubscriptionId = subscription.stripe_subscription_id; // Using new column name after migration

    console.log('Found subscription:', stripeSubscriptionId);
    console.log('Subscription object keys:', Object.keys(subscription));

    if (!stripeSubscriptionId || stripeSubscriptionId === subscription.id) {
      console.error('ERROR: stripe_subscription_id is missing or equals database id!');
      return res.status(500).json({
        success: false,
        message: 'Invalid subscription data: missing Stripe subscription ID',
        debug: {
          hasStripeSubId: !!subscription.stripe_subscription_id,
          subscriptionKeys: Object.keys(subscription),
        }
      });
    }

    // Step 2: Cancel subscription in Stripe at period end
    // This keeps the subscription active until the end of the current billing/trial period
    const canceledSubscription = await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    console.log('Stripe subscription updated:', {
      id: canceledSubscription.id,
      status: canceledSubscription.status,
      cancel_at_period_end: canceledSubscription.cancel_at_period_end,
      current_period_end: canceledSubscription.current_period_end,
      current_period_end_type: typeof canceledSubscription.current_period_end,
    });

    // Step 3: Update subscription in database
    // Keep status as 'active' or 'trial' but mark for cancellation
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString(),
        // Don't change status - let it stay active/trial until period ends
      })
      .eq('id', subscription.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update database:', updateError);
      throw new Error('Failed to update subscription status');
    }

    // Step 4: Log cancellation event
    await supabase.from('subscription_events').insert({
      subscription_id: subscription.id,
      stripe_subscription_id: stripeSubscriptionId, // Using new column name after migration
      event_type: 'canceled',
      event_source: 'api',
      event_data: {
        canceled_by: 'user',
        email: subscription.email,
        canceled_at: new Date().toISOString(),
      },
    });

    console.log('Subscription canceled successfully');

    // Step 5: Return success response
    // Use Stripe's current_period_end since it's the source of truth
    let periodEndDate = null;
    if (canceledSubscription.current_period_end) {
      try {
        console.log('Converting period_end:', canceledSubscription.current_period_end, '(type:', typeof canceledSubscription.current_period_end, ')');
        const timestamp = canceledSubscription.current_period_end;

        // Validate that timestamp is a valid number
        if (typeof timestamp !== 'number' || isNaN(timestamp)) {
          console.error('ERROR: current_period_end is not a valid number:', timestamp);
        } else {
          const milliseconds = timestamp * 1000;
          console.log('Milliseconds:', milliseconds);

          // Validate that milliseconds is a valid number
          if (isNaN(milliseconds) || !isFinite(milliseconds)) {
            console.error('ERROR: milliseconds conversion produced invalid value:', milliseconds);
          } else {
            const date = new Date(milliseconds);

            // Validate that the Date object is valid before calling toISOString()
            if (isNaN(date.getTime())) {
              console.error('ERROR: Date object is invalid for timestamp:', timestamp);
            } else {
              periodEndDate = date.toISOString();
              console.log('Successfully converted to ISO:', periodEndDate);
            }
          }
        }
      } catch (e) {
        console.error('ERROR converting period end date:', e.message);
        console.error('Original value:', canceledSubscription.current_period_end);
      }
    } else {
      console.warn('No current_period_end from Stripe subscription');
    }

    return res.status(200).json({
      success: true,
      message: 'Subscription will be canceled at the end of the current period',
      subscription: {
        id: updatedSubscription.id,
        stripe_subscription_id: stripeSubscriptionId, // Using new column name after migration
        status: updatedSubscription.status, // Keep current status (active/trial)
        cancel_at_period_end: true,
        canceled_at: updatedSubscription.canceled_at,
        current_period_end: periodEndDate, // Use Stripe's value converted to ISO string (or null)
      },
    });

  } catch (error) {
    console.error('Subscription cancellation error:', error);

    // Handle specific Stripe API errors
    let errorMessage = 'Failed to cancel subscription';
    let statusCode = 500;

    if (error.type === 'StripeInvalidRequestError') {
      statusCode = 400;
      errorMessage = error.message || 'Invalid subscription';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
    });
  }
};
