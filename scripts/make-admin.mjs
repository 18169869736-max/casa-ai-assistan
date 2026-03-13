#!/usr/bin/env node

/**
 * Script to grant admin privileges to a user
 *
 * Usage:
 *   node scripts/make-admin.js your-email@example.com
 *
 * Or with npm:
 *   npm run make-admin your-email@example.com
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing required environment variables');
  console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function makeAdmin(email) {
  try {
    console.log(`\nGranting admin privileges to: ${email}\n`);

    // Check if user exists
    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (findError) {
      if (findError.code === 'PGRST116') {
        console.error(`Error: No user found with email: ${email}`);
        console.error('Please ensure the user has registered and has a profile.');
        process.exit(1);
      }
      throw findError;
    }

    if (profile.is_admin) {
      console.log('✓ User is already an admin!');
      process.exit(0);
    }

    // Update user to admin
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('email', email)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    console.log('✓ Successfully granted admin privileges!');
    console.log('\nUser details:');
    console.log('  Email:', data.email);
    console.log('  Name:', data.full_name || '(not set)');
    console.log('  Admin:', data.is_admin ? 'Yes' : 'No');
    console.log('  Created:', new Date(data.created_at).toLocaleDateString());
    console.log('\nThe user can now access the admin dashboard at /admin');

  } catch (error) {
    console.error('\nError granting admin privileges:', error.message);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/make-admin.js <email>');
  console.error('Example: node scripts/make-admin.js admin@example.com');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('Error: Invalid email format');
  process.exit(1);
}

makeAdmin(email);
