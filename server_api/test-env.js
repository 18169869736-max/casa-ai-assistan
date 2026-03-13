// Simple diagnostic endpoint to check environment variables
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const envCheck = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? `Set (${process.env.STRIPE_SECRET_KEY.substring(0, 15)}...)` : 'NOT SET',
    STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID || 'NOT SET',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? 'Set' : 'NOT SET',
    SUPABASE_URL: process.env.SUPABASE_URL || 'NOT SET',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'NOT SET',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Set' : 'NOT SET',
  };

  return res.status(200).json(envCheck);
};
