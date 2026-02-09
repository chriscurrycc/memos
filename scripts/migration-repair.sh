#!/usr/bin/env bash
#
# migration-repair.sh - Create all fork-specific tables idempotently.
# Safe to run multiple times. Supports SQLite, MySQL, and PostgreSQL.
#
# Usage:
#   bash scripts/migration-repair.sh [--driver sqlite|mysql|postgres] [--dsn DSN]
#
# Examples:
#   # SQLite (default)
#   bash scripts/migration-repair.sh
#   bash scripts/migration-repair.sh --driver sqlite --dsn /path/to/memos_prod.db
#
#   # MySQL
#   bash scripts/migration-repair.sh --driver mysql --dsn "user:password@tcp(host:3306)/memos"
#
#   # PostgreSQL
#   bash scripts/migration-repair.sh --driver postgres --dsn "postgresql://user:password@host:5432/memos"

set -euo pipefail

DRIVER="sqlite"
DSN=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --driver) DRIVER="$2"; shift 2 ;;
    --dsn)    DSN="$2";    shift 2 ;;
    -h|--help)
      echo "Usage: bash scripts/migration-repair.sh [--driver sqlite|mysql|postgres] [--dsn DSN]"
      echo ""
      echo "Options:"
      echo "  --driver  Database driver: sqlite (default), mysql, postgres"
      echo "  --dsn     Database connection string"
      echo "            SQLite default: /var/opt/memos/memos_prod.db"
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# ---------------------------------------------------------------------------
# SQLite
# ---------------------------------------------------------------------------
run_sqlite() {
  local db="${DSN:-/var/opt/memos/memos_prod.db}"

  if ! command -v sqlite3 &>/dev/null; then
    echo "Error: sqlite3 is not installed."
    echo "  Alpine:  apk add --no-cache sqlite"
    echo "  Debian:  apt-get install -y sqlite3"
    echo "  macOS:   (pre-installed)"
    exit 1
  fi

  echo "Using SQLite database: $db"

  sqlite3 "$db" <<'SQL'
-- tag (v0.24)
CREATE TABLE IF NOT EXISTS tag (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  creator_id INTEGER NOT NULL,
  tag_hash TEXT NOT NULL,
  tag_name TEXT NOT NULL DEFAULT '',
  emoji TEXT NOT NULL DEFAULT '',
  pinned_ts BIGINT,
  UNIQUE(creator_id, tag_hash)
);
CREATE INDEX IF NOT EXISTS idx_tag_creator_id ON tag(creator_id);
CREATE INDEX IF NOT EXISTS idx_tag_pinned_ts ON tag(pinned_ts);

-- memo_review_session (v0.25)
CREATE TABLE IF NOT EXISTS memo_review_session (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  completed_at BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  memo_count INTEGER NOT NULL,
  source TEXT NOT NULL DEFAULT 'review'
);
CREATE INDEX IF NOT EXISTS idx_memo_review_session_user ON memo_review_session(user_id, completed_at);

-- memo_review (v0.25)
CREATE TABLE IF NOT EXISTS memo_review (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  memo_id INTEGER NOT NULL,
  reviewed_at BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  source TEXT NOT NULL DEFAULT 'review',
  session_id INTEGER REFERENCES memo_review_session(id)
);
CREATE INDEX IF NOT EXISTS idx_memo_review_user ON memo_review(user_id);
CREATE INDEX IF NOT EXISTS idx_memo_review_user_time ON memo_review(user_id, reviewed_at);
CREATE INDEX IF NOT EXISTS idx_memo_review_user_memo ON memo_review(user_id, memo_id);
SQL

  echo "SQLite migration repair complete."
}

# ---------------------------------------------------------------------------
# MySQL
# ---------------------------------------------------------------------------
run_mysql() {
  local dsn="${DSN:?MySQL --dsn is required (e.g. \"user:password@tcp(host:3306)/memos\")}"

  if ! command -v mysql &>/dev/null; then
    echo "Error: mysql client is not installed."
    exit 1
  fi

  # Parse DSN: user:password@tcp(host:port)/dbname
  local user pass host port dbname
  user="$(echo "$dsn" | sed -E 's/^([^:]+):.*$/\1/')"
  pass="$(echo "$dsn" | sed -E 's/^[^:]+:([^@]+)@.*$/\1/')"
  host="$(echo "$dsn" | sed -E 's/.*@tcp\(([^:)]+).*/\1/')"
  port="$(echo "$dsn" | sed -E 's/.*@tcp\([^:]+:([0-9]+)\).*/\1/')"
  dbname="$(echo "$dsn" | sed -E 's/.*\)\/(.*)/\1/')"

  echo "Using MySQL database: $dbname on $host:$port"

  mysql -h "$host" -P "$port" -u "$user" -p"$pass" "$dbname" <<'SQL'
-- tag (v0.24)
CREATE TABLE IF NOT EXISTS `tag` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `created_ts` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_ts` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `creator_id` INT NOT NULL,
  `tag_hash` VARCHAR(255) NOT NULL,
  `tag_name` VARCHAR(255) NOT NULL DEFAULT '',
  `emoji` VARCHAR(255) NOT NULL DEFAULT '',
  `pinned_ts` TIMESTAMP NULL,
  UNIQUE(`creator_id`,`tag_hash`)
);

-- memo_review_session (v0.25)
CREATE TABLE IF NOT EXISTS `memo_review_session` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `completed_at` BIGINT NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  `memo_count` INT NOT NULL,
  `source` VARCHAR(256) NOT NULL DEFAULT 'review'
);

-- memo_review (v0.25)
CREATE TABLE IF NOT EXISTS `memo_review` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `memo_id` INT NOT NULL,
  `reviewed_at` BIGINT NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  `source` VARCHAR(256) NOT NULL DEFAULT 'review',
  `session_id` INT,
  FOREIGN KEY (`session_id`) REFERENCES `memo_review_session`(`id`)
);
SQL

  # MySQL CREATE TABLE IF NOT EXISTS doesn't error on existing indexes via CREATE INDEX,
  # so we use a procedure or just ignore errors for indexes.
  mysql -h "$host" -P "$port" -u "$user" -p"$pass" "$dbname" -e "
    CREATE INDEX idx_memo_review_session_user ON \`memo_review_session\`(\`user_id\`, \`completed_at\`);
    CREATE INDEX idx_memo_review_user ON \`memo_review\`(\`user_id\`);
    CREATE INDEX idx_memo_review_user_time ON \`memo_review\`(\`user_id\`, \`reviewed_at\`);
    CREATE INDEX idx_memo_review_user_memo ON \`memo_review\`(\`user_id\`, \`memo_id\`);
  " 2>/dev/null || true

  echo "MySQL migration repair complete."
}

# ---------------------------------------------------------------------------
# PostgreSQL
# ---------------------------------------------------------------------------
run_postgres() {
  local dsn="${DSN:?PostgreSQL --dsn is required (e.g. \"postgresql://user:password@host:5432/memos\")}"

  if ! command -v psql &>/dev/null; then
    echo "Error: psql client is not installed."
    exit 1
  fi

  echo "Using PostgreSQL database: $dsn"

  psql "$dsn" <<'SQL'
-- tag (v0.24)
CREATE TABLE IF NOT EXISTS tag (
  id SERIAL PRIMARY KEY,
  created_ts BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  updated_ts BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  creator_id INTEGER NOT NULL,
  tag_hash TEXT NOT NULL,
  tag_name TEXT NOT NULL DEFAULT '',
  emoji TEXT NOT NULL DEFAULT '',
  pinned_ts BIGINT,
  UNIQUE(creator_id, tag_hash)
);

-- memo_review_session (v0.25)
CREATE TABLE IF NOT EXISTS memo_review_session (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  completed_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  memo_count INTEGER NOT NULL,
  source TEXT NOT NULL DEFAULT 'review'
);
CREATE INDEX IF NOT EXISTS idx_memo_review_session_user ON memo_review_session(user_id, completed_at);

-- memo_review (v0.25)
CREATE TABLE IF NOT EXISTS memo_review (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  memo_id INTEGER NOT NULL,
  reviewed_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  source TEXT NOT NULL DEFAULT 'review',
  session_id INTEGER REFERENCES memo_review_session(id)
);
CREATE INDEX IF NOT EXISTS idx_memo_review_user ON memo_review(user_id);
CREATE INDEX IF NOT EXISTS idx_memo_review_user_time ON memo_review(user_id, reviewed_at);
CREATE INDEX IF NOT EXISTS idx_memo_review_user_memo ON memo_review(user_id, memo_id);
SQL

  echo "PostgreSQL migration repair complete."
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
case "$DRIVER" in
  sqlite)   run_sqlite   ;;
  mysql)    run_mysql     ;;
  postgres) run_postgres  ;;
  *)
    echo "Unsupported driver: $DRIVER"
    echo "Supported: sqlite, mysql, postgres"
    exit 1
    ;;
esac
