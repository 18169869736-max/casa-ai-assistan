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
    const { adminEmail, userId } = req.body;

    if (!adminEmail) {
      return res.status(400).json({ error: 'Admin email is required' });
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

    if (userId) {
      // Get usage stats for a specific user
      const { data: userStats, error: statsError } = await supabase
        .rpc('get_user_api_usage', { target_user_id: userId });

      if (statsError) {
        // If RPC doesn't exist, fall back to direct query
        const { data: logs, error: logsError } = await supabase
          .from('api_usage_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (logsError) throw logsError;

        // Calculate stats manually
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const stats = {
          total_calls: logs.length,
          calls_last_24h: logs.filter(l => new Date(l.created_at) >= last24h).length,
          calls_last_7d: logs.filter(l => new Date(l.created_at) >= last7d).length,
          calls_last_30d: logs.filter(l => new Date(l.created_at) >= last30d).length,
          last_call_at: logs[0]?.created_at || null,
          first_call_at: logs[logs.length - 1]?.created_at || null,
        };

        // Get endpoint breakdown
        const endpointBreakdown = {};
        logs.forEach(log => {
          endpointBreakdown[log.endpoint] = (endpointBreakdown[log.endpoint] || 0) + 1;
        });

        return res.status(200).json({
          success: true,
          userId,
          stats,
          endpointBreakdown,
          recentLogs: logs.slice(0, 50),
        });
      }

      return res.status(200).json({
        success: true,
        userId,
        stats: userStats,
      });

    } else {
      // Get usage stats for all users
      const { data: allStats, error: statsError } = await supabase
        .from('api_usage_stats')
        .select('*')
        .order('total_calls', { ascending: false });

      if (statsError) {
        // If view doesn't exist, calculate manually
        const { data: allLogs, error: logsError } = await supabase
          .from('api_usage_logs')
          .select('user_id, email, created_at');

        if (logsError) throw logsError;

        // Group by user
        const userStats = {};
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        allLogs.forEach(log => {
          const key = log.user_id || log.email || 'anonymous';
          if (!userStats[key]) {
            userStats[key] = {
              user_id: log.user_id,
              email: log.email,
              total_calls: 0,
              calls_last_24h: 0,
              calls_last_7d: 0,
              calls_last_30d: 0,
              last_call_at: null,
              first_call_at: log.created_at,
            };
          }

          const createdAt = new Date(log.created_at);
          userStats[key].total_calls++;
          if (createdAt >= last24h) userStats[key].calls_last_24h++;
          if (createdAt >= last7d) userStats[key].calls_last_7d++;
          if (createdAt >= last30d) userStats[key].calls_last_30d++;
          if (!userStats[key].last_call_at || createdAt > new Date(userStats[key].last_call_at)) {
            userStats[key].last_call_at = log.created_at;
          }
        });

        const statsArray = Object.values(userStats).sort((a, b) => b.total_calls - a.total_calls);

        return res.status(200).json({
          success: true,
          stats: statsArray,
          totalUsers: statsArray.length,
        });
      }

      return res.status(200).json({
        success: true,
        stats: allStats,
        totalUsers: allStats.length,
      });
    }

  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
