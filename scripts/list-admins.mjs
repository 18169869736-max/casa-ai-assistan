#!/usr/bin/env node

/**
 * Script to list all admin users
 *
 * Usage:
 *   node scripts/list-admins.js
 *
 * Or with npm:
 *   npm run list-admins
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

async function listAdmins() {
  try {
    console.log('\nFetching admin users...\n');

    const { data: admins, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_admin', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (!admins || admins.length === 0) {
      console.log('No admin users found.');
      console.log('\nTo create an admin user, run:');
      console.log('  node scripts/make-admin.js your-email@example.com');
      process.exit(0);
    }

    console.log(`Found ${admins.length} admin user${admins.length === 1 ? '' : 's'}:\n`);
    console.log('─'.repeat(80));

    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email}`);
      if (admin.full_name) {
        console.log(`   Name: ${admin.full_name}`);
      }
      console.log(`   User ID: ${admin.id}`);
      console.log(`   Created: ${new Date(admin.created_at).toLocaleDateString()}`);
      console.log(`   Active: ${admin.is_active !== false ? 'Yes' : 'No'}`);
      if (index < admins.length - 1) {
        console.log('─'.repeat(80));
      }
    });

    console.log('─'.repeat(80));
    console.log('');

  } catch (error) {
    console.error('\nError fetching admins:', error.message);
    process.exit(1);
  }
}

listAdmins();
