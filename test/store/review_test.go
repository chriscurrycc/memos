package teststore

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"

	storepb "github.com/usememos/memos/proto/gen/store"
	"github.com/usememos/memos/store"
)

func TestReviewSessionStore(t *testing.T) {
	ctx := context.Background()
	ts := NewTestingStore(ctx, t)
	user, err := createTestingHostUser(ctx, ts)
	require.NoError(t, err)

	// Create a review session.
	session, err := ts.CreateReviewSession(ctx, &store.ReviewSession{
		UserID:    user.ID,
		MemoCount: 5,
		Source:    store.ReviewSourceReview,
	})
	require.NoError(t, err)
	require.NotZero(t, session.ID)
	require.Equal(t, user.ID, session.UserID)
	require.Equal(t, int32(5), session.MemoCount)
	require.Equal(t, store.ReviewSourceReview, session.Source)
	require.NotZero(t, session.CompletedAt)

	// Create a second session with a different source.
	session2, err := ts.CreateReviewSession(ctx, &store.ReviewSession{
		UserID:    user.ID,
		MemoCount: 3,
		Source:    store.ReviewSourceOnThisDay,
	})
	require.NoError(t, err)
	require.NotEqual(t, session.ID, session2.ID)

	// List all sessions for the user.
	sessions, err := ts.ListReviewSessions(ctx, &store.FindReviewSession{
		UserID: &user.ID,
	})
	require.NoError(t, err)
	require.Len(t, sessions, 2)

	// List sessions filtered by source.
	reviewSource := store.ReviewSourceReview
	sessions, err = ts.ListReviewSessions(ctx, &store.FindReviewSession{
		UserID: &user.ID,
		Source: &reviewSource,
	})
	require.NoError(t, err)
	require.Len(t, sessions, 1)
	require.Equal(t, session.ID, sessions[0].ID)

	// List sessions with limit.
	limit := 1
	sessions, err = ts.ListReviewSessions(ctx, &store.FindReviewSession{
		UserID: &user.ID,
		Limit:  &limit,
	})
	require.NoError(t, err)
	require.Len(t, sessions, 1)

	ts.Close()
}

func TestMemoReviewStore(t *testing.T) {
	ctx := context.Background()
	ts := NewTestingStore(ctx, t)
	user, err := createTestingHostUser(ctx, ts)
	require.NoError(t, err)

	memo, err := ts.CreateMemo(ctx, &store.Memo{
		UID:        "review-test-memo-1",
		CreatorID:  user.ID,
		Content:    "test memo for review",
		Visibility: store.Private,
	})
	require.NoError(t, err)

	memo2, err := ts.CreateMemo(ctx, &store.Memo{
		UID:        "review-test-memo-2",
		CreatorID:  user.ID,
		Content:    "test memo for review 2",
		Visibility: store.Private,
	})
	require.NoError(t, err)

	// Create a single memo review.
	review, err := ts.CreateMemoReview(ctx, &store.MemoReview{
		UserID: user.ID,
		MemoID: memo.ID,
		Source: store.ReviewSourceReview,
	})
	require.NoError(t, err)
	require.NotZero(t, review.ID)
	require.Equal(t, memo.ID, review.MemoID)
	require.NotZero(t, review.ReviewedAt)

	// List reviews for the user.
	reviews, err := ts.ListMemoReviews(ctx, &store.FindMemoReview{
		UserID: &user.ID,
	})
	require.NoError(t, err)
	require.Len(t, reviews, 1)
	require.Equal(t, review.ID, reviews[0].ID)

	// List reviews filtered by memo ID.
	reviews, err = ts.ListMemoReviews(ctx, &store.FindMemoReview{
		UserID: &user.ID,
		MemoID: &memo.ID,
	})
	require.NoError(t, err)
	require.Len(t, reviews, 1)

	// No reviews for memo2 yet.
	reviews, err = ts.ListMemoReviews(ctx, &store.FindMemoReview{
		UserID: &user.ID,
		MemoID: &memo2.ID,
	})
	require.NoError(t, err)
	require.Len(t, reviews, 0)

	ts.Close()
}

func TestBatchCreateMemoReviews(t *testing.T) {
	ctx := context.Background()
	ts := NewTestingStore(ctx, t)
	user, err := createTestingHostUser(ctx, ts)
	require.NoError(t, err)

	// Create memos.
	var memoIDs []int32
	for i := 0; i < 5; i++ {
		m, err := ts.CreateMemo(ctx, &store.Memo{
			UID:        "batch-review-memo-" + string(rune('a'+i)),
			CreatorID:  user.ID,
			Content:    "batch test memo",
			Visibility: store.Private,
		})
		require.NoError(t, err)
		memoIDs = append(memoIDs, m.ID)
	}

	// Create session to link reviews.
	session, err := ts.CreateReviewSession(ctx, &store.ReviewSession{
		UserID:    user.ID,
		MemoCount: int32(len(memoIDs)),
		Source:    store.ReviewSourceReview,
	})
	require.NoError(t, err)

	// Batch create reviews.
	var reviews []*store.MemoReview
	for _, memoID := range memoIDs {
		reviews = append(reviews, &store.MemoReview{
			UserID:    user.ID,
			MemoID:    memoID,
			Source:    store.ReviewSourceReview,
			SessionID: &session.ID,
		})
	}
	err = ts.BatchCreateMemoReviews(ctx, reviews)
	require.NoError(t, err)

	// Verify all reviews were created.
	allReviews, err := ts.ListMemoReviews(ctx, &store.FindMemoReview{
		UserID: &user.ID,
	})
	require.NoError(t, err)
	require.Len(t, allReviews, 5)

	// All reviews should reference the session.
	for _, r := range allReviews {
		require.NotNil(t, r.SessionID)
		require.Equal(t, session.ID, *r.SessionID)
	}

	// Batch create with empty slice should not error.
	err = ts.BatchCreateMemoReviews(ctx, []*store.MemoReview{})
	require.NoError(t, err)

	ts.Close()
}

func TestMemoReviewFilterByTime(t *testing.T) {
	ctx := context.Background()
	ts := NewTestingStore(ctx, t)
	user, err := createTestingHostUser(ctx, ts)
	require.NoError(t, err)

	memo, err := ts.CreateMemo(ctx, &store.Memo{
		UID:        "time-filter-memo",
		CreatorID:  user.ID,
		Content:    "test",
		Visibility: store.Private,
	})
	require.NoError(t, err)

	_, err = ts.CreateMemoReview(ctx, &store.MemoReview{
		UserID: user.ID,
		MemoID: memo.ID,
		Source: store.ReviewSourceReview,
	})
	require.NoError(t, err)

	// Query with a past threshold — should include the review.
	pastThreshold := int64(0)
	reviews, err := ts.ListMemoReviews(ctx, &store.FindMemoReview{
		UserID:          &user.ID,
		ReviewedAtAfter: &pastThreshold,
	})
	require.NoError(t, err)
	require.Len(t, reviews, 1)

	// Query with a future threshold — should exclude the review.
	futureThreshold := int64(9999999999)
	reviews, err = ts.ListMemoReviews(ctx, &store.FindMemoReview{
		UserID:          &user.ID,
		ReviewedAtAfter: &futureThreshold,
	})
	require.NoError(t, err)
	require.Len(t, reviews, 0)

	ts.Close()
}

func TestListMemoReviewSummaries(t *testing.T) {
	ctx := context.Background()
	ts := NewTestingStore(ctx, t)
	user, err := createTestingHostUser(ctx, ts)
	require.NoError(t, err)

	// No reviews yet — summaries should be empty.
	summaries, err := ts.ListMemoReviewSummaries(ctx, &store.FindMemoReviewSummary{
		UserID: &user.ID,
	})
	require.NoError(t, err)
	require.Len(t, summaries, 0)

	// Create two memos.
	memo1, err := ts.CreateMemo(ctx, &store.Memo{
		UID:        "summary-test-memo-1",
		CreatorID:  user.ID,
		Content:    "test memo 1",
		Visibility: store.Private,
	})
	require.NoError(t, err)

	memo2, err := ts.CreateMemo(ctx, &store.Memo{
		UID:        "summary-test-memo-2",
		CreatorID:  user.ID,
		Content:    "test memo 2",
		Visibility: store.Private,
	})
	require.NoError(t, err)

	// Review memo1 three times.
	for i := 0; i < 3; i++ {
		_, err = ts.CreateMemoReview(ctx, &store.MemoReview{
			UserID: user.ID,
			MemoID: memo1.ID,
			Source: store.ReviewSourceReview,
		})
		require.NoError(t, err)
	}

	// Review memo2 once.
	_, err = ts.CreateMemoReview(ctx, &store.MemoReview{
		UserID: user.ID,
		MemoID: memo2.ID,
		Source: store.ReviewSourceReview,
	})
	require.NoError(t, err)

	// Verify summaries.
	summaries, err = ts.ListMemoReviewSummaries(ctx, &store.FindMemoReviewSummary{
		UserID: &user.ID,
	})
	require.NoError(t, err)
	require.Len(t, summaries, 2)

	summaryMap := map[int32]*store.MemoReviewSummary{}
	for _, s := range summaries {
		summaryMap[s.MemoID] = s
	}

	require.Equal(t, int32(3), summaryMap[memo1.ID].ReviewCount)
	require.NotZero(t, summaryMap[memo1.ID].LastReviewedAt)
	require.Equal(t, int32(1), summaryMap[memo2.ID].ReviewCount)
	require.NotZero(t, summaryMap[memo2.ID].LastReviewedAt)

	ts.Close()
}

func TestReviewSettingStore(t *testing.T) {
	ctx := context.Background()
	ts := NewTestingStore(ctx, t)
	user, err := createTestingHostUser(ctx, ts)
	require.NoError(t, err)

	// Upsert review setting.
	_, err = ts.UpsertUserSetting(ctx, &storepb.UserSetting{
		UserId: user.ID,
		Key:    storepb.UserSettingKey_REVIEW_SETTING,
		Value: &storepb.UserSetting_ReviewSetting{
			ReviewSetting: &storepb.ReviewUserSetting{
				SessionSize: 5,
				IncludeTags: []string{"tag1"},
				ExcludeTags: []string{"tag2"},
			},
		},
	})
	require.NoError(t, err)

	// Read it back.
	setting, err := ts.GetUserSetting(ctx, &store.FindUserSetting{
		UserID: &user.ID,
		Key:    storepb.UserSettingKey_REVIEW_SETTING,
	})
	require.NoError(t, err)
	require.NotNil(t, setting)
	rs := setting.GetReviewSetting()
	require.NotNil(t, rs)
	require.Equal(t, int32(5), rs.SessionSize)
	require.Equal(t, []string{"tag1"}, rs.IncludeTags)
	require.Equal(t, []string{"tag2"}, rs.ExcludeTags)

	// Update it.
	_, err = ts.UpsertUserSetting(ctx, &storepb.UserSetting{
		UserId: user.ID,
		Key:    storepb.UserSettingKey_REVIEW_SETTING,
		Value: &storepb.UserSetting_ReviewSetting{
			ReviewSetting: &storepb.ReviewUserSetting{
				SessionSize: 15,
			},
		},
	})
	require.NoError(t, err)

	setting, err = ts.GetUserSetting(ctx, &store.FindUserSetting{
		UserID: &user.ID,
		Key:    storepb.UserSettingKey_REVIEW_SETTING,
	})
	require.NoError(t, err)
	require.NotNil(t, setting)
	rs = setting.GetReviewSetting()
	require.Equal(t, int32(15), rs.SessionSize)
	require.Empty(t, rs.IncludeTags)
	require.Empty(t, rs.ExcludeTags)

	ts.Close()
}
