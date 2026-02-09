package v1

import (
	"testing"
	"time"

	"github.com/stretchr/testify/require"

	"github.com/usememos/memos/store"
)

func TestGetRequiredInterval(t *testing.T) {
	tests := []struct {
		reviewCount int32
		expected    time.Duration
	}{
		{0, 0},
		{1, 1 * 24 * time.Hour},
		{2, 3 * 24 * time.Hour},
		{3, 7 * 24 * time.Hour},
		{4, 14 * 24 * time.Hour},
		{5, 30 * 24 * time.Hour},
		{10, 30 * 24 * time.Hour},  // capped at max
		{100, 30 * 24 * time.Hour}, // capped at max
	}
	for _, tt := range tests {
		got := getRequiredInterval(tt.reviewCount)
		require.Equal(t, tt.expected, got, "reviewCount=%d", tt.reviewCount)
	}
}

func TestIsEligibleForReview(t *testing.T) {
	now := time.Date(2025, 6, 15, 12, 0, 0, 0, time.UTC)

	tests := []struct {
		name     string
		summary  *store.MemoReviewSummary
		expected bool
	}{
		{
			name:     "nil summary (never reviewed) is always eligible",
			summary:  nil,
			expected: true,
		},
		{
			name: "0 reviews, just reviewed — eligible (interval is 0)",
			summary: &store.MemoReviewSummary{
				ReviewCount:    0,
				LastReviewedAt: now.Unix(),
			},
			expected: true,
		},
		{
			name: "1 review, reviewed 2 hours ago — not eligible (need 1 day)",
			summary: &store.MemoReviewSummary{
				ReviewCount:    1,
				LastReviewedAt: now.Add(-2 * time.Hour).Unix(),
			},
			expected: false,
		},
		{
			name: "1 review, reviewed 25 hours ago — eligible",
			summary: &store.MemoReviewSummary{
				ReviewCount:    1,
				LastReviewedAt: now.Add(-25 * time.Hour).Unix(),
			},
			expected: true,
		},
		{
			name: "2 reviews, reviewed 2 days ago — not eligible (need 3 days)",
			summary: &store.MemoReviewSummary{
				ReviewCount:    2,
				LastReviewedAt: now.Add(-2 * 24 * time.Hour).Unix(),
			},
			expected: false,
		},
		{
			name: "2 reviews, reviewed 3 days ago — eligible",
			summary: &store.MemoReviewSummary{
				ReviewCount:    2,
				LastReviewedAt: now.Add(-3 * 24 * time.Hour).Unix(),
			},
			expected: true,
		},
		{
			name: "5 reviews, reviewed 29 days ago — not eligible (need 30 days)",
			summary: &store.MemoReviewSummary{
				ReviewCount:    5,
				LastReviewedAt: now.Add(-29 * 24 * time.Hour).Unix(),
			},
			expected: false,
		},
		{
			name: "5 reviews, reviewed 31 days ago — eligible",
			summary: &store.MemoReviewSummary{
				ReviewCount:    5,
				LastReviewedAt: now.Add(-31 * 24 * time.Hour).Unix(),
			},
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := isEligibleForReview(tt.summary, now)
			require.Equal(t, tt.expected, got)
		})
	}
}

func TestSpacedIntervalsAreIncreasing(t *testing.T) {
	for i := 1; i < len(spacedIntervals); i++ {
		require.Greater(t, spacedIntervals[i], spacedIntervals[i-1],
			"spacedIntervals[%d] should be > spacedIntervals[%d]", i, i-1)
	}
}
