-- memo_review_session_cache
CREATE TABLE memo_review_session_cache (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  completed_at BIGINT,
  memo_ids TEXT NOT NULL DEFAULT '[]',
  total_count INTEGER NOT NULL DEFAULT 0
);
