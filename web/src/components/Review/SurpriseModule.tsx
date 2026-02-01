import { Button } from "@mui/joy";
import { motion } from "motion/react";
import { DicesIcon, RefreshCwIcon } from "lucide-react";
import { useEffect } from "react";
import MemoContent from "@/components/MemoContent";
import MemoResourceListView from "@/components/MemoResourceListView";
import { useReviewStore } from "@/store/v1/review";
import { ReviewSource } from "@/types/proto/api/v1/review_service";
import { useTranslate } from "@/utils/i18n";

const SurpriseModule = () => {
  const t = useTranslate();
  const { surpriseMemo, isLoading, fetchSurpriseMemo, recordReview } = useReviewStore();

  useEffect(() => {
    fetchSurpriseMemo();
  }, []);

  const handleSurprise = async () => {
    if (surpriseMemo) {
      await recordReview(ReviewSource.REVIEW_SOURCE_SURPRISE);
    }
    fetchSurpriseMemo();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!surpriseMemo) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-6xl mb-4">🎲</div>
        <h3 className="text-xl font-semibold mb-2 dark:text-gray-200">{t("review.no-surprise")}</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{t("review.no-surprise-desc")}</p>
        <Button onClick={fetchSurpriseMemo} startDecorator={<RefreshCwIcon className="w-4 h-4" />}>
          {t("review.try-again")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <DicesIcon className="w-12 h-12 mx-auto text-purple-500 mb-2" />
        <h3 className="text-lg font-semibold dark:text-gray-200">{t("review.surprise-title")}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("review.surprise-desc")}</p>
      </div>

      <motion.div
        key={surpriseMemo.name}
        initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 p-6"
      >
        <div className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          {surpriseMemo.displayTime ? new Date(surpriseMemo.displayTime).toLocaleString() : ""}
        </div>
        <MemoContent memoName={surpriseMemo.name} nodes={surpriseMemo.nodes} />
        {surpriseMemo.resources.length > 0 && <MemoResourceListView resources={surpriseMemo.resources} />}
        {surpriseMemo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {surpriseMemo.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 bg-gray-100 dark:bg-zinc-700 rounded-full text-gray-600 dark:text-gray-300">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      <div className="flex justify-center mt-6">
        <Button onClick={handleSurprise} startDecorator={<DicesIcon className="w-5 h-5" />} size="lg" color="primary">
          {t("review.another-surprise")}
        </Button>
      </div>
    </div>
  );
};

export default SurpriseModule;
