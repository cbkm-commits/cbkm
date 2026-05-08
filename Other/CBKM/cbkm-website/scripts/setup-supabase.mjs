/**
 * One-time setup: creates the Supabase "media" storage bucket.
 * Run: node scripts/setup-supabase.mjs
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qhvsfsjaaoykwynqdkfh.supabase.co',
  // Service role key — only for this local setup script, never in frontend
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFodnNmc2phYW95a3d5bnFka2ZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMwNTY3NCwiZXhwIjoyMDg5ODgxNjc0fQ.3kYfY47mlgO1Tae0o-SLM93oSD7fZjjPS2ed4TVTvyI'
);

const { data, error } = await supabase.storage.createBucket('media', {
  public: true,
  fileSizeLimit: 10485760, // 10MB
});

if (error) {
  if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
    console.log('✓ Bucket "media" already exists');
  } else {
    console.error('✗ Failed to create bucket:', error.message);
    process.exit(1);
  }
} else {
  console.log('✓ Bucket "media" created successfully');
}

console.log('\nDone! Images can now be uploaded to Supabase Storage.');
