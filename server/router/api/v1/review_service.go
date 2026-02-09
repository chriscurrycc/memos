package v1

import (
	"context"
	"fmt"
	"math"
	"math/rand"
	"sort"
	"strings"
	"sync"
	"time"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

	v1pb "github.com/usememos/memos/proto/gen/api/v1"
	storepb "github.com/usememos/memos/proto/gen/store"
	"github.com/usememos/memos/store"
)

// Spaced repetition intervals in days based on review count.
var spacedIntervals = []int{0, 1, 3, 7, 14, 30}

// getRequiredInterval returns the minimum days that must pass before a memo
// is eligible for review again, based on how many times it has been reviewed.
func getRequiredInterval(reviewCount int32) time.Duration {
	idx := int(reviewCount)
	if idx >= len(spacedIntervals) {
		idx = len(spacedIntervals) - 1
	}
	return time.Duration(spacedIntervals[idx]) * 24 * time.Hour
}

// isEligibleForReview checks whether enough time has passed since the last
// review based on the spaced repetition schedule.
func isEligibleForReview(summary *store.MemoReviewSummary, now time.Time) bool {
	if summary == nil {
		return true
	}
	interval := getRequiredInterval(summary.ReviewCount)
	return now.Sub(time.Unix(summary.LastReviewedAt, 0)) >= interval
}

type scoredMemo struct {
	memoID int32
	score  float64
}

// dailyReviewCache caches memo IDs per user per day so that repeated
// calls within the same day return a consistent review set.
type dailyReviewEntry struct {
	date       string // "YYYY-MM-DD"
	memoIDs    []int32
	totalCount int32
	completed  bool
}

var (
	dailyReviewCache   = map[string]*dailyReviewEntry{} // key: "userID"
	dailyReviewCacheMu sync.Mutex
)

func dailyReviewCacheKey(userID int32) string {
	return fmt.Sprintf("%d", userID)
}

func todayDateString() string {
	return time.Now().Format("2006-01-02")
}

func (s *APIV1Service) ListReviewMemos(ctx context.Context, request *v1pb.ListReviewMemosRequest) (*v1pb.ListReviewMemosResponse, error) {
	user, err := s.GetCurrentUser(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get current user")
	}
	if user == nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not found")
	}

	today := todayDateString()
	cacheKey := dailyReviewCacheKey(user.ID)

	// Check cache: return cached memos if same day and not forcing refresh.
	if !request.Force {
		dailyReviewCacheMu.Lock()
		entry, ok := dailyReviewCache[cacheKey]
		dailyReviewCacheMu.Unlock()

		if ok && entry.date == today && len(entry.memoIDs) > 0 {
			return s.loadMemosFromCache(ctx, entry)
		}
	}

	// Generate new review set.
	memoIDs, totalCount, err := s.generateReviewMemoIDs(ctx, user.ID)
	if err != nil {
		return nil, err
	}

	// Store in cache.
	dailyReviewCacheMu.Lock()
	dailyReviewCache[cacheKey] = &dailyReviewEntry{
		date:       today,
		memoIDs:    memoIDs,
		totalCount: totalCount,
	}
	entry := dailyReviewCache[cacheKey]
	dailyReviewCacheMu.Unlock()

	return s.loadMemosFromCache(ctx, entry)
}

// generateReviewMemoIDs picks memo IDs for a review session using spaced
// repetition eligibility and a scoring system for priority + randomness.
func (s *APIV1Service) generateReviewMemoIDs(ctx context.Context, userID int32) ([]int32, int32, error) {
	// Read user review settings.
	sessionSize := 10
	var includeTags, excludeTags []string
	setting, err := s.Store.GetUserSetting(ctx, &store.FindUserSetting{
		UserID: &userID,
		Key:    storepb.UserSettingKey_REVIEW_SETTING,
	})
	if err == nil && setting != nil {
		if rs := setting.GetReviewSetting(); rs != nil {
			if rs.SessionSize > 0 {
				sessionSize = int(rs.SessionSize)
			}
			includeTags = rs.IncludeTags
			excludeTags = rs.ExcludeTags
		}
	}

	// Load aggregated review summaries instead of all individual review rows.
	summaries, err := s.Store.ListMemoReviewSummaries(ctx, &store.FindMemoReviewSummary{
		UserID: &userID,
	})
	if err != nil {
		return nil, 0, status.Errorf(codes.Internal, "failed to list review summaries: %v", err)
	}
	summaryMap := make(map[int32]*store.MemoReviewSummary, len(summaries))
	for _, sm := range summaries {
		summaryMap[sm.MemoID] = sm
	}

	// Load memos without content for performance.
	normalStatus := store.Normal
	memoFind := &store.FindMemo{
		CreatorID:       &userID,
		RowStatus:       &normalStatus,
		ExcludeComments: true,
		ExcludeContent:  true,
	}
	if len(includeTags) > 0 {
		memoFind.PayloadFind = &store.FindMemoPayload{
			TagSearch: includeTags,
		}
	}

	memos, err := s.Store.ListMemos(ctx, memoFind)
	if err != nil {
		return nil, 0, status.Errorf(codes.Internal, "failed to list memos: %v", err)
	}

	now := time.Now()
	oneYearSeconds := float64(365 * 24 * 60 * 60)
	var candidates []scoredMemo

	for _, memo := range memos {
		// Exclude by tags.
		if len(excludeTags) > 0 && memo.Payload != nil {
			excluded := false
			for _, excludeTag := range excludeTags {
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

		summary := summaryMap[memo.ID]

		// Spaced repetition eligibility check.
		if !isEligibleForReview(summary, now) {
			continue
		}

		// Scoring system.
		var score float64

		// Never-reviewed bonus: 50 pts.
		if summary == nil {
			score += 50
		}

		// Overdue ratio: up to 60 pts based on how far past the interval.
		if summary != nil {
			interval := getRequiredInterval(summary.ReviewCount)
			elapsed := now.Sub(time.Unix(summary.LastReviewedAt, 0))
			if interval > 0 {
				ratio := float64(elapsed) / float64(interval)
				score += math.Min(ratio-1, 5) / 5 * 60
			}
		}

		// Age factor: up to 10 pts for older memos (normalized to 1 year).
		ageSeconds := float64(now.Unix() - memo.CreatedTs)
		score += math.Min(ageSeconds/oneYearSeconds, 1) * 10

		// Random jitter: 0-10 pts for variety.
		score += rand.Float64() * 10

		candidates = append(candidates, scoredMemo{memoID: memo.ID, score: score})
	}

	totalCount := int32(len(candidates))

	// Sort by score descending, take top N.
	sort.Slice(candidates, func(i, j int) bool {
		return candidates[i].score > candidates[j].score
	})
	if len(candidates) > sessionSize {
		candidates = candidates[:sessionSize]
	}

	// Shuffle for display order.
	rand.Shuffle(len(candidates), func(i, j int) {
		candidates[i], candidates[j] = candidates[j], candidates[i]
	})

	ids := make([]int32, len(candidates))
	for i, c := range candidates {
		ids[i] = c.memoID
	}

	return ids, totalCount, nil
}

// loadMemosFromCache loads full memo objects from cached IDs.
func (s *APIV1Service) loadMemosFromCache(ctx context.Context, entry *dailyReviewEntry) (*v1pb.ListReviewMemosResponse, error) {
	response := &v1pb.ListReviewMemosResponse{
		Memos:      []*v1pb.Memo{},
		TotalCount: entry.totalCount,
		Completed:  entry.completed,
	}

	for _, memoID := range entry.memoIDs {
		memo, err := s.Store.GetMemo(ctx, &store.FindMemo{ID: &memoID})
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to get memo: %v", err)
		}
		if memo == nil {
			continue
		}
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

	// Collect all matching memos (sorted by year desc, then by created time)
	type memoWithYear struct {
		memo *store.Memo
		year int
	}
	var allMatching []memoWithYear
	currentYear := now.Year()

	for _, memo := range memos {
		createdTime := time.Unix(memo.CreatedTs, 0)
		if int(createdTime.Month()) == month && createdTime.Day() == day && createdTime.Year() != currentYear {
			allMatching = append(allMatching, memoWithYear{memo: memo, year: createdTime.Year()})
		}
	}

	totalCount := int32(len(allMatching))

	// Sort by year descending, then by created time descending
	for i := 0; i < len(allMatching); i++ {
		for j := i + 1; j < len(allMatching); j++ {
			if allMatching[j].year > allMatching[i].year ||
				(allMatching[j].year == allMatching[i].year && allMatching[j].memo.CreatedTs > allMatching[i].memo.CreatedTs) {
				allMatching[i], allMatching[j] = allMatching[j], allMatching[i]
			}
		}
	}

	// Apply pagination
	pageSize := int(request.PageSize)
	if pageSize <= 0 {
		pageSize = 10
	}
	offset := int(request.Offset)
	if offset > len(allMatching) {
		offset = len(allMatching)
	}
	end := offset + pageSize
	if end > len(allMatching) {
		end = len(allMatching)
	}
	paginated := allMatching[offset:end]

	// Group paginated memos by year
	memosByYear := make(map[int][]*store.Memo)
	for _, m := range paginated {
		memosByYear[m.year] = append(memosByYear[m.year], m.memo)
	}

	// Convert to response
	response := &v1pb.ListOnThisDayMemosResponse{
		Groups:     []*v1pb.OnThisDayGroup{},
		TotalCount: totalCount,
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

	var periodStart, periodEnd int64

	if request.PeriodStart != nil && request.PeriodEnd != nil {
		// User-specified date range
		periodStart = request.PeriodStart.AsTime().Unix()
		periodEnd = request.PeriodEnd.AsTime().Unix()
	} else {
		// Find date range for random selection
		var minTs, maxTs int64 = memos[0].CreatedTs, memos[0].CreatedTs
		for _, memo := range memos {
			if memo.CreatedTs < minTs {
				minTs = memo.CreatedTs
			}
			if memo.CreatedTs > maxTs {
				maxTs = memo.CreatedTs
			}
		}

		dateRange := maxTs - minTs
		if dateRange < 7*24*60*60 {
			periodStart = minTs
			periodEnd = maxTs
		} else {
			periodStart = minTs + rand.Int63n(dateRange-7*24*60*60)
			periodEnd = periodStart + 7*24*60*60
		}
	}

	// Filter memos within the period
	var periodMemos []*store.Memo
	for _, memo := range memos {
		if memo.CreatedTs >= periodStart && memo.CreatedTs <= periodEnd {
			periodMemos = append(periodMemos, memo)
		}
	}

	totalCount := int32(len(periodMemos))

	// Apply pagination
	pageSize := int(request.PageSize)
	if pageSize <= 0 {
		pageSize = 10
	}
	offset := int(request.Offset)
	if offset > len(periodMemos) {
		offset = len(periodMemos)
	}
	end := offset + pageSize
	if end > len(periodMemos) {
		end = len(periodMemos)
	}
	paginated := periodMemos[offset:end]

	response := &v1pb.GetTimeTravelMemosResponse{
		Memos:       []*v1pb.Memo{},
		PeriodStart: timestamppb.New(time.Unix(periodStart, 0)),
		PeriodEnd:   timestamppb.New(time.Unix(periodEnd, 0)),
		TotalCount:  totalCount,
	}

	for _, memo := range paginated {
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

	// Mark daily cache as completed for review source.
	if request.Source == v1pb.ReviewSource_REVIEW_SOURCE_REVIEW {
		dailyReviewCacheMu.Lock()
		if entry, ok := dailyReviewCache[dailyReviewCacheKey(user.ID)]; ok {
			entry.completed = true
		}
		dailyReviewCacheMu.Unlock()
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

	// Get aggregated review summaries.
	summaries, err := s.Store.ListMemoReviewSummaries(ctx, &store.FindMemoReviewSummary{
		UserID: &user.ID,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list review summaries: %v", err)
	}
	summaryMap := make(map[int32]*store.MemoReviewSummary, len(summaries))
	for _, sm := range summaries {
		summaryMap[sm.MemoID] = sm
	}

	// Count reviewed (not yet eligible) and available using spaced repetition.
	now := time.Now()
	var reviewedLast30Days, availableForReview int32
	for _, memo := range memos {
		summary := summaryMap[memo.ID]
		if summary == nil {
			availableForReview++
			continue
		}
		if isEligibleForReview(summary, now) {
			availableForReview++
		} else {
			reviewedLast30Days++
		}
	}

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
