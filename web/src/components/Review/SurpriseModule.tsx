import { DicesIcon, RefreshCwIcon, SparklesIcon, SquarePenIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";
import MemoContent from "@/components/MemoContent";
import MemoResourceListView from "@/components/MemoResourceListView";
import useNavigateTo from "@/hooks/useNavigateTo";
import { useReviewStore } from "@/store/v1/review";
import { useLocale, useTranslate } from "@/utils/i18n";

const SurpriseModule = () => {
  const t = useTranslate();
  const locale = useLocale();
  const navigateTo = useNavigateTo();
  const { surpriseMemo, isSurpriseLoading, fetchSurpriseMemo } = useReviewStore();

  useEffect(() => {
    fetchSurpriseMemo();
  }, []);

  if (isSurpriseLoading) {
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

  if (!surpriseMemo) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/20 flex items-center justify-center mb-4">
            <DicesIcon className="w-8 h-8 text-teal-500 dark:text-teal-400" />
          </div>
          <h3 className="text-lg font-semibold mb-1.5 text-zinc-700 dark:text-zinc-200">{t("review.no-surprise")}</h3>
          <p className="text-zinc-400 dark:text-zinc-500 mb-4 max-w-xs text-sm">{t("review.no-surprise-desc")}</p>
          <button
            onClick={() => fetchSurpriseMemo(true)}
            disabled={isSurpriseLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCwIcon className="w-4 h-4" />
            {t("review.try-again")}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <motion.div className="text-center" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/20 border border-teal-100/60 dark:border-teal-800/30 mb-1.5">
          <SparklesIcon className="w-3 h-3 text-teal-500 dark:text-teal-400" />
          <span className="text-xs font-medium text-teal-600 dark:text-teal-400">{t("review.surprise-title")}</span>
        </div>
        <p className="text-sm text-zinc-400 dark:text-zinc-500">{t("review.surprise-desc")}</p>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={surpriseMemo.name}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -8 }}
          transition={{ type: "spring", stiffness: 240, damping: 24 }}
          className="group/card relative bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/60 dark:border-zinc-700/50 overflow-hidden shadow-[0_1px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-none"
        >
          <div className="h-0.5 w-full bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 dark:from-teal-500/40 dark:via-emerald-500/40 dark:to-cyan-500/40" />
          <div className="p-4">
            <button
              onClick={() => navigateTo(`/m/${surpriseMemo.uid}?edit=true`, { state: { from: "/review" } })}
              className="absolute top-3 right-2 p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors opacity-0 group-hover/card:opacity-100"
            >
              <SquarePenIcon className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 dark:bg-teal-500/60" />
              <span className="text-xs font-medium tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
                {surpriseMemo.displayTime
                  ? new Date(surpriseMemo.displayTime).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })
                  : ""}
              </span>
            </div>
            <MemoContent memoName={surpriseMemo.name} nodes={surpriseMemo.nodes} />
            {surpriseMemo.resources.length > 0 && (
              <div className="mt-2">
                <MemoResourceListView resources={surpriseMemo.resources} />
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center">
        <button
          onClick={() => fetchSurpriseMemo(true)}
          disabled={isSurpriseLoading}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DicesIcon className="w-4 h-4" />
          {t("review.another-surprise")}
        </button>
      </div>
    </div>
  );
};

export default SurpriseModule;
