CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  agent_slug TEXT NOT NULL,
  owner_address TEXT,
  token_id TEXT,
  state TEXT NOT NULL CHECK (state IN ('draft','test_requested','test_completed','hire_pending','hired','running','succeeded','failed','timed_out','cancelled','payment_pending','payment_failed')),
  payment_state TEXT NOT NULL CHECK (payment_state IN ('not_required','pending','held','released','failed','refunded')) DEFAULT 'not_required',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS capability_hash TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS capability_expires_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS jobs_capability_expires_at_idx ON jobs(capability_expires_at);
CREATE TABLE IF NOT EXISTS job_events (
  id BIGSERIAL PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS job_events_job_id_created_at_idx ON job_events(job_id, created_at);

CREATE TABLE IF NOT EXISTS agent_reviews (
  id BIGSERIAL PRIMARY KEY,
  agent_slug TEXT NOT NULL,
  job_id TEXT REFERENCES jobs(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL CHECK (char_length(review_text) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS agent_reviews_agent_slug_created_at_idx ON agent_reviews(agent_slug, created_at DESC);

CREATE TABLE IF NOT EXISTS payment_settlements (
  tx_hash TEXT PRIMARY KEY CHECK (tx_hash = lower(tx_hash)),
  network TEXT NOT NULL,
  job_id TEXT NOT NULL UNIQUE REFERENCES jobs(id) ON DELETE RESTRICT,
  evidence JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS payment_settlements_network_idx ON payment_settlements(network);

CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  key TEXT PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL CHECK (count >= 0)
);
