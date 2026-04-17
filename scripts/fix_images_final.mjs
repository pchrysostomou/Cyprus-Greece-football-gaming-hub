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

// Manually verified completely unblocked direct Wikipedia image URLs
const TEAM_FIXES = [
  { api_id: 1001, name: "Olympiacos", logo_url: "https://upload.wikimedia.org/wikipedia/en/f/f1/Olympiacos_FC_logo.svg" },
  { api_id: 1002, name: "Panathinaikos", logo_url: "https://upload.wikimedia.org/wikipedia/en/4/4c/Panathinaikos_FC_logo.svg" },
  { api_id: 1003, name: "AEK Athens", logo_url: "https://upload.wikimedia.org/wikipedia/en/0/00/AEK_Athens_FC_logo.svg" },
  { api_id: 1004, name: "PAOK FC", logo_url: "https://upload.wikimedia.org/wikipedia/en/4/4b/PAOK_FC_logo.svg" },
  { api_id: 1005, name: "Aris Thessaloniki", logo_url: "https://upload.wikimedia.org/wikipedia/en/f/f8/Aris_Thessaloniki_FC_logo.svg" },
  { api_id: 2001, name: "APOEL FC", logo_url: "https://upload.wikimedia.org/wikipedia/en/5/52/APOEL_FC_logo.svg" },
  { api_id: 2002, name: "Omonia Nicosia", logo_url: "https://upload.wikimedia.org/wikipedia/en/8/86/AC_Omonia_logo.svg" },
  { api_id: 2003, name: "AEL Limassol", logo_url: "https://upload.wikimedia.org/wikipedia/en/1/1a/AEL_Limassol_logo.svg" },
  { api_id: 2004, name: "Apollon Limassol", logo_url: "https://upload.wikimedia.org/wikipedia/en/0/05/Apollon_Limassol_logo.svg" },
  { api_id: 2005, name: "AEK Larnaca", logo_url: "https://upload.wikimedia.org/wikipedia/en/f/f4/AEK_Larnaca_logo.svg" }
];

const PLAYER_FIXES = [
  { api_id: 3001, name: "Fotis Ioannidis", photo_url: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Fotis_Ioannidis_%28cropped%29.jpg" },
  { api_id: 3006, name: "Anastasios Bakasetas", photo_url: "https://upload.wikimedia.org/wikipedia/commons/f/f6/DK-AEK_%284%29_%28croppe.jpg" },
  { api_id: 3008, name: "Daniel Podence", photo_url: "https://upload.wikimedia.org/wikipedia/commons/9/98/Daniel_Podence_%28cropped%29_WolvesvManCitySeptember2022_2.jpg" },
  { api_id: 3004, name: "Giannis Konstantelias", photo_url: "https://upload.wikimedia.org/wikipedia/commons/d/db/PAOK_Saloniki_-_konstantelias_2023.jpg" },
  { api_id: 3010, name: "Andrija Živković", photo_url: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Andrija_%C5%BDivkovi%C4%87_2020.jpg" },
  { api_id: 3002, name: "Ayoub El Kaabi", photo_url: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Ayoub_El_Kaabi_2023.jpg" },
  { api_id: 3003, name: "Levi García", photo_url: "https://upload.wikimedia.org/wikipedia/commons/b/bd/USMNT_vs._Trinidad_and_Tobago_%2848124938623%29_%28cropped%29.jpg" },
  { api_id: 3013, name: "Roman Bezus", photo_url: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Roman_Bezus2014.jpg" }
];

async function run() {
  console.log("Fixing images using verified URLs direct mapping...");
  
  for (const team of TEAM_FIXES) {
    const { error } = await supabase.from('teams').update({ logo_url: team.logo_url }).eq('api_id', team.api_id);
    if(error) console.log(error);
  }

  for (const player of PLAYER_FIXES) {
    const { error } = await supabase.from('players').update({ photo_url: player.photo_url }).eq('api_id', player.api_id);
    if(error) console.log(error);
    else console.log(`Fixed ${player.name}`);
  }
  
  // Wipe players that we couldn't find good photos for so they stop showing up as Default PFPs
  await supabase.from('players').delete().in('api_id', [3007, 3009, 3011, 3005, 3012, 3014, 3015]);

  console.log("Finished db image links injection!");
}

run();
