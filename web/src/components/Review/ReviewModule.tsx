import { motion } from "motion/react";
import { ChevronLeftIcon, ChevronRightIcon, SlidersHorizontalIcon, RefreshCwIcon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import clsx from "clsx";
import ConfettiAnimation from "./ConfettiAnimation";
import ReviewSettingsDrawer from "./ReviewSettingsDrawer";
import MemoContent from "@/components/MemoContent";
import MemoResourceListView from "@/components/MemoResourceListView";
import { useReviewStore } from "@/store/v1/review";
import { useTranslate } from "@/utils/i18n";

const ReviewModule = () => {
  const t = useTranslate();
  const { memos, currentIndex, isReviewLoading, isCompleted, totalCount, fetchReviewMemos, nextMemo, prevMemo, recordReview } = useReviewStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const isLast = currentIndex >= memos.length - 1;

  useEffect(() => {
    fetchReviewMemos();
  }, []);

  useEffect(() => {
    if (isCompleted && memos.length > 0) {
      setShowConfetti(true);
      recordReview();
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, memos.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && !isLast) {
        nextMemo();
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        prevMemo();
      }
    },
    [nextMemo, prevMemo, isLast, currentIndex],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleRefresh = () => {
    fetchReviewMemos();
  };

  if (isReviewLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-sm text-zinc-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-teal-500 dark:text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-1.5 text-zinc-700 dark:text-zinc-200">{t("review.all-caught-up")}</h3>
          <p className="text-zinc-400 dark:text-zinc-500 mb-4 max-w-xs text-sm">{t("review.all-caught-up-desc")}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <RefreshCwIcon className="w-4 h-4" />
            {t("review.refresh")}
          </button>
        </motion.div>
      </div>
    );
  }

  if (memos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-teal-500 dark:text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-1.5 text-zinc-700 dark:text-zinc-200">{t("review.not-enough-memos")}</h3>
          <p className="text-zinc-400 dark:text-zinc-500 max-w-xs text-sm">{t("review.not-enough-memos-desc")}</p>
        </motion.div>
      </div>
    );
  }

  const memo = memos[currentIndex];

  return (
    <div className="relative">
      {showConfetti && <ConfettiAnimation />}

      {/* Controls bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-1">
          <button
            onClick={prevMemo}
            disabled={currentIndex === 0}
            className={clsx(
              "p-1.5 rounded-lg transition-colors",
              currentIndex === 0
                ? "text-zinc-200 dark:text-zinc-700 cursor-not-allowed"
                : "text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300",
            )}
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 tabular-nums min-w-[3rem] text-center">
            {currentIndex + 1} / {memos.length}
          </span>
          <button
            onClick={nextMemo}
            disabled={isLast}
            className={clsx(
              "p-1.5 rounded-lg transition-colors",
              isLast
                ? "text-zinc-200 dark:text-zinc-700 cursor-not-allowed"
                : "text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300",
            )}
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={clsx(
            "p-2 rounded-lg transition-colors",
            showSettings
              ? "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500",
          )}
        >
          <SlidersHorizontalIcon className="w-4 h-4" />
        </button>
      </div>

      <ReviewSettingsDrawer open={showSettings} onClose={() => setShowSettings(false)} />

      {isCompleted ? (
        <motion.div
          className="flex flex-col items-center justify-center py-12 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-100 via-emerald-50 to-cyan-50 dark:from-teal-900/30 dark:via-emerald-900/20 dark:to-cyan-900/20 flex items-center justify-center mb-4 shadow-lg shadow-teal-100/50 dark:shadow-teal-900/10">
            <svg
              className="w-10 h-10 text-teal-500 dark:text-teal-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
              <path d="M12 3v12" />
              <path d="M5 21h14" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-1.5 text-zinc-800 dark:text-zinc-100">{t("review.session-complete")}</h3>
          <p className="text-zinc-400 dark:text-zinc-500 mb-6 text-sm">{t("review.session-complete-desc", { count: memos.length })}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-lg shadow-teal-200/50 dark:shadow-teal-900/20 transition-all hover:shadow-xl"
          >
            <RefreshCwIcon className="w-4 h-4" />
            {t("review.start-new-session")}
          </button>
        </motion.div>
      ) : (
        <>
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/60 dark:border-zinc-700/50 p-4 shadow-[0_1px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-none">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 dark:bg-teal-500/60" />
              <span className="text-xs font-medium tracking-wide text-zinc-400 dark:text-zinc-500">
                {memo.displayTime
                  ? new Date(memo.displayTime).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
                  : ""}
              </span>
            </div>
            <MemoContent memoName={memo.name} nodes={memo.nodes} />
            {memo.resources.length > 0 && (
              <div className="mt-2">
                <MemoResourceListView resources={memo.resources} />
              </div>
            )}
          </div>
          {isLast && (
            <div className="flex justify-center mt-4">
              <button
                onClick={nextMemo}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors shadow-sm"
              >
                {t("review.session-complete")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewModule;
