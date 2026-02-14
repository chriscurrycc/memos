import { ClockIcon, LoaderCircleIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import StableMasonry from "@/components/Review/StableMasonry";
import useNavigateTo from "@/hooks/useNavigateTo";
import { useReviewStore } from "@/store/v1/review";
import { useLocale, useTranslate } from "@/utils/i18n";
import { formatMemoDate } from "@/utils/memo";
import ReviewMemoCard from "./ReviewMemoCard";

const TimeTravelModule = () => {
  const t = useTranslate();
  const locale = useLocale();
  const navigateTo = useNavigateTo();
  const {
    timeTravelMemos,
    timeTravelTotalCount,
    timeTravelPeriod,
    isTimeTravelLoading,
    isTimeTravelLoadingMore,
    loadMoreTimeTravelMemos,
    fetchTimeTravelMemos,
  } = useReviewStore();

  useEffect(() => {
    fetchTimeTravelMemos();
  }, []);

  const hasMore = timeTravelMemos.length < timeTravelTotalCount;

  return (
    <>
      {isTimeTravelLoading ? (
        <div className="flex items-center justify-center py-12">
          <motion.div
            className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : timeTravelMemos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/20 flex items-center justify-center mb-4">
              <ClockIcon className="w-8 h-8 text-teal-500 dark:text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold mb-1.5 text-zinc-700 dark:text-zinc-200">{t("review.no-time-travel")}</h3>
            <p className="text-zinc-400 dark:text-zinc-500 max-w-xs text-sm">
              {timeTravelPeriod.start && timeTravelPeriod.end
                ? t("review.no-time-travel-range", { start: timeTravelPeriod.start ? formatMemoDate(timeTravelPeriod.start, locale) : "", end: timeTravelPeriod.end ? formatMemoDate(timeTravelPeriod.end, locale) : "" })
                : t("review.no-time-travel-desc")}
            </p>
          </motion.div>
        </div>
      ) : (
        <>
          <div className="py-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
              <ClockIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 tabular-nums">
                {timeTravelPeriod.start ? formatMemoDate(timeTravelPeriod.start, locale) : ""} — {timeTravelPeriod.end ? formatMemoDate(timeTravelPeriod.end, locale) : ""}
              </span>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {timeTravelTotalCount} {timeTravelTotalCount === 1 ? "memo" : "memos"}
              </p>
            </div>
          </div>

          <StableMasonry
            items={timeTravelMemos.map((memo) => ({
              key: memo.name,
              node: (
                <ReviewMemoCard
                  memo={memo}
                  onEdit={(uid) => navigateTo(`/m/${uid}?edit=true`, { state: { from: "/review" } })}
                />
              ),
            }))}
          />
          {hasMore && (
            <div className="flex justify-center py-3">
              <button
                onClick={loadMoreTimeTravelMemos}
                disabled={isTimeTravelLoadingMore}
                className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors disabled:opacity-50"
              >
                {isTimeTravelLoadingMore ? <LoaderCircleIcon className="w-5 h-5 animate-spin" /> : t("memo.show-more")}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default TimeTravelModule;
