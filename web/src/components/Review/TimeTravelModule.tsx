import { ClockIcon, LoaderCircleIcon, SquarePenIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import MemoContent from "@/components/MemoContent";
import MemoResourceListView from "@/components/MemoResourceListView";
import StableMasonry from "@/components/Review/StableMasonry";
import useNavigateTo from "@/hooks/useNavigateTo";
import { useReviewStore } from "@/store/v1/review";
import { useLocale, useTranslate } from "@/utils/i18n";

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

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
  };

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
                ? t("review.no-time-travel-range", { start: formatDate(timeTravelPeriod.start), end: formatDate(timeTravelPeriod.end) })
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
                {formatDate(timeTravelPeriod.start)} — {formatDate(timeTravelPeriod.end)}
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
                <div className="group/card relative bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/60 dark:border-zinc-700/50 overflow-hidden shadow-[0_1px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-none">
                  <div className="p-4">
                    <button
                      onClick={() => navigateTo(`/m/${memo.uid}?edit=true`, { state: { from: "/review" } })}
                      className="absolute top-2 right-2 p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors opacity-0 group-hover/card:opacity-100"
                    >
                      <SquarePenIcon className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 dark:bg-teal-500/60" />
                      <span className="text-xs font-medium tracking-wide text-zinc-400 dark:text-zinc-500">
                        {memo.displayTime
                          ? new Date(memo.displayTime).toLocaleString(locale, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
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
                </div>
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
