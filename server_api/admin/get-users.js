const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { adminEmail } = req.body;

    if (!adminEmail) {
      return res.status(400).json({ error: 'Admin email is required' });
    }

    // Verify admin privileges (check if admin email exists in profiles with is_admin flag)
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('email', adminEmail)
      .single();

    if (!adminProfile?.is_admin) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    // FETCH FROM SUBSCRIPTIONS TABLE (primary source of truth)
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (subsError) {
      throw subsError;
    }

    // Optionally fetch profiles (for is_admin, manual_premium flags)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*');

    // Map profiles by email for quick lookup
    const profilesByEmail = {};
    if (profiles) {
      profiles.forEach(profile => {
        profilesByEmail[profile.email] = profile;
      });
    }

    // Fetch generation counts for all users
    const { data: generationCounts } = await supabase
      .from('generated_designs')
      .select('user_id');

    // Count generations per user_id (profile ID)
    const generationsByUserId = {};
    if (generationCounts) {
      generationCounts.forEach(gen => {
        generationsByUserId[gen.user_id] = (generationsByUserId[gen.user_id] || 0) + 1;
      });
    }

    // Get unique emails from subscriptions (latest subscription per email)
    const uniqueSubscriptions = {};
    subscriptions.forEach(sub => {
      if (!uniqueSubscriptions[sub.email] ||
          new Date(sub.created_at) > new Date(uniqueSubscriptions[sub.email].created_at)) {
        uniqueSubscriptions[sub.email] = sub;
      }
    });

    // Build users array from subscriptions
    const users = Object.values(uniqueSubscriptions).map(subscription => {
      const profile = profilesByEmail[subscription.email];
      const hasActiveSubscription = ['active', 'trial'].includes(subscription.status);

      return {
        id: subscription.id, // Use subscription ID as user ID
        email: subscription.email,
        fullName: profile?.full_name || null,
        createdAt: subscription.created_at,
        isActive: profile?.is_active !== false, // Default to true
        isAdmin: profile?.is_admin || false,
        manualPremium: profile?.manual_premium || false,
        isPremium: profile?.manual_premium || hasActiveSubscription,
        subscriptionStatus: subscription.status,
        subscriptionPlanType: subscription.plan_type,
        subscriptionEndDate: subscription.current_period_end,
        totalGenerations: profile?.id ? (generationsByUserId[profile.id] || 0) : 0,
      };
    });

    return res.status(200).json({
      success: true,
      users,
      totalCount: users.length,
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
