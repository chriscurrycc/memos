import { Autocomplete, AutocompleteOption, Chip, Modal } from "@mui/joy";
import { XIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useMemoMetadataStore } from "@/store/v1/memoMetadata";
import { useReviewStore } from "@/store/v1/review";
import { useTranslate } from "@/utils/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ReviewSettingsModal = ({ open, onClose }: Props) => {
  const t = useTranslate();
  const user = useCurrentUser();
  const memoMetadataStore = useMemoMetadataStore();
  const { settings, applySettings } = useReviewStore();
  const tagCounts = memoMetadataStore.tagCounts;
  const initialized = memoMetadataStore.initialized;
  const allTags = useMemo(() => Object.keys(tagCounts).sort(), [tagCounts]);

  const [sessionSizeInput, setSessionSizeInput] = useState(String(settings.sessionSize));
  const [includeTags, setIncludeTags] = useState<string[]>(settings.includeTags);
  const [excludeTags, setExcludeTags] = useState<string[]>(settings.excludeTags);

  useEffect(() => {
    if (open) {
      setSessionSizeInput(String(settings.sessionSize));
      setIncludeTags(settings.includeTags);
      setExcludeTags(settings.excludeTags);
      if (!initialized) {
        memoMetadataStore.fetchMemoMetadata({ user });
      }
    }
  }, [open]);

  const includeOptions = useMemo(() => allTags.filter((tag) => !excludeTags.includes(tag)), [allTags, excludeTags]);
  const excludeOptions = useMemo(() => allTags.filter((tag) => !includeTags.includes(tag)), [allTags, includeTags]);

  const handleApply = () => {
    const v = parseInt(sessionSizeInput);
    const sessionSize = isNaN(v) ? 10 : Math.min(20, Math.max(1, v));
    applySettings({ sessionSize, includeTags, excludeTags });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: "16px" }}>
      <div className="bg-white dark:bg-zinc-800 rounded-xl w-full max-w-md max-h-[calc(100vh-80px)] flex flex-col overflow-hidden outline-none">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200/60 dark:border-zinc-700/50">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t("review.settings")}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Session size */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">{t("review.memos-per-session")}</label>
            <input
              type="number"
              value={sessionSizeInput}
              onChange={(e) => setSessionSizeInput(e.target.value)}
              min={1}
              max={20}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:focus:ring-teal-500/20"
            />
          </div>

          {/* Include tags */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">{t("review.include-tags")}</label>
            <Autocomplete
              multiple
              size="sm"
              placeholder={t("review.tags-placeholder")}
              options={includeOptions}
              value={includeTags}
              onChange={(_, values) => setIncludeTags(values)}
              getOptionLabel={(tag) => `#${tag} (${tagCounts[tag] ?? 0})`}
              renderOption={(props, tag) => (
                <AutocompleteOption {...props} key={tag}>
                  #{tag} ({tagCounts[tag] ?? 0})
                </AutocompleteOption>
              )}
              renderTags={(tags, getTagProps) =>
                tags.map((tag, index) => (
                  <Chip size="sm" variant="soft" color="primary" {...getTagProps({ index })} key={tag}>
                    #{tag}
                  </Chip>
                ))
              }
              slotProps={{ listbox: { sx: { maxHeight: 200 } } }}
            />
          </div>

          {/* Exclude tags */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">{t("review.exclude-tags")}</label>
            <Autocomplete
              multiple
              size="sm"
              placeholder={t("review.tags-placeholder")}
              options={excludeOptions}
              value={excludeTags}
              onChange={(_, values) => setExcludeTags(values)}
              getOptionLabel={(tag) => `#${tag} (${tagCounts[tag] ?? 0})`}
              renderOption={(props, tag) => (
                <AutocompleteOption {...props} key={tag}>
                  #{tag} ({tagCounts[tag] ?? 0})
                </AutocompleteOption>
              )}
              renderTags={(tags, getTagProps) =>
                tags.map((tag, index) => (
                  <Chip size="sm" variant="soft" color="danger" {...getTagProps({ index })} key={tag}>
                    #{tag}
                  </Chip>
                ))
              }
              slotProps={{ listbox: { sx: { maxHeight: 200 } } }}
            />
          </div>
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

export default ReviewSettingsModal;
