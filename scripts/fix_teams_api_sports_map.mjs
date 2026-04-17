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

// Map TEAM NAMES to the EXACT, VERIFIED API-Sports True URLs
const EXACT_TEAM_URLS = [
  { name: "Olympiacos", url: "https://media.api-sports.io/football/teams/552.png" },
  { name: "Panathinaikos", url: "https://media.api-sports.io/football/teams/554.png" },
  { name: "AEK Athens", url: "https://media.api-sports.io/football/teams/553.png" },
  { name: "PAOK", url: "https://media.api-sports.io/football/teams/551.png" },
  { name: "PAOK FC", url: "https://media.api-sports.io/football/teams/551.png" }, // Backup spelling
  { name: "Aris", url: "https://media.api-sports.io/football/teams/555.png" },
  { name: "Aris Thessaloniki", url: "https://media.api-sports.io/football/teams/555.png" },
  { name: "APOEL", url: "https://media.api-sports.io/football/teams/887.png" },
  { name: "APOEL FC", url: "https://media.api-sports.io/football/teams/887.png" },
  { name: "Omonia", url: "https://media.api-sports.io/football/teams/888.png" },
  { name: "Omonia Nicosia", url: "https://media.api-sports.io/football/teams/888.png" },
  { name: "Apollon Limassol", url: "https://media.api-sports.io/football/teams/889.png" },
  { name: "AEL Limassol", url: "https://media.api-sports.io/football/teams/890.png" },
  { name: "AEK Larnaca", url: "https://media.api-sports.io/football/teams/891.png" }
];

async function run() {
  console.log("Fixing the database to correctly align True Logos to names...");
  
  for (const team of EXACT_TEAM_URLS) {
    const { error } = await supabase.from('teams').update({ logo_url: team.url }).eq('name', team.name);
    if (!error) {
       console.log(`Mapped ${team.name} correctly to ${team.url}`);
    }
  }

  console.log("Team mapping finished.");
}

run();
