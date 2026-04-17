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

async function checkData() {
  const { data, error } = await supabase.from('teams').select('count', { count: 'exact' });
  console.log("Teams in DB:", data, "Error:", error);
  const { data: anonData, error: anonError } = await createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ).from('teams').select('count', { count: 'exact' });
  console.log("Teams via ANON in DB:", anonData, "Error:", anonError);
}
checkData();
