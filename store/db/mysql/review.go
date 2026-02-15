package mysql

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/pkg/errors"

	"github.com/usememos/memos/store"
)

func (d *DB) UpsertMemoReviewSessionCache(ctx context.Context, cache *store.MemoReviewSessionCache) (*store.MemoReviewSessionCache, error) {
	memoIDsJSON, err := json.Marshal(cache.MemoIDs)
	if err != nil {
		return nil, err
	}
	now := time.Now().Unix()

	stmt := `
		INSERT INTO memo_review_session_cache (user_id, created_at, completed_at, memo_ids, total_count)
		VALUES (?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			created_at = VALUES(created_at),
			completed_at = VALUES(completed_at),
			memo_ids = VALUES(memo_ids),
			total_count = VALUES(total_count)`
	result, err := d.db.ExecContext(ctx, stmt, cache.UserID, now, cache.CompletedAt, string(memoIDsJSON), cache.TotalCount)
	if err != nil {
		return nil, err
	}

	rawID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	if rawID > 0 {
		cache.ID = int32(rawID)
	}
	cache.CreatedAt = now

	return cache, nil
}

func (d *DB) GetMemoReviewSessionCache(ctx context.Context, userID int32) (*store.MemoReviewSessionCache, error) {
	row := d.db.QueryRowContext(ctx, `
		SELECT id, user_id, created_at, completed_at, memo_ids, total_count
		FROM memo_review_session_cache
		WHERE user_id = ?`, userID)

	cache := &store.MemoReviewSessionCache{}
	var completedAt sql.NullInt64
	var memoIDsJSON string
	if err := row.Scan(&cache.ID, &cache.UserID, &cache.CreatedAt, &completedAt, &memoIDsJSON, &cache.TotalCount); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	if completedAt.Valid {
		cache.CompletedAt = &completedAt.Int64
	}
	if err := json.Unmarshal([]byte(memoIDsJSON), &cache.MemoIDs); err != nil {
		return nil, err
	}
	return cache, nil
}

func (d *DB) CompleteMemoReviewSessionCache(ctx context.Context, userID int32) error {
	now := time.Now().Unix()
	_, err := d.db.ExecContext(ctx, "UPDATE `memo_review_session_cache` SET `completed_at` = ? WHERE `user_id` = ?", now, userID)
	return err
}

func (d *DB) CreateReviewSession(ctx context.Context, create *store.ReviewSession) (*store.ReviewSession, error) {
	fields := []string{"`user_id`", "`memo_count`", "`source`"}
	placeholder := []string{"?", "?", "?"}
	args := []any{create.UserID, create.MemoCount, create.Source.String()}

	stmt := "INSERT INTO `memo_review_session` (" + strings.Join(fields, ", ") + ") VALUES (" + strings.Join(placeholder, ", ") + ")"
	result, err := d.db.ExecContext(ctx, stmt, args...)
	if err != nil {
		return nil, err
	}

	rawID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	id := int32(rawID)
	session, err := d.getReviewSession(ctx, id)
	if err != nil {
		return nil, err
	}
	if session == nil {
		return nil, errors.Errorf("failed to create review session")
	}
	return session, nil
}

func (d *DB) getReviewSession(ctx context.Context, id int32) (*store.ReviewSession, error) {
	row := d.db.QueryRowContext(ctx, `
		SELECT
			id,
			user_id,
			completed_at,
			memo_count,
			source
		FROM memo_review_session
		WHERE id = ?`, id)

	session := &store.ReviewSession{}
	var source string
	if err := row.Scan(
		&session.ID,
		&session.UserID,
		&session.CompletedAt,
		&session.MemoCount,
		&source,
	); err != nil {
		return nil, err
	}
	session.Source = store.ReviewSource(source)
	return session, nil
}

func (d *DB) ListReviewSessions(ctx context.Context, find *store.FindReviewSession) ([]*store.ReviewSession, error) {
	where, args := []string{"1 = 1"}, []any{}

	if find.UserID != nil {
		where, args = append(where, "`user_id` = ?"), append(args, *find.UserID)
	}
	if find.CompletedAtAfter != nil {
		where, args = append(where, "`completed_at` > ?"), append(args, *find.CompletedAtAfter)
	}
	if find.Source != nil {
		where, args = append(where, "`source` = ?"), append(args, find.Source.String())
	}

	query := `
		SELECT
			id,
			user_id,
			completed_at,
			memo_count,
			source
		FROM memo_review_session
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY completed_at DESC`

	if find.Limit != nil {
		query = fmt.Sprintf("%s LIMIT %d", query, *find.Limit)
	}

	rows, err := d.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []*store.ReviewSession{}
	for rows.Next() {
		session := &store.ReviewSession{}
		var source string
		if err := rows.Scan(
			&session.ID,
			&session.UserID,
			&session.CompletedAt,
			&session.MemoCount,
			&source,
		); err != nil {
			return nil, err
		}
		session.Source = store.ReviewSource(source)
		list = append(list, session)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return list, nil
}

func (d *DB) CreateMemoReview(ctx context.Context, create *store.MemoReview) (*store.MemoReview, error) {
	fields := []string{"`user_id`", "`memo_id`", "`source`"}
	placeholder := []string{"?", "?", "?"}
	args := []any{create.UserID, create.MemoID, create.Source.String()}

	if create.SessionID != nil {
		fields = append(fields, "`session_id`")
		placeholder = append(placeholder, "?")
		args = append(args, *create.SessionID)
	}

	stmt := "INSERT INTO `memo_review` (" + strings.Join(fields, ", ") + ") VALUES (" + strings.Join(placeholder, ", ") + ")"
	result, err := d.db.ExecContext(ctx, stmt, args...)
	if err != nil {
		return nil, err
	}

	rawID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	id := int32(rawID)
	review, err := d.getMemoReview(ctx, id)
	if err != nil {
		return nil, err
	}
	if review == nil {
		return nil, errors.Errorf("failed to create memo review")
	}
	return review, nil
}

func (d *DB) getMemoReview(ctx context.Context, id int32) (*store.MemoReview, error) {
	row := d.db.QueryRowContext(ctx, `
		SELECT
			id,
			user_id,
			memo_id,
			reviewed_at,
			source,
			session_id
		FROM memo_review
		WHERE id = ?`, id)

	review := &store.MemoReview{}
	var source string
	if err := row.Scan(
		&review.ID,
		&review.UserID,
		&review.MemoID,
		&review.ReviewedAt,
		&source,
		&review.SessionID,
	); err != nil {
		return nil, err
	}
	review.Source = store.ReviewSource(source)
	return review, nil
}

func (d *DB) ListMemoReviews(ctx context.Context, find *store.FindMemoReview) ([]*store.MemoReview, error) {
	where, args := []string{"1 = 1"}, []any{}

	if find.UserID != nil {
		where, args = append(where, "`user_id` = ?"), append(args, *find.UserID)
	}
	if find.MemoID != nil {
		where, args = append(where, "`memo_id` = ?"), append(args, *find.MemoID)
	}
	if find.ReviewedAtAfter != nil {
		where, args = append(where, "`reviewed_at` > ?"), append(args, *find.ReviewedAtAfter)
	}
	if find.Source != nil {
		where, args = append(where, "`source` = ?"), append(args, find.Source.String())
	}

	query := `
		SELECT
			id,
			user_id,
			memo_id,
			reviewed_at,
			source,
			session_id
		FROM memo_review
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY reviewed_at DESC`

	if find.Limit != nil {
		query = fmt.Sprintf("%s LIMIT %d", query, *find.Limit)
	}

	rows, err := d.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []*store.MemoReview{}
	for rows.Next() {
		review := &store.MemoReview{}
		var source string
		if err := rows.Scan(
			&review.ID,
			&review.UserID,
			&review.MemoID,
			&review.ReviewedAt,
			&source,
			&review.SessionID,
		); err != nil {
			return nil, err
		}
		review.Source = store.ReviewSource(source)
		list = append(list, review)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return list, nil
}

func (d *DB) ListMemoReviewSummaries(ctx context.Context, find *store.FindMemoReviewSummary) ([]*store.MemoReviewSummary, error) {
	where, args := []string{"1 = 1"}, []any{}

	if find.UserID != nil {
		where, args = append(where, "`user_id` = ?"), append(args, *find.UserID)
	}

	query := `
		SELECT memo_id, COUNT(*) AS review_count, MAX(reviewed_at) AS last_reviewed_at
		FROM memo_review
		WHERE ` + strings.Join(where, " AND ") + `
		GROUP BY memo_id`

	rows, err := d.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*store.MemoReviewSummary
	for rows.Next() {
		s := &store.MemoReviewSummary{}
		if err := rows.Scan(&s.MemoID, &s.ReviewCount, &s.LastReviewedAt); err != nil {
			return nil, err
		}
		list = append(list, s)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return list, nil
}

func (d *DB) BatchCreateMemoReviews(ctx context.Context, reviews []*store.MemoReview) error {
	if len(reviews) == 0 {
		return nil
	}

	tx, err := d.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	stmt, err := tx.PrepareContext(ctx, "INSERT INTO `memo_review` (`user_id`, `memo_id`, `source`, `session_id`) VALUES (?, ?, ?, ?)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, review := range reviews {
		if _, err := stmt.ExecContext(ctx, review.UserID, review.MemoID, review.Source.String(), review.SessionID); err != nil {
			return err
		}
	}

	return tx.Commit()
}
