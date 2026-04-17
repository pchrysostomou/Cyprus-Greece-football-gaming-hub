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
  console.log("Restoring true original team logos from API-Football...");
  
  const { data: teams } = await supabase.from('teams').select('api_id');
  
  for (const team of teams) {
    const originalUrl = `https://media.api-sports.io/football/teams/${team.api_id}.png`;
    await supabase.from('teams').update({ logo_url: originalUrl }).eq('api_id', team.api_id);
    console.log(`Restored API ID: ${team.api_id}`);
  }
  
  console.log("Team logos fully restored to 100% original!");
}
run();
