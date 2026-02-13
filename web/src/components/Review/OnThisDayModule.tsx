import { LoaderCircleIcon, SquarePenIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import MemoContent from "@/components/MemoContent";
import MemoResourceListView from "@/components/MemoResourceListView";
import StableMasonry from "@/components/Review/StableMasonry";
import useNavigateTo from "@/hooks/useNavigateTo";
import { useReviewStore } from "@/store/v1/review";
import { useTranslate } from "@/utils/i18n";

const OnThisDayModule = () => {
  const t = useTranslate();
  const navigateTo = useNavigateTo();
  const { onThisDayData, isOnThisDayLoading, isOnThisDayLoadingMore, fetchOnThisDayMemos, loadMoreOnThisDayMemos } = useReviewStore();

  useEffect(() => {
    fetchOnThisDayMemos();
  }, []);

  const sortedGroups = onThisDayData ? [...onThisDayData.groups].sort((a, b) => b.year - a.year) : [];
  const currentMemoCount = sortedGroups.reduce((sum, g) => sum + g.memos.length, 0);
  const hasMore = onThisDayData ? currentMemoCount < onThisDayData.totalCount : false;
  const isEmpty = !isOnThisDayLoading && (!onThisDayData || onThisDayData.groups.length === 0);

  return (
    <>
      {isOnThisDayLoading ? (
        <div className="flex items-center justify-center py-12">
          <motion.div
            className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
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
          <p className="text-zinc-400 dark:text-zinc-500 max-w-xs text-sm">{t("review.no-memories-today-desc")}</p>
        </div>
      ) : (
        <>
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
                      <div className="group/card relative bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/60 dark:border-zinc-700/50 overflow-hidden shadow-[0_1px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-none">
                        <div className="p-4">
                          <button
                            onClick={() => navigateTo(`/m/${memo.uid}?edit=true`, { state: { from: "/review" } })}
                            className="absolute top-2 right-2 z-10 p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors opacity-0 group-hover/card:opacity-100"
                          >
                            <SquarePenIcon className="w-3.5 h-3.5" />
                          </button>
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
                {isOnThisDayLoadingMore ? <LoaderCircleIcon className="w-5 h-5 animate-spin" /> : t("memo.show-more")}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default OnThisDayModule;
