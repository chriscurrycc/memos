import { Modal } from "@mui/joy";
import { SearchIcon, XIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMemoMetadataStore } from "@/store/v1/memoMetadata";
import { useReviewStore } from "@/store/v1/review";
import { useTranslate } from "@/utils/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ReviewSettingsDrawer = ({ open, onClose }: Props) => {
  const t = useTranslate();
  const { settings, setSettings, fetchReviewMemos } = useReviewStore();
  const tagCounts = useMemoMetadataStore((s) => s.tagCounts);
  const allTags = useMemo(() => Object.keys(tagCounts).sort(), [tagCounts]);

  const [includeSearch, setIncludeSearch] = useState("");
  const [excludeSearch, setExcludeSearch] = useState("");

  useEffect(() => {
    if (open) {
      setIncludeSearch("");
      setExcludeSearch("");
    }
  }, [open]);

  const filteredIncludeTags = useMemo(
    () => allTags.filter((tag) => !settings.includeTags.includes(tag) && tag.toLowerCase().includes(includeSearch.toLowerCase())),
    [allTags, settings.includeTags, includeSearch],
  );

  const filteredExcludeTags = useMemo(
    () => allTags.filter((tag) => !settings.excludeTags.includes(tag) && tag.toLowerCase().includes(excludeSearch.toLowerCase())),
    [allTags, settings.excludeTags, excludeSearch],
  );

  const toggleTag = (type: "includeTags" | "excludeTags", tag: string) => {
    const current = settings[type];
    if (current.includes(tag)) {
      setSettings({ [type]: current.filter((t) => t !== tag) });
    } else {
      setSettings({ [type]: [...current, tag] });
    }
  };

  const handleApply = () => {
    onClose();
    fetchReviewMemos();
  };

  return (
    <Modal open={open} onClose={onClose} sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: "16px" }}>
      <div className="bg-white dark:bg-zinc-800 rounded-xl w-full max-w-md max-h-[calc(100vh-80px)] flex flex-col overflow-hidden outline-none">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200/60 dark:border-zinc-700/50">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t("review.settings")}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Page size */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">{t("review.memos-per-session")}</label>
            <input
              type="number"
              value={settings.pageSize}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (!isNaN(v)) setSettings({ pageSize: Math.min(20, Math.max(1, v)) });
              }}
              min={1}
              max={20}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-teal-300/50 dark:focus:ring-teal-500/30"
            />
          </div>

          {/* Include tags */}
          <TagSection
            label={t("review.include-tags")}
            selectedTags={settings.includeTags}
            searchValue={includeSearch}
            onSearchChange={setIncludeSearch}
            filteredTags={filteredIncludeTags}
            onToggle={(tag) => toggleTag("includeTags", tag)}
            tagCounts={tagCounts}
            placeholder={t("review.tags-placeholder")}
          />

          {/* Exclude tags */}
          <TagSection
            label={t("review.exclude-tags")}
            selectedTags={settings.excludeTags}
            searchValue={excludeSearch}
            onSearchChange={setExcludeSearch}
            filteredTags={filteredExcludeTags}
            onToggle={(tag) => toggleTag("excludeTags", tag)}
            tagCounts={tagCounts}
            placeholder={t("review.tags-placeholder")}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200/60 dark:border-zinc-700/50">
          <button
            onClick={handleApply}
            className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
          >
            {t("review.apply-settings")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

interface TagSectionProps {
  label: string;
  selectedTags: string[];
  searchValue: string;
  onSearchChange: (v: string) => void;
  filteredTags: string[];
  onToggle: (tag: string) => void;
  tagCounts: Record<string, number>;
  placeholder: string;
}

const TagSection = ({ label, selectedTags, searchValue, onSearchChange, filteredTags, onToggle, tagCounts, placeholder }: TagSectionProps) => {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">{label}</label>

      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onToggle(tag)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-xs font-medium hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
            >
              #{tag}
              <XIcon className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative mb-2">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-300 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-300/50 dark:focus:ring-teal-500/30"
        />
      </div>

      {/* Tag list */}
      <div className="max-h-36 overflow-y-auto rounded-lg border border-zinc-200/60 dark:border-zinc-700/50 bg-zinc-50/50 dark:bg-zinc-800/30">
        {filteredTags.length === 0 ? (
          <div className="px-3 py-2 text-xs text-zinc-400 dark:text-zinc-500">No tags found</div>
        ) : (
          filteredTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onToggle(tag)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-left text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="truncate">#{tag}</span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums shrink-0 ml-2">{tagCounts[tag] ?? 0}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSettingsDrawer;
