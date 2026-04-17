import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FIXES = [
  { match: 'Apollon', id: '493' },
  { match: 'AEL', id: '426' },
  { match: 'AEK Larnaca', id: '2699' }
];

async function run() {
  for (const t of FIXES) {
    const url = `https://tmssl.akamaized.net/images/wappen/big/${t.id}.png`;
    await supabase.from('teams').update({ logo_url: url }).ilike('name', `${t.match}%`);
    console.log(`Updated ${t.match} -> ${url}`);
  }
}

run();
