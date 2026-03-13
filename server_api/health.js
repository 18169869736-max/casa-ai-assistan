// Vercel serverless function for health check

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Basic health check
    const timestamp = new Date().toISOString();
    
    // Optional: Test Gemini API connectivity
    let geminiStatus = 'unknown';
    try {
      if (process.env.GOOGLE_CLOUD_API_KEY) {
        const testResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'test' }] }],
              generationConfig: { maxOutputTokens: 1 }
            })
          }
        );
        geminiStatus = testResponse.ok ? 'healthy' : 'error';
      }
    } catch (error) {
      geminiStatus = 'error';
    }

    res.status(200).json({
      status: 'healthy',
      timestamp,
      version: '1.0.0',
      services: {
        gemini: geminiStatus,
        database: 'healthy', // TODO: Add real database health check
        auth: 'healthy'
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message 
    });
  }
}