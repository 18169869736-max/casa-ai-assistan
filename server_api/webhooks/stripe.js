// Vercel serverless function for handling Stripe webhook events
// Stripe will send notifications about subscription changes to this endpoint

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

// Handle customer.subscription.created event
async function handleSubscriptionCreated(event, supabase) {
  const subscription = event.data.object;
  console.log('Subscription created:', subscription.id);

  // Update subscription status if it exists
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status === 'trialing' ? 'trial' : 'active',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
    .select();

  if (error) {
    console.error('Failed to update subscription:', error);
  } else {
    console.log('Subscription updated:', data);
  }

  return { success: true };
}

// Handle customer.subscription.updated event
async function handleSubscriptionUpdated(event, supabase) {
  const subscription = event.data.object;
  console.log('Subscription updated:', subscription.id, 'Status:', subscription.status);

  // Map Stripe status to our status
  let status = subscription.status;
  if (status === 'trialing') {
    status = 'trial';
  } else if (status === 'canceled' || status === 'unpaid') {
    status = 'canceled';
  } else if (status === 'past_due') {
    status = 'past_due';
  } else if (status === 'active') {
    status = 'active';
  }

  const updateData = {
    status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end || false,
  };

  if (subscription.canceled_at) {
    updateData.canceled_at = new Date(subscription.canceled_at * 1000).toISOString();
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('stripe_subscription_id', subscription.id)
    .select();

  if (error) {
    console.error('Failed to update subscription:', error);
  } else {
    console.log('Subscription updated:', data);
  }

  return { success: true };
}

// Handle customer.subscription.deleted event
async function handleSubscriptionDeleted(event, supabase) {
  const subscription = event.data.object;
  console.log('Subscription deleted/canceled:', subscription.id);

  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
    .select();

  if (error) {
    console.error('Failed to update subscription:', error);
  } else {
    console.log('Subscription canceled in database:', data);
  }

  return { success: true };
}

// Handle invoice.payment_succeeded event
async function handleInvoicePaymentSucceeded(event, supabase) {
  const invoice = event.data.object;
  console.log('Invoice payment succeeded:', invoice.id, 'Amount:', invoice.amount_paid / 100);

  // Find subscription by Stripe subscription ID
  if (invoice.subscription) {
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('id, stripe_subscription_id')
      .eq('stripe_subscription_id', invoice.subscription)
      .limit(1);

    if (subscriptions && subscriptions.length > 0) {
      const subscription = subscriptions[0];

      // If subscription was past_due, reactivate it
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
        })
        .eq('id', subscription.id)
        .eq('status', 'past_due');

      // Log the successful payment event
      await supabase.from('subscription_events').insert({
        subscription_id: subscription.id,
        stripe_subscription_id: subscription.stripe_subscription_id,
        event_type: 'payment_succeeded',
        event_source: 'webhook',
        event_data: {
          invoice_id: invoice.id,
          amount: invoice.amount_paid / 100,
          currency: invoice.currency,
          status: invoice.status,
        },
      });

      console.log('Payment event logged');
    }
  }

  return { success: true };
}

// Handle invoice.payment_failed event
async function handleInvoicePaymentFailed(event, supabase) {
  const invoice = event.data.object;
  console.log('Invoice payment failed:', invoice.id);

  // Find subscription and update status to past_due
  if (invoice.subscription) {
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('id, stripe_subscription_id')
      .eq('stripe_subscription_id', invoice.subscription)
      .limit(1);

    if (subscriptions && subscriptions.length > 0) {
      const subscription = subscriptions[0];

      // Update subscription status to past_due
      await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
        })
        .eq('id', subscription.id);

      // Log the failed payment
      await supabase.from('subscription_events').insert({
        subscription_id: subscription.id,
        stripe_subscription_id: subscription.stripe_subscription_id,
        event_type: 'payment_failed',
        event_source: 'webhook',
        event_data: {
          invoice_id: invoice.id,
          amount_due: invoice.amount_due / 100,
          currency: invoice.currency,
          attempt_count: invoice.attempt_count,
        },
      });

      console.log('Payment failure logged');
    }
  }

  return { success: true };
}

// Handle customer.subscription.trial_will_end event
async function handleTrialWillEnd(event, supabase) {
  const subscription = event.data.object;
  console.log('Trial will end soon for subscription:', subscription.id);

  // You can send an email notification here
  // For now, just log the event

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('id, email, stripe_subscription_id')
    .eq('stripe_subscription_id', subscription.id)
    .limit(1);

  if (subscriptions && subscriptions.length > 0) {
    const sub = subscriptions[0];

    await supabase.from('subscription_events').insert({
      subscription_id: sub.id,
      stripe_subscription_id: sub.stripe_subscription_id,
      event_type: 'trial_will_end',
      event_source: 'webhook',
      event_data: {
        email: sub.email,
        trial_end: new Date(subscription.trial_end * 1000).toISOString(),
      },
    });

    console.log('Trial ending notification logged for:', sub.email);
  }

  return { success: true };
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');

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
    const stripe = getStripeClient();

    // Get webhook signature from headers
    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    // Verify webhook signature (important for security!)
    if (webhookSecret && signature) {
      try {
        // For Vercel, we need to get the raw body
        // Vercel automatically parses JSON, so we need to reconstruct it
        const rawBody = JSON.stringify(req.body);
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({
          success: false,
          message: 'Invalid webhook signature',
        });
      }
    } else {
      // No signature verification in development
      console.warn('⚠️ Webhook signature verification skipped (no secret configured)');
      event = req.body;
    }

    const eventType = event.type;
    console.log('Received webhook event:', eventType);

    const supabase = getSupabaseClient();

    // Handle different event types
    let result;
    switch (eventType) {
      case 'customer.subscription.created':
        result = await handleSubscriptionCreated(event, supabase);
        break;

      case 'customer.subscription.updated':
        result = await handleSubscriptionUpdated(event, supabase);
        break;

      case 'customer.subscription.deleted':
        result = await handleSubscriptionDeleted(event, supabase);
        break;

      case 'invoice.payment_succeeded':
        result = await handleInvoicePaymentSucceeded(event, supabase);
        break;

      case 'invoice.payment_failed':
        result = await handleInvoicePaymentFailed(event, supabase);
        break;

      case 'customer.subscription.trial_will_end':
        result = await handleTrialWillEnd(event, supabase);
        break;

      default:
        console.log('Unhandled event type:', eventType);
        result = { success: true, message: 'Event type not handled' };
    }

    // Log the webhook event to database
    try {
      await supabase.from('subscription_events').insert({
        stripe_subscription_id: event.data?.object?.id || null,
        event_type: eventType,
        event_source: 'webhook',
        event_data: event.data,
      });
    } catch (logError) {
      console.error('Failed to log webhook event:', logError);
      // Don't fail the webhook if logging fails
    }

    // Always return 200 to acknowledge receipt
    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      eventType,
    });

  } catch (error) {
    console.error('Webhook processing error:', error);

    // Still return 200 to prevent Stripe from retrying
    // But log the error for debugging
    return res.status(200).json({
      success: false,
      message: 'Webhook received but processing failed',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
    });
  }
};
