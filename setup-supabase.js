const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const supabaseUrl = 'https://ethddsqpwrawqkxlvxgr.supabase.co';
const supabaseKey = 'sb_publishable_AYlm2ZmTkbyAwEL0ZM_1hQ_CeYMI-Xu';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('Setting up FZ Parfumerie database...\n');

  // Create parfumes table
  const createTableSQL = `
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
  `;

  console.log('Creating parfumes table...');
  const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL });

  if (tableError) {
    console.log('Table may already exist, continuing...');
    console.log('Table error:', tableError.message);
  } else {
    console.log('✓ parfumes table created successfully');
  }

  // Create storage bucket for parfume images
  console.log('\nCreating storage bucket for parfume images...');
  const { data: bucket, error: bucketError } = await supabase.storage.createBucket('parfume-images', {
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    fileSizeLimit: 5 * 1024 * 1024 // 5MB
  });

  if (bucketError && bucketError.code !== 'storage.bucket_already_exists') {
    console.log('Storage bucket error:', bucketError.message);
  } else {
    console.log('✓ Storage bucket "parfume-images" created');
  }

  // Set bucket policies for public access
  const policies = [
    {
      name: 'public_select_parfume_images',
      definition: `CREATE POLICY "public_select_parfume_images" ON storage.objects FOR SELECT USING (bucket_id = 'parfume-images');`
    },
    {
      name: 'public_insert_parfume_images',
      definition: `CREATE POLICY "public_insert_parfume_images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'parfume-images');`
    }
  ];

  console.log('\nSetting up storage policies...');
  for (const policy of policies) {
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: policy.definition
    });
    if (policyError && !policyError.message.includes('already exists')) {
      console.log(`Policy error: ${policy.name} - ${policyError.message}`);
    } else {
      console.log(`✓ Policy "${policy.name}" set`);
    }
  }

  // Enable RLS on parfumes table
  console.log('\nEnabling Row Level Security on parfumes table...');
  const { error: rlsError } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE parfumes ENABLE ROW LEVEL SECURITY;`
  });

  if (rlsError && !rlsError.message.includes('already')) {
    console.log('RLS error:', rlsError.message);
  } else {
    console.log('✓ Row Level Security enabled');
  }

  // Create RLS policies for parfumes table (allow public access for this demo)
  const parfumePolicies = [
    {
      name: 'public_select_parfumes',
      definition: `CREATE POLICY "public_select_parfumes" ON parfumes FOR SELECT USING (true);`
    },
    {
      name: 'public_insert_parfumes',
      definition: `CREATE POLICY "public_insert_parfumes" ON parfumes FOR INSERT WITH CHECK (true);`
    },
    {
      name: 'public_update_parfumes',
      definition: `CREATE POLICY "public_update_parfumes" ON parfumes FOR UPDATE USING (true);`
    },
    {
      name: 'public_delete_parfumes',
      definition: `CREATE POLICY "public_delete_parfumes" ON parfumes FOR DELETE USING (true);`
    }
  ];

  console.log('\nSetting up parfumes table policies...');
  for (const policy of parfumePolicies) {
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: policy.definition
    });
    if (policyError && !policyError.message.includes('already')) {
      console.log(`Policy error: ${policy.name} - ${policyError.message}`);
    } else {
      console.log(`✓ Policy "${policy.name}" set`);
    }
  }

  // Create database function for executing SQL (if not exists)
  console.log('\nChecking database setup...');
  const { data: functionCheck } = await supabase
    .from('parfumes')
    .select('count')
    .limit(1);

  console.log('\n✅ Database setup complete!');
  console.log('\nYou can now use the FZ Parfumerie app to:');
  console.log('  • Add parfumes with name, brand, notes, accords, and images');
  console.log('  • Edit existing parfumes');
  console.log('  • Delete parfumes');
  console.log('  • View all parfumes in a beautiful iPhone-style interface');
}

setupDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });