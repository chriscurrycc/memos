import Tooltip from "@/components/kit/Tooltip";
import clsx from "clsx";
import dayjs from "dayjs";
import { useWorkspaceSettingStore } from "@/store/v1";
import { WorkspaceGeneralSetting } from "@/types/proto/api/v1/workspace_setting_service";
import { WorkspaceSettingKey } from "@/types/proto/store/workspace_setting";
import { useTranslate } from "@/utils/i18n";
import { cn } from "@/utils/utils";

interface Props {
  month: string; // Format: 2021-1
  selectedDate: string;
  data: Record<string, number>;
  onClick?: (date: string) => void;
  getTooltipText?: (date: string, count: number) => string;
  hideNonCurrentMonth?: boolean;
}

const HEATMAP_BUCKETS = [
  { max: 3, className: "bg-heatmap-1 dark:bg-heatmap-1-dark text-teal-700 dark:text-teal-300" },
  { max: 10, className: "bg-heatmap-2 dark:bg-heatmap-2-dark text-teal-800 dark:text-teal-100" },
  { max: Infinity, className: "bg-heatmap-3 dark:bg-heatmap-3-dark text-white dark:text-white" },
];

const getCellAdditionalStyles = (count: number) => {
  if (count === 0) {
    return "";
  }
  return HEATMAP_BUCKETS.find((bucket) => count <= bucket.max)?.className || "";
};

const ActivityCalendar = (props: Props) => {
  const t = useTranslate();
  const { month: monthStr, data, onClick, getTooltipText, hideNonCurrentMonth } = props;
  const workspaceSettingStore = useWorkspaceSettingStore();
  const weekStartDayOffset = (
    workspaceSettingStore.getWorkspaceSettingByKey(WorkspaceSettingKey.GENERAL).generalSetting || WorkspaceGeneralSetting.fromPartial({})
  ).weekStartDayOffset;

  const year = dayjs(monthStr).toDate().getFullYear();
  const month = dayjs(monthStr).toDate().getMonth();
  const dayInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (((new Date(year, month, 1).getDay() - weekStartDayOffset) % 7) + 7) % 7;
  const lastDay = new Date(year, month, dayInMonth).getDay() - weekStartDayOffset;
  const prevMonthDays = new Date(year, month, 0).getDate();

  const WEEK_DAYS = [t("days.sun"), t("days.mon"), t("days.tue"), t("days.wed"), t("days.thu"), t("days.fri"), t("days.sat")];
  const weekDays = WEEK_DAYS.slice(weekStartDayOffset).concat(WEEK_DAYS.slice(0, weekStartDayOffset));
  const days = [];

  // Fill in previous month's days.
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }

  // Fill in current month's days.
  for (let i = 1; i <= dayInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true });
  }

  // Fill in next month's days.
  for (let i = 1; i < 7 - lastDay; i++) {
    days.push({ day: i, isCurrentMonth: false });
  }

  return (
    <div className={clsx("w-full h-auto shrink-0 grid grid-cols-7 grid-flow-row gap-1")}>
      {weekDays.map((day, index) => (
        <div key={index} className={clsx("w-6 h-5 text-xs flex justify-center items-center cursor-default opacity-60")}>
          {day}
        </div>
      ))}
      {days.map((item, index) => {
        const date = dayjs(`${year}-${month + 1}-${item.day}`).format("YYYY-MM-DD");
        const count = item.isCurrentMonth ? data[date] || 0 : 0;
        const isToday = dayjs().format("YYYY-MM-DD") === date;
        const tooltipText = getTooltipText
          ? getTooltipText(date, count)
          : count
            ? t("memo.count-memos-in-date", { count: count, date: date })
            : date;

        if (hideNonCurrentMonth && !item.isCurrentMonth) {
          return <div key={`${date}-${index}`} className="w-6 h-6" />;
        }

        const cellContent = (
          <div
            className={cn(
              "w-6 h-6 text-xs rounded-xl flex flex-col justify-center items-center relative",
              "text-gray-400",
              item.isCurrentMonth ? getCellAdditionalStyles(count) : "opacity-60",
              count > 0 ? "cursor-pointer" : "cursor-default",
            )}
            onClick={() => count && onClick && onClick(date)}
          >
            {item.day}
            {item.isCurrentMonth && isToday && <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary dark:bg-primary" />}
          </div>
        );

        if (count > 0) {
          return (
            <Tooltip className="shrink-0" key={`${date}-${index}`} title={tooltipText} placement="top" arrow>
              {cellContent}
            </Tooltip>
          );
        }

        return (
          <div key={`${date}-${index}`} className="shrink-0">
            {cellContent}
          </div>
        );
      })}
    </div>
  );
};

export default ActivityCalendar;
