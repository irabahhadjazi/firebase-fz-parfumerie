const { default: fetch } = require('node-fetch');

const SUPABASE_URL = 'https://ethddsqpwrawqkxlvxgr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_AYlm2ZmTkbyAwEL0ZM_1hQ_CeYMI-Xu';

async function createUser() {
  console.log('Creating user for FZ Parfumerie...\n');

  try {
    // Create user with email and password
    const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        email: 'fzparfumerie@parfumerie.com',
        password: 'admin123'
      })
    });

    const data = await response.json();

    if (response.ok || data.user) {
      console.log('✓ User created successfully!');
      console.log('Email: fzparfumerie@parfumerie.com');
      console.log('Password: admin123');
      if (data.user) {
        console.log('User ID:', data.user.id);
      }
      if (data.message) {
        console.log('Message:', data.message);
      }
    } else {
      console.log('Response:', JSON.stringify(data, null, 2));
      if (data.error_description?.includes('already registered')) {
        console.log('✓ User already exists - you can use the credentials');
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

createUser();