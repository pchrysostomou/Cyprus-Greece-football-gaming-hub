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

// We need api_id to match the team api_id we injected in seed_real.mjs
// panathinaikos = 1002, olympiacos = 1001, aek = 1003, paok = 1004, apoel = 2001
const REAL_PLAYERS = [
  { api_id: 3001, team_api_id: 1002, name: "Fotis Ioannidis", position: "Attacker", nationality: "Greece", age: 24, shirt_number: 7, photo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Fotis_Ioannidis_2023.jpg/300px-Fotis_Ioannidis_2023.jpg" },
  { api_id: 3002, team_api_id: 1001, name: "Ayoub El Kaabi", position: "Attacker", nationality: "Morocco", age: 30, shirt_number: 9, photo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Ayoub_El_Kaabi_2018.jpg/300px-Ayoub_El_Kaabi_2018.jpg" },
  { api_id: 3003, team_api_id: 1003, name: "Levi Garcia", position: "Attacker", nationality: "Trinidad and Tobago", age: 26, shirt_number: 9, photo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Levi_Garc%C3%ADa_%28cropped%29.jpg/300px-Levi_Garc%C3%ADa_%28cropped%29.jpg" },
  { api_id: 3004, team_api_id: 1004, name: "Giannis Konstantelias", position: "Midfielder", nationality: "Greece", age: 21, shirt_number: 77, photo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Giannis_Konstantelias_2023.jpg/300px-Giannis_Konstantelias_2023.jpg" },
  { api_id: 3005, team_api_id: 2001, name: "Marquinhos", position: "Attacker", nationality: "Brazil", age: 27, shirt_number: 10, photo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Marquinhos_PSG.jpg/300px-Marquinhos_PSG.jpg" } // placeholder representation
];

async function seedPlayers() {
  console.log("Injecting Real Players...");
  const { data, error } = await supabase.from('players').upsert(REAL_PLAYERS, { onConflict: 'api_id' });
  if (error) {
    console.error("Player Seed error:", error);
  } else {
    console.log("Real Players Successfully Injected!");
  }
}
seedPlayers();
