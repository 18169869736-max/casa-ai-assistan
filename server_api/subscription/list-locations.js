// Helper endpoint to list available Square locations
// Use this to find the correct location ID for your account

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

    // List all locations
    const { result } = await client.locationsApi.listLocations();

    const locations = result.locations?.map(loc => ({
      id: loc.id,
      name: loc.name,
      status: loc.status,
      address: loc.address ? `${loc.address.addressLine1}, ${loc.address.locality}` : 'N/A',
      capabilities: loc.capabilities || [],
    })) || [];

    return res.status(200).json({
      success: true,
      environment: environment === Environment.Production ? 'production' : 'sandbox',
      locations,
      message: locations.length > 0
        ? 'Copy one of the location IDs below and set it as SQUARE_LOCATION_ID in Vercel'
        : 'No locations found. Please create a location in your Square dashboard.',
    });

  } catch (error) {
    console.error('Error listing locations:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to list locations',
      error: error.message || error.toString(),
    });
  }
};
