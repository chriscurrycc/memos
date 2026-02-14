import clsx from "clsx";
import { ChevronLeftIcon, ChevronRightIcon, SlidersHorizontalIcon, RefreshCwIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState, useCallback, useRef } from "react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import useNavigateTo from "@/hooks/useNavigateTo";
import { useReviewStore } from "@/store/v1/review";
import { useTranslate } from "@/utils/i18n";
import ConfettiAnimation from "./ConfettiAnimation";
import ReviewMemoCard from "./ReviewMemoCard";
import ReviewSettingsModal from "./ReviewSettingsModal";

const ReviewModule = () => {
  const t = useTranslate();
  const navigateTo = useNavigateTo();
  const { memos, currentIndex, isReviewLoading, isCompleted, totalCount, fetchReviewMemos, nextMemo, prevMemo, recordReview } =
    useReviewStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);
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

  // Sync Swiper with store's currentIndex (for button/keyboard navigation)
  useEffect(() => {
    if (swiperRef.current && swiperRef.current.activeIndex !== currentIndex) {
      swiperRef.current.slideTo(currentIndex);
    }
  }, [currentIndex]);

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      const newIndex = swiper.activeIndex;
      const storeIndex = useReviewStore.getState().currentIndex;
      if (newIndex > storeIndex) {
        nextMemo();
      } else if (newIndex < storeIndex) {
        prevMemo();
      }
    },
    [nextMemo, prevMemo],
  );

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
    fetchReviewMemos(true);
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
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/20 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-teal-500 dark:text-teal-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-1.5 text-zinc-700 dark:text-zinc-200">{t("review.all-caught-up")}</h3>
          <p className="text-zinc-400 dark:text-zinc-500 mb-4 max-w-xs text-sm">{t("review.all-caught-up-desc")}</p>
          <button
            onClick={handleRefresh}
            disabled={isReviewLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/20 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-teal-500 dark:text-teal-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-1.5 text-zinc-700 dark:text-zinc-200">{t("review.not-enough-memos")}</h3>
          <p className="text-zinc-400 dark:text-zinc-500 max-w-xs text-sm">{t("review.not-enough-memos-desc")}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col">
      {showConfetti && <ConfettiAnimation />}

      {/* Settings button */}
      <div className="flex justify-end items-center mb-2">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={clsx(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
            showSettings
              ? "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-700/40"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/40 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-300",
          )}
        >
          <SlidersHorizontalIcon className="w-3.5 h-3.5" />
          {t("review.settings")}
        </button>
      </div>

      <ReviewSettingsModal open={showSettings} onClose={() => setShowSettings(false)} />

      {isCompleted ? (
        <motion.div
          className="flex flex-col flex-1 items-center justify-center py-12 text-center"
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
            disabled={isReviewLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-lg shadow-teal-200/50 dark:shadow-teal-900/20 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCwIcon className="w-4 h-4" />
            {t("review.start-new-session")}
          </button>
        </motion.div>
      ) : (
        <>
          {/* Card area — Swiper */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <Swiper
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              onSlideChange={handleSlideChange}
              spaceBetween={16}
              slidesPerView={1}
              autoHeight
            >
              {memos.map((memo) => (
                <SwiperSlide key={memo.name}>
                  <ReviewMemoCard memo={memo} onEdit={(uid) => navigateTo(`/m/${uid}?edit=true`, { state: { from: "/review" } })} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          {/* Pagination — pinned at bottom */}
          <div className="shrink-0 flex flex-col items-center gap-3 pt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => currentIndex > 0 && prevMemo()}
                disabled={currentIndex === 0}
                className={clsx(
                  "p-2 rounded-lg transition-colors",
                  currentIndex === 0
                    ? "text-zinc-200 dark:text-zinc-700 cursor-not-allowed"
                    : "text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300",
                )}
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500 tabular-nums min-w-[3.5rem] text-center">
                {currentIndex + 1} / {memos.length}
              </span>
              <button
                onClick={() => !isLast && nextMemo()}
                disabled={isLast}
                className={clsx(
                  "p-2 rounded-lg transition-colors",
                  isLast
                    ? "text-zinc-200 dark:text-zinc-700 cursor-not-allowed"
                    : "text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300",
                )}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
            {isLast && (
              <button
                onClick={nextMemo}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium shadow-sm transition-all active:scale-[0.98]"
              >
                {t("review.session-complete")}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewModule;
