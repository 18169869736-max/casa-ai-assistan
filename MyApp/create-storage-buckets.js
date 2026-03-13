/**
 * Create Storage Buckets Script
 *
 * This script creates the storage buckets programmatically.
 * You can also create them manually in the Supabase dashboard.
 *
 * Usage: node create-storage-buckets.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xglszjyvmvnabfsyeezn.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnbHN6anl2bXZuYWJmc3llZXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNTM4MzQsImV4cCI6MjA3NTkyOTgzNH0.sFL7fGEZk0Lghm3ku0TkUqfE3qDQBS5ipuPmB6dgdOU';

console.log('🪣 Creating Storage Buckets...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createBuckets() {
  console.log('⚠️  Note: You need to be authenticated as a service role to create buckets.');
  console.log('This script uses the anon key, which may not have permissions.\n');
  console.log('Please create the buckets manually in the Supabase dashboard:\n');

  console.log('Go to: https://supabase.com/dashboard/project/xglszjyvmvnabfsyeezn/storage/buckets\n');

  console.log('Create these 3 buckets with the following settings:\n');

  console.log('1️⃣  Bucket: original-images');
  console.log('   - Name: original-images');
  console.log('   - Public: ❌ No (Private)');
  console.log('   - File size limit: 10485760 (10 MB)');
  console.log('   - Allowed MIME types: image/jpeg,image/jpg,image/png,image/webp');
  console.log();

  console.log('2️⃣  Bucket: generated-designs');
  console.log('   - Name: generated-designs');
  console.log('   - Public: ❌ No (Private)');
  console.log('   - File size limit: 10485760 (10 MB)');
  console.log('   - Allowed MIME types: image/jpeg,image/jpg,image/png,image/webp');
  console.log();

  console.log('3️⃣  Bucket: example-photos');
  console.log('   - Name: example-photos');
  console.log('   - Public: ✅ Yes');
  console.log('   - File size limit: 10485760 (10 MB)');
  console.log('   - Allowed MIME types: image/jpeg,image/jpg,image/png,image/webp');
  console.log();

  console.log('After creating the buckets, run the storage policies migration:');
  console.log('Copy the contents of: ../supabase/migrations/20250113_002_storage_setup.sql');
  console.log('And run it in: SQL Editor > New Query\n');

  console.log('Or simply run it now by going to:');
  console.log('https://supabase.com/dashboard/project/xglszjyvmvnabfsyeezn/sql/new');
}

createBuckets();
