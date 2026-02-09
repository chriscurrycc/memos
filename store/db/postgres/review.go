package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/usememos/memos/store"
)

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
