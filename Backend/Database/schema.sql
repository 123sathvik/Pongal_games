-- ============================================================================
-- COMPLETE DATABASE SETUP FOR PONGAL GAMES WITH REGISTRATION SYSTEM
-- ============================================================================

-- Create games table (if not exists)
CREATE TABLE IF NOT EXISTS games (
    id BIGSERIAL PRIMARY KEY,
    icon TEXT NOT NULL,
    tamil TEXT NOT NULL,
    english TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('main', 'kids', 'women', 'men', 'fun')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create scheduled_games table (if not exists)
CREATE TABLE IF NOT EXISTS scheduled_games (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    scheduled_time TEXT NOT NULL,
    date TEXT NOT NULL,
    venue TEXT NOT NULL,
    participants TEXT[] NOT NULL,
    game_type TEXT NOT NULL DEFAULT 'team' CHECK (game_type IN ('team', 'individual')),
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add new columns to scheduled_games table (migration)
ALTER TABLE scheduled_games 
ADD COLUMN IF NOT EXISTS registration_open BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS max_teams INTEGER,
ADD COLUMN IF NOT EXISTS max_players_per_team INTEGER;

-- Create team_registrations table
CREATE TABLE IF NOT EXISTS team_registrations (
    id BIGSERIAL PRIMARY KEY,
    scheduled_game_id BIGINT NOT NULL REFERENCES scheduled_games(id) ON DELETE CASCADE,
    team_name TEXT NOT NULL,
    captain_name TEXT NOT NULL,
    captain_phone TEXT,
    captain_email TEXT,
    players TEXT[] NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(scheduled_game_id, team_name)
);

-- Create individual_registrations table
CREATE TABLE IF NOT EXISTS individual_registrations (
    id BIGSERIAL PRIMARY KEY,
    scheduled_game_id BIGINT NOT NULL REFERENCES scheduled_games(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    age INTEGER,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(scheduled_game_id, player_name)
);

CREATE TABLE IF NOT EXISTS active_game_states (
    id BIGSERIAL PRIMARY KEY,
    scheduled_game_id BIGINT NOT NULL REFERENCES scheduled_games(id) ON DELETE CASCADE,
    current_scores JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'playing' CHECK (status IN ('playing', 'completed')),
    winner_data JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(scheduled_game_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_scheduled_games_game_id ON scheduled_games(game_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_games_is_active ON scheduled_games(is_active);
CREATE INDEX IF NOT EXISTS idx_scheduled_games_date ON scheduled_games(date);
CREATE INDEX IF NOT EXISTS idx_scheduled_games_registration_open ON scheduled_games(registration_open);
CREATE INDEX IF NOT EXISTS idx_team_registrations_scheduled_game ON team_registrations(scheduled_game_id);
CREATE INDEX IF NOT EXISTS idx_individual_registrations_scheduled_game ON individual_registrations(scheduled_game_id);

-- Insert default games (only if they don't exist)
INSERT INTO games (icon, tamil, english, category) VALUES
('🏏', 'கிரிக்கெட்', 'Cricket', 'main'),
('🤼', 'கபடி', 'Kabaddi', 'main'),
('⚽', 'காலபந்து', 'Football', 'main'),
('🏐', 'கைப்பந்து', 'Volleyball', 'main'),
('🏃‍♂️', 'கோ-கோ', 'Kho-Kho', 'main'),
('🪢', 'வடம் இழுத்தல்', 'Tug of War', 'main'),
('🏃', '100 மீ ஓட்டம்', '100m Race', 'main'),
('🍋', 'எலுமிச்சை கரண்டி', 'Lemon Spoon', 'kids'),
('🎵', 'இசை நாற்காலி', 'Musical Chair', 'fun'),
('🎨', 'ரங்கோலி', 'Rangoli', 'women')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access on games" ON games;
DROP POLICY IF EXISTS "Allow public insert on games" ON games;
DROP POLICY IF EXISTS "Allow public delete on games" ON games;
DROP POLICY IF EXISTS "Allow public read access on scheduled_games" ON scheduled_games;
DROP POLICY IF EXISTS "Allow public insert on scheduled_games" ON scheduled_games;
DROP POLICY IF EXISTS "Allow public update on scheduled_games" ON scheduled_games;
DROP POLICY IF EXISTS "Allow public delete on scheduled_games" ON scheduled_games;
DROP POLICY IF EXISTS "Allow public read access on team_registrations" ON team_registrations;
DROP POLICY IF EXISTS "Allow public insert on team_registrations" ON team_registrations;
DROP POLICY IF EXISTS "Allow public update on team_registrations" ON team_registrations;
DROP POLICY IF EXISTS "Allow public delete on team_registrations" ON team_registrations;
DROP POLICY IF EXISTS "Allow public read access on individual_registrations" ON individual_registrations;
DROP POLICY IF EXISTS "Allow public insert on individual_registrations" ON individual_registrations;
DROP POLICY IF EXISTS "Allow public update on individual_registrations" ON individual_registrations;
DROP POLICY IF EXISTS "Allow public delete on individual_registrations" ON individual_registrations;

-- Create policies for public access
CREATE POLICY "Allow public read access on games" ON games
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on games" ON games
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete on games" ON games
    FOR DELETE USING (true);

CREATE POLICY "Allow public read access on scheduled_games" ON scheduled_games
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on scheduled_games" ON scheduled_games
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on scheduled_games" ON scheduled_games
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on scheduled_games" ON scheduled_games
    FOR DELETE USING (true);

CREATE POLICY "Allow public read access on team_registrations" ON team_registrations
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on team_registrations" ON team_registrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on team_registrations" ON team_registrations
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on team_registrations" ON team_registrations
    FOR DELETE USING (true);

CREATE POLICY "Allow public read access on individual_registrations" ON individual_registrations
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on individual_registrations" ON individual_registrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on individual_registrations" ON individual_registrations
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on individual_registrations" ON individual_registrations
    FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_active_game_states_scheduled_game ON active_game_states(scheduled_game_id);
CREATE INDEX IF NOT EXISTS idx_active_game_states_status ON active_game_states(status);

-- Enable RLS
ALTER TABLE active_game_states ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access on active_game_states" ON active_game_states;
DROP POLICY IF EXISTS "Allow public insert on active_game_states" ON active_game_states;
DROP POLICY IF EXISTS "Allow public update on active_game_states" ON active_game_states;
DROP POLICY IF EXISTS "Allow public delete on active_game_states" ON active_game_states;

-- Create policies for public access
CREATE POLICY "Allow public read access on active_game_states" ON active_game_states
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on active_game_states" ON active_game_states
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on active_game_states" ON active_game_states
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on active_game_states" ON active_game_states
    FOR DELETE USING (true);