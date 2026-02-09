-- memo_review_session
CREATE TABLE memo_review_session (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  completed_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  memo_count INTEGER NOT NULL,
  source TEXT NOT NULL DEFAULT 'review'
);

CREATE INDEX idx_memo_review_session_user ON memo_review_session(user_id, completed_at);

-- memo_review
CREATE TABLE memo_review (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  memo_id INTEGER NOT NULL,
  reviewed_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  source TEXT NOT NULL DEFAULT 'review',
  session_id INTEGER REFERENCES memo_review_session(id)
);

CREATE INDEX idx_memo_review_user ON memo_review(user_id);
CREATE INDEX idx_memo_review_user_time ON memo_review(user_id, reviewed_at);
CREATE INDEX idx_memo_review_user_memo ON memo_review(user_id, memo_id);
