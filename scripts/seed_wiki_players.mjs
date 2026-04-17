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

const MOCK_PLAYERS = [
  { api_id: 3001, team_api_id: 1002, name: "Fotis Ioannidis", wiki: "Fotis_Ioannidis", position: "Attacker", nationality: "Greece", age: 24, shirt_number: 7 },
  { api_id: 3006, team_api_id: 1002, name: "Anastasios Bakasetas", wiki: "Anastasios_Bakasetas", position: "Midfielder", nationality: "Greece", age: 30, shirt_number: 8 },
  { api_id: 3002, team_api_id: 1001, name: "Ayoub El Kaabi", wiki: "Ayoub_El_Kaabi", position: "Attacker", nationality: "Morocco", age: 30, shirt_number: 9 },
  { api_id: 3007, team_api_id: 1001, name: "Kostas Fortounis", wiki: "Kostas_Fortounis", position: "Midfielder", nationality: "Greece", age: 31, shirt_number: 7 },
  { api_id: 3008, team_api_id: 1001, name: "Daniel Podence", wiki: "Daniel_Podence", position: "Attacker", nationality: "Portugal", age: 28, shirt_number: 56 },
  { api_id: 3003, team_api_id: 1003, name: "Levi García", wiki: "Levi_García", position: "Attacker", nationality: "Trinidad and Tobago", age: 26, shirt_number: 9 },
  { api_id: 3009, team_api_id: 1003, name: "Steven Zuber", wiki: "Steven_Zuber", position: "Midfielder", nationality: "Switzerland", age: 32, shirt_number: 10 },
  { api_id: 3004, team_api_id: 1004, name: "Giannis Konstantelias", wiki: "Giannis_Konstantelias", position: "Midfielder", nationality: "Greece", age: 21, shirt_number: 77 },
  { api_id: 3010, team_api_id: 1004, name: "Andrija Živković", wiki: "Andrija_Živković", position: "Attacker", nationality: "Serbia", age: 27, shirt_number: 14 },
  { api_id: 3011, team_api_id: 1005, name: "Loren Morón", wiki: "Loren_Morón_(footballer,_born_1993)", position: "Attacker", nationality: "Spain", age: 30, shirt_number: 21 },
  { api_id: 3005, team_api_id: 2001, name: "Marquinhos", wiki: "Marquinhos_(footballer,_born_1997)", position: "Attacker", nationality: "Brazil", age: 27, shirt_number: 10 },
  { api_id: 3013, team_api_id: 2002, name: "Roman Bezus", wiki: "Roman_Bezus", position: "Midfielder", nationality: "Ukraine", age: 33, shirt_number: 90 },
  { api_id: 3015, team_api_id: 2004, name: "Ioannis Pittas", wiki: "Ioannis_Pittas", position: "Attacker", nationality: "Cyprus", age: 27, shirt_number: 9 }
];

async function run() {
  console.log("Fetching Real Wiki Image URLs...");
  const dbPayload = [];

  for (const player of MOCK_PLAYERS) {
    let finalUrl = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"; // Default fallback
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(player.wiki)}&prop=pageimages&format=json&pithumbsize=400`;
      const res = await fetch(url, { headers: { "User-Agent": "CyprusGreeceGamingHub/1.0" } });
      const data = await res.json();
      
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      if (pageId !== "-1" && pages[pageId].thumbnail) {
        finalUrl = pages[pageId].thumbnail.source;
      }
      console.log(`[OK] Resolved ${player.name} -> ${finalUrl}`);
    } catch (e) {
      console.error(`[ERR] Failed logic for ${player.name}`);
    }

    dbPayload.push({
      api_id: player.api_id,
      team_api_id: player.team_api_id,
      name: player.name,
      position: player.position,
      nationality: player.nationality,
      age: player.age,
      shirt_number: player.shirt_number,
      photo_url: finalUrl
    });
  }

  console.log("Updating Supabase Players...");
  const { error } = await supabase.from('players').upsert(dbPayload, { onConflict: 'api_id' });
  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Success! Real players mapped with valid Wikipedia Images!");
  }
}

run();
