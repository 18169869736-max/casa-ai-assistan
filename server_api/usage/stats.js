// Vercel serverless function for getting user usage statistics

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const user = await validateUserToken(token);
    if (!user) {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }

    // Get user usage statistics from database
    const stats = await getUserUsageStats(user.id);

    res.status(200).json(stats);

  } catch (error) {
    console.error('Usage stats fetch failed:', error);
    res.status(500).json({ message: 'Failed to get usage statistics' });
  }
}

// Simple user token validation (implement with your auth system)
async function validateUserToken(token) {
  // TODO: Implement real JWT validation
  if (token === 'demo_token') {
    return { id: 'demo_user', email: 'demo@example.com' };
  }
  return { id: 'user_123', email: 'user@example.com' }; // Accept any token for testing
}

// Get user usage statistics from database
async function getUserUsageStats(userId) {
  // TODO: Implement real database query
  // For testing, return mock usage data
  
  const mockStats = {
    'demo_user': {
      creditsUsed: 0,
      creditsRemaining: 3, // Free tier gets 3 free credits
      generationsToday: 0,
      lastGeneration: null
    },
    'user_123': {
      creditsUsed: 25,
      creditsRemaining: 75,
      generationsToday: 5,
      lastGeneration: '2024-01-15T14:30:00Z'
    }
  };

  return mockStats[userId] || {
    creditsUsed: 0,
    creditsRemaining: 0,
    generationsToday: 0,
    lastGeneration: null
  };
}