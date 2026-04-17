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

// 100% reliable CDNs typically used by flash score apps and don't block
const TEAM_LINKS = [
  { api_id: 1001, url: "https://secure.cache.images.core.optasports.com/soccer/teams/150x150/132.png", name: "Olympiacos" },
  { api_id: 1002, url: "https://secure.cache.images.core.optasports.com/soccer/teams/150x150/141.png", name: "Panathinaikos" },
  { api_id: 1003, url: "https://secure.cache.images.core.optasports.com/soccer/teams/150x150/133.png", name: "AEK Athens" },
  { api_id: 1004, url: "https://secure.cache.images.core.optasports.com/soccer/teams/150x150/134.png", name: "PAOK" },
  { api_id: 1005, url: "https://secure.cache.images.core.optasports.com/soccer/teams/150x150/143.png", name: "Aris" },
  { api_id: 2001, url: "https://secure.cache.images.core.optasports.com/soccer/teams/150x150/4553.png", name: "APOEL" },
  { api_id: 2002, url: "https://secure.cache.images.core.optasports.com/soccer/teams/150x150/4554.png", name: "Omonia" },
  { api_id: 2003, url: "https://secure.cache.images.core.optasports.com/soccer/teams/150x150/4555.png", name: "AEL" },
  { api_id: 2004, url: "https://secure.cache.images.core.optasports.com/soccer/teams/150x150/4552.png", name: "Apollon" },
  { api_id: 2005, url: "https://secure.cache.images.core.optasports.com/soccer/teams/150x150/4551.png", name: "AEK Larnaca" }
];

const PLAYER_LINKS = [
  { api_id: 3001, name: "Fotis Ioannidis", url: "https://b.fssta.com/uploads/application/soccer/headshots/684260.png" },
  { api_id: 3006, name: "Anastasios Bakasetas", url: "https://b.fssta.com/uploads/application/soccer/headshots/312450.png" },
  { api_id: 3008, name: "Daniel Podence", url: "https://b.fssta.com/uploads/application/soccer/headshots/291680.png" },
  { api_id: 3004, name: "Giannis Konstantelias", url: "https://b.fssta.com/uploads/application/soccer/headshots/924250.png" },
  { api_id: 3010, name: "Andrija Živković", url: "https://b.fssta.com/uploads/application/soccer/headshots/292320.png" },
  { api_id: 3002, name: "Ayoub El Kaabi", url: "https://b.fssta.com/uploads/application/soccer/headshots/633450.png" },
  { api_id: 3003, name: "Levi García", url: "https://b.fssta.com/uploads/application/soccer/headshots/402770.png" },
  { api_id: 3013, name: "Roman Bezus", url: "https://b.fssta.com/uploads/application/soccer/headshots/142980.png" },
];

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) return reject(new Error('Failed ' + res.statusCode));
      const file = fs.createWriteStream(filepath);
      res.pipe(file);
      file.on('finish', () => resolve(true));
      file.on('error', reject);
    }).on('error', reject);
  });
};

async function run() {
  const teamsDir = path.resolve(__dirname, '../public/teams');
  const playDir = path.resolve(__dirname, '../public/players');
  
  if (!fs.existsSync(teamsDir)) fs.mkdirSync(teamsDir);
  if (!fs.existsSync(playDir)) fs.mkdirSync(playDir);

  for (const t of TEAM_LINKS) {
    const dest = path.join(teamsDir, `${t.api_id}.png`);
    try {
      await downloadImage(t.url, dest);
      await supabase.from('teams').update({ logo_url: `/teams/${t.api_id}.png` }).eq('api_id', t.api_id);
      console.log(`Grabbed ${t.name}`);
    } catch { console.log(`Failed ${t.name}`) }
  }

  for (const p of PLAYER_LINKS) {
    const dest = path.join(playDir, `${p.api_id}.png`);
    try {
      await downloadImage(p.url, dest);
      await supabase.from('players').update({ photo_url: `/players/${p.api_id}.png` }).eq('api_id', p.api_id);
      console.log(`Grabbed ${p.name}`);
    } catch { console.log(`Failed ${p.name}`) }
  }
}
run();
