// Vercel serverless function for creating Stripe subscriptions
// This endpoint is called from the frontend after payment method creation

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
    // Check if environment variables are configured
    if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_ANON_KEY)) {
      console.error('Missing Supabase environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Missing database credentials',
        error: 'SUPABASE_URL or SUPABASE_ANON_KEY not configured'
      });
    }

    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
      console.error('Missing Stripe environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Missing payment credentials',
        error: 'Stripe credentials not configured'
      });
    }

    const { paymentMethodId, email, givenName, familyName } = req.body;

    // Validate required fields
    if (!paymentMethodId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: paymentMethodId and email are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address format',
      });
    }

    console.log('Creating subscription for:', email);

    const stripe = getStripeClient();
    const supabase = getSupabaseClient();
    const priceId = process.env.STRIPE_PRICE_ID;

    // Step 1: Check if customer already exists in Supabase
    const { data: existingSubscriptions } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, status')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);

    let customerId = existingSubscriptions?.[0]?.stripe_customer_id;

    // Step 2: Create or retrieve Stripe customer
    if (!customerId) {
      console.log('Creating new Stripe customer...');

      const customer = await stripe.customers.create({
        email: email,
        name: givenName ? `${givenName} ${familyName || ''}`.trim() : email.split('@')[0],
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      customerId = customer.id;
      console.log('Created Stripe customer:', customerId);
    } else {
      console.log('Using existing Stripe customer:', customerId);

      // Attach payment method to existing customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Step 3: Create subscription with trial
    // Trial: $1.99 for 3 days
    // Then: $29/month
    console.log('Creating subscription...');

    const today = new Date();
    const trialEndDate = new Date(today);
    trialEndDate.setDate(trialEndDate.getDate() + 3); // 3-day trial

    // Step 3a: Create and charge $1.99 trial payment immediately
    console.log('Creating $1.99 trial invoice...');

    // Create invoice item for trial payment
    await stripe.invoiceItems.create({
      customer: customerId,
      amount: 199, // $1.99 in cents
      currency: 'usd',
      description: '3-day trial access',
    });

    // Create and finalize invoice to charge the $1.99
    const trialInvoice = await stripe.invoices.create({
      customer: customerId,
      auto_advance: true, // Automatically finalize and attempt payment
    });

    // Pay the invoice immediately
    await stripe.invoices.pay(trialInvoice.id);
    console.log('Trial payment charged:', trialInvoice.id);

    // Step 3b: Create the subscription with trial period (no immediate charge)
    console.log('Creating subscription with trial...');
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      trial_end: Math.floor(trialEndDate.getTime() / 1000),
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
    });

    console.log('Subscription created:', subscription.id);

    // Step 4: Calculate dates
    const trialStartDate = new Date();
    // Use trial dates for current period since subscription is in trial
    const currentPeriodStart = trialStartDate;
    const currentPeriodEnd = trialEndDate;

    // Step 5: Save subscription to Supabase
    const { data: savedSubscription, error: dbError } = await supabase
      .from('subscriptions')
      .insert({
        email,
        stripe_subscription_id: subscription.id, // Using new column name after migration
        stripe_customer_id: customerId, // Using new column name after migration
        status: 'trial',
        plan_type: 'premium',
        trial_start_date: trialStartDate.toISOString(),
        trial_end_date: trialEndDate.toISOString(),
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        metadata: {
          payment_method_id: paymentMethodId,
          price_id: priceId,
          source: 'landing_page',
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save subscription to database');
    }

    // Step 6: Create or update user profile
    console.log('Creating/updating user profile...');

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (!existingProfile) {
      // Create new profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          email,
          full_name: givenName ? `${givenName} ${familyName || ''}`.trim() : null,
          is_active: true,
          is_admin: false,
          manual_premium: false,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Don't fail the whole request if profile creation fails
        // Subscription was already created successfully
      } else {
        console.log('Profile created for:', email);
      }
    } else {
      console.log('Profile already exists for:', email);
    }

    // Step 7: Log subscription event
    await supabase.from('subscription_events').insert({
      subscription_id: savedSubscription.id,
      stripe_subscription_id: subscription.id, // Using new column name after migration
      event_type: 'created',
      event_source: 'api',
      event_data: {
        customer_id: customerId,
        payment_method_id: paymentMethodId,
        email,
        trial_days: 3,
        trial_price: 1.99,
        recurring_price: 29.00,
      },
    });

    console.log('Subscription saved to database:', savedSubscription.id);

    // Step 8: Return success response
    return res.status(200).json({
      success: true,
      message: 'Subscription created successfully',
      subscription: {
        id: savedSubscription.id,
        stripe_subscription_id: subscription.id, // Return as stripe_subscription_id for frontend
        square_subscription_id: subscription.id, // Keep for backwards compatibility
        status: 'trial',
        trial_end_date: trialEndDate.toISOString(),
        next_billing_date: currentPeriodEnd.toISOString(),
      },
    });

  } catch (error) {
    console.error('Subscription creation error:', error);

    // Handle specific Stripe API errors
    let errorMessage = 'Failed to create subscription';
    let statusCode = 500;

    if (error.type === 'StripeCardError') {
      statusCode = 402;
      errorMessage = error.message || 'Card was declined. Please try a different card.';
    } else if (error.type === 'StripeInvalidRequestError') {
      statusCode = 400;
      errorMessage = error.message || 'Invalid request to payment processor.';
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
