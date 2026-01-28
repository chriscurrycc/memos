import { Drawer } from "@mui/joy";
import { Button } from "@usememos/mui";
import { LoaderIcon, PinIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useMemoStore, usePinnedMemoList } from "@/store/v1";
import { Memo } from "@/types/proto/api/v1/memo_service";
import { useTranslate } from "@/utils/i18n";
import Empty from "./Empty";

interface Props {
  renderer: (memo: Memo) => JSX.Element;
  anchor?: "top" | "right";
}

const PinnedMemosDrawer = ({ renderer, anchor = "top" }: Props) => {
  const t = useTranslate();
  const user = useCurrentUser();
  const memoStore = useMemoStore();
  const pinnedMemoList = usePinnedMemoList();
  const [open, setOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(true);

  useEffect(() => {
    const fetchPinnedMemos = async () => {
      if (!user) return;
      setIsRequesting(true);
      try {
        await memoStore.fetchPinnedMemos(user.name);
      } finally {
        setIsRequesting(false);
      }
    };

    if (user) {
      fetchPinnedMemos();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const isFloating = anchor === "right";

  return (
    <>
      <button
        onClick={handleToggle}
        className={
          isFloating
            ? "flex items-center justify-center w-10 h-10 rounded-l-full bg-white dark:bg-zinc-800 shadow-lg border border-r-0 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors relative"
            : "flex items-center justify-center px-2 py-1 relative hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
        }
      >
        <PinIcon className={isFloating ? "w-5 h-5 text-gray-600 dark:text-gray-300" : "w-5 h-auto dark:text-gray-400"} />
        {!isRequesting && pinnedMemoList.length > 0 && (
          <span
            className={
              isFloating
                ? "absolute -top-2 -left-2 min-w-[20px] h-[20px] flex items-center justify-center text-xs font-medium bg-blue-500 text-white rounded-full px-1"
                : "absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs font-medium bg-blue-500 text-white rounded-full px-1"
            }
          >
            {pinnedMemoList.length}
          </span>
        )}
      </button>

      <Drawer
        anchor={anchor}
        open={open}
        onClose={handleClose}
        slotProps={{
          content: {
            sx: {
              ...(anchor === "top" ? { height: "100vh" } : { width: "min(500px, 85vw)" }),
              bgcolor: "transparent",
              boxShadow: "none",
            },
          },
        }}
      >
        <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 overflow-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-200">
              <PinIcon className="w-4 h-4" />
              <span>{t("common.pinned")}</span>
              {!isRequesting && <span className="text-gray-400 dark:text-gray-500">({pinnedMemoList.length})</span>}
            </div>
            <Button variant="plain" className="!bg-transparent !min-w-0 p-1" onClick={handleClose}>
              <XIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </Button>
          </div>
          <div className="px-4 py-2">
            {pinnedMemoList.map((memo) => renderer(memo))}
            {isRequesting && (
              <div className="w-full flex flex-row justify-center items-center my-8">
                <LoaderIcon className="animate-spin text-zinc-500" />
              </div>
            )}
            {!isRequesting && pinnedMemoList.length === 0 && (
              <div className="w-full my-8 flex flex-col justify-center items-center italic">
                <Empty />
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t("message.no-data")}</p>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default PinnedMemosDrawer;
