# Migration Guide: From usememos/memos to This Fork

This document explains the database-level compatibility differences between upstream [usememos/memos](https://github.com/usememos/memos) and this fork, and what the [migration repair script](../scripts/migration-repair.sh) does to resolve them.

## Compatibility Overview

| Upstream Version | Compatibility | Action Required |
|---|---|---|
| v0.23.0 ~ v0.23.1 | Fully compatible | None |
| v0.24.0 ~ v0.26.2 | Compatible after repair | Run migration repair script |

## Before You Begin: Data Backup

> **WARNING: Back up your data BEFORE migrating. This step is NOT optional.**
>
> If the migration fails or produces unexpected results, having a backup is the ONLY way to recover your data. Without a backup, your memos, attachments, and settings may be permanently lost.

**Backup steps:**

1. **Stop the running service** — do NOT migrate while the service is active
2. **Copy the entire data directory** (default: `~/.memos/`):
   ```bash
   # Docker users
   docker stop memos
   cp -r ~/.memos/ ~/.memos-backup-$(date +%Y%m%d)/

   # Binary users
   # Stop the memos process first, then:
   cp -r ~/.memos/ ~/.memos-backup-$(date +%Y%m%d)/
   ```
3. **For MySQL/PostgreSQL**, also create a database dump:
   ```bash
   # MySQL
   mysqldump -u user -p memos > memos-backup-$(date +%Y%m%d).sql

   # PostgreSQL
   pg_dump -U user memos > memos-backup-$(date +%Y%m%d).sql
   ```
4. **Verify the backup** — make sure the backup files are not empty and have a reasonable size

Only proceed with migration after confirming your backup is complete.

---

## What the Repair Script Fixes

The repair script operates in two phases. Each section below explains what changed, why it matters, and what the script does to fix it.

### Phase 1: Reverse Upstream Breaking Changes

These are schema changes that upstream usememos/memos made but this fork did not adopt. The script detects and reverses them.

#### Upstream v0.26: `resource` Table Renamed to `attachment`

- **Upstream migration**: `0.26/00__rename_resource_to_attachment.sql`
- **What upstream did**: Renamed the `resource` table to `attachment` and recreated indexes under new names, then dropped all indexes in a subsequent migration.
- **Why it breaks**: This fork uses the `resource` table for all file attachment operations. With the table renamed, all resource queries fail.
- **What the script does**: Detects if the `attachment` table exists while `resource` doesn't, and renames it back. Recreates the necessary indexes (SQLite only — MySQL and PostgreSQL don't use explicit resource indexes in this fork).

#### Upstream v0.26: `memo_organizer` Table Dropped

- **Upstream migration**: `0.26/01__drop_memo_organizer.sql`
- **What upstream did**: In v0.24, upstream migrated the memo pinned state from the `memo_organizer` table into a new `pinned` column on the `memo` table. Then in v0.26, it dropped `memo_organizer` entirely.
- **Why it breaks**: This fork uses `memo_organizer` for per-user memo pinning. Without it, the pin feature stops working.
- **What the script does**: Recreates the `memo_organizer` table if missing. If the table was just created (meaning it was dropped by upstream) and the `memo.pinned` column exists (from upstream v0.24), the script recovers pinned data back into `memo_organizer`.

#### Upstream v0.26: `HOST` Role Changed to `ADMIN`

- **Upstream migration**: `0.26/03__alter_user_role.sql` + `0.26/04__migrate_host_to_admin.sql`
- **What upstream did**: Removed the `HOST` role from the user role system, recreated the user table without the HOST constraint, and converted all HOST users to ADMIN.
- **Why it breaks**: This fork uses `HOST` as the primary admin role throughout its permission system. Without a HOST user, workspace settings, IDP configuration, and other admin-only operations will fail.
- **What the script does**: Checks if any user has the HOST role. If not, assigns HOST to the ADMIN user with the lowest ID (typically the original instance creator).

#### Upstream v0.25: `webhook` Table Dropped

- **Upstream migration**: `0.25/00__remove_webhook.sql`
- **What upstream did**: Dropped the `webhook` table entirely, removing webhook functionality.
- **Why it breaks**: This fork retains webhook support. Without the table, webhook-related API calls will fail.
- **What the script does**: Recreates the `webhook` table if missing. Note that any previously configured webhooks in the upstream instance will have been lost when upstream dropped the table — they need to be reconfigured manually.

### Phase 2: Create Fork-Specific Tables

These are tables that this fork added and upstream never had. The fork's migration system may skip creating them when it detects that a higher migration version already exists in the history (from upstream).

#### Fork v0.24: `tag` Table

- **Fork migration**: `0.24/01__tag.sql`
- **What it does**: Provides tag management with emoji icons and tag pinning.
- **Why it may be missing**: The fork's migration version 0.24 has different content than upstream's 0.24. If upstream's 0.24 was already applied, the fork's migrator skips it, leaving the `tag` table uncreated.
- **What the script does**: Creates the `tag` table with its indexes if it doesn't exist.

#### Fork v0.25: Memo Review Tables

- **Fork migration**: `0.25/00__review.sql` + `0.25/01__memo_review_session_cache.sql`
- **What it does**: Provides a spaced repetition review system for memos, with session tracking and caching.
- **Tables created**:
  - `memo_review_session` — tracks review sessions per user
  - `memo_review` — individual memo review records within sessions
  - `memo_review_session_cache` — caches in-progress review session state
- **Why they may be missing**: Same version-number collision issue as the tag table. Upstream's 0.25 migration (which drops webhooks) has different content than the fork's 0.25 (which creates review tables).
- **What the script does**: Creates all three tables with their indexes if they don't exist.

---

## After Migration

After running the repair script:

1. **Start the service** and verify it launches without errors
2. **Check your memos** — confirm they are visible and intact
3. **Check pinned memos** — if you had pinned memos, verify they are still pinned
4. **Reconfigure webhooks** — if you used webhooks on upstream v0.25+, they need to be set up again (the data was lost when upstream dropped the table)
5. **Verify admin access** — ensure the admin user has the correct permissions
