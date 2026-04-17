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

// Very safe robust mapping based strictly on the unique starting word of every team 
// (e.g. Olympiacos vs Panathinaikos vs AEK vs Apollon vs AEL)
const LOGOS = [
  { match: 'Olym', url: 'https://tmssl.akamaized.net/images/wappen/big/683.png' },
  { match: 'Panath', url: 'https://tmssl.akamaized.net/images/wappen/big/265.png' },
  { match: 'AEK Athens', url: 'https://tmssl.akamaized.net/images/wappen/big/2441.png' },
  { match: 'PAOK', url: 'https://tmssl.akamaized.net/images/wappen/big/1091.png' },
  { match: 'Aris', url: 'https://tmssl.akamaized.net/images/wappen/big/605.png' },
  
  { match: 'APOEL', url: 'https://tmssl.akamaized.net/images/wappen/big/800.png' },
  { match: 'Omonia', url: 'https://tmssl.akamaized.net/images/wappen/big/819.png' },
  { match: 'Apollon', url: 'https://tmssl.akamaized.net/images/wappen/big/1146.png' },
  { match: 'AEL', url: 'https://tmssl.akamaized.net/images/wappen/big/2330.png' },
  { match: 'AEK Larnaca', url: 'https://tmssl.akamaized.net/images/wappen/big/1070.png' }
];

async function run() {
  console.log("Applying authentic Transfermarkt High-Res badges directly to teams...");
  
  for (const t of LOGOS) {
    const { error } = await supabase.from('teams').update({ logo_url: t.url }).ilike('name', `${t.match}%`);
    if (!error) {
       console.log(`Successfully mapped ${t.match} -> ${t.url}`);
    } else {
       console.log(`[ERR] Failed ${t.match}: `, error);
    }
  }

  console.log("Done.");
}

run();
