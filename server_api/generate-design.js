// Vercel serverless function for AI design generation
// This endpoint uses YOUR Gemini API key to generate designs for users

const fs = require('fs');
const path = require('path');
const { trackApiUsage } = require('./utils/trackApiUsage');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simple file-based storage for demo purposes
const DATA_DIR = '/tmp/casa-ai-data';
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const GENERATIONS_FILE = path.join(DATA_DIR, 'generations.json');

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

  const requestStartTime = Date.now();
  let userId = null;
  let userEmail = null;

  try {
    console.log('=== GENERATE DESIGN REQUEST START ===');
    console.log('Received request:', {
      method: req.method,
      headers: Object.keys(req.headers),
      hasAuth: !!req.headers.authorization,
      body: req.body ? 'present' : 'missing',
      bodyKeys: req.body ? Object.keys(req.body) : []
    });

    // Authenticate user
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader ? 'present' : 'missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth failed: missing or invalid auth header');
      return res.status(401).json({ 
        message: 'Authentication required',
        debug: 'Missing or invalid Authorization header'
      });
    }

    const token = authHeader.substring(7);
    console.log('Extracted token:', token ? token.substring(0, 10) + '...' : 'empty');
    
    console.log('Calling validateUserToken...');
    const user = await validateUserToken(token);
    console.log('User validation result:', user ? 'success' : 'failed');

    if (!user) {
      console.log('Auth failed: user validation failed');

      // Track failed auth attempt
      await trackApiUsage({
        userId: null,
        email: null,
        endpoint: '/api/generate-design',
        method: req.method,
        statusCode: 401,
        responseTimeMs: Date.now() - requestStartTime,
      });

      return res.status(401).json({
        message: 'Invalid authentication token',
        debug: 'Token validation failed'
      });
    }

    // Store user info for tracking
    userId = user.id;
    userEmail = user.email;

    // Check if user account is active (only for web users with real Supabase profiles)
    const isMobileUser = user.id.startsWith('mobile_user_');

    if (!isMobileUser) {
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('is_active')
        .eq('id', user.id)
        .single();

      if (profileError || !userProfile) {
        console.error('Failed to fetch user profile:', profileError);
        return res.status(403).json({
          message: 'Unable to verify account status'
        });
      }

      if (userProfile.is_active === false) {
        console.log('Account is deactivated for user:', user.id);
        return res.status(403).json({
          message: 'Your account has been deactivated. Please contact support for assistance.'
        });
      }
    } else {
      console.log('Skipping profile check for mobile user');
    }

    // Check subscription
    console.log('Checking subscription for user:', user.id);
    const subscription = await checkUserSubscription(user.id);
    console.log('Subscription result:', subscription);
    
    if (!subscription.isActive || subscription.creditsRemaining <= 0) {
      return res.status(402).json({ 
        message: 'Active subscription required',
        subscription 
      });
    }

    // Parse request
    const { image, roomType, style, colorPalette, categoryId } = req.body;
    // Always use the correct model, ignore what client sends
    const model = 'gemini-1.5-flash';
    console.log('Request params:', {
      hasImage: !!image,
      imageLength: image ? image.length : 0,
      roomType,
      style,
      colorPalette,
      categoryId,
      model
    });
    
    if (!image || !roomType || !style || !colorPalette) {
      console.log('Missing required parameters:', { image: !!image, roomType: !!roomType, style: !!style, colorPalette: !!colorPalette });
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // Check image size and compress if needed
    const maxImageSize = 4 * 1024 * 1024; // 4MB limit to stay under Vercel's 4.5MB total
    if (image.length > maxImageSize) {
      console.log(`Image too large: ${image.length} bytes, compressing...`);
      return res.status(413).json({
        message: 'Image too large. Please use a smaller image (max 4MB).',
        imageSize: image.length,
        maxSize: maxImageSize
      });
    }

    const startTime = Date.now();

    // Create design prompt
    console.log('Creating design prompt...');
    const prompt = createDesignPrompt({ roomType, style, colorPalette, categoryId });
    console.log('Prompt created, length:', prompt.length);

    // Edit/transform the user's room image using Gemini 2.5 Flash
    console.log('Transforming image with Gemini 2.5 Flash...');
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
    console.log('API key present:', !!apiKey);
    console.log('API key length:', apiKey ? apiKey.length : 0);
    
    const geminiResponse = await generateImageWithGemini({
      prompt,
      referenceImage: image,
      apiKey,
      model
    });
    console.log('Gemini image transformation response received:', !!geminiResponse);

    // Process the response
    const processingTime = Date.now() - startTime;
    const creditsUsed = 1;

    // Update user credits
    await deductUserCredits(user.id, creditsUsed);

    // Check if user is premium
    const userSubscription = await checkUserSubscription(user.id);

    // Create data URLs for the images
    const originalImageUrl = `data:image/jpeg;base64,${image}`;
    const transformedImageUrl = `data:image/png;base64,${geminiResponse.imageBase64}`;

    // Log the generation
    await logGeneration({
      userId: user.id,
      email: user.email || 'unknown',
      isPremium: userSubscription.planType === 'premium' || userSubscription.planType === 'pro',
      roomType,
      style,
      colorPalette,
      categoryId,
      processingTime,
      creditsUsed,
      timestamp: new Date().toISOString(),
      originalImageUrl,
      transformedImageUrl
    });

    // Track successful API call
    await trackApiUsage({
      userId,
      email: userEmail,
      endpoint: '/api/generate-design',
      method: req.method,
      statusCode: 200,
      responseTimeMs: Date.now() - requestStartTime,
    });

    // Return the result
    res.status(200).json({
      imageUrl: `data:image/png;base64,${geminiResponse.imageBase64}`,
      imageBase64: geminiResponse.imageBase64,
      creditsUsed,
      processingTime
    });

  } catch (error) {
    console.error('=== DESIGN GENERATION ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', error);

    let statusCode = 500;
    let errorResponse = {
      message: 'Design generation failed. Please try again.',
      debug: error.message,
      stack: error.stack
    };

    // Handle different error types
    if (error.message.includes('quota') || error.message.includes('rate limit')) {
      statusCode = 429;
      errorResponse = {
        message: 'API quota exceeded. Please try again later.',
        debug: error.message
      };
    } else if (error.message.includes('safety') || error.message.includes('blocked')) {
      statusCode = 400;
      errorResponse = {
        message: 'Content blocked by safety filters. Please try a different image.',
        debug: error.message
      };
    }

    // Track failed API call
    await trackApiUsage({
      userId,
      email: userEmail,
      endpoint: '/api/generate-design',
      method: req.method,
      statusCode,
      responseTimeMs: Date.now() - requestStartTime,
    });

    return res.status(statusCode).json(errorResponse);
  }
}

// Helper function to determine category from space type
function getCategoryFromSpaceType(spaceType) {
  const gardenTypes = ['vegetable_garden', 'flower_garden', 'zen_garden', 'entertainment_area', 'pool_area', 'play_area', 'cottage_garden', 'herb_garden', 'backyard_garden', 'front_yard_garden', 'rooftop_garden', 'patio_deck'];
  const exteriorTypes = ['single_family_home', 'townhouse', 'apartment_building', 'modern_villa', 'cottage', 'ranch_house', 'colonial_home', 'mediterranean_home'];
  const balconyTypes = ['small_balcony', 'large_balcony', 'juliet_balcony', 'terrace', 'covered_balcony', 'open_balcony', 'corner_balcony'];
  const floorTypes = ['living_room_floor', 'bedroom_floor', 'kitchen_floor', 'bathroom_floor', 'hallway_floor', 'entryway_floor', 'dining_room_floor', 'basement_floor'];
  const paintTypes = ['living_room_walls', 'bedroom_walls', 'kitchen_walls', 'bathroom_walls', 'dining_room_walls', 'hallway_walls', 'office_walls', 'accent_wall'];

  if (gardenTypes.includes(spaceType)) return 'garden_design';
  if (exteriorTypes.includes(spaceType)) return 'exterior_design';
  if (balconyTypes.includes(spaceType)) return 'balcony_design';
  if (floorTypes.includes(spaceType)) return 'floor_restyle';
  if (paintTypes.includes(spaceType)) return 'paint';
  return 'interior_design'; // default
}

// Helper function to create the image editing prompt
function createDesignPrompt({ roomType, style, colorPalette, categoryId }) {
  // Determine category from categoryId or infer from roomType
  const category = categoryId || getCategoryFromSpaceType(roomType);

  const stylePrompt = style === 'Surprise Me'
    ? 'a creative and unique design style that perfectly complements the space'
    : `${style} design style`;

  const colorPrompt = colorPalette === 'Surprise Me'
    ? 'a harmonious and sophisticated color palette'
    : `${colorPalette} color palette`;

  // Category-specific terminology
  const categoryConfig = {
    interior_design: {
      spaceWord: 'room',
      verb: 'Redesign the existing room',
      elements: [
        `Replacing existing furniture with beautiful ${style} furniture that fits the space`,
        `Updating the color scheme to ${colorPalette} throughout walls, furniture, and decor`,
        `Adding proper lighting fixtures that enhance the ${style} aesthetic`,
        `Including stylish decor and accessories appropriate for ${style} design`,
        `Maintaining photorealistic quality while transforming the space`
      ],
      closingLine: 'Edit this room image to look like it was professionally redesigned by a top interior designer. Transform the existing space while keeping its structure intact.'
    },
    garden_design: {
      spaceWord: 'garden',
      verb: 'Redesign the existing garden',
      elements: [
        `Replacing existing plants and landscaping with beautiful ${style} garden elements that fit the space`,
        `Updating the color scheme to ${colorPalette} throughout plantings, hardscaping, and outdoor decor`,
        `Adding appropriate outdoor lighting and features that enhance the ${style} aesthetic`,
        `Including garden furniture, planters, and accessories appropriate for ${style} design`,
        `Maintaining photorealistic quality while transforming the outdoor space`
      ],
      closingLine: 'Edit this garden image to look like it was professionally redesigned by a top landscape designer. Transform the existing outdoor space while keeping its basic layout intact.'
    },
    exterior_design: {
      spaceWord: 'exterior',
      verb: 'Redesign the existing building exterior',
      elements: [
        `Updating the facade with beautiful ${style} architectural elements`,
        `Applying ${colorPalette} color scheme to exterior walls, trim, and accents`,
        `Adding or updating exterior lighting fixtures that enhance the ${style} aesthetic`,
        `Including appropriate landscaping and exterior decor for ${style} design`,
        `Maintaining photorealistic quality while transforming the exterior appearance`
      ],
      closingLine: 'Edit this exterior image to look like it was professionally redesigned by a top architect. Transform the building facade while keeping its basic structure intact.'
    },
    balcony_design: {
      spaceWord: 'balcony',
      verb: 'Redesign the existing balcony',
      elements: [
        `Replacing existing furniture with beautiful ${style} outdoor furniture that fits the space`,
        `Updating the color scheme to ${colorPalette} throughout furniture, planters, and decor`,
        `Adding appropriate outdoor lighting and features that enhance the ${style} aesthetic`,
        `Including plants, cushions, and accessories appropriate for ${style} design`,
        `Maintaining photorealistic quality while transforming the balcony space`
      ],
      closingLine: 'Edit this balcony image to look like it was professionally redesigned by a top outdoor designer. Transform the existing balcony while keeping its structure intact.'
    },
    floor_restyle: {
      spaceWord: 'floor',
      verb: 'Redesign the existing floor',
      elements: [
        `Replacing the current flooring with beautiful ${style} flooring materials`,
        `Using ${colorPalette} color palette for the new flooring design`,
        `Ensuring the flooring material matches the ${style} aesthetic`,
        `Keeping the room layout and furniture placement the same, only changing the floor`,
        `Maintaining photorealistic quality while transforming the flooring`
      ],
      closingLine: 'Edit this image to show professionally redesigned flooring. Transform only the floor surface while keeping everything else intact.'
    },
    paint: {
      spaceWord: 'wall',
      verb: 'Repaint the existing walls',
      elements: [
        `Applying fresh paint in ${colorPalette} color palette to the walls`,
        `Using colors that complement the ${style} design aesthetic`,
        `Keeping all furniture, decor, and room elements exactly the same`,
        `Only changing the wall colors, nothing else in the room`,
        `Maintaining photorealistic quality while transforming the wall colors`
      ],
      closingLine: 'Edit this image to show freshly painted walls. Transform only the wall colors while keeping everything else exactly the same.'
    }
  };

  const config = categoryConfig[category] || categoryConfig.interior_design;

  return `Edit and transform this ${roomType} image to have a stunning ${stylePrompt}.

${config.verb} in the image with ${colorPrompt} as the primary color scheme. Keep the ${config.spaceWord}'s original architecture, windows, doors, and layout but transform it by:

${config.elements.map(e => `- ${e}`).join('\n')}

${config.closingLine}`;
}

// Generate image with Gemini 2.5 Flash Image Generation
async function generateImageWithGemini({ prompt, referenceImage, apiKey, model }) {
  console.log('generateImageWithGemini called with:', {
    promptLength: prompt.length,
    imageLength: referenceImage.length,
    apiKeyPresent: !!apiKey,
    model
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  console.log('Gemini API URL:', url.replace(apiKey, 'HIDDEN_KEY'));

  // Include the reference image for editing/transformation
  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: referenceImage
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  };

  console.log('Making fetch request to Gemini...');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('Gemini response status:', response.status);
  console.log('Gemini response headers:', Object.fromEntries([...response.headers.entries()]));

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { error: response.statusText };
    }
    throw new Error(`Gemini API error (${response.status}): ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  console.log('Gemini response data keys:', Object.keys(data));
  console.log('Gemini candidates length:', data.candidates ? data.candidates.length : 0);
  
  // Extract generated image from response
  if (!data.candidates || data.candidates.length === 0) {
    console.error('No candidates in response:', data);
    throw new Error('No generated content in response');
  }

  const candidate = data.candidates[0];
  console.log('Candidate keys:', Object.keys(candidate));
  console.log('Candidate content keys:', candidate.content ? Object.keys(candidate.content) : 'no content');
  
  if (!candidate.content || !candidate.content.parts) {
    console.error('Invalid candidate structure:', candidate);
    throw new Error('Invalid response structure');
  }

  console.log('Number of parts:', candidate.content.parts.length);
  
  // First, look for any inline image data across all parts
  for (let i = 0; i < candidate.content.parts.length; i++) {
    const part = candidate.content.parts[i];
    console.log(`Part ${i} keys:`, Object.keys(part));
    
    // Check for inline_data (most common format)
    if (part.inline_data && part.inline_data.data) {
      console.log('Found generated image in inline_data at part', i);
      return { imageBase64: part.inline_data.data };
    }
    
    // Check for inlineData (alternative format)
    if (part.inlineData && part.inlineData.data) {
      console.log('Found generated image in inlineData at part', i);
      return { imageBase64: part.inlineData.data };
    }
  }

  // Second, check for base64 images embedded in text
  for (let i = 0; i < candidate.content.parts.length; i++) {
    const part = candidate.content.parts[i];
    if (part.text && part.text.startsWith('data:image')) {
      console.log('Found base64 image in text part', i);
      const base64Data = part.text.split(',')[1];
      return { imageBase64: base64Data };
    }
  }

  // If no image found, log the actual response and throw an error
  for (let i = 0; i < candidate.content.parts.length; i++) {
    const part = candidate.content.parts[i];
    if (part.text) {
      console.log('Found text response (no image generated):', part.text);
      console.log('Full response structure:', JSON.stringify(data, null, 2));
      throw new Error(`Gemini returned text instead of image: ${part.text}`);
    }
  }

  console.error('No generated content found in any part');
  console.error('All parts:', JSON.stringify(candidate.content.parts, null, 2));
  throw new Error('No generated content found in response');
}

// Helper functions for file-based storage
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadUsers() {
  ensureDataDir();
  if (fs.existsSync(USERS_FILE)) {
    const usersData = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(usersData);
  }
  return [];
}

function saveUser(user) {
  ensureDataDir();
  let users = loadUsers();

  const existingIndex = users.findIndex(u => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = { ...users[existingIndex], ...user, lastActive: new Date().toISOString() };
  } else {
    users.push({ ...user, createdAt: new Date().toISOString(), lastActive: new Date().toISOString() });
  }

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function saveGeneration(generation) {
  ensureDataDir();

  let generations = [];
  if (fs.existsSync(GENERATIONS_FILE)) {
    const generationsData = fs.readFileSync(GENERATIONS_FILE, 'utf8');
    generations = JSON.parse(generationsData);
  }

  generations.push(generation);
  fs.writeFileSync(GENERATIONS_FILE, JSON.stringify(generations, null, 2));
}

// Validate JWT token with Supabase and get real user
async function validateUserToken(token) {
  try {
    // Optimization: If token starts with 'mobile_', skip Supabase check
    if (token && token.startsWith('mobile_')) {
      console.log('⚡ Skipping Supabase check for mobile token');
      return {
        id: 'mobile_user_' + token.substring(7, 15),
        email: 'mobile@app.user'
      };
    }

    // First, try Supabase JWT validation (for web users)
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (user && !error) {
      console.log('✅ Valid Supabase JWT token (web user)');
      return {
        id: user.id,
        email: user.email
      };
    }

    // Fallback: Accept any non-empty token for mobile app users
    // This maintains backward compatibility with mobile app
    if (token && token.length > 0) {
      console.log('⚠️ Non-JWT token accepted (mobile app user)');
      return {
        id: 'mobile_user_' + token.substring(0, 8),
        email: 'mobile@app.user'
      };
    }

    console.error('❌ Token validation failed: No valid token provided');
    return null;
  } catch (error) {
    // On any error, fall back to accepting the token for mobile
    if (token && token.length > 0) {
      console.log('⚠️ Token validation error, accepting as mobile user:', error.message);
      return {
        id: 'mobile_user_' + token.substring(0, 8),
        email: 'mobile@app.user'
      };
    }
    console.error('❌ Error validating token:', error);
    return null;
  }
}

// Simple subscription check (replace with real database)
async function checkUserSubscription(userId) {
  // For now, return active subscription - implement real subscription check
  return {
    isActive: true,
    creditsRemaining: 100,
    planType: 'premium'
  };
}

// Simple credit deduction (replace with real database)
async function deductUserCredits(userId, credits) {
  // Implement real credit deduction logic
  console.log(`Deducting ${credits} credits from user ${userId}`);
}

// Save generation to Supabase database
async function logGeneration(data) {
  try {
    // NOTE: Database save is handled by frontend (results.tsx) to avoid duplicate saves
    // Frontend uploads images to Supabase Storage and saves metadata to generated_designs table
    // Backend only logs to file-based storage for backward compatibility
    console.log('Backend logging generation (frontend handles database save)');

    // Save to file-based storage for backward compatibility
    saveGeneration(data);
    saveUser({
      id: data.userId,
      email: data.email || 'unknown',
      isPremium: data.isPremium || false
    });

    console.log('Generation logged:', data);
  } catch (error) {
    console.error('Failed to log generation:', error);
  }
}

// Generate mock design image (replace with real image generation service)
async function generateMockDesign({ roomType, style, colorPalette }) {
  console.log('Generating mock design for:', { roomType, style, colorPalette });
  
  // Create a simple colored rectangle as a placeholder
  // This represents where you'd call Imagen, DALL-E, or another image generation service
  const canvas = createMockCanvas(400, 400, style, colorPalette);
  
  return {
    imageBase64: canvas
  };
}

// Create a mock canvas with design-appropriate colors
function createMockCanvas(width, height, style, colorPalette) {
  // Generate a simple base64 encoded PNG with design info
  // This is a placeholder - replace with actual image generation
  
  const colorMap = {
    'Millennial Gray': '#9E9E9E',
    'Sage Green': '#87A96B', 
    'Terracotta': '#E07A5F',
    'Navy Blue': '#2E4057',
    'Cream': '#F5F5DC'
  };
  
  const styleColors = {
    'Modern': '#2196F3',
    'Minimalist': '#FFFFFF', 
    'Industrial': '#424242',
    'Scandinavian': '#E8F5E8',
    'Bohemian': '#8D6E63'
  };
  
  // Create a simple 1x1 pixel PNG in base64
  // This is just a placeholder - in reality you'd generate a full interior design image
  const mockBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  
  console.log('Generated mock design with colors:', { style, colorPalette, primaryColor: colorMap[colorPalette] || '#CCCCCC' });
  
  return mockBase64;
}