// Create subscription plan with proper trial phase
// Phase 1: $1.99 for first 3 days (using DAILY cadence)
// Phase 2: $29/month recurring

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

    const client = new Client({
      accessToken,
      environment,
    });

    console.log('Creating subscription plan with trial phase...');

    const planId = `#spacioai-trial-3day-${crypto.randomUUID().substring(0, 8)}`;
    const variationId = `#spacioai-trial-3day-variation-${crypto.randomUUID().substring(0, 8)}`;

    const { result } = await client.catalogApi.upsertCatalogObject({
      idempotencyKey: crypto.randomUUID(),
      object: {
        type: 'SUBSCRIPTION_PLAN',
        id: planId,
        presentAtAllLocations: true,
        subscriptionPlanData: {
          name: 'SpacioAI Premium with 3-Day Trial',
          subscriptionPlanVariations: [
            {
              id: variationId,
              type: 'SUBSCRIPTION_PLAN_VARIATION',
              subscriptionPlanVariationData: {
                name: 'Monthly with 3-day Trial',
                phases: [
                  // Phase 0: Trial phase - $1.99 for first 3 days
                  {
                    uid: crypto.randomUUID(),
                    cadence: 'DAILY',
                    ordinal: 0,
                    periods: 3, // Lasts exactly 3 days
                    pricing: {
                      type: 'STATIC',
                      priceMoney: {
                        amount: 199, // $1.99 for 3-day trial
                        currency: 'USD'
                      }
                    }
                  },
                  // Phase 1: Regular phase - $29/month recurring
                  {
                    uid: crypto.randomUUID(),
                    cadence: 'MONTHLY',
                    ordinal: 1,
                    // No periods specified = recurring forever
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

    console.log('Trial subscription plan created successfully!');
    console.log('Plan ID:', createdPlan.id);
    console.log('Variation ID:', createdVariation?.id);

    return res.status(200).json({
      success: true,
      message: 'Subscription plan with trial created successfully!',
      plan: {
        id: createdPlan.id,
        name: createdPlan.subscriptionPlanData?.name,
        variationId: createdVariation?.id,
        variationName: createdVariation?.name,
        phases: createdVariation?.subscriptionPlanVariationData?.phases?.length,
      },
      trialDetails: {
        trialPrice: '$1.99',
        trialDuration: '3 days',
        recurringPrice: '$29/month',
        note: 'Using DAILY cadence with 3 periods for exactly 3 days.'
      },
      instructions: [
        '✅ Subscription plan with trial created!',
        '',
        '📋 Next steps:',
        `1. Update SQUARE_SUBSCRIPTION_PLAN_ID=${createdVariation?.id} in Vercel`,
        '2. Make sure SQUARE_ENVIRONMENT is set correctly',
        '3. Redeploy or wait for auto-deploy',
        '4. Test with card: 4111 1111 1111 1111',
        '',
        '💡 Trial: User pays $1.99 for first 3 days, then $29/month',
      ]
    });

  } catch (error) {
    console.error('Error creating trial plan:', error);

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
    });
  }
};
