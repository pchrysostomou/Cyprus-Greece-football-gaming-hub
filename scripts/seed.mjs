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

const MOCK_TEAMS = [
  { api_id: 1111, name: "APOEL FC", league_id: 274, logo_url: "/mock-logos/cyprus.png", country: "Cyprus" },
  { api_id: 2222, name: "Omonia Nicosia", league_id: 274, logo_url: "/mock-logos/cyprus.png", country: "Cyprus" },
  { api_id: 3333, name: "AEL Limassol", league_id: 274, logo_url: "/mock-logos/cyprus.png", country: "Cyprus" },
  { api_id: 4444, name: "Apollon Limassol", league_id: 274, logo_url: "/mock-logos/cyprus.png", country: "Cyprus" },
  { api_id: 5555, name: "AEK Larnaca", league_id: 274, logo_url: "/mock-logos/cyprus.png", country: "Cyprus" },
  { api_id: 6666, name: "Olympiacos", league_id: 197, logo_url: "/mock-logos/greece.png", country: "Greece" },
  { api_id: 7777, name: "Panathinaikos", league_id: 197, logo_url: "/mock-logos/greece.png", country: "Greece" },
  { api_id: 8888, name: "AEK Athens", league_id: 197, logo_url: "/mock-logos/greece.png", country: "Greece" },
  { api_id: 9999, name: "PAOK", league_id: 197, logo_url: "/mock-logos/greece.png", country: "Greece" }
];

async function seed() {
  console.log("Injecting Mock Teams to bypass API Key issue...");
  const { data, error } = await supabase.from('teams').upsert(MOCK_TEAMS, { onConflict: 'api_id' });
  if (error) {
    console.error("Seed error:", error);
  } else {
    console.log("Mock Teams Success!");
  }
}
seed();
