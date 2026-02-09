import { motion } from "motion/react";
import { RefreshCwIcon, ClockIcon } from "lucide-react";
import { useEffect } from "react";
import MemoContent from "@/components/MemoContent";
import MemoResourceListView from "@/components/MemoResourceListView";
import { useReviewStore } from "@/store/v1/review";
import { useTranslate } from "@/utils/i18n";

const TimeTravelModule = () => {
  const t = useTranslate();
  const { timeTravelMemos, timeTravelPeriod, isTimeTravelLoading, fetchTimeTravelMemos } = useReviewStore();

  useEffect(() => {
    fetchTimeTravelMemos();
  }, []);

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  if (isTimeTravelLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (timeTravelMemos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/20 flex items-center justify-center mb-4">
            <ClockIcon className="w-8 h-8 text-teal-500 dark:text-teal-400" />
          </div>
          <h3 className="text-lg font-semibold mb-1.5 text-zinc-700 dark:text-zinc-200">{t("review.no-time-travel")}</h3>
          <p className="text-zinc-400 dark:text-zinc-500 mb-4 max-w-xs text-sm">{t("review.no-time-travel-desc")}</p>
          <button
            onClick={fetchTimeTravelMemos}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <RefreshCwIcon className="w-4 h-4" />
            {t("review.try-again")}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* Period header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/50"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
            <ClockIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 tabular-nums">
              {formatDate(timeTravelPeriod.start)} — {formatDate(timeTravelPeriod.end)}
            </span>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {timeTravelMemos.length} {timeTravelMemos.length === 1 ? "memo" : "memos"}
            </p>
          </div>
        </div>
        <button
          onClick={fetchTimeTravelMemos}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-zinc-800/80 text-teal-600 dark:text-teal-400 text-xs font-medium hover:bg-white dark:hover:bg-zinc-800 transition-colors border border-zinc-200/50 dark:border-zinc-700/30 shrink-0"
        >
          <RefreshCwIcon className="w-3 h-3" />
          {t("review.travel-again")}
        </button>
      </motion.div>

      <div className="columns-1 lg:columns-2 gap-3">
        {timeTravelMemos.map((memo, index) => (
          <motion.div
            key={memo.name}
            className="break-inside-avoid mb-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/60 dark:border-zinc-700/50 overflow-hidden shadow-[0_1px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-none">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 dark:bg-teal-500/60" />
                  <span className="text-xs font-medium tracking-wide text-zinc-400 dark:text-zinc-500">
                    {memo.displayTime ? new Date(memo.displayTime).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
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
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TimeTravelModule;
