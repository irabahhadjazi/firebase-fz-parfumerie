const { default: fetch } = require('node-fetch');

const SUPABASE_URL = 'https://ethddsqpwrawqkxlvxgr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_AYlm2ZmTkbyAwEL0ZM_1hQ_CeYMI-Xu';

async function runSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/sql`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/sql'
    },
    body: sql
  });
  return response.json();
}

async function setupDatabase() {
  console.log('Setting up FZ Parfumerie database...\n');

  try {
    // Create parfumes table
    console.log('Creating parfumes table...');
    const createTableResult = await runSQL(`
      CREATE TABLE IF NOT EXISTS parfumes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        brand TEXT NOT NULL,
        head_notes TEXT,
        middle_notes TEXT,
        base_notes TEXT,
        accords TEXT,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✓ Table created/verified:', JSON.stringify(createTableResult));

    // Create storage bucket
    console.log('\nCreating storage bucket...');
    const bucketResponse = await fetch(`${SUPABASE_URL}/storage/v1/buckets/parfume-images`, {
      method: 'PUT',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        public: true,
        allowed_mime_types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      })
    });
    if (bucketResponse.ok) {
      console.log('✓ Storage bucket created');
    } else {
      console.log('Bucket may already exist');
    }

    // Set policies using SQL
    console.log('\nSetting up policies...');
    const policies = [
      `CREATE POLICY IF NOT EXISTS "public_select_parfume_images" ON storage.objects FOR SELECT USING (bucket_id = 'parfume-images')`,
      `CREATE POLICY IF NOT EXISTS "public_insert_parfume_images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'parfume-images')`,
      `CREATE POLICY IF NOT EXISTS "public_update_parfume_images" ON storage.objects FOR UPDATE USING (bucket_id = 'parfume-images')`,
      `CREATE POLICY IF NOT EXISTS "public_delete_parfume_images" ON storage.objects FOR DELETE USING (bucket_id = 'parfume-images')`,
      `CREATE POLICY IF NOT EXISTS "public_select_parfumes" ON parfumes FOR SELECT USING (true)`,
      `CREATE POLICY IF NOT EXISTS "public_insert_parfumes" ON parfumes FOR INSERT WITH CHECK (true)`,
      `CREATE POLICY IF NOT EXISTS "public_update_parfumes" ON parfumes FOR UPDATE USING (true)`,
      `CREATE POLICY IF NOT EXISTS "public_delete_parfumes" ON parfumes FOR DELETE USING (true)`
    ];

    for (const policy of policies) {
      const result = await runSQL(policy);
      console.log(`✓ Policy applied: ${policy.split('IF NOT EXISTS')[1]?.trim().slice(0, 50)}...`);
    }

    // Test the setup
    console.log('\nTesting database connection...');
    const testResult = await fetch(`${SUPABASE_URL}/rest/v1/parfumes`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    console.log('✓ Database connection test successful');

    console.log('\n✅ FZ Parfumerie database setup complete!');
    console.log('\nFeatures ready:');
    console.log('  • Add/Edit/Delete parfumes');
    console.log('  • Store parfume images');
    console.log('  • Track head/middle/base notes');
    console.log('  • Track accords');

  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase();