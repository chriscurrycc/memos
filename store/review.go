package store

import (
	"context"
)

type ReviewSource string

const (
	ReviewSourceReview     ReviewSource = "review"
	ReviewSourceOnThisDay  ReviewSource = "on_this_day"
	ReviewSourceSurprise   ReviewSource = "surprise"
	ReviewSourceTimeTravel ReviewSource = "time_travel"
)

func (s ReviewSource) String() string {
	return string(s)
}

type ReviewSession struct {
	ID          int32
	UserID      int32
	CompletedAt int64
	MemoCount   int32
	Source      ReviewSource
}

type MemoReview struct {
	ID         int32
	UserID     int32
	MemoID     int32
	ReviewedAt int64
	Source     ReviewSource
	SessionID  *int32
}

type FindMemoReview struct {
	UserID          *int32
	MemoID          *int32
	ReviewedAtAfter *int64
	Source          *ReviewSource
	Limit           *int
}

type MemoReviewSummary struct {
	MemoID         int32
	ReviewCount    int32
	LastReviewedAt int64
}

type FindMemoReviewSummary struct {
	UserID *int32
}

type FindReviewSession struct {
	UserID           *int32
	CompletedAtAfter *int64
	Source           *ReviewSource
	Limit            *int
}

func (s *Store) CreateReviewSession(ctx context.Context, create *ReviewSession) (*ReviewSession, error) {
	return s.driver.CreateReviewSession(ctx, create)
}

func (s *Store) ListReviewSessions(ctx context.Context, find *FindReviewSession) ([]*ReviewSession, error) {
	return s.driver.ListReviewSessions(ctx, find)
}

func (s *Store) CreateMemoReview(ctx context.Context, create *MemoReview) (*MemoReview, error) {
	return s.driver.CreateMemoReview(ctx, create)
}

func (s *Store) ListMemoReviews(ctx context.Context, find *FindMemoReview) ([]*MemoReview, error) {
	return s.driver.ListMemoReviews(ctx, find)
}

func (s *Store) BatchCreateMemoReviews(ctx context.Context, reviews []*MemoReview) error {
	return s.driver.BatchCreateMemoReviews(ctx, reviews)
}

func (s *Store) ListMemoReviewSummaries(ctx context.Context, find *FindMemoReviewSummary) ([]*MemoReviewSummary, error) {
	return s.driver.ListMemoReviewSummaries(ctx, find)
}
