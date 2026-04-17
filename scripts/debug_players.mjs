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
  const { data: players } = await supabase.from('players').select('*, teams(name)');
  console.log(`There are ${players?.length} players.`);
  console.log(players?.map(p => `${p.name} - ${p.teams?.name} - ${p.position}`).join('\n'));
}
run();
