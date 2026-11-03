const { default: fetch } = require('node-fetch');

const SUPABASE_URL = 'https://ethddsqpwrawqkxlvxgr.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_KEY';

async function confirmEmail() {
  console.log('Confirming email for fzparfumerie@parfumerie.com...');

  // Try using the management API to confirm the user
  // This requires the service role key which has admin privileges
  // For now, let's just try to sign in to see the user exists
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_URL,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  });

  console.log('Response:', response.status);
}

// Since we don't have the service key, let's just output instructions
console.log(`
To confirm the user email in Supabase:

Option 1: Go to Supabase Dashboard
1. Visit: https://ethddsqpwrawqkxlvxgr.supabase.co
2. Go to Authentication > Users
3. Find the user "fzparfumerie@parfumerie.com"
4. Click "Confirm" button

Option 2: Disable email confirmations (for testing)
1. In Supabase Dashboard, go to Authentication > Settings
2. Disable "Enable Email Confirmations"

Then you can login with:
- Email: fzparfumerie@parfumerie.com
- Password: admin123
`);

confirmEmail();