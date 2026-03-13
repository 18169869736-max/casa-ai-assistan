// Backfill profiles for users who have subscriptions but no profile
// This can be run once to fix existing users in the database

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
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { adminEmail } = req.body;

    if (!adminEmail) {
      return res.status(400).json({
        success: false,
        error: 'Admin email is required'
      });
    }

    const supabase = getSupabaseClient();

    // Verify admin privileges
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('email', adminEmail)
      .single();

    if (adminError || !adminProfile?.is_admin) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Admin access required'
      });
    }

    console.log('Starting profile backfill...');

    // Get all subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('email, created_at')
      .order('created_at', { ascending: true });

    if (subsError) {
      throw subsError;
    }

    console.log(`Found ${subscriptions.length} subscriptions`);

    // Get all existing profiles
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('email');

    if (profilesError) {
      throw profilesError;
    }

    const existingEmails = new Set(existingProfiles.map(p => p.email));
    console.log(`Found ${existingProfiles.length} existing profiles`);

    // Find subscriptions without profiles
    const subscriptionsWithoutProfiles = subscriptions.filter(
      sub => !existingEmails.has(sub.email)
    );

    console.log(`Found ${subscriptionsWithoutProfiles.length} subscriptions without profiles`);

    if (subscriptionsWithoutProfiles.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All subscriptions already have profiles',
        profilesCreated: 0,
        totalSubscriptions: subscriptions.length,
        existingProfiles: existingProfiles.length,
      });
    }

    // Create profiles for subscriptions without them
    const profilesToCreate = subscriptionsWithoutProfiles.map(sub => ({
      email: sub.email,
      full_name: null,
      is_active: true,
      is_admin: false,
      manual_premium: false,
      created_at: sub.created_at, // Use subscription created date
    }));

    const { data: createdProfiles, error: createError } = await supabase
      .from('profiles')
      .insert(profilesToCreate)
      .select();

    if (createError) {
      console.error('Error creating profiles:', createError);
      throw createError;
    }

    console.log(`Successfully created ${createdProfiles.length} profiles`);

    return res.status(200).json({
      success: true,
      message: `Successfully backfilled ${createdProfiles.length} profiles`,
      profilesCreated: createdProfiles.length,
      totalSubscriptions: subscriptions.length,
      existingProfiles: existingProfiles.length,
      newProfiles: createdProfiles.map(p => p.email),
    });

  } catch (error) {
    console.error('Backfill error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
};
