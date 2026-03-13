// Create an authenticated session for a user after payment
const { createClient } = require('@supabase/supabase-js');

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

module.exports = async function handler(req, res) {
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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    console.log('Creating session for:', email);

    const supabaseAdmin = getSupabaseAdmin();

    // Check if user exists, create if not
    const { data: existingUsers } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .limit(1);

    let userId;

    if (existingUsers && existingUsers.length > 0) {
      userId = existingUsers[0].id;
      console.log('Found existing user:', userId);
    } else {
      // Create user in auth.users using admin API
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true, // Auto-confirm email
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        throw new Error('Failed to create user: ' + authError.message);
      }

      userId = authUser.user.id;
      console.log('Created new user:', userId);

      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email,
          is_active: true,
          is_admin: false,
          manual_premium: false,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Don't fail - profile might already exist
      }
    }

    // Generate a magic link that will auto-sign them in
    // Add payment_complete flag to the redirect URL so callback knows this is from payment flow
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spacioai.co';
    const redirectUrl = `${siteUrl}/auth/callback?source=payment`;

    const { data: otpData, error: otpError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: redirectUrl,
      }
    });

    if (otpError) {
      console.error('Error generating OTP link:', otpError);
      throw new Error('Failed to generate login link: ' + otpError.message);
    }

    console.log('Session link created successfully for:', email);

    return res.status(200).json({
      success: true,
      message: 'Session created successfully',
      data: {
        email,
        userId,
        actionLink: otpData.properties.action_link,
      },
    });

  } catch (error) {
    console.error('Session creation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create session',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
    });
  }
};
