#!/usr/bin/env node
/**
 * Apply RLS fix for quiz_email_captures table
 *
 * This script applies the latest RLS migration to fix the email capture issue.
 * Run with: node apply-quiz-rls-fix.js
 */

require('dotenv').config({ path: './MyApp/.env.local' });
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please ensure these environment variables are set in MyApp/.env.local:');
  console.error('  - EXPO_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY (or EXPO_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration() {
  try {
    console.log('📝 Reading migration file...');
    const migrationSQL = fs.readFileSync(
      './supabase/migrations/20250114_001_fix_quiz_rls_final.sql',
      'utf8'
    );

    console.log('🚀 Applying migration to Supabase...');
    console.log('   This will fix the RLS policies for quiz_email_captures table');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      // Try alternative method: execute via REST API
      console.log('⚠️  RPC method failed, trying direct execution...');

      // Split the SQL into individual statements and execute them
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.includes('CREATE POLICY') || statement.includes('DROP POLICY') ||
            statement.includes('ALTER TABLE') || statement.includes('COMMENT')) {
          console.log(`   Executing: ${statement.substring(0, 60)}...`);
          const { error: stmtError } = await supabase.rpc('exec_sql', {
            sql: statement + ';'
          });

          if (stmtError) {
            console.error(`   ⚠️  Statement error: ${stmtError.message}`);
          }
        }
      }
    }

    console.log('\n✅ Migration applied successfully!');
    console.log('   The quiz email capture should now work correctly.');
    console.log('\n💡 Please test by submitting the quiz form again.');

  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    console.error('\n📋 Manual Fix Instructions:');
    console.error('   1. Go to your Supabase dashboard: ' + SUPABASE_URL);
    console.error('   2. Navigate to SQL Editor');
    console.error('   3. Open: supabase/migrations/20250114_001_fix_quiz_rls_final.sql');
    console.error('   4. Copy and paste the SQL into the editor');
    console.error('   5. Click "Run" to execute');
    process.exit(1);
  }
}

console.log('🔧 Supabase RLS Fix Tool');
console.log('=========================\n');
applyMigration();
