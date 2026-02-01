import { motion, useMotionValue, useTransform, PanInfo } from "motion/react";
import { useCallback } from "react";
import MemoContent from "@/components/MemoContent";
import MemoResourceListView from "@/components/MemoResourceListView";
import { Memo } from "@/types/proto/api/v1/memo_service";

interface Props {
  memo: Memo;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  isTop?: boolean;
}

const SwipeCard = ({ memo, onSwipeLeft, onSwipeRight, isTop = false }: Props) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 100;
      if (info.offset.x > threshold) {
        onSwipeRight?.();
      } else if (info.offset.x < -threshold) {
        onSwipeLeft?.();
      }
    },
    [onSwipeLeft, onSwipeRight],
  );

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
  };

  return (
    <motion.div
      className="absolute w-full bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 p-6 cursor-grab active:cursor-grabbing"
      style={{
        x,
        rotate,
        opacity,
        zIndex: isTop ? 10 : 0,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      exit={{ x: 300, opacity: 0, rotate: 15 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">{formatDate(memo.displayTime)}</div>

      <div className="max-h-96 overflow-y-auto">
        <MemoContent memoName={memo.name} nodes={memo.nodes} />
        {memo.resources.length > 0 && <MemoResourceListView resources={memo.resources} />}
      </div>

      {memo.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-4">
          {memo.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-1 bg-gray-100 dark:bg-zinc-700 rounded-full text-gray-600 dark:text-gray-300">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default SwipeCard;
