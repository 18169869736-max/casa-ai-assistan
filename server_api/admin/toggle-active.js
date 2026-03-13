const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { adminEmail, userId, isActive } = req.body;

    if (!adminEmail || !userId || typeof isActive !== 'boolean') {
      return res.status(400).json({
        error: 'Admin email, user ID, and active status are required',
      });
    }

    // Verify admin privileges
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('email', adminEmail)
      .single();

    if (adminError || !adminProfile?.is_admin) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    // Get the subscription to find the email (userId is now subscription ID)
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('email')
      .eq('id', userId)
      .single();

    if (subError || !subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', subscription.email)
      .single();

    let profileData;

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('email', subscription.email)
        .select()
        .single();

      if (error) throw error;
      profileData = data;
    } else {
      // Create profile if it doesn't exist
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          email: subscription.email,
          is_active: isActive,
          is_admin: false,
          manual_premium: false,
        })
        .select()
        .single();

      if (error) throw error;
      profileData = data;
    }

    return res.status(200).json({
      success: true,
      message: `User account ${isActive ? 'activated' : 'deactivated'}`,
      user: profileData,
    });

  } catch (error) {
    console.error('Error toggling active status:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
