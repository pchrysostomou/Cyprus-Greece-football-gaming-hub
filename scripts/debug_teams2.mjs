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

async function run() {
  const { data: teams, error } = await supabase.from('teams').select('*').order('api_id');
  console.log("Found", teams?.length, "teams:");
  for (const t of teams) {
    console.log(`${t.api_id} - ${t.name} -> ${t.logo_url}`);
  }
}
run();
