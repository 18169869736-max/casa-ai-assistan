const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        isAdmin: false,
        error: 'Email is required'
      });
    }

    // Check if user has admin privileges
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin, is_active')
      .eq('email', email)
      .single();

    if (error) {
      // User doesn't exist or error occurred
      return res.status(200).json({
        success: true,
        isAdmin: false,
      });
    }

    const isAdmin = profile?.is_admin === true && profile?.is_active !== false;

    return res.status(200).json({
      success: true,
      isAdmin,
    });

  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(200).json({
      success: true,
      isAdmin: false,
    });
  }
}
