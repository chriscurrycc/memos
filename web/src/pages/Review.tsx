import clsx from "clsx";
import { BookOpenIcon, CalendarHeartIcon, CompassIcon, SparklesIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import MobileHeader from "@/components/MobileHeader";
import OnThisDayModule from "@/components/Review/OnThisDayModule";
import ReviewModule from "@/components/Review/ReviewModule";
import SurpriseModule from "@/components/Review/SurpriseModule";
import TimeTravelFilter from "@/components/Review/TimeTravelFilter";
import TimeTravelModule from "@/components/Review/TimeTravelModule";
import useResponsiveWidth from "@/hooks/useResponsiveWidth";
import { useReviewStore, ReviewTab } from "@/store/v1/review";
import { Translations, useTranslate } from "@/utils/i18n";

const tabs: { key: ReviewTab; icon: typeof BookOpenIcon; labelKey: Translations; mobileOnly?: boolean }[] = [
  { key: "review", icon: BookOpenIcon, labelKey: "review.tab-review" },
  { key: "on-this-day", icon: CalendarHeartIcon, labelKey: "review.tab-on-this-day" },
  { key: "time-travel", icon: CompassIcon, labelKey: "review.tab-time-travel" },
  { key: "surprise", icon: SparklesIcon, labelKey: "review.tab-surprise", mobileOnly: true },
];

const Review = () => {
  const t = useTranslate();
  const { md } = useResponsiveWidth();
  const { activeTab, setActiveTab, stats, fetchStats, loadSettings } = useReviewStore();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    loadSettings();
    fetchStats();
  }, []);

  useEffect(() => {
    const idx = tabs.findIndex((tab) => tab.key === activeTab);
    if (idx === -1) {
      setActiveTab("review");
      return;
    }
    const el = tabRefs.current[idx];
    if (el && el.offsetWidth > 0) {
      setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth });
    } else if (tabs[idx].mobileOnly) {
      setActiveTab("review");
    }
  }, [activeTab]);

  const titleSection = (
    <motion.div
      className="w-full mb-4"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">{t("review.title")}</h2>
      {stats && (
        <p className="mt-0.5 text-sm text-zinc-400 dark:text-zinc-500 tracking-wide">
          {t("review.stats-available", { count: stats.availableForReview })}
        </p>
      )}
    </motion.div>
  );

  const tabBar = (
    <div className="relative mb-4">
      <div className="flex gap-1 p-1 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 backdrop-blur-sm overflow-x-auto scrollbar-hide">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              ref={(el) => (tabRefs.current[idx] = el)}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                "relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap flex-1 justify-center min-w-0",
                isActive
                  ? "text-zinc-800 dark:text-zinc-100"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300",
                tab.mobileOnly && "lg:hidden",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{t(tab.labelKey)}</span>
            </button>
          );
        })}
        <motion.div
          className="absolute bottom-1 h-[calc(100%-8px)] rounded-lg bg-white dark:bg-zinc-700 shadow-sm"
          animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          style={{ zIndex: 0 }}
        />
      </div>
    </div>
  );

  const tabPanels: { key: ReviewTab; component: React.ReactNode; className?: string }[] = [
    { key: "review", component: <ReviewModule /> },
    { key: "on-this-day", component: <OnThisDayModule /> },
    { key: "time-travel", component: <TimeTravelModule /> },
    { key: "surprise", component: <SurpriseModule />, className: "lg:hidden" },
  ];

  const tabContent = (
    <>
      {tabPanels
        .filter(({ key }) => activeTab === key)
        .map(({ key, component, className }) => (
          <div key={key} className={clsx("overflow-y-auto h-full px-4 md:px-0", className)}>
            {component}
          </div>
        ))}
    </>
  );

  if (!md) {
    // Mobile: sticky header + section scrolls
    return (
      <section className="@container w-full h-screen overflow-y-auto pb-4">
        <div className="sticky top-0 z-10 bg-zinc-100 dark:bg-zinc-900 pb-2">
          <MobileHeader
            title={t("review.title")}
            subTitle={stats ? t("review.stats-available", { count: stats.availableForReview }) : undefined}
          />
          <div className="px-4">
            {tabBar}
            {activeTab === "time-travel" && <TimeTravelFilter />}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{tabContent}</div>
      </section>
    );
  }

  // Desktop: static layout, grid with sidebar
  return (
    <section className="@container w-full h-screen flex flex-col justify-start items-center pt-4 pb-4">
      <div className="w-full h-full px-6 flex flex-col">
        {titleSection}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_400px] gap-4 lg:gap-6 items-start">
          <div className="h-full flex flex-col overflow-y-auto">
            {tabBar}
            {activeTab === "time-travel" && (
              <div className="mb-4">
                <TimeTravelFilter />
              </div>
            )}
            <div className="flex-1 overflow-y-scroll">{tabContent}</div>
          </div>
          <div className="hidden lg:block">
            <SurpriseModule />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Review;
