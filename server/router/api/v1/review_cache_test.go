package v1

import (
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestCompletedToday(t *testing.T) {
	now := time.Now()

	// A timestamp from right now should be "completed today".
	require.True(t, completedToday(now.Unix()))

	// A timestamp from yesterday should not.
	yesterday := now.Add(-24 * time.Hour)
	require.False(t, completedToday(yesterday.Unix()))

	// Start of today should be "completed today".
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.Local)
	require.True(t, completedToday(startOfDay.Unix()))

	// End of yesterday should not.
	endOfYesterday := startOfDay.Add(-1 * time.Second)
	require.False(t, completedToday(endOfYesterday.Unix()))
}
