// Debug endpoint to check subscription status
const { createClient } = require('@supabase/supabase-js');

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }

  return createClient(supabaseUrl, supabaseKey);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const email = req.query.email || req.body?.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const supabase = getSupabaseClient();

    // Get all subscriptions for this email
    const { data: allSubs, error: allSubsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    // Get active/trial subscriptions
    const { data: activeSubs, error: activeSubsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('email', email)
      .in('status', ['active', 'trial'])
      .order('created_at', { ascending: false });

    return res.status(200).json({
      success: true,
      email,
      allSubscriptions: allSubs || [],
      activeSubscriptions: activeSubs || [],
      errors: {
        allSubsError,
        activeSubsError,
      },
    });

  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
      error: error.toString(),
    });
  }
};
