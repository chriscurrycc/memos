package postgres

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

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
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT(user_id) DO UPDATE SET
			created_at = EXCLUDED.created_at,
			completed_at = EXCLUDED.completed_at,
			memo_ids = EXCLUDED.memo_ids,
			total_count = EXCLUDED.total_count
		RETURNING id, created_at`
	if err := d.db.QueryRowContext(ctx, stmt, cache.UserID, now, cache.CompletedAt, string(memoIDsJSON), cache.TotalCount).Scan(
		&cache.ID,
		&cache.CreatedAt,
	); err != nil {
		return nil, err
	}
	return cache, nil
}

func (d *DB) GetMemoReviewSessionCache(ctx context.Context, userID int32) (*store.MemoReviewSessionCache, error) {
	row := d.db.QueryRowContext(ctx, `
		SELECT id, user_id, created_at, completed_at, memo_ids, total_count
		FROM memo_review_session_cache
		WHERE user_id = $1`, userID)

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
	_, err := d.db.ExecContext(ctx, "UPDATE memo_review_session_cache SET completed_at = $1 WHERE user_id = $2", now, userID)
	return err
}

func (d *DB) CreateReviewSession(ctx context.Context, create *store.ReviewSession) (*store.ReviewSession, error) {
	fields := []string{"user_id", "memo_count", "source"}
	args := []any{create.UserID, create.MemoCount, create.Source.String()}

	stmt := "INSERT INTO memo_review_session (" + strings.Join(fields, ", ") + ") VALUES (" + placeholders(len(args)) + ") RETURNING id, completed_at"
	if err := d.db.QueryRowContext(ctx, stmt, args...).Scan(
		&create.ID,
		&create.CompletedAt,
	); err != nil {
		return nil, err
	}

	return create, nil
}

func (d *DB) ListReviewSessions(ctx context.Context, find *store.FindReviewSession) ([]*store.ReviewSession, error) {
	where, args := []string{"1 = 1"}, []any{}

	if find.UserID != nil {
		where, args = append(where, "user_id = "+placeholder(len(args)+1)), append(args, *find.UserID)
	}
	if find.CompletedAtAfter != nil {
		where, args = append(where, "completed_at > "+placeholder(len(args)+1)), append(args, *find.CompletedAtAfter)
	}
	if find.Source != nil {
		where, args = append(where, "source = "+placeholder(len(args)+1)), append(args, find.Source.String())
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
	fields := []string{"user_id", "memo_id", "source"}
	args := []any{create.UserID, create.MemoID, create.Source.String()}

	if create.SessionID != nil {
		fields = append(fields, "session_id")
		args = append(args, *create.SessionID)
	}

	stmt := "INSERT INTO memo_review (" + strings.Join(fields, ", ") + ") VALUES (" + placeholders(len(args)) + ") RETURNING id, reviewed_at"
	if err := d.db.QueryRowContext(ctx, stmt, args...).Scan(
		&create.ID,
		&create.ReviewedAt,
	); err != nil {
		return nil, err
	}

	return create, nil
}

func (d *DB) ListMemoReviews(ctx context.Context, find *store.FindMemoReview) ([]*store.MemoReview, error) {
	where, args := []string{"1 = 1"}, []any{}

	if find.UserID != nil {
		where, args = append(where, "user_id = "+placeholder(len(args)+1)), append(args, *find.UserID)
	}
	if find.MemoID != nil {
		where, args = append(where, "memo_id = "+placeholder(len(args)+1)), append(args, *find.MemoID)
	}
	if find.ReviewedAtAfter != nil {
		where, args = append(where, "reviewed_at > "+placeholder(len(args)+1)), append(args, *find.ReviewedAtAfter)
	}
	if find.Source != nil {
		where, args = append(where, "source = "+placeholder(len(args)+1)), append(args, find.Source.String())
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
		where, args = append(where, "user_id = "+placeholder(len(args)+1)), append(args, *find.UserID)
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

	for _, review := range reviews {
		args := []any{review.UserID, review.MemoID, review.Source.String(), review.SessionID}
		_, err := tx.ExecContext(ctx, "INSERT INTO memo_review (user_id, memo_id, source, session_id) VALUES ($1, $2, $3, $4)", args...)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}
