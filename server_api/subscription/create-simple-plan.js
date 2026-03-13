// Simplified endpoint to create subscription plan with minimal structure
const { Client, Environment } = require('square');
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Use POST' });
  }

  try {
    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const environment = process.env.SQUARE_ENVIRONMENT === 'production'
      ? Environment.Production
      : Environment.Sandbox;

    if (!accessToken) {
      return res.status(500).json({ success: false, message: 'No access token' });
    }

    const client = new Client({ accessToken, environment });

    // Try using subscriptionsApi directly instead of catalogApi
    const { result: locationsResult } = await client.locationsApi.listLocations();
    const location = locationsResult.locations?.[0];

    if (!location) {
      return res.status(500).json({ success: false, message: 'No location found' });
    }

    // Create using the simplest possible catalog structure
    const planId = `#plan-${Date.now()}`;

    const { result } = await client.catalogApi.upsertCatalogObject({
      idempotencyKey: crypto.randomUUID(),
      object: {
        type: 'SUBSCRIPTION_PLAN',
        id: planId,
        presentAtAllLocations: true,
        subscriptionPlanData: {
          name: 'SpacioAI Test Plan',
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Plan created',
      plan: result.catalogObject,
      note: 'You may need to add pricing manually in Square Dashboard'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed',
      error: JSON.stringify(error.errors || error, null, 2)
    });
  }
};
