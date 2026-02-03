import { Divider, Drawer, Skeleton } from "@mui/joy";
import Tooltip from "@/components/kit/Tooltip";
import clsx from "clsx";
import dayjs from "dayjs";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Code2Icon,
  LinkIcon,
  ListTodoIcon,
  RotateCcwIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import i18n from "@/i18n";
import { useMemoFilterStore, useMemoMetadataInitialized, useMemoMetadataStore } from "@/store/v1";
import { useTranslate } from "@/utils/i18n";
import ActivityCalendar from "./ActivityCalendar";

const UserStatisticsViewSkeleton = () => {
  return (
    <div className="w-full border mt-2 py-2 px-3 rounded-lg space-y-2 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800">
      <Skeleton variant="text" level="body-sm" width={100} />
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" width="100%" height={16} />
        ))}
      </div>
      <Skeleton variant="text" level="body-xs" width={120} />
      <Divider className="!my-2 opacity-50" />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width={48} height={24} />
        <Skeleton variant="rectangular" width={48} height={24} />
        <Skeleton variant="rectangular" width={48} height={24} />
      </div>
    </div>
  );
};

interface Props {
  onCloseHomeSidebarDrawer?: () => void;
}

const UserStatisticsView = ({ onCloseHomeSidebarDrawer }: Props) => {
  const t = useTranslate();
  const memoFilterStore = useMemoFilterStore();
  const memoMetadataStore = useMemoMetadataStore();
  const initialized = useMemoMetadataInitialized();
  const { stats: memoStats, activityStats, memoCount: memoAmount, days } = memoMetadataStore.getState();
  const [selectedDate] = useState(new Date());
  const [visibleMonthString, setVisibleMonthString] = useState(dayjs(selectedDate.toDateString()).format("YYYY-MM"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const currentMonth = dayjs().startOf("month");
  const visibleMonth = dayjs(visibleMonthString).startOf("month");
  const isNextMonthDisabled = !visibleMonth.isBefore(currentMonth);
  const yearRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Group activity data by month and year
  const monthsWithData = Object.keys(activityStats).reduce(
    (acc, date) => {
      const month = dayjs(date).format("YYYY-MM");
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += activityStats[date];
      return acc;
    },
    {} as Record<string, number>,
  );

  // Get unique years from data, sorted descending
  const yearsWithData = [...new Set(Object.keys(monthsWithData).map((m) => dayjs(m).year()))].sort((a, b) => b - a);

  // Get months with data for a specific year, sorted descending
  const getMonthsForYear = (year: number) => {
    return Object.keys(monthsWithData)
      .filter((m) => dayjs(m).year() === year)
      .sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf());
  };

  const scrollToYear = (year: number) => {
    yearRefs.current[year]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleMonthSelect = (month: string) => {
    setVisibleMonthString(month);
    setDrawerOpen(false);
  };

  const onCalendarClick = (date: string) => {
    memoFilterStore.removeFilter((f) => f.factor === "displayTime");
    memoFilterStore.addFilter({ factor: "displayTime", value: date });
    onCloseHomeSidebarDrawer?.();
  };

  if (!initialized) {
    return <UserStatisticsViewSkeleton />;
  }

  return (
    <div className="group w-full border mt-2 py-2 px-3 rounded-lg space-y-0.5 text-gray-500 dark:text-gray-400 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800">
      <div className="w-full mb-1 flex flex-row justify-between items-center gap-1">
        <div className="flex items-center gap-1">
          <div
            className="relative text-sm font-medium inline-flex flex-row items-center w-auto dark:text-gray-400 truncate cursor-pointer hover:opacity-80"
            onClick={() => setDrawerOpen(true)}
          >
            <CalendarDaysIcon className="w-4 h-auto mr-1 opacity-60 shrink-0" strokeWidth={1.5} />
            <span className="truncate">
              {dayjs(visibleMonthString).toDate().toLocaleString(i18n.language, { year: "numeric", month: "short" })}
            </span>
          </div>
          {visibleMonthString !== currentMonth.format("YYYY-MM") && (
            <Tooltip title={t("calendar.back-to-current-month")} placement="top" arrow>
              <span className="cursor-pointer hover:opacity-80" onClick={() => setVisibleMonthString(currentMonth.format("YYYY-MM"))}>
                <RotateCcwIcon className="w-3.5 h-auto shrink-0 opacity-60" />
              </span>
            </Tooltip>
          )}
        </div>
        <div className="flex justify-end items-center shrink-0 gap-0.5">
          <span
            className="cursor-pointer hover:opacity-80"
            onClick={() => setVisibleMonthString(dayjs(visibleMonthString).subtract(1, "month").format("YYYY-MM"))}
          >
            <ChevronLeftIcon className="w-4 h-auto shrink-0 opacity-60" />
          </span>
          <span
            className={clsx(isNextMonthDisabled ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:opacity-80")}
            onClick={() => {
              const nextMonth = visibleMonth.add(1, "month");
              if (nextMonth.isAfter(currentMonth)) {
                return;
              }
              setVisibleMonthString(nextMonth.format("YYYY-MM"));
            }}
          >
            <ChevronRightIcon className="w-4 h-auto shrink-0 opacity-60" />
          </span>
        </div>
      </div>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          content: {
            sx: { width: "min(90vw, 1200px)" },
          },
        }}
      >
        <div className="w-full h-full flex flex-col bg-white dark:bg-zinc-900">
          <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b dark:border-zinc-700 p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {yearsWithData.map((year) => {
                const isSelected = visibleMonth.year() === year;
                return (
                  <button
                    key={year}
                    onClick={() => scrollToYear(year)}
                    className={clsx(
                      "px-2 py-1 text-xs rounded-md transition-colors",
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700",
                    )}
                  >
                    {year}
                  </button>
                );
              })}
              {visibleMonthString !== currentMonth.format("YYYY-MM") && (
                <Tooltip title={t("calendar.back-to-current-month")} placement="top" arrow>
                  <button
                    onClick={() => handleMonthSelect(currentMonth.format("YYYY-MM"))}
                    className="p-1 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <RotateCcwIcon className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4">
            {yearsWithData.map((year) => {
              const yearMemoCount = getMonthsForYear(year).reduce((sum, m) => sum + monthsWithData[m], 0);
              return (
                <div key={year} ref={(el) => (yearRefs.current[year] = el)} className="mb-3">
                  <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 p-4 -mx-4 flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{year}</span>
                    <span className="text-xs text-gray-400">({yearMemoCount} memos)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {getMonthsForYear(year).map((month) => {
                      const isSelected = visibleMonthString === month;
                      const monthLabel = dayjs(month).toDate().toLocaleString(i18n.language, { month: "short" });
                      const count = monthsWithData[month];
                      return (
                        <div
                          key={month}
                          onClick={() => handleMonthSelect(month)}
                          className={clsx(
                            "p-3 rounded-lg cursor-pointer transition-colors border min-w-[200px]",
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800",
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{monthLabel}</span>
                            <span className="text-xs text-gray-400">{count} memos</span>
                          </div>
                          <ActivityCalendar
                            month={month}
                            selectedDate={selectedDate.toDateString()}
                            data={activityStats}
                            hideNonCurrentMonth
                            onClick={(date) => {
                              onCalendarClick(date);
                              setDrawerOpen(false);
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Drawer>

      <div className="w-full">
        <ActivityCalendar
          month={visibleMonthString}
          selectedDate={selectedDate.toDateString()}
          data={activityStats}
          onClick={onCalendarClick}
        />
        {memoAmount === 0 ? (
          <p className="mt-1 w-full text-xs italic opacity-80">No memos</p>
        ) : memoAmount === 1 ? (
          <p className="mt-1 w-full text-xs italic opacity-80">
            <span>{memoAmount}</span> memo in <span>{days}</span> {days > 1 ? "days" : "day"}
          </p>
        ) : (
          <p className="mt-1 w-full text-xs italic opacity-80">
            <span>{memoAmount}</span> memos in <span>{days}</span> {days > 1 ? "days" : "day"}
          </p>
        )}
      </div>
      <Divider className="!my-2 opacity-50" />
      <div className="w-full flex flex-row justify-start items-center gap-x-2 gap-y-1 flex-wrap">
        <div
          className={clsx("w-auto border dark:border-zinc-800 pl-1 pr-1.5 rounded-md flex justify-between items-center")}
          onClick={() => memoFilterStore.addFilter({ factor: "property.hasLink", value: "" })}
        >
          <div className="w-auto flex justify-start items-center mr-1">
            <LinkIcon className="w-4 h-auto mr-1" />
          </div>
          <Tooltip title={t("memo.links")} placement="top" arrow>
            <span className="text-sm truncate">{memoStats.link}</span>
          </Tooltip>
        </div>
        <div
          className={clsx("w-auto border dark:border-zinc-800 pl-1 pr-1.5 rounded-md flex justify-between items-center")}
          onClick={() => memoFilterStore.addFilter({ factor: "property.hasTaskList", value: "" })}
        >
          <div className="w-auto flex justify-start items-center mr-1">
            {memoStats.incompleteTasks > 0 ? <ListTodoIcon className="w-4 h-auto mr-1" /> : <CheckCircleIcon className="w-4 h-auto mr-1" />}
          </div>
          {memoStats.incompleteTasks > 0 ? (
            <Tooltip title={t("memo.to-do")} placement="top" arrow>
              <div className="text-sm flex flex-row items-start justify-center">
                <span className="truncate">{memoStats.taskList - memoStats.incompleteTasks}</span>
                <span className="font-mono opacity-50">/</span>
                <span className="truncate">{memoStats.taskList}</span>
              </div>
            </Tooltip>
          ) : (
            <Tooltip title={t("memo.to-do")} placement="top" arrow>
              <span className="text-sm truncate">{memoStats.taskList}</span>
            </Tooltip>
          )}
        </div>
        <div
          className={clsx("w-auto border dark:border-zinc-800 pl-1 pr-1.5 rounded-md flex justify-between items-center")}
          onClick={() => memoFilterStore.addFilter({ factor: "property.hasCode", value: "" })}
        >
          <div className="w-auto flex justify-start items-center mr-1">
            <Code2Icon className="w-4 h-auto mr-1" />
          </div>
          <Tooltip title={t("memo.code")} placement="top" arrow>
            <span className="text-sm truncate">{memoStats.code}</span>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default UserStatisticsView;
