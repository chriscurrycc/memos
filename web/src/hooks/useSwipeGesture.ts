import { useEffect, useRef } from "react";

interface SwipeGestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // Minimum distance to trigger swipe (px)
  edgeZone?: number; // Distance from edge to start tracking (px)
  velocityThreshold?: number; // Minimum velocity to trigger swipe (px/ms)
  trackFromEdge?: "left" | "right" | "both";
}

/**
 * Custom hook for detecting swipe gestures on mobile devices
 * Optimized for edge-based drawer opening
 */
const useSwipeGesture = (config: SwipeGestureConfig) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    threshold = 50,
    edgeZone = 30,
    velocityThreshold = 0.3,
    trackFromEdge = "both",
  } = config;

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchMoveRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const x = touch.clientX;
      const y = touch.clientY;

      // Only track touches that start near the specified edge
      const windowWidth = window.innerWidth;
      const isLeftEdge = x <= edgeZone;
      const isRightEdge = x >= windowWidth - edgeZone;

      if (
        (trackFromEdge === "left" && isLeftEdge) ||
        (trackFromEdge === "right" && isRightEdge) ||
        (trackFromEdge === "both" && (isLeftEdge || isRightEdge))
      ) {
        touchStartRef.current = { x, y, time: Date.now() };
        touchMoveRef.current = null;
      } else {
        touchStartRef.current = null;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.touches[0];
      touchMoveRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    };

    const handleTouchEnd = () => {
      if (!touchStartRef.current || !touchMoveRef.current) {
        touchStartRef.current = null;
        touchMoveRef.current = null;
        return;
      }

      const deltaX = touchMoveRef.current.x - touchStartRef.current.x;
      const deltaY = touchMoveRef.current.y - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Calculate absolute distances
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Only trigger if horizontal movement is dominant (not a scroll)
      if (absX > absY && absX > threshold) {
        const velocity = absX / deltaTime;

        // Check if velocity meets threshold or distance is large enough
        if (velocity >= velocityThreshold || absX > threshold * 2) {
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        }
      }

      // Reset
      touchStartRef.current = null;
      touchMoveRef.current = null;
    };

    // Add event listeners with passive: false to allow preventDefault if needed
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold, edgeZone, velocityThreshold, trackFromEdge]);
};

export default useSwipeGesture;
