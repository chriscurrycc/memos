import { RefreshCwIcon } from "lucide-react";
import { useReviewStore } from "@/store/v1/review";
import { useLocale, useTranslate } from "@/utils/i18n";

const OnThisDayToolbar = () => {
  const t = useTranslate();
  const locale = useLocale();
  const { isOnThisDayLoading, fetchOnThisDayMemos } = useReviewStore();

  const now = new Date();
  const dateStr = now.toLocaleDateString(locale, { month: "short", day: "numeric" });

  return (
    <div className="flex items-center justify-between pb-3">
      <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-200">{t("review.on-this-day-title", { date: dateStr })}</h3>
      <button
        onClick={() => fetchOnThisDayMemos(true)}
        disabled={isOnThisDayLoading}
        className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCwIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default OnThisDayToolbar;
