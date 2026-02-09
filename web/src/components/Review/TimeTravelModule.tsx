import { motion } from "motion/react";
import { RefreshCwIcon, ClockIcon, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import MemoContent from "@/components/MemoContent";
import MemoResourceListView from "@/components/MemoResourceListView";
import StableMasonry from "@/components/Review/StableMasonry";
import { useReviewStore } from "@/store/v1/review";
import { useTranslate } from "@/utils/i18n";

const toDateInputValue = (date: Date | null) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const TimeTravelModule = () => {
  const t = useTranslate();
  const {
    timeTravelMemos,
    timeTravelTotalCount,
    timeTravelPeriod,
    isTimeTravelLoading,
    isTimeTravelLoadingMore,
    fetchTimeTravelMemos,
    loadMoreTimeTravelMemos,
    setTimeTravelPeriod,
  } = useReviewStore();
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");

  useEffect(() => {
    fetchTimeTravelMemos();
  }, []);

  useEffect(() => {
    setStartInput(toDateInputValue(timeTravelPeriod.start));
    setEndInput(toDateInputValue(timeTravelPeriod.end));
  }, [timeTravelPeriod.start, timeTravelPeriod.end]);

  const hasMore = timeTravelMemos.length < timeTravelTotalCount;

  const handleSearch = () => {
    const start = startInput ? new Date(startInput + "T00:00:00") : undefined;
    const end = endInput ? new Date(endInput + "T23:59:59") : undefined;
    fetchTimeTravelMemos(start, end);
  };

  const handleRandom = () => {
    fetchTimeTravelMemos();
  };

  const handleStartChange = (value: string) => {
    setStartInput(value);
    if (value) {
      setTimeTravelPeriod({ ...timeTravelPeriod, start: new Date(value + "T00:00:00") });
    }
  };

  const handleEndChange = (value: string) => {
    setEndInput(value);
    if (value) {
      setTimeTravelPeriod({ ...timeTravelPeriod, end: new Date(value + "T23:59:59") });
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div>
      {/* Date picker header */}
      <div className="mb-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/50">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                {t("review.time-travel-start")}
              </label>
              <input
                type="date"
                value={startInput}
                onChange={(e) => handleStartChange(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                {t("review.time-travel-end")}
              </label>
              <input
                type="date"
                value={endInput}
                onChange={(e) => handleEndChange(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:focus:ring-teal-500/20"
              />
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleSearch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium transition-colors"
            >
              <SearchIcon className="w-3 h-3" />
              {t("review.time-travel-search")}
            </button>
            <button
              onClick={handleRandom}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 text-xs font-medium hover:bg-white dark:hover:bg-zinc-800 transition-colors border border-zinc-200/50 dark:border-zinc-700/30"
            >
              <RefreshCwIcon className="w-3 h-3" />
              {t("review.travel-again")}
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
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
                {startInput && endInput
                  ? t("review.no-time-travel-range", { start: formatDate(new Date(startInput)), end: formatDate(new Date(endInput)) })
                  : t("review.no-time-travel-desc")}
              </p>
            </motion.div>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center gap-2">
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
                  <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/60 dark:border-zinc-700/50 overflow-hidden shadow-[0_1px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-none">
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400 dark:bg-teal-500/60" />
                        <span className="text-xs font-medium tracking-wide text-zinc-400 dark:text-zinc-500">
                          {memo.displayTime
                            ? new Date(memo.displayTime).toLocaleString(undefined, {
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
                  {isTimeTravelLoadingMore ? "..." : t("memo.show-more")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TimeTravelModule;
