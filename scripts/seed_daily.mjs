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
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase.from('daily_challenges').upsert({
    game_type: 'who_am_i',
    target_id: 5001, // Marquinhos
    challenge_date: today
  }, { onConflict: 'challenge_date' });
  
  if (error) console.log("Error:", error);
  else console.log(`Seeded daily challenge for ${today}`);
}
run();
