import { Button } from "@mui/joy";
import { motion } from "motion/react";
import { RefreshCwIcon } from "lucide-react";
import { useEffect } from "react";
import MemoContent from "@/components/MemoContent";
import MemoResourceListView from "@/components/MemoResourceListView";
import { useReviewStore } from "@/store/v1/review";
import { useTranslate } from "@/utils/i18n";

const OnThisDayModule = () => {
  const t = useTranslate();
  const { onThisDayData, isLoading, fetchOnThisDayMemos } = useReviewStore();

  useEffect(() => {
    fetchOnThisDayMemos();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!onThisDayData || onThisDayData.groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-xl font-semibold mb-2 dark:text-gray-200">{t("review.no-memories-today")}</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{t("review.no-memories-today-desc")}</p>
        <Button onClick={fetchOnThisDayMemos} startDecorator={<RefreshCwIcon className="w-4 h-4" />}>
          {t("review.refresh")}
        </Button>
      </div>
    );
  }

  const now = new Date();
  const dateStr = `${now.getMonth() + 1}/${now.getDate()}`;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold dark:text-gray-200">{t("review.on-this-day-title", { date: dateStr })}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("review.on-this-day-desc")}</p>
      </div>

      {onThisDayData.groups
        .sort((a, b) => b.year - a.year)
        .map((group) => (
          <motion.div
            key={group.year}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden"
          >
            <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-700/50 border-b border-gray-200 dark:border-zinc-700">
              <span className="font-semibold dark:text-gray-200">{group.year}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                ({group.memos.length} {group.memos.length === 1 ? "memo" : "memos"})
              </span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-zinc-700">
              {group.memos.map((memo) => (
                <div key={memo.name} className="p-4">
                  <MemoContent memoName={memo.name} nodes={memo.nodes} />
                  {memo.resources.length > 0 && <MemoResourceListView resources={memo.resources} />}
                  {memo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {memo.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-zinc-700 rounded-full text-gray-600 dark:text-gray-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
    </div>
  );
};

export default OnThisDayModule;
