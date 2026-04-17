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

const MOCK_PLAYERS = [
  // Panathinaikos (1002)
  { api_id: 3001, team_api_id: 1002, name: "Fotis Ioannidis", position: "Attacker", nationality: "Greece", age: 24, shirt_number: 7, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Fotis_Ioannidis_2023.jpg/300px-Fotis_Ioannidis_2023.jpg", filename: "ioannidis.jpg" },
  { api_id: 3006, team_api_id: 1002, name: "Anastasios Bakasetas", position: "Midfielder", nationality: "Greece", age: 30, shirt_number: 8, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Anastasios_Bakasetas_2021.jpg/300px-Anastasios_Bakasetas_2021.jpg", filename: "bakasetas.jpg" },
  
  // Olympiacos (1001)
  { api_id: 3002, team_api_id: 1001, name: "Ayoub El Kaabi", position: "Attacker", nationality: "Morocco", age: 30, shirt_number: 9, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Ayoub_El_Kaabi_2018.jpg/300px-Ayoub_El_Kaabi_2018.jpg", filename: "el_kaabi.jpg" },
  { api_id: 3007, team_api_id: 1001, name: "Kostas Fortounis", position: "Midfielder", nationality: "Greece", age: 31, shirt_number: 7, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Kostas_Fortounis_2019.png/300px-Kostas_Fortounis_2019.png", filename: "fortounis.png" },
  { api_id: 3008, team_api_id: 1001, name: "Daniel Podence", position: "Attacker", nationality: "Portugal", age: 28, shirt_number: 56, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Daniel_Podence.jpg/300px-Daniel_Podence.jpg", filename: "podence.jpg" },

  // AEK Athens (1003)
  { api_id: 3003, team_api_id: 1003, name: "Levi Garcia", position: "Attacker", nationality: "Trinidad and Tobago", age: 26, shirt_number: 9, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Levi_Garc%C3%ADa_%28cropped%29.jpg/300px-Levi_Garc%C3%ADa_%28cropped%29.jpg", filename: "garcia.jpg" },
  { api_id: 3009, team_api_id: 1003, name: "Steven Zuber", position: "Midfielder", nationality: "Switzerland", age: 32, shirt_number: 10, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Steven_Zuber_2018.jpg/300px-Steven_Zuber_2018.jpg", filename: "zuber.jpg" },

  // PAOK (1004)
  { api_id: 3004, team_api_id: 1004, name: "Giannis Konstantelias", position: "Midfielder", nationality: "Greece", age: 21, shirt_number: 77, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Giannis_Konstantelias_2023.jpg/300px-Giannis_Konstantelias_2023.jpg", filename: "konstantelias.jpg" },
  { api_id: 3010, team_api_id: 1004, name: "Andrija Zivkovic", position: "Attacker", nationality: "Serbia", age: 27, shirt_number: 14, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Andrija_Zivkovic_2018.jpg/300px-Andrija_Zivkovic_2018.jpg", filename: "zivkovic.jpg" },

  // Aris (1005)
  { api_id: 3011, team_api_id: 1005, name: "Loren Moron", position: "Attacker", nationality: "Spain", age: 30, shirt_number: 21, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Loren_Mor%C3%B3n_%282018%29.jpg/300px-Loren_Mor%C3%B3n_%282018%29.jpg", filename: "moron.jpg" },

  // APOEL (2001)
  { api_id: 3005, team_api_id: 2001, name: "Marquinhos", position: "Attacker", nationality: "Brazil", age: 27, shirt_number: 10, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Marquinhos_PSG.jpg/300px-Marquinhos_PSG.jpg", filename: "marquinhos.jpg" },
  { api_id: 3012, team_api_id: 2001, name: "Giorgos Kvilitaia", position: "Attacker", nationality: "Georgia", age: 30, shirt_number: 8, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Giorgi_Kvilitaia.jpg/300px-Giorgi_Kvilitaia.jpg", filename: "kvilitaia.jpg" },

  // Omonia (2002)
  { api_id: 3013, team_api_id: 2002, name: "Roman Bezus", position: "Midfielder", nationality: "Ukraine", age: 33, shirt_number: 90, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Roman_Bezus_2015.jpg/300px-Roman_Bezus_2015.jpg", filename: "bezus.jpg" },
  { api_id: 3014, team_api_id: 2002, name: "Andronikos Kakoullis", position: "Attacker", nationality: "Cyprus", age: 23, shirt_number: 9, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Andronikos_Kakoullis.jpg/300px-Andronikos_Kakoullis.jpg", filename: "kakoullis.jpg" },

  // Apollon (2004)
  { api_id: 3015, team_api_id: 2004, name: "Ioannis Pittas", position: "Attacker", nationality: "Cyprus", age: 27, shirt_number: 9, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Ioannis_Pittas_%28cropped%29.jpg/300px-Ioannis_Pittas_%28cropped%29.jpg", filename: "pittas.jpg" }
];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

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
  console.log("Starting Robust Downloader for Player Images...");
  const playersDir = path.resolve(__dirname, '../public/players');
  
  try {
    await fs.mkdir(playersDir, { recursive: true });
  } catch(e) {}

  const dbPayload = [];

  for (const player of MOCK_PLAYERS) {
    const dest = path.join(playersDir, player.filename);
    try {
      console.log(`Downloading ${player.name}...`);
      await downloadImage(player.url, dest);
      dbPayload.push({
        api_id: player.api_id,
        team_api_id: player.team_api_id,
        name: player.name,
        position: player.position,
        nationality: player.nationality,
        age: player.age,
        shirt_number: player.shirt_number,
        photo_url: `/players/${player.filename}`
      });
      console.log(`Success! Waiting 2 seconds to avoid Rate Limit...`);
    } catch (e) {
      console.error(`Failed to download ${player.name}. Falling back to default pfp.`);
      dbPayload.push({
        ...player,
        photo_url: "/players/default_pfp.jpg" // Safe fallback
      });
    }
    await sleep(2000); // 2 second delay between requests!
  }

  // Create a default PFP just in case
  const defaultPfpPath = path.join(playersDir, 'default_pfp.jpg');
  try {
     const dummyPicUrl = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";
     await downloadImage(dummyPicUrl, defaultPfpPath);
  } catch (e) {}

  console.log("Updating Supabase with Expanded Player DB...");
  const { error } = await supabase.from('players').upsert(dbPayload, { onConflict: 'api_id' });
  
  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Success! Extensively expanded player database injected.");
  }
}

run();
