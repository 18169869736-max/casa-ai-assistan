// Helper endpoint to list available Square subscription plans
// Use this to find the correct plan variation ID for your subscription

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

    // List all catalog items (including subscription plans)
    const { result } = await client.catalogApi.listCatalog(
      undefined, // cursor
      'SUBSCRIPTION_PLAN' // types filter
    );

    const plans = result.objects?.map(plan => {
      const subscriptionPlanData = plan.subscriptionPlanData;
      const variations = subscriptionPlanData?.subscriptionPlanVariations || [];

      return {
        id: plan.id,
        name: plan.subscriptionPlanData?.name || 'Unnamed Plan',
        variations: variations.map(variation => ({
          id: variation.id,
          name: variation.name || 'Default Variation',
          phases: variation.subscriptionPlanVariationData?.phases?.map(phase => ({
            cadence: phase.cadence,
            periods: phase.periods,
            recurringPriceMoney: phase.recurringPriceMoney,
          })) || [],
        })),
      };
    }) || [];

    return res.status(200).json({
      success: true,
      environment: environment === Environment.Production ? 'production' : 'sandbox',
      plans,
      message: plans.length > 0
        ? 'Copy the variation ID from your desired plan and set it as SQUARE_SUBSCRIPTION_PLAN_ID in Vercel'
        : 'No subscription plans found. Please create a subscription plan in your Square dashboard.',
    });

  } catch (error) {
    console.error('Error listing plans:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to list subscription plans',
      error: error.message || error.toString(),
    });
  }
};
