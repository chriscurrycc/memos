import { RefreshCwIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import MemoContent from "@/components/MemoContent";
import MemoResourceListView from "@/components/MemoResourceListView";
import StableMasonry from "@/components/Review/StableMasonry";
import { useReviewStore } from "@/store/v1/review";
import { useTranslate } from "@/utils/i18n";

const OnThisDayModule = () => {
  const t = useTranslate();
  const { onThisDayData, isOnThisDayLoading, isOnThisDayLoadingMore, fetchOnThisDayMemos, loadMoreOnThisDayMemos } = useReviewStore();

  useEffect(() => {
    fetchOnThisDayMemos();
  }, []);

  if (isOnThisDayLoading) {
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

  if (!onThisDayData || onThisDayData.groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/20 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-teal-500 dark:text-teal-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-1.5 text-zinc-700 dark:text-zinc-200">{t("review.no-memories-today")}</h3>
          <p className="text-zinc-400 dark:text-zinc-500 mb-4 max-w-xs text-sm">{t("review.no-memories-today-desc")}</p>
          <button
            onClick={fetchOnThisDayMemos}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <RefreshCwIcon className="w-4 h-4" />
            {t("review.refresh")}
          </button>
        </motion.div>
      </div>
    );
  }

  const now = new Date();
  const dateStr = `${now.getMonth() + 1}/${now.getDate()}`;

  const sortedGroups = [...onThisDayData.groups].sort((a, b) => b.year - a.year);
  const currentMemoCount = sortedGroups.reduce((sum, g) => sum + g.memos.length, 0);
  const hasMore = currentMemoCount < onThisDayData.totalCount;

  return (
    <div>
      <motion.div className="text-center mb-4" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">{t("review.on-this-day-title", { date: dateStr })}</h3>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">{t("review.on-this-day-desc")}</p>
      </motion.div>

      <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
        <div className="space-y-4">
          {sortedGroups.map((group, groupIdx) => (
            <motion.div
              key={group.year}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIdx * 0.08 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-bold text-zinc-300 dark:text-zinc-600 tabular-nums">{group.year}</span>
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                  {group.memos.length} {group.memos.length === 1 ? "memo" : "memos"}
                </span>
              </div>

              <StableMasonry
                items={group.memos.map((memo) => ({
                  key: memo.name,
                  node: (
                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/60 dark:border-zinc-700/50 p-4 shadow-[0_1px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-none">
                      <MemoContent memoName={memo.name} nodes={memo.nodes} />
                      {memo.resources.length > 0 && (
                        <div className="mt-2">
                          <MemoResourceListView resources={memo.resources} />
                        </div>
                      )}
                    </div>
                  ),
                }))}
              />
            </motion.div>
          ))}
        </div>
        {hasMore && (
          <div className="flex justify-center py-3">
            <button
              onClick={loadMoreOnThisDayMemos}
              disabled={isOnThisDayLoadingMore}
              className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors disabled:opacity-50"
            >
              {isOnThisDayLoadingMore ? "..." : t("memo.show-more")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnThisDayModule;
