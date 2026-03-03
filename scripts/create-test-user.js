/**
 * Creates a test user. Run: node scripts/create-test-user.js
 * Requires .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');
try {
  const env = readFileSync(envPath, 'utf8');
  env.split('\n').forEach((line) => {
    const m = line.match(/^VITE_SUPABASE_(URL|ANON_KEY)=(.*)$/);
    if (m) process.env[`VITE_SUPABASE_${m[1]}`] = m[2].trim();
  });
} catch {
  console.error('Could not read .env file');
}

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

async function main() {
  // Use mailinator.com - disposable inbox, any address works, no one owns it
  const email = 'amber-mygym-test@mailinator.com';
  const password = 'Ditisnietecht';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: 'http://localhost:5173' },
  });

  if (error) {
    if (error.message?.includes('already registered')) {
      console.log('User already exists. Try signing in with these credentials.');
      console.log('If you need to reset, use Supabase Dashboard > Authentication > Users');
    } else {
      console.error('Error:', error.message);
      process.exit(1);
    }
  } else {
    console.log('Test account created:');
    console.log('  Email:', email);
    console.log('  Password:', password);
    if (data?.user?.identities?.length === 0) {
      console.log('\nNote: User may already exist. If sign-in fails, check Supabase Dashboard.');
    }
    if (data?.user && !data.user.email_confirmed_at) {
      console.log('\nSupabase may require email confirmation. Check Auth settings in Supabase Dashboard.');
      console.log('You can disable "Confirm email" in Authentication > Providers > Email.');
    }
  }
}

main();
