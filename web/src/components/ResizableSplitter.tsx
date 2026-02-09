import { useCallback, useEffect, useState } from "react";

interface Props {
  timelinePanelId?: string;
  pinnedPanelId?: string;
  minTimelineWidth?: number;
  minPinnedWidth?: number;
  defaultTimelineWidth?: number;
  localStorageKey?: string;
}

const ResizableSplitter = (props: Props) => {
  const {
    timelinePanelId = "timeline-panel",
    pinnedPanelId = "pinned-panel",
    minTimelineWidth = 300,
    minPinnedWidth = 300,
    defaultTimelineWidth = 50,
    localStorageKey = "memos-splitter-width",
  } = props;

  const [isDragging, setIsDragging] = useState(false);
  const [timelineWidth, setTimelineWidth] = useState<number>(() => {
    const saved = localStorage.getItem(localStorageKey);
    return saved ? parseFloat(saved) : defaultTimelineWidth;
  });

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const container = document.getElementById(timelinePanelId)?.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const offsetX = e.clientX - containerRect.left;

      const newTimelineWidthPx = offsetX;
      const newPinnedWidthPx = containerWidth - offsetX;

      if (newTimelineWidthPx >= minTimelineWidth && newPinnedWidthPx >= minPinnedWidth) {
        const newTimelineWidthPercent = (newTimelineWidthPx / containerWidth) * 100;
        setTimelineWidth(newTimelineWidthPercent);
        localStorage.setItem(localStorageKey, newTimelineWidthPercent.toString());
      }
    },
    [isDragging, timelinePanelId, minTimelineWidth, minPinnedWidth, localStorageKey],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const timelinePanel = document.getElementById(timelinePanelId);
    const pinnedPanel = document.getElementById(pinnedPanelId);

    if (timelinePanel) {
      timelinePanel.style.width = `${timelineWidth}%`;
    }
    if (pinnedPanel) {
      pinnedPanel.style.width = `${100 - timelineWidth}%`;
    }
  }, [timelineWidth, timelinePanelId, pinnedPanelId]);

  return (
    <div
      className={`hidden lg:flex relative w-1 mx-2 cursor-col-resize group hover:bg-teal-600 dark:hover:bg-teal-500 transition-colors rounded-full ${
        isDragging ? "bg-teal-600 dark:bg-teal-500" : "bg-transparent"
      }`}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute inset-y-0 -left-1 -right-1 z-10" />
      <div
        className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 rounded-full transition-opacity ${
          isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        } bg-teal-600 dark:bg-teal-500`}
      />
    </div>
  );
};

export default ResizableSplitter;
