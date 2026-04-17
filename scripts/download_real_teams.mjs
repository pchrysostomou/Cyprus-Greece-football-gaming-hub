import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const REAL_TEAMS = [
  // Greece
  { api_id: 1001, name: "Olympiacos", league_id: 197, country: "Greece", url: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Olympiacos_FC_logo.svg/300px-Olympiacos_FC_logo.svg.png", filename: "olympiacos.png" },
  { api_id: 1002, name: "Panathinaikos", league_id: 197, country: "Greece", url: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Panathinaikos_FC_logo.svg/300px-Panathinaikos_FC_logo.svg.png", filename: "panathinaikos.png" },
  { api_id: 1003, name: "AEK Athens", league_id: 197, country: "Greece", url: "https://upload.wikimedia.org/wikipedia/en/thumb/0/00/AEK_Athens_FC_logo.svg/300px-AEK_Athens_FC_logo.svg.png", filename: "aek_athens.png" },
  { api_id: 1004, name: "PAOK FC", league_id: 197, country: "Greece", url: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/PAOK_FC_logo.svg/300px-PAOK_FC_logo.svg.png", filename: "paok.png" },
  { api_id: 1005, name: "Aris Thessaloniki", league_id: 197, country: "Greece", url: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f8/Aris_Thessaloniki_FC_logo.svg/300px-Aris_Thessaloniki_FC_logo.svg.png", filename: "aris.png" },
  
  // Cyprus
  { api_id: 2001, name: "APOEL FC", league_id: 274, country: "Cyprus", url: "https://upload.wikimedia.org/wikipedia/en/thumb/5/52/APOEL_FC_logo.svg/300px-APOEL_FC_logo.svg.png", filename: "apoel.png" },
  { api_id: 2002, name: "Omonia Nicosia", league_id: 274, country: "Cyprus", url: "https://upload.wikimedia.org/wikipedia/en/thumb/8/86/AC_Omonia_logo.svg/300px-AC_Omonia_logo.svg.png", filename: "omonia.png" },
  { api_id: 2003, name: "AEL Limassol", league_id: 274, country: "Cyprus", url: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/AEL_Limassol_logo.svg/300px-AEL_Limassol_logo.svg.png", filename: "ael.png" },
  { api_id: 2004, name: "Apollon Limassol", league_id: 274, country: "Cyprus", url: "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Apollon_Limassol_logo.svg/300px-Apollon_Limassol_logo.svg.png", filename: "apollon.png" },
  { api_id: 2005, name: "AEK Larnaca", league_id: 274, country: "Cyprus", url: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/AEK_Larnaca_logo.svg/300px-AEK_Larnaca_logo.svg.png", filename: "aek_larnaca.png" },
];

async function downloadImage(url, filepath) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const stream = createWriteStream(filepath);
  await finished(Readable.fromWeb(res.body).pipe(stream));
}

async function run() {
  console.log("Starting Real Teams Download...");
  const logosDir = path.resolve(__dirname, '../public/real-logos');
  
  // Create dir if missing
  try {
    await fs.mkdir(logosDir, { recursive: true });
  } catch(e) {}

  const dbPayload = [];

  for (const team of REAL_TEAMS) {
    dbPayload.push({
      api_id: team.api_id,
      name: team.name,
      league_id: team.league_id,
      country: team.country,
      logo_url: team.url
    });
  }

  console.log("Updating Supabase with real data...");
  const { error } = await supabase.from('teams').upsert(dbPayload, { onConflict: 'api_id' });
  
  if (error) {
    console.error("Supabase Error:", error);
  } else {
    // Delete the old mock teams if they existed
    const oldIds = [1111, 2222, 3333, 4444, 5555, 6666, 7777, 8888, 9999];
    await supabase.from('teams').delete().in('api_id', oldIds);
    console.log("Success! Real teams injected and old mocks cleared.");
  }
}

run();
