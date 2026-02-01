import { Button, Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { useEffect } from "react";
import MobileHeader from "@/components/MobileHeader";
import OnThisDayModule from "@/components/Review/OnThisDayModule";
import ReviewModule from "@/components/Review/ReviewModule";
import SurpriseModule from "@/components/Review/SurpriseModule";
import TimeTravelModule from "@/components/Review/TimeTravelModule";
import { useReviewStore, ReviewTab } from "@/store/v1/review";
import { useTranslate } from "@/utils/i18n";

const Review = () => {
  const t = useTranslate();
  const { activeTab, setActiveTab, stats, fetchStats } = useReviewStore();

  useEffect(() => {
    fetchStats();
  }, []);

  const handleTabChange = (_: React.SyntheticEvent | null, value: string | number | null) => {
    if (value) {
      setActiveTab(value as ReviewTab);
    }
  };

  return (
    <section className="@container w-full max-w-5xl min-h-full flex flex-col justify-start items-center sm:pt-3 md:pt-6 pb-8">
      <MobileHeader />
      <div className="w-full px-4">
        <div className="w-full flex flex-row justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t("review.title")}</h2>
          {stats && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t("review.stats-available", { count: stats.availableForReview })}
            </div>
          )}
        </div>

        <Tabs value={activeTab} onChange={handleTabChange} className="w-full">
          <TabList className="mb-4">
            <Tab value="review">{t("review.tab-review")}</Tab>
            <Tab value="on-this-day">{t("review.tab-on-this-day")}</Tab>
            <Tab value="time-travel">{t("review.tab-time-travel")}</Tab>
            <Tab value="surprise">{t("review.tab-surprise")}</Tab>
          </TabList>

          <TabPanel value="review" className="p-0">
            <ReviewModule />
          </TabPanel>

          <TabPanel value="on-this-day" className="p-0">
            <OnThisDayModule />
          </TabPanel>

          <TabPanel value="time-travel" className="p-0">
            <TimeTravelModule />
          </TabPanel>

          <TabPanel value="surprise" className="p-0">
            <SurpriseModule />
          </TabPanel>
        </Tabs>
      </div>
    </section>
  );
};

export default Review;
