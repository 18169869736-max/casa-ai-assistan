/**
 * Supabase Setup Verification Script
 *
 * Run this script to verify your Supabase setup is correct.
 * Usage: node verify-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xglszjyvmvnabfsyeezn.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnbHN6anl2bXZuYWJmc3llZXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNTM4MzQsImV4cCI6MjA3NTkyOTgzNH0.sFL7fGEZk0Lghm3ku0TkUqfE3qDQBS5ipuPmB6dgdOU';

console.log('🔍 Verifying Supabase Setup...\n');

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifySetup() {
  let allPassed = true;

  // Test 1: Check environment variables
  console.log('✓ Step 1: Environment Variables');
  if (!SUPABASE_URL || SUPABASE_URL.includes('your-project')) {
    console.log('  ❌ SUPABASE_URL is not configured properly');
    allPassed = false;
  } else {
    console.log(`  ✓ SUPABASE_URL: ${SUPABASE_URL}`);
  }

  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('your-anon-key')) {
    console.log('  ❌ SUPABASE_ANON_KEY is not configured properly');
    allPassed = false;
  } else {
    console.log(`  ✓ SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
  }
  console.log();

  // Test 2: Check database tables
  console.log('✓ Step 2: Database Tables');
  const tables = ['profiles', 'user_preferences', 'generated_designs', 'example_photos'];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`  ❌ Table '${table}': ${error.message}`);
        allPassed = false;
      } else {
        console.log(`  ✓ Table '${table}' exists and is accessible`);
      }
    } catch (err) {
      console.log(`  ❌ Table '${table}': ${err.message}`);
      allPassed = false;
    }
  }
  console.log();

  // Test 3: Check storage buckets
  console.log('✓ Step 3: Storage Buckets');
  const buckets = ['original-images', 'generated-designs', 'example-photos'];

  try {
    const { data: bucketList, error } = await supabase.storage.listBuckets();

    if (error) {
      console.log(`  ❌ Failed to list buckets: ${error.message}`);
      allPassed = false;
    } else {
      const bucketNames = bucketList.map(b => b.name);

      for (const bucket of buckets) {
        if (bucketNames.includes(bucket)) {
          console.log(`  ✓ Bucket '${bucket}' exists`);
        } else {
          console.log(`  ❌ Bucket '${bucket}' is missing`);
          allPassed = false;
        }
      }
    }
  } catch (err) {
    console.log(`  ❌ Failed to check buckets: ${err.message}`);
    allPassed = false;
  }
  console.log();

  // Test 4: Check example photos
  console.log('✓ Step 4: Example Photos Data');
  try {
    const { data, error } = await supabase
      .from('example_photos')
      .select('id, category, title, before_image_url, after_image_url')
      .eq('is_active', true);

    if (error) {
      console.log(`  ❌ Failed to fetch example photos: ${error.message}`);
      allPassed = false;
    } else {
      console.log(`  ✓ Found ${data.length} example photos`);

      if (data.length === 0) {
        console.log('  ⚠️  Warning: No example photos found. You may need to upload images.');
      } else {
        data.forEach(photo => {
          const hasPlaceholder = photo.before_image_url.includes('placeholder') ||
                                photo.after_image_url.includes('placeholder');
          if (hasPlaceholder) {
            console.log(`  ⚠️  Photo '${photo.title}' still has placeholder URLs`);
          } else {
            console.log(`  ✓ Photo '${photo.title}' has valid URLs`);
          }
        });
      }
    }
  } catch (err) {
    console.log(`  ❌ Failed to check example photos: ${err.message}`);
    allPassed = false;
  }
  console.log();

  // Test 5: Test authentication (connection only, not creating user)
  console.log('✓ Step 5: Authentication Service');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error && error.message !== 'Auth session missing!') {
      console.log(`  ❌ Auth service error: ${error.message}`);
      allPassed = false;
    } else {
      console.log('  ✓ Authentication service is accessible');
    }
  } catch (err) {
    console.log(`  ❌ Failed to check auth service: ${err.message}`);
    allPassed = false;
  }
  console.log();

  // Summary
  console.log('═══════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('✅ All checks passed! Your Supabase setup is complete.');
    console.log('\nNext steps:');
    console.log('  1. Upload example photos to the example-photos bucket');
    console.log('  2. Update example_photos table with real image URLs');
    console.log('  3. Integrate auth and storage services into your web app');
    console.log('  4. Test user sign-up and design generation flows');
  } else {
    console.log('❌ Some checks failed. Please review the errors above.');
    console.log('\nCommon solutions:');
    console.log('  - Run migrations in Supabase SQL Editor');
    console.log('  - Check RLS policies are enabled');
    console.log('  - Verify storage buckets are created');
    console.log('  - Ensure API keys are correct');
  }
  console.log('═══════════════════════════════════════════════════════\n');
}

// Run verification
verifySetup().catch(err => {
  console.error('\n❌ Verification failed:', err.message);
  process.exit(1);
});
