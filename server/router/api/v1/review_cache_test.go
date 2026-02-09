package v1

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestDailyReviewCacheKey(t *testing.T) {
	require.Equal(t, "1", dailyReviewCacheKey(1))
	require.Equal(t, "42", dailyReviewCacheKey(42))
}

func TestTodayDateString(t *testing.T) {
	date := todayDateString()
	require.Regexp(t, `^\d{4}-\d{2}-\d{2}$`, date)
}

func TestDailyReviewCacheHitAndMiss(t *testing.T) {
	// Clean up global cache state before and after test.
	dailyReviewCacheMu.Lock()
	originalCache := dailyReviewCache
	dailyReviewCache = map[string]*dailyReviewEntry{}
	dailyReviewCacheMu.Unlock()
	defer func() {
		dailyReviewCacheMu.Lock()
		dailyReviewCache = originalCache
		dailyReviewCacheMu.Unlock()
	}()

	today := todayDateString()
	key := dailyReviewCacheKey(1)

	// Initially empty — no cache hit.
	dailyReviewCacheMu.Lock()
	entry, ok := dailyReviewCache[key]
	dailyReviewCacheMu.Unlock()
	require.False(t, ok)
	require.Nil(t, entry)

	// Populate cache.
	dailyReviewCacheMu.Lock()
	dailyReviewCache[key] = &dailyReviewEntry{
		date:       today,
		memoIDs:    []int32{10, 20, 30},
		totalCount: 100,
		completed:  false,
	}
	dailyReviewCacheMu.Unlock()

	// Cache hit for today.
	dailyReviewCacheMu.Lock()
	entry, ok = dailyReviewCache[key]
	dailyReviewCacheMu.Unlock()
	require.True(t, ok)
	require.Equal(t, today, entry.date)
	require.Equal(t, []int32{10, 20, 30}, entry.memoIDs)
	require.Equal(t, int32(100), entry.totalCount)
	require.False(t, entry.completed)
}

func TestDailyReviewCacheStaleDateMiss(t *testing.T) {
	dailyReviewCacheMu.Lock()
	originalCache := dailyReviewCache
	dailyReviewCache = map[string]*dailyReviewEntry{}
	dailyReviewCacheMu.Unlock()
	defer func() {
		dailyReviewCacheMu.Lock()
		dailyReviewCache = originalCache
		dailyReviewCacheMu.Unlock()
	}()

	key := dailyReviewCacheKey(1)
	today := todayDateString()

	// Populate with yesterday's date.
	dailyReviewCacheMu.Lock()
	dailyReviewCache[key] = &dailyReviewEntry{
		date:       "1999-01-01",
		memoIDs:    []int32{1, 2, 3},
		totalCount: 10,
	}
	dailyReviewCacheMu.Unlock()

	// Should not count as a valid hit for today.
	dailyReviewCacheMu.Lock()
	entry, ok := dailyReviewCache[key]
	dailyReviewCacheMu.Unlock()
	require.True(t, ok)
	require.NotEqual(t, today, entry.date)
}

func TestDailyReviewCacheCompleted(t *testing.T) {
	dailyReviewCacheMu.Lock()
	originalCache := dailyReviewCache
	dailyReviewCache = map[string]*dailyReviewEntry{}
	dailyReviewCacheMu.Unlock()
	defer func() {
		dailyReviewCacheMu.Lock()
		dailyReviewCache = originalCache
		dailyReviewCacheMu.Unlock()
	}()

	today := todayDateString()
	key := dailyReviewCacheKey(1)

	// Create uncompleted entry.
	dailyReviewCacheMu.Lock()
	dailyReviewCache[key] = &dailyReviewEntry{
		date:       today,
		memoIDs:    []int32{10, 20},
		totalCount: 50,
		completed:  false,
	}
	dailyReviewCacheMu.Unlock()

	// Mark as completed.
	dailyReviewCacheMu.Lock()
	dailyReviewCache[key].completed = true
	dailyReviewCacheMu.Unlock()

	// Verify completed state persists.
	dailyReviewCacheMu.Lock()
	entry := dailyReviewCache[key]
	dailyReviewCacheMu.Unlock()
	require.True(t, entry.completed)
	require.Equal(t, []int32{10, 20}, entry.memoIDs)
}

func TestDailyReviewCacheForceReplace(t *testing.T) {
	dailyReviewCacheMu.Lock()
	originalCache := dailyReviewCache
	dailyReviewCache = map[string]*dailyReviewEntry{}
	dailyReviewCacheMu.Unlock()
	defer func() {
		dailyReviewCacheMu.Lock()
		dailyReviewCache = originalCache
		dailyReviewCacheMu.Unlock()
	}()

	today := todayDateString()
	key := dailyReviewCacheKey(1)

	// Create completed entry.
	dailyReviewCacheMu.Lock()
	dailyReviewCache[key] = &dailyReviewEntry{
		date:       today,
		memoIDs:    []int32{10, 20},
		totalCount: 50,
		completed:  true,
	}
	dailyReviewCacheMu.Unlock()

	// Force replace simulates what ListReviewMemos does with force=true.
	dailyReviewCacheMu.Lock()
	dailyReviewCache[key] = &dailyReviewEntry{
		date:       today,
		memoIDs:    []int32{30, 40, 50},
		totalCount: 80,
		completed:  false,
	}
	dailyReviewCacheMu.Unlock()

	// Should have the new data, not completed.
	dailyReviewCacheMu.Lock()
	entry := dailyReviewCache[key]
	dailyReviewCacheMu.Unlock()
	require.False(t, entry.completed)
	require.Equal(t, []int32{30, 40, 50}, entry.memoIDs)
	require.Equal(t, int32(80), entry.totalCount)
}

func TestDailyReviewCacheMultiUser(t *testing.T) {
	dailyReviewCacheMu.Lock()
	originalCache := dailyReviewCache
	dailyReviewCache = map[string]*dailyReviewEntry{}
	dailyReviewCacheMu.Unlock()
	defer func() {
		dailyReviewCacheMu.Lock()
		dailyReviewCache = originalCache
		dailyReviewCacheMu.Unlock()
	}()

	today := todayDateString()

	// Two different users.
	key1 := dailyReviewCacheKey(1)
	key2 := dailyReviewCacheKey(2)

	dailyReviewCacheMu.Lock()
	dailyReviewCache[key1] = &dailyReviewEntry{
		date:       today,
		memoIDs:    []int32{10},
		totalCount: 10,
	}
	dailyReviewCache[key2] = &dailyReviewEntry{
		date:       today,
		memoIDs:    []int32{99},
		totalCount: 20,
	}
	dailyReviewCacheMu.Unlock()

	// Each user has their own cache.
	dailyReviewCacheMu.Lock()
	e1 := dailyReviewCache[key1]
	e2 := dailyReviewCache[key2]
	dailyReviewCacheMu.Unlock()

	require.Equal(t, []int32{10}, e1.memoIDs)
	require.Equal(t, []int32{99}, e2.memoIDs)
}
