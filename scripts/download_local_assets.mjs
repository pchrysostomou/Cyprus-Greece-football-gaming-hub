import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MAPPINGS = {
  teams: [
    { api_id: 1001, url: "https://upload.wikimedia.org/wikipedia/en/f/f1/Olympiacos_FC_logo.svg", ext: "svg" },
    { api_id: 1002, url: "https://upload.wikimedia.org/wikipedia/en/4/4c/Panathinaikos_FC_logo.svg", ext: "svg" },
    { api_id: 1003, url: "https://upload.wikimedia.org/wikipedia/en/0/00/AEK_Athens_FC_logo.svg", ext: "svg" },
    { api_id: 1004, url: "https://upload.wikimedia.org/wikipedia/en/4/4b/PAOK_FC_logo.svg", ext: "svg" },
    { api_id: 1005, url: "https://upload.wikimedia.org/wikipedia/en/f/f8/Aris_Thessaloniki_FC_logo.svg", ext: "svg" },
    { api_id: 2001, url: "https://upload.wikimedia.org/wikipedia/en/5/52/APOEL_FC_logo.svg", ext: "svg" },
    { api_id: 2002, url: "https://upload.wikimedia.org/wikipedia/en/8/86/AC_Omonia_logo.svg", ext: "svg" },
    { api_id: 2003, url: "https://upload.wikimedia.org/wikipedia/en/1/1a/AEL_Limassol_logo.svg", ext: "svg" },
    { api_id: 2004, url: "https://upload.wikimedia.org/wikipedia/en/0/05/Apollon_Limassol_logo.svg", ext: "svg" },
    { api_id: 2005, url: "https://upload.wikimedia.org/wikipedia/en/f/f4/AEK_Larnaca_logo.svg", ext: "svg" }
  ],
  players: [
    { api_id: 3001, url: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Fotis_Ioannidis_%28cropped%29.jpg", ext: "jpg" },
    { api_id: 3006, url: "https://upload.wikimedia.org/wikipedia/commons/f/f6/DK-AEK_%284%29_%28croppe.jpg", ext: "jpg" },
    { api_id: 3008, url: "https://upload.wikimedia.org/wikipedia/commons/9/98/Daniel_Podence_%28cropped%29_WolvesvManCitySeptember2022_2.jpg", ext: "jpg" },
    { api_id: 3004, url: "https://upload.wikimedia.org/wikipedia/commons/d/db/PAOK_Saloniki_-_konstantelias_2023.jpg", ext: "jpg" },
    { api_id: 3010, url: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Andrija_%C5%BDivkovi%C4%87_2020.jpg", ext: "jpg" },
    { api_id: 3002, url: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Ayoub_El_Kaabi_2023.jpg", ext: "jpg" },
    { api_id: 3003, url: "https://upload.wikimedia.org/wikipedia/commons/b/bd/USMNT_vs._Trinidad_and_Tobago_%2848124938623%29_%28cropped%29.jpg", ext: "jpg" },
    { api_id: 3013, url: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Roman_Bezus2014.jpg", ext: "jpg" }
  ]
};

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Status: ' + res.statusCode));
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => { stream.close(); resolve(); });
      stream.on('error', reject);
    }).on('error', reject);
  });
};

async function run() {
  const publicTeams = path.resolve(__dirname, '../public/teams');
  const publicPlayers = path.resolve(__dirname, '../public/players');
  
  if (!fs.existsSync(publicTeams)) fs.mkdirSync(publicTeams, { recursive: true });
  if (!fs.existsSync(publicPlayers)) fs.mkdirSync(publicPlayers, { recursive: true });

  console.log("Downloading static assets locally...");

  for (const t of MAPPINGS.teams) {
    const filename = `${t.api_id}.${t.ext}`;
    const dest = path.join(publicTeams, filename);
    const localUrl = `/teams/${filename}`;
    try {
      await download(t.url, dest);
      console.log(`[OK] Team ${t.api_id}`);
      await supabase.from('teams').update({ logo_url: localUrl }).eq('api_id', t.api_id);
    } catch (e) {
      console.log(`[ERR] Team ${t.api_id}: ${e.message}`);
    }
  }

  for (const p of MAPPINGS.players) {
    const filename = `${p.api_id}.${p.ext}`;
    const dest = path.join(publicPlayers, filename);
    const localUrl = `/players/${filename}`;
    try {
      await download(p.url, dest);
      console.log(`[OK] Player ${p.api_id}`);
      await supabase.from('players').update({ photo_url: localUrl }).eq('api_id', p.api_id);
    } catch (e) {
      console.log(`[ERR] Player ${p.api_id}: ${e.message}`);
    }
  }
  
  console.log("All local assets downloaded and DB updated.");
}

run();
