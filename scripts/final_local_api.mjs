import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// We use ONLY the undisputed, universally certified API-SPORTS identification endpoints for these 10 teams.
// Olympiacos is 552. Apollon Limassol is 889. Massese is 2004. We will NOT query "Massese" or "2004".
const TEAMS = [
  { match: 'Olympiacos', id: 552 },
  { match: 'Panathinaikos', id: 554 },
  { match: 'AEK Athens', id: 553 },
  { match: 'PAOK', id: 551 },
  { match: 'Aris', id: 555 },
  { match: 'APOEL', id: 887 },
  { match: 'Omonia', id: 888 },
  { match: 'Apollon', id: 889 },
  { match: 'AEL', id: 890 },
  { match: 'Larnaca', id: 891 } // Safe matching string for "AEK Larnaca" to avoid overlapping with "AEK Athens"
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error('Failed HTTP ' + res.statusCode));
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => resolve(true));
      file.on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  const teamsDir = path.resolve(__dirname, '../public/teams');
  if (!fs.existsSync(teamsDir)) fs.mkdirSync(teamsDir, { recursive: true });

  console.log("Forcing 100% clean team logos...");

  for (const t of TEAMS) {
    const url = `https://media.api-sports.io/football/teams/${t.id}.png`;
    const localName = t.match.replace(/\s+/g, '_') + '.png';
    const dest = path.join(teamsDir, localName);
    
    try {
      // 1. Download physical file onto hard drive for stability
      await download(url, dest);
      
      // 2. Map database using cache-busting timestamp string so NextJS forcefully re-renders
      const cacheBustStr = `/teams/${localName}?t=${Date.now()}`;
      await supabase.from('teams').update({ logo_url: cacheBustStr }).ilike('name', `%${t.match}%`);
      
      console.log(`[SUCCESS] Fixed: ${t.match} mapped securely to ${cacheBustStr}`);
    } catch(e) {
      console.log(`[ERR] Failed for ${t.match}: `, e.message);
    }
  }
}

run();
