// Test endpoint to verify Gemini API key and model availability
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
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'API key not configured',
        message: 'GOOGLE_GEMINI_API_KEY environment variable is not set'
      });
    }

    // Test basic text generation first
    console.log('Testing Gemini API with text generation...');
    const textResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say hello in one word' }] }]
        })
      }
    );

    const textResult = await textResponse.json();
    
    // Test image generation model
    console.log('Testing Gemini image generation model...');
    const imageResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: 'Generate a simple red square image, 100x100 pixels, solid red color'
            }] 
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
          }
        })
      }
    );

    const imageResult = await imageResponse.json();
    
    // Check results
    const results = {
      apiKeyPresent: true,
      apiKeyLength: apiKey.length,
      textGeneration: {
        status: textResponse.status,
        ok: textResponse.ok,
        error: textResult.error,
        hasResponse: !!textResult.candidates
      },
      imageGeneration: {
        status: imageResponse.status,
        ok: imageResponse.ok,
        error: imageResult.error,
        hasResponse: !!imageResult.candidates,
        responseStructure: imageResult.candidates ? {
          candidatesCount: imageResult.candidates.length,
          firstCandidate: imageResult.candidates[0] ? {
            hasContent: !!imageResult.candidates[0].content,
            partsCount: imageResult.candidates[0].content?.parts?.length,
            partTypes: imageResult.candidates[0].content?.parts?.map(p => Object.keys(p))
          } : null
        } : null
      },
      fullImageResponse: imageResult
    };

    res.status(200).json(results);

  } catch (error) {
    console.error('Test failed:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}