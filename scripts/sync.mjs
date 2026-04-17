import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Ensure keys are present
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// We recommend using the SERVICE_ROLE_KEY to bypass RLS for inserting records
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !API_FOOTBALL_KEY) {
  console.error("Missing environment variables. Check .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const LEAGUES = [
  { id: 274, name: 'Cyprus First Division', country: 'Cyprus' },
  { id: 197, name: 'Super League 1', country: 'Greece' }
];

const CURRENT_SEASON = 2024; // Assuming 2024-2025 season

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchFromApiFootball(endpoint) {
  const url = `https://v3.football.api-sports.io${endpoint}`;
  console.log(`Fetching: ${url}`);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-apisports-key": API_FOOTBALL_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io"
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Fetch failed:", err);
    return null;
  }
}

async function syncTeams() {
  for (const league of LEAGUES) {
    console.log(`\n--- Syncing Teams for ${league.name} ---`);
    const data = await fetchFromApiFootball(`/teams?league=${league.id}&season=${CURRENT_SEASON}`);
    
    if (!data || !data.response || data.response.length === 0) {
      console.log(`No team data found for ${league.name}. Rate limit?`);
      continue;
    }

    const teamsPayload = data.response.map((item) => ({
      api_id: item.team.id,
      name: item.team.name,
      league_id: league.id,
      logo_url: item.team.logo,
      country: league.country,
      founded: item.team.founded,
      stadium_name: item.venue.name
    }));

    // Upsert to Supabase
    const { error } = await supabase
      .from('teams')
      .upsert(teamsPayload, { onConflict: 'api_id' });

    if (error) {
      console.error("Supabase Teams Upsert Error:", error);
    } else {
      console.log(`Successfully synced ${teamsPayload.length} teams for ${league.name}.`);
    }

    // Rate limiting: wait 1.5 seconds between league requests
    await sleep(1500); 
  }
}

async function syncPlayers() {
  // First, get all teams currently in our DB
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('api_id, name, league_id');

  if (teamsError || !teams) {
    console.error("Could not fetch teams from Supabase", teamsError);
    return;
  }

  for (const team of teams) {
    console.log(`\n--- Syncing Players for ${team.name} ---`);
    // Pass page=1. For squads, might just need /players/squads endpoint which gives the full roster in one hit without heavy pagination costs
    const data = await fetchFromApiFootball(`/players/squads?team=${team.api_id}`);
    
    if (!data || !data.response || data.response.length === 0) {
      console.log(`No squad data found for ${team.name}. Rate limit?`);
      await sleep(1500);
      continue;
    }

    const playersData = data.response[0].players;
    if (!playersData) continue;

    const playersPayload = playersData.map(player => ({
      api_id: player.id,
      team_api_id: team.api_id,
      name: player.name,
      position: player.position,
      age: player.age,
      shirt_number: player.number,
      photo_url: player.photo
    }));

    // Upsert
    const { error } = await supabase
      .from('players')
      .upsert(playersPayload, { onConflict: 'api_id' });

    if (error) {
      console.error(`Supabase Players Upsert Error for ${team.name}:`, error);
    } else {
      console.log(`Successfully synced ${playersPayload.length} players for ${team.name}.`);
    }

    // Rate limit to avoid 100 calls/day getting drained immediately or RPS limits.
    // Ensure we sleep enough to not trigger 10 calls / sec limitation
    await sleep(2000);
  }
}

async function main() {
  console.log("Starting DB Sync Job...");
  await syncTeams();
  // Be VERY careful on the free tier! There are 14 teams in Cyprus and 14 in Greece.
  // Calling /players/squads for all 28 teams costs 28 calls. Total usage ~ 30 calls. (Safe out of 100/day limit)
  await syncPlayers();
  console.log("DB Sync Job complete.");
}

// Call Main
main();
