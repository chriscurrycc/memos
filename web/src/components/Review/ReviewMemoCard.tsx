import clsx from "clsx";
import { SquarePenIcon } from "lucide-react";
import MemoContent from "@/components/MemoContent";
import MemoResourceListView from "@/components/MemoResourceListView";
import { Memo } from "@/types/proto/api/v1/memo_service";
import { useLocale, useTranslate } from "@/utils/i18n";
import { formatMemoDate, hasMeaningfulUpdate } from "@/utils/memo";

interface Props {
  memo: Memo;
  onEdit: (uid: string) => void;
  dateDisplay?: "date" | "time" | "none";
  className?: string;
  headerSlot?: React.ReactNode;
}

const ReviewMemoCard = ({ memo, onEdit, dateDisplay = "date", className, headerSlot }: Props) => {
  const t = useTranslate();
  const locale = useLocale();
  const showEdited = dateDisplay !== "none" && hasMeaningfulUpdate(memo);
  const formatTime = (date: Date) =>
    dateDisplay === "time" ? date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }) : formatMemoDate(date, locale);

  return (
    <div
      className={clsx(
        "group/card relative bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/60 dark:border-zinc-700/50 overflow-hidden shadow-[0_1px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-none",
        className,
      )}
    >
      {headerSlot}
      <div className="p-4">
        <button
          onClick={() => onEdit(memo.uid)}
          className="absolute top-2 right-2 p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors opacity-0 group-hover/card:opacity-100"
        >
          <SquarePenIcon className="w-3.5 h-3.5" />
        </button>
        {dateDisplay !== "none" && (
          <div className="flex items-center gap-2 mb-2 pr-6">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 dark:bg-teal-500/60" />
            <span className="font-medium tracking-wide text-zinc-400 dark:text-zinc-500 inline-flex flex-wrap items-baseline gap-x-1">
              <span className="text-sm">{memo.createTime ? formatTime(memo.createTime) : ""}</span>
              {showEdited && (
                <span className="text-xs text-zinc-300 dark:text-zinc-600 whitespace-nowrap">
                  {t("memo.updated-at")} {formatMemoDate(memo.updateTime!, locale)}
                </span>
              )}
            </span>
          </div>
        )}
        <MemoContent memoName={memo.name} nodes={memo.nodes} />
        {memo.resources.length > 0 && (
          <div className="mt-2">
            <MemoResourceListView resources={memo.resources} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewMemoCard;
