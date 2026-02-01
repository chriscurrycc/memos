package v1

import (
	"context"
	"math/rand"
	"strings"
	"time"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

	v1pb "github.com/usememos/memos/proto/gen/api/v1"
	"github.com/usememos/memos/store"
)

const (
	reviewDeduplicationDays = 30
)

func (s *APIV1Service) ListReviewMemos(ctx context.Context, request *v1pb.ListReviewMemosRequest) (*v1pb.ListReviewMemosResponse, error) {
	user, err := s.GetCurrentUser(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get current user")
	}
	if user == nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not found")
	}

	// Get memos reviewed in the last 30 days
	thirtyDaysAgo := time.Now().Unix() - int64(reviewDeduplicationDays*24*60*60)
	recentReviews, err := s.Store.ListMemoReviews(ctx, &store.FindMemoReview{
		UserID:          &user.ID,
		ReviewedAtAfter: &thirtyDaysAgo,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list recent reviews: %v", err)
	}

	// Build set of recently reviewed memo IDs
	reviewedMemoIDs := make(map[int32]bool)
	for _, review := range recentReviews {
		reviewedMemoIDs[review.MemoID] = true
	}

	// List all normal memos for the user
	normalStatus := store.Normal
	memoFind := &store.FindMemo{
		CreatorID:       &user.ID,
		RowStatus:       &normalStatus,
		ExcludeComments: true,
	}

	// Apply tag filters
	if len(request.IncludeTags) > 0 {
		memoFind.PayloadFind = &store.FindMemoPayload{
			TagSearch: request.IncludeTags,
		}
	}

	memos, err := s.Store.ListMemos(ctx, memoFind)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list memos: %v", err)
	}

	// Filter out recently reviewed memos and apply exclude tags
	var filteredMemos []*store.Memo
	for _, memo := range memos {
		if reviewedMemoIDs[memo.ID] {
			continue
		}

		// Apply exclude tags filter
		if len(request.ExcludeTags) > 0 && memo.Payload != nil {
			excluded := false
			for _, excludeTag := range request.ExcludeTags {
				for _, memoTag := range memo.Payload.Tags {
					if strings.HasPrefix(memoTag, excludeTag) || memoTag == excludeTag {
						excluded = true
						break
					}
				}
				if excluded {
					break
				}
			}
			if excluded {
				continue
			}
		}

		filteredMemos = append(filteredMemos, memo)
	}

	totalCount := int32(len(filteredMemos))

	// Apply limit
	pageSize := int(request.PageSize)
	if pageSize <= 0 {
		pageSize = 5
	}
	if len(filteredMemos) > pageSize {
		filteredMemos = filteredMemos[:pageSize]
	}

	// Convert to response
	response := &v1pb.ListReviewMemosResponse{
		Memos:      []*v1pb.Memo{},
		TotalCount: totalCount,
	}

	for _, memo := range filteredMemos {
		memoMessage, err := s.convertMemoFromStore(ctx, memo, v1pb.MemoView_MEMO_VIEW_FULL)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to convert memo: %v", err)
		}
		response.Memos = append(response.Memos, memoMessage)
	}

	return response, nil
}

func (s *APIV1Service) ListOnThisDayMemos(ctx context.Context, request *v1pb.ListOnThisDayMemosRequest) (*v1pb.ListOnThisDayMemosResponse, error) {
	user, err := s.GetCurrentUser(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get current user")
	}
	if user == nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not found")
	}

	now := time.Now()
	month := int(request.Month)
	day := int(request.Day)

	if month <= 0 || month > 12 {
		month = int(now.Month())
	}
	if day <= 0 || day > 31 {
		day = now.Day()
	}

	// List all normal memos for the user
	normalStatus := store.Normal
	memos, err := s.Store.ListMemos(ctx, &store.FindMemo{
		CreatorID:       &user.ID,
		RowStatus:       &normalStatus,
		ExcludeComments: true,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list memos: %v", err)
	}

	// Group memos by year if they match the month/day
	memosByYear := make(map[int][]*store.Memo)
	currentYear := now.Year()

	for _, memo := range memos {
		createdTime := time.Unix(memo.CreatedTs, 0)
		if int(createdTime.Month()) == month && createdTime.Day() == day && createdTime.Year() != currentYear {
			year := createdTime.Year()
			memosByYear[year] = append(memosByYear[year], memo)
		}
	}

	// Convert to response
	response := &v1pb.ListOnThisDayMemosResponse{
		Groups: []*v1pb.OnThisDayGroup{},
	}

	for year, yearMemos := range memosByYear {
		group := &v1pb.OnThisDayGroup{
			Year:  int32(year),
			Memos: []*v1pb.Memo{},
		}
		for _, memo := range yearMemos {
			memoMessage, err := s.convertMemoFromStore(ctx, memo, v1pb.MemoView_MEMO_VIEW_FULL)
			if err != nil {
				return nil, status.Errorf(codes.Internal, "failed to convert memo: %v", err)
			}
			group.Memos = append(group.Memos, memoMessage)
		}
		response.Groups = append(response.Groups, group)
	}

	return response, nil
}

func (s *APIV1Service) GetRandomMemo(ctx context.Context, _ *v1pb.GetRandomMemoRequest) (*v1pb.Memo, error) {
	user, err := s.GetCurrentUser(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get current user")
	}
	if user == nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not found")
	}

	// Get a random memo
	normalStatus := store.Normal
	limit := 1
	memos, err := s.Store.ListMemos(ctx, &store.FindMemo{
		CreatorID:       &user.ID,
		RowStatus:       &normalStatus,
		ExcludeComments: true,
		Random:          true,
		Limit:           &limit,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list memos: %v", err)
	}

	if len(memos) == 0 {
		return nil, status.Errorf(codes.NotFound, "no memos found")
	}

	memoMessage, err := s.convertMemoFromStore(ctx, memos[0], v1pb.MemoView_MEMO_VIEW_FULL)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to convert memo: %v", err)
	}

	return memoMessage, nil
}

func (s *APIV1Service) GetTimeTravelMemos(ctx context.Context, request *v1pb.GetTimeTravelMemosRequest) (*v1pb.GetTimeTravelMemosResponse, error) {
	user, err := s.GetCurrentUser(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get current user")
	}
	if user == nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not found")
	}

	// Get all memos to find the date range
	normalStatus := store.Normal
	memos, err := s.Store.ListMemos(ctx, &store.FindMemo{
		CreatorID:       &user.ID,
		RowStatus:       &normalStatus,
		ExcludeComments: true,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list memos: %v", err)
	}

	if len(memos) == 0 {
		return nil, status.Errorf(codes.NotFound, "no memos found")
	}

	// Find date range
	var minTs, maxTs int64 = memos[0].CreatedTs, memos[0].CreatedTs
	for _, memo := range memos {
		if memo.CreatedTs < minTs {
			minTs = memo.CreatedTs
		}
		if memo.CreatedTs > maxTs {
			maxTs = memo.CreatedTs
		}
	}

	// Pick a random week within the range
	dateRange := maxTs - minTs
	if dateRange < 7*24*60*60 {
		// Less than a week of memos, return all
		response := &v1pb.GetTimeTravelMemosResponse{
			Memos:       []*v1pb.Memo{},
			PeriodStart: timestamppb.New(time.Unix(minTs, 0)),
			PeriodEnd:   timestamppb.New(time.Unix(maxTs, 0)),
		}
		for _, memo := range memos {
			memoMessage, err := s.convertMemoFromStore(ctx, memo, v1pb.MemoView_MEMO_VIEW_FULL)
			if err != nil {
				return nil, status.Errorf(codes.Internal, "failed to convert memo: %v", err)
			}
			response.Memos = append(response.Memos, memoMessage)
		}
		return response, nil
	}

	// Random start point
	randomStart := minTs + rand.Int63n(dateRange-7*24*60*60)
	periodEnd := randomStart + 7*24*60*60

	// Filter memos within the period
	var periodMemos []*store.Memo
	for _, memo := range memos {
		if memo.CreatedTs >= randomStart && memo.CreatedTs <= periodEnd {
			periodMemos = append(periodMemos, memo)
		}
	}

	// Apply limit
	pageSize := int(request.PageSize)
	if pageSize <= 0 {
		pageSize = 10
	}
	if len(periodMemos) > pageSize {
		periodMemos = periodMemos[:pageSize]
	}

	response := &v1pb.GetTimeTravelMemosResponse{
		Memos:       []*v1pb.Memo{},
		PeriodStart: timestamppb.New(time.Unix(randomStart, 0)),
		PeriodEnd:   timestamppb.New(time.Unix(periodEnd, 0)),
	}

	for _, memo := range periodMemos {
		memoMessage, err := s.convertMemoFromStore(ctx, memo, v1pb.MemoView_MEMO_VIEW_FULL)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to convert memo: %v", err)
		}
		response.Memos = append(response.Memos, memoMessage)
	}

	return response, nil
}

func (s *APIV1Service) RecordReview(ctx context.Context, request *v1pb.RecordReviewRequest) (*v1pb.RecordReviewResponse, error) {
	user, err := s.GetCurrentUser(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get current user")
	}
	if user == nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not found")
	}

	if len(request.MemoNames) == 0 {
		return &v1pb.RecordReviewResponse{
			SessionId:     0,
			RecordedCount: 0,
		}, nil
	}

	// Convert source
	source := convertReviewSourceToStore(request.Source)

	// Create review session
	session, err := s.Store.CreateReviewSession(ctx, &store.ReviewSession{
		UserID:    user.ID,
		MemoCount: int32(len(request.MemoNames)),
		Source:    source,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create review session: %v", err)
	}

	// Parse memo IDs and create reviews
	var reviews []*store.MemoReview
	for _, memoName := range request.MemoNames {
		memoID, err := ExtractMemoIDFromName(memoName)
		if err != nil {
			continue
		}
		reviews = append(reviews, &store.MemoReview{
			UserID:    user.ID,
			MemoID:    memoID,
			Source:    source,
			SessionID: &session.ID,
		})
	}

	if err := s.Store.BatchCreateMemoReviews(ctx, reviews); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to record reviews: %v", err)
	}

	return &v1pb.RecordReviewResponse{
		SessionId:     session.ID,
		RecordedCount: int32(len(reviews)),
	}, nil
}

func (s *APIV1Service) GetReviewStats(ctx context.Context, _ *v1pb.GetReviewStatsRequest) (*v1pb.GetReviewStatsResponse, error) {
	user, err := s.GetCurrentUser(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get current user")
	}
	if user == nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not found")
	}

	// Get total memos
	normalStatus := store.Normal
	memos, err := s.Store.ListMemos(ctx, &store.FindMemo{
		CreatorID:       &user.ID,
		RowStatus:       &normalStatus,
		ExcludeComments: true,
		ExcludeContent:  true,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list memos: %v", err)
	}
	totalMemos := int32(len(memos))

	// Get memos reviewed in the last 30 days
	thirtyDaysAgo := time.Now().Unix() - int64(reviewDeduplicationDays*24*60*60)
	recentReviews, err := s.Store.ListMemoReviews(ctx, &store.FindMemoReview{
		UserID:          &user.ID,
		ReviewedAtAfter: &thirtyDaysAgo,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list recent reviews: %v", err)
	}

	// Count unique memos reviewed
	reviewedMemoIDs := make(map[int32]bool)
	for _, review := range recentReviews {
		reviewedMemoIDs[review.MemoID] = true
	}
	reviewedLast30Days := int32(len(reviewedMemoIDs))
	availableForReview := totalMemos - reviewedLast30Days

	// Get total sessions
	sessions, err := s.Store.ListReviewSessions(ctx, &store.FindReviewSession{
		UserID: &user.ID,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list sessions: %v", err)
	}
	totalSessions := int32(len(sessions))

	return &v1pb.GetReviewStatsResponse{
		TotalMemos:          totalMemos,
		ReviewedLast_30Days: reviewedLast30Days,
		AvailableForReview:  availableForReview,
		TotalSessions:       totalSessions,
	}, nil
}

func convertReviewSourceToStore(source v1pb.ReviewSource) store.ReviewSource {
	switch source {
	case v1pb.ReviewSource_REVIEW_SOURCE_REVIEW:
		return store.ReviewSourceReview
	case v1pb.ReviewSource_REVIEW_SOURCE_ON_THIS_DAY:
		return store.ReviewSourceOnThisDay
	case v1pb.ReviewSource_REVIEW_SOURCE_SURPRISE:
		return store.ReviewSourceSurprise
	case v1pb.ReviewSource_REVIEW_SOURCE_TIME_TRAVEL:
		return store.ReviewSourceTimeTravel
	default:
		return store.ReviewSourceReview
	}
}

