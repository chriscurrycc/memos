import { Button, Drawer, IconButton, Input, ModalClose, Sheet, Typography } from "@mui/joy";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeftIcon, ChevronRightIcon, SettingsIcon, RefreshCwIcon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import ConfettiAnimation from "./ConfettiAnimation";
import SwipeCard from "./SwipeCard";
import { useReviewStore } from "@/store/v1/review";
import { ReviewSource } from "@/types/proto/api/v1/review_service";
import { useTranslate } from "@/utils/i18n";

const ReviewModule = () => {
  const t = useTranslate();
  const { memos, currentIndex, isLoading, isCompleted, totalCount, settings, setSettings, fetchReviewMemos, nextMemo, prevMemo, recordReview } =
    useReviewStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchReviewMemos();
  }, []);

  useEffect(() => {
    if (isCompleted && memos.length > 0) {
      setShowConfetti(true);
      recordReview(ReviewSource.REVIEW_SOURCE_REVIEW);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, memos.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextMemo();
      } else if (e.key === "ArrowLeft") {
        prevMemo();
      }
    },
    [nextMemo, prevMemo],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleRefresh = () => {
    fetchReviewMemos();
  };

  const currentMemo = memos[currentIndex];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold mb-2 dark:text-gray-200">{t("review.all-caught-up")}</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{t("review.all-caught-up-desc")}</p>
        <Button onClick={handleRefresh} startDecorator={<RefreshCwIcon className="w-4 h-4" />}>
          {t("review.refresh")}
        </Button>
      </div>
    );
  }

  if (memos.length === 0 && totalCount < 20) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold mb-2 dark:text-gray-200">{t("review.not-enough-memos")}</h3>
        <p className="text-gray-500 dark:text-gray-400">{t("review.not-enough-memos-desc")}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {showConfetti && <ConfettiAnimation />}

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {currentIndex + 1} / {memos.length}
        </div>
        <IconButton variant="outlined" color="neutral" onClick={() => setShowSettings(true)}>
          <SettingsIcon className="w-5 h-5" />
        </IconButton>
      </div>

      {isCompleted ? (
        <motion.div
          className="flex flex-col items-center justify-center h-96 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-4">🎊</div>
          <h3 className="text-xl font-semibold mb-2 dark:text-gray-200">{t("review.session-complete")}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{t("review.session-complete-desc", { count: memos.length })}</p>
          <Button onClick={handleRefresh} startDecorator={<RefreshCwIcon className="w-4 h-4" />}>
            {t("review.start-new-session")}
          </Button>
        </motion.div>
      ) : (
        <>
          <div className="relative h-[480px] mb-4">
            <AnimatePresence mode="popLayout">
              {memos.slice(currentIndex, currentIndex + 2).map((memo, idx) => (
                <SwipeCard key={memo.name} memo={memo} isTop={idx === 0} onSwipeLeft={nextMemo} onSwipeRight={nextMemo} />
              ))}
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="outlined" color="neutral" onClick={prevMemo} disabled={currentIndex === 0} startDecorator={<ChevronLeftIcon className="w-5 h-5" />}>
              {t("review.previous")}
            </Button>
            <Button variant="solid" color="primary" onClick={nextMemo} endDecorator={<ChevronRightIcon className="w-5 h-5" />}>
              {t("review.next")}
            </Button>
          </div>
        </>
      )}

      <Drawer anchor="right" open={showSettings} onClose={() => setShowSettings(false)}>
        <Sheet sx={{ width: 320, p: 2 }}>
          <ModalClose />
          <Typography level="h4" sx={{ mb: 2 }}>
            {t("review.settings")}
          </Typography>

          <div className="space-y-4">
            <div>
              <Typography level="body-sm" sx={{ mb: 1 }}>
                {t("review.memos-per-session")}
              </Typography>
              <Input
                type="number"
                value={settings.pageSize}
                onChange={(e) => setSettings({ pageSize: parseInt(e.target.value) || 5 })}
                slotProps={{ input: { min: 1, max: 20 } }}
              />
            </div>

            <div>
              <Typography level="body-sm" sx={{ mb: 1 }}>
                {t("review.include-tags")}
              </Typography>
              <Input
                placeholder={t("review.tags-placeholder")}
                value={settings.includeTags.join(", ")}
                onChange={(e) => setSettings({ includeTags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
              />
            </div>

            <div>
              <Typography level="body-sm" sx={{ mb: 1 }}>
                {t("review.exclude-tags")}
              </Typography>
              <Input
                placeholder={t("review.tags-placeholder")}
                value={settings.excludeTags.join(", ")}
                onChange={(e) => setSettings({ excludeTags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
              />
            </div>

            <Button
              fullWidth
              onClick={() => {
                setShowSettings(false);
                fetchReviewMemos();
              }}
            >
              {t("review.apply-settings")}
            </Button>
          </div>
        </Sheet>
      </Drawer>
    </div>
  );
};

export default ReviewModule;
