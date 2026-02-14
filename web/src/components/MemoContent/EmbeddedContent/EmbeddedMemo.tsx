import clsx from "clsx";
import { QuoteIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import MemoResourceListView from "@/components/MemoResourceListView";
import Tooltip from "@/components/kit/Tooltip";
import useLoading from "@/hooks/useLoading";
import useNavigateTo from "@/hooks/useNavigateTo";
import { useMemoStore } from "@/store/v1";
import { Memo } from "@/types/proto/api/v1/memo_service";
import { useTranslate } from "@/utils/i18n";
import MemoContent from "..";
import { RendererContext } from "../types";
import Error from "./Error";

interface Props {
  resourceId: string;
  params: string;
}

const EmbeddedMemo = ({ resourceId: uid, params: paramsStr }: Props) => {
  const t = useTranslate();
  const context = useContext(RendererContext);
  const navigateTo = useNavigateTo();
  const loadingState = useLoading();
  const memoStore = useMemoStore();
  const [memo, setMemo] = useState<Memo | undefined>(() => memoStore.getMemoByUid(uid));
  const resourceName = `memos/${uid}`;

  useEffect(() => {
    memoStore
      .fetchMemoByUid(uid)
      .then((m) => setMemo(m))
      .finally(() => loadingState.setFinish());
  }, [uid]);

  if (loadingState.isLoading) {
    return (
      <div className="w-full px-2 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 text-xs border border-gray-200 dark:border-zinc-700 animate-pulse">
        <div className="h-2.5 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1.5" />
        <div className="h-2.5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-1.5" />
        <div className="h-2.5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  if (!memo) {
    return <Error message={`Memo not found: ${uid}`} />;
  }

  const params = new URLSearchParams(paramsStr);
  const useSnippet = params.has("snippet");
  const inlineMode = params.has("inline");
  if (!useSnippet && (memo.name === context.memoName || context.embeddedMemos.has(resourceName))) {
    return <Error message={`Nested Rendering Error: ![[${resourceName}]]`} />;
  }

  // Add the memo to the set of embedded memos. This is used to prevent infinite loops when a memo embeds itself.
  context.embeddedMemos.add(resourceName);
  const contentNode = useSnippet ? (
    <div className={clsx("text-gray-800 dark:text-gray-400", inlineMode ? "" : "line-clamp-3")}>{memo.snippet}</div>
  ) : (
    <>
      <MemoContent
        contentClassName={inlineMode ? "" : "line-clamp-3"}
        memoName={memo.name}
        nodes={memo.nodes}
        embeddedMemos={context.embeddedMemos}
      />
      <MemoResourceListView resources={memo.resources} />
    </>
  );
  if (inlineMode) {
    return <div className="w-full">{contentNode}</div>;
  }

  return (
    <div className="w-full px-2 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 text-xs border border-gray-200 dark:border-zinc-700">
      <Tooltip title={t("memo.view-detail")} placement="top">
        <span
          className="w-fit mb-0.5 flex items-center gap-1 text-xs leading-4 text-gray-400 dark:text-gray-500 select-none cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
          onClick={() => navigateTo(`/m/${memo.uid}`, { state: { from: context.parentPage } })}
        >
          <QuoteIcon className="w-3 h-3" />
          <relative-time datetime={memo.displayTime?.toISOString()} format="datetime"></relative-time>
        </span>
      </Tooltip>
      {contentNode}
    </div>
  );
};

export default EmbeddedMemo;
