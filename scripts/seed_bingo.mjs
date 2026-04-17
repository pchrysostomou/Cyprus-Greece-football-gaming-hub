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

// We define the Teams
// 1001 Olympiacos, 1002 Panathinaikos, 2001 APOEL
const PLAYERS = [
  // APOEL
  { api_id: 5001, team_api_id: 2001, name: 'Marquinhos', nationality: 'Brazil', position: 'Attacker', photo_url: 'https://b.fssta.com/uploads/application/soccer/headshots/714020.jpg' },
  { api_id: 5002, team_api_id: 2001, name: 'Kingsley Sarfo', nationality: 'Ghana', position: 'Midfielder', photo_url: 'https://b.fssta.com/uploads/application/soccer/headshots/689300.jpg' },
  { api_id: 5003, team_api_id: 2001, name: 'Giorgi Kvilitaia', nationality: 'Georgia', position: 'Attacker', photo_url: 'https://b.fssta.com/uploads/application/soccer/headshots/142980.jpg' },

  // Olympiacos
  { api_id: 5004, team_api_id: 1001, name: 'Rodinei', nationality: 'Brazil', position: 'Defender', photo_url: 'https://b.fssta.com/uploads/application/soccer/headshots/142980.jpg' },
  { api_id: 5005, team_api_id: 1001, name: 'Chiquinho', nationality: 'Portugal', position: 'Midfielder', photo_url: 'https://b.fssta.com/uploads/application/soccer/headshots/142980.jpg' },

  // Panathinaikos
  { api_id: 5006, team_api_id: 1002, name: 'Bernard', nationality: 'Brazil', position: 'Midfielder', photo_url: 'https://b.fssta.com/uploads/application/soccer/headshots/142980.jpg' },
  { api_id: 5007, team_api_id: 1002, name: 'Fotis Ioannidis', nationality: 'Greece', position: 'Attacker', photo_url: 'https://b.fssta.com/uploads/application/soccer/headshots/684260.png' },
];

async function run() {
  console.log("Seeding Bingo Players...");
  for (const p of PLAYERS) {
    await supabase.from('players').upsert(p, { onConflict: 'api_id' });
    console.log(`Seeded ${p.name}`);
  }
}
run();
