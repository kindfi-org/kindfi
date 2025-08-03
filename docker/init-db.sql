-- Initialize database for KindFi Mock Blockchain Services
-- This script sets up optional persistent storage for mock data

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS kindfi_mock;
USE kindfi_mock;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    address VARCHAR(56) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registered_by VARCHAR(56),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chapters configuration
CREATE TABLE IF NOT EXISTS chapters (
    id INTEGER PRIMARY KEY,
    total_lessons INTEGER NOT NULL,
    lesson_names JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_address VARCHAR(56) NOT NULL,
    chapter_id INTEGER NOT NULL,
    lesson_id INTEGER NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_address, chapter_id, lesson_id),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

-- Badges
CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    user_address VARCHAR(56) NOT NULL,
    badge_type VARCHAR(50) NOT NULL,
    reference_id INTEGER NOT NULL,
    metadata TEXT,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_address, badge_type, reference_id)
);

-- Graduation NFTs
CREATE TABLE IF NOT EXISTS graduation_nfts (
    id SERIAL PRIMARY KEY,
    owner_address VARCHAR(56) UNIQUE NOT NULL,
    metadata JSONB NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events log (optional for debugging)
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_address VARCHAR(56),
    data JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_address ON users(address);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress(user_address);
CREATE INDEX IF NOT EXISTS idx_progress_chapter ON user_progress(chapter_id);
CREATE INDEX IF NOT EXISTS idx_badges_user ON badges(user_address);
CREATE INDEX IF NOT EXISTS idx_badges_type ON badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_address);

-- Insert default chapter configurations
INSERT INTO chapters (id, total_lessons, lesson_names) VALUES
(1, 5, '["Blockchain Fundamentals - Lesson 1", "Blockchain Fundamentals - Lesson 2", "Blockchain Fundamentals - Lesson 3", "Blockchain Fundamentals - Lesson 4", "Blockchain Fundamentals - Lesson 5"]'),
(2, 7, '["Smart Contracts - Lesson 1", "Smart Contracts - Lesson 2", "Smart Contracts - Lesson 3", "Smart Contracts - Lesson 4", "Smart Contracts - Lesson 5", "Smart Contracts - Lesson 6", "Smart Contracts - Lesson 7"]'),
(3, 9, '["DeFi Protocols - Lesson 1", "DeFi Protocols - Lesson 2", "DeFi Protocols - Lesson 3", "DeFi Protocols - Lesson 4", "DeFi Protocols - Lesson 5", "DeFi Protocols - Lesson 6", "DeFi Protocols - Lesson 7", "DeFi Protocols - Lesson 8", "DeFi Protocols - Lesson 9"]'),
(4, 11, '["NFTs and Digital Assets - Lesson 1", "NFTs and Digital Assets - Lesson 2", "NFTs and Digital Assets - Lesson 3", "NFTs and Digital Assets - Lesson 4", "NFTs and Digital Assets - Lesson 5", "NFTs and Digital Assets - Lesson 6", "NFTs and Digital Assets - Lesson 7", "NFTs and Digital Assets - Lesson 8", "NFTs and Digital Assets - Lesson 9", "NFTs and Digital Assets - Lesson 10", "NFTs and Digital Assets - Lesson 11"]'),
(5, 6, '["Web3 Development - Lesson 1", "Web3 Development - Lesson 2", "Web3 Development - Lesson 3", "Web3 Development - Lesson 4", "Web3 Development - Lesson 5", "Web3 Development - Lesson 6"]')
ON CONFLICT (id) DO NOTHING;

-- Insert default admin users
INSERT INTO users (address, registered_by, metadata) VALUES
('GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM', 'SYSTEM', '{"role": "admin", "source": "default"}'),
('GADMIN2ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM', 'SYSTEM', '{"role": "admin", "source": "default"}')
ON CONFLICT (address) DO NOTHING;

-- Insert some test users
INSERT INTO users (address, registered_by, metadata) VALUES
('GABC0000ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM', 'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM', '{"role": "student", "source": "test_data"}'),
('GABC0001ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM', 'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM', '{"role": "student", "source": "test_data"}'),
('GABC0002ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM', 'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM', '{"role": "student", "source": "test_data"}'),
('GABC0003ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM', 'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM', '{"role": "student", "source": "test_data"}'),
('GABC0004ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM', 'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM', '{"role": "student", "source": "test_data"}')
ON CONFLICT (address) DO NOTHING;

-- Create views for easier querying
CREATE OR REPLACE VIEW user_progress_summary AS
SELECT 
    up.user_address,
    up.chapter_id,
    COUNT(up.lesson_id) as completed_lessons,
    c.total_lessons,
    ROUND((COUNT(up.lesson_id)::DECIMAL / c.total_lessons) * 100, 2) as completion_percentage
FROM user_progress up
JOIN chapters c ON up.chapter_id = c.id
GROUP BY up.user_address, up.chapter_id, c.total_lessons;

CREATE OR REPLACE VIEW user_badge_summary AS
SELECT 
    user_address,
    badge_type,
    COUNT(*) as badge_count,
    MIN(issued_at) as first_badge,
    MAX(issued_at) as latest_badge
FROM badges
GROUP BY user_address, badge_type;

CREATE OR REPLACE VIEW user_overall_stats AS
SELECT 
    u.address as user_address,
    u.is_active,
    u.registered_at,
    COALESCE(ps.total_chapters, 0) as total_chapters_started,
    COALESCE(ps.completed_chapters, 0) as completed_chapters,
    COALESCE(ps.total_lessons_completed, 0) as total_lessons_completed,
    COALESCE(bs.total_badges, 0) as total_badges,
    CASE WHEN gn.owner_address IS NOT NULL THEN true ELSE false END as has_graduation_nft
FROM users u
LEFT JOIN (
    SELECT 
        user_address,
        COUNT(DISTINCT chapter_id) as total_chapters,
        COUNT(CASE WHEN completed_lessons = total_lessons THEN 1 END) as completed_chapters,
        SUM(completed_lessons) as total_lessons_completed
    FROM user_progress_summary
    GROUP BY user_address
) ps ON u.address = ps.user_address
LEFT JOIN (
    SELECT 
        user_address,
        COUNT(*) as total_badges
    FROM badges
    GROUP BY user_address
) bs ON u.address = bs.user_address
LEFT JOIN graduation_nfts gn ON u.address = gn.owner_address
WHERE u.is_active = true;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON kindfi_mock.* TO 'kindfi'@'%';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON kindfi_mock.* TO 'app_user'@'%';

-- Log initialization
INSERT INTO events (event_type, data) VALUES 
('database_initialized', '{"timestamp": "' || CURRENT_TIMESTAMP || '", "version": "1.0.0"}');
