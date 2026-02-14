import { Memo, Visibility } from "@/types/proto/api/v1/memo_service";

const COLLAPSE_STORAGE_KEY = "memo-collapse-states";

export const getMemoCollapseState = (memoUid: string): boolean | undefined => {
  try {
    const stored = localStorage.getItem(COLLAPSE_STORAGE_KEY);
    if (!stored) return undefined;
    const states = JSON.parse(stored) as Record<string, boolean>;
    return states[memoUid];
  } catch {
    return undefined;
  }
};

export const setMemoCollapseState = (memoUid: string, isCollapsed: boolean): void => {
  try {
    const stored = localStorage.getItem(COLLAPSE_STORAGE_KEY);
    const states = stored ? (JSON.parse(stored) as Record<string, boolean>) : {};
    states[memoUid] = isCollapsed;
    localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(states));
  } catch {
    // Ignore storage errors
  }
};

export const removeMemoCollapseState = (memoUid: string): void => {
  try {
    const stored = localStorage.getItem(COLLAPSE_STORAGE_KEY);
    if (!stored) return;
    const states = JSON.parse(stored) as Record<string, boolean>;
    delete states[memoUid];
    localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(states));
  } catch {
    // Ignore storage errors
  }
};

const ONE_DAY_MS = 86400 * 1000;

export const hasMeaningfulUpdate = (memo: Memo): boolean => {
  if (!memo.updateTime || !memo.createTime) return false;
  return memo.updateTime.getTime() - memo.createTime.getTime() > ONE_DAY_MS;
};

export const formatMemoDate = (date: Date, locale: string): string => {
  const d = new Date(date);
  const isCurrentYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString(locale, {
    weekday: "short",
    year: isCurrentYear ? undefined : "numeric",
    month: "short",
    day: "numeric",
  });
};

export const convertVisibilityFromString = (visibility: string) => {
  switch (visibility) {
    case "PUBLIC":
      return Visibility.PUBLIC;
    case "PROTECTED":
      return Visibility.PROTECTED;
    case "PRIVATE":
      return Visibility.PRIVATE;
    default:
      return Visibility.PUBLIC;
  }
};

export const convertVisibilityToString = (visibility: Visibility) => {
  switch (visibility) {
    case Visibility.PUBLIC:
      return "PUBLIC";
    case Visibility.PROTECTED:
      return "PROTECTED";
    case Visibility.PRIVATE:
      return "PRIVATE";
    default:
      return "PRIVATE";
  }
};
