# Backend API Implementation Example

Your backend needs to implement these endpoints to handle the Gemini Flash 2.5 integration:

## Required Endpoints

### 1. Generate Design
```
POST /api/generate-design
Authorization: Bearer {user_token}
Content-Type: application/json

Request Body:
{
  "image": "base64_encoded_image",
  "roomType": "Living Room",
  "style": "Modern", 
  "colorPalette": "Millennial Gray",
  "model": "gemini-2.0-flash-exp"
}

Response:
{
  "imageUrl": "https://storage.googleapis.com/your-bucket/generated-image.png",
  "imageBase64": "base64_encoded_result",
  "creditsUsed": 1,
  "processingTime": 5000
}
```

### 2. Regenerate Design  
```
POST /api/regenerate-design
Authorization: Bearer {user_token}
Content-Type: application/json

Request Body:
{
  "image": "base64_encoded_image",
  "roomType": "Living Room",
  "style": "Modern",
  "colorPalette": "Millennial Gray", 
  "model": "gemini-2.0-flash-exp",
  "variation": true
}

Response: Same as generate-design
```

### 3. Subscription Status
```
POST /api/subscription/status
Authorization: Bearer {user_token}

Response:
{
  "isActive": true,
  "creditsRemaining": 50,
  "planType": "premium",
  "renewalDate": "2024-02-01T00:00:00Z"
}
```

### 4. Usage Stats
```
POST /api/usage/stats  
Authorization: Bearer {user_token}

Response:
{
  "creditsUsed": 25,
  "creditsRemaining": 75, 
  "generationsToday": 5,
  "lastGeneration": "2024-01-15T14:30:00Z"
}
```

### 5. Health Check
```
GET /api/health

Response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T14:30:00Z"
}
```

## Backend Implementation Notes

### Environment Variables (Your Server)
```bash
# Your Google Cloud credentials
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_API_KEY=your-gemini-api-key
GOOGLE_CLOUD_LOCATION=us-central1

# Database & Auth
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret

# Optional: Image storage
GOOGLE_CLOUD_STORAGE_BUCKET=your-storage-bucket
```

### Sample Express.js Implementation
```javascript
// Example backend route handler
app.post('/api/generate-design', authenticateUser, checkSubscription, async (req, res) => {
  try {
    const { image, roomType, style, colorPalette } = req.body;
    const userId = req.user.id;
    
    // Check user credits
    const user = await getUserSubscription(userId);
    if (!user.hasCredits) {
      return res.status(402).json({ message: 'Insufficient credits' });
    }
    
    // Call Gemini API with your API key
    const prompt = createDesignPrompt({ roomType, style, colorPalette });
    const geminiResponse = await callGeminiAPI({
      prompt,
      image,
      apiKey: process.env.GOOGLE_CLOUD_API_KEY
    });
    
    // Process and store result
    const imageUrl = await uploadToStorage(geminiResponse.image);
    await deductUserCredits(userId, 1);
    await saveGenerationHistory(userId, { imageUrl, prompt, timestamp: new Date() });
    
    res.json({
      imageUrl,
      imageBase64: geminiResponse.image,
      creditsUsed: 1,
      processingTime: Date.now() - startTime
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

## Key Benefits of This Approach

1. **No User Setup**: Users never see or need API keys
2. **Revenue Control**: You control all API costs and usage
3. **Subscription Model**: Easy to implement tiered pricing
4. **Security**: API keys never leave your server
5. **Analytics**: Track all usage for business insights
6. **Rate Limiting**: Control usage per user/plan
7. **Cost Management**: Monitor and optimize API spending

## Next Steps

1. Set up your backend server with these endpoints
2. Get your Google Gemini API key from Google AI Studio
3. Configure the app's `EXPO_PUBLIC_API_BASE_URL` environment variable to point to your server
4. Implement user authentication to generate JWT tokens
5. Set up your subscription/billing system (Stripe, etc.)

The mobile app is ready to work with your backend immediately once these endpoints are live!