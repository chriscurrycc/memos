#!/usr/bin/env bash
#
# migration-repair.sh - Repair database schema for migration from upstream usememos/memos.
# Handles upstream v0.24.0 ~ v0.26.2. Safe to run multiple times (idempotent).
# Supports SQLite, MySQL, and PostgreSQL.
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
#
# ---------------------------------------------------------------------------
# Design & How to Extend
# ---------------------------------------------------------------------------
#
# This script has three phases, applied in order:
#
#   Phase 0 — Ensure migration_history table exists
#     The fork's migrator requires this table to recognize an existing database.
#     Without it, the migrator treats the DB as a fresh install and crashes.
#     Schema version is read from store/migration/SCHEMA_VERSION (shared with
#     the Go migrator). Update that file when adding new fork migration versions.
#
#   Phase 1 — Reverse upstream breaking changes
#     Undoes schema changes that upstream usememos/memos made but this fork
#     did not adopt. Organized by upstream version (newest first, because
#     later versions depend on earlier ones being reversed first — e.g. the
#     attachment→resource rename must happen before resource index creation).
#
#     To add support for a new upstream version:
#       1. Compare the upstream migration files (store/migration/*/prod/X.YZ/)
#          with this fork's LATEST.sql to identify breaking changes.
#       2. Add a new "Upstream vX.YZ" subsection at the TOP of Phase 1
#          (before existing subsections) in each driver function.
#       3. Reference the specific upstream migration file in comments.
#       4. Guard every operation with existence checks for idempotency.
#       5. Update README compatibility range.
#
#   Phase 2 — Create fork-specific tables
#     Creates tables and indexes that this fork added and upstream never had.
#     Organized by fork migration version. Uses CREATE TABLE IF NOT EXISTS
#     so it's always safe to run.
#
#     To add a new fork-specific table:
#       1. Add the CREATE TABLE IF NOT EXISTS statement in each driver.
#       2. Match the schema exactly from the fork's LATEST.sql for each driver.
#       3. Add any driver-specific indexes (check each LATEST.sql — they differ).
#
# Table/index definitions MUST match the fork's LATEST.sql for each driver.
# SQLite:    store/migration/sqlite/prod/LATEST.sql
# MySQL:     store/migration/mysql/prod/LATEST.sql
# PostgreSQL: store/migration/postgres/prod/LATEST.sql
#

set -euo pipefail

# Schema version is read from store/migration/SCHEMA_VERSION (single source of
# truth shared with the Go migrator). When this script is piped from curl, the
# local file is not available, so it falls back to fetching from GitHub.
_get_schema_version() {
  local dir="${BASH_SOURCE[0]%/*}"
  local f="$dir/../store/migration/SCHEMA_VERSION"
  if [ -f "$f" ]; then
    tr -d '[:space:]' < "$f"
  else
    curl -sfL https://raw.githubusercontent.com/chriscurrycc/memos/main/store/migration/SCHEMA_VERSION
  fi
}
SCHEMA_VERSION=$(_get_schema_version)
if [ -z "$SCHEMA_VERSION" ]; then
  echo "Error: failed to determine schema version."
  exit 1
fi

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

  # =========================================================================
  # Phase 0: Ensure migration_history table exists
  # =========================================================================
  # The fork's migrator requires this table to recognize an existing database.
  # Without it, the migrator treats the database as a fresh install and tries
  # to apply LATEST.sql, which fails because tables already exist.
  echo "Checking migration_history table..."

  sqlite3 "$db" "CREATE TABLE IF NOT EXISTS migration_history (
    version TEXT NOT NULL PRIMARY KEY,
    created_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now'))
  );"

  local has_version
  has_version=$(sqlite3 "$db" "SELECT COUNT(*) FROM migration_history WHERE version='${SCHEMA_VERSION}';")
  if [ "$has_version" = "0" ]; then
    echo "  Inserting schema version ${SCHEMA_VERSION} into migration_history..."
    sqlite3 "$db" "INSERT OR IGNORE INTO migration_history (version) VALUES ('${SCHEMA_VERSION}');"
  fi

  # =========================================================================
  # Phase 1: Reverse upstream breaking changes
  # =========================================================================

  # --- Upstream v0.26 ---------------------------------------------------
  echo "Checking for upstream v0.26 schema changes..."

  # [upstream 0.26/00__rename_resource_to_attachment.sql]
  # Upstream renamed resource -> attachment. This fork still uses resource.
  local has_attachment
  has_attachment=$(sqlite3 "$db" "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='attachment';")
  local has_resource
  has_resource=$(sqlite3 "$db" "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='resource';")
  if [ "$has_attachment" = "1" ] && [ "$has_resource" = "0" ]; then
    echo "  Renaming attachment table back to resource..."
    sqlite3 "$db" "ALTER TABLE attachment RENAME TO resource;"
  fi

  # [upstream 0.26/00,02] Upstream dropped resource indexes during rename.
  # Recreate them to match this fork's LATEST.sql.
  sqlite3 "$db" "CREATE INDEX IF NOT EXISTS idx_resource_creator_id ON resource(creator_id);"
  sqlite3 "$db" "CREATE INDEX IF NOT EXISTS idx_resource_memo_id ON resource(memo_id);"

  # [upstream 0.26/01__drop_memo_organizer.sql]
  # Upstream dropped memo_organizer. This fork still uses it for pinning.
  local had_organizer
  had_organizer=$(sqlite3 "$db" "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='memo_organizer';")
  sqlite3 "$db" <<'SQL'
CREATE TABLE IF NOT EXISTS memo_organizer (
  memo_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  pinned INTEGER NOT NULL CHECK (pinned IN (0, 1)) DEFAULT 0,
  UNIQUE(memo_id, user_id)
);
SQL

  # [upstream 0.24/01__memo_pinned.sql + 0.26/01__drop_memo_organizer.sql]
  # Upstream v0.24 migrated pinned state from memo_organizer into memo.pinned column,
  # then v0.26 dropped memo_organizer. Recover pinned data back into memo_organizer.
  if [ "$had_organizer" = "0" ]; then
    local has_pinned
    has_pinned=$(sqlite3 "$db" "SELECT COUNT(*) FROM pragma_table_info('memo') WHERE name='pinned';")
    if [ "$has_pinned" = "1" ]; then
      echo "  Recovering pinned memo state from memo.pinned column..."
      sqlite3 "$db" "INSERT OR IGNORE INTO memo_organizer (memo_id, user_id, pinned) SELECT id, creator_id, 1 FROM memo WHERE pinned = 1;"
    fi
  fi

  # [upstream 0.26/03__alter_user_role.sql + 04__migrate_host_to_admin.sql]
  # Upstream removed HOST role and converted all HOST users to ADMIN.
  # This fork still uses HOST as the primary admin role.
  local has_host
  has_host=$(sqlite3 "$db" "SELECT COUNT(*) FROM user WHERE role='HOST';")
  if [ "$has_host" = "0" ]; then
    local has_admin
    has_admin=$(sqlite3 "$db" "SELECT COUNT(*) FROM user WHERE role='ADMIN';")
    if [ "$has_admin" != "0" ]; then
      echo "  Restoring HOST role for primary admin user..."
      sqlite3 "$db" "UPDATE user SET role='HOST' WHERE id = (SELECT MIN(id) FROM user WHERE role='ADMIN');"
    fi
  fi

  # --- Upstream v0.25 ---------------------------------------------------
  echo "Checking for upstream v0.25 schema changes..."

  # [upstream 0.25/00__remove_webhook.sql]
  # Upstream dropped webhook table. This fork still supports webhooks.
  sqlite3 "$db" <<'SQL'
CREATE TABLE IF NOT EXISTS webhook (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  row_status TEXT NOT NULL CHECK (row_status IN ('NORMAL', 'ARCHIVED')) DEFAULT 'NORMAL',
  creator_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_webhook_creator_id ON webhook(creator_id);
SQL

  # =========================================================================
  # Phase 2: Create fork-specific tables
  # =========================================================================
  echo "Creating fork-specific tables if missing..."

  sqlite3 "$db" <<'SQL'
-- [fork migration 0.24/01__tag.sql] Tag management with emoji and pinning
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

-- [fork migration 0.25/00__review.sql] Memo review sessions
CREATE TABLE IF NOT EXISTS memo_review_session (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  completed_at BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  memo_count INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_memo_review_session_user ON memo_review_session(user_id, completed_at);

-- [fork migration 0.25/00__review.sql] Individual memo review records
CREATE TABLE IF NOT EXISTS memo_review (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  memo_id INTEGER NOT NULL,
  reviewed_at BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  session_id INTEGER REFERENCES memo_review_session(id)
);
CREATE INDEX IF NOT EXISTS idx_memo_review_user ON memo_review(user_id);
CREATE INDEX IF NOT EXISTS idx_memo_review_user_time ON memo_review(user_id, reviewed_at);
CREATE INDEX IF NOT EXISTS idx_memo_review_user_memo ON memo_review(user_id, memo_id);

-- [fork migration 0.25/01__memo_review_session_cache.sql] Review session cache
CREATE TABLE IF NOT EXISTS memo_review_session_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  created_at BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  completed_at BIGINT,
  memo_ids TEXT NOT NULL DEFAULT '[]',
  total_count INTEGER NOT NULL DEFAULT 0
);
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

  run_query() {
    mysql -h "$host" -P "$port" -u "$user" -p"$pass" "$dbname" -sN -e "$1"
  }

  # =========================================================================
  # Phase 0: Ensure migration_history table exists
  # =========================================================================
  echo "Checking migration_history table..."

  run_query "CREATE TABLE IF NOT EXISTS \`migration_history\` (
    \`version\` VARCHAR(256) NOT NULL PRIMARY KEY,
    \`created_ts\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );"

  local has_version
  has_version=$(run_query "SELECT COUNT(*) FROM \`migration_history\` WHERE \`version\`='${SCHEMA_VERSION}';")
  if [ "$has_version" = "0" ]; then
    echo "  Inserting schema version ${SCHEMA_VERSION} into migration_history..."
    run_query "INSERT IGNORE INTO \`migration_history\` (\`version\`) VALUES ('${SCHEMA_VERSION}');"
  fi

  # =========================================================================
  # Phase 1: Reverse upstream breaking changes
  # =========================================================================

  # --- Upstream v0.26 ---------------------------------------------------
  echo "Checking for upstream v0.26 schema changes..."

  # [upstream 0.26/00__rename_resource_to_attachment.sql]
  # Upstream renamed resource -> attachment. This fork still uses resource.
  # Note: MySQL LATEST.sql has no explicit indexes on resource table.
  local has_attachment
  has_attachment=$(run_query "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='attachment';")
  local has_resource
  has_resource=$(run_query "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='resource';")
  if [ "$has_attachment" = "1" ] && [ "$has_resource" = "0" ]; then
    echo "  Renaming attachment table back to resource..."
    run_query "RENAME TABLE attachment TO resource;"
  fi

  # [upstream 0.26/01__drop_memo_organizer.sql]
  # Upstream dropped memo_organizer. This fork still uses it for pinning.
  local had_organizer
  had_organizer=$(run_query "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='memo_organizer';")
  run_query "CREATE TABLE IF NOT EXISTS \`memo_organizer\` (
    \`memo_id\` INT NOT NULL,
    \`user_id\` INT NOT NULL,
    \`pinned\` INT NOT NULL DEFAULT '0',
    UNIQUE(\`memo_id\`,\`user_id\`)
  );"

  # [upstream 0.24/01__memo_pinned.sql + 0.26/01__drop_memo_organizer.sql]
  # Recover pinned state from memo.pinned column back into memo_organizer.
  if [ "$had_organizer" = "0" ]; then
    local has_pinned
    has_pinned=$(run_query "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='memo' AND COLUMN_NAME='pinned';")
    if [ "$has_pinned" = "1" ]; then
      echo "  Recovering pinned memo state from memo.pinned column..."
      run_query "INSERT IGNORE INTO \`memo_organizer\` (\`memo_id\`, \`user_id\`, \`pinned\`) SELECT \`id\`, \`creator_id\`, 1 FROM \`memo\` WHERE \`pinned\` = 1;"
    fi
  fi

  # [upstream 0.26/02__migrate_host_to_admin.sql]
  # Upstream removed HOST role, converted to ADMIN. This fork still uses HOST.
  local has_host
  has_host=$(run_query "SELECT COUNT(*) FROM \`user\` WHERE \`role\`='HOST';")
  if [ "$has_host" = "0" ]; then
    local has_admin
    has_admin=$(run_query "SELECT COUNT(*) FROM \`user\` WHERE \`role\`='ADMIN';")
    if [ "$has_admin" != "0" ]; then
      echo "  Restoring HOST role for primary admin user..."
      run_query "UPDATE \`user\` SET \`role\`='HOST' WHERE \`id\` = (SELECT min_id FROM (SELECT MIN(\`id\`) AS min_id FROM \`user\` WHERE \`role\`='ADMIN') t);"
    fi
  fi

  # --- Upstream v0.25 ---------------------------------------------------
  echo "Checking for upstream v0.25 schema changes..."

  # [upstream 0.25/00__remove_webhook.sql]
  # Upstream dropped webhook table. This fork still supports webhooks.
  # Note: MySQL LATEST.sql has no explicit indexes on webhook table.
  run_query "CREATE TABLE IF NOT EXISTS \`webhook\` (
    \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`created_ts\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updated_ts\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`row_status\` VARCHAR(256) NOT NULL DEFAULT 'NORMAL',
    \`creator_id\` INT NOT NULL,
    \`name\` TEXT NOT NULL,
    \`url\` TEXT NOT NULL
  );"

  # =========================================================================
  # Phase 2: Create fork-specific tables
  # =========================================================================
  echo "Creating fork-specific tables if missing..."

  mysql -h "$host" -P "$port" -u "$user" -p"$pass" "$dbname" <<'SQL'
-- [fork migration 0.24/01__tag.sql] Tag management with emoji and pinning
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

-- [fork migration 0.25/00__review.sql] Memo review sessions
CREATE TABLE IF NOT EXISTS `memo_review_session` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `completed_at` BIGINT NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  `memo_count` INT NOT NULL
);

-- [fork migration 0.25/00__review.sql] Individual memo review records
CREATE TABLE IF NOT EXISTS `memo_review` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `memo_id` INT NOT NULL,
  `reviewed_at` BIGINT NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  `session_id` INT,
  FOREIGN KEY (`session_id`) REFERENCES `memo_review_session`(`id`)
);

-- [fork migration 0.25/01__memo_review_session_cache.sql] Review session cache
CREATE TABLE IF NOT EXISTS `memo_review_session_cache` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `created_at` BIGINT NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  `completed_at` BIGINT,
  `memo_ids` JSON NOT NULL,
  `total_count` INT NOT NULL DEFAULT 0
);
SQL

  # MySQL doesn't support IF NOT EXISTS for indexes; suppress duplicate errors.
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

  run_query() {
    psql "$dsn" -tA -c "$1"
  }

  # =========================================================================
  # Phase 0: Ensure migration_history table exists
  # =========================================================================
  echo "Checking migration_history table..."

  run_query "CREATE TABLE IF NOT EXISTS migration_history (
    version TEXT NOT NULL PRIMARY KEY,
    created_ts BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())
  );"

  local has_version
  has_version=$(run_query "SELECT COUNT(*) FROM migration_history WHERE version='${SCHEMA_VERSION}';")
  if [ "$has_version" = "0" ]; then
    echo "  Inserting schema version ${SCHEMA_VERSION} into migration_history..."
    run_query "INSERT INTO migration_history (version) VALUES ('${SCHEMA_VERSION}') ON CONFLICT DO NOTHING;"
  fi

  # =========================================================================
  # Phase 1: Reverse upstream breaking changes
  # =========================================================================

  # --- Upstream v0.26 ---------------------------------------------------
  echo "Checking for upstream v0.26 schema changes..."

  # [upstream 0.26/00__rename_resource_to_attachment.sql]
  # Upstream renamed resource -> attachment. This fork still uses resource.
  # Note: PostgreSQL LATEST.sql has no explicit indexes on resource table.
  local has_attachment
  has_attachment=$(run_query "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='attachment';")
  local has_resource
  has_resource=$(run_query "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='resource';")
  if [ "$has_attachment" = "1" ] && [ "$has_resource" = "0" ]; then
    echo "  Renaming attachment table back to resource..."
    run_query "ALTER TABLE attachment RENAME TO resource;"
  fi

  # [upstream 0.26/01__drop_memo_organizer.sql]
  # Upstream dropped memo_organizer. This fork still uses it for pinning.
  local had_organizer
  had_organizer=$(run_query "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='memo_organizer';")
  run_query "CREATE TABLE IF NOT EXISTS memo_organizer (
    memo_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    pinned INTEGER NOT NULL DEFAULT 0,
    UNIQUE(memo_id, user_id)
  );"

  # [upstream 0.24/01__memo_pinned.sql + 0.26/01__drop_memo_organizer.sql]
  # Recover pinned state from memo.pinned column back into memo_organizer.
  if [ "$had_organizer" = "0" ]; then
    local has_pinned
    has_pinned=$(run_query "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='memo' AND column_name='pinned';")
    if [ "$has_pinned" = "1" ]; then
      echo "  Recovering pinned memo state from memo.pinned column..."
      run_query "INSERT INTO memo_organizer (memo_id, user_id, pinned) SELECT id, creator_id, 1 FROM memo WHERE pinned = true ON CONFLICT DO NOTHING;"
    fi
  fi

  # [upstream 0.26/02__migrate_host_to_admin.sql]
  # Upstream removed HOST role, converted to ADMIN. This fork still uses HOST.
  local has_host
  has_host=$(run_query "SELECT COUNT(*) FROM \"user\" WHERE role='HOST';")
  if [ "$has_host" = "0" ]; then
    local has_admin
    has_admin=$(run_query "SELECT COUNT(*) FROM \"user\" WHERE role='ADMIN';")
    if [ "$has_admin" != "0" ]; then
      echo "  Restoring HOST role for primary admin user..."
      run_query "UPDATE \"user\" SET role='HOST' WHERE id = (SELECT MIN(id) FROM \"user\" WHERE role='ADMIN');"
    fi
  fi

  # --- Upstream v0.25 ---------------------------------------------------
  echo "Checking for upstream v0.25 schema changes..."

  # [upstream 0.25/00__remove_webhook.sql]
  # Upstream dropped webhook table. This fork still supports webhooks.
  # Note: PostgreSQL LATEST.sql has no explicit indexes on webhook table.
  run_query "CREATE TABLE IF NOT EXISTS webhook (
    id SERIAL PRIMARY KEY,
    created_ts BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
    updated_ts BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
    row_status TEXT NOT NULL DEFAULT 'NORMAL',
    creator_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL
  );"

  # =========================================================================
  # Phase 2: Create fork-specific tables
  # =========================================================================
  echo "Creating fork-specific tables if missing..."

  psql "$dsn" <<'SQL'
-- [fork migration 0.24/01__tag.sql] Tag management with emoji and pinning
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

-- [fork migration 0.25/00__review.sql] Memo review sessions
CREATE TABLE IF NOT EXISTS memo_review_session (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  completed_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  memo_count INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_memo_review_session_user ON memo_review_session(user_id, completed_at);

-- [fork migration 0.25/00__review.sql] Individual memo review records
CREATE TABLE IF NOT EXISTS memo_review (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  memo_id INTEGER NOT NULL,
  reviewed_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  session_id INTEGER REFERENCES memo_review_session(id)
);
CREATE INDEX IF NOT EXISTS idx_memo_review_user ON memo_review(user_id);
CREATE INDEX IF NOT EXISTS idx_memo_review_user_time ON memo_review(user_id, reviewed_at);
CREATE INDEX IF NOT EXISTS idx_memo_review_user_memo ON memo_review(user_id, memo_id);

-- [fork migration 0.25/01__memo_review_session_cache.sql] Review session cache
CREATE TABLE IF NOT EXISTS memo_review_session_cache (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  completed_at BIGINT,
  memo_ids TEXT NOT NULL DEFAULT '[]',
  total_count INTEGER NOT NULL DEFAULT 0
);
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
