-- Cyprus & Greece Football Hub Database Schema
-- To be executed in Supabase SQL Editor

-- 1. Create the Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id INT UNIQUE NOT NULL, -- The ID from API-Football
  name TEXT NOT NULL,
  league_id INT NOT NULL,     -- 274 for Cyprus, 197 for Greece
  logo_url TEXT,
  country TEXT NOT NULL,
  founded INT,
  stadium_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the Players Table
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id INT UNIQUE NOT NULL, -- The ID from API-Football
  team_api_id INT REFERENCES public.teams(api_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT,
  nationality TEXT,
  age INT,
  shirt_number INT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Daily Challenges Table
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type TEXT NOT NULL, -- e.g., 'who_am_i'
  target_id INT NOT NULL,  -- reference to api_id of the target (e.g. player api_id)
  challenge_date DATE UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create User Scores Table
-- Depends on Supabase Auth (auth.users)
CREATE TABLE IF NOT EXISTS public.user_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  score INT NOT NULL,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scores ENABLE ROW LEVEL SECURITY;

-- Set up RLS Policies

-- Public can read teams, players, and challenges
CREATE POLICY "Allow public read access on teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Allow public read access on players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Allow public read access on daily_challenges" ON public.daily_challenges FOR SELECT USING (true);

-- Users can only insert and read their own scores
CREATE POLICY "Users can insert their own scores" ON public.user_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read their own scores" ON public.user_scores FOR SELECT USING (auth.uid() = user_id);
-- Also allow public to read all user scores for Leaderboards!
CREATE POLICY "Public read user_scores for leaderboards" ON public.user_scores FOR SELECT USING (true);

-- Service Role (used by our Node sync script) bypasses RLS automatically, 
-- but let's create Index optimizations for the frontend
CREATE INDEX IF NOT EXISTS idx_teams_league ON public.teams(league_id);
CREATE INDEX IF NOT EXISTS idx_players_team ON public.players(team_api_id);
