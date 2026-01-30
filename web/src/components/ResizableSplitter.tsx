import { useCallback, useEffect, useState } from "react";

interface ResizableSplitterProps {
  leftPanelId?: string;
  rightPanelId?: string;
  minLeftWidth?: number;
  minRightWidth?: number;
  defaultLeftWidth?: number;
  localStorageKey?: string;
}

const ResizableSplitter: React.FC<ResizableSplitterProps> = ({
  leftPanelId = "left-panel",
  rightPanelId = "right-panel",
  minLeftWidth = 300,
  minRightWidth = 300,
  defaultLeftWidth = 50,
  localStorageKey = "memos-splitter-width",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [leftWidth, setLeftWidth] = useState<number>(() => {
    const saved = localStorage.getItem(localStorageKey);
    return saved ? parseFloat(saved) : defaultLeftWidth;
  });

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const container = document.getElementById(leftPanelId)?.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const offsetX = e.clientX - containerRect.left;

      const newLeftWidthPx = offsetX;
      const newRightWidthPx = containerWidth - offsetX;

      if (newLeftWidthPx >= minLeftWidth && newRightWidthPx >= minRightWidth) {
        const newLeftWidthPercent = (newLeftWidthPx / containerWidth) * 100;
        setLeftWidth(newLeftWidthPercent);
        localStorage.setItem(localStorageKey, newLeftWidthPercent.toString());
      }
    },
    [isDragging, leftPanelId, minLeftWidth, minRightWidth, localStorageKey],
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
    const leftPanel = document.getElementById(leftPanelId);
    const rightPanel = document.getElementById(rightPanelId);

    if (leftPanel) {
      leftPanel.style.width = `${leftWidth}%`;
    }
    if (rightPanel) {
      rightPanel.style.width = `${100 - leftWidth}%`;
    }
  }, [leftWidth, leftPanelId, rightPanelId]);

  return (
    <div
      className={`hidden lg:flex relative w-1 cursor-col-resize group hover:bg-blue-500 transition-colors ${
        isDragging ? "bg-blue-500" : "bg-transparent"
      }`}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute inset-y-0 -left-1 -right-1 z-10" />
      <div
        className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 transition-opacity ${
          isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        } bg-blue-500`}
      />
    </div>
  );
};

export default ResizableSplitter;
