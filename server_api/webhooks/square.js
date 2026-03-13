// Vercel serverless function for handling Square webhook events
// Square will send notifications about subscription changes to this endpoint

const crypto = require('crypto');
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

// Verify webhook signature from Square
function verifyWebhookSignature(body, signature, signatureKey) {
  if (!signatureKey) {
    console.warn('⚠️ Webhook signature key not configured - skipping verification');
    return true; // Skip verification in development
  }

  const hmac = crypto.createHmac('sha256', signatureKey);
  const hash = hmac.update(body).digest('base64');

  return hash === signature;
}

// Handle subscription.created event
async function handleSubscriptionCreated(event, supabase) {
  const subscription = event.data.object.subscription;
  console.log('Subscription created:', subscription.id);

  // Update subscription status if it exists
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_start: subscription.charged_through_date || new Date().toISOString(),
    })
    .eq('square_subscription_id', subscription.id)
    .select();

  if (error) {
    console.error('Failed to update subscription:', error);
  } else {
    console.log('Subscription updated:', data);
  }

  return { success: true };
}

// Handle subscription.updated event
async function handleSubscriptionUpdated(event, supabase) {
  const subscription = event.data.object.subscription;
  console.log('Subscription updated:', subscription.id);

  const updateData = {
    status: subscription.status?.toLowerCase() || 'active',
  };

  if (subscription.charged_through_date) {
    updateData.current_period_end = subscription.charged_through_date;
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('square_subscription_id', subscription.id)
    .select();

  if (error) {
    console.error('Failed to update subscription:', error);
  } else {
    console.log('Subscription updated:', data);
  }

  return { success: true };
}

// Handle subscription.canceled event
async function handleSubscriptionCanceled(event, supabase) {
  const subscription = event.data.object.subscription;
  console.log('Subscription canceled:', subscription.id);

  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('square_subscription_id', subscription.id)
    .select();

  if (error) {
    console.error('Failed to update subscription:', error);
  } else {
    console.log('Subscription canceled in database:', data);
  }

  return { success: true };
}

// Handle payment.created event (successful payment)
async function handlePaymentCreated(event, supabase) {
  const payment = event.data.object.payment;
  console.log('Payment created:', payment.id, 'Amount:', payment.amount_money);

  // Find subscription by order ID or customer ID
  if (payment.order_id) {
    // Log the successful payment event
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('id, square_subscription_id')
      .eq('square_customer_id', payment.customer_id)
      .eq('status', 'active')
      .limit(1);

    if (subscriptions && subscriptions.length > 0) {
      const subscription = subscriptions[0];

      await supabase.from('subscription_events').insert({
        subscription_id: subscription.id,
        square_subscription_id: subscription.square_subscription_id,
        event_type: 'payment_succeeded',
        event_source: 'webhook',
        event_data: {
          payment_id: payment.id,
          amount: payment.amount_money.amount / 100,
          currency: payment.amount_money.currency,
          status: payment.status,
        },
      });

      console.log('Payment event logged');
    }
  }

  return { success: true };
}

// Handle payment.updated event (could indicate failure)
async function handlePaymentUpdated(event, supabase) {
  const payment = event.data.object.payment;
  console.log('Payment updated:', payment.id, 'Status:', payment.status);

  if (payment.status === 'FAILED' || payment.status === 'CANCELED') {
    // Find subscription and update status
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('id, square_subscription_id')
      .eq('square_customer_id', payment.customer_id)
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
        square_subscription_id: subscription.square_subscription_id,
        event_type: 'payment_failed',
        event_source: 'webhook',
        event_data: {
          payment_id: payment.id,
          status: payment.status,
          reason: payment.processing_fee || 'Unknown',
        },
      });

      console.log('Payment failure logged');
    }
  }

  return { success: true };
}

// Handle invoice.payment_made event
async function handleInvoicePaymentMade(event, supabase) {
  const invoice = event.data.object.invoice;
  console.log('Invoice payment made:', invoice.id);

  if (invoice.subscription_id) {
    // Update subscription to active if it was past_due
    await supabase
      .from('subscriptions')
      .update({
        status: 'active',
      })
      .eq('square_subscription_id', invoice.subscription_id)
      .eq('status', 'past_due');

    console.log('Subscription reactivated after payment');
  }

  return { success: true };
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Square-Signature');

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
    // Get webhook signature from headers
    const signature = req.headers['x-square-hmacsha256-signature'] || req.headers['x-square-signature'];
    const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;

    // Get raw body for signature verification
    const rawBody = JSON.stringify(req.body);

    // Verify webhook signature (important for security!)
    if (signature && signatureKey) {
      const isValid = verifyWebhookSignature(rawBody, signature, signatureKey);

      if (!isValid) {
        console.error('Invalid webhook signature');
        return res.status(401).json({
          success: false,
          message: 'Invalid webhook signature',
        });
      }
    }

    const event = req.body;
    const eventType = event.type;

    console.log('Received webhook event:', eventType);

    const supabase = getSupabaseClient();

    // Handle different event types
    let result;
    switch (eventType) {
      case 'subscription.created':
        result = await handleSubscriptionCreated(event, supabase);
        break;

      case 'subscription.updated':
        result = await handleSubscriptionUpdated(event, supabase);
        break;

      case 'subscription.canceled':
        result = await handleSubscriptionCanceled(event, supabase);
        break;

      case 'payment.created':
        result = await handlePaymentCreated(event, supabase);
        break;

      case 'payment.updated':
        result = await handlePaymentUpdated(event, supabase);
        break;

      case 'invoice.payment_made':
        result = await handleInvoicePaymentMade(event, supabase);
        break;

      default:
        console.log('Unhandled event type:', eventType);
        result = { success: true, message: 'Event type not handled' };
    }

    // Log the webhook event to database
    try {
      await supabase.from('subscription_events').insert({
        square_subscription_id: event.data?.object?.subscription?.id || null,
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

    // Still return 200 to prevent Square from retrying
    // But log the error for debugging
    return res.status(200).json({
      success: false,
      message: 'Webhook received but processing failed',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
    });
  }
};
