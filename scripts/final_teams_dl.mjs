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

const TEAMS = [
  { dbname: "Olympiacos", wiki: "Olympiacos_F.C." },
  { dbname: "Panathinaikos", wiki: "Panathinaikos_F.C." },
  { dbname: "AEK Athens", wiki: "AEK_Athens_F.C." },
  { dbname: "PAOK FC", wiki: "PAOK_FC" },
  { dbname: "Aris Thessaloniki", wiki: "Aris_Thessaloniki_F.C." },
  { dbname: "APOEL FC", wiki: "APOEL_FC" },
  { dbname: "Omonia Nicosia", wiki: "AC_Omonia" },
  { dbname: "Apollon Limassol", wiki: "Apollon_Limassol_FC" },
  { dbname: "AEL Limassol", wiki: "AEL_Limassol" },
  { dbname: "AEK Larnaca", wiki: "AEK_Larnaca_FC" }
];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'CyprusGreeceHubBot/1.0' } }, (res) => {
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

function getWikiImageUrl(title) {
  return new Promise((resolve, reject) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=500`;
    https.get(url, { headers: { 'User-Agent': 'CyprusGreeceHubBot/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId !== "-1" && pages[pageId].thumbnail) {
             resolve(pages[pageId].thumbnail.source);
          } else resolve(null);
        } catch (e) { resolve(null); }
      });
    }).on('error', reject);
  });
}

async function run() {
  const teamsDir = path.resolve(__dirname, '../public/teams');
  if (!fs.existsSync(teamsDir)) fs.mkdirSync(teamsDir, { recursive: true });

  console.log("Fetching official logos directly from Wikipedia Main Articles...");

  for (const t of TEAMS) {
    const imgUrl = await getWikiImageUrl(t.wiki);
    if (!imgUrl) {
      console.log(`[ERR] Could not find thumbnail for ${t.dbname}`);
      continue;
    }
    
    // We replace spaces to be safe
    const localName = t.dbname.replace(/\s+/g, '_') + '.jpg'; // extensions don't strictly matter for browser rendering if content-type is good, but usually they are png/jpg
    const dest = path.join(teamsDir, localName);
    
    try {
      await download(imgUrl, dest);
      const localPath = `/teams/${localName}`;
      
      // Update ALL occurrences of this team in DB (e.g. "Omonia" vs "Omonia Nicosia" variations)
      await supabase.from('teams').update({ logo_url: localPath }).ilike('name', `%${t.dbname.split(' ')[0]}%`);
      console.log(`[OK] Saved & Mapped: ${t.dbname}`);
    } catch (e) {
      console.log(`[ERR] Failed download for ${t.dbname}: ${e.message}`);
    }
    
    await sleep(1500); // Wait strictly 1.5s to prevent 429s from Wikipedia
  }
}

run();
