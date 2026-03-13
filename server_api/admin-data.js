// Simple admin dashboard endpoint
// Shows stats about users and image generations
// No authentication - use with caution!

const fs = require('fs');
const path = require('path');

// Simple file-based storage for demo purposes
// In production, replace with a real database
const DATA_DIR = '/tmp/casa-ai-data';
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const GENERATIONS_FILE = path.join(DATA_DIR, 'generations.json');

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
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Load or initialize users data
    let users = [];
    if (fs.existsSync(USERS_FILE)) {
      const usersData = fs.readFileSync(USERS_FILE, 'utf8');
      users = JSON.parse(usersData);
    }

    // Load or initialize generations data
    let generations = [];
    if (fs.existsSync(GENERATIONS_FILE)) {
      const generationsData = fs.readFileSync(GENERATIONS_FILE, 'utf8');
      generations = JSON.parse(generationsData);
    }

    // Calculate stats
    const premiumUsers = users.filter(u => u.isPremium);
    const totalUsers = users.length;
    const totalPremiumUsers = premiumUsers.length;
    const totalGenerations = generations.length;

    // Group generations by user
    const generationsByUser = {};
    generations.forEach(gen => {
      if (!generationsByUser[gen.userId]) {
        generationsByUser[gen.userId] = {
          userId: gen.userId,
          email: gen.email || 'unknown',
          count: 0,
          isPremium: false,
          lastGeneration: gen.timestamp
        };
      }
      generationsByUser[gen.userId].count++;

      // Update last generation timestamp
      if (gen.timestamp > generationsByUser[gen.userId].lastGeneration) {
        generationsByUser[gen.userId].lastGeneration = gen.timestamp;
      }
    });

    // Enrich with user premium status
    users.forEach(user => {
      if (generationsByUser[user.id]) {
        generationsByUser[user.id].isPremium = user.isPremium;
        generationsByUser[user.id].email = user.email;
      }
    });

    // Convert to array and sort by generation count
    const userStats = Object.values(generationsByUser).sort((a, b) => b.count - a.count);

    // Calculate some fun stats
    const avgGenerationsPerUser = totalUsers > 0 ? (totalGenerations / totalUsers).toFixed(2) : 0;
    const topUser = userStats.length > 0 ? userStats[0] : null;

    // Group generations by date
    const generationsByDate = {};
    generations.forEach(gen => {
      const date = gen.timestamp.split('T')[0]; // Extract date part
      if (!generationsByDate[date]) {
        generationsByDate[date] = 0;
      }
      generationsByDate[date]++;
    });

    const generationsTimeline = Object.entries(generationsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Return admin data
    res.status(200).json({
      summary: {
        totalUsers,
        totalPremiumUsers,
        totalGenerations,
        avgGenerationsPerUser,
        topUser: topUser ? {
          userId: topUser.userId,
          email: topUser.email,
          count: topUser.count,
          isPremium: topUser.isPremium
        } : null
      },
      userStats,
      generationsTimeline,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin data error:', error);
    res.status(500).json({
      message: 'Failed to load admin data',
      error: error.message
    });
  }
}

// Helper functions for other endpoints to use
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function saveUser(user) {
  ensureDataDir();

  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    const usersData = fs.readFileSync(USERS_FILE, 'utf8');
    users = JSON.parse(usersData);
  }

  // Update or add user
  const existingIndex = users.findIndex(u => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = { ...users[existingIndex], ...user };
  } else {
    users.push(user);
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

// Export helper functions for use in other endpoints
module.exports.saveUser = saveUser;
module.exports.saveGeneration = saveGeneration;
