-- =============================================================================
-- Quizlu — PostgreSQL Schema
-- Version: 1.0
-- Description: Full schema for Quizlu IELTS vocabulary app
-- Run: psql -U <user> -d <dbname> -f schema.sql
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- USERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  name          VARCHAR(100),
  avatar_url    TEXT,
  provider      VARCHAR(30) DEFAULT 'google',  -- 'google' | 'email'
  daily_goal    INT DEFAULT 20,
  settings      JSONB DEFAULT '{}',            -- misc settings blob
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- FOLDERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS folders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- DECKS (Study Sets)
-- =============================================================================
CREATE TABLE IF NOT EXISTS decks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  folder_id     UUID REFERENCES folders(id) ON DELETE SET NULL,
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  color         VARCHAR(20) NOT NULL DEFAULT '#4255FF',
  tags          TEXT[] DEFAULT '{}',
  card_count    INT NOT NULL DEFAULT 0,         -- denormalized, updated by trigger
  last_studied  TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- CARDS
-- =============================================================================
CREATE TABLE IF NOT EXISTS cards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id       UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  term          TEXT NOT NULL,
  definition    TEXT NOT NULL,
  starred       BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: keep decks.card_count in sync
CREATE OR REPLACE FUNCTION update_deck_card_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE decks SET card_count = card_count + 1, updated_at = NOW()
    WHERE id = NEW.deck_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE decks SET card_count = GREATEST(0, card_count - 1), updated_at = NOW()
    WHERE id = OLD.deck_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_card_count
AFTER INSERT OR DELETE ON cards
FOR EACH ROW EXECUTE FUNCTION update_deck_card_count();

-- =============================================================================
-- CARD PROGRESS (SM-2 spaced repetition)
-- =============================================================================
CREATE TABLE IF NOT EXISTS card_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id         UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  deck_id         UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  learn_stage     VARCHAR(20) NOT NULL DEFAULT 'unseen',
    -- 'unseen' | 'mcq1' | 'type1' | 'mcq2' | 'type2' | 'mastered'
  ease_factor     DECIMAL(4,2) NOT NULL DEFAULT 2.50,
  interval_days   INT NOT NULL DEFAULT 0,
  repetitions     INT NOT NULL DEFAULT 0,
  correct_streak  INT NOT NULL DEFAULT 0,
  total_answers   INT NOT NULL DEFAULT 0,
  correct_answers INT NOT NULL DEFAULT 0,
  next_review     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_answered   TIMESTAMPTZ,
  CONSTRAINT uq_user_card UNIQUE (user_id, card_id),
  CONSTRAINT chk_learn_stage CHECK (learn_stage IN ('unseen','mcq1','type1','mcq2','type2','mastered'))
);

-- =============================================================================
-- STUDY SESSIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS study_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deck_id       UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  mode          VARCHAR(20) NOT NULL,
    -- 'flashcard' | 'learn' | 'test' | 'match' | 'gravity' | 'review'
  total_cards   INT NOT NULL,
  correct_count INT NOT NULL DEFAULT 0,
  score         INT,                            -- 0-100
  started_at    TIMESTAMPTZ NOT NULL,
  completed_at  TIMESTAMPTZ,
  CONSTRAINT chk_mode CHECK (mode IN ('flashcard','learn','test','match','gravity','review'))
);

-- =============================================================================
-- NOTIFICATIONS (spaced repetition reminders: 1,3,7,21,30 days)
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deck_id         UUID REFERENCES decks(id) ON DELETE CASCADE,
  type            VARCHAR(50) NOT NULL DEFAULT 'review_reminder',
  title           VARCHAR(200),
  body            TEXT,
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  scheduled_for   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- IELTS: STUDY HOURS GOALS
-- =============================================================================
CREATE TABLE IF NOT EXISTS study_hours_goals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill         VARCHAR(50) NOT NULL,
    -- 'Listening' | 'Reading' | 'Writing' | 'Speaking' | 'Vocabulary' | 'Grammar'
  target_hours  INT NOT NULL CHECK (target_hours > 0 AND target_hours <= 1000),
  deadline      TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_skill CHECK (skill IN ('Listening','Reading','Writing','Speaking','Vocabulary','Grammar'))
);

-- =============================================================================
-- IELTS: STUDY HOURS LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS study_hours_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id     UUID NOT NULL REFERENCES study_hours_goals(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill       VARCHAR(50) NOT NULL,
  minutes     INT NOT NULL CHECK (minutes > 0 AND minutes <= 1440),
  content     TEXT NOT NULL,
  study_date  DATE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- IELTS: WRITING SAMPLES
-- =============================================================================
CREATE TABLE IF NOT EXISTS writing_samples (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task        VARCHAR(10) NOT NULL CHECK (task IN ('task1', 'task2')),
  title       VARCHAR(300) NOT NULL,
  topic       TEXT,
  content     TEXT NOT NULL,
  band        DECIMAL(3,1) CHECK (band >= 0 AND band <= 9),
  tags        TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- IELTS: SPEAKING TOPICS
-- =============================================================================
CREATE TABLE IF NOT EXISTS speaking_topics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  part            SMALLINT NOT NULL CHECK (part IN (1, 2, 3)),
  topic           VARCHAR(300) NOT NULL,
  questions       TEXT[] NOT NULL DEFAULT '{}',
  sample_answer   TEXT,
  keywords        TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_decks_user     ON decks(user_id);
CREATE INDEX IF NOT EXISTS idx_decks_folder   ON decks(folder_id);
CREATE INDEX IF NOT EXISTS idx_cards_deck     ON cards(deck_id);
CREATE INDEX IF NOT EXISTS idx_cards_user     ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_prog_user_card ON card_progress(user_id, card_id);
CREATE INDEX IF NOT EXISTS idx_prog_review    ON card_progress(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_sess_user      ON study_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_user     ON notifications(user_id, scheduled_for, is_read);
CREATE INDEX IF NOT EXISTS idx_hrs_goal       ON study_hours_logs(goal_id);
CREATE INDEX IF NOT EXISTS idx_writing_user   ON writing_samples(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_speaking_user  ON speaking_topics(user_id, updated_at DESC);

-- =============================================================================
-- UPDATED_AT auto-update function
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated     BEFORE UPDATE ON users          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_folders_updated   BEFORE UPDATE ON folders        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_decks_updated     BEFORE UPDATE ON decks          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_writing_updated   BEFORE UPDATE ON writing_samples FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_speaking_updated  BEFORE UPDATE ON speaking_topics FOR EACH ROW EXECUTE FUNCTION set_updated_at();
