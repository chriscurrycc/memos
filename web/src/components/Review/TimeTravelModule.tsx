import { Button } from "@mui/joy";
import { motion } from "motion/react";
import { RefreshCwIcon, ClockIcon } from "lucide-react";
import { useEffect } from "react";
import MemoContent from "@/components/MemoContent";
import MemoResourceListView from "@/components/MemoResourceListView";
import { useReviewStore } from "@/store/v1/review";
import { useTranslate } from "@/utils/i18n";

const TimeTravelModule = () => {
  const t = useTranslate();
  const { timeTravelMemos, timeTravelPeriod, isLoading, fetchTimeTravelMemos } = useReviewStore();

  useEffect(() => {
    fetchTimeTravelMemos();
  }, []);

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (timeTravelMemos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-6xl mb-4">🕰️</div>
        <h3 className="text-xl font-semibold mb-2 dark:text-gray-200">{t("review.no-time-travel")}</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{t("review.no-time-travel-desc")}</p>
        <Button onClick={fetchTimeTravelMemos} startDecorator={<RefreshCwIcon className="w-4 h-4" />}>
          {t("review.try-again")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(timeTravelPeriod.start)} - {formatDate(timeTravelPeriod.end)}
          </span>
        </div>
        <Button variant="outlined" size="sm" onClick={fetchTimeTravelMemos} startDecorator={<RefreshCwIcon className="w-4 h-4" />}>
          {t("review.travel-again")}
        </Button>
      </div>

      <div className="space-y-4">
        {timeTravelMemos.map((memo, index) => (
          <motion.div
            key={memo.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 p-4"
          >
            <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">
              {memo.displayTime ? new Date(memo.displayTime).toLocaleString() : ""}
            </div>
            <MemoContent memoName={memo.name} nodes={memo.nodes} />
            {memo.resources.length > 0 && <MemoResourceListView resources={memo.resources} />}
            {memo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {memo.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 bg-gray-100 dark:bg-zinc-700 rounded-full text-gray-600 dark:text-gray-300">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TimeTravelModule;
