-- Claude Flow: The Ascension - Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create custom types
CREATE TYPE game_status AS ENUM ('active', 'paused', 'completed', 'abandoned');
CREATE TYPE battle_type AS ENUM ('ranked', 'casual', 'tournament', 'training', 'custom');
CREATE TYPE battle_mode AS ENUM ('solo', 'team', 'ffa', 'elimination', 'survival');
CREATE TYPE difficulty AS ENUM ('beginner', 'intermediate', 'advanced', 'expert', 'master');
CREATE TYPE rank_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster');
CREATE TYPE pattern_type AS ENUM ('coordination', 'optimization', 'adaptation', 'learning', 'emergence');
CREATE TYPE swarm_topology AS ENUM ('mesh', 'hierarchical', 'ring', 'star');
CREATE TYPE agent_type AS ENUM ('researcher', 'coder', 'analyst', 'optimizer', 'coordinator');

-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    banner_url TEXT,
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT users_username_check CHECK (LENGTH(username) >= 3),
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_username ON users USING btree(username);
CREATE INDEX idx_users_email ON users USING btree(email);
CREATE INDEX idx_users_last_active ON users USING btree(last_active);

-- Player Profiles and Stats
CREATE TABLE player_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_rank rank_tier DEFAULT 'bronze',
    rank_points INTEGER DEFAULT 0,
    total_games_played INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_losses INTEGER DEFAULT 0,
    best_score BIGINT DEFAULT 0,
    total_play_time INTEGER DEFAULT 0, -- in seconds
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    current_season VARCHAR(20) DEFAULT '2024_S1',
    preferences JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_player_profiles_rank ON player_profiles USING btree(current_rank, rank_points DESC);
CREATE INDEX idx_player_profiles_win_rate ON player_profiles USING btree(win_rate DESC);

-- Game Levels Configuration
CREATE TABLE game_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level_number INTEGER UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty difficulty NOT NULL,
    required_score INTEGER DEFAULT 0,
    time_limit INTEGER, -- in seconds
    max_agents INTEGER DEFAULT 5,
    default_topology swarm_topology DEFAULT 'mesh',
    objectives JSONB NOT NULL DEFAULT '[]',
    rewards JSONB DEFAULT '{}',
    unlock_conditions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_game_levels_number ON game_levels USING btree(level_number);
CREATE INDEX idx_game_levels_difficulty ON game_levels USING btree(difficulty);

-- Game Sessions
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level_id UUID NOT NULL REFERENCES game_levels(id),
    status game_status DEFAULT 'active',
    score BIGINT DEFAULT 0,
    lives INTEGER DEFAULT 3,
    moves_count INTEGER DEFAULT 0,
    efficiency_rating DECIMAL(5,2) DEFAULT 0.00,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- in seconds
    
    -- Swarm Information
    swarm_id VARCHAR(100),
    swarm_config JSONB DEFAULT '{}',
    swarm_performance JSONB DEFAULT '{}',
    
    -- Neural Patterns
    applied_patterns TEXT[] DEFAULT '{}',
    evolved_patterns TEXT[] DEFAULT '{}',
    
    -- Additional Data
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_games_player_id ON games USING btree(player_id);
CREATE INDEX idx_games_status ON games USING btree(status);
CREATE INDEX idx_games_level_id ON games USING btree(level_id);
CREATE INDEX idx_games_score ON games USING btree(score DESC);
CREATE INDEX idx_games_started_at ON games USING btree(started_at DESC);
CREATE INDEX idx_games_swarm_id ON games USING btree(swarm_id) WHERE swarm_id IS NOT NULL;

-- Game Events and Actions
CREATE TABLE game_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE,
    
    -- Partitioning helper
    created_date DATE DEFAULT CURRENT_DATE
) PARTITION BY RANGE (created_date);

-- Create partitions for game events (monthly)
CREATE TABLE game_events_2024_01 PARTITION OF game_events
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE game_events_2024_02 PARTITION OF game_events
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- Continue creating partitions as needed...

CREATE INDEX idx_game_events_game_id ON game_events USING btree(game_id, timestamp DESC);
CREATE INDEX idx_game_events_type ON game_events USING btree(event_type);
CREATE INDEX idx_game_events_processed ON game_events USING btree(processed) WHERE NOT processed;

-- Multiplayer Battles
CREATE TABLE battles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    battle_type battle_type NOT NULL,
    battle_mode battle_mode NOT NULL,
    level_id UUID NOT NULL REFERENCES game_levels(id),
    max_players INTEGER NOT NULL DEFAULT 2,
    current_players INTEGER DEFAULT 0,
    entry_fee INTEGER DEFAULT 0,
    prize_pool INTEGER DEFAULT 0,
    
    -- Battle State
    status VARCHAR(20) DEFAULT 'waiting', -- waiting, starting, active, paused, finished
    current_turn UUID REFERENCES users(id),
    turn_time_limit INTEGER DEFAULT 60, -- seconds
    
    -- Configuration
    time_limit INTEGER DEFAULT 600, -- 10 minutes
    ruleset JSONB DEFAULT '{}',
    allow_spectators BOOLEAN DEFAULT TRUE,
    
    -- Results
    winner_id UUID REFERENCES users(id),
    results JSONB DEFAULT '{}',
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_battles_status ON battles USING btree(status);
CREATE INDEX idx_battles_type_mode ON battles USING btree(battle_type, battle_mode);
CREATE INDEX idx_battles_created_at ON battles USING btree(created_at DESC);

-- Battle Participants
CREATE TABLE battle_participants (
    battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team VARCHAR(20),
    join_order INTEGER NOT NULL,
    current_score BIGINT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'joined', -- joined, ready, playing, disconnected, finished
    swarm_config JSONB DEFAULT '{}',
    performance_data JSONB DEFAULT '{}',
    
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (battle_id, player_id)
);

CREATE INDEX idx_battle_participants_player_id ON battle_participants USING btree(player_id);

-- Neural Patterns Storage
CREATE TABLE neural_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    pattern_type pattern_type NOT NULL,
    version VARCHAR(20) DEFAULT '1.0.0',
    
    -- Creator and Ownership
    creator_id UUID REFERENCES users(id),
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Pattern Data
    embedding vector(768), -- 768-dimensional vector for similarity search
    model_data BYTEA, -- Compressed neural network weights
    metadata JSONB NOT NULL DEFAULT '{}',
    
    -- Performance Metrics
    accuracy DECIMAL(5,4) DEFAULT 0.0000,
    efficiency DECIMAL(5,4) DEFAULT 0.0000,
    adaptability DECIMAL(5,4) DEFAULT 0.0000,
    stability DECIMAL(5,4) DEFAULT 0.0000,
    success_rate DECIMAL(5,4) DEFAULT 0.0000,
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    
    -- Evolution Data
    generation INTEGER DEFAULT 1,
    parent_patterns UUID[] DEFAULT '{}',
    fitness_score DECIMAL(8,4) DEFAULT 0.0000,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_neural_patterns_type ON neural_patterns USING btree(pattern_type);
CREATE INDEX idx_neural_patterns_creator ON neural_patterns USING btree(creator_id);
CREATE INDEX idx_neural_patterns_public ON neural_patterns USING btree(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_neural_patterns_rating ON neural_patterns USING btree(rating DESC);
CREATE INDEX idx_neural_patterns_usage ON neural_patterns USING btree(usage_count DESC);

-- Vector similarity index for pattern matching
CREATE INDEX idx_neural_patterns_embedding ON neural_patterns USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Pattern Evolution History
CREATE TABLE pattern_evolution_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_id UUID NOT NULL REFERENCES neural_patterns(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES neural_patterns(id),
    mutation_type VARCHAR(50) NOT NULL,
    mutation_parameters JSONB DEFAULT '{}',
    fitness_improvement DECIMAL(8,4) DEFAULT 0.0000,
    success BOOLEAN NOT NULL,
    context JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pattern_evolution_pattern_id ON pattern_evolution_history USING btree(pattern_id, created_at DESC);
CREATE INDEX idx_pattern_evolution_success ON pattern_evolution_history USING btree(success);

-- Achievements System
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    rarity VARCHAR(20) DEFAULT 'common', -- common, rare, epic, legendary
    icon_url TEXT,
    requirements JSONB NOT NULL,
    rewards JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_achievements_category ON achievements USING btree(category);
CREATE INDEX idx_achievements_rarity ON achievements USING btree(rarity);

-- Player Achievements
CREATE TABLE player_achievements (
    player_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    progress JSONB DEFAULT '{}',
    
    PRIMARY KEY (player_id, achievement_id)
);

CREATE INDEX idx_player_achievements_unlocked ON player_achievements USING btree(unlocked_at DESC);

-- Leaderboards
CREATE TABLE leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- global, level, weekly, monthly
    level_id UUID REFERENCES game_levels(id),
    season VARCHAR(20),
    
    -- Configuration
    metric VARCHAR(50) NOT NULL, -- score, win_rate, efficiency, etc.
    calculation_method VARCHAR(20) DEFAULT 'max', -- max, avg, sum, last
    min_games INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_leaderboards_unique_config ON leaderboards (name, type, COALESCE(level_id::text, ''), COALESCE(season, ''));

-- Leaderboard Entries
CREATE TABLE leaderboard_entries (
    leaderboard_id UUID NOT NULL REFERENCES leaderboards(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    games_played INTEGER DEFAULT 0,
    last_game_at TIMESTAMP WITH TIME ZONE,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (leaderboard_id, player_id)
);

CREATE INDEX idx_leaderboard_entries_rank ON leaderboard_entries USING btree(leaderboard_id, rank);
CREATE INDEX idx_leaderboard_entries_value ON leaderboard_entries USING btree(leaderboard_id, value DESC);

-- Game Replays
CREATE TABLE game_replays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    replay_data BYTEA NOT NULL, -- Compressed replay data
    metadata JSONB DEFAULT '{}',
    file_size INTEGER NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days')
);

CREATE INDEX idx_game_replays_game_id ON game_replays USING btree(game_id);
CREATE INDEX idx_game_replays_public ON game_replays USING btree(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_game_replays_expires ON game_replays USING btree(expires_at) WHERE expires_at IS NOT NULL;

-- System Configuration
CREATE TABLE system_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_config_category ON system_config USING btree(category);

-- Audit Log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_date DATE DEFAULT CURRENT_DATE
) PARTITION BY RANGE (created_date);

-- Create audit log partitions
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE audit_logs_2024_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

CREATE INDEX idx_audit_logs_user_action ON audit_logs USING btree(user_id, action, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs USING btree(resource_type, resource_id);

-- Functions and Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_player_profiles_updated_at BEFORE UPDATE ON player_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_neural_patterns_updated_at BEFORE UPDATE ON neural_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate win rate
CREATE OR REPLACE FUNCTION calculate_win_rate(total_wins INTEGER, total_games INTEGER)
RETURNS DECIMAL(5,2) AS $$
BEGIN
    IF total_games = 0 THEN
        RETURN 0.00;
    END IF;
    RETURN ROUND((total_wins::DECIMAL / total_games::DECIMAL) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update player stats
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE player_profiles 
        SET 
            total_games_played = total_games_played + 1,
            total_wins = CASE 
                WHEN NEW.score >= (SELECT required_score FROM game_levels WHERE id = NEW.level_id)
                THEN total_wins + 1 
                ELSE total_wins 
            END,
            total_losses = CASE 
                WHEN NEW.score < (SELECT required_score FROM game_levels WHERE id = NEW.level_id)
                THEN total_losses + 1 
                ELSE total_losses 
            END,
            best_score = GREATEST(best_score, NEW.score),
            total_play_time = total_play_time + COALESCE(NEW.duration, 0)
        WHERE user_id = NEW.player_id;
        
        -- Update win rate
        UPDATE player_profiles 
        SET win_rate = calculate_win_rate(total_wins, total_games_played)
        WHERE user_id = NEW.player_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_player_stats AFTER UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_player_stats();

-- Views for common queries
CREATE VIEW player_rankings AS
SELECT 
    u.id,
    u.username,
    u.display_name,
    pp.current_rank,
    pp.rank_points,
    pp.total_games_played,
    pp.win_rate,
    pp.best_score,
    ROW_NUMBER() OVER (ORDER BY pp.rank_points DESC, pp.win_rate DESC) as global_rank
FROM users u
JOIN player_profiles pp ON u.id = pp.user_id
WHERE NOT u.is_banned
ORDER BY pp.rank_points DESC, pp.win_rate DESC;

CREATE VIEW level_leaderboards AS
SELECT 
    gl.id as level_id,
    gl.name as level_name,
    u.id as player_id,
    u.username,
    u.display_name,
    g.score,
    g.efficiency_rating,
    g.completed_at,
    ROW_NUMBER() OVER (PARTITION BY gl.id ORDER BY g.score DESC, g.completed_at ASC) as rank
FROM game_levels gl
JOIN games g ON gl.id = g.level_id
JOIN users u ON g.player_id = u.id
WHERE g.status = 'completed'
  AND NOT u.is_banned;

-- Initial data
INSERT INTO system_config (key, value, description, category) VALUES
('game.max_swarm_agents', '20', 'Maximum number of agents allowed in a swarm', 'limits'),
('game.default_time_limit', '600', 'Default game time limit in seconds', 'gameplay'),
('neural.evolution_threshold', '0.85', 'Threshold for triggering pattern evolution', 'ai'),
('multiplayer.max_battle_participants', '8', 'Maximum participants in a multiplayer battle', 'multiplayer'),
('leaderboard.update_frequency', '300', 'Leaderboard update frequency in seconds', 'performance');

-- Sample achievements
INSERT INTO achievements (name, description, category, rarity, requirements, rewards) VALUES
('First Steps', 'Complete your first game', 'progression', 'common', '{"games_completed": 1}', '{"experience": 100}'),
('Swarm Master', 'Successfully coordinate a 10+ agent swarm', 'swarm', 'rare', '{"max_agents_used": 10}', '{"title": "Swarm Master", "experience": 500}'),
('Neural Evolution', 'Evolve your first neural pattern', 'neural', 'epic', '{"patterns_evolved": 1}', '{"pattern_slots": 1, "experience": 1000}'),
('Perfect Coordination', 'Achieve 100% swarm coordination efficiency', 'performance', 'legendary', '{"coordination_efficiency": 1.0}', '{"exclusive_pattern": true, "experience": 2500}');

COMMIT;