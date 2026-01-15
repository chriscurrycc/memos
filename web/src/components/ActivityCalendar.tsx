import { Tooltip } from "@mui/joy";
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
}

const HEATMAP_BUCKETS = [
  { max: 1, className: "bg-primary/55 dark:bg-primary" },
  { max: 3, className: "bg-primary/65 dark:bg-primary/90" },
  { max: 5, className: "bg-primary/75 dark:bg-primary/80" },
  { max: 10, className: "bg-primary/85 dark:bg-primary/70" },
  { max: 20, className: "bg-primary/90 dark:bg-primary/65" },
  { max: 50, className: "bg-primary/95 dark:bg-primary/60" },
  { max: Infinity, className: "bg-primary dark:bg-primary/55" },
];

const getCellAdditionalStyles = (count: number) => {
  if (count === 0) {
    return "";
  }
  return HEATMAP_BUCKETS.find((bucket) => count <= bucket.max)?.className || "";
};

const ActivityCalendar = (props: Props) => {
  const t = useTranslate();
  const { month: monthStr, data, onClick, getTooltipText } = props;
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
        const isSelected = dayjs(props.selectedDate).format("YYYY-MM-DD") === date;

        return (
          <Tooltip className="shrink-0" key={`${date}-${index}`} title={tooltipText} placement="top" arrow>
            <div
              className={cn(
                "w-6 h-6 text-xs rounded-xl flex justify-center items-center border cursor-default",
                "text-gray-400",
                item.isCurrentMonth ? getCellAdditionalStyles(count) : "opacity-60",
                item.isCurrentMonth && count > 0 && "text-gray-100",
                item.isCurrentMonth && isToday && "border-zinc-400",
                item.isCurrentMonth && isSelected && "font-bold border-zinc-400",
                item.isCurrentMonth && !isToday && !isSelected && "border-transparent",
                !item.isCurrentMonth && "border-transparent",
              )}
              onClick={() => count && onClick && onClick(date)}
            >
              {item.day}
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default ActivityCalendar;
