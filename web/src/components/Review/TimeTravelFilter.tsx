import { RefreshCwIcon, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useReviewStore } from "@/store/v1/review";
import { useTranslate } from "@/utils/i18n";

const toDateInputValue = (date: Date | null) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const TimeTravelFilter = () => {
  const t = useTranslate();
  const { timeTravelPeriod, fetchTimeTravelMemos, setTimeTravelPeriod } = useReviewStore();
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");

  useEffect(() => {
    setStartInput(toDateInputValue(timeTravelPeriod.start));
    setEndInput(toDateInputValue(timeTravelPeriod.end));
  }, [timeTravelPeriod.start, timeTravelPeriod.end]);

  const handleSearch = () => {
    const start = startInput ? new Date(startInput + "T00:00:00") : undefined;
    const end = endInput ? new Date(endInput + "T23:59:59") : undefined;
    fetchTimeTravelMemos({ periodStart: start, periodEnd: end });
  };

  const handleRandom = () => {
    fetchTimeTravelMemos({ force: true });
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

  return (
    <div className="mt-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/50">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2 flex-1">
            <input
              type="date"
              value={startInput}
              max={endInput || undefined}
              onChange={(e) => handleStartChange(e.target.value)}
              className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:focus:ring-teal-500/20"
            />
            <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">—</span>
            <input
              type="date"
              value={endInput}
              min={startInput || undefined}
              onChange={(e) => handleEndChange(e.target.value)}
              className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:focus:ring-teal-500/20"
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
  );
};

export default TimeTravelFilter;
