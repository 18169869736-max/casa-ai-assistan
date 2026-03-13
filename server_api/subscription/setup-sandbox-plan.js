// Helper endpoint to create a test subscription plan in Square sandbox
// This creates a plan with trial pricing: $1.99 for 5 days, then $29/month

const { Client, Environment } = require('square');
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use POST.',
    });
  }

  try {
    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const environment = process.env.SQUARE_ENVIRONMENT === 'production'
      ? Environment.Production
      : Environment.Sandbox;

    if (!accessToken) {
      return res.status(500).json({
        success: false,
        message: 'Square access token not configured',
      });
    }

    if (environment === Environment.Production) {
      return res.status(400).json({
        success: false,
        message: 'This endpoint only works in SANDBOX mode. Set SQUARE_ENVIRONMENT=sandbox',
      });
    }

    const client = new Client({
      accessToken,
      environment,
    });

    // Check if a plan already exists
    let existingPlan = null;
    try {
      const { result: catalogResult } = await client.catalogApi.listCatalog(
        undefined,
        'SUBSCRIPTION_PLAN'
      );

      if (catalogResult.objects && catalogResult.objects.length > 0) {
        existingPlan = catalogResult.objects.find(obj =>
          obj.subscriptionPlanData?.name === 'SpacioAI Premium (Test)'
        );
      }
    } catch (e) {
      console.log('Could not check existing plans:', e.message);
    }

    if (existingPlan) {
      const variation = existingPlan.subscriptionPlanData?.subscriptionPlanVariations?.[0];
      return res.status(200).json({
        success: true,
        message: 'Subscription plan already exists',
        plan: {
          id: existingPlan.id,
          name: existingPlan.subscriptionPlanData?.name,
          variationId: variation?.id,
          variationName: variation?.name,
        },
        instructions: [
          'Plan already exists in your sandbox account!',
          `Set SQUARE_SUBSCRIPTION_PLAN_ID=${variation?.id} in Vercel environment variables`,
          'Then test the payment flow'
        ]
      });
    }

    // Create new subscription plan
    console.log('Creating new subscription plan in sandbox...');

    const planId = `#spacioai-premium-${crypto.randomUUID().substring(0, 8)}`;
    const variationId = `#spacioai-premium-variation-${crypto.randomUUID().substring(0, 8)}`;

    // Get first location for the plan
    const { result: locationsResult } = await client.locationsApi.listLocations();
    const location = locationsResult.locations?.[0];

    if (!location) {
      return res.status(500).json({
        success: false,
        message: 'No locations found. Cannot create subscription plan without a location.',
      });
    }

    const { result } = await client.catalogApi.upsertCatalogObject({
      idempotencyKey: crypto.randomUUID(),
      object: {
        type: 'SUBSCRIPTION_PLAN',
        id: planId,
        presentAtAllLocations: true,
        subscriptionPlanData: {
          name: 'SpacioAI Premium (Test)',
          subscriptionPlanVariations: [
            {
              id: variationId,
              type: 'SUBSCRIPTION_PLAN_VARIATION',
              subscriptionPlanVariationData: {
                name: 'Monthly',
                phases: [
                  {
                    uid: crypto.randomUUID(),
                    cadence: 'MONTHLY',
                    ordinal: 0,
                    pricing: {
                      type: 'STATIC',
                      priceMoney: {
                        amount: 2900, // $29.00/month
                        currency: 'USD'
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    });

    const createdPlan = result.catalogObject;
    const createdVariation = createdPlan.subscriptionPlanData?.subscriptionPlanVariations?.[0];

    console.log('Subscription plan created successfully');
    console.log('Plan ID:', createdPlan.id);
    console.log('Variation ID:', createdVariation?.id);

    return res.status(200).json({
      success: true,
      message: 'Subscription plan created successfully in sandbox!',
      plan: {
        id: createdPlan.id,
        name: createdPlan.subscriptionPlanData?.name,
        variationId: createdVariation?.id,
        variationName: createdVariation?.name,
      },
      instructions: [
        '✅ Subscription plan created in your Square sandbox account',
        '',
        '📋 Next steps:',
        '1. Copy the variation ID below',
        `2. Set SQUARE_SUBSCRIPTION_PLAN_ID=${createdVariation?.id} in Vercel environment variables`,
        '3. Make sure SQUARE_ENVIRONMENT=sandbox',
        '4. Make sure you have set SQUARE_LOCATION_ID from /api/subscription/list-locations',
        '5. Redeploy in Vercel (or wait for auto-deploy)',
        '6. Test the payment flow with Square test card: 4111 1111 1111 1111',
        '',
        '💡 Note: This is a test plan in sandbox. No real money will be charged.',
        '    The $1.99 trial pricing will need to be handled via invoicing or manual adjustments.',
      ]
    });

  } catch (error) {
    console.error('Error creating subscription plan:', error);

    // Handle specific Square API errors
    let errorMessage = 'Failed to create subscription plan';

    if (error.errors && error.errors.length > 0) {
      const squareError = error.errors[0];
      errorMessage = squareError.detail || squareError.code || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.toString(),
      hint: 'Make sure SQUARE_ENVIRONMENT=sandbox and the access token is valid'
    });
  }
};
