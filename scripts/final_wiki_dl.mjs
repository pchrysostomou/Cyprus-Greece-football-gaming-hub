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

// We use the exact Wikipedia Page Titles to reliably get their MAIN thumbnail
const PLAYERS = [
  { api_id: 3004, title: "Giannis_Konstantelias", name: "Giannis Konstantelias" },
  { api_id: 3013, title: "Roman_Bezus", name: "Roman Bezus" },
  { api_id: 3006, title: "Anastasios_Bakasetas", name: "Anastasios Bakasetas" },
  { api_id: 3008, title: "Daniel_Podence", name: "Daniel Podence" },
  { api_id: 3010, title: "Andrija_Živković", name: "Andrija Živković" },
  { api_id: 3002, title: "Ayoub_El_Kaabi", name: "Ayoub El Kaabi" },
  { api_id: 3003, title: "Levi_García", name: "Levi García" }
];

// Provide one manually verified fallback for Fotis since Wikipedia EN lacks his pic
const FOTIS = { api_id: 3001, url: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Fotis_Ioannidis_%28cropped%29.jpg", name: "Fotis Ioannidis" };

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'CyprusGreeceHub' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error('Status ' + res.statusCode));
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => resolve(true));
      file.on('error', reject);
    }).on('error', reject);
  });
}

async function getWikiImageUrl(title) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=400`;
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'CyprusGreeceHub' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId !== "-1" && pages[pageId].thumbnail) resolve(pages[pageId].thumbnail.source);
          else resolve(null);
        } catch (e) { resolve(null); }
      });
    }).on('error', reject);
  });
}

async function run() {
  const playDir = path.resolve(__dirname, '../public/players');
  if (!fs.existsSync(playDir)) fs.mkdirSync(playDir, { recursive: true });

  console.log("Fetching definitive Wikipedia images locally...");

  for (const p of PLAYERS) {
    const imgUrl = await getWikiImageUrl(p.title);
    if (!imgUrl) {
      console.log(`[SKIP] No Wiki photo for ${p.name}`);
      continue;
    }
    
    const dest = path.join(playDir, `${p.api_id}.jpg`);
    try {
      await download(imgUrl, dest);
      await supabase.from('players').update({ photo_url: `/players/${p.api_id}.jpg` }).eq('api_id', p.api_id);
      console.log(`[OK] Saved & Mapped: ${p.name}`);
    } catch (e) {
      console.log(`[ERR] Failed download: ${p.name}`);
    }
  }

  // Handle Fotis
  const fotisDest = path.join(playDir, `3001.jpg`);
  try {
    await download(FOTIS.url, fotisDest);
    await supabase.from('players').update({ photo_url: `/players/3001.jpg` }).eq('api_id', 3001);
    console.log(`[OK] Saved & Mapped: Fotis Ioannidis`);
  } catch(e) {
    console.log(`[ERR] Failed Fotis`);
  }

  console.log("Finished resolving all players!");
}

run();
