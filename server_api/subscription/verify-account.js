// Helper endpoint to verify which Square account the access token belongs to
// This helps diagnose when locations/plans don't match expectations

const { Client, Environment } = require('square');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use GET.',
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

    // Get merchant/account information
    const { result: merchantResult } = await client.merchantsApi.listMerchants();
    const merchant = merchantResult.merchant?.[0] || merchantResult.merchants?.[0];

    // Get locations
    const { result: locationsResult } = await client.locationsApi.listLocations();
    const locations = locationsResult.locations || [];

    // Try to get subscription plans
    let plans = [];
    try {
      const { result: catalogResult } = await client.catalogApi.listCatalog(
        undefined,
        'SUBSCRIPTION_PLAN'
      );
      plans = catalogResult.objects || [];
    } catch (e) {
      console.log('Could not fetch plans:', e.message);
    }

    return res.status(200).json({
      success: true,
      environment: environment === Environment.Production ? 'production' : 'sandbox',
      account: {
        merchantId: merchant?.id || 'N/A',
        businessName: merchant?.businessName || 'N/A',
        country: merchant?.country || 'N/A',
        status: merchant?.status || 'N/A',
      },
      accessToken: {
        prefix: accessToken.substring(0, 10) + '...',
        length: accessToken.length,
        environment: environment === Environment.Production ? 'production' : 'sandbox',
      },
      locations: locations.map(loc => ({
        id: loc.id,
        name: loc.name,
        status: loc.status,
      })),
      plans: plans.map(plan => ({
        id: plan.id,
        name: plan.subscriptionPlanData?.name || 'Unnamed',
      })),
      currentConfig: {
        SQUARE_ENVIRONMENT: process.env.SQUARE_ENVIRONMENT || 'not set',
        SQUARE_LOCATION_ID: process.env.SQUARE_LOCATION_ID || 'not set',
        SQUARE_SUBSCRIPTION_PLAN_ID: process.env.SQUARE_SUBSCRIPTION_PLAN_ID || 'not set',
      },
      message: `This access token belongs to: ${merchant?.businessName || 'Unknown Business'}. Verify this matches your expected Square account.`,
    });

  } catch (error) {
    console.error('Error verifying account:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to verify Square account',
      error: error.message || error.toString(),
      hint: 'The access token might be invalid, expired, or from a different environment (sandbox vs production)',
    });
  }
};
